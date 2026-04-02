import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient, apiRequest } from '@/lib/queryClient'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  FileText, DollarSign, MessageSquare, Archive,
  Download, ArrowLeft, Plus, X, Loader2, Save, Trash2,
  CheckCircle, XCircle, Clock, RefreshCw,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Proposal, ProposalStatus } from '@shared/schema'
import './suite.css'

interface Clause  { id: string; title: string; body: string }
interface Sig     { id: string; name: string; role: string }
interface OrcItem { id: string; desc: string; qty: number; unit: number }

type PreviewType = 'contratos' | 'orcamentos' | 'oficios'

const LOGO = '/logo-idasam.svg'
const MAX_H = 823

// The IDASAM logo SVG contains embedded PNG bitmaps (no SVG fill/stroke
// attributes to replace). To get a white version we must apply
// ctx.filter = 'brightness(0) invert(1)' when drawing to canvas.
// We fetch the SVG and create a same-origin blob URL so the canvas is
// never tainted, allowing toDataURL() to work correctly.
async function buildWhiteLogoDataUrl(): Promise<string> {
  const res  = await fetch(LOGO, { mode: 'cors' })
  const text = await res.text()
  const blob    = new Blob([text], { type: 'image/svg+xml' })
  const blobUrl = URL.createObjectURL(blob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const W = img.naturalWidth  || 600
      const H = img.naturalHeight || 200
      const cvs = document.createElement('canvas')
      cvs.width  = W
      cvs.height = H
      const ctx = cvs.getContext('2d')!
      ctx.filter = 'brightness(0) invert(1)'
      ctx.drawImage(img, 0, 0, W, H)
      URL.revokeObjectURL(blobUrl)
      resolve(cvs.toDataURL('image/png'))
    }
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl)
      reject(new Error('logo load failed'))
    }
    img.src = blobUrl
  })
}

const DEFAULT_CLAUSES: Clause[] = [
  { id: '1', title: 'CLÁUSULA PRIMEIRA – DO OBJETO E ESCOPO',
    body: '1.1. O objeto deste contrato é a prestação de serviços de consultoria socioambiental e capacitação técnica, abrangendo:\n• Diagnóstico e avaliação ambiental;\n• Planejamento participativo com comunidades;\n• Elaboração de relatórios técnicos e planos de ação.' },
  { id: '2', title: 'CLÁUSULA SEGUNDA – DO VALOR E FORMA DE PAGAMENTO',
    body: '2.1. Pela execução integral dos serviços, a CONTRATANTE pagará ao CONTRATADO o valor total de R$ 0,00.\n2.2. Pagamento via transferência bancária (TED/PIX) conforme acordado entre as partes.' },
  { id: '3', title: 'CLÁUSULA TERCEIRA – DA AUSÊNCIA DE VÍNCULO EMPREGATÍCIO',
    body: '3.1. A prestação de serviços não implica vínculo empregatício entre o CONTRATADO e a CONTRATANTE.\n3.2. O CONTRATADO assume total responsabilidade por seus encargos civis, fiscais, previdenciários e trabalhistas.' },
  { id: '4', title: 'CLÁUSULA QUARTA – DA PROPRIEDADE INTELECTUAL',
    body: '4.1. Todo material desenvolvido durante a execução deste contrato pertencerá exclusivamente ao INSTITUTO DE DESENVOLVIMENTO AMBIENTAL E SOCIAL DA AMAZÔNIA — IDASAM.\n4.2. O CONTRATADO cede, de forma irrevogável, todos os direitos patrimoniais de propriedade intelectual à CONTRATANTE.' },
  { id: '5', title: 'CLÁUSULA QUINTA – DO SIGILO E CONFIDENCIALIDADE (NDA)',
    body: '5.1. O CONTRATADO obriga-se a manter absoluto sigilo sobre quaisquer dados e informações da CONTRATANTE.\n5.2. Descumprimento sujeita ao pagamento de multa de 10x o valor deste contrato, sem prejuízo de perdas e danos.' },
  { id: '6', title: 'CLÁUSULA SEXTA – DA PROTEÇÃO DE DADOS (LGPD)',
    body: '6.1. O CONTRATADO declara plena ciência da Lei nº 13.709/2018 (LGPD) e compromete-se a tratar dados pessoais estritamente para a finalidade do serviço contratado.' },
  { id: '7', title: 'CLÁUSULA SÉTIMA – DA RESCISÃO E MULTAS',
    body: '7.1. O contrato pode ser rescindido por qualquer parte com aviso prévio de 5 (cinco) dias.\n7.2. Inadimplemento de qualquer cláusula implica multa de 20% sobre o valor total do contrato.' },
  { id: '8', title: 'CLÁUSULA OITAVA – DO FORO',
    body: '8.1. Fica eleito o Foro da Comarca de Manaus/AM para dirimir qualquer litígio resultante deste instrumento.' },
]

const DEFAULT_SIGS: Sig[] = [
  { id: '1', name: 'INSTITUTO DE DESENVOLVIMENTO AMBIENTAL E SOCIAL DA AMAZÔNIA — IDASAM', role: 'CONTRATANTE (Mauricio Santos Rocha — Vice Presidente)' },
  { id: '2', name: '', role: 'CONTRATADO' },
]

const DEFAULT_ORC_ITEMS: OrcItem[] = [
  { id: '1', desc: 'Diagnóstico Socioambiental Participativo',        qty: 1, unit: 8000 },
  { id: '2', desc: 'Oficinas de Capacitação Comunitária (8h/cada)',   qty: 4, unit: 1200 },
  { id: '3', desc: 'Elaboração de Plano de Gestão Ambiental',        qty: 1, unit: 5500 },
  { id: '4', desc: 'Relatório Técnico Final',                        qty: 1, unit: 2000 },
]

function uid() { return Math.random().toString(36).slice(2, 9) }
function fmtBRL(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function fmtDate(s: string) {
  if (!s) return ''
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}
function fmtDateLong(s: string) {
  if (!s) return ''
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
  const [y, m, d] = s.split('-')
  return `${parseInt(d)} de ${months[parseInt(m) - 1]} de ${y}`
}

function createA4Page(docType: string, isOrc = false): HTMLElement {
  const page = document.createElement('div')
  page.className = 'sd-page-a4'
  page.innerHTML = `
    <div class="sd-topo-stripe"></div>
    <div class="sd-header">
      <img src="${LOGO}" class="sd-logo-img" alt="IDASAM" crossorigin="anonymous">
      <div class="sd-header-right">
        <div class="sd-doc-type${isOrc ? ' orcamento' : ''}">${docType}</div>
        <div class="sd-info">CENTRO EMPRESARIAL ART CENTER, 3694 — MANAUS/AM<br>WWW.IDASAM.ORG.BR &bull; CNPJ: 02.906.177/0001-87</div>
      </div>
    </div>
    <div class="sd-stripe${isOrc ? ' orcamento' : ''}"></div>
    <div class="sd-body">
      <div class="sd-watermark"><img src="${LOGO}" alt="" crossorigin="anonymous"></div>
      <div class="sd-corner-detail-2"></div>
      <div class="sd-corner-detail"></div>
      <div class="sd-content"></div>
    </div>
    <div class="sd-footer">
      <div class="sd-footer-left">
        <span class="sd-footer-brand">Instituto de Desenvolvimento Ambiental e Social da Amazônia — IDASAM</span>
        <span class="sd-footer-info">www.idasam.org.br &bull; CNPJ: 02.906.177/0001-87 &bull; Centro Empresarial Art Center, 3694 — Manaus/AM</span>
      </div>
      <div class="sd-footer-right"><span class="sd-page-num"></span></div>
    </div>
  `
  return page
}

async function autoPaginate(
  source: HTMLElement,
  container: HTMLElement,
  docType: string,
  isOrc = false,
) {
  await document.fonts.ready
  container.innerHTML = ''

  // Build pages in an off-screen but layout-visible container so that
  // clientHeight and scrollHeight return real values. The real container
  // lives inside a display:none wrapper while paginating=true, which
  // makes every measurement return 0 and breaks both LIMIT detection and
  // overflow detection.
  const offscreen = document.createElement('div')
  offscreen.style.cssText =
    'position:fixed;left:-9999px;top:0;width:794px;visibility:hidden;pointer-events:none;z-index:-1;'
  document.body.appendChild(offscreen)

  const newPage = () => {
    const p = createA4Page(docType, isOrc)
    offscreen.appendChild(p)
    return p.querySelector('.sd-content') as HTMLElement
  }

  // First page: measure the true available content height before filling
  let contentBox = newPage()
  await new Promise(r => requestAnimationFrame(r))
  await new Promise(r => requestAnimationFrame(r))

  const bodyEl    = contentBox.closest('.sd-body') as HTMLElement
  const bodyStyle = window.getComputedStyle(bodyEl)
  const LIMIT     = bodyEl.clientHeight
    - parseFloat(bodyStyle.paddingTop)
    - parseFloat(bodyStyle.paddingBottom)

  let pageCount = 1

  for (const el of Array.from(source.children)) {
    const clone = el.cloneNode(true) as HTMLElement
    contentBox.appendChild(clone)

    await new Promise(r => requestAnimationFrame(r))
    await new Promise(r => requestAnimationFrame(r))

    if (contentBox.scrollHeight > LIMIT) {
      contentBox.removeChild(clone)
      pageCount++
      contentBox = newPage()
      contentBox.appendChild(clone)
      await new Promise(r => requestAnimationFrame(r))
    }
  }

  offscreen.querySelectorAll('.sd-page-num').forEach((el, i) => {
    el.textContent = `Página ${i + 1} de ${pageCount} • IDASAM — Documento Oficial`
  })

  // Move completed pages to the real (possibly hidden) container
  while (offscreen.firstChild) {
    container.appendChild(offscreen.firstChild)
  }
  document.body.removeChild(offscreen)
}

export function SuiteDocumental() {
  const { toast } = useToast()

  const [preview,       setPreview]       = useState<PreviewType | null>(null)
  const [paginating,    setPaginating]    = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [loadingText,   setLoadingText]   = useState('')
  const [savingProposal, setSavingProposal] = useState(false)

  const { data: savedProposals = [], isLoading: loadingProposals } = useQuery<Proposal[]>({
    queryKey: ['/api/admin/proposals'],
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProposalStatus }) =>
      apiRequest('PATCH', `/api/admin/proposals/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/proposals'] })
      toast({ title: 'Status atualizado com sucesso' })
    },
    onError: () => toast({ title: 'Erro ao atualizar status', variant: 'destructive' }),
  })

  const deleteProposalMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/proposals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/proposals'] })
      toast({ title: 'Proposta excluída' })
    },
    onError: () => toast({ title: 'Erro ao excluir proposta', variant: 'destructive' }),
  })

  const contPagesRef = useRef<HTMLDivElement>(null)
  const orcPagesRef  = useRef<HTMLDivElement>(null)
  const ofPagesRef   = useRef<HTMLDivElement>(null)

  const [cMode, setCMode] = useState<'estruturado' | 'livre'>('estruturado')
  const [cData, setCData] = useState({
    data: 'MANAUS, ' + new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase(),
    docId: 'IDASAM-2026-001',
    titulo: 'Contrato de Prestação de Serviços',
    ctanteNome: 'INSTITUTO DE DESENVOLVIMENTO AMBIENTAL E SOCIAL DA AMAZÔNIA — IDASAM',
    ctanteCnpj: '02.906.177/0001-87',
    ctanteEnd:  'Centro Empresarial Art Center, 3694, Manaus - AM, CEP 69055-038',
    ctanteRep:  'MAURICIO SANTOS ROCHA',
    ctanteCargo:'Vice Presidente',
    ctadoNome: '', ctadoQual: '', ctadoRg: '', ctadoCpf: '', ctadoEnd: '',
    minutaLivre: '',
  })
  const [clauses, setClauses] = useState<Clause[]>(DEFAULT_CLAUSES)
  const [sigs,    setSigs]    = useState<Sig[]>(DEFAULT_SIGS)

  const [oData, setOData] = useState({
    numero:   'ORC-2026-001',
    emissao:  new Date().toISOString().slice(0, 10),
    validade: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    categoria:'Projetos Socioambientais',
    titulo:   'Proposta Técnica e Comercial — Programa de Desenvolvimento Socioambiental',
    cliNome:  'EMPRESA PARCEIRA LTDA',
    cliDoc:   '00.000.000/0001-00',
    cliEnd:   'Rua Exemplo, 123 – Centro, Manaus/AM',
    cliContato:'Nome do Contato',
    cliEmail: 'contato@parceiro.com.br',
    cliTel:   '(92) 99999-0000',
    desconto: 0, acrescimo: 0,
    pagamento:'À vista (1x)', pagamentoCustom: '',
    forma:    'Transferência Bancária (TED/PIX)',
    prazo:    '30 dias úteis após aprovação',
    escopo:   'Os serviços incluem: levantamento de campo, diagnóstico socioambiental, planejamento participativo, execução das atividades e entrega de relatório final.',
    incluso:  '• Material técnico e didático\n• Suporte pós-entrega por 30 dias\n• Relatório técnico final',
    excluso:  '• Deslocamentos fora de Manaus/AM\n• Licenças e autorizações de terceiros',
    obs: '',
    respNome:  'Mauricio Santos Rocha',
    respCargo: 'Vice Presidente — IDASAM',
    respEmail: 'contato@idasam.org.br',
  })
  const [oItems, setOItems] = useState<OrcItem[]>(DEFAULT_ORC_ITEMS)

  const subtotal = oItems.reduce((s, i) => s + i.qty * i.unit, 0)
  const discVal  = subtotal * oData.desconto  / 100
  const acrVal   = subtotal * oData.acrescimo / 100
  const totalOrc = subtotal - discVal + acrVal

  const [ofData, setOfData] = useState({
    emitNome:  'Instituto de Desenvolvimento Ambiental e Social da Amazônia — IDASAM',
    emitCnpj:  '02.906.177/0001-87',
    emitEnd:   'Centro Empresarial Art Center, 3694, Manaus - AM, CEP 69055-038',
    emitTel:   '(92) 99999-0000',
    emitEmail: 'contato@idasam.org.br',
    numero:    '001/2026',
    local:     'Manaus/AM',
    data:      new Date().toISOString().slice(0, 10),
    destNome: '', destTratamento: 'Ao Sr.', destCargo: '', destInst: '',
    assunto: '',
    intro: '', desenvolvimento: '', conclusao: '', fundamentacao: '',
    saudacao:  'Atenciosamente,',
    sigNome:   'Mauricio Santos Rocha',
    sigCargo:  'Vice Presidente',
    sigInst:   'Instituto de Desenvolvimento Ambiental e Social da Amazônia — IDASAM',
  })

  function buildContHTML(): string {
    let h = ''
    h += `<div class="sd-doc-meta"><div class="sd-doc-date">${cData.data}</div><div class="sd-doc-id">DOC ID: ${cData.docId}</div></div>`
    h += `<div class="sd-doc-title">${cData.titulo}</div>`
    h += `<p><strong>CONTRATANTE: ${cData.ctanteNome}</strong>, CNPJ nº ${cData.ctanteCnpj}, com sede na ${cData.ctanteEnd}, representada por seu ${cData.ctanteCargo}, <strong>${cData.ctanteRep}</strong>.</p>`
    h += `<p><strong>CONTRATADO: ${cData.ctadoNome}</strong>, ${cData.ctadoQual}, RG nº ${cData.ctadoRg}, CPF nº ${cData.ctadoCpf}, residente à ${cData.ctadoEnd}.</p>`
    h += `<p>As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas seguintes:</p>`

    if (cMode === 'estruturado') {
      clauses.forEach(c => {
        if (c.title) h += `<h3>${c.title}</h3>`
        c.body.split('\n').forEach(l => {
          const t = l.trim()
          if (!t) return
          if (t.startsWith('•') || t.startsWith('-')) h += `<ul><li>${t.replace(/^[•-]\s*/, '')}</li></ul>`
          else h += `<p>${t}</p>`
        })
      })
    } else {
      cData.minutaLivre.split('\n').forEach(l => {
        const t = l.trim()
        if (!t) return
        if (/^CLÁUSULA\s+/i.test(t)) h += `<h3>${t}</h3>`
        else if (t.startsWith('•') || t.startsWith('-')) h += `<ul><li>${t.replace(/^[•-]\s*/, '')}</li></ul>`
        else h += `<p>${t}</p>`
      })
    }

    if (sigs.length > 0) {
      h += `<div class="sd-sigs-wrapper"><div class="sd-sigs">`
      sigs.forEach(s => {
        h += `<div class="sd-sig-box"><div class="sd-sig-line"></div><div class="sd-sig-name">${s.name}</div><div class="sd-sig-role">${s.role}</div></div>`
      })
      h += `</div></div>`
    }
    return h
  }

  function buildOrcHTML(): string {
    let h = ''
    h += `<div class="sd-doc-meta"><div class="sd-doc-date">Emissão: ${fmtDate(oData.emissao)}</div><div class="sd-doc-id">ORC Nº: ${oData.numero}</div></div>`
    h += `<div class="sd-doc-title orcamento">${oData.titulo}</div>`
    h += `<p><strong>CLIENTE:</strong> ${oData.cliNome} — ${oData.cliDoc}</p>`
    h += `<p><strong>ENDEREÇO:</strong> ${oData.cliEnd}</p>`
    h += `<p><strong>CONTATO:</strong> ${oData.cliContato} | ${oData.cliEmail} | ${oData.cliTel}</p>`

    if (oData.escopo) {
      h += `<h3>ESCOPO DO SERVIÇO</h3>`
      oData.escopo.split('\n').forEach(l => { const t = l.trim(); if (t) h += `<p>${t}</p>` })
    }

    h += `<h3>ITENS DO ORÇAMENTO</h3>`
    h += `<table class="sd-items-table"><thead><tr><th>Descrição</th><th>Qtd</th><th>Vlr Unit.</th><th>Total</th></tr></thead><tbody>`
    oItems.forEach(it => {
      h += `<tr><td>${it.desc}</td><td>${it.qty}</td><td>${fmtBRL(it.unit)}</td><td>${fmtBRL(it.qty * it.unit)}</td></tr>`
    })
    h += `</tbody></table>`

    h += `<div class="sd-totals">`
    h += `<div class="sd-total-line"><span>Subtotal:</span><span>${fmtBRL(subtotal)}</span></div>`
    if (oData.desconto > 0) h += `<div class="sd-total-line"><span>Desconto (${oData.desconto}%):</span><span style="color:#C86A3B">– ${fmtBRL(discVal)}</span></div>`
    if (oData.acrescimo > 0) h += `<div class="sd-total-line"><span>Acréscimo (${oData.acrescimo}%):</span><span style="color:#2A5B46">+ ${fmtBRL(acrVal)}</span></div>`
    h += `<div class="sd-total-grand"><span>VALOR TOTAL:</span><span>${fmtBRL(totalOrc)}</span></div></div>`

    const payLabel = oData.pagamento === 'personalizado' ? oData.pagamentoCustom : oData.pagamento
    h += `<div class="sd-doc-validity">
      <div class="sd-validity-item"><div class="label">Validade da Proposta</div><div class="value">Até ${fmtDate(oData.validade)}</div></div>
      <div class="sd-validity-item"><div class="label">Prazo de Entrega</div><div class="value">${oData.prazo}</div></div>
      <div class="sd-validity-item"><div class="label">Condição de Pagamento</div><div class="value">${payLabel}</div></div>
      <div class="sd-validity-item"><div class="label">Forma de Pagamento</div><div class="value">${oData.forma}</div></div>
    </div>`

    const renderLines = (text: string) =>
      text.split('\n').map(l => {
        const t = l.trim()
        if (!t) return ''
        return (t.startsWith('•') || t.startsWith('-'))
          ? `<ul><li>${t.replace(/^[•-]\s*/, '')}</li></ul>`
          : `<p>${t}</p>`
      }).join('')

    if (oData.incluso) { h += `<h3>ESTÁ INCLUSO</h3>${renderLines(oData.incluso)}` }
    if (oData.excluso) { h += `<h3>NÃO ESTÁ INCLUSO</h3>${renderLines(oData.excluso)}` }
    if (oData.obs)     { h += `<div class="sd-doc-obs"><strong>Observações</strong>${oData.obs}</div>` }

    h += `<div class="sd-orc-sig-section">
      <div class="sd-orc-sig-box">
        <div class="sd-orc-sig-line"></div>
        <div class="sd-orc-sig-name">INSTITUTO DE DESENVOLVIMENTO AMBIENTAL E SOCIAL DA AMAZÔNIA — IDASAM</div>
        <div class="sd-orc-sig-role">${oData.respNome} — ${oData.respCargo}</div>
        <div class="sd-orc-sig-role">${oData.respEmail}</div>
      </div>
      <div class="sd-orc-sig-box">
        <div class="sd-orc-sig-line"></div>
        <div class="sd-orc-sig-name">${oData.cliNome}</div>
        <div class="sd-orc-sig-role">CLIENTE — Aprovação da Proposta</div>
        <div class="sd-orc-sig-role">Data: ___/___/______</div>
      </div>
    </div>`
    return h
  }

  function buildOficioHTML(): string {
    let h = ''
    h += `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;position:relative;z-index:1;">
      <div class="sd-oficio-num">Ofício nº ${ofData.numero}</div>
      <div class="sd-oficio-data">${ofData.local}, ${fmtDateLong(ofData.data)}</div>
    </div>`
    h += `<div class="sd-oficio-dest">
      <div class="dest-label">Destinatário</div>
      <div class="dest-nome">${ofData.destTratamento} ${ofData.destNome}</div>
      <div class="dest-cargo">${ofData.destCargo}</div>
      <div class="dest-cargo" style="font-style:italic;">${ofData.destInst}</div>
    </div>`
    if (ofData.assunto) h += `<div class="sd-oficio-assunto"><strong>Assunto</strong>${ofData.assunto}</div>`

    h += `<div class="sd-oficio-corpo">`
    if (ofData.intro) {
      h += `<span class="sd-section-label">Introdução</span>`
      ofData.intro.split('\n').forEach(l => { const t = l.trim(); if (t) h += `<p>${t}</p>` })
    }
    if (ofData.desenvolvimento) {
      h += `<span class="sd-section-label">Desenvolvimento</span>`
      ofData.desenvolvimento.split('\n').forEach(l => { const t = l.trim(); if (t) h += `<p>${t}</p>` })
    }
    if (ofData.conclusao) {
      h += `<span class="sd-section-label">Conclusão</span>`
      ofData.conclusao.split('\n').forEach(l => { const t = l.trim(); if (t) h += `<p>${t}</p>` })
    }
    h += `</div>`

    if (ofData.fundamentacao) {
      h += `<div class="sd-oficio-fund"><strong>Fundamentação Jurídica / Normativa</strong><ul>`
      ofData.fundamentacao.split('\n').forEach(l => { const t = l.trim(); if (t) h += `<li>${t}</li>` })
      h += `</ul></div>`
    }

    h += `<div class="sd-oficio-fechamento"><p>${ofData.saudacao}</p></div>`
    h += `<div class="sd-oficio-assinatura">
      <div class="sd-sig-grad-line"></div>
      <div class="sd-sig-nome">${ofData.sigNome}</div>
      <div class="sd-sig-cargo">${ofData.sigCargo}</div>
      <div class="sd-sig-inst">${ofData.sigInst}</div>
    </div>`
    return h
  }

  async function handlePreview(tipo: PreviewType) {
    setPreview(tipo)
    setPaginating(true)
    await new Promise(r => setTimeout(r, 350))

    const src = document.createElement('div')
    if (tipo === 'contratos') {
      src.innerHTML = buildContHTML()
      if (contPagesRef.current) await autoPaginate(src, contPagesRef.current, 'Instrumento Contratual')
    } else if (tipo === 'orcamentos') {
      src.innerHTML = buildOrcHTML()
      if (orcPagesRef.current)  await autoPaginate(src, orcPagesRef.current, 'Proposta Técnica e Comercial', true)
    } else {
      src.innerHTML = buildOficioHTML()
      if (ofPagesRef.current)   await autoPaginate(src, ofPagesRef.current, 'Ofício Institucional')
    }
    setPaginating(false)
  }

  async function gerarPDF(tipo: PreviewType) {
    const ref = tipo === 'contratos' ? contPagesRef : tipo === 'orcamentos' ? orcPagesRef : ofPagesRef
    if (!ref.current) return
    setGeneratingPDF(true)
    document.body.classList.add('sd-exporting')
    window.scrollTo(0, 0)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const W = 794, H = 1123
      const pdf = new jsPDF({ unit: 'px', format: [W, H], orientation: 'portrait' })
      const pages = ref.current.querySelectorAll('.sd-page-a4')

      // html2canvas cannot apply CSS filters to cross-origin SVGs.
      // Build a white raster version of the logo using Canvas 2D and swap
      // each .sd-logo-img src before capturing, then restore afterwards.
      const whiteLogoUrl = await buildWhiteLogoDataUrl()
      const allLogos = Array.from(
        ref.current.querySelectorAll('.sd-logo-img')
      ) as HTMLImageElement[]
      const savedSrcs    = allLogos.map(img => img.src)
      const savedFilters = allLogos.map(img => img.style.filter)
      allLogos.forEach(img => {
        img.src          = whiteLogoUrl
        img.style.filter = 'none'
      })
      // Wait for every logo to finish loading the new src before capturing
      await Promise.all(allLogos.map(img =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>(r => { img.onload = () => r() })
      ))
      await new Promise(r => requestAnimationFrame(r))

      for (let i = 0; i < pages.length; i++) {
        setLoadingText(`Renderizando página ${i + 1} de ${pages.length}...`)
        const canvas = await html2canvas(pages[i] as HTMLElement, {
          scale: 2, useCORS: true, logging: false, width: W, height: H, windowWidth: W,
        })
        if (i > 0) pdf.addPage([W, H], 'portrait')
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.97), 'JPEG', 0, 0, W, H)
      }

      allLogos.forEach((img, i) => {
        img.src          = savedSrcs[i]
        img.style.filter = savedFilters[i]
      })

      const year = new Date().getFullYear()
      const filename =
        tipo === 'contratos'  ? `Contrato_IDASAM_${cData.ctadoNome.split(' ')[0] || 'Contrato'}_${year}.pdf` :
        tipo === 'orcamentos' ? `Orcamento_IDASAM_${oData.numero}_${oData.cliNome.split(' ')[0] || 'Cliente'}.pdf` :
                                `Oficio_IDASAM_${ofData.numero.replace(/\//g, '-')}_${year}.pdf`
      pdf.save(filename)
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      alert('Erro ao gerar o PDF. Veja o console para detalhes.')
    } finally {
      document.body.classList.remove('sd-exporting')
      setGeneratingPDF(false)
      setLoadingText('')
    }
  }

  async function saveCurrentDocument(tipo: PreviewType) {
    setSavingProposal(true)
    try {
      let body: Record<string, unknown>
      if (tipo === 'contratos') {
        body = {
          tipo:       'contrato',
          numero:     cData.docId,
          titulo:     cData.titulo,
          cliNome:    cData.ctadoNome || 'Contratado',
          emissao:    new Date().toISOString().slice(0, 10),
          status:     'enviada' as ProposalStatus,
          dados:      JSON.stringify({ cData, clauses, sigs }),
        }
      } else if (tipo === 'orcamentos') {
        body = {
          tipo:       'orcamento',
          numero:     oData.numero,
          titulo:     oData.titulo,
          cliNome:    oData.cliNome,
          cliEmail:   oData.cliEmail,
          cliTel:     oData.cliTel,
          valorTotal: fmtBRL(totalOrc),
          emissao:    oData.emissao,
          validade:   oData.validade,
          obs:        oData.obs || null,
          status:     'enviada' as ProposalStatus,
          dados:      JSON.stringify({ oData, oItems }),
        }
      } else {
        body = {
          tipo:       'oficio',
          numero:     ofData.numero,
          titulo:     ofData.assunto || `Ofício nº ${ofData.numero}`,
          cliNome:    ofData.destNome || 'Destinatário',
          emissao:    ofData.data,
          status:     'enviada' as ProposalStatus,
          dados:      JSON.stringify({ ofData }),
        }
      }
      await apiRequest('POST', '/api/admin/proposals', body)
      queryClient.invalidateQueries({ queryKey: ['/api/admin/proposals'] })
      const labels = { contratos: 'Contrato', orcamentos: 'Orçamento', oficios: 'Ofício' }
      toast({ title: `${labels[tipo]} salvo com sucesso!`, description: 'Registrado na aba Documentos Emitidos.' })
    } catch {
      toast({ title: 'Erro ao salvar documento', variant: 'destructive' })
    } finally {
      setSavingProposal(false)
    }
  }

  const addClause    = () => setClauses(c => [...c, { id: uid(), title: '', body: '' }])
  const removeClause = (id: string) => setClauses(c => c.filter(x => x.id !== id))
  const editClause   = (id: string, f: keyof Clause, v: string) => setClauses(c => c.map(x => x.id === id ? { ...x, [f]: v } : x))

  const addSig    = () => setSigs(s => [...s, { id: uid(), name: '', role: '' }])
  const removeSig = (id: string) => setSigs(s => s.filter(x => x.id !== id))
  const editSig   = (id: string, f: keyof Sig, v: string) => setSigs(s => s.map(x => x.id === id ? { ...x, [f]: v } : x))

  const addItem    = () => setOItems(i => [...i, { id: uid(), desc: '', qty: 1, unit: 0 }])
  const removeItem = (id: string) => setOItems(i => i.filter(x => x.id !== id))
  const editItem   = (id: string, f: keyof OrcItem, v: string | number) =>
    setOItems(i => i.map(x => x.id === id ? { ...x, [f]: v } : x))

  return (
    <div className="relative">
      {generatingPDF && (
        <div className="fixed inset-0 z-[9999] bg-[#2A5B46]/92 flex flex-col items-center justify-center gap-5">
          <Loader2 className="h-12 w-12 text-[#FBBF24] animate-spin" />
          <p className="text-white font-semibold text-base">Gerando PDF, aguarde...</p>
          <p className="text-white/50 text-sm">{loadingText}</p>
        </div>
      )}

      {preview && (
        <div className="sd-preview-wrap">
          <div className="sd-preview-topbar">
            <span className="text-white/60 text-sm font-semibold tracking-wide">
              {preview === 'contratos'  ? '📄 Preview do Contrato'   :
               preview === 'orcamentos' ? '💼 Preview do Orçamento'  :
                                          '📨 Preview do Ofício'} — IDASAM
            </span>
            <div className="flex gap-2">
              <button className="sd-topbar-btn-outline" onClick={() => setPreview(null)}>
                <ArrowLeft size={14} /> Editar
              </button>
              <button
                className="sd-topbar-btn-save"
                onClick={() => saveCurrentDocument(preview)}
                disabled={savingProposal || paginating}
              >
                {savingProposal ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {preview === 'contratos' ? 'Salvar Contrato' : preview === 'orcamentos' ? 'Salvar Orçamento' : 'Salvar Ofício'}
              </button>
              <button
                className="sd-topbar-btn-solid"
                onClick={() => gerarPDF(preview)}
                disabled={generatingPDF || paginating}
              >
                <Download size={14} /> Baixar PDF
              </button>
            </div>
          </div>

          {paginating && (
            <div className="flex flex-col items-center justify-center gap-3 mt-20">
              <Loader2 className="h-8 w-8 text-[#2A5B46] animate-spin" />
              <p className="text-[#2A5B46] font-semibold text-sm">Montando documento...</p>
            </div>
          )}

          <div className="sd-pages-container" style={{ display: paginating ? 'none' : 'flex' }}>
            {preview === 'contratos'  && <div ref={contPagesRef} className="flex flex-col gap-7 items-center w-full" />}
            {preview === 'orcamentos' && <div ref={orcPagesRef}  className="flex flex-col gap-7 items-center w-full" />}
            {preview === 'oficios'    && <div ref={ofPagesRef}   className="flex flex-col gap-7 items-center w-full" />}
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#F0F4F8]">
        <div className="bg-[#2A5B46] px-8 py-5 flex items-center gap-4 border-b border-[#FBBF24]/20 shadow-lg">
          <img src={LOGO} alt="IDASAM" className="h-10 brightness-0 invert" />
          <div>
            <h1 className="text-white font-bold text-xl tracking-wide">Suite Documental</h1>
            <p className="text-white/45 text-[11px] uppercase tracking-[0.15em]">Gerador de Documentos Institucionais — IDASAM</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <Tabs defaultValue="contratos" className="w-full">
            <TabsList className="grid grid-cols-4 w-full h-12 mb-8 bg-[#2A5B46]/8 border border-[#C8DDD5]">
              <TabsTrigger value="contratos"  className="gap-2 data-[state=active]:bg-[#2A5B46] data-[state=active]:text-white">
                <FileText size={14} /> Contratos
              </TabsTrigger>
              <TabsTrigger value="orcamentos" className="gap-2 data-[state=active]:bg-[#C86A3B] data-[state=active]:text-white">
                <DollarSign size={14} /> Orçamentos
              </TabsTrigger>
              <TabsTrigger value="oficios"    className="gap-2 data-[state=active]:bg-[#008080] data-[state=active]:text-white">
                <MessageSquare size={14} /> Ofícios
              </TabsTrigger>
              <TabsTrigger value="documentos" className="gap-2 data-[state=active]:bg-[#6B4C9A] data-[state=active]:text-white">
                <Archive size={14} /> Documentos Emitidos
                {savedProposals.length > 0 && (
                  <span className="ml-1 bg-[#FBBF24] text-[#1F2937] text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                    {savedProposals.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contratos" className="space-y-4">
              <SdCard title="Identificação do Documento">
                <div className="grid grid-cols-3 gap-4">
                  <SdField label="Cidade e Data">
                    <Input value={cData.data} onChange={e => setCData(d => ({ ...d, data: e.target.value }))} />
                  </SdField>
                  <SdField label="ID do Documento">
                    <Input value={cData.docId} onChange={e => setCData(d => ({ ...d, docId: e.target.value }))} />
                  </SdField>
                  <SdField label="Título do Contrato">
                    <Input value={cData.titulo} onChange={e => setCData(d => ({ ...d, titulo: e.target.value }))} />
                  </SdField>
                </div>
              </SdCard>

              <SdCard title="Contratante">
                <div className="grid grid-cols-2 gap-4">
                  <SdField label="Razão Social">
                    <Input value={cData.ctanteNome} onChange={e => setCData(d => ({ ...d, ctanteNome: e.target.value }))} />
                  </SdField>
                  <SdField label="CNPJ">
                    <Input value={cData.ctanteCnpj} onChange={e => setCData(d => ({ ...d, ctanteCnpj: e.target.value }))} />
                  </SdField>
                  <SdField label="Endereço Completo" className="col-span-2">
                    <Input value={cData.ctanteEnd} onChange={e => setCData(d => ({ ...d, ctanteEnd: e.target.value }))} />
                  </SdField>
                  <SdField label="Representante Legal">
                    <Input value={cData.ctanteRep} onChange={e => setCData(d => ({ ...d, ctanteRep: e.target.value }))} />
                  </SdField>
                  <SdField label="Cargo do Representante">
                    <Input value={cData.ctanteCargo} onChange={e => setCData(d => ({ ...d, ctanteCargo: e.target.value }))} />
                  </SdField>
                </div>
              </SdCard>

              <SdCard title="Contratado">
                <div className="grid grid-cols-2 gap-4">
                  <SdField label="Nome Completo">
                    <Input value={cData.ctadoNome} onChange={e => setCData(d => ({ ...d, ctadoNome: e.target.value }))} />
                  </SdField>
                  <SdField label="Qualificação">
                    <Input value={cData.ctadoQual} onChange={e => setCData(d => ({ ...d, ctadoQual: e.target.value }))} />
                  </SdField>
                  <SdField label="RG">
                    <Input value={cData.ctadoRg} onChange={e => setCData(d => ({ ...d, ctadoRg: e.target.value }))} />
                  </SdField>
                  <SdField label="CPF">
                    <Input value={cData.ctadoCpf} onChange={e => setCData(d => ({ ...d, ctadoCpf: e.target.value }))} />
                  </SdField>
                  <SdField label="Endereço Completo" className="col-span-2">
                    <Input value={cData.ctadoEnd} onChange={e => setCData(d => ({ ...d, ctadoEnd: e.target.value }))} />
                  </SdField>
                </div>
              </SdCard>

              <SdCard title="Cláusulas do Contrato">
                <div className="flex gap-1 bg-[#F0F4F8] p-1 rounded-lg mb-5">
                  {(['estruturado', 'livre'] as const).map(m => (
                    <button key={m} onClick={() => setCMode(m)}
                      className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${cMode === m ? 'bg-white text-[#2A5B46] shadow' : 'text-[#4A7260]'}`}>
                      {m === 'estruturado' ? '📋 Cláusulas Estruturadas' : '✏️ Minuta Livre'}
                    </button>
                  ))}
                </div>

                {cMode === 'estruturado' ? (
                  <div className="flex flex-col gap-3">
                    {clauses.map((c, i) => (
                      <div key={c.id} className="border border-[#C8DDD5] rounded-xl overflow-hidden bg-[#FAFCFB]">
                        <div className="flex items-center gap-3 px-4 py-2 bg-[#F0F4F8] border-b border-[#C8DDD5]">
                          <div className="w-6 h-6 rounded-full bg-[#2A5B46] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">{i + 1}</div>
                          <input className="flex-1 bg-transparent border-none text-[11px] font-bold uppercase tracking-wide text-[#1F2937] outline-none placeholder:text-gray-400"
                            value={c.title} placeholder="NOME DA CLÁUSULA"
                            onChange={e => editClause(c.id, 'title', e.target.value)} />
                          <button onClick={() => removeClause(c.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"><X size={15} /></button>
                        </div>
                        <Textarea className="border-none bg-transparent rounded-none shadow-none text-sm focus-visible:ring-0"
                          value={c.body} placeholder="Texto desta cláusula..."
                          onChange={e => editClause(c.id, 'body', e.target.value)} />
                      </div>
                    ))}
                    <DashedAdd onClick={addClause} label="Adicionar Cláusula" />
                  </div>
                ) : (
                  <SdField label="Cole ou escreva a minuta completa">
                    <Textarea className="min-h-[240px]" value={cData.minutaLivre}
                      onChange={e => setCData(d => ({ ...d, minutaLivre: e.target.value }))}
                      placeholder={'CLÁUSULA PRIMEIRA – DO OBJETO\n1.1. O objeto deste contrato é...'} />
                  </SdField>
                )}
              </SdCard>

              <SdCard title="Assinaturas">
                <div className="flex flex-col gap-3">
                  {sigs.map(s => (
                    <div key={s.id} className="border border-[#C8DDD5] rounded-xl overflow-hidden bg-[#FAFCFB]">
                      <div className="flex items-center gap-3 px-4 py-2 bg-[#F0F4F8] border-b border-[#C8DDD5]">
                        <div className="w-6 h-6 rounded-full bg-[#2A5B46] text-white flex items-center justify-center text-xs flex-shrink-0">✍</div>
                        <input className="flex-1 bg-transparent border-none text-[11px] font-bold uppercase tracking-wide text-[#1F2937] outline-none placeholder:text-gray-400"
                          value={s.name} placeholder="NOME DO SIGNATÁRIO"
                          onChange={e => editSig(s.id, 'name', e.target.value)} />
                        <button onClick={() => removeSig(s.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"><X size={15} /></button>
                      </div>
                      <div className="px-4 py-2.5">
                        <input className="w-full bg-transparent border-none text-sm text-[#4A7260] outline-none placeholder:text-gray-400"
                          value={s.role} placeholder="Papel / Qualificação"
                          onChange={e => editSig(s.id, 'role', e.target.value)} />
                      </div>
                    </div>
                  ))}
                  <DashedAdd onClick={addSig} label="Adicionar Assinatura" />
                </div>
              </SdCard>

              <div className="flex justify-end gap-3 pt-1">
                <Button variant="outline" onClick={() => { setClauses(DEFAULT_CLAUSES); setSigs(DEFAULT_SIGS) }}>↺ Restaurar</Button>
                <Button onClick={() => handlePreview('contratos')} className="bg-[#2A5B46] hover:bg-[#4E8D7C] text-white gap-2">
                  Visualizar Contrato <ArrowLeft size={15} className="rotate-180" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="orcamentos" className="space-y-4">
              <SdCard title="Identificação do Orçamento">
                <div className="grid grid-cols-4 gap-4">
                  <SdField label="Número">
                    <Input value={oData.numero} onChange={e => setOData(d => ({ ...d, numero: e.target.value }))} />
                  </SdField>
                  <SdField label="Data de Emissão">
                    <Input type="date" value={oData.emissao} onChange={e => setOData(d => ({ ...d, emissao: e.target.value }))} />
                  </SdField>
                  <SdField label="Validade">
                    <Input type="date" value={oData.validade} onChange={e => setOData(d => ({ ...d, validade: e.target.value }))} />
                  </SdField>
                  <SdField label="Categoria">
                    <Select value={oData.categoria} onValueChange={v => setOData(d => ({ ...d, categoria: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Projetos Socioambientais','Consultoria Ambiental','Desenvolvimento Comunitário','Capacitação & Treinamento','Infraestrutura & TI','Serviços Gerais','Projetos Especiais'].map(c =>
                          <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </SdField>
                  <SdField label="Título / Objeto" className="col-span-4">
                    <Input value={oData.titulo} onChange={e => setOData(d => ({ ...d, titulo: e.target.value }))} />
                  </SdField>
                </div>
              </SdCard>

              <SdCard title="Dados do Cliente">
                <div className="grid grid-cols-3 gap-4">
                  <SdField label="Nome / Razão Social" className="col-span-2">
                    <Input value={oData.cliNome} onChange={e => setOData(d => ({ ...d, cliNome: e.target.value }))} />
                  </SdField>
                  <SdField label="CNPJ / CPF">
                    <Input value={oData.cliDoc} onChange={e => setOData(d => ({ ...d, cliDoc: e.target.value }))} />
                  </SdField>
                  <SdField label="Endereço" className="col-span-3">
                    <Input value={oData.cliEnd} onChange={e => setOData(d => ({ ...d, cliEnd: e.target.value }))} />
                  </SdField>
                  <SdField label="Contato">
                    <Input value={oData.cliContato} onChange={e => setOData(d => ({ ...d, cliContato: e.target.value }))} />
                  </SdField>
                  <SdField label="E-mail">
                    <Input value={oData.cliEmail} onChange={e => setOData(d => ({ ...d, cliEmail: e.target.value }))} />
                  </SdField>
                  <SdField label="Telefone">
                    <Input value={oData.cliTel} onChange={e => setOData(d => ({ ...d, cliTel: e.target.value }))} />
                  </SdField>
                </div>
              </SdCard>

              <SdCard title="Itens do Orçamento">
                <div className="grid grid-cols-[2fr_80px_130px_130px_36px] gap-2 pb-2 border-b-2 border-[#C8DDD5] mb-2">
                  {['Descrição','Qtd','Vlr Unit.','Total',''].map((h, i) => (
                    <span key={i} className={`text-[10px] font-bold text-[#4A7260] uppercase tracking-wide ${i >= 2 ? 'text-right' : ''}`}>{h}</span>
                  ))}
                </div>
                {oItems.map(it => (
                  <div key={it.id} className="grid grid-cols-[2fr_80px_130px_130px_36px] gap-2 items-center py-2 border-b border-gray-100">
                    <Input value={it.desc} onChange={e => editItem(it.id, 'desc', e.target.value)} placeholder="Descrição..." className="text-sm" />
                    <Input type="number" value={it.qty}  min={1}   onChange={e => editItem(it.id, 'qty',  parseFloat(e.target.value) || 1)} className="text-center text-sm" />
                    <Input type="number" value={it.unit} min={0} step={0.01} onChange={e => editItem(it.id, 'unit', parseFloat(e.target.value) || 0)} className="text-right text-sm" />
                    <div className="text-right font-bold text-sm text-[#1F2937]">{fmtBRL(it.qty * it.unit)}</div>
                    <button onClick={() => removeItem(it.id)} className="text-gray-300 hover:text-red-400 flex justify-center"><X size={18} /></button>
                  </div>
                ))}
                <DashedAdd onClick={addItem} label="Adicionar Item" />
                <div className="flex gap-4 mt-5 justify-end">
                  <SdField label="Desconto (%)" className="w-40">
                    <Input type="number" value={oData.desconto}  min={0} max={100} onChange={e => setOData(d => ({ ...d, desconto:  parseFloat(e.target.value) || 0 }))} />
                  </SdField>
                  <SdField label="Acréscimo (%)" className="w-40">
                    <Input type="number" value={oData.acrescimo} min={0} max={100} onChange={e => setOData(d => ({ ...d, acrescimo: parseFloat(e.target.value) || 0 }))} />
                  </SdField>
                </div>
                <div className="mt-4 bg-[#F0F4F8] rounded-xl p-4 flex flex-col items-end gap-2 border border-[#C8DDD5]">
                  <TotalRow label="Subtotal" value={fmtBRL(subtotal)} />
                  {oData.desconto  > 0 && <TotalRow label={`Desconto (${oData.desconto}%)`}  value={`– ${fmtBRL(discVal)}`} color="text-[#C86A3B]" />}
                  {oData.acrescimo > 0 && <TotalRow label={`Acréscimo (${oData.acrescimo}%)`} value={`+ ${fmtBRL(acrVal)}`}  color="text-[#2A5B46]" />}
                  <div className="flex gap-6 text-base font-bold text-[#1F2937] border-t border-[#C8DDD5] pt-2 mt-1 w-full justify-end">
                    <span className="w-36 text-right">TOTAL GERAL:</span>
                    <span className="w-32 text-right text-[#2A5B46]">{fmtBRL(totalOrc)}</span>
                  </div>
                </div>
              </SdCard>

              <SdCard title="Condições de Pagamento">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { val: 'À vista (1x)',                          label: '💵 À Vista',      desc: 'Pagamento único na aprovação' },
                    { val: '50% na aprovação + 50% na entrega',    label: '✌️ 50% + 50%',    desc: 'Entrada + saldo na entrega' },
                    { val: '30% entrada + 70% na entrega',         label: '📋 30% + 70%',    desc: 'Entrada reduzida' },
                    { val: 'Parcelado em 3x sem juros',            label: '📅 3x sem juros', desc: '3 parcelas mensais iguais' },
                    { val: 'Parcelado em 6x sem juros',            label: '📆 6x sem juros', desc: '6 parcelas mensais iguais' },
                    { val: 'personalizado',                        label: '⚙️ Personalizado', desc: 'Defina abaixo' },
                  ].map(p => (
                    <button key={p.val} onClick={() => setOData(d => ({ ...d, pagamento: p.val }))}
                      className={`flex flex-col gap-1 p-3 rounded-xl border-2 text-left transition-all ${oData.pagamento === p.val ? 'border-[#2A5B46] bg-[#F0F4F8]' : 'border-[#C8DDD5] bg-[#FAFCFB] hover:border-[#4E8D7C]'}`}>
                      <span className="text-sm font-semibold text-[#1F2937]">{p.label}</span>
                      <span className="text-xs text-[#4A7260]">{p.desc}</span>
                    </button>
                  ))}
                </div>
                {oData.pagamento === 'personalizado' && (
                  <SdField label="Condição personalizada" className="mb-4">
                    <Input value={oData.pagamentoCustom} onChange={e => setOData(d => ({ ...d, pagamentoCustom: e.target.value }))} placeholder="Ex: 40% na assinatura, 30% na entrega parcial e 30% na conclusão" />
                  </SdField>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <SdField label="Forma de Pagamento">
                    <Select value={oData.forma} onValueChange={v => setOData(d => ({ ...d, forma: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Transferência Bancária (TED/PIX)','PIX (chave CNPJ)','Boleto Bancário','Cartão de Crédito','Cheque','Dinheiro'].map(f =>
                          <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </SdField>
                  <SdField label="Prazo de Entrega / Execução">
                    <Input value={oData.prazo} onChange={e => setOData(d => ({ ...d, prazo: e.target.value }))} />
                  </SdField>
                </div>
              </SdCard>

              <SdCard title="Informações Adicionais">
                <div className="flex flex-col gap-4">
                  <SdField label="Escopo / Descrição dos Serviços">
                    <Textarea className="min-h-[90px]" value={oData.escopo} onChange={e => setOData(d => ({ ...d, escopo: e.target.value }))} />
                  </SdField>
                  <SdField label="Está incluso">
                    <Textarea className="min-h-[70px]" value={oData.incluso} onChange={e => setOData(d => ({ ...d, incluso: e.target.value }))} />
                  </SdField>
                  <SdField label="NÃO está incluso">
                    <Textarea className="min-h-[60px]" value={oData.excluso} onChange={e => setOData(d => ({ ...d, excluso: e.target.value }))} />
                  </SdField>
                  <SdField label="Observações">
                    <Textarea className="min-h-[60px]" value={oData.obs} onChange={e => setOData(d => ({ ...d, obs: e.target.value }))} />
                  </SdField>
                </div>
              </SdCard>

              <SdCard title="Responsável pela Proposta">
                <div className="grid grid-cols-3 gap-4">
                  <SdField label="Nome">
                    <Input value={oData.respNome}  onChange={e => setOData(d => ({ ...d, respNome:  e.target.value }))} />
                  </SdField>
                  <SdField label="Cargo">
                    <Input value={oData.respCargo} onChange={e => setOData(d => ({ ...d, respCargo: e.target.value }))} />
                  </SdField>
                  <SdField label="E-mail">
                    <Input value={oData.respEmail} onChange={e => setOData(d => ({ ...d, respEmail: e.target.value }))} />
                  </SdField>
                </div>
              </SdCard>

              <div className="flex justify-end gap-3 pt-1">
                <Button variant="outline" onClick={() => setOItems(DEFAULT_ORC_ITEMS)}>↺ Restaurar</Button>
                <Button onClick={() => handlePreview('orcamentos')} className="bg-[#C86A3B] hover:bg-[#A8562F] text-white gap-2">
                  Visualizar Orçamento <ArrowLeft size={15} className="rotate-180" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="oficios" className="space-y-4">
              <SdCard title="Identificação do Emissor">
                <div className="grid grid-cols-2 gap-4">
                  <SdField label="Nome da Empresa / Órgão">
                    <Input value={ofData.emitNome} onChange={e => setOfData(d => ({ ...d, emitNome: e.target.value }))} />
                  </SdField>
                  <SdField label="CNPJ">
                    <Input value={ofData.emitCnpj} onChange={e => setOfData(d => ({ ...d, emitCnpj: e.target.value }))} />
                  </SdField>
                  <SdField label="Endereço" className="col-span-2">
                    <Input value={ofData.emitEnd} onChange={e => setOfData(d => ({ ...d, emitEnd: e.target.value }))} />
                  </SdField>
                  <SdField label="Telefone">
                    <Input value={ofData.emitTel} onChange={e => setOfData(d => ({ ...d, emitTel: e.target.value }))} />
                  </SdField>
                  <SdField label="E-mail">
                    <Input value={ofData.emitEmail} onChange={e => setOfData(d => ({ ...d, emitEmail: e.target.value }))} />
                  </SdField>
                </div>
              </SdCard>

              <SdCard title="Numeração e Data">
                <div className="grid grid-cols-3 gap-4">
                  <SdField label="Número do Ofício">
                    <Input value={ofData.numero} onChange={e => setOfData(d => ({ ...d, numero: e.target.value }))} placeholder="Ex: 001/2026" />
                  </SdField>
                  <SdField label="Local">
                    <Input value={ofData.local} onChange={e => setOfData(d => ({ ...d, local: e.target.value }))} />
                  </SdField>
                  <SdField label="Data">
                    <Input type="date" value={ofData.data} onChange={e => setOfData(d => ({ ...d, data: e.target.value }))} />
                  </SdField>
                </div>
              </SdCard>

              <SdCard title="Destinatário">
                <div className="grid grid-cols-2 gap-4">
                  <SdField label="Tratamento">
                    <Select value={ofData.destTratamento} onValueChange={v => setOfData(d => ({ ...d, destTratamento: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Ao Sr.','À Sra.','À Exma. Sra.','Ao Exmo. Sr.','À Ilma. Sra.','Ao Ilmo. Sr.'].map(t =>
                          <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </SdField>
                  <SdField label="Nome Completo">
                    <Input value={ofData.destNome} onChange={e => setOfData(d => ({ ...d, destNome: e.target.value }))} placeholder="Ex: João Silva" />
                  </SdField>
                  <SdField label="Cargo / Função">
                    <Input value={ofData.destCargo} onChange={e => setOfData(d => ({ ...d, destCargo: e.target.value }))} placeholder="Ex: Diretor Administrativo" />
                  </SdField>
                  <SdField label="Empresa / Órgão / Instituição" className="col-span-2">
                    <Input value={ofData.destInst} onChange={e => setOfData(d => ({ ...d, destInst: e.target.value }))} placeholder="Ex: Secretaria de Estado do Meio Ambiente" />
                  </SdField>
                </div>
              </SdCard>

              <SdCard title="Assunto">
                <SdField label="Resumo Objetivo do Ofício">
                  <Input value={ofData.assunto} onChange={e => setOfData(d => ({ ...d, assunto: e.target.value }))} placeholder="Ex: Solicitação de parceria para programa de educação ambiental" />
                </SdField>
              </SdCard>

              <SdCard title="Corpo do Texto">
                <div className="flex flex-col gap-4">
                  <SdField label="➤ Introdução — Apresentação e motivo do ofício">
                    <Textarea className="min-h-[90px]" value={ofData.intro}
                      onChange={e => setOfData(d => ({ ...d, intro: e.target.value }))}
                      placeholder="Ex: Vimos por meio deste solicitar à instituição acima identificada..." />
                  </SdField>
                  <SdField label="➤ Desenvolvimento — Detalhamento do pedido ou posicionamento">
                    <Textarea className="min-h-[120px]" value={ofData.desenvolvimento}
                      onChange={e => setOfData(d => ({ ...d, desenvolvimento: e.target.value }))}
                      placeholder="Detalhe aqui o contexto, os dados relevantes e o pedido específico..." />
                  </SdField>
                  <SdField label="➤ Conclusão — O que se espera (ação, resposta, prazo)">
                    <Textarea className="min-h-[80px]" value={ofData.conclusao}
                      onChange={e => setOfData(d => ({ ...d, conclusao: e.target.value }))}
                      placeholder="Ex: Aguardamos retorno no prazo de 15 (quinze) dias úteis..." />
                  </SdField>
                </div>
              </SdCard>

              <SdCard title="Fundamentação Jurídica / Normativa (opcional)">
                <SdField label="Leis, contratos, normas ou regulamentos aplicáveis">
                  <Textarea className="min-h-[80px]" value={ofData.fundamentacao}
                    onChange={e => setOfData(d => ({ ...d, fundamentacao: e.target.value }))}
                    placeholder={'Ex: Lei nº 6.938/1981 (Política Nacional do Meio Ambiente)\nDecreto nº 4.340/2002\nDeixe em branco se não houver.'} />
                </SdField>
              </SdCard>

              <SdCard title="Assinatura">
                <div className="grid grid-cols-3 gap-4">
                  <SdField label="Saudação Final">
                    <Select value={ofData.saudacao} onValueChange={v => setOfData(d => ({ ...d, saudacao: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Atenciosamente,','Respeitosamente,','Cordialmente,','Subscrevemo-nos respeitosamente,'].map(s =>
                          <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </SdField>
                  <SdField label="Nome do Signatário">
                    <Input value={ofData.sigNome}  onChange={e => setOfData(d => ({ ...d, sigNome:  e.target.value }))} />
                  </SdField>
                  <SdField label="Cargo do Signatário">
                    <Input value={ofData.sigCargo} onChange={e => setOfData(d => ({ ...d, sigCargo: e.target.value }))} />
                  </SdField>
                  <SdField label="Instituição (linha da assinatura)" className="col-span-3">
                    <Input value={ofData.sigInst}  onChange={e => setOfData(d => ({ ...d, sigInst:  e.target.value }))} />
                  </SdField>
                </div>
              </SdCard>

              <div className="flex justify-end gap-3 pt-1">
                <Button variant="outline" onClick={() =>
                  setOfData(d => ({ ...d, destNome:'', destCargo:'', destInst:'', assunto:'', intro:'', desenvolvimento:'', conclusao:'', fundamentacao:'' }))}>
                  ↺ Limpar
                </Button>
                <Button onClick={() => handlePreview('oficios')} className="bg-[#008080] hover:bg-[#006060] text-white gap-2">
                  Visualizar Ofício <ArrowLeft size={15} className="rotate-180" />
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="documentos" className="space-y-4">
              {loadingProposals ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 text-[#6B4C9A] animate-spin" />
                </div>
              ) : (
                <Tabs defaultValue="orcamentos-saved" className="w-full">
                  <TabsList className="grid grid-cols-3 w-full h-10 mb-6 bg-[#6B4C9A]/8 border border-[#D4C8E8]">
                    <TabsTrigger value="contratos-saved"
                      className="gap-1.5 text-[12px] data-[state=active]:bg-[#2A5B46] data-[state=active]:text-white">
                      <FileText size={13} /> Contratos
                      <span className="ml-1 text-[10px] opacity-60">
                        ({savedProposals.filter(p => p.tipo === 'contrato').length})
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="orcamentos-saved"
                      className="gap-1.5 text-[12px] data-[state=active]:bg-[#C86A3B] data-[state=active]:text-white">
                      <DollarSign size={13} /> Orçamentos
                      <span className="ml-1 text-[10px] opacity-60">
                        ({savedProposals.filter(p => p.tipo === 'orcamento').length})
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="oficios-saved"
                      className="gap-1.5 text-[12px] data-[state=active]:bg-[#008080] data-[state=active]:text-white">
                      <MessageSquare size={13} /> Ofícios
                      <span className="ml-1 text-[10px] opacity-60">
                        ({savedProposals.filter(p => p.tipo === 'oficio').length})
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  {(['contratos-saved', 'orcamentos-saved', 'oficios-saved'] as const).map((subtab) => {
                    const tipoMap = { 'contratos-saved': 'contrato', 'orcamentos-saved': 'orcamento', 'oficios-saved': 'oficio' } as const
                    const accentMap = { 'contratos-saved': '#2A5B46', 'orcamentos-saved': '#C86A3B', 'oficios-saved': '#008080' } as const
                    const labelMap = { 'contratos-saved': 'contrato', 'orcamentos-saved': 'orçamento', 'oficios-saved': 'ofício' } as const
                    const tipo = tipoMap[subtab]
                    const accent = accentMap[subtab]
                    const filtrados = savedProposals.filter(p => p.tipo === tipo)
                    const showValor = tipo === 'orcamento'
                    const showValidade = tipo === 'orcamento'
                    return (
                      <TabsContent key={subtab} value={subtab}>
                        <SdCard title={`${tipo === 'contrato' ? 'Contratos' : tipo === 'orcamento' ? 'Orçamentos' : 'Ofícios'} Salvos`}>
                          {filtrados.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400">
                              <Archive size={36} className="opacity-25" />
                              <p className="text-sm font-medium">Nenhum {labelMap[subtab]} salvo ainda.</p>
                              <p className="text-xs text-center">Abra o Preview e clique em <strong>Salvar {tipo === 'contrato' ? 'Contrato' : tipo === 'orcamento' ? 'Orçamento' : 'Ofício'}</strong> para registrar.</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-[#C8DDD5]">
                                    <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Nº / Data</th>
                                    <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">
                                      {tipo === 'contrato' ? 'Título / Contratado' : tipo === 'orcamento' ? 'Título / Cliente' : 'Assunto / Destinatário'}
                                    </th>
                                    {showValor && <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Valor</th>}
                                    {showValidade && <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Validade</th>}
                                    <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Status</th>
                                    <th className="py-2 px-3"></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filtrados.map((p) => (
                                    <tr key={p.id} className="border-b border-[#F0F4F8] hover:bg-[#F0F4F8]/60 transition-colors">
                                      <td className="py-3 px-3">
                                        <div className="font-mono text-[11px] font-semibold" style={{ color: accent }}>{p.numero}</div>
                                        <div className="text-[10px] text-gray-400 mt-0.5">{p.emissao ? fmtDate(p.emissao) : '—'}</div>
                                      </td>
                                      <td className="py-3 px-3">
                                        <div className="font-semibold text-[#1F2937] text-[12px] leading-tight">{p.titulo}</div>
                                        <div className="text-[11px] text-gray-400 mt-0.5">{p.cliNome}</div>
                                        {p.cliEmail && <div className="text-[10px] text-gray-400">{p.cliEmail}</div>}
                                      </td>
                                      {showValor && (
                                        <td className="py-3 px-3 font-semibold text-[#2A5B46] whitespace-nowrap text-[12px]">
                                          {p.valorTotal || '—'}
                                        </td>
                                      )}
                                      {showValidade && (
                                        <td className="py-3 px-3 text-[11px] text-gray-500 whitespace-nowrap">
                                          {p.validade ? fmtDate(p.validade) : '—'}
                                        </td>
                                      )}
                                      <td className="py-3 px-3">
                                        <Select
                                          value={p.status ?? 'enviada'}
                                          onValueChange={(val) => updateStatusMutation.mutate({ id: p.id, status: val as ProposalStatus })}
                                        >
                                          <SelectTrigger className="h-7 text-[11px] w-36 border-[#C8DDD5]">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="enviada">
                                              <span className="flex items-center gap-1.5"><Clock size={11} className="text-[#FBBF24]" />
                                                {tipo === 'contrato' ? 'Enviado' : tipo === 'oficio' ? 'Enviado' : 'Enviada'}
                                              </span>
                                            </SelectItem>
                                            <SelectItem value="em_negociacao">
                                              <span className="flex items-center gap-1.5"><RefreshCw size={11} className="text-blue-500" />
                                                {tipo === 'contrato' ? 'Em Análise' : tipo === 'oficio' ? 'Em Andamento' : 'Em Negociação'}
                                              </span>
                                            </SelectItem>
                                            <SelectItem value="aprovada">
                                              <span className="flex items-center gap-1.5"><CheckCircle size={11} className="text-green-600" />
                                                {tipo === 'contrato' ? 'Assinado' : tipo === 'oficio' ? 'Respondido' : 'Aprovada'}
                                              </span>
                                            </SelectItem>
                                            <SelectItem value="rejeitada">
                                              <span className="flex items-center gap-1.5"><XCircle size={11} className="text-red-500" />
                                                {tipo === 'contrato' ? 'Cancelado' : tipo === 'oficio' ? 'Arquivado' : 'Rejeitada'}
                                              </span>
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </td>
                                      <td className="py-3 px-3">
                                        <button
                                          className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
                                          onClick={() => {
                                            if (confirm(`Excluir ${labelMap[subtab]} ${p.numero}?`)) deleteProposalMutation.mutate(p.id)
                                          }}
                                          title={`Excluir ${labelMap[subtab]}`}
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className="mt-4 text-right text-[11px] text-gray-400">
                                {filtrados.length} {labelMap[subtab]}{filtrados.length !== 1 ? 's' : ''} registrado{filtrados.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                          )}
                        </SdCard>
                      </TabsContent>
                    )
                  })}
                </Tabs>
              )}
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  )
}

function SdCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#C8DDD5] p-7 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-4 rounded-sm bg-gradient-to-b from-[#2A5B46] to-[#008080] flex-shrink-0" />
        <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#1F2937]">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function SdField({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[10px] font-bold uppercase tracking-wide text-[#4A7260]">{label}</label>
      {children}
    </div>
  )
}

function DashedAdd({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 w-full mt-2 border-2 border-dashed border-gray-300 hover:border-[#2A5B46] rounded-xl py-3 px-4 text-sm font-semibold text-gray-500 hover:text-[#2A5B46] hover:bg-[#F0F4F8] transition-all">
      <Plus size={16} /> {label}
    </button>
  )
}

function TotalRow({ label, value, color = 'text-gray-700' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex gap-6 text-sm text-[#4A7260] w-full justify-end">
      <span className="w-36 text-right">{label}:</span>
      <span className={`w-32 text-right font-semibold ${color}`}>{value}</span>
    </div>
  )
}
