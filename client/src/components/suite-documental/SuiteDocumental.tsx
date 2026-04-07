import { useState, useRef, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { useAuth } from '@/contexts/auth-context'
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
  CheckCircle, XCircle, Clock, RefreshCw, FolderOpen, BarChart2,
  Upload, ImagePlus, ChevronUp, ChevronDown, AlignLeft, Image as ImageIcon, Table,
  Eye, Mail, Send, PenTool, Link2, Shield, FileCheck, UserPlus, Users, Handshake, Ban, CalendarDays,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Proposal, ProposalStatus, Signatario, Delegacao, SignatarioRole, PoderDelegavel } from '@shared/schema'
import { SIGNATARIO_ROLES, PODERES_DELEGAVEIS } from '@shared/schema'
import './suite.css'

interface Clause  { id: string; title: string; body: string }
interface Sig     { id: string; name: string; role: string }
interface OrcItem { id: string; desc: string; qty: number; unit: number }

interface BlocoTexto  { id: string; tipo: 'texto';  titulo: string; corpo: string }
interface BlocoImagem { id: string; tipo: 'imagem'; url: string;   caption: string }
interface BlocoTabela { id: string; tipo: 'tabela'; titulo: string; cabecalho: boolean; linhas: string[][] }
type BlocoRelatorio = BlocoTexto | BlocoImagem | BlocoTabela

interface RelatorioData {
  titulo: string
  responsavel: string
  cargo: string
  instituicao: string
  parceiro: string
  periodo: string
  dataEncerramento: string
  blocos: BlocoRelatorio[]
}

interface ProjetoData {
  titulo: string
  responsavel: string
  cargo: string
  organizacao: string
  parceiro: string
  valorEstimado: string
  prazoExecucao: string
  blocos: BlocoRelatorio[]
}

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

function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1
        const canvas = document.createElement('canvas')
        canvas.width  = Math.round(img.width  * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('canvas context unavailable'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

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
  const { adminToken } = useAuth()

  const adminFetch = useCallback(async (method: string, url: string, data?: unknown): Promise<Response> => {
    const res = await fetch(url, {
      method,
      headers: {
        ...(data ? { 'Content-Type': 'application/json' } : {}),
        ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
    })
    if (!res.ok) {
      const text = (await res.text()) || res.statusText
      throw new Error(`${res.status}: ${text}`)
    }
    return res
  }, [adminToken])

  const [activeTab, setActiveTab] = useState('contratos')
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null)
  const [savingDraft, setSavingDraft] = useState(false)

  const [preview,       setPreview]       = useState<PreviewType | null>(null)
  const [paginating,    setPaginating]    = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [loadingText,      setLoadingText]      = useState('')
  const [savingProposal,   setSavingProposal]   = useState(false)
  const [salvandoRelatorio, setSalvandoRelatorio] = useState(false)
  const [relatorioSalvo,    setRelatorioSalvo]    = useState(false)

  const [formData, setFormData] = useState<RelatorioData>({
    titulo: '',
    responsavel: '',
    cargo: '',
    instituicao: 'INSTITUTO DE DESENVOLVIMENTO AMBIENTAL E SOCIAL DA AMAZÔNIA — IDASAM',
    parceiro: '',
    periodo: '',
    dataEncerramento: '',
    blocos: [
      { id: uid(), tipo: 'texto', titulo: '1. Apresentação', corpo: '' },
      { id: uid(), tipo: 'texto', titulo: '2. Identificação do Projeto', corpo: '' },
    ],
  })
  const [pdfUrl, setPdfUrl]                   = useState<string | null>(null)
  const [pdfBase64Cache, setPdfBase64Cache]   = useState<string | null>(null)
  const [generatingRelatorio, setGeneratingRelatorio] = useState(false)
  const [relView, setRelView]                 = useState<'form' | 'preview'>('form')

  const [projData, setProjData] = useState<ProjetoData>({
    titulo: '',
    responsavel: '',
    cargo: '',
    organizacao: 'INSTITUTO DE DESENVOLVIMENTO AMBIENTAL E SOCIAL DA AMAZÔNIA — IDASAM',
    parceiro: '',
    valorEstimado: '',
    prazoExecucao: '',
    blocos: [
      { id: uid(), tipo: 'texto', titulo: '1. Resumo Executivo', corpo: '' },
      { id: uid(), tipo: 'texto', titulo: '2. Justificativa', corpo: '' },
      { id: uid(), tipo: 'texto', titulo: '3. Objetivo Geral', corpo: '' },
    ],
  })
  const [projPdfUrl, setProjPdfUrl]               = useState<string | null>(null)
  const [projPdfBase64Cache, setProjPdfBase64Cache] = useState<string | null>(null)
  const [generatingProjeto, setGeneratingProjeto] = useState(false)
  const [salvandoProjeto, setSalvandoProjeto]     = useState(false)
  const [projetoSalvo, setProjetoSalvo]           = useState(false)
  const [projView, setProjView]                   = useState<'form' | 'preview'>('form')

  const handleFormChange = (field: keyof Omit<RelatorioData, 'blocos'>, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  const addBlocoTexto = () =>
    setFormData(prev => ({
      ...prev,
      blocos: [...prev.blocos, { id: uid(), tipo: 'texto', titulo: '', corpo: '' }],
    }))

  const addBlocoImagem = async (files: FileList | null) => {
    if (!files) return
    const imgs = await Promise.all(
      Array.from(files)
        .filter(f => f.type.startsWith('image/'))
        .map(async f => ({ id: uid(), tipo: 'imagem' as const, url: await compressImage(f), caption: '' }))
    )
    if (imgs.length > 0) setFormData(prev => ({ ...prev, blocos: [...prev.blocos, ...imgs] }))
  }

  const removeBloco = (id: string) =>
    setFormData(prev => ({ ...prev, blocos: prev.blocos.filter(b => b.id !== id) }))

  const updateBlocoField = (id: string, field: string, value: string) =>
    setFormData(prev => ({
      ...prev,
      blocos: prev.blocos.map(b => b.id === id ? { ...b, [field]: value } as BlocoRelatorio : b),
    }))

  const moveBloco = (id: string, dir: 'up' | 'down') =>
    setFormData(prev => {
      const idx = prev.blocos.findIndex(b => b.id === id)
      if (idx === -1) return prev
      const newIdx = dir === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= prev.blocos.length) return prev
      const blocos = [...prev.blocos];
      [blocos[idx], blocos[newIdx]] = [blocos[newIdx], blocos[idx]]
      return { ...prev, blocos }
    })

  const addBlocoTabela = () =>
    setFormData(prev => ({
      ...prev,
      blocos: [...prev.blocos, {
        id: uid(), tipo: 'tabela', titulo: '', cabecalho: true,
        linhas: [['', '', ''], ['', '', ''], ['', '', '']],
      }],
    }))

  const updateTabelaCell = (id: string, row: number, col: number, value: string) =>
    setFormData(prev => ({
      ...prev,
      blocos: prev.blocos.map(b => {
        if (b.id !== id || b.tipo !== 'tabela') return b
        const linhas = b.linhas.map((r, ri) => ri === row ? r.map((c, ci) => ci === col ? value : c) : r)
        return { ...b, linhas }
      }),
    }))

  const addTabelaLinha = (id: string) =>
    setFormData(prev => ({
      ...prev,
      blocos: prev.blocos.map(b => {
        if (b.id !== id || b.tipo !== 'tabela') return b
        const cols = b.linhas[0]?.length ?? 3
        return { ...b, linhas: [...b.linhas, Array(cols).fill('')] }
      }),
    }))

  const removeTabelaLinha = (id: string) =>
    setFormData(prev => ({
      ...prev,
      blocos: prev.blocos.map(b => {
        if (b.id !== id || b.tipo !== 'tabela' || b.linhas.length <= 1) return b
        return { ...b, linhas: b.linhas.slice(0, -1) }
      }),
    }))

  const addTabelaColuna = (id: string) =>
    setFormData(prev => ({
      ...prev,
      blocos: prev.blocos.map(b => {
        if (b.id !== id || b.tipo !== 'tabela') return b
        return { ...b, linhas: b.linhas.map(r => [...r, '']) }
      }),
    }))

  const removeTabelaColuna = (id: string) =>
    setFormData(prev => ({
      ...prev,
      blocos: prev.blocos.map(b => {
        if (b.id !== id || b.tipo !== 'tabela' || (b.linhas[0]?.length ?? 0) <= 1) return b
        return { ...b, linhas: b.linhas.map(r => r.slice(0, -1)) }
      }),
    }))

  const toggleTabelaCabecalho = (id: string) =>
    setFormData(prev => ({
      ...prev,
      blocos: prev.blocos.map(b => b.id === id && b.tipo === 'tabela' ? { ...b, cabecalho: !b.cabecalho } : b),
    }))

  function buildRelatorioHTML(): string {
    let h = ''
    h += `<div style="background:#F0F7F4;border-left:4px solid #2A5B46;padding:18px 22px;margin-bottom:28px;border-radius:0 6px 6px 0;">`
    h += `<div style="font-family:'Rajdhani',sans-serif;font-size:9px;font-weight:700;color:#6B7280;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">RELATÓRIO FINAL DE EXECUÇÃO</div>`
    h += `<div style="font-family:'Georgia',serif;font-size:18px;font-style:italic;font-weight:700;color:#2A5B46;margin-bottom:14px;line-height:1.3;">${formData.titulo || 'Relatório IDASAM'}</div>`
    if (formData.instituicao)      h += `<div style="display:flex;margin-bottom:4px;font-size:11px;font-family:'Inter',sans-serif;"><span style="font-weight:700;color:#4A7260;min-width:165px;">Instituição executora:</span><span style="color:#374151;">${formData.instituicao}</span></div>`
    if (formData.parceiro)         h += `<div style="display:flex;margin-bottom:4px;font-size:11px;font-family:'Inter',sans-serif;"><span style="font-weight:700;color:#4A7260;min-width:165px;">Empresa parceira:</span><span style="color:#374151;">${formData.parceiro}</span></div>`
    if (formData.periodo)          h += `<div style="display:flex;margin-bottom:4px;font-size:11px;font-family:'Inter',sans-serif;"><span style="font-weight:700;color:#4A7260;min-width:165px;">Período reportado:</span><span style="color:#374151;">${formData.periodo}</span></div>`
    if (formData.dataEncerramento) h += `<div style="display:flex;margin-bottom:4px;font-size:11px;font-family:'Inter',sans-serif;"><span style="font-weight:700;color:#4A7260;min-width:165px;">Data de encerramento:</span><span style="color:#374151;">${fmtDate(formData.dataEncerramento)}</span></div>`
    if (formData.responsavel || formData.cargo) {
      h += `<div style="margin-top:10px;padding-top:10px;border-top:1px solid #C8DDD5;display:flex;align-items:baseline;gap:6px;font-size:11px;font-family:'Inter',sans-serif;">`
      if (formData.responsavel) h += `<span style="font-weight:700;color:#2A5B46;font-size:12px;">${formData.responsavel}</span>`
      if (formData.cargo)       h += `<span style="color:#4A7260;">— ${formData.cargo}</span>`
      h += `</div>`
    }
    h += `</div>`
    for (const bloco of formData.blocos) {
      if (bloco.tipo === 'texto') {
        if (bloco.titulo) h += `<h3>${bloco.titulo}</h3>`
        if (bloco.corpo)  bloco.corpo.split('\n').forEach(l => { const t = l.trim(); if (t) h += `<p>${t}</p>` })
      } else if (bloco.tipo === 'tabela') {
        if (bloco.titulo) h += `<h3>${bloco.titulo}</h3>`
        h += `<div style="margin:12px 0 20px 0;overflow-x:auto;">`
        h += `<table style="width:100%;border-collapse:collapse;font-size:11px;font-family:'Inter',sans-serif;">`
        bloco.linhas.forEach((row, ri) => {
          const isHeader = bloco.cabecalho && ri === 0
          const tag = isHeader ? 'th' : 'td'
          const rowBg = isHeader ? '#2A5B46' : ri % 2 === 0 ? '#F0F7F4' : '#ffffff'
          const color = isHeader ? '#ffffff' : '#374151'
          const fontWeight = isHeader ? '700' : '400'
          h += `<tr>`
          row.forEach(cell => {
            h += `<${tag} style="border:1px solid #C8DDD5;padding:7px 10px;text-align:left;background:${rowBg};color:${color};font-weight:${fontWeight};">${cell}</${tag}>`
          })
          h += `</tr>`
        })
        h += `</table></div>`
      } else {
        h += `<div style="margin:16px 0;text-align:center;">`
        h += `<img src="${bloco.url}" style="max-width:100%;max-height:380px;object-fit:contain;border-radius:4px;display:block;margin:0 auto;" crossorigin="anonymous">`
        if (bloco.caption) h += `<p style="font-family:'Inter',sans-serif;font-size:10.5px;color:#6B7280;font-style:italic;margin-top:6px;text-align:center;">${bloco.caption}</p>`
        h += `</div>`
      }
    }
    return h
  }

  const handleGerarRelatorio = async () => {
    if (!relPagesRef.current) return
    setGeneratingRelatorio(true)
    setLoadingText('Paginando conteúdo...')
    try {
      const source = document.createElement('div')
      source.innerHTML = buildRelatorioHTML()
      await autoPaginate(source, relPagesRef.current, 'Relatório IDASAM')

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const W = 794, H = 1123
      const jspdfDoc = new jsPDF({ unit: 'px', format: [W, H], orientation: 'portrait' })
      const pages = relPagesRef.current.querySelectorAll('.sd-page-a4')

      const whiteLogoUrl = await buildWhiteLogoDataUrl()
      const allLogos     = Array.from(relPagesRef.current.querySelectorAll('.sd-logo-img')) as HTMLImageElement[]
      const savedSrcs    = allLogos.map(img => img.src)
      const savedFilters = allLogos.map(img => img.style.filter)
      allLogos.forEach(img => { img.src = whiteLogoUrl; img.style.filter = 'none' })
      await Promise.all(allLogos.map(img =>
        img.complete ? Promise.resolve() : new Promise<void>(r => { img.onload = () => r() })
      ))
      await new Promise(r => requestAnimationFrame(r))

      for (let i = 0; i < pages.length; i++) {
        setLoadingText(`Renderizando página ${i + 1} de ${pages.length}...`)
        const canvas = await html2canvas(pages[i] as HTMLElement, {
          scale: 2, useCORS: true, logging: false, width: W, height: H, windowWidth: W,
        })
        if (i > 0) jspdfDoc.addPage([W, H], 'portrait')
        jspdfDoc.addImage(canvas.toDataURL('image/jpeg', 0.97), 'JPEG', 0, 0, W, H)
      }

      allLogos.forEach((img, i) => { img.src = savedSrcs[i]; img.style.filter = savedFilters[i] })

      const blob = jspdfDoc.output('blob')
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)

      // Cache base64 para salvar junto com os metadados
      const arrayBuf = await blob.arrayBuffer()
      const base64 = btoa(new Uint8Array(arrayBuf).reduce((d, b) => d + String.fromCharCode(b), ''))
      setPdfBase64Cache(base64)

      setRelatorioSalvo(false)
      setRelView('preview')
    } catch (e) {
      console.error('Erro ao gerar relatório PDF:', e)
      toast({ title: 'Erro ao gerar PDF', description: String(e), variant: 'destructive' })
    } finally {
      setGeneratingRelatorio(false)
      setLoadingText('')
    }
  }

  const handleSalvarRelatorio = async () => {
    if (relatorioSalvo) return
    setSalvandoRelatorio(true)
    try {
      const today = new Date()
      const seq   = today.getTime().toString().slice(-5)
      const year  = today.getFullYear()
      const body = {
        tipo:    'relatorio',
        numero:  `REL-${year}-${seq}`,
        titulo:  formData.titulo || 'Relatório IDASAM',
        cliNome: formData.responsavel || 'IDASAM',
        cliEmail: formData.cargo || null,
        emissao: today.toISOString().slice(0, 10),
        status:  'enviada' as const,
        dados:   JSON.stringify({ formData }),
        pdfData: pdfBase64Cache,
      }
      if (editingProposalId) {
        await adminFetch('PATCH', `/api/admin/proposals/${editingProposalId}`, body)
        setEditingProposalId(null)
      } else {
        await adminFetch('POST', '/api/admin/proposals', body)
      }
      queryClient.invalidateQueries({ queryKey: ['/api/admin/proposals'] })
      setRelatorioSalvo(true)
      toast({ title: 'Relatório salvo!', description: 'PDF armazenado. Acesse em Documentos Emitidos.' })
    } catch {
      toast({ title: 'Erro ao salvar relatório', variant: 'destructive' })
    } finally {
      setSalvandoRelatorio(false)
    }
  }

  /* ══════════════════════════════════════════════════════════
     PROJETOS — block manipulation helpers
  ══════════════════════════════════════════════════════════ */
  const handleProjFormChange = (field: keyof Omit<ProjetoData, 'blocos'>, value: string) =>
    setProjData(prev => ({ ...prev, [field]: value }))

  const addProjBlocoTexto = () =>
    setProjData(prev => ({
      ...prev,
      blocos: [...prev.blocos, { id: uid(), tipo: 'texto', titulo: '', corpo: '' }],
    }))

  const addProjBlocoImagem = async (files: FileList | null) => {
    if (!files) return
    const imgs = await Promise.all(
      Array.from(files)
        .filter(f => f.type.startsWith('image/'))
        .map(async f => ({ id: uid(), tipo: 'imagem' as const, url: await compressImage(f), caption: '' }))
    )
    if (imgs.length > 0) setProjData(prev => ({ ...prev, blocos: [...prev.blocos, ...imgs] }))
  }

  const removeProjBloco = (id: string) =>
    setProjData(prev => ({ ...prev, blocos: prev.blocos.filter(b => b.id !== id) }))

  const updateProjBlocoField = (id: string, field: string, value: string) =>
    setProjData(prev => ({
      ...prev,
      blocos: prev.blocos.map(b => b.id === id ? { ...b, [field]: value } as BlocoRelatorio : b),
    }))

  const moveProjBloco = (id: string, dir: 'up' | 'down') =>
    setProjData(prev => {
      const idx = prev.blocos.findIndex(b => b.id === id)
      if (idx === -1) return prev
      const newIdx = dir === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= prev.blocos.length) return prev
      const blocos = [...prev.blocos];
      [blocos[idx], blocos[newIdx]] = [blocos[newIdx], blocos[idx]]
      return { ...prev, blocos }
    })

  const addProjBlocoTabela = () =>
    setProjData(prev => ({
      ...prev,
      blocos: [...prev.blocos, {
        id: uid(), tipo: 'tabela', titulo: '', cabecalho: true,
        linhas: [['', '', ''], ['', '', ''], ['', '', '']],
      }],
    }))

  const updateProjTabelaCell = (id: string, row: number, col: number, value: string) =>
    setProjData(prev => ({
      ...prev,
      blocos: prev.blocos.map(b => {
        if (b.id !== id || b.tipo !== 'tabela') return b
        const linhas = b.linhas.map((r, ri) => ri === row ? r.map((c, ci) => ci === col ? value : c) : r)
        return { ...b, linhas }
      }),
    }))

  const addProjTabelaLinha = (id: string) =>
    setProjData(prev => ({
      ...prev,
      blocos: prev.blocos.map(b => {
        if (b.id !== id || b.tipo !== 'tabela') return b
        const cols = b.linhas[0]?.length ?? 3
        return { ...b, linhas: [...b.linhas, Array(cols).fill('')] }
      }),
    }))

  const removeProjTabelaLinha = (id: string) =>
    setProjData(prev => ({
      ...prev,
      blocos: prev.blocos.map(b => {
        if (b.id !== id || b.tipo !== 'tabela' || b.linhas.length <= 1) return b
        return { ...b, linhas: b.linhas.slice(0, -1) }
      }),
    }))

  const addProjTabelaColuna = (id: string) =>
    setProjData(prev => ({
      ...prev,
      blocos: prev.blocos.map(b => {
        if (b.id !== id || b.tipo !== 'tabela') return b
        return { ...b, linhas: b.linhas.map(r => [...r, '']) }
      }),
    }))

  const removeProjTabelaColuna = (id: string) =>
    setProjData(prev => ({
      ...prev,
      blocos: prev.blocos.map(b => {
        if (b.id !== id || b.tipo !== 'tabela' || (b.linhas[0]?.length ?? 0) <= 1) return b
        return { ...b, linhas: b.linhas.map(r => r.slice(0, -1)) }
      }),
    }))

  const toggleProjTabelaCabecalho = (id: string) =>
    setProjData(prev => ({
      ...prev,
      blocos: prev.blocos.map(b => b.id === id && b.tipo === 'tabela' ? { ...b, cabecalho: !b.cabecalho } : b),
    }))

  function buildProjetoHTML(): string {
    let h = ''
    h += `<div style="background:#DBEAFE;border-left:4px solid #1E40AF;padding:18px 22px;margin-bottom:28px;border-radius:0 6px 6px 0;">`
    h += `<div style="font-family:'Rajdhani',sans-serif;font-size:9px;font-weight:700;color:#1E40AF;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">PROPOSTA DE PROJETO</div>`
    h += `<div style="font-family:'Georgia',serif;font-size:18px;font-style:italic;font-weight:700;color:#1E3A8A;margin-bottom:14px;line-height:1.3;">${projData.titulo || 'Proposta de Projeto IDASAM'}</div>`
    if (projData.organizacao)   h += `<div style="display:flex;margin-bottom:4px;font-size:11px;font-family:'Inter',sans-serif;"><span style="font-weight:700;color:#1E40AF;min-width:165px;">Organização proponente:</span><span style="color:#374151;">${projData.organizacao}</span></div>`
    if (projData.parceiro)      h += `<div style="display:flex;margin-bottom:4px;font-size:11px;font-family:'Inter',sans-serif;"><span style="font-weight:700;color:#1E40AF;min-width:165px;">Parceiro / Financiador:</span><span style="color:#374151;">${projData.parceiro}</span></div>`
    if (projData.valorEstimado) h += `<div style="display:flex;margin-bottom:4px;font-size:11px;font-family:'Inter',sans-serif;"><span style="font-weight:700;color:#1E40AF;min-width:165px;">Valor estimado:</span><span style="color:#374151;">${projData.valorEstimado}</span></div>`
    if (projData.prazoExecucao) h += `<div style="display:flex;margin-bottom:4px;font-size:11px;font-family:'Inter',sans-serif;"><span style="font-weight:700;color:#1E40AF;min-width:165px;">Prazo de execução:</span><span style="color:#374151;">${fmtDate(projData.prazoExecucao)}</span></div>`
    if (projData.responsavel || projData.cargo) {
      h += `<div style="margin-top:10px;padding-top:10px;border-top:1px solid #BFDBFE;display:flex;align-items:baseline;gap:6px;font-size:11px;font-family:'Inter',sans-serif;">`
      if (projData.responsavel) h += `<span style="font-weight:700;color:#1E3A8A;font-size:12px;">${projData.responsavel}</span>`
      if (projData.cargo)       h += `<span style="color:#1E40AF;">— ${projData.cargo}</span>`
      h += `</div>`
    }
    h += `</div>`
    for (const bloco of projData.blocos) {
      if (bloco.tipo === 'texto') {
        if (bloco.titulo) h += `<h3>${bloco.titulo}</h3>`
        if (bloco.corpo)  bloco.corpo.split('\n').forEach(l => { const t = l.trim(); if (t) h += `<p>${t}</p>` })
      } else if (bloco.tipo === 'tabela') {
        if (bloco.titulo) h += `<h3>${bloco.titulo}</h3>`
        h += `<div style="margin:12px 0 20px 0;overflow-x:auto;">`
        h += `<table style="width:100%;border-collapse:collapse;font-size:11px;font-family:'Inter',sans-serif;">`
        bloco.linhas.forEach((row, ri) => {
          const isHeader = bloco.cabecalho && ri === 0
          const tag = isHeader ? 'th' : 'td'
          const rowBg = isHeader ? '#1E40AF' : ri % 2 === 0 ? '#DBEAFE' : '#ffffff'
          const color = isHeader ? '#ffffff' : '#374151'
          const fontWeight = isHeader ? '700' : '400'
          h += `<tr>`
          row.forEach(cell => {
            h += `<${tag} style="border:1px solid #BFDBFE;padding:7px 10px;text-align:left;background:${rowBg};color:${color};font-weight:${fontWeight};">${cell}</${tag}>`
          })
          h += `</tr>`
        })
        h += `</table></div>`
      } else {
        h += `<div style="margin:16px 0;text-align:center;">`
        h += `<img src="${bloco.url}" style="max-width:100%;max-height:380px;object-fit:contain;border-radius:4px;display:block;margin:0 auto;" crossorigin="anonymous">`
        if (bloco.caption) h += `<p style="font-family:'Inter',sans-serif;font-size:10.5px;color:#6B7280;font-style:italic;margin-top:6px;text-align:center;">${bloco.caption}</p>`
        h += `</div>`
      }
    }
    return h
  }

  const handleGerarProjeto = async () => {
    if (!projPagesRef.current) return
    setGeneratingProjeto(true)
    setLoadingText('Paginando conteúdo...')
    try {
      const source = document.createElement('div')
      source.innerHTML = buildProjetoHTML()
      await autoPaginate(source, projPagesRef.current, 'Proposta de Projeto IDASAM')

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const W = 794, H = 1123
      const jspdfDoc = new jsPDF({ unit: 'px', format: [W, H], orientation: 'portrait' })
      const pages = projPagesRef.current.querySelectorAll('.sd-page-a4')

      const whiteLogoUrl = await buildWhiteLogoDataUrl()
      const allLogos     = Array.from(projPagesRef.current.querySelectorAll('.sd-logo-img')) as HTMLImageElement[]
      const savedSrcs    = allLogos.map(img => img.src)
      const savedFilters = allLogos.map(img => img.style.filter)
      allLogos.forEach(img => { img.src = whiteLogoUrl; img.style.filter = 'none' })
      await Promise.all(allLogos.map(img =>
        img.complete ? Promise.resolve() : new Promise<void>(r => { img.onload = () => r() })
      ))
      await new Promise(r => requestAnimationFrame(r))

      for (let i = 0; i < pages.length; i++) {
        setLoadingText(`Renderizando página ${i + 1} de ${pages.length}...`)
        const canvas = await html2canvas(pages[i] as HTMLElement, {
          scale: 2, useCORS: true, logging: false, width: W, height: H, windowWidth: W,
        })
        if (i > 0) jspdfDoc.addPage([W, H], 'portrait')
        jspdfDoc.addImage(canvas.toDataURL('image/jpeg', 0.97), 'JPEG', 0, 0, W, H)
      }

      allLogos.forEach((img, i) => { img.src = savedSrcs[i]; img.style.filter = savedFilters[i] })

      const blob = jspdfDoc.output('blob')
      if (projPdfUrl) URL.revokeObjectURL(projPdfUrl)
      const url = URL.createObjectURL(blob)
      setProjPdfUrl(url)

      // Cache base64 para salvar junto
      const arrayBuf = await blob.arrayBuffer()
      const base64 = btoa(new Uint8Array(arrayBuf).reduce((d, b) => d + String.fromCharCode(b), ''))
      setProjPdfBase64Cache(base64)

      setProjetoSalvo(false)
      setProjView('preview')
    } catch (e) {
      console.error('Erro ao gerar proposta de projeto PDF:', e)
      toast({ title: 'Erro ao gerar PDF', description: String(e), variant: 'destructive' })
    } finally {
      setGeneratingProjeto(false)
      setLoadingText('')
    }
  }

  const handleSalvarProjeto = async () => {
    if (projetoSalvo) return
    setSalvandoProjeto(true)
    try {
      const today = new Date()
      const seq   = today.getTime().toString().slice(-5)
      const year  = today.getFullYear()
      const body = {
        tipo:    'projeto',
        numero:  `PRJ-${year}-${seq}`,
        titulo:  projData.titulo || 'Proposta de Projeto IDASAM',
        cliNome: projData.organizacao || 'IDASAM',
        cliEmail: projData.responsavel || null,
        emissao: today.toISOString().slice(0, 10),
        status:  'enviada' as const,
        dados:   JSON.stringify({ projData }),
        pdfData: projPdfBase64Cache,
      }
      if (editingProposalId) {
        await adminFetch('PATCH', `/api/admin/proposals/${editingProposalId}`, body)
        setEditingProposalId(null)
      } else {
        await adminFetch('POST', '/api/admin/proposals', body)
      }
      queryClient.invalidateQueries({ queryKey: ['/api/admin/proposals'] })
      setProjetoSalvo(true)
      toast({ title: 'Proposta salva!', description: 'PDF armazenado. Acesse em Documentos Emitidos.' })
    } catch {
      toast({ title: 'Erro ao salvar proposta', variant: 'destructive' })
    } finally {
      setSalvandoProjeto(false)
    }
  }

  const { data: savedProposals = [], isLoading: loadingProposals } = useQuery<Proposal[]>({
    queryKey: ['/api/admin/proposals'],
    queryFn: async () => {
      const res = await adminFetch('GET', '/api/admin/proposals')
      return res.json()
    },
    enabled: !!adminToken,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProposalStatus }) =>
      adminFetch('PATCH', `/api/admin/proposals/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/proposals'] })
      toast({ title: 'Status atualizado com sucesso' })
    },
    onError: () => toast({ title: 'Erro ao atualizar status', variant: 'destructive' }),
  })

  const deleteProposalMutation = useMutation({
    mutationFn: (id: string) => adminFetch('DELETE', `/api/admin/proposals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/proposals'] })
      toast({ title: 'Proposta excluída' })
    },
    onError: () => toast({ title: 'Erro ao excluir proposta', variant: 'destructive' }),
  })

  // ── Documentos Emitidos — Preview, Download, Email ──
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)
  const [previewNumPages, setPreviewNumPages] = useState(0)
  const [emailModal, setEmailModal] = useState<{ id: string; numero: string; cliEmail: string | null } | null>(null)
  const [emailTo, setEmailTo] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)

  const handlePreviewPdf = async (proposalId: string) => {
    try {
      const res = await adminFetch('GET', `/api/admin/proposals/${proposalId}/pdf`)
      const rawBlob = await res.blob()
      // Forçar tipo MIME para que o iframe renderize como PDF
      const pdfBlob = new Blob([rawBlob], { type: 'application/pdf' })
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl)
      const url = URL.createObjectURL(pdfBlob)
      setPreviewPdfUrl(url)
    } catch {
      toast({ title: 'PDF não disponível', description: 'Este documento não possui PDF salvo.', variant: 'destructive' })
    }
  }

  const handleDownloadPdf = async (proposal: Proposal) => {
    try {
      // Priorizar versão assinada, fallback para original
      const hasSigned = proposal.pdfAssinado === 'has_pdf_assinado'
      const endpoint = hasSigned
        ? `/api/admin/proposals/${proposal.id}/signed-pdf`
        : `/api/admin/proposals/${proposal.id}/pdf`
      const suffix = hasSigned ? '_assinado' : ''
      const res = await adminFetch('GET', endpoint)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${proposal.tipo}_${proposal.numero.replace(/\//g, '-')}${suffix}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast({ title: 'PDF não disponível', description: 'Este documento não possui PDF salvo.', variant: 'destructive' })
    }
  }

  const handleOpenEmailModal = (p: Proposal) => {
    const tipoLabel = p.tipo === 'contrato' ? 'Contrato' : p.tipo === 'orcamento' ? 'Orçamento' : p.tipo === 'oficio' ? 'Ofício' : p.tipo === 'relatorio' ? 'Relatório' : 'Proposta de Projeto'
    setEmailTo(p.cliEmail || '')
    setEmailSubject(`${tipoLabel} ${p.numero} — IDASAM`)
    setEmailMessage(`Prezado(a),\n\nSegue em anexo o documento ${tipoLabel} nº ${p.numero} — ${p.titulo}.\n\nAtenciosamente,\nIDASSAM`)
    setEmailModal({ id: p.id, numero: p.numero, cliEmail: p.cliEmail })
  }

  const handleSendEmail = async () => {
    if (!emailModal || !emailTo.trim()) return
    setSendingEmail(true)
    try {
      await adminFetch('POST', `/api/admin/proposals/${emailModal.id}/email`, {
        to: emailTo.trim(),
        subject: emailSubject,
        message: emailMessage,
      })
      queryClient.invalidateQueries({ queryKey: ['/api/admin/proposals'] })
      toast({ title: 'E-mail enviado com sucesso!', description: `Documento enviado para ${emailTo}` })
      setEmailModal(null)
    } catch {
      toast({ title: 'Erro ao enviar e-mail', variant: 'destructive' })
    } finally {
      setSendingEmail(false)
    }
  }

  // ── Upload de PDF assinado ──
  const [uploadingSignedPdf, setUploadingSignedPdf] = useState<string | null>(null)
  const signedFileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadSignedPdf = async (proposalId: string, file: File) => {
    if (file.type !== 'application/pdf') {
      toast({ title: 'Apenas PDFs são aceitos', variant: 'destructive' })
      return
    }
    setUploadingSignedPdf(proposalId)
    try {
      const arrayBuf = await file.arrayBuffer()
      const base64 = btoa(new Uint8Array(arrayBuf).reduce((d, b) => d + String.fromCharCode(b), ''))
      await adminFetch('PATCH', `/api/admin/proposals/${proposalId}/signed-pdf`, { pdfAssinado: base64 })
      queryClient.invalidateQueries({ queryKey: ['/api/admin/proposals'] })
      toast({ title: 'PDF assinado salvo!', description: 'Documento atualizado com a versão assinada.' })
    } catch {
      toast({ title: 'Erro ao enviar PDF assinado', variant: 'destructive' })
    } finally {
      setUploadingSignedPdf(null)
    }
  }

  const handlePreviewSignedPdf = async (proposalId: string) => {
    try {
      const res = await adminFetch('GET', `/api/admin/proposals/${proposalId}/signed-pdf`)
      const rawBlob = await res.blob()
      const pdfBlob = new Blob([rawBlob], { type: 'application/pdf' })
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl)
      const url = URL.createObjectURL(pdfBlob)
      setPreviewPdfUrl(url)
    } catch {
      toast({ title: 'PDF assinado não disponível', variant: 'destructive' })
    }
  }

  // ── Signatários ──
  const { data: signatariosList = [] } = useQuery<Signatario[]>({
    queryKey: ['/api/admin/signatarios'],
    queryFn: async () => { const r = await adminFetch('GET', '/api/admin/signatarios'); return r.json() },
    enabled: !!adminToken,
  })
  const [novoSig, setNovoSig] = useState({ nome: '', cargo: '', email: '', role: 'outro' as SignatarioRole })
  const createSigMutation = useMutation({
    mutationFn: (data: typeof novoSig) => adminFetch('POST', '/api/admin/signatarios', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/admin/signatarios'] }); setNovoSig({ nome: '', cargo: '', email: '', role: 'outro' }); toast({ title: 'Signatário cadastrado' }) },
    onError: () => toast({ title: 'Erro ao cadastrar', variant: 'destructive' }),
  })
  const deleteSigMutation = useMutation({
    mutationFn: (id: string) => adminFetch('DELETE', `/api/admin/signatarios/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/admin/signatarios'] }); toast({ title: 'Signatário excluído' }) },
    onError: () => toast({ title: 'Erro ao excluir', variant: 'destructive' }),
  })

  // ── Delegações de Poderes ──
  const { data: delegacoesList = [] } = useQuery<Delegacao[]>({
    queryKey: ['/api/admin/delegacoes'],
    queryFn: async () => { const r = await adminFetch('GET', '/api/admin/delegacoes'); return r.json() },
    enabled: !!adminToken,
  })
  const [showDelegacaoModal, setShowDelegacaoModal] = useState(false)
  const [novaDelegacao, setNovaDelegacao] = useState({
    delegadoId: '',
    motivo: '',
    poderes: [] as string[],
    validaDe: '',
    validaAte: '',
  })
  const [creatingDelegacao, setCreatingDelegacao] = useState(false)

  const ROLE_LABELS: Record<string, string> = {
    presidente: 'Presidente',
    vice_presidente: 'Vice-Presidente',
    diretor_administrativo: 'Diretor Administrativo',
    outro: 'Outro',
  }
  const PODER_LABELS: Record<string, string> = {
    assinar_contratos: 'Assinar contratos e convênios',
    assinar_orcamentos: 'Assinar orçamentos',
    assinar_oficios: 'Assinar ofícios',
    assinar_relatorios: 'Assinar relatórios',
    assinar_projetos: 'Assinar projetos',
  }

  const presidenteSig = signatariosList.find(s => s.role === 'presidente' && s.ativo === 'true')

  const handleCreateDelegacao = async () => {
    if (!presidenteSig || !novaDelegacao.delegadoId || !novaDelegacao.motivo || !novaDelegacao.validaDe || !novaDelegacao.validaAte || novaDelegacao.poderes.length === 0) return
    setCreatingDelegacao(true)
    try {
      // 1. Criar delegação no backend
      const res = await adminFetch('POST', '/api/admin/delegacoes', {
        deleganteId: presidenteSig.id,
        delegadoId: novaDelegacao.delegadoId,
        motivo: novaDelegacao.motivo,
        poderes: novaDelegacao.poderes,
        validaDe: new Date(novaDelegacao.validaDe).toISOString(),
        validaAte: new Date(novaDelegacao.validaAte).toISOString(),
      })
      const delegacao = await res.json()

      // 2. Gerar PDF do Ato de Designação no cliente
      const delegado = signatariosList.find(s => s.id === novaDelegacao.delegadoId)
      if (delegado) {
        const { generateAtoDesignacaoPdf } = await import('@/lib/pdf-ato-designacao')
        const now = new Date()
        const pdfBase64 = await generateAtoDesignacaoPdf({
          numero: delegacao.numero,
          deleganteNome: presidenteSig.nome,
          deleganteCargo: presidenteSig.cargo,
          delegadoNome: delegado.nome,
          delegadoCargo: delegado.cargo,
          motivo: novaDelegacao.motivo,
          poderes: novaDelegacao.poderes,
          validaDe: new Date(novaDelegacao.validaDe).toLocaleDateString('pt-BR'),
          validaAte: new Date(novaDelegacao.validaAte).toLocaleDateString('pt-BR'),
          dataEmissao: now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        })

        // 3. Salvar PDF no backend
        await adminFetch('PATCH', `/api/admin/delegacoes/${delegacao.id}/ato-pdf`, { atoDesignacaoPdf: pdfBase64 })
      }

      queryClient.invalidateQueries({ queryKey: ['/api/admin/delegacoes'] })
      toast({ title: 'Delegação criada!', description: `Ato de Designação nº ${delegacao.numero} gerado.` })
      setShowDelegacaoModal(false)
      setNovaDelegacao({ delegadoId: '', motivo: '', poderes: [], validaDe: '', validaAte: '' })
    } catch (e) {
      console.error('Erro ao criar delegação:', e)
      toast({ title: 'Erro ao criar delegação', variant: 'destructive' })
    } finally {
      setCreatingDelegacao(false)
    }
  }

  const handleRevogaDelegacao = async (id: string) => {
    try {
      await adminFetch('PATCH', `/api/admin/delegacoes/${id}/revogar`)
      queryClient.invalidateQueries({ queryKey: ['/api/admin/delegacoes'] })
      toast({ title: 'Delegação revogada' })
    } catch {
      toast({ title: 'Erro ao revogar', variant: 'destructive' })
    }
  }

  const handleDownloadAto = async (id: string, numero: string) => {
    try {
      const res = await adminFetch('GET', `/api/admin/delegacoes/${id}/ato-pdf`)
      const data = await res.json()
      if (!data.atoDesignacaoPdf) { toast({ title: 'PDF do Ato não disponível', variant: 'destructive' }); return }
      const byteChars = atob(data.atoDesignacaoPdf)
      const byteArray = new Uint8Array(byteChars.length)
      for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `Ato_Designacao_${numero}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast({ title: 'Erro ao baixar Ato', variant: 'destructive' })
    }
  }

  // ── Assinatura Interna ──
  const [signInternalModal, setSignInternalModal] = useState<{ proposalId: string; numero: string; tipo: string; titulo: string } | null>(null)
  const [selectedSignatarioId, setSelectedSignatarioId] = useState('')
  const [signingInternal, setSigningInternal] = useState(false)
  const [sigPoderes, setSigPoderes] = useState<{ podeAssinar: boolean; tipo: string; role: string; delegacao: { id: string; numero: string; poderes: string } | null } | null>(null)
  const [checkingPoderes, setCheckingPoderes] = useState(false)

  const handleSelectSignatario = async (sigId: string) => {
    setSelectedSignatarioId(sigId)
    setSigPoderes(null)
    if (!sigId) return
    setCheckingPoderes(true)
    try {
      const res = await adminFetch('GET', `/api/admin/signatarios/${sigId}/poderes`)
      const data = await res.json()
      setSigPoderes(data)
    } catch {
      setSigPoderes(null)
    } finally {
      setCheckingPoderes(false)
    }
  }

  const handleSignInternal = async () => {
    if (!signInternalModal || !selectedSignatarioId) return
    setSigningInternal(true)
    try {
      // Buscar PDF original
      const pdfRes = await adminFetch('GET', `/api/admin/proposals/${signInternalModal.proposalId}/pdf`)
      const pdfBlob = await pdfRes.blob()
      const pdfBytes = new Uint8Array(await pdfBlob.arrayBuffer())

      // Calcular hash SHA-256 do original
      const hashBuffer = await crypto.subtle.digest('SHA-256', pdfBytes)
      const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

      // Encontrar signatário selecionado
      const sig = signatariosList.find(s => s.id === selectedSignatarioId)
      if (!sig) throw new Error('Signatário não encontrado')

      // Usar pdf-lib + página de autenticação dedicada
      const { PDFDocument } = await import('pdf-lib')
      const { addAuthenticationPage } = await import('@/lib/pdf-auth-page')
      const pdfDoc = await PDFDocument.load(pdfBytes)

      const now = new Date()
      const dateStr = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      const baseUrl = window.location.origin

      await addAuthenticationPage({
        pdfDoc,
        docTipo: signInternalModal.tipo,
        docNumero: signInternalModal.numero,
        docTitulo: signInternalModal.titulo,
        signerName: sig.nome,
        signerCargo: sig.cargo,
        dateStr,
        hashHex,
        validationBaseUrl: baseUrl,
        signatureType: 'internal',
      })

      const signedBytes = await pdfDoc.save()
      const base64 = btoa(new Uint8Array(signedBytes).reduce((d, b) => d + String.fromCharCode(b), ''))

      await adminFetch('POST', `/api/admin/proposals/${signInternalModal.proposalId}/sign-internal`, {
        signatarioId: selectedSignatarioId,
        pdfAssinado: base64,
        documentHash: hashHex,
        delegacaoId: sigPoderes?.delegacao?.id || undefined,
      })
      queryClient.invalidateQueries({ queryKey: ['/api/admin/proposals'] })
      toast({ title: 'Documento assinado com sucesso!', description: `Assinado por ${sig.nome}` })
      setSignInternalModal(null)
      setSelectedSignatarioId('')
    } catch (e) {
      console.error('Erro ao assinar:', e)
      toast({ title: 'Erro ao assinar documento', variant: 'destructive' })
    } finally {
      setSigningInternal(false)
    }
  }

  // ── Assinatura Externa (gerar link) ──
  const [extLinkModal, setExtLinkModal] = useState<{ link: string; expiresAt: string } | null>(null)
  const [requestingExtLink, setRequestingExtLink] = useState<string | null>(null)

  const handleRequestExternalSignature = async (proposalId: string) => {
    setRequestingExtLink(proposalId)
    try {
      const res = await adminFetch('POST', `/api/admin/proposals/${proposalId}/request-external-signature`)
      const data = await res.json()
      setExtLinkModal({ link: data.link, expiresAt: data.expiresAt })
      queryClient.invalidateQueries({ queryKey: ['/api/admin/proposals'] })
      toast({ title: 'Link de assinatura gerado!' })
    } catch {
      toast({ title: 'Erro ao gerar link', variant: 'destructive' })
    } finally {
      setRequestingExtLink(null)
    }
  }

  const contPagesRef = useRef<HTMLDivElement>(null)
  const orcPagesRef  = useRef<HTMLDivElement>(null)
  const ofPagesRef   = useRef<HTMLDivElement>(null)
  const relPagesRef  = useRef<HTMLDivElement>(null)
  const projPagesRef = useRef<HTMLDivElement>(null)

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

  /** Captura as páginas de um ref e retorna { base64, blob } do PDF gerado */
  async function capturePdfFromRef(
    ref: React.RefObject<HTMLDivElement | null>,
    onProgress?: (text: string) => void,
  ): Promise<{ base64: string; blob: Blob } | null> {
    if (!ref.current) return null
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
      await Promise.all(allLogos.map(img =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>(r => { img.onload = () => r() })
      ))
      await new Promise(r => requestAnimationFrame(r))

      for (let i = 0; i < pages.length; i++) {
        onProgress?.(`Renderizando página ${i + 1} de ${pages.length}...`)
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

      const blob = pdf.output('blob')
      const arrayBuf = await blob.arrayBuffer()
      const base64 = btoa(
        new Uint8Array(arrayBuf).reduce((data, byte) => data + String.fromCharCode(byte), '')
      )
      return { base64, blob }
    } finally {
      document.body.classList.remove('sd-exporting')
    }
  }

  async function gerarPDF(tipo: PreviewType) {
    const ref = tipo === 'contratos' ? contPagesRef : tipo === 'orcamentos' ? orcPagesRef : ofPagesRef
    if (!ref.current) return
    setGeneratingPDF(true)
    try {
      const result = await capturePdfFromRef(ref, setLoadingText)
      if (!result) return

      const year = new Date().getFullYear()
      const filename =
        tipo === 'contratos'  ? `Contrato_IDASAM_${cData.ctadoNome.split(' ')[0] || 'Contrato'}_${year}.pdf` :
        tipo === 'orcamentos' ? `Orcamento_IDASAM_${oData.numero}_${oData.cliNome.split(' ')[0] || 'Cliente'}.pdf` :
                                `Oficio_IDASAM_${ofData.numero.replace(/\//g, '-')}_${year}.pdf`

      // Download via blob URL
      const url = URL.createObjectURL(result.blob)
      const a = document.createElement('a')
      a.href = url; a.download = filename; a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      alert('Erro ao gerar o PDF. Veja o console para detalhes.')
    } finally {
      setGeneratingPDF(false)
      setLoadingText('')
    }
  }

  // ── Salvar Rascunho ──
  async function handleSaveDraft(tipo: string) {
    setSavingDraft(true)
    try {
      let body: Record<string, unknown>
      if (tipo === 'contrato') {
        body = {
          tipo: 'contrato', numero: cData.docId, titulo: cData.titulo,
          cliNome: cData.ctadoNome || 'Contratado', emissao: new Date().toISOString().slice(0, 10),
          status: 'rascunho', dados: JSON.stringify({ cData, clauses, sigs, cMode }),
        }
      } else if (tipo === 'orcamento') {
        body = {
          tipo: 'orcamento', numero: oData.numero, titulo: oData.titulo,
          cliNome: oData.cliNome, cliEmail: oData.cliEmail, cliTel: oData.cliTel,
          valorTotal: fmtBRL(totalOrc), emissao: oData.emissao, validade: oData.validade, obs: oData.obs || null,
          status: 'rascunho', dados: JSON.stringify({ oData, oItems }),
        }
      } else if (tipo === 'oficio') {
        body = {
          tipo: 'oficio', numero: ofData.numero, titulo: ofData.assunto || `Ofício nº ${ofData.numero}`,
          cliNome: ofData.destNome || 'Destinatário', emissao: ofData.data,
          status: 'rascunho', dados: JSON.stringify({ ofData }),
        }
      } else if (tipo === 'relatorio') {
        body = {
          tipo: 'relatorio', numero: `REL-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`,
          titulo: formData.titulo || 'Relatório IDASAM', cliNome: formData.responsavel || 'IDASAM',
          emissao: new Date().toISOString().slice(0, 10),
          status: 'rascunho', dados: JSON.stringify({ formData }),
        }
      } else {
        body = {
          tipo: 'projeto', numero: `PRJ-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`,
          titulo: projData.titulo || 'Proposta de Projeto IDASAM', cliNome: projData.organizacao || 'IDASAM',
          emissao: new Date().toISOString().slice(0, 10),
          status: 'rascunho', dados: JSON.stringify({ projData }),
        }
      }

      if (editingProposalId) {
        await adminFetch('PATCH', `/api/admin/proposals/${editingProposalId}`, body)
        toast({ title: 'Rascunho atualizado!' })
      } else {
        const res = await adminFetch('POST', '/api/admin/proposals', body)
        const created = await res.json()
        setEditingProposalId(created.id)
        toast({ title: 'Rascunho salvo!' })
      }
      queryClient.invalidateQueries({ queryKey: ['/api/admin/proposals'] })
    } catch {
      toast({ title: 'Erro ao salvar rascunho', variant: 'destructive' })
    } finally {
      setSavingDraft(false)
    }
  }

  // ── Carregar rascunho para edição ──
  function handleEditDraft(proposal: Proposal) {
    if (!proposal.dados) return
    try {
      const dados = JSON.parse(proposal.dados)
      const tipo = proposal.tipo || 'orcamento'
      setEditingProposalId(proposal.id)

      if (tipo === 'contrato' && dados.cData) {
        setCData(dados.cData)
        if (dados.clauses) setClauses(dados.clauses)
        if (dados.sigs) setSigs(dados.sigs)
        if (dados.cMode) setCMode(dados.cMode)
        setActiveTab('contratos')
      } else if (tipo === 'orcamento' && dados.oData) {
        setOData(dados.oData)
        if (dados.oItems) setOItems(dados.oItems)
        setActiveTab('orcamentos')
      } else if (tipo === 'oficio' && dados.ofData) {
        setOfData(dados.ofData)
        setActiveTab('oficios')
      } else if (tipo === 'relatorio' && dados.formData) {
        setFormData(dados.formData)
        setRelView('form')
        setRelatorioSalvo(false)
        setPdfBase64Cache(null)
        setActiveTab('relatorios')
      } else if (tipo === 'projeto' && dados.projData) {
        setProjData(dados.projData)
        setProjView('form')
        setProjetoSalvo(false)
        setProjPdfBase64Cache(null)
        setActiveTab('projetos')
      }

      toast({ title: 'Rascunho carregado', description: `Editando: ${proposal.titulo}` })
    } catch {
      toast({ title: 'Erro ao carregar rascunho', variant: 'destructive' })
    }
  }

  async function saveCurrentDocument(tipo: PreviewType) {
    setSavingProposal(true)
    try {
      // Gerar PDF base64 a partir do preview renderizado
      const ref = tipo === 'contratos' ? contPagesRef : tipo === 'orcamentos' ? orcPagesRef : ofPagesRef
      setLoadingText('Gerando PDF para salvar...')
      const pdfResult = await capturePdfFromRef(ref, setLoadingText)
      const pdfBase64 = pdfResult?.base64 || null

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
          pdfData:    pdfBase64,
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
          pdfData:    pdfBase64,
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
          pdfData:    pdfBase64,
        }
      }
      if (editingProposalId) {
        await adminFetch('PATCH', `/api/admin/proposals/${editingProposalId}`, body)
        setEditingProposalId(null)
      } else {
        await adminFetch('POST', '/api/admin/proposals', body)
      }
      queryClient.invalidateQueries({ queryKey: ['/api/admin/proposals'] })
      const labels = { contratos: 'Contrato', orcamentos: 'Orçamento', oficios: 'Ofício' }
      toast({ title: `${labels[tipo]} salvo com sucesso!`, description: 'PDF armazenado. Acesse em Documentos Emitidos.' })
    } catch {
      toast({ title: 'Erro ao salvar documento', variant: 'destructive' })
    } finally {
      setSavingProposal(false)
      setLoadingText('')
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap w-full h-auto gap-1 p-1 mb-8 bg-[#2A5B46]/8 border border-[#C8DDD5] rounded-lg">
              <TabsTrigger value="contratos" className="gap-1.5 text-[11px] flex-1 min-w-[100px] data-[state=active]:bg-[#2A5B46] data-[state=active]:text-white">
                <FileText size={13} /> Contratos
              </TabsTrigger>
              <TabsTrigger value="orcamentos" className="gap-1.5 text-[11px] flex-1 min-w-[100px] data-[state=active]:bg-[#C86A3B] data-[state=active]:text-white">
                <DollarSign size={13} /> Orçamentos
              </TabsTrigger>
              <TabsTrigger value="oficios" className="gap-1.5 text-[11px] flex-1 min-w-[80px] data-[state=active]:bg-[#008080] data-[state=active]:text-white">
                <MessageSquare size={13} /> Ofícios
              </TabsTrigger>
              <TabsTrigger value="documentos" className="gap-1.5 text-[11px] flex-1 min-w-[130px] data-[state=active]:bg-[#6B4C9A] data-[state=active]:text-white">
                <Archive size={13} /> Emitidos
                {savedProposals.length > 0 && (
                  <span className="ml-0.5 bg-[#FBBF24] text-[#1F2937] text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                    {savedProposals.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="projetos" className="gap-1.5 text-[11px] flex-1 min-w-[90px] data-[state=active]:bg-[#1E40AF] data-[state=active]:text-white">
                <FolderOpen size={13} /> Projetos
              </TabsTrigger>
              <TabsTrigger value="relatorios" className="gap-1.5 text-[11px] flex-1 min-w-[100px] data-[state=active]:bg-[#6B7280] data-[state=active]:text-white">
                <BarChart2 size={13} /> Relatórios
              </TabsTrigger>
              <TabsTrigger value="signatarios" className="gap-1.5 text-[11px] flex-1 min-w-[110px] data-[state=active]:bg-[#0F766E] data-[state=active]:text-white">
                <Users size={13} /> Signatários
                {signatariosList.length > 0 && (
                  <span className="ml-0.5 text-[9px] opacity-60">({signatariosList.length})</span>
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

              {editingProposalId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex items-center gap-2">
                  <PenTool size={14} /> Editando rascunho existente. Alterações serão salvas no mesmo documento.
                  <button className="ml-auto underline" onClick={() => setEditingProposalId(null)}>Desvincular</button>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-1">
                <Button variant="outline" onClick={() => { setClauses(DEFAULT_CLAUSES); setSigs(DEFAULT_SIGS) }}>↺ Restaurar</Button>
                <Button variant="outline" onClick={() => handleSaveDraft('contrato')} disabled={savingDraft} className="gap-1.5">
                  {savingDraft ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar Rascunho
                </Button>
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

              {editingProposalId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex items-center gap-2">
                  <PenTool size={14} /> Editando rascunho existente. Alterações serão salvas no mesmo documento.
                  <button className="ml-auto underline" onClick={() => setEditingProposalId(null)}>Desvincular</button>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-1">
                <Button variant="outline" onClick={() => setOItems(DEFAULT_ORC_ITEMS)}>↺ Restaurar</Button>
                <Button variant="outline" onClick={() => handleSaveDraft('orcamento')} disabled={savingDraft} className="gap-1.5">
                  {savingDraft ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar Rascunho
                </Button>
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

              {editingProposalId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex items-center gap-2">
                  <PenTool size={14} /> Editando rascunho existente. Alterações serão salvas no mesmo documento.
                  <button className="ml-auto underline" onClick={() => setEditingProposalId(null)}>Desvincular</button>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-1">
                <Button variant="outline" onClick={() =>
                  setOfData(d => ({ ...d, destNome:'', destCargo:'', destInst:'', assunto:'', intro:'', desenvolvimento:'', conclusao:'', fundamentacao:'' }))}>
                  ↺ Limpar
                </Button>
                <Button variant="outline" onClick={() => handleSaveDraft('oficio')} disabled={savingDraft} className="gap-1.5">
                  {savingDraft ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar Rascunho
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
                  <TabsList className="grid grid-cols-5 w-full h-10 mb-6 bg-[#6B4C9A]/8 border border-[#D4C8E8]">
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
                    <TabsTrigger value="relatorios-saved"
                      className="gap-1.5 text-[12px] data-[state=active]:bg-[#6B7280] data-[state=active]:text-white">
                      <BarChart2 size={13} /> Relatórios
                      <span className="ml-1 text-[10px] opacity-60">
                        ({savedProposals.filter(p => p.tipo === 'relatorio').length})
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="projetos-saved"
                      className="gap-1.5 text-[12px] data-[state=active]:bg-[#1E40AF] data-[state=active]:text-white">
                      <FolderOpen size={13} /> Projetos
                      <span className="ml-1 text-[10px] opacity-60">
                        ({savedProposals.filter(p => p.tipo === 'projeto').length})
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  {(['contratos-saved', 'orcamentos-saved', 'oficios-saved', 'relatorios-saved', 'projetos-saved'] as const).map((subtab) => {
                    const tipoMap = { 'contratos-saved': 'contrato', 'orcamentos-saved': 'orcamento', 'oficios-saved': 'oficio', 'relatorios-saved': 'relatorio', 'projetos-saved': 'projeto' } as const
                    const accentMap = { 'contratos-saved': '#2A5B46', 'orcamentos-saved': '#C86A3B', 'oficios-saved': '#008080', 'relatorios-saved': '#6B7280', 'projetos-saved': '#1E40AF' } as const
                    const labelMap = { 'contratos-saved': 'contrato', 'orcamentos-saved': 'orçamento', 'oficios-saved': 'ofício', 'relatorios-saved': 'relatório', 'projetos-saved': 'projeto' } as const
                    const tipo = tipoMap[subtab]
                    const accent = accentMap[subtab]
                    const filtrados = savedProposals.filter(p => p.tipo === tipo)
                    const showValor = tipo === 'orcamento'
                    const showValidade = tipo === 'orcamento'
                    return (
                      <TabsContent key={subtab} value={subtab}>
                        <SdCard title={`${tipo === 'contrato' ? 'Contratos' : tipo === 'orcamento' ? 'Orçamentos' : tipo === 'relatorio' ? 'Relatórios' : tipo === 'projeto' ? 'Propostas de Projeto' : 'Ofícios'} Salvos`}>
                          {filtrados.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400">
                              <Archive size={36} className="opacity-25" />
                              <p className="text-sm font-medium">Nenhum {labelMap[subtab]} salvo ainda.</p>
                              <p className="text-xs text-center">{tipo === 'relatorio' ? 'Gere um relatório na aba Relatórios para registrar aqui automaticamente.' : tipo === 'projeto' ? 'Gere uma proposta na aba Projetos e clique em Salvar PDF para registrar aqui.' : <>Abra o Preview e clique em <strong>Salvar {tipo === 'contrato' ? 'Contrato' : tipo === 'orcamento' ? 'Orçamento' : 'Ofício'}</strong> para registrar.</>}</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-[#C8DDD5]">
                                    <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Nº / Data</th>
                                    <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">
                                      {tipo === 'contrato' ? 'Título / Contratado' : tipo === 'orcamento' ? 'Título / Cliente' : tipo === 'relatorio' ? 'Título / Responsável' : tipo === 'projeto' ? 'Título / Organização' : 'Assunto / Destinatário'}
                                    </th>
                                    {showValor && <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Valor</th>}
                                    {showValidade && <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Validade</th>}
                                    <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Status</th>
                                    <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Ciclo de Vida</th>
                                    <th className="py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Ações</th>
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
                                            <SelectItem value="rascunho">
                                              <span className="flex items-center gap-1.5"><PenTool size={11} className="text-gray-400" /> Rascunho</span>
                                            </SelectItem>
                                            <SelectItem value="enviada">
                                              <span className="flex items-center gap-1.5"><Clock size={11} className="text-[#FBBF24]" />
                                                {tipo === 'contrato' ? 'Enviado' : tipo === 'oficio' ? 'Enviado' : tipo === 'relatorio' ? 'Emitido' : tipo === 'projeto' ? 'Emitido' : 'Enviada'}
                                              </span>
                                            </SelectItem>
                                            <SelectItem value="em_negociacao">
                                              <span className="flex items-center gap-1.5"><RefreshCw size={11} className="text-blue-500" />
                                                {tipo === 'contrato' ? 'Em Análise' : tipo === 'oficio' ? 'Em Andamento' : tipo === 'relatorio' ? 'Em Revisão' : tipo === 'projeto' ? 'Em Elaboração' : 'Em Negociação'}
                                              </span>
                                            </SelectItem>
                                            <SelectItem value="aprovada">
                                              <span className="flex items-center gap-1.5"><CheckCircle size={11} className="text-green-600" />
                                                {tipo === 'contrato' ? 'Assinado' : tipo === 'oficio' ? 'Respondido' : tipo === 'relatorio' ? 'Finalizado' : tipo === 'projeto' ? 'Aprovado' : 'Aprovada'}
                                              </span>
                                            </SelectItem>
                                            <SelectItem value="rejeitada">
                                              <span className="flex items-center gap-1.5"><XCircle size={11} className="text-red-500" />
                                                {tipo === 'contrato' ? 'Cancelado' : tipo === 'oficio' ? 'Arquivado' : tipo === 'relatorio' ? 'Arquivado' : tipo === 'projeto' ? 'Cancelado' : 'Rejeitada'}
                                              </span>
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </td>
                                      {/* ── Timeline / Ciclo de Vida ── */}
                                      <td className="py-3 px-3">
                                        <div className="flex items-center gap-1">
                                          {/* Emitido */}
                                          <div className="flex items-center gap-0.5" title={`Emitido em ${p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-BR') : '—'}`}>
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#2A5B46]" />
                                            <span className="text-[9px] text-[#2A5B46] font-semibold">Emitido</span>
                                          </div>
                                          <div className={`w-4 h-px ${p.pdfAssinado === 'has_pdf_assinado' ? 'bg-[#2A5B46]' : 'bg-gray-300'}`} />

                                          {/* Assinado */}
                                          <div className="flex items-center gap-0.5" title={p.assinadoEm ? `Assinado em ${new Date(p.assinadoEm).toLocaleDateString('pt-BR')}` : 'Aguardando assinatura'}>
                                            <div className={`w-2.5 h-2.5 rounded-full ${p.pdfAssinado === 'has_pdf_assinado' ? 'bg-blue-500' : 'bg-gray-300 border border-dashed border-gray-400'}`} />
                                            <span className={`text-[9px] font-semibold ${p.pdfAssinado === 'has_pdf_assinado' ? 'text-blue-500' : 'text-gray-400'}`}>Assinado</span>
                                          </div>
                                          <div className={`w-4 h-px ${p.enviadoEm ? 'bg-blue-500' : 'bg-gray-300'}`} />

                                          {/* Enviado */}
                                          <div className="flex items-center gap-0.5" title={p.enviadoEm ? `Enviado em ${new Date(p.enviadoEm).toLocaleDateString('pt-BR')}` : 'Não enviado'}>
                                            <div className={`w-2.5 h-2.5 rounded-full ${p.enviadoEm ? 'bg-orange-500' : 'bg-gray-300 border border-dashed border-gray-400'}`} />
                                            <span className={`text-[9px] font-semibold ${p.enviadoEm ? 'text-orange-500' : 'text-gray-400'}`}>Enviado</span>
                                          </div>
                                        </div>

                                        {/* Ações de assinatura */}
                                        {p.pdfAssinado !== 'has_pdf_assinado' && (
                                          <div className="mt-1.5 flex flex-col gap-1">
                                            {p.pdfData === 'has_pdf' && (
                                              <button
                                                className="flex items-center gap-1 text-[10px] font-medium text-[#2A5B46] hover:text-[#1F4A38] transition-colors"
                                                onClick={() => setSignInternalModal({ proposalId: p.id, numero: p.numero, tipo: p.tipo || 'contrato', titulo: p.titulo })}
                                              >
                                                <PenTool size={11} /> Assinar (IDASAM)
                                              </button>
                                            )}
                                            <button
                                              className="flex items-center gap-1 text-[10px] font-medium text-purple-600 hover:text-purple-800 transition-colors"
                                              onClick={() => handleRequestExternalSignature(p.id)}
                                              disabled={requestingExtLink === p.id}
                                            >
                                              {requestingExtLink === p.id
                                                ? <><Loader2 size={11} className="animate-spin" /> Gerando link...</>
                                                : <><Link2 size={11} /> Solicitar assinatura externa</>
                                              }
                                            </button>
                                            <button
                                              className="flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                              onClick={() => {
                                                const input = document.createElement('input')
                                                input.type = 'file'; input.accept = 'application/pdf'
                                                input.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleUploadSignedPdf(p.id, f) }
                                                input.click()
                                              }}
                                              disabled={uploadingSignedPdf === p.id}
                                            >
                                              {uploadingSignedPdf === p.id
                                                ? <><Loader2 size={11} className="animate-spin" /> Enviando...</>
                                                : <><Upload size={11} /> Upload PDF assinado</>
                                              }
                                            </button>
                                          </div>
                                        )}

                                        {/* Link para visualizar PDF assinado */}
                                        {p.pdfAssinado === 'has_pdf_assinado' && (
                                          <button
                                            className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-blue-500 hover:text-blue-700 transition-colors"
                                            onClick={() => handlePreviewSignedPdf(p.id)}
                                          >
                                            <Eye size={11} /> Ver versão assinada
                                          </button>
                                        )}

                                        {/* Marcar como enviado manualmente */}
                                        {!p.enviadoEm && (
                                          <button
                                            className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-orange-500 hover:text-orange-700 transition-colors"
                                            onClick={async () => {
                                              try {
                                                await adminFetch('PATCH', `/api/admin/proposals/${p.id}/mark-sent`)
                                                queryClient.invalidateQueries({ queryKey: ['/api/admin/proposals'] })
                                                toast({ title: 'Documento marcado como enviado' })
                                              } catch {
                                                toast({ title: 'Erro ao marcar como enviado', variant: 'destructive' })
                                              }
                                            }}
                                          >
                                            <Send size={11} /> Marcar como enviado
                                          </button>
                                        )}
                                      </td>

                                      {/* ── Ações ── */}
                                      <td className="py-3 px-3">
                                        <div className="flex items-center gap-1">
                                          {/* Editar — disponível para rascunhos ou qualquer doc com dados salvos */}
                                          {p.dados && (
                                            <button
                                              className="text-amber-500 hover:text-amber-700 transition-colors p-1 rounded"
                                              onClick={() => handleEditDraft(p)}
                                              title="Editar documento"
                                            >
                                              <PenTool size={14} />
                                            </button>
                                          )}
                                          {p.pdfData === 'has_pdf' && (
                                            <>
                                              <button
                                                className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded"
                                                onClick={() => handlePreviewPdf(p.id)}
                                                title="Visualizar PDF original"
                                              >
                                                <Eye size={14} />
                                              </button>
                                              <button
                                                className="text-green-600 hover:text-green-800 transition-colors p-1 rounded"
                                                onClick={() => handleDownloadPdf(p)}
                                                title="Baixar PDF"
                                              >
                                                <Download size={14} />
                                              </button>
                                              <button
                                                className="text-orange-500 hover:text-orange-700 transition-colors p-1 rounded"
                                                onClick={() => handleOpenEmailModal(p)}
                                                title="Enviar por e-mail"
                                              >
                                                <Mail size={14} />
                                              </button>
                                            </>
                                          )}
                                          <button
                                            className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
                                            onClick={() => {
                                              deleteProposalMutation.mutate(p.id)
                                            }}
                                            title={`Excluir ${labelMap[subtab]}`}
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
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

            <TabsContent value="projetos">
              {/* off-screen container used for PDF pagination — never visible */}
              <div ref={projPagesRef} style={{ position: 'fixed', left: '-9999px', top: 0, width: '794px', pointerEvents: 'none', zIndex: -1 }} />

              {projView === 'form' ? (
                /* ══════════════════ FORMULÁRIO DE PROPOSTA ══════════════════ */
                <div className="max-w-2xl mx-auto space-y-5">

                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <FolderOpen size={16} className="text-[#1E40AF]" />
                    <h3 className="text-sm font-bold text-[#374151] tracking-wide uppercase">Dados da Proposta de Projeto</h3>
                  </div>

                  {/* Título */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#1E40AF] uppercase tracking-wide">Título da Proposta de Projeto</label>
                    <Input value={projData.titulo} onChange={e => handleProjFormChange('titulo', e.target.value)}
                      placeholder="Ex.: Projeto de Reflorestamento da Amazônia 2025"
                      className="h-9 text-sm border-[#BFDBFE] focus-visible:ring-[#1E40AF]/40" />
                  </div>

                  {/* Responsável e Cargo */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#1E40AF] uppercase tracking-wide">Responsável pela Proposta</label>
                      <Input value={projData.responsavel} onChange={e => handleProjFormChange('responsavel', e.target.value)}
                        placeholder="Ex.: Mauricio Santos Rocha"
                        className="h-9 text-sm border-[#BFDBFE] focus-visible:ring-[#1E40AF]/40" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#1E40AF] uppercase tracking-wide">Cargo do Responsável</label>
                      <Input value={projData.cargo} onChange={e => handleProjFormChange('cargo', e.target.value)}
                        placeholder="Ex.: Vice Presidente"
                        className="h-9 text-sm border-[#BFDBFE] focus-visible:ring-[#1E40AF]/40" />
                    </div>
                  </div>

                  {/* Organização */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#1E40AF] uppercase tracking-wide">Organização Proponente</label>
                    <Input value={projData.organizacao} onChange={e => handleProjFormChange('organizacao', e.target.value)}
                      placeholder="Nome da organização que propõe o projeto"
                      className="h-9 text-sm border-[#BFDBFE] focus-visible:ring-[#1E40AF]/40" />
                  </div>

                  {/* Parceiro */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#1E40AF] uppercase tracking-wide">Parceiro / Financiador</label>
                    <Input value={projData.parceiro} onChange={e => handleProjFormChange('parceiro', e.target.value)}
                      placeholder="Ex.: Fundo Amazônia, Ministério do Meio Ambiente"
                      className="h-9 text-sm border-[#BFDBFE] focus-visible:ring-[#1E40AF]/40" />
                  </div>

                  {/* Valor e Prazo */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#1E40AF] uppercase tracking-wide">Valor Estimado</label>
                      <Input value={projData.valorEstimado} onChange={e => handleProjFormChange('valorEstimado', e.target.value)}
                        placeholder="Ex.: R$ 250.000,00"
                        className="h-9 text-sm border-[#BFDBFE] focus-visible:ring-[#1E40AF]/40" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#1E40AF] uppercase tracking-wide">Prazo de Execução</label>
                      <Input type="date" value={projData.prazoExecucao}
                        onChange={e => handleProjFormChange('prazoExecucao', e.target.value)}
                        className="h-9 text-sm border-[#BFDBFE] focus-visible:ring-[#1E40AF]/40" />
                    </div>
                  </div>

                  {/* ── Content builder ── */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-sm bg-gradient-to-b from-[#1E40AF] to-[#3B82F6] flex-shrink-0" />
                      <span className="text-[11px] font-bold text-[#374151] uppercase tracking-wide">Conteúdo da Proposta</span>
                      <span className="ml-auto text-[10px] text-[#9CA3AF]">{projData.blocos.length} bloco{projData.blocos.length !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="space-y-3">
                      {projData.blocos.map((bloco, idx) => (
                        <div key={bloco.id} className="bg-white border border-[#BFDBFE] rounded-xl shadow-sm overflow-hidden">

                          {/* block header */}
                          <div className={`flex items-center gap-2 px-3 py-2 border-b border-[#E5E7EB] ${bloco.tipo === 'texto' ? 'bg-[#EFF6FF]' : bloco.tipo === 'tabela' ? 'bg-[#EFF6FF]' : 'bg-[#FFF8EE]'}`}>
                            {bloco.tipo === 'texto'
                              ? <AlignLeft size={12} className="text-[#1E40AF] flex-shrink-0" />
                              : bloco.tipo === 'tabela'
                                ? <Table size={12} className="text-[#1E40AF] flex-shrink-0" />
                                : <ImageIcon size={12} className="text-[#C86A3B] flex-shrink-0" />
                            }
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${bloco.tipo === 'imagem' ? 'text-[#C86A3B]' : 'text-[#1E40AF]'}`}>
                              {bloco.tipo === 'texto' ? 'Seção de texto' : bloco.tipo === 'tabela' ? 'Tabela' : 'Imagem'}
                            </span>
                            <span className="text-[10px] text-[#9CA3AF] ml-1">#{idx + 1}</span>
                            <div className="ml-auto flex items-center gap-0.5">
                              <button type="button" onClick={() => moveProjBloco(bloco.id, 'up')} disabled={idx === 0}
                                className="p-1 rounded hover:bg-[#E5E7EB] disabled:opacity-30 transition-colors" title="Mover para cima">
                                <ChevronUp size={12} />
                              </button>
                              <button type="button" onClick={() => moveProjBloco(bloco.id, 'down')} disabled={idx === projData.blocos.length - 1}
                                className="p-1 rounded hover:bg-[#E5E7EB] disabled:opacity-30 transition-colors" title="Mover para baixo">
                                <ChevronDown size={12} />
                              </button>
                              <button type="button" onClick={() => removeProjBloco(bloco.id)}
                                className="p-1 rounded hover:bg-red-100 text-[#9CA3AF] hover:text-red-500 transition-colors ml-1" title="Remover">
                                <X size={12} />
                              </button>
                            </div>
                          </div>

                          {/* block body */}
                          <div className="p-3 space-y-2">
                            {bloco.tipo === 'texto' ? (
                              <>
                                <input type="text" value={bloco.titulo}
                                  onChange={e => updateProjBlocoField(bloco.id, 'titulo', e.target.value)}
                                  placeholder="Título da seção (ex.: 1. Resumo Executivo)"
                                  className="w-full text-sm font-semibold border border-[#BFDBFE] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/30 bg-[#FAFBFA] placeholder:text-gray-400" />
                                <textarea value={bloco.corpo}
                                  onChange={e => updateProjBlocoField(bloco.id, 'corpo', e.target.value)}
                                  placeholder="Digite o conteúdo desta seção..."
                                  rows={4}
                                  className="w-full text-sm border border-[#BFDBFE] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/30 bg-[#FAFBFA] placeholder:text-gray-400" />
                              </>
                            ) : bloco.tipo === 'tabela' ? (
                              <>
                                <input type="text" value={bloco.titulo}
                                  onChange={e => updateProjBlocoField(bloco.id, 'titulo', e.target.value)}
                                  placeholder="Título da tabela (opcional)"
                                  className="w-full text-sm font-semibold border border-[#BFDBFE] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/30 bg-[#FAFBFA] placeholder:text-gray-400" />

                                {/* table grid editor */}
                                <div className="overflow-x-auto rounded-lg border border-[#BFDBFE]">
                                  <table className="w-full border-collapse text-xs">
                                    <tbody>
                                      {bloco.linhas.map((row, ri) => (
                                        <tr key={ri} className={bloco.cabecalho && ri === 0 ? 'bg-[#1E40AF]' : ri % 2 === 0 ? 'bg-[#EFF6FF]' : 'bg-white'}>
                                          {row.map((cell, ci) => (
                                            <td key={ci} className="border border-[#BFDBFE] p-0">
                                              <input
                                                type="text"
                                                value={cell}
                                                onChange={e => updateProjTabelaCell(bloco.id, ri, ci, e.target.value)}
                                                placeholder={bloco.cabecalho && ri === 0 ? `Col ${ci + 1}` : ''}
                                                className={`w-full px-2 py-1.5 text-xs bg-transparent outline-none focus:bg-white/60 min-w-[60px] ${bloco.cabecalho && ri === 0 ? 'font-semibold text-white placeholder:text-white/50' : 'text-[#374151] placeholder:text-gray-300'}`}
                                              />
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {/* table controls */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  <label className="flex items-center gap-1.5 text-[11px] text-[#1E40AF] font-semibold cursor-pointer select-none mr-2">
                                    <input type="checkbox" checked={bloco.cabecalho} onChange={() => toggleProjTabelaCabecalho(bloco.id)} className="accent-[#1E40AF]" />
                                    1ª linha como cabeçalho
                                  </label>
                                  <button type="button" onClick={() => addProjTabelaLinha(bloco.id)}
                                    className="px-2 py-1 text-[11px] rounded border border-[#BFDBFE] hover:border-[#1E40AF] hover:text-[#1E40AF] text-[#6B7280] transition-colors">
                                    + Linha
                                  </button>
                                  <button type="button" onClick={() => removeProjTabelaLinha(bloco.id)}
                                    disabled={bloco.linhas.length <= 1}
                                    className="px-2 py-1 text-[11px] rounded border border-[#BFDBFE] hover:border-red-400 hover:text-red-500 text-[#6B7280] transition-colors disabled:opacity-30">
                                    − Linha
                                  </button>
                                  <button type="button" onClick={() => addProjTabelaColuna(bloco.id)}
                                    className="px-2 py-1 text-[11px] rounded border border-[#BFDBFE] hover:border-[#1E40AF] hover:text-[#1E40AF] text-[#6B7280] transition-colors">
                                    + Coluna
                                  </button>
                                  <button type="button" onClick={() => removeProjTabelaColuna(bloco.id)}
                                    disabled={(bloco.linhas[0]?.length ?? 0) <= 1}
                                    className="px-2 py-1 text-[11px] rounded border border-[#BFDBFE] hover:border-red-400 hover:text-red-500 text-[#6B7280] transition-colors disabled:opacity-30">
                                    − Coluna
                                  </button>
                                  <span className="text-[10px] text-[#9CA3AF] ml-auto">
                                    {bloco.linhas.length} lin × {bloco.linhas[0]?.length ?? 0} col
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="flex gap-3 items-start">
                                <img src={bloco.url} alt="imagem"
                                  className="w-24 h-20 object-cover rounded-lg border border-[#E5E7EB] flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">Legenda</p>
                                  <textarea value={bloco.caption}
                                    onChange={e => updateProjBlocoField(bloco.id, 'caption', e.target.value)}
                                    placeholder="Descreva esta imagem..."
                                    rows={3}
                                    className="w-full text-sm border border-[#BFDBFE] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#C86A3B]/30 bg-[#FAFBFA] placeholder:text-gray-400" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add block buttons */}
                    <div className="flex gap-2 mt-3">
                      <button type="button" onClick={addProjBlocoTexto}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-dashed border-[#BFDBFE] hover:border-[#1E40AF] text-[#9CA3AF] hover:text-[#1E40AF] hover:bg-[#EFF6FF] transition-all text-sm font-semibold">
                        <Plus size={14} /><AlignLeft size={13} /> Seção de texto
                      </button>
                      <button type="button" onClick={addProjBlocoTabela}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-dashed border-[#BFDBFE] hover:border-[#1E40AF] text-[#9CA3AF] hover:text-[#1E40AF] hover:bg-[#EFF6FF] transition-all text-sm font-semibold">
                        <Plus size={14} /><Table size={13} /> Inserir tabela
                      </button>
                      <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-dashed border-[#BFDBFE] hover:border-[#C86A3B] text-[#9CA3AF] hover:text-[#C86A3B] hover:bg-[#FFF8EE] transition-all text-sm font-semibold cursor-pointer">
                        <Plus size={14} /><ImagePlus size={13} /> Inserir imagem
                        <input type="file" accept="image/*" multiple className="hidden"
                          onChange={e => { addProjBlocoImagem(e.target.files); e.target.value = '' }} />
                      </label>
                    </div>
                  </div>

                  {editingProposalId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex items-center gap-2">
                      <PenTool size={14} /> Editando rascunho existente.
                      <button className="ml-auto underline" onClick={() => setEditingProposalId(null)}>Desvincular</button>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button onClick={() => handleSaveDraft('projeto')} disabled={savingDraft}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm border border-[#BFDBFE] text-[#1E40AF] hover:bg-[#EFF6FF] disabled:opacity-60 transition-colors">
                      {savingDraft ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar Rascunho
                    </button>
                    <button onClick={handleGerarProjeto} disabled={generatingProjeto}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#1E40AF] hover:bg-[#1e3a8a] disabled:opacity-60 transition-colors shadow-md">
                      {generatingProjeto
                        ? <><Loader2 size={15} className="animate-spin" /> {loadingText || 'Gerando PDF...'}</>
                        : <><Download size={15} /> Gerar Proposta PDF</>
                      }
                    </button>
                  </div>
                </div>
              ) : (
                /* ══════════════════ PDF PREVIEW ══════════════════ */
                <div className="space-y-4">

                  {/* Preview topbar */}
                  <div className="flex items-center justify-between bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-3">
                    <button type="button"
                      onClick={() => { setProjView('form'); setProjetoSalvo(false) }}
                      className="flex items-center gap-2 text-sm font-semibold text-[#1E40AF] hover:text-[#1e3a8a] transition-colors">
                      <ArrowLeft size={15} /> Voltar à edição
                    </button>
                    <div className="flex items-center gap-2">
                      <FolderOpen size={14} className="text-[#1E40AF]" />
                      <span className="text-sm font-bold text-[#374151] uppercase tracking-wide truncate max-w-xs">
                        {projData.titulo || 'Proposta de Projeto IDASAM'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSalvarProjeto}
                        disabled={salvandoProjeto || projetoSalvo}
                        className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-colors shadow-sm border ${
                          projetoSalvo
                            ? 'bg-[#DBEAFE] border-[#93C5FD] text-[#1E3A8A] cursor-default'
                            : 'bg-white border-[#BFDBFE] text-[#1E40AF] hover:bg-[#EFF6FF] hover:border-[#1E40AF] disabled:opacity-50'
                        }`}>
                        {salvandoProjeto
                          ? <><Loader2 size={14} className="animate-spin" /> Salvando...</>
                          : projetoSalvo
                            ? <><CheckCircle size={14} /> Salvo</>
                            : <><Save size={14} /> Salvar PDF</>
                        }
                      </button>
                      <a href={projPdfUrl!} download={`Proposta_Projeto_IDASAM_${projData.titulo || 'proposta'}.pdf`}
                        className="flex items-center gap-2 py-2 px-4 rounded-lg bg-[#1E40AF] hover:bg-[#1e3a8a] text-white text-sm font-semibold transition-colors shadow-sm">
                        <Download size={14} /> Baixar PDF
                      </a>
                    </div>
                  </div>

                  {/* PDF iframe */}
                  <iframe src={projPdfUrl!}
                    className="w-full rounded-xl border border-[#BFDBFE] shadow-sm"
                    style={{ minHeight: '80vh' }}
                    title="Pré-visualização da Proposta de Projeto" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="relatorios">
              {/* off-screen container used for PDF pagination — never visible */}
              <div ref={relPagesRef} style={{ position: 'fixed', left: '-9999px', top: 0, width: '794px', pointerEvents: 'none', zIndex: -1 }} />

              {relView === 'form' ? (
                /* ══════════════════ EDITING FORM ══════════════════ */
                <div className="max-w-2xl mx-auto space-y-5">

                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <BarChart2 size={16} className="text-[#6B7280]" />
                    <h3 className="text-sm font-bold text-[#374151] tracking-wide uppercase">Dados do Relatório</h3>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#4A7260] uppercase tracking-wide">Título do Relatório</label>
                    <Input value={formData.titulo} onChange={e => handleFormChange('titulo', e.target.value)}
                      placeholder="Ex.: Relatório de Atividades 2025"
                      className="h-9 text-sm border-[#C8DDD5] focus-visible:ring-[#6B7280]/40" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#4A7260] uppercase tracking-wide">Responsável pela Emissão</label>
                      <Input value={formData.responsavel} onChange={e => handleFormChange('responsavel', e.target.value)}
                        placeholder="Ex.: Mauricio Santos Rocha"
                        className="h-9 text-sm border-[#C8DDD5] focus-visible:ring-[#6B7280]/40" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#4A7260] uppercase tracking-wide">Cargo do Responsável</label>
                      <Input value={formData.cargo} onChange={e => handleFormChange('cargo', e.target.value)}
                        placeholder="Ex.: Vice Presidente"
                        className="h-9 text-sm border-[#C8DDD5] focus-visible:ring-[#6B7280]/40" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#4A7260] uppercase tracking-wide">Instituição</label>
                    <Input value={formData.instituicao} onChange={e => handleFormChange('instituicao', e.target.value)}
                      placeholder="Nome da instituição responsável"
                      className="h-9 text-sm border-[#C8DDD5] focus-visible:ring-[#6B7280]/40" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#4A7260] uppercase tracking-wide">Parceiro / Financiador</label>
                    <Input value={formData.parceiro} onChange={e => handleFormChange('parceiro', e.target.value)}
                      placeholder="Ex.: Ministério do Meio Ambiente"
                      className="h-9 text-sm border-[#C8DDD5] focus-visible:ring-[#6B7280]/40" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#4A7260] uppercase tracking-wide">Período</label>
                      <Input value={formData.periodo} onChange={e => handleFormChange('periodo', e.target.value)}
                        placeholder="Ex.: Jan–Dez 2025"
                        className="h-9 text-sm border-[#C8DDD5] focus-visible:ring-[#6B7280]/40" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#4A7260] uppercase tracking-wide">Data de Encerramento</label>
                      <Input type="date" value={formData.dataEncerramento}
                        onChange={e => handleFormChange('dataEncerramento', e.target.value)}
                        className="h-9 text-sm border-[#C8DDD5] focus-visible:ring-[#6B7280]/40" />
                    </div>
                  </div>

                  {/* ── Content builder ── */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-sm bg-gradient-to-b from-[#2A5B46] to-[#008080] flex-shrink-0" />
                      <span className="text-[11px] font-bold text-[#374151] uppercase tracking-wide">Conteúdo do Relatório</span>
                      <span className="ml-auto text-[10px] text-[#9CA3AF]">{formData.blocos.length} bloco{formData.blocos.length !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="space-y-3">
                      {formData.blocos.map((bloco, idx) => (
                        <div key={bloco.id} className="bg-white border border-[#C8DDD5] rounded-xl shadow-sm overflow-hidden">

                          {/* block header */}
                          <div className={`flex items-center gap-2 px-3 py-2 border-b border-[#E5E7EB] ${bloco.tipo === 'texto' ? 'bg-[#F0F7F4]' : bloco.tipo === 'tabela' ? 'bg-[#EFF6FF]' : 'bg-[#FFF8EE]'}`}>
                            {bloco.tipo === 'texto'
                              ? <AlignLeft size={12} className="text-[#2A5B46] flex-shrink-0" />
                              : bloco.tipo === 'tabela'
                                ? <Table size={12} className="text-[#008080] flex-shrink-0" />
                                : <ImageIcon size={12} className="text-[#C86A3B] flex-shrink-0" />
                            }
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${bloco.tipo === 'texto' ? 'text-[#2A5B46]' : bloco.tipo === 'tabela' ? 'text-[#008080]' : 'text-[#C86A3B]'}`}>
                              {bloco.tipo === 'texto' ? 'Seção de texto' : bloco.tipo === 'tabela' ? 'Tabela' : 'Imagem'}
                            </span>
                            <span className="text-[10px] text-[#9CA3AF] ml-1">#{idx + 1}</span>
                            <div className="ml-auto flex items-center gap-0.5">
                              <button type="button" onClick={() => moveBloco(bloco.id, 'up')} disabled={idx === 0}
                                className="p-1 rounded hover:bg-[#E5E7EB] disabled:opacity-30 transition-colors" title="Mover para cima">
                                <ChevronUp size={12} />
                              </button>
                              <button type="button" onClick={() => moveBloco(bloco.id, 'down')} disabled={idx === formData.blocos.length - 1}
                                className="p-1 rounded hover:bg-[#E5E7EB] disabled:opacity-30 transition-colors" title="Mover para baixo">
                                <ChevronDown size={12} />
                              </button>
                              <button type="button" onClick={() => removeBloco(bloco.id)}
                                className="p-1 rounded hover:bg-red-100 text-[#9CA3AF] hover:text-red-500 transition-colors ml-1" title="Remover">
                                <X size={12} />
                              </button>
                            </div>
                          </div>

                          {/* block body */}
                          <div className="p-3 space-y-2">
                            {bloco.tipo === 'texto' ? (
                              <>
                                <input type="text" value={bloco.titulo}
                                  onChange={e => updateBlocoField(bloco.id, 'titulo', e.target.value)}
                                  placeholder="Título da seção (ex.: 1. Apresentação)"
                                  className="w-full text-sm font-semibold border border-[#C8DDD5] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2A5B46]/30 bg-[#FAFBFA] placeholder:text-gray-400" />
                                <textarea value={bloco.corpo}
                                  onChange={e => updateBlocoField(bloco.id, 'corpo', e.target.value)}
                                  placeholder="Digite o conteúdo desta seção..."
                                  rows={4}
                                  className="w-full text-sm border border-[#C8DDD5] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#2A5B46]/30 bg-[#FAFBFA] placeholder:text-gray-400" />
                              </>
                            ) : bloco.tipo === 'tabela' ? (
                              <>
                                <input type="text" value={bloco.titulo}
                                  onChange={e => updateBlocoField(bloco.id, 'titulo', e.target.value)}
                                  placeholder="Título da tabela (opcional)"
                                  className="w-full text-sm font-semibold border border-[#C8DDD5] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008080]/30 bg-[#FAFBFA] placeholder:text-gray-400" />

                                {/* table grid editor */}
                                <div className="overflow-x-auto rounded-lg border border-[#C8DDD5]">
                                  <table className="w-full border-collapse text-xs">
                                    <tbody>
                                      {bloco.linhas.map((row, ri) => (
                                        <tr key={ri} className={bloco.cabecalho && ri === 0 ? 'bg-[#2A5B46]' : ri % 2 === 0 ? 'bg-[#F0F7F4]' : 'bg-white'}>
                                          {row.map((cell, ci) => (
                                            <td key={ci} className="border border-[#C8DDD5] p-0">
                                              <input
                                                type="text"
                                                value={cell}
                                                onChange={e => updateTabelaCell(bloco.id, ri, ci, e.target.value)}
                                                placeholder={bloco.cabecalho && ri === 0 ? `Col ${ci + 1}` : ''}
                                                className={`w-full px-2 py-1.5 text-xs bg-transparent outline-none focus:bg-white/60 min-w-[60px] ${bloco.cabecalho && ri === 0 ? 'font-semibold text-white placeholder:text-white/50' : 'text-[#374151] placeholder:text-gray-300'}`}
                                              />
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {/* table controls */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  <label className="flex items-center gap-1.5 text-[11px] text-[#008080] font-semibold cursor-pointer select-none mr-2">
                                    <input type="checkbox" checked={bloco.cabecalho} onChange={() => toggleTabelaCabecalho(bloco.id)} className="accent-[#008080]" />
                                    1ª linha como cabeçalho
                                  </label>
                                  <button type="button" onClick={() => addTabelaLinha(bloco.id)}
                                    className="px-2 py-1 text-[11px] rounded border border-[#C8DDD5] hover:border-[#008080] hover:text-[#008080] text-[#6B7280] transition-colors">
                                    + Linha
                                  </button>
                                  <button type="button" onClick={() => removeTabelaLinha(bloco.id)}
                                    disabled={bloco.linhas.length <= 1}
                                    className="px-2 py-1 text-[11px] rounded border border-[#C8DDD5] hover:border-red-400 hover:text-red-500 text-[#6B7280] transition-colors disabled:opacity-30">
                                    − Linha
                                  </button>
                                  <button type="button" onClick={() => addTabelaColuna(bloco.id)}
                                    className="px-2 py-1 text-[11px] rounded border border-[#C8DDD5] hover:border-[#008080] hover:text-[#008080] text-[#6B7280] transition-colors">
                                    + Coluna
                                  </button>
                                  <button type="button" onClick={() => removeTabelaColuna(bloco.id)}
                                    disabled={(bloco.linhas[0]?.length ?? 0) <= 1}
                                    className="px-2 py-1 text-[11px] rounded border border-[#C8DDD5] hover:border-red-400 hover:text-red-500 text-[#6B7280] transition-colors disabled:opacity-30">
                                    − Coluna
                                  </button>
                                  <span className="text-[10px] text-[#9CA3AF] ml-auto">
                                    {bloco.linhas.length} lin × {bloco.linhas[0]?.length ?? 0} col
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="flex gap-3 items-start">
                                <img src={bloco.url} alt="imagem"
                                  className="w-24 h-20 object-cover rounded-lg border border-[#E5E7EB] flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">Legenda</p>
                                  <textarea value={bloco.caption}
                                    onChange={e => updateBlocoField(bloco.id, 'caption', e.target.value)}
                                    placeholder="Descreva esta imagem..."
                                    rows={3}
                                    className="w-full text-sm border border-[#C8DDD5] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#C86A3B]/30 bg-[#FAFBFA] placeholder:text-gray-400" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add block buttons */}
                    <div className="flex gap-2 mt-3">
                      <button type="button" onClick={addBlocoTexto}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-dashed border-[#C8DDD5] hover:border-[#2A5B46] text-[#9CA3AF] hover:text-[#2A5B46] hover:bg-[#F0F7F4] transition-all text-sm font-semibold">
                        <Plus size={14} /><AlignLeft size={13} /> Seção de texto
                      </button>
                      <button type="button" onClick={addBlocoTabela}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-dashed border-[#C8DDD5] hover:border-[#008080] text-[#9CA3AF] hover:text-[#008080] hover:bg-[#EFF6FF] transition-all text-sm font-semibold">
                        <Plus size={14} /><Table size={13} /> Inserir tabela
                      </button>
                      <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-dashed border-[#C8DDD5] hover:border-[#C86A3B] text-[#9CA3AF] hover:text-[#C86A3B] hover:bg-[#FFF8EE] transition-all text-sm font-semibold cursor-pointer">
                        <Plus size={14} /><ImagePlus size={13} /> Inserir imagem
                        <input type="file" accept="image/*" multiple className="hidden"
                          onChange={e => { addBlocoImagem(e.target.files); e.target.value = '' }} />
                      </label>
                    </div>
                  </div>

                  {editingProposalId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex items-center gap-2">
                      <PenTool size={14} /> Editando rascunho existente.
                      <button className="ml-auto underline" onClick={() => setEditingProposalId(null)}>Desvincular</button>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button onClick={() => handleSaveDraft('relatorio')} disabled={savingDraft}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm border border-[#C8DDD5] text-[#2A5B46] hover:bg-[#F0F7F4] disabled:opacity-60 transition-colors">
                      {savingDraft ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar Rascunho
                    </button>
                    <button onClick={handleGerarRelatorio} disabled={generatingRelatorio}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#2A5B46] hover:bg-[#1e4434] disabled:opacity-60 transition-colors shadow-md">
                      {generatingRelatorio
                        ? <><Loader2 size={15} className="animate-spin" /> {loadingText || 'Gerando PDF...'}</>
                        : <><Download size={15} /> Gerar Relatório PDF</>
                      }
                    </button>
                  </div>
                </div>
              ) : (
                /* ══════════════════ PDF PREVIEW ══════════════════ */
                <div className="space-y-4">

                  {/* Preview topbar */}
                  <div className="flex items-center justify-between bg-[#F0F7F4] border border-[#C8DDD5] rounded-xl px-4 py-3">
                    <button type="button"
                      onClick={() => { setRelView('form'); setRelatorioSalvo(false) }}
                      className="flex items-center gap-2 text-sm font-semibold text-[#2A5B46] hover:text-[#1e4434] transition-colors">
                      <ArrowLeft size={15} /> Voltar à edição
                    </button>
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-[#6B7280]" />
                      <span className="text-sm font-bold text-[#374151] uppercase tracking-wide truncate max-w-xs">
                        {formData.titulo || 'Relatório IDASAM'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSalvarRelatorio}
                        disabled={salvandoRelatorio || relatorioSalvo}
                        className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-colors shadow-sm border ${
                          relatorioSalvo
                            ? 'bg-[#D1FAE5] border-[#6EE7B7] text-[#065F46] cursor-default'
                            : 'bg-white border-[#C8DDD5] text-[#2A5B46] hover:bg-[#F0F7F4] hover:border-[#2A5B46] disabled:opacity-50'
                        }`}>
                        {salvandoRelatorio
                          ? <><Loader2 size={14} className="animate-spin" /> Salvando...</>
                          : relatorioSalvo
                            ? <><CheckCircle size={14} /> Salvo</>
                            : <><Save size={14} /> Salvar PDF</>
                        }
                      </button>
                      <a href={pdfUrl!} download={`Relatorio_IDASAM_${formData.titulo || 'relatorio'}.pdf`}
                        className="flex items-center gap-2 py-2 px-4 rounded-lg bg-[#2A5B46] hover:bg-[#1e4434] text-white text-sm font-semibold transition-colors shadow-sm">
                        <Download size={14} /> Baixar PDF
                      </a>
                    </div>
                  </div>

                  {/* PDF iframe */}
                  <iframe src={pdfUrl!}
                    className="w-full rounded-xl border border-[#C8DDD5] shadow-sm"
                    style={{ minHeight: '80vh' }}
                    title="Pré-visualização do Relatório" />
                </div>
              )}
            </TabsContent>

            {/* ══════ ABA SIGNATÁRIOS ══════ */}
            <TabsContent value="signatarios" className="space-y-4">
              <SdCard title="Signatários Cadastrados">
                <p className="text-xs text-gray-500 mb-4">Cadastre os signatários autorizados a assinar documentos internamente pelo IDASAM.</p>

                {/* Formulário de cadastro */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-1.5"><UserPlus size={13} /> Novo Signatário</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase">Nome completo</label>
                      <Input className="mt-1 h-9 text-sm" placeholder="Ex: João Silva" value={novoSig.nome} onChange={e => setNovoSig(s => ({ ...s, nome: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase">Cargo</label>
                      <Input className="mt-1 h-9 text-sm" placeholder="Ex: Diretor Executivo" value={novoSig.cargo} onChange={e => setNovoSig(s => ({ ...s, cargo: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase">Função estatutária</label>
                      <select
                        className="mt-1 w-full h-9 border border-gray-300 rounded-md px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2A5B46]"
                        value={novoSig.role}
                        onChange={e => setNovoSig(s => ({ ...s, role: e.target.value as SignatarioRole }))}
                      >
                        <option value="presidente">Presidente</option>
                        <option value="vice_presidente">Vice-Presidente</option>
                        <option value="diretor_administrativo">Diretor Administrativo</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase">E-mail</label>
                      <Input className="mt-1 h-9 text-sm" placeholder="Ex: joao@idasam.org" value={novoSig.email} onChange={e => setNovoSig(s => ({ ...s, email: e.target.value }))} />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="mt-3 bg-[#0F766E] hover:bg-[#0D655E] text-white gap-1.5"
                    disabled={!novoSig.nome || !novoSig.cargo || !novoSig.email}
                    onClick={() => createSigMutation.mutate(novoSig)}
                  >
                    <Plus size={14} /> Cadastrar Signatário
                  </Button>
                </div>

                {/* Lista */}
                {signatariosList.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-gray-400">
                    <Users size={32} className="opacity-25 mb-2" />
                    <p className="text-sm">Nenhum signatário cadastrado.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#C8DDD5]">
                        <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Nome</th>
                        <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Cargo</th>
                        <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Função</th>
                        <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">E-mail</th>
                        <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Status</th>
                        <th className="py-2 px-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {signatariosList.map(s => (
                        <tr key={s.id} className="border-b border-[#F0F4F8] hover:bg-[#F0F4F8]/60 transition-colors">
                          <td className="py-3 px-3 font-semibold text-[#1F2937]">{s.nome}</td>
                          <td className="py-3 px-3 text-gray-500">{s.cargo}</td>
                          <td className="py-3 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              s.role === 'presidente' ? 'bg-amber-100 text-amber-700' :
                              s.role === 'vice_presidente' ? 'bg-blue-100 text-blue-700' :
                              s.role === 'diretor_administrativo' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {ROLE_LABELS[s.role] || s.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-500 text-xs">{s.email}</td>
                          <td className="py-3 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.ativo === 'true' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {s.ativo === 'true' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              className="text-red-400 hover:text-red-600 transition-colors p-1"
                              onClick={() => deleteSigMutation.mutate(s.id)}
                              title="Excluir signatário"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </SdCard>

              {/* ── Delegações de Poderes ── */}
              <SdCard title="Delegações de Poderes">
                <p className="text-xs text-gray-500 mb-4">
                  Conforme Art. 22 do Estatuto Social, o Presidente pode delegar poderes de assinatura temporariamente.
                </p>

                {!presidenteSig ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700 flex items-center gap-2">
                    <Shield size={16} /> Cadastre um signatário com função "Presidente" para habilitar delegações.
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="mb-4 bg-[#0F766E] hover:bg-[#0D655E] text-white gap-1.5"
                    onClick={() => setShowDelegacaoModal(true)}
                  >
                    <Handshake size={14} /> Nova Delegação
                  </Button>
                )}

                {delegacoesList.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-gray-400">
                    <Handshake size={28} className="opacity-25 mb-2" />
                    <p className="text-sm">Nenhuma delegação registrada.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#C8DDD5]">
                        <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Nº Ato</th>
                        <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Delegado</th>
                        <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Período</th>
                        <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Poderes</th>
                        <th className="text-left py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Status</th>
                        <th className="py-2 px-3 text-[10px] uppercase tracking-wide text-[#4A7260] font-bold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {delegacoesList.map(d => {
                        const delegado = signatariosList.find(s => s.id === d.delegadoId)
                        const poderes: string[] = (() => { try { return JSON.parse(d.poderes) } catch { return [] } })()
                        const isAtiva = d.status === 'ativa' && new Date(d.validaAte) > new Date()
                        const statusLabel = isAtiva ? 'Ativa' : d.status === 'revogada' ? 'Revogada' : 'Expirada'
                        const statusColor = isAtiva ? 'bg-green-100 text-green-700' : d.status === 'revogada' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                        return (
                          <tr key={d.id} className="border-b border-[#F0F4F8] hover:bg-[#F0F4F8]/60 transition-colors">
                            <td className="py-3 px-3 font-mono text-xs font-semibold text-[#1F2937]">{d.numero}</td>
                            <td className="py-3 px-3 font-semibold text-[#1F2937]">{delegado?.nome || '—'}</td>
                            <td className="py-3 px-3 text-xs text-gray-500">
                              {new Date(d.validaDe).toLocaleDateString('pt-BR')} — {new Date(d.validaAte).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex flex-wrap gap-1">
                                {poderes.map(p => (
                                  <span key={p} className="text-[9px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded">{PODER_LABELS[p] || p}</span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>{statusLabel}</span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1">
                                {d.atoDesignacaoPdf && (
                                  <button
                                    className="text-[#2A5B46] hover:text-[#1F4A38] p-1 transition-colors"
                                    onClick={() => handleDownloadAto(d.id, d.numero)}
                                    title="Baixar Ato de Designação (PDF)"
                                  >
                                    <Download size={14} />
                                  </button>
                                )}
                                {isAtiva && (
                                  <button
                                    className="text-red-400 hover:text-red-600 p-1 transition-colors"
                                    onClick={() => handleRevogaDelegacao(d.id)}
                                    title="Revogar delegação"
                                  >
                                    <Ban size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </SdCard>
            </TabsContent>

          </Tabs>
        </div>
      </div>

      {/* ══════ Modal Preview PDF ══════ */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4" onClick={() => { URL.revokeObjectURL(previewPdfUrl); setPreviewPdfUrl(null); setPreviewNumPages(0) }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 shrink-0">
              <h3 className="font-bold text-sm text-[#1F2937] flex items-center gap-2">
                <Eye size={16} className="text-[#2A5B46]" /> Pré-visualização do Documento
                {previewNumPages > 0 && <span className="text-xs font-normal text-gray-400">({previewNumPages} {previewNumPages === 1 ? 'página' : 'páginas'})</span>}
              </h3>
              <button
                onClick={() => { URL.revokeObjectURL(previewPdfUrl); setPreviewPdfUrl(null); setPreviewNumPages(0) }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-100 flex flex-col items-center py-4 gap-4">
              <Document
                file={previewPdfUrl}
                onLoadSuccess={({ numPages }) => setPreviewNumPages(numPages)}
                loading={<div className="flex items-center gap-2 py-20 text-gray-400"><Loader2 size={20} className="animate-spin" /> Carregando documento...</div>}
                error={<div className="py-20 text-red-500 text-sm">Erro ao carregar o PDF.</div>}
              >
                {Array.from({ length: previewNumPages }, (_, i) => (
                  <Page
                    key={i + 1}
                    pageNumber={i + 1}
                    width={700}
                    className="shadow-lg rounded-sm"
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                ))}
              </Document>
            </div>
          </div>
        </div>
      )}

      {/* ══════ Modal Enviar E-mail ══════ */}
      {emailModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => setEmailModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#1F2937] flex items-center gap-2">
                <Mail size={18} className="text-[#2A5B46]" /> Enviar Documento por E-mail
              </h3>
              <button onClick={() => setEmailModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Documento: <strong>{emailModal.numero}</strong></p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Destinatário *</label>
                <Input
                  placeholder="email@exemplo.com"
                  value={emailTo}
                  onChange={e => setEmailTo(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Assunto</label>
                <Input
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Mensagem</label>
                <Textarea
                  value={emailMessage}
                  onChange={e => setEmailMessage(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" onClick={() => setEmailModal(null)} size="sm">
                Cancelar
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={sendingEmail || !emailTo.trim()}
                size="sm"
                className="bg-[#2A5B46] hover:bg-[#1F4A38] text-white gap-2"
              >
                {sendingEmail
                  ? <><Loader2 size={14} className="animate-spin" /> Enviando...</>
                  : <><Send size={14} /> Enviar</>
                }
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ Modal Assinatura Interna ══════ */}
      {signInternalModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => setSignInternalModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#1F2937] flex items-center gap-2">
                <PenTool size={18} className="text-[#2A5B46]" /> Assinar Documento
              </h3>
              <button onClick={() => setSignInternalModal(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Documento: <strong>{signInternalModal.numero}</strong></p>

            {signatariosList.filter(s => s.ativo === 'true').length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-6">
                <Users size={24} className="mx-auto mb-2 opacity-40" />
                Nenhum signatário cadastrado.<br />Cadastre na aba Signatários primeiro.
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Selecione o signatário</label>
                  <select
                    className="mt-1 w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2A5B46] focus:border-[#2A5B46]"
                    value={selectedSignatarioId}
                    onChange={e => handleSelectSignatario(e.target.value)}
                  >
                    <option value="">Escolha um signatário...</option>
                    {signatariosList.filter(s => s.ativo === 'true').map(s => (
                      <option key={s.id} value={s.id}>{s.nome} — {s.cargo} ({ROLE_LABELS[s.role]})</option>
                    ))}
                  </select>
                </div>

                {/* Verificação de poderes */}
                {checkingPoderes && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <Loader2 size={12} className="animate-spin" /> Verificando poderes...
                  </div>
                )}
                {sigPoderes && !sigPoderes.podeAssinar && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-xs text-red-700 flex items-center gap-2">
                    <Ban size={14} />
                    <div>
                      <strong>Sem poderes de assinatura.</strong> Este signatário não possui cargo estatutário (Presidente/Vice) nem delegação ativa.
                      Crie uma delegação na aba Signatários.
                    </div>
                  </div>
                )}
                {sigPoderes && sigPoderes.podeAssinar && sigPoderes.tipo === 'delegacao' && sigPoderes.delegacao && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-700 flex items-center gap-2">
                    <Handshake size={14} />
                    <div>
                      <strong>Assinando por delegação</strong> — Ato de Designação nº {sigPoderes.delegacao.numero}
                    </div>
                  </div>
                )}
                {sigPoderes && sigPoderes.podeAssinar && sigPoderes.tipo === 'cargo_direto' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-xs text-green-700 flex items-center gap-2">
                    <CheckCircle size={14} />
                    <div>
                      <strong>Poderes diretos</strong> — {ROLE_LABELS[sigPoderes.role]} conforme Art. 22 do Estatuto.
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5 mb-1 text-[#2A5B46] font-semibold"><Shield size={12} /> O que será embutido no PDF:</div>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Nome e cargo do signatário</li>
                    <li>Data e hora da assinatura</li>
                    <li>Hash SHA-256 do documento original</li>
                    <li>Referência à Lei 14.063/2020</li>
                    {sigPoderes?.tipo === 'delegacao' && sigPoderes.delegacao && (
                      <li className="text-blue-600 font-semibold">Referência ao Ato de Designação nº {sigPoderes.delegacao.numero}</li>
                    )}
                  </ul>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setSignInternalModal(null); setSigPoderes(null) }} size="sm">Cancelar</Button>
                  <Button
                    onClick={handleSignInternal}
                    disabled={signingInternal || !selectedSignatarioId || (sigPoderes !== null && !sigPoderes.podeAssinar)}
                    size="sm"
                    className="bg-[#2A5B46] hover:bg-[#1F4A38] text-white gap-2"
                  >
                    {signingInternal
                      ? <><Loader2 size={14} className="animate-spin" /> Assinando...</>
                      : <><FileCheck size={14} /> Assinar</>
                    }
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════ Modal Nova Delegação ══════ */}
      {showDelegacaoModal && presidenteSig && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowDelegacaoModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#1F2937] flex items-center gap-2">
                <Handshake size={18} className="text-[#2A5B46]" /> Nova Delegação de Poderes
              </h3>
              <button onClick={() => setShowDelegacaoModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-700">
              <strong>Delegante:</strong> {presidenteSig.nome} — {presidenteSig.cargo} (Presidente)
              <br />Conforme Art. 22, IV do Estatuto Social do IDASAM.
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Delegar para</label>
                <select
                  className="mt-1 w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2A5B46]"
                  value={novaDelegacao.delegadoId}
                  onChange={e => setNovaDelegacao(d => ({ ...d, delegadoId: e.target.value }))}
                >
                  <option value="">Escolha um signatário...</option>
                  {signatariosList.filter(s => s.ativo === 'true' && s.id !== presidenteSig.id).map(s => (
                    <option key={s.id} value={s.id}>{s.nome} — {s.cargo} ({ROLE_LABELS[s.role]})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase flex items-center gap-1"><CalendarDays size={10} /> Data início</label>
                  <Input type="date" className="mt-1 h-9 text-sm" value={novaDelegacao.validaDe} onChange={e => setNovaDelegacao(d => ({ ...d, validaDe: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase flex items-center gap-1"><CalendarDays size={10} /> Data fim</label>
                  <Input type="date" className="mt-1 h-9 text-sm" value={novaDelegacao.validaAte} onChange={e => setNovaDelegacao(d => ({ ...d, validaAte: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Motivo da delegação</label>
                <Input className="mt-1 h-9 text-sm" placeholder="Ex: Viagem institucional a Brasília" value={novaDelegacao.motivo} onChange={e => setNovaDelegacao(d => ({ ...d, motivo: e.target.value }))} />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase mb-2 block">Poderes a delegar</label>
                <div className="space-y-2">
                  {PODERES_DELEGAVEIS.map(p => (
                    <label key={p} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#2A5B46] focus:ring-[#2A5B46]"
                        checked={novaDelegacao.poderes.includes(p)}
                        onChange={e => {
                          setNovaDelegacao(d => ({
                            ...d,
                            poderes: e.target.checked ? [...d.poderes, p] : d.poderes.filter(x => x !== p),
                          }))
                        }}
                      />
                      {PODER_LABELS[p] || p}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowDelegacaoModal(false)} size="sm">Cancelar</Button>
              <Button
                onClick={handleCreateDelegacao}
                disabled={creatingDelegacao || !novaDelegacao.delegadoId || !novaDelegacao.motivo || !novaDelegacao.validaDe || !novaDelegacao.validaAte || novaDelegacao.poderes.length === 0}
                size="sm"
                className="bg-[#2A5B46] hover:bg-[#1F4A38] text-white gap-2"
              >
                {creatingDelegacao
                  ? <><Loader2 size={14} className="animate-spin" /> Criando...</>
                  : <><FileCheck size={14} /> Criar Delegação e Gerar Ato</>
                }
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ Modal Link Externo ══════ */}
      {extLinkModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => setExtLinkModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#1F2937] flex items-center gap-2">
                <Link2 size={18} className="text-purple-600" /> Link de Assinatura Gerado
              </h3>
              <button onClick={() => setExtLinkModal(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-3">Compartilhe este link com a outra parte para assinatura:</p>
            <div className="flex gap-2 mb-3">
              <Input value={extLinkModal.link} readOnly className="text-xs" />
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(extLinkModal.link); toast({ title: 'Link copiado!' }) }}>Copiar</Button>
            </div>
            <p className="text-xs text-gray-400">
              Expira em: {new Date(extLinkModal.expiresAt).toLocaleDateString('pt-BR')} às {new Date(extLinkModal.expiresAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setExtLinkModal(null)} size="sm" className="bg-[#2A5B46] hover:bg-[#1F4A38] text-white">Fechar</Button>
            </div>
          </div>
        </div>
      )}
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
