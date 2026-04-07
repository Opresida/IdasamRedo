import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'wouter'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface DocData {
  titulo: string
  numero: string
  tipo: string
  signerName: string | null
  signerEmail: string | null
  pdfBase64: string | null
}

function formatCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return d.slice(0, 3) + '.' + d.slice(3)
  if (d.length <= 9) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6)
  return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9)
}

function validateCpf(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i)
  let rest = (sum * 10) % 11
  if (rest === 10) rest = 0
  if (rest !== parseInt(d[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i)
  rest = (sum * 10) % 11
  if (rest === 10) rest = 0
  return rest === parseInt(d[10])
}

export default function AssinarPage() {
  const params = useParams<{ token: string }>()
  const token = params.token

  const [status, setStatus] = useState<'loading' | 'ready' | 'signed' | 'error' | 'expired' | 'used'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [doc, setDoc] = useState<DocData | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [myIp, setMyIp] = useState('...')

  const [signerName, setSignerName] = useState('')
  const [signerCpf, setSignerCpf] = useState('')
  const [signing, setSigning] = useState(false)

  // Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    fetch(`/api/public/my-ip`).then(r => r.json()).then(d => setMyIp(d.ip)).catch(() => setMyIp('indisponível'))
  }, [])

  useEffect(() => {
    if (!token) return
    fetch(`/api/public/assinar/${token}`)
      .then(async r => {
        if (r.status === 409) { setStatus('used'); return }
        if (r.status === 410) { setStatus('expired'); return }
        if (!r.ok) throw new Error('Erro ao carregar')
        const data: DocData = await r.json()
        setDoc(data)
        setSignerName(data.signerName || '')
        if (data.pdfBase64) {
          const bytes = Uint8Array.from(atob(data.pdfBase64), c => c.charCodeAt(0))
          const blob = new Blob([bytes], { type: 'application/pdf' })
          setPdfUrl(URL.createObjectURL(blob))
        }
        setStatus('ready')
      })
      .catch(() => { setStatus('error'); setErrorMsg('Link inválido ou documento não encontrado.') })
  }, [token])

  // Canvas drawing handlers
  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const point = 'touches' in e ? e.touches[0] : e
    return { x: point.clientX - rect.left, y: point.clientY - rect.top }
  }, [])

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    setIsDrawing(true)
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }, [getPos])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1a2332'
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasDrawn(true)
  }, [isDrawing, getPos])

  const stopDraw = useCallback(() => setIsDrawing(false), [])

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) { ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height) }
    setHasDrawn(false)
  }

  const handleSign = async () => {
    if (!doc || !doc.pdfBase64 || !canvasRef.current) return
    if (!signerName.trim()) return alert('Informe seu nome completo.')
    if (!validateCpf(signerCpf)) return alert('CPF inválido.')
    if (!hasDrawn) return alert('Desenhe sua assinatura no campo acima.')

    setSigning(true)
    try {
      const signatureImage = canvasRef.current.toDataURL('image/png')

      // Converter base64 para bytes
      const pdfBytes = Uint8Array.from(atob(doc.pdfBase64), c => c.charCodeAt(0))

      // Hash SHA-256 do original
      const hashBuffer = await crypto.subtle.digest('SHA-256', pdfBytes)
      const documentHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

      // Página de autenticação dedicada
      const { PDFDocument } = await import('pdf-lib')
      const { addAuthenticationPage } = await import('@/lib/pdf-auth-page')
      const pdfDoc = await PDFDocument.load(pdfBytes)

      const now = new Date()
      const dateStr = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

      await addAuthenticationPage({
        pdfDoc,
        docTipo: doc.tipo,
        docNumero: doc.numero,
        docTitulo: doc.titulo,
        signerName: signerName.trim(),
        signerCpf: signerCpf.replace(/\D/g, ''),
        signerIp: myIp,
        dateStr,
        hashHex: documentHash,
        validationBaseUrl: window.location.origin,
        signatureType: 'external',
      })

      const signedBytes = await pdfDoc.save()
      const pdfAssinado = btoa(new Uint8Array(signedBytes).reduce((d, b) => d + String.fromCharCode(b), ''))

      const res = await fetch(`/api/public/assinar/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerName: signerName.trim(), signerCpf: signerCpf.replace(/\D/g, ''), signatureImage, pdfAssinado, documentHash }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Erro ao assinar')
      }
      setStatus('signed')
    } catch (e: any) {
      alert(e.message || 'Erro ao processar assinatura.')
    } finally {
      setSigning(false)
    }
  }

  const tipoLabel = doc?.tipo === 'contrato' ? 'Contrato' : doc?.tipo === 'orcamento' ? 'Orçamento' : doc?.tipo === 'oficio' ? 'Ofício' : doc?.tipo === 'relatorio' ? 'Relatório' : 'Proposta de Projeto'

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center"><div className="animate-spin w-8 h-8 border-2 border-[#1a5c38] border-t-transparent rounded-full mx-auto mb-3" />Carregando documento...</div>
    </div>
  )

  if (status === 'used') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4"><span className="text-2xl">✓</span></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Documento já assinado</h2>
        <p className="text-gray-500">Este documento já foi assinado anteriormente.</p>
      </div>
    </div>
  )

  if (status === 'expired') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><span className="text-2xl">⏰</span></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Link expirado</h2>
        <p className="text-gray-500">Este link de assinatura expirou. Solicite um novo link ao remetente.</p>
      </div>
    </div>
  )

  if (status === 'error') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><span className="text-2xl">❌</span></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Erro</h2>
        <p className="text-gray-500">{errorMsg}</p>
      </div>
    </div>
  )

  if (status === 'signed') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><span className="text-2xl">✅</span></div>
        <h2 className="text-xl font-bold text-[#1a5c38] mb-2">Documento Assinado!</h2>
        <p className="text-gray-500 mb-4">Sua assinatura foi registrada com sucesso no {tipoLabel} nº {doc?.numero}.</p>
        <div className="text-xs text-gray-400 space-y-1">
          <p>Signatário: <strong>{signerName}</strong></p>
          <p>CPF: {signerCpf}</p>
          <p>IP: {myIp}</p>
          <p>Data: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a5c38] text-white py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <img src="/logo-idasam.svg" alt="IDASAM" className="h-8 brightness-0 invert" />
          <div>
            <h1 className="text-sm font-bold tracking-wide">IDASAM — Assinatura Digital</h1>
            <p className="text-xs opacity-70">{tipoLabel} nº {doc?.numero}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        {/* Info */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="font-bold text-gray-800 mb-1">{doc?.titulo}</h2>
          <p className="text-sm text-gray-500">{tipoLabel} nº {doc?.numero}</p>
        </div>

        {/* Preview do PDF */}
        {pdfUrl && (
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Documento para assinatura</h3>
            <div className="max-h-[500px] overflow-y-auto bg-gray-100 rounded-lg flex flex-col items-center py-3 gap-3">
              <Document file={pdfUrl} onLoadSuccess={({ numPages: n }) => setNumPages(n)}>
                {Array.from({ length: numPages }, (_, i) => (
                  <Page key={i + 1} pageNumber={i + 1} width={550} className="shadow-md rounded-sm" renderTextLayer={false} renderAnnotationLayer={false} />
                ))}
              </Document>
            </div>
          </div>
        )}

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Seus dados para assinatura</h3>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nome completo *</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={signerName} onChange={e => setSignerName(e.target.value)} placeholder="Seu nome completo" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">CPF *</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono" value={signerCpf} onChange={e => setSignerCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Assinatura *</label>
              {hasDrawn && <button onClick={clearCanvas} className="text-xs text-red-500 hover:text-red-700">Limpar</button>}
            </div>
            <canvas
              ref={canvasRef}
              width={500}
              height={120}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg bg-white cursor-crosshair touch-none"
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
            />
            <p className="text-xs text-gray-400 mt-1">Desenhe sua assinatura com o mouse ou o dedo.</p>
          </div>

          {/* Evidências */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-600 mb-1">Evidências de autoria (capturadas automaticamente):</p>
            <p>IP: <span className="font-mono">{myIp}</span></p>
            <p>Data/Hora: <span className="font-mono">{new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</span></p>
            <p>Dispositivo: <span className="font-mono text-[10px]">{navigator.userAgent.slice(0, 80)}...</span></p>
          </div>

          <button
            onClick={handleSign}
            disabled={signing}
            className="w-full bg-[#1a5c38] hover:bg-[#14472b] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {signing
              ? <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Processando assinatura...</>
              : <>✍️ Assinar Documento</>
            }
          </button>

          <p className="text-[10px] text-gray-400 text-center">
            Ao assinar, você declara que leu e concorda com o conteúdo do documento acima. Esta assinatura tem validade jurídica nos termos da Lei 14.063/2020.
          </p>
        </div>
      </div>
    </div>
  )
}
