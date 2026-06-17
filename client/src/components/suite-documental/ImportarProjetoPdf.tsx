import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, FileText, X, Sparkles, Wallet, AlertTriangle } from 'lucide-react'

interface BlocoTextoOut { tipo: 'texto'; titulo: string; corpo: string }
interface BlocoImagemOut { tipo: 'imagem'; url: string; caption: string }
interface BlocoTabelaOut { tipo: 'tabela'; titulo: string; cabecalho: boolean; linhas: string[][] }
export type BlocoImportado = BlocoTextoOut | BlocoImagemOut | BlocoTabelaOut

export interface ProjetoImportado {
  titulo: string
  responsavel: string
  cargo: string
  organizacao: string
  parceiro: string
  valorEstimado: string
  prazoExecucao: string
  blocos: BlocoImportado[]
}

interface Props {
  open: boolean
  onClose: () => void
  onImported: (projeto: ProjetoImportado, meta: { pageCount: number; imagesDetected: number; imagesResolved: number }) => void
}

interface UsageStats {
  budgetUsd: number
  totalRuns: number
  totalCostUsd: number
  totalPages: number
  monthRuns: number
  monthCostUsd: number
  avgCostPerPage: number
  avgCostPer10Pages: number
  avgCostPer10PagesIsHeuristic: boolean
  remainingUsd: number
  estimatedDocsRemaining: number | null
  percentUsed: number
}

function UsagePanel({ usage, fmtUsd }: { usage: UsageStats; fmtUsd: (v: number) => string }) {
  const { budgetUsd, totalCostUsd, remainingUsd, percentUsed, estimatedDocsRemaining, avgCostPer10Pages, avgCostPer10PagesIsHeuristic, totalRuns } = usage

  const noBudget = budgetUsd <= 0
  const criticoBloqueio = !noBudget && remainingUsd <= 0
  const criticoBaixo = !noBudget && percentUsed >= 90 && !criticoBloqueio
  const avisoAtencao = !noBudget && percentUsed >= 70 && !criticoBaixo && !criticoBloqueio

  const barColor = criticoBloqueio
    ? 'bg-red-500'
    : criticoBaixo
    ? 'bg-red-400'
    : avisoAtencao
    ? 'bg-amber-400'
    : 'bg-emerald-500'
  const bgColor = criticoBloqueio
    ? 'bg-red-50 border-red-200'
    : criticoBaixo
    ? 'bg-red-50 border-red-200'
    : avisoAtencao
    ? 'bg-amber-50 border-amber-200'
    : 'bg-emerald-50 border-emerald-200'
  const iconColor = criticoBloqueio || criticoBaixo
    ? 'text-red-600'
    : avisoAtencao
    ? 'text-amber-600'
    : 'text-emerald-700'

  return (
    <div className={`mb-4 rounded-lg border px-4 py-3 ${bgColor}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wallet className={`h-4 w-4 ${iconColor}`} />
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">
            Saldo da API (Anthropic)
          </span>
        </div>
        {(criticoBloqueio || criticoBaixo) && (
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-red-600">
            <AlertTriangle className="h-3 w-3" />
            {criticoBloqueio ? 'Crédito esgotado' : 'Saldo crítico'}
          </div>
        )}
        {avisoAtencao && (
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-amber-700">
            <AlertTriangle className="h-3 w-3" /> Atenção
          </div>
        )}
      </div>

      {noBudget ? (
        <p className="text-xs text-gray-600">
          Gasto total:{' '}
          <span className="font-semibold text-gray-900">{fmtUsd(totalCostUsd)}</span> em{' '}
          {totalRuns} importação(ões). Configure{' '}
          <code className="rounded bg-white px-1 py-0.5 text-[10px]">ANTHROPIC_BUDGET_USD</code>{' '}
          no .env para ver a projeção de documentos restantes.
        </p>
      ) : (
        <>
          <div className="mb-2 flex items-baseline justify-between gap-2 text-xs">
            <span className="text-gray-600">
              Usado: <span className="font-semibold text-gray-900">{fmtUsd(totalCostUsd)}</span>
              {' / '}
              {fmtUsd(budgetUsd)}
            </span>
            <span className="text-gray-600">
              Restante:{' '}
              <span className="font-bold text-gray-900">{fmtUsd(remainingUsd)}</span>
            </span>
          </div>
          <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/70">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${Math.min(100, percentUsed)}%` }}
            />
          </div>
          {criticoBloqueio ? (
            <p className="text-xs font-medium text-red-700">
              ⚠️ Crédito zerado. Recarregue a chave em{' '}
              <a
                href="https://console.anthropic.com/settings/billing"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                console.anthropic.com/billing
              </a>{' '}
              antes de novas importações.
            </p>
          ) : (
            <p className="text-xs text-gray-700">
              Restam aproximadamente{' '}
              <span className="font-bold text-gray-900">
                {estimatedDocsRemaining ?? '—'}
              </span>{' '}
              documento(s) de 10 páginas
              {avgCostPer10Pages > 0 && (
                <>
                  {' '}
                  <span className="text-gray-500">
                    (~{fmtUsd(avgCostPer10Pages)}/doc
                    {avgCostPer10PagesIsHeuristic ? ' estimado' : ` · média de ${totalRuns} run(s)`})
                  </span>
                </>
              )}
              .
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default function ImportarProjetoPdf({ open, onClose, onImported }: Props) {
  const { adminToken } = useAuth()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [usageLoading, setUsageLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchUsage = async () => {
    if (!adminToken) return
    setUsageLoading(true)
    try {
      const res = await fetch('/api/admin/anthropic-usage', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      if (res.ok) {
        const data = (await res.json()) as UsageStats
        setUsage(data)
      }
    } catch {
      // silencioso — painel de saldo é best-effort
    } finally {
      setUsageLoading(false)
    }
  }

  useEffect(() => {
    if (open) fetchUsage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const fmtUsd = (v: number) => `$${v.toFixed(v < 1 ? 4 : 2)}`

  const reset = () => {
    setFile(null)
    setLoading(false)
    setProgress('')
    setDragOver(false)
  }

  const close = () => {
    if (loading) return
    reset()
    onClose()
  }

  const handleFile = (f: File | null) => {
    if (!f) return
    if (f.type !== 'application/pdf') {
      toast({ title: 'Arquivo inválido', description: 'Envie apenas PDF.', variant: 'destructive' })
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast({ title: 'PDF muito grande', description: 'Limite de 10 MB.', variant: 'destructive' })
      return
    }
    setFile(f)
  }

  const submit = async () => {
    if (!file) return
    setLoading(true)
    setProgress('Enviando o PDF…')
    try {
      const form = new FormData()
      form.append('pdf', file)
      const res = await fetch('/api/admin/proposals/import-projeto-pdf', {
        method: 'POST',
        headers: { ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) },
        body: form,
      })
      // Erro antes do stream começar (ex.: auth, 413, 503 sem chave)
      if (!res.ok || !res.body) {
        const text = (await res.text().catch(() => '')) || res.statusText
        let msg = text
        try {
          const j = JSON.parse(text)
          if (j?.message) msg = j.message
        } catch {}
        throw new Error(msg)
      }

      // Lê o stream SSE (event: progress | done | error)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let result: { projeto: any; meta: any; usage: any } | null = null
      let errMsg: string | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const chunks = buffer.split('\n\n')
        buffer = chunks.pop() ?? ''
        for (const chunk of chunks) {
          let event = 'message'
          let dataStr = ''
          for (const line of chunk.split('\n')) {
            if (line.startsWith('event:')) event = line.slice(6).trim()
            else if (line.startsWith('data:')) dataStr += line.slice(5).trim()
            // linhas iniciadas por ':' são heartbeats — ignoradas
          }
          if (!dataStr) continue
          let data: any
          try {
            data = JSON.parse(dataStr)
          } catch {
            continue
          }
          if (event === 'progress') setProgress(data.message || '')
          else if (event === 'done') result = data
          else if (event === 'error') errMsg = data.message || 'Erro ao processar o PDF.'
        }
      }

      if (errMsg) throw new Error(errMsg)
      if (!result) throw new Error('A conexão foi interrompida antes de concluir. Tente novamente.')

      onImported(result.projeto, result.meta)
      const costNote = result.usage?.costUsd ? ` · custo: ${fmtUsd(result.usage.costUsd)}` : ''
      reset()
      onClose()
      toast({
        title: 'Projeto importado',
        description: `${result.meta.pageCount} página(s), ${result.projeto.blocos.length} bloco(s), ${result.meta.imagesResolved} imagem(ns)${costNote}.`,
      })
    } catch (err: any) {
      toast({
        title: 'Falha na importação',
        description: err?.message || 'Erro desconhecido ao processar o PDF.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#1a5c38]" />
            <h2 className="text-base font-semibold text-gray-900">Importar Proposta de Projeto (PDF)</h2>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={loading}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="mb-4 text-sm text-gray-600">
            Envie um PDF com o projeto já redigido (folha A4 em branco). O Claude Sonnet 4.6 vai ler o conteúdo, estruturar texto, tabelas e imagens, e preencher o formulário abaixo — você revisa e gera o PDF no papel timbrado do IDASAM.
          </p>

          {/* Painel de saldo da API */}
          {usageLoading ? (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" /> Consultando saldo da API…
            </div>
          ) : usage ? (
            <UsagePanel usage={usage} fmtUsd={fmtUsd} />
          ) : null}

          {!file ? (
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                handleFile(e.dataTransfer.files?.[0] ?? null)
              }}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition ${
                dragOver ? 'border-[#1a5c38] bg-green-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload className="mb-3 h-8 w-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Clique ou arraste o PDF aqui</span>
              <span className="mt-1 text-xs text-gray-500">Apenas PDF · máx. 10 MB</span>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </label>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <FileText className="h-8 w-8 flex-shrink-0 text-[#1a5c38]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              {!loading && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="rounded p-1 text-gray-400 hover:bg-white hover:text-gray-600"
                  aria-label="Remover"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {loading && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-[#1a5c38]/5 px-4 py-3 text-sm text-[#1a5c38]">
              <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
              <span>{progress || 'Claude analisando o conteúdo…'}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-gray-50 px-5 py-3">
          <Button variant="ghost" onClick={close} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={!file || loading || (usage != null && usage.budgetUsd > 0 && usage.remainingUsd <= 0)}
            className="bg-[#1a5c38] text-white hover:bg-[#154a2d]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Importar e preencher
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
