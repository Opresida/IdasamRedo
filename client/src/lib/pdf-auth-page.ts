import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib'
import QRCode from 'qrcode'

interface AuthPageParams {
  pdfDoc: PDFDocument
  docTipo: string
  docNumero: string
  docTitulo: string
  signerName: string
  signerCargo?: string
  signerCpf?: string
  signerIp?: string
  dateStr: string
  hashHex: string
  validationBaseUrl: string
  signatureType: 'internal' | 'external'
}

export async function addAuthenticationPage(params: AuthPageParams) {
  const {
    pdfDoc, docTipo, docNumero, docTitulo,
    signerName, signerCargo, signerCpf, signerIp,
    dateStr, hashHex, validationBaseUrl, signatureType,
  } = params

  const W = 794, H = 1123
  const page = pdfDoc.addPage([W, H])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const green = rgb(0.102, 0.361, 0.220)   // #1a5c38
  const darkGreen = rgb(0.067, 0.259, 0.161) // #114229
  const dark = rgb(0.12, 0.14, 0.17)
  const gray = rgb(0.35, 0.35, 0.35)
  const lightGray = rgb(0.6, 0.6, 0.6)
  const white = rgb(1, 1, 1)
  const bgLight = rgb(0.96, 0.97, 0.98)

  const validationUrl = `${validationBaseUrl}/validar/${hashHex}`
  const tipoLabel = docTipo === 'contrato' ? 'Contrato' : docTipo === 'orcamento' ? 'Orçamento' : docTipo === 'oficio' ? 'Ofício' : docTipo === 'relatorio' ? 'Relatório' : 'Proposta de Projeto'

  // ── Faixa verde topo ──
  page.drawRectangle({ x: 0, y: H - 100, width: W, height: 100, color: green })
  page.drawText('IDASAM', { x: 50, y: H - 45, size: 22, font: fontBold, color: white })
  page.drawText('Instituto de Desenvolvimento Ambiental e Social da Amazônia', { x: 50, y: H - 65, size: 9, font, color: rgb(1, 1, 1, 0.8) })
  page.drawText('CNPJ: 02.906.177/0001-87 • Centro Empresarial Art Center, 3694 — Manaus/AM', { x: 50, y: H - 82, size: 7.5, font, color: rgb(1, 1, 1, 0.55) })

  // ── Linha decorativa ──
  page.drawRectangle({ x: 50, y: H - 120, width: W - 100, height: 1.5, color: green })

  // ── Título central ──
  const titleText = 'CERTIFICADO DE AUTENTICAÇÃO DIGITAL'
  const titleWidth = fontBold.widthOfTextAtSize(titleText, 16)
  page.drawText(titleText, { x: (W - titleWidth) / 2, y: H - 160, size: 16, font: fontBold, color: dark })

  const subtitleText = 'Este documento foi assinado digitalmente e possui validade jurídica'
  const subtitleWidth = font.widthOfTextAtSize(subtitleText, 9)
  page.drawText(subtitleText, { x: (W - subtitleWidth) / 2, y: H - 178, size: 9, font, color: lightGray })

  // ── Bloco de informações + QR Code ──
  const boxY = H - 420, boxH = 220
  page.drawRectangle({ x: 50, y: boxY, width: W - 100, height: boxH, color: bgLight, borderColor: rgb(0.85, 0.88, 0.9), borderWidth: 1 })

  // QR Code (lado esquerdo)
  try {
    const qrDataUrl = await QRCode.toDataURL(validationUrl, { width: 160, margin: 1, color: { dark: '#1a5c38', light: '#ffffff' } })
    const qrBytes = Uint8Array.from(atob(qrDataUrl.split(',')[1]), c => c.charCodeAt(0))
    const qrImg = await pdfDoc.embedPng(qrBytes)
    page.drawImage(qrImg, { x: 75, y: boxY + 30, width: 160, height: 160 })
  } catch {
    page.drawRectangle({ x: 75, y: boxY + 30, width: 160, height: 160, borderColor: gray, borderWidth: 1, opacity: 0 })
    page.drawText('QR Code', { x: 130, y: boxY + 100, size: 10, font, color: gray })
  }

  // Informações (lado direito)
  const infoX = 260, lineH = 20
  let curY = boxY + boxH - 30

  const drawField = (label: string, value: string) => {
    page.drawText(label, { x: infoX, y: curY, size: 8, font: fontBold, color: gray })
    page.drawText(value, { x: infoX + 100, y: curY, size: 9, font, color: dark })
    curY -= lineH
  }

  drawField('Documento:', `${tipoLabel} nº ${docNumero}`)
  drawField('Título:', docTitulo.length > 50 ? docTitulo.slice(0, 50) + '...' : docTitulo)
  drawField('Signatário:', signerName)
  if (signerCargo) drawField('Cargo:', signerCargo)
  if (signerCpf) drawField('CPF:', signerCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4'))
  drawField('Tipo:', signatureType === 'internal' ? 'Assinatura Interna (IDASAM)' : 'Assinatura Externa')
  drawField('Data/Hora:', dateStr)
  if (signerIp) drawField('IP:', signerIp)

  // ── Bloco Hash ──
  const hashBoxY = boxY - 70
  page.drawRectangle({ x: 50, y: hashBoxY, width: W - 100, height: 50, color: rgb(0.94, 0.96, 0.94), borderColor: green, borderWidth: 0.8 })
  page.drawText('Hash SHA-256 do documento original:', { x: 65, y: hashBoxY + 32, size: 8, font: fontBold, color: green })
  page.drawText(hashHex, { x: 65, y: hashBoxY + 14, size: 7.5, font, color: dark })

  // ── Link de validação ──
  const linkBoxY = hashBoxY - 50
  page.drawText('Link de validação:', { x: 65, y: linkBoxY + 20, size: 8, font: fontBold, color: gray })
  page.drawText(validationUrl, { x: 65, y: linkBoxY + 4, size: 8, font, color: green })

  // ── Referência legal ──
  const legalY = linkBoxY - 50
  page.drawRectangle({ x: 50, y: legalY, width: W - 100, height: 1, color: rgb(0.85, 0.88, 0.9) })

  const legalTexts = [
    'Este documento foi assinado eletronicamente nos termos da Lei 14.063/2020 (Brasil)',
    'e do Regulamento (UE) 910/2014 (eIDAS), constituindo assinatura eletrônica avançada.',
    'A integridade do documento pode ser verificada através do hash SHA-256 acima ou pelo QR Code.',
  ]
  legalTexts.forEach((text, i) => {
    const tw = font.widthOfTextAtSize(text, 7.5)
    page.drawText(text, { x: (W - tw) / 2, y: legalY - 20 - (i * 14), size: 7.5, font, color: lightGray })
  })

  // ── Rodapé ──
  page.drawRectangle({ x: 0, y: 0, width: W, height: 40, color: green })
  const footerText = 'WWW.IDASAM.ORG.BR • CNPJ: 02.906.177/0001-87 • CENTRO EMPRESARIAL ART CENTER, 3694 — MANAUS/AM'
  const footerW = font.widthOfTextAtSize(footerText, 6.5)
  page.drawText(footerText, { x: (W - footerW) / 2, y: 16, size: 6.5, font, color: white })

  const pageLabel = `PÁGINA ${pdfDoc.getPageCount()} DE ${pdfDoc.getPageCount()} • IDASAM — CERTIFICADO DE AUTENTICAÇÃO`
  const plW = font.widthOfTextAtSize(pageLabel, 6)
  page.drawText(pageLabel, { x: (W - plW) / 2, y: 50, size: 6, font, color: lightGray })

  return page
}
