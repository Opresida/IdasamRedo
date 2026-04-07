import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import QRCode from 'qrcode'

interface AtoDesignacaoParams {
  numero: string
  deleganteNome: string
  deleganteCargo: string
  delegadoNome: string
  delegadoCargo: string
  motivo: string
  poderes: string[]
  validaDe: string   // dd/mm/yyyy
  validaAte: string  // dd/mm/yyyy
  dataEmissao: string // dd/mm/yyyy HH:mm
}

const PODERES_LABELS: Record<string, string> = {
  assinar_contratos: 'Assinar contratos, convênios e termos de fomento',
  assinar_orcamentos: 'Assinar orçamentos e propostas financeiras',
  assinar_oficios: 'Assinar ofícios e correspondências oficiais',
  assinar_relatorios: 'Assinar relatórios técnicos e de prestação de contas',
  assinar_projetos: 'Assinar propostas de projetos e programas',
}

export async function generateAtoDesignacaoPdf(params: AtoDesignacaoParams): Promise<string> {
  const {
    numero, deleganteNome, deleganteCargo, delegadoNome, delegadoCargo,
    motivo, poderes, validaDe, validaAte, dataEmissao,
  } = params

  const pdfDoc = await PDFDocument.create()
  const W = 794, H = 1123
  const page = pdfDoc.addPage([W, H])

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  const green = rgb(0.102, 0.361, 0.220)
  const dark = rgb(0.12, 0.14, 0.17)
  const gray = rgb(0.35, 0.35, 0.35)
  const lightGray = rgb(0.6, 0.6, 0.6)
  const white = rgb(1, 1, 1)

  // ── Faixa verde topo ──
  page.drawRectangle({ x: 0, y: H - 100, width: W, height: 100, color: green })
  page.drawText('IDASAM', { x: 50, y: H - 45, size: 22, font: fontBold, color: white })
  page.drawText('Instituto de Desenvolvimento Ambiental e Social da Amazônia', {
    x: 50, y: H - 65, size: 9, font, color: rgb(0.9, 0.9, 0.9),
  })
  page.drawText('CNPJ: 02.906.177/0001-87 • Centro Empresarial Art Center, 3694 — Manaus/AM', {
    x: 50, y: H - 82, size: 7.5, font, color: rgb(0.75, 0.75, 0.75),
  })

  // ── Linha decorativa ──
  page.drawRectangle({ x: 50, y: H - 120, width: W - 100, height: 1.5, color: green })

  // ── Título ──
  const title = `ATO DE DESIGNAÇÃO Nº ${numero}`
  const titleW = fontBold.widthOfTextAtSize(title, 18)
  page.drawText(title, { x: (W - titleW) / 2, y: H - 170, size: 18, font: fontBold, color: dark })

  // ── Subtítulo ──
  const subtitle = 'Delegação de Poderes — Art. 22, IV do Estatuto Social'
  const subtitleW = font.widthOfTextAtSize(subtitle, 10)
  page.drawText(subtitle, { x: (W - subtitleW) / 2, y: H - 190, size: 10, font, color: lightGray })

  // ── Corpo do Ato ──
  let curY = H - 240
  const marginL = 65, marginR = 65
  const maxTextW = W - marginL - marginR
  const bodySize = 11
  const lineSpacing = 18

  // Helper para quebrar texto em linhas
  const wrapText = (text: string, fontSize: number, maxWidth: number, f = font): string[] => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      if (f.widthOfTextAtSize(testLine, fontSize) > maxWidth) {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)
    return lines
  }

  const drawParagraph = (text: string, fontSize = bodySize, f = font, color = dark, indent = 0) => {
    const lines = wrapText(text, fontSize, maxTextW - indent, f)
    for (const line of lines) {
      page.drawText(line, { x: marginL + indent, y: curY, size: fontSize, font: f, color })
      curY -= lineSpacing
    }
    curY -= 6 // espaço entre parágrafos
  }

  // Preâmbulo
  drawParagraph(
    `O Presidente do Instituto de Desenvolvimento Ambiental e Social da Amazônia — IDASAM, ` +
    `no uso de suas atribuições estatutárias previstas no Art. 22, inciso IV do Estatuto Social,`
  )

  // CONSIDERANDO
  drawParagraph('CONSIDERANDO:', bodySize, fontBold)
  drawParagraph(
    `Que o Art. 22 do Estatuto Social confere ao Presidente a competência exclusiva para ` +
    `firmar convênios, contratos, acordos, ajustes e termos de fomento em nome do IDASAM;`,
    bodySize, font, dark, 20
  )
  drawParagraph(
    `Que o Art. 22, IV autoriza o Presidente a designar representantes para atos específicos;`,
    bodySize, font, dark, 20
  )
  drawParagraph(
    `Que se faz necessária a delegação de poderes pelo seguinte motivo: ${motivo};`,
    bodySize, font, dark, 20
  )

  // RESOLVE
  curY -= 10
  drawParagraph('RESOLVE:', bodySize, fontBold)

  drawParagraph(
    `Art. 1º — DESIGNAR ${delegadoNome.toUpperCase()}, ${delegadoCargo}, para, durante o ` +
    `período de ${validaDe} a ${validaAte}, exercer os seguintes poderes em nome do IDASAM:`
  )

  // Lista de poderes
  for (const poder of poderes) {
    const label = PODERES_LABELS[poder] || poder
    page.drawText('•', { x: marginL + 20, y: curY, size: bodySize, font: fontBold, color: green })
    const poderLines = wrapText(label, bodySize, maxTextW - 40)
    for (const line of poderLines) {
      page.drawText(line, { x: marginL + 35, y: curY, size: bodySize, font, color: dark })
      curY -= lineSpacing
    }
  }
  curY -= 6

  drawParagraph(
    `Art. 2º — A presente designação terá validade de ${validaDe} a ${validaAte}, ` +
    `podendo ser revogada a qualquer tempo pelo Presidente, mediante ato próprio.`
  )

  drawParagraph(
    `Art. 3º — Os atos praticados pelo designado nos limites desta delegação terão a mesma ` +
    `validade jurídica dos atos praticados diretamente pelo Presidente, conforme Art. 22 do Estatuto Social.`
  )

  drawParagraph(
    `Art. 4º — O designado deverá observar estritamente os limites dos poderes aqui delegados, ` +
    `sendo vedada a subdelegação.`
  )

  // ── Assinatura do Presidente ──
  curY -= 30
  const sigLineY = curY
  page.drawRectangle({ x: marginL + 100, y: sigLineY, width: 300, height: 1, color: dark })

  const nameW = fontBold.widthOfTextAtSize(deleganteNome.toUpperCase(), 11)
  page.drawText(deleganteNome.toUpperCase(), {
    x: marginL + 100 + (300 - nameW) / 2, y: sigLineY + 15, size: 11, font: fontBold, color: dark,
  })

  const cargoW = font.widthOfTextAtSize(deleganteCargo, 9)
  page.drawText(deleganteCargo, {
    x: marginL + 100 + (300 - cargoW) / 2, y: sigLineY - 15, size: 9, font, color: gray,
  })

  const cnpjText = 'CNPJ: 02.906.177/0001-87'
  const cnpjW = font.widthOfTextAtSize(cnpjText, 8)
  page.drawText(cnpjText, {
    x: marginL + 100 + (300 - cnpjW) / 2, y: sigLineY - 30, size: 8, font, color: lightGray,
  })

  // ── Local e data ──
  curY = sigLineY - 60
  const localText = `Manaus/AM, ${dataEmissao}`
  const localW = font.widthOfTextAtSize(localText, 10)
  page.drawText(localText, { x: (W - localW) / 2, y: curY, size: 10, font, color: gray })

  // ── Selo de autenticação digital ──
  curY -= 50
  page.drawRectangle({ x: 50, y: curY - 80, width: W - 100, height: 80, color: rgb(0.94, 0.96, 0.94), borderColor: green, borderWidth: 0.8 })

  // QR Code com hash do ato
  const atoHash = await generateHash(`ATO-${numero}-${deleganteNome}-${delegadoNome}-${validaDe}-${validaAte}`)
  const hashShort = atoHash.slice(0, 16).toUpperCase()

  try {
    const qrDataUrl = await QRCode.toDataURL(`IDASAM-ATO-${numero}-${hashShort}`, {
      width: 60, margin: 1, color: { dark: '#1a5c38', light: '#ffffff' },
    })
    const qrBytes = Uint8Array.from(atob(qrDataUrl.split(',')[1]), c => c.charCodeAt(0))
    const qrImg = await pdfDoc.embedPng(qrBytes)
    page.drawImage(qrImg, { x: 65, y: curY - 70, width: 60, height: 60 })
  } catch {
    // fallback sem QR
  }

  page.drawText('DOCUMENTO DIGITAL AUTENTICADO', { x: 140, y: curY - 20, size: 9, font: fontBold, color: green })
  page.drawText(`Código de verificação: ATO-${numero}-${hashShort}`, { x: 140, y: curY - 36, size: 8, font, color: dark })
  page.drawText(`Este ato foi gerado digitalmente pela plataforma IDASAM em ${dataEmissao}`, { x: 140, y: curY - 52, size: 7.5, font, color: gray })
  page.drawText('A autenticidade pode ser verificada no sistema de gestão documental do IDASAM', { x: 140, y: curY - 66, size: 7.5, font, color: gray })

  // ── Referência legal no rodapé ──
  const legalY = 60
  page.drawRectangle({ x: 50, y: legalY, width: W - 100, height: 1, color: rgb(0.85, 0.88, 0.9) })

  const legalTexts = [
    'Ato emitido conforme Art. 22, inciso IV e Parágrafo Único do Estatuto Social do IDASAM',
    'Assinatura eletrônica nos termos da Lei 14.063/2020 (Brasil)',
  ]
  legalTexts.forEach((text, i) => {
    const tw = fontItalic.widthOfTextAtSize(text, 7)
    page.drawText(text, { x: (W - tw) / 2, y: legalY - 15 - (i * 12), size: 7, font: fontItalic, color: lightGray })
  })

  // ── Rodapé verde ──
  page.drawRectangle({ x: 0, y: 0, width: W, height: 30, color: green })
  const footerText = 'WWW.IDASAM.ORG.BR • CNPJ: 02.906.177/0001-87 • CENTRO EMPRESARIAL ART CENTER, 3694 — MANAUS/AM'
  const footerW = font.widthOfTextAtSize(footerText, 6)
  page.drawText(footerText, { x: (W - footerW) / 2, y: 10, size: 6, font, color: white })

  const pdfBytes = await pdfDoc.save()
  return uint8ArrayToBase64(pdfBytes)
}

async function generateHash(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
