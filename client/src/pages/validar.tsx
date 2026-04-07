import { useState, useEffect } from 'react'
import { useParams } from 'wouter'

interface ValidationData {
  valid: boolean
  documento: string
  titulo: string
  signerName: string
  signatureType: string
  signedAt: string
  hash: string
}

export default function ValidarPage() {
  const params = useParams<{ hash: string }>()
  const hash = params.hash

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'error'>('loading')
  const [data, setData] = useState<ValidationData | null>(null)

  useEffect(() => {
    if (!hash) return
    fetch(`/api/public/validar/${hash}`)
      .then(async r => {
        if (r.status === 404) { setStatus('invalid'); return }
        if (!r.ok) throw new Error()
        const d = await r.json()
        setData(d)
        setStatus('valid')
      })
      .catch(() => setStatus('error'))
  }, [hash])

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin w-8 h-8 border-2 border-[#1a5c38] border-t-transparent rounded-full" />
    </div>
  )

  if (status === 'invalid') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-lg text-center border">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl">❌</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Documento Não Encontrado</h1>
        <p className="text-gray-500 mb-6">O hash informado não corresponde a nenhum documento assinado em nosso sistema.</p>
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Hash consultado:</p>
          <p className="text-xs font-mono text-gray-400 break-all">{hash}</p>
        </div>
      </div>
    </div>
  )

  if (status === 'error') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md text-center">
        <span className="text-4xl">⚠️</span>
        <h1 className="text-xl font-bold text-gray-800 mt-4 mb-2">Erro na validação</h1>
        <p className="text-gray-500">Não foi possível verificar o documento. Tente novamente.</p>
      </div>
    </div>
  )

  const signedDate = data?.signedAt ? new Date(data.signedAt) : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a5c38] text-white py-5 px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <img src="/logo-idasam.svg" alt="IDASAM" className="h-8 brightness-0 invert" />
          <div>
            <h1 className="text-sm font-bold tracking-wide">IDASAM — Validação de Documento</h1>
            <p className="text-xs opacity-70">Instituto de Desenvolvimento Ambiental e Social da Amazônia</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
          {/* Selo verde de confirmação */}
          <div className="bg-gradient-to-r from-[#1a5c38] to-[#2a7a4e] p-8 text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">Documento Autêntico</h2>
            <p className="text-white/70 text-sm">Este documento foi assinado digitalmente e é válido</p>
          </div>

          {/* Dados */}
          <div className="p-8 space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Documento</p>
                <p className="text-sm font-semibold text-gray-800">{data?.documento}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Título</p>
                <p className="text-sm text-gray-700">{data?.titulo}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Signatário</p>
                <p className="text-sm font-semibold text-gray-800">{data?.signerName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Tipo de Assinatura</p>
                <p className="text-sm text-gray-700">
                  {data?.signatureType === 'internal' ? 'Assinatura Interna (IDASAM)' : 'Assinatura Externa'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Data da Assinatura</p>
                <p className="text-sm text-gray-700">
                  {signedDate
                    ? `${signedDate.toLocaleDateString('pt-BR')} às ${signedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                    : '—'
                  }
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Validade Jurídica</p>
                <p className="text-sm text-gray-700">Lei 14.063/2020 (Brasil)</p>
              </div>
            </div>

            {/* Hash */}
            <div className="bg-[#f0f7f4] border border-[#1a5c38]/20 rounded-lg p-4">
              <p className="text-xs font-semibold text-[#1a5c38] uppercase tracking-wide mb-1.5">Hash SHA-256 do documento original</p>
              <p className="text-xs font-mono text-gray-600 break-all">{data?.hash}</p>
            </div>
          </div>

          {/* Rodapé */}
          <div className="bg-gray-50 px-8 py-4 text-center border-t">
            <p className="text-[10px] text-gray-400">
              Validação realizada em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} •
              IDASAM — Instituto de Desenvolvimento Ambiental e Social da Amazônia •
              CNPJ: 02.906.177/0001-87
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
