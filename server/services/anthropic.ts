import Anthropic from '@anthropic-ai/sdk'
import type { ExtractedImage } from './pdfParser'

export interface BlocoTextoOut { id?: string; tipo: 'texto'; titulo: string; corpo: string }
export interface BlocoImagemOut { id?: string; tipo: 'imagem'; url: string; caption: string }
export interface BlocoTabelaOut { id?: string; tipo: 'tabela'; titulo: string; cabecalho: boolean; linhas: string[][] }
export type BlocoOut = BlocoTextoOut | BlocoImagemOut | BlocoTabelaOut

export interface ProjetoEstruturadoOut {
  titulo: string
  responsavel: string
  cargo: string
  organizacao: string
  parceiro: string
  valorEstimado: string
  prazoExecucao: string      // YYYY-MM-DD ou ''
  blocos: BlocoOut[]
}

const MODEL = 'claude-sonnet-4-6'

// Preços Sonnet 4.6 (USD por milhão de tokens) — janeiro/2026
// https://www.anthropic.com/pricing
export const PRICING = {
  input: 3.00,
  output: 15.00,
  cacheWrite: 3.75,    // 1.25× input (cache 5min)
  cacheRead: 0.30,     // 0.1× input
}

export interface UsageInfo {
  model: string
  inputTokens: number
  outputTokens: number
  cacheCreationTokens: number
  cacheReadTokens: number
  costUsd: number
}

export function calculateCost(u: {
  inputTokens: number
  outputTokens: number
  cacheCreationTokens?: number
  cacheReadTokens?: number
}): number {
  const { inputTokens, outputTokens, cacheCreationTokens = 0, cacheReadTokens = 0 } = u
  return (
    (inputTokens * PRICING.input) / 1_000_000 +
    (outputTokens * PRICING.output) / 1_000_000 +
    (cacheCreationTokens * PRICING.cacheWrite) / 1_000_000 +
    (cacheReadTokens * PRICING.cacheRead) / 1_000_000
  )
}

const SYSTEM_PROMPT = `Você é um assistente especializado em converter propostas de projeto em PDF para JSON estruturado que será renderizado no papel timbrado do IDASAM (Instituto de Desenvolvimento Ambiental e Social da Amazônia).

Sua tarefa: analisar o PDF recebido e devolver APENAS um JSON no formato abaixo. Não escreva nenhum texto fora do JSON.

Formato obrigatório:
{
  "titulo": string,               // título principal do projeto/proposta
  "responsavel": string,          // nome da pessoa responsável (ou "")
  "cargo": string,                // cargo do responsável (ou "")
  "organizacao": string,          // organização proponente (ou "IDASAM")
  "parceiro": string,             // parceiro/financiador (ou "")
  "valorEstimado": string,        // string livre (ex: "R$ 1.250.000,00"), ou ""
  "prazoExecucao": string,        // data ISO YYYY-MM-DD se houver, senão ""
  "blocos": [
    // Blocos devem aparecer na MESMA ORDEM em que o conteúdo aparece no PDF.
    // Três tipos possíveis:
    { "tipo": "texto",  "titulo": string, "corpo": string },
    { "tipo": "tabela", "titulo": string, "cabecalho": true,  "linhas": [[...], [...], ...] },
    { "tipo": "imagem", "url": "IMG_N",  "caption": string }   // IMG_N = placeholder da imagem (o servidor substituirá)
  ]
}

Regras:
- Preserve a ORDEM ORIGINAL do documento (texto → tabela → imagem → texto → ...).
- Em blocos "texto", o campo "titulo" pode ser vazio "" se for apenas um parágrafo sem cabeçalho de seção. Use seções claras (Introdução, Objetivos, Metodologia, Cronograma, Orçamento, etc.) como "titulo" quando aplicável. O "corpo" pode ter múltiplos parágrafos separados por \\n\\n.
- Em blocos "tabela", a primeira linha de "linhas" é o cabeçalho se "cabecalho": true. Cada célula é string. Preserve o número de colunas consistente entre linhas. Se a tabela tiver título ou legenda no PDF, coloque em "titulo".
- Em blocos "imagem", use IMG_0, IMG_1, IMG_2... NA ORDEM EXATA em que as imagens aparecem no PDF (da primeira página pra última, e dentro da página, de cima pra baixo). "caption" deve ser uma descrição breve do que a imagem representa (você consegue ver o PDF).
- NÃO invente dados. Se um campo não estiver presente, use "".
- NÃO traduza nem reescreva o conteúdo — preserve o texto original. Apenas corrija espaços extras e quebras de linha estranhas.
- Responda APENAS o JSON, sem markdown, sem explicação, sem \`\`\`json.`

let client: Anthropic | null = null
function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY não configurada no .env — o importador de PDF não funciona sem a chave.')
    }
    client = new Anthropic({ apiKey })
  }
  return client
}

export async function extractProjetoFromPdf(
  pdfBuffer: Buffer,
  images: ExtractedImage[],
): Promise<{ projeto: ProjetoEstruturadoOut; usage: UsageInfo }> {
  const c = getClient()

  const imageHint = images.length > 0
    ? `Foram detectadas ${images.length} imagens no PDF (ordenadas da página 1 em diante). Use exatamente estes placeholders na ordem: ${images.map((_, i) => `IMG_${i}`).join(', ')}.`
    : 'Nenhuma imagem foi detectada no PDF. Não inclua blocos do tipo "imagem".'

  const response = await c.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: [
      { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
    ],
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBuffer.toString('base64'),
            },
          } as any,
          {
            type: 'text',
            text: `${imageHint}\n\nExtraia este PDF para o JSON estruturado definido no system prompt. Retorne APENAS o JSON (sem markdown, sem \`\`\`, sem explicações).`,
          },
        ],
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text') as { type: 'text'; text: string } | undefined
  if (!textBlock) {
    throw new Error('Claude retornou resposta sem conteúdo de texto.')
  }

  const stopReason = response.stop_reason
  console.log(`[anthropic] stop_reason=${stopReason} input_tokens=${response.usage?.input_tokens} output_tokens=${response.usage?.output_tokens}`)

  let raw = textBlock.text.trim()

  // Remove cercas markdown ```json ... ``` ou ``` ... ```
  const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (fenceMatch) raw = fenceMatch[1].trim()

  // Extrai o maior bloco {...} plausível
  const firstBrace = raw.indexOf('{')
  const lastBrace = raw.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    if (stopReason === 'max_tokens') {
      throw new Error('Resposta do Claude foi cortada por limite de tokens. Tente um PDF menor.')
    }
    throw new Error('Claude não retornou JSON válido. Primeiros 300 chars: ' + raw.slice(0, 300))
  }

  const jsonStr = raw.slice(firstBrace, lastBrace + 1)

  let parsed: ProjetoEstruturadoOut
  try {
    parsed = JSON.parse(jsonStr)
  } catch (e) {
    if (stopReason === 'max_tokens') {
      throw new Error('Resposta do Claude foi cortada por limite de tokens (JSON incompleto). Tente um PDF menor.')
    }
    throw new Error('Falha ao fazer parse do JSON do Claude: ' + (e as Error).message + ' | primeiros 300 chars: ' + jsonStr.slice(0, 300))
  }

  const u: any = response.usage || {}
  const usage: UsageInfo = {
    model: MODEL,
    inputTokens: u.input_tokens ?? 0,
    outputTokens: u.output_tokens ?? 0,
    cacheCreationTokens: u.cache_creation_input_tokens ?? 0,
    cacheReadTokens: u.cache_read_input_tokens ?? 0,
    costUsd: 0,
  }
  usage.costUsd = calculateCost(usage)

  return { projeto: sanitizeOutput(parsed), usage }
}

function sanitizeOutput(p: any): ProjetoEstruturadoOut {
  const out: ProjetoEstruturadoOut = {
    titulo: String(p?.titulo ?? ''),
    responsavel: String(p?.responsavel ?? ''),
    cargo: String(p?.cargo ?? ''),
    organizacao: String(p?.organizacao ?? ''),
    parceiro: String(p?.parceiro ?? ''),
    valorEstimado: String(p?.valorEstimado ?? ''),
    prazoExecucao: String(p?.prazoExecucao ?? ''),
    blocos: [],
  }

  if (!Array.isArray(p?.blocos)) return out

  for (const b of p.blocos) {
    if (!b || typeof b !== 'object') continue
    if (b.tipo === 'texto') {
      out.blocos.push({
        tipo: 'texto',
        titulo: String(b.titulo ?? ''),
        corpo: String(b.corpo ?? ''),
      })
    } else if (b.tipo === 'tabela') {
      const linhas = Array.isArray(b.linhas)
        ? b.linhas
            .filter((row: any) => Array.isArray(row))
            .map((row: any[]) => row.map((cell) => String(cell ?? '')))
        : []
      if (linhas.length > 0) {
        out.blocos.push({
          tipo: 'tabela',
          titulo: String(b.titulo ?? ''),
          cabecalho: b.cabecalho !== false,
          linhas,
        })
      }
    } else if (b.tipo === 'imagem') {
      out.blocos.push({
        tipo: 'imagem',
        url: String(b.url ?? ''),
        caption: String(b.caption ?? ''),
      })
    }
  }

  return out
}

export function resolveImagePlaceholders(
  projeto: ProjetoEstruturadoOut,
  images: ExtractedImage[],
): ProjetoEstruturadoOut {
  const byId = new Map(images.map((img) => [img.id, img.dataUrl]))
  const blocos: BlocoOut[] = []
  for (const b of projeto.blocos) {
    if (b.tipo === 'imagem') {
      const real = byId.get(b.url)
      if (real) {
        blocos.push({ ...b, url: real })
      }
      // se não resolveu, descarta o bloco (evita placeholder órfão no form)
    } else {
      blocos.push(b)
    }
  }
  return { ...projeto, blocos }
}
