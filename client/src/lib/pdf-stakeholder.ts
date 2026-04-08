import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface StakeholderPdfParams {
  // Main data
  tipo: string
  nome: string
  email: string
  telefone?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  observacoes?: string
  status: string
  lgpdConsentimento: boolean
  lgpdConsentidoEm?: string
  criadoEm?: string
  // Subdata (dynamic)
  subdata?: Record<string, any>
  // Banking
  bancarios?: any[]
}

const TIPO_LABELS: Record<string, string> = {
  pj: 'Pessoa Jurídica',
  pf: 'Pessoa Física',
  doador: 'Doador',
  orgao_publico: 'Órgão Público',
  pesquisador: 'Pesquisador',
}

const SUBDATA_LABELS: Record<string, string> = {
  cnpj: 'CNPJ',
  razaoSocial: 'Razão Social',
  nomeFantasia: 'Nome Fantasia',
  inscricaoEstadual: 'Inscrição Estadual',
  inscricaoMunicipal: 'Inscrição Municipal',
  inscricaoSuframa: 'Inscrição Suframa',
  segmento: 'Segmento',
  porte: 'Porte',
  responsavelNome: 'Responsável — Nome',
  responsavelCargo: 'Responsável — Cargo',
  responsavelTelefone: 'Responsável — Telefone',
  responsavelEmail: 'Responsável — E-mail',
  cpf: 'CPF',
  rg: 'RG',
  dataNascimento: 'Data de Nascimento',
  profissao: 'Profissão',
  nacionalidade: 'Nacionalidade',
  tipoDoador: 'Tipo de Doador',
  cpfCnpj: 'CPF/CNPJ',
  areaInteresse: 'Área de Interesse',
  recorrente: 'Doador Recorrente',
  valorMedioDoacao: 'Valor Médio de Doação',
  ultimaDoacao: 'Última Doação',
  nomeOrgao: 'Nome do Órgão',
  esfera: 'Esfera',
  sigla: 'Sigla',
  setorResponsavel: 'Setor Responsável',
  contatoNome: 'Contato — Nome',
  contatoCargo: 'Contato — Cargo',
  contatoTelefone: 'Contato — Telefone',
  contatoEmail: 'Contato — E-mail',
  instituicao: 'Instituição',
  titulacao: 'Titulação',
  areaAtuacao: 'Área de Atuação',
  lattes: 'Lattes',
  orcid: 'ORCID',
  gruposPesquisa: 'Grupos de Pesquisa',
}

export async function generateStakeholderPdf(params: StakeholderPdfParams): Promise<string> {
  const pdfDoc = await PDFDocument.create()
  const W = 794, H = 1123
  let page = pdfDoc.addPage([W, H])

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const green = rgb(0.102, 0.361, 0.220)
  const dark = rgb(0.12, 0.14, 0.17)
  const gray = rgb(0.35, 0.35, 0.35)
  const lightGray = rgb(0.6, 0.6, 0.6)
  const white = rgb(1, 1, 1)
  const lineColor = rgb(0.85, 0.85, 0.85)

  const marginL = 60
  const marginR = 60
  const maxTextW = W - marginL - marginR
  let curY = 0

  const drawHeader = (pg: typeof page) => {
    pg.drawRectangle({ x: 0, y: H - 100, width: W, height: 100, color: green })
    pg.drawText('IDASAM', { x: 50, y: H - 45, size: 22, font: fontBold, color: white })
    pg.drawText('Instituto de Desenvolvimento Ambiental e Social da Amazônia', {
      x: 50, y: H - 65, size: 9, font, color: rgb(0.9, 0.9, 0.9),
    })
    pg.drawText('CNPJ: 02.906.177/0001-87 • Centro Empresarial Art Center, 3694 — Manaus/AM', {
      x: 50, y: H - 82, size: 7.5, font, color: rgb(0.75, 0.75, 0.75),
    })
    pg.drawRectangle({ x: 50, y: H - 120, width: W - 100, height: 1.5, color: green })
  }

  const drawFooter = (pg: typeof page) => {
    pg.drawRectangle({ x: 50, y: 45, width: W - 100, height: 1, color: lineColor })
    pg.drawText('Documento gerado pelo sistema IDASAM — Uso interno e confidencial', {
      x: 50, y: 30, size: 7, font, color: lightGray,
    })
    const dateStr = new Date().toLocaleString('pt-BR')
    const dateW = font.widthOfTextAtSize(dateStr, 7)
    pg.drawText(dateStr, { x: W - marginR - dateW, y: 30, size: 7, font, color: lightGray })
  }

  const ensureSpace = (needed: number) => {
    if (curY - needed < 70) {
      drawFooter(page)
      page = pdfDoc.addPage([W, H])
      drawHeader(page)
      curY = H - 150
    }
  }

  const drawSectionTitle = (title: string) => {
    ensureSpace(35)
    curY -= 10
    page.drawRectangle({ x: marginL, y: curY - 2, width: maxTextW, height: 22, color: rgb(0.95, 0.97, 0.95) })
    page.drawRectangle({ x: marginL, y: curY - 2, width: 4, height: 22, color: green })
    page.drawText(title, { x: marginL + 12, y: curY + 3, size: 10, font: fontBold, color: green })
    curY -= 30
  }

  const drawField = (label: string, value: string) => {
    if (!value || value === 'null' || value === 'undefined') return
    ensureSpace(20)
    page.drawText(label + ':', { x: marginL, y: curY, size: 8.5, font: fontBold, color: gray })
    const labelW = fontBold.widthOfTextAtSize(label + ':', 8.5)
    // Wrap value if too long
    const availW = maxTextW - labelW - 10
    const words = value.split(' ')
    let lines: string[] = []
    let currentLine = ''
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      if (font.widthOfTextAtSize(testLine, 9) > availW && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)

    page.drawText(lines[0] || '', { x: marginL + labelW + 10, y: curY, size: 9, font, color: dark })
    curY -= 16
    for (let i = 1; i < lines.length; i++) {
      page.drawText(lines[i], { x: marginL + labelW + 10, y: curY, size: 9, font, color: dark })
      curY -= 16
    }
  }

  // ── Header ──
  drawHeader(page)
  curY = H - 150

  // ── Title ──
  const title = 'FICHA CADASTRAL DE STAKEHOLDER'
  const titleW = fontBold.widthOfTextAtSize(title, 16)
  page.drawText(title, { x: (W - titleW) / 2, y: curY, size: 16, font: fontBold, color: dark })
  curY -= 20
  const tipoLabel = TIPO_LABELS[params.tipo] || params.tipo
  const tipoW = font.widthOfTextAtSize(tipoLabel, 10)
  page.drawText(tipoLabel, { x: (W - tipoW) / 2, y: curY, size: 10, font, color: green })
  curY -= 30

  // ── Dados Gerais ──
  drawSectionTitle('Dados Gerais')
  drawField('Nome', params.nome)
  drawField('E-mail', params.email)
  if (params.telefone) drawField('Telefone', params.telefone)
  if (params.endereco) drawField('Endereço', params.endereco)
  if (params.cidade || params.estado) drawField('Cidade/UF', `${params.cidade || ''}${params.estado ? ' — ' + params.estado : ''}`)
  if (params.cep) drawField('CEP', params.cep)
  drawField('Status', params.status === 'ativo' ? 'Ativo' : params.status === 'inativo' ? 'Inativo' : 'Pendente LGPD')
  drawField('LGPD', params.lgpdConsentimento
    ? `Consentido em ${params.lgpdConsentidoEm ? new Date(params.lgpdConsentidoEm).toLocaleString('pt-BR') : '—'}`
    : 'Pendente')
  if (params.criadoEm) drawField('Cadastrado em', new Date(params.criadoEm).toLocaleString('pt-BR'))
  if (params.observacoes) drawField('Observações', params.observacoes)

  // ── Dados Específicos ──
  if (params.subdata && Object.keys(params.subdata).length > 0) {
    drawSectionTitle(`Dados — ${tipoLabel}`)
    for (const [key, value] of Object.entries(params.subdata)) {
      if (key === 'id' || key === 'stakeholderId') continue
      if (value === null || value === undefined || value === '') continue
      const label = SUBDATA_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
      let displayValue = String(value)
      if (typeof value === 'boolean') displayValue = value ? 'Sim' : 'Não'
      drawField(label, displayValue)
    }
  }

  // ── Dados Bancários ──
  if (params.bancarios && params.bancarios.length > 0) {
    drawSectionTitle('Dados Bancários')
    for (let i = 0; i < params.bancarios.length; i++) {
      const b = params.bancarios[i]
      ensureSpace(100)
      if (i > 0) { curY -= 5; page.drawRectangle({ x: marginL + 20, y: curY, width: maxTextW - 40, height: 0.5, color: lineColor }); curY -= 10 }
      drawField(`Conta ${i + 1} — Banco`, `${b.banco}${b.codigoBanco ? ' (' + b.codigoBanco + ')' : ''}`)
      drawField('Agência / Conta', `${b.agencia} / ${b.conta} (${b.tipoConta === 'corrente' ? 'C/C' : b.tipoConta === 'poupanca' ? 'Poupança' : b.tipoConta})`)
      drawField('Titular', `${b.titular}${b.cpfCnpjTitular ? ' — ' + b.cpfCnpjTitular : ''}`)
      if (b.pixChave) drawField('PIX', `${b.pixTipo}: ${b.pixChave}`)
      if (b.principal) drawField('', '★ Conta Principal')
    }
  }

  // ── Footer ──
  drawFooter(page)

  const pdfBytes = await pdfDoc.save()
  // Convert to base64 in chunks to avoid stack overflow
  let binary = ''
  const bytes = new Uint8Array(pdfBytes)
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const base64 = btoa(binary)
  return `data:application/pdf;base64,${base64}`
}
