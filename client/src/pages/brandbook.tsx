import { useState } from 'react'
import { useLocation } from 'wouter'
import {
  Copy, Check, ArrowLeft, Palette, Type, Layout, Image, Grid3X3, Layers,
  BookOpen, Download, Shield, Eye, Target, Heart, Leaf, Globe, Sun, Droplets,
} from 'lucide-react'

const LOGO_URL = '/logo-idasam-vector.svg'

// ── Brand Colors ──
const COLORS = {
  primary: [
    { name: 'Forest Green', hex: '#2A5B46', rgb: '42, 91, 70', usage: 'Cor principal da marca. Headers, CTAs, textos de destaque, navegacao.' },
    { name: 'Deep Forest', hex: '#1F4A38', rgb: '31, 74, 56', usage: 'Hover states, backgrounds escuros, enfase.' },
    { name: 'Medium Teal', hex: '#4E8D7C', rgb: '78, 141, 124', usage: 'Cores secundarias, icones, links, destaques suaves.' },
    { name: 'Teal', hex: '#008080', rgb: '0, 128, 128', usage: 'Acentos, oficios, elementos informativos.' },
  ],
  secondary: [
    { name: 'Gold Accent', hex: '#FBBF24', rgb: '251, 191, 36', usage: 'Destaques, badges, numeros, elementos de atencao.' },
    { name: 'Terracotta', hex: '#C86A3B', rgb: '200, 106, 59', usage: 'Orcamentos, elementos quentes, contraste com verde.' },
    { name: 'Royal Blue', hex: '#1E40AF', rgb: '30, 64, 175', usage: 'Projetos, links, elementos de tecnologia.' },
    { name: 'Purple', hex: '#6B4C9A', rgb: '107, 76, 154', usage: 'Documentos emitidos, categorias especiais.' },
  ],
  neutral: [
    { name: 'Text Main', hex: '#1F2937', rgb: '31, 41, 55', usage: 'Texto principal, titulos de corpo.' },
    { name: 'Gray Text', hex: '#6B7280', rgb: '107, 114, 128', usage: 'Texto secundario, descricoes, labels.' },
    { name: 'Light Gray', hex: '#9CA3AF', rgb: '156, 163, 175', usage: 'Texto terciario, placeholders, icones inativos.' },
    { name: 'Sand BG', hex: '#F0F4F8', rgb: '240, 244, 248', usage: 'Background principal do site, areas neutras.' },
    { name: 'Border Green', hex: '#C8DDD5', rgb: '200, 221, 213', usage: 'Bordas sutis, divisores, separadores.' },
    { name: 'White', hex: '#FFFFFF', rgb: '255, 255, 255', usage: 'Cards, modais, areas de conteudo.' },
  ],
}

const FONTS = [
  {
    name: 'Inter',
    category: 'Sans-serif',
    role: 'Tipografia principal',
    weights: ['300 Light', '400 Regular', '500 Medium', '600 Semibold', '700 Bold', '800 Extra Bold'],
    usage: 'Corpo de texto, titulos, navegacao, interface completa. Fonte padrao do sistema.',
    sample: 'Instituto de Desenvolvimento Ambiental e Social da Amazonia',
    css: "'Inter', sans-serif",
  },
  {
    name: 'Rajdhani',
    category: 'Sans-serif Display',
    role: 'Documentos e PDFs',
    weights: ['400 Regular', '500 Medium', '600 Semibold', '700 Bold'],
    usage: 'Usada na geracao de PDFs (contratos, oficios, relatorios) e elementos tecnico-documentais.',
    sample: 'CONTRATO DE PRESTACAO DE SERVICOS N. 001/2026',
    css: "'Rajdhani', sans-serif",
  },
  {
    name: 'Georgia',
    category: 'Serif',
    role: 'Acentos editoriais',
    weights: ['400 Regular', '700 Bold'],
    usage: 'Citacoes, subtitulos editoriais, elementos formais em contextos especificos.',
    sample: 'Inovacao e Tecnologia para o Desenvolvimento da Amazonia',
    css: "'Georgia', serif",
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      className="p-1 rounded hover:bg-black/10 transition-colors"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      title="Copiar"
    >
      {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-gray-400" />}
    </button>
  )
}

function ColorSwatch({ color }: { color: { name: string; hex: string; rgb: string; usage: string } }) {
  const isLight = ['#FBBF24', '#F0F4F8', '#FFFFFF', '#C8DDD5'].includes(color.hex)
  return (
    <div className="group">
      <div
        className="h-28 rounded-xl mb-3 shadow-md group-hover:shadow-lg transition-shadow flex items-end p-3"
        style={{ backgroundColor: color.hex, border: isLight ? '1px solid #E5E7EB' : 'none' }}
      >
        <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-gray-600' : 'text-white/80'}`}>{color.hex}</span>
      </div>
      <h4 className="text-sm font-bold text-[#1F2937]">{color.name}</h4>
      <p className="text-[10px] font-mono text-gray-400 mb-1">RGB({color.rgb})</p>
      <p className="text-xs text-gray-500 leading-relaxed">{color.usage}</p>
      <CopyButton text={color.hex} />
    </div>
  )
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#2A5B46]/10 flex items-center justify-center">
          <Icon size={20} className="text-[#2A5B46]" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#1F2937]">{title}</h2>
      </div>
      <p className="text-gray-500 ml-[52px]">{subtitle}</p>
    </div>
  )
}

export default function BrandbookPage() {
  const [, navigate] = useLocation()

  return (
    <div className="font-inter min-h-screen bg-[#F8FAF9]">

      {/* ══════ HERO ══════ */}
      <header className="relative bg-gradient-to-br from-[#1a3a2e] via-[#2A5B46] to-[#1a5c38] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#FBBF24] blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-[#008080] blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-8">
            <ArrowLeft size={16} /> Voltar ao site
          </button>

          <div className="flex flex-col md:flex-row items-center gap-12 py-12">
            <div className="flex-shrink-0">
              <img src={LOGO_URL} alt="IDASAM Logo" className="w-40 h-40 md:w-52 md:h-52 drop-shadow-2xl" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#FBBF24] mb-4">Brand Guidelines</div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
                IDASAM<br />
                <span className="text-white/60 text-2xl md:text-3xl font-medium">Brandbook 2026</span>
              </h1>
              <p className="text-white/70 text-lg max-w-xl leading-relaxed">
                Guia completo de identidade visual do Instituto de Desenvolvimento Ambiental e Social da Amazonia.
                Cores, tipografia, logotipo, aplicacoes e padroes visuais.
              </p>
              <div className="flex items-center gap-4 mt-6 text-xs text-white/40">
                <span>CNPJ: 02.906.177/0001-87</span>
                <span>Fundado em 1996</span>
                <span>Manaus, AM</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══════ NAV SECTIONS ══════ */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#C8DDD5] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto py-2">
          {[
            { id: 'logo', label: 'Logotipo', icon: Image },
            { id: 'cores', label: 'Cores', icon: Palette },
            { id: 'tipografia', label: 'Tipografia', icon: Type },
            { id: 'identidade', label: 'Identidade', icon: BookOpen },
            { id: 'componentes', label: 'Componentes', icon: Grid3X3 },
            { id: 'aplicacoes', label: 'Aplicacoes', icon: Layout },
          ].map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-[#2A5B46] hover:bg-[#2A5B46]/5 transition-colors whitespace-nowrap"
            >
              <s.icon size={14} /> {s.label}
            </a>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16 space-y-28">

        {/* ══════ 1. LOGOTIPO ══════ */}
        <section id="logo">
          <SectionTitle icon={Image} title="Logotipo" subtitle="Marca principal e regras de uso" />

          {/* Variacoes de cor */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Original — verde escuro */}
            <div className="bg-white rounded-2xl p-8 shadow-md flex flex-col items-center justify-center border border-[#C8DDD5]">
              <img src={LOGO_URL} alt="IDASAM Logo" className="h-44 mb-4" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">Original (#004000)</span>
            </div>

            {/* Branca — sobre fundo escuro */}
            <div className="bg-[#1a3a2e] rounded-2xl p-8 shadow-md flex flex-col items-center justify-center">
              <img src={LOGO_URL} alt="IDASAM Logo" className="h-44 mb-4" style={{ filter: 'brightness(0) invert(1)' }} />
              <span className="text-xs text-white/40 font-medium uppercase tracking-widest">Branca (fundo escuro)</span>
            </div>

            {/* Preta — monocromatica */}
            <div className="bg-gray-100 rounded-2xl p-8 shadow-md flex flex-col items-center justify-center border border-gray-200">
              <img src={LOGO_URL} alt="IDASAM Logo" className="h-44 mb-4" style={{ filter: 'brightness(0)' }} />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">Preta (1 cor)</span>
            </div>

            {/* Forest Green — cor principal da marca */}
            <div className="bg-[#F0F4F8] rounded-2xl p-8 shadow-md flex flex-col items-center justify-center border border-[#C8DDD5]">
              <img src={LOGO_URL} alt="IDASAM Logo" className="h-44 mb-4" style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(15%) saturate(1800%) hue-rotate(100deg) brightness(95%) contrast(90%)' }} />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">Forest Green (#2A5B46)</span>
            </div>

            {/* Teal */}
            <div className="bg-white rounded-2xl p-8 shadow-md flex flex-col items-center justify-center border border-[#C8DDD5]">
              <img src={LOGO_URL} alt="IDASAM Logo" className="h-44 mb-4" style={{ filter: 'brightness(0) saturate(100%) invert(33%) sepia(80%) saturate(500%) hue-rotate(140deg) brightness(90%) contrast(100%)' }} />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">Teal (#008080)</span>
            </div>

            {/* Gold — sobre fundo escuro */}
            <div className="bg-[#2A5B46] rounded-2xl p-8 shadow-md flex flex-col items-center justify-center">
              <img src={LOGO_URL} alt="IDASAM Logo" className="h-44 mb-4" style={{ filter: 'brightness(0) saturate(100%) invert(76%) sepia(60%) saturate(600%) hue-rotate(5deg) brightness(100%) contrast(95%)' }} />
              <span className="text-xs text-white/40 font-medium uppercase tracking-widest">Gold (#FBBF24)</span>
            </div>
          </div>

          {/* Regras de uso */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-[#C8DDD5]">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <Check size={20} className="text-green-600" />
              </div>
              <h4 className="font-bold text-[#1F2937] mb-2">Area de protecao</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Mantenha uma margem minima equivalente a 25% da altura do logo ao redor da marca.
                Nenhum elemento visual deve invadir essa area.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-[#C8DDD5]">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <Check size={20} className="text-green-600" />
              </div>
              <h4 className="font-bold text-[#1F2937] mb-2">Tamanho minimo</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                O logotipo nao deve ser reproduzido em tamanhos menores que 40px de largura para digital
                ou 15mm para impressos, garantindo legibilidade.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-[#C8DDD5]">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                <Shield size={20} className="text-red-500" />
              </div>
              <h4 className="font-bold text-[#1F2937] mb-2">Usos proibidos</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Nao distorcer, rotacionar, alterar cores, adicionar efeitos (sombra, brilho) ou usar sobre
                fundos que comprometam a visibilidade.
              </p>
            </div>
          </div>
        </section>

        {/* ══════ 2. CORES ══════ */}
        <section id="cores">
          <SectionTitle icon={Palette} title="Paleta de Cores" subtitle="Sistema cromatico institucional" />

          <div className="space-y-12">
            {/* Primarias */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#2A5B46] mb-6 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#2A5B46]" /> Cores Primarias
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {COLORS.primary.map(c => <ColorSwatch key={c.hex} color={c} />)}
              </div>
            </div>

            {/* Secundarias */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#C86A3B] mb-6 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#C86A3B]" /> Cores Secundarias
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {COLORS.secondary.map(c => <ColorSwatch key={c.hex} color={c} />)}
              </div>
            </div>

            {/* Neutras */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#6B7280] mb-6 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#6B7280]" /> Cores Neutras
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {COLORS.neutral.map(c => <ColorSwatch key={c.hex} color={c} />)}
              </div>
            </div>

            {/* Gradiente institucional */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#2A5B46] mb-4">Gradiente Institucional</h3>
              <div className="h-20 rounded-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, #1a3a2e 0%, #2A5B46 35%, #4E8D7C 65%, #008080 100%)' }} />
              <p className="text-xs text-gray-400 mt-2 font-mono">
                linear-gradient(135deg, #1a3a2e 0%, #2A5B46 35%, #4E8D7C 65%, #008080 100%)
              </p>
            </div>
          </div>
        </section>

        {/* ══════ 3. TIPOGRAFIA ══════ */}
        <section id="tipografia">
          <SectionTitle icon={Type} title="Tipografia" subtitle="Familias tipograficas e hierarquia de texto" />

          <div className="space-y-8">
            {FONTS.map(f => (
              <div key={f.name} className="bg-white rounded-2xl p-8 border border-[#C8DDD5] shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl font-bold text-[#1F2937]">{f.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#2A5B46]/10 text-[#2A5B46]">
                        {f.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{f.category} &mdash; <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{f.css}</code></p>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{f.usage}</p>
                    <div className="flex flex-wrap gap-2">
                      {f.weights.map(w => (
                        <span key={w} className="text-[10px] px-2 py-1 rounded bg-gray-100 text-gray-500 font-mono">{w}</span>
                      ))}
                    </div>
                  </div>
                  <div className="md:w-1/2 bg-[#F0F4F8] rounded-xl p-6">
                    <p className="text-2xl text-[#1F2937] leading-relaxed" style={{ fontFamily: f.css }}>
                      {f.sample}
                    </p>
                    <p className="text-lg text-gray-400 mt-2" style={{ fontFamily: f.css }}>
                      Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
                    </p>
                    <p className="text-lg text-gray-400" style={{ fontFamily: f.css }}>
                      0 1 2 3 4 5 6 7 8 9 ! @ # $ % &amp; * ( )
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Escala tipografica */}
            <div className="bg-white rounded-2xl p-8 border border-[#C8DDD5]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#2A5B46] mb-6">Escala Tipografica</h3>
              <div className="space-y-4">
                {[
                  { size: '48px', weight: '800', label: 'Display / Hero', example: 'IDASAM' },
                  { size: '36px', weight: '700', label: 'H1 / Titulo de secao', example: 'Sobre o Instituto' },
                  { size: '24px', weight: '700', label: 'H2 / Subtitulo', example: 'Nossa Missao' },
                  { size: '18px', weight: '600', label: 'H3 / Titulo de card', example: 'Bioeconomia e Sustentabilidade' },
                  { size: '16px', weight: '400', label: 'Body / Texto principal', example: 'O IDASAM atua desde 1996 promovendo o desenvolvimento sustentavel na Amazonia.' },
                  { size: '14px', weight: '400', label: 'Small / Texto auxiliar', example: 'Capacitacao e formacao profissional para comunidades ribeirinhas' },
                  { size: '12px', weight: '600', label: 'Caption / Labels', example: 'PUBLICADO EM 07/04/2026' },
                  { size: '10px', weight: '700', label: 'Overline / Tracking wide', example: 'BRAND GUIDELINES 2026' },
                ].map((t, i) => (
                  <div key={i} className="flex items-baseline gap-6 py-3 border-b border-gray-100 last:border-0">
                    <div className="w-28 shrink-0 text-right">
                      <span className="text-[10px] font-mono text-gray-400">{t.size} / {t.weight}</span>
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: t.size, fontWeight: t.weight }} className="text-[#1F2937] leading-tight">
                        {t.example}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium shrink-0">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════ 4. IDENTIDADE ══════ */}
        <section id="identidade">
          <SectionTitle icon={BookOpen} title="Identidade Institucional" subtitle="Missao, visao, valores e posicionamento" />

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 border border-[#C8DDD5] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-[#2A5B46]/10 flex items-center justify-center mb-5">
                <Target size={28} className="text-[#2A5B46]" />
              </div>
              <h3 className="text-xl font-bold text-[#2A5B46] mb-3">Missao</h3>
              <p className="text-gray-600 leading-relaxed">
                Contribuir para um futuro mais sustentavel atraves da criacao de projetos e plataformas
                focados na inovacao tecnologica para o desenvolvimento da Amazonia.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-[#C8DDD5] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-[#008080]/10 flex items-center justify-center mb-5">
                <Eye size={28} className="text-[#008080]" />
              </div>
              <h3 className="text-xl font-bold text-[#008080] mb-3">Visao</h3>
              <p className="text-gray-600 leading-relaxed">
                Estabelecer uma organizacao de excelencia na geracao do conhecimento e na promocao de inovacoes
                com foco na construcao de um futuro mais sustentavel e um padrao de vida mais saudavel.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-[#C8DDD5] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center mb-5">
                <Heart size={28} className="text-[#FBBF24]" />
              </div>
              <h3 className="text-xl font-bold text-[#C86A3B] mb-3">Valores</h3>
              <p className="text-gray-600 leading-relaxed">
                Responsabilidade socioambiental, etica, transparencia, inovacao, compromisso com os Objetivos
                de Desenvolvimento Sustentavel (ODS) e respeito as comunidades amazonicas.
              </p>
            </div>
          </div>

          {/* Pilares */}
          <div className="bg-white rounded-2xl p-8 border border-[#C8DDD5]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#2A5B46] mb-6">Pilares de Atuacao</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: Leaf, label: 'Bioeconomia', color: '#2A5B46' },
                { icon: BookOpen, label: 'Educacao', color: '#1E40AF' },
                { icon: Globe, label: 'Meio Ambiente', color: '#008080' },
                { icon: Sun, label: 'Tecnologia Verde', color: '#FBBF24' },
                { icon: Droplets, label: 'Saude', color: '#C86A3B' },
                { icon: Layers, label: 'Pesquisa', color: '#6B4C9A' },
              ].map((p, i) => (
                <div key={i} className="text-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: p.color + '15' }}>
                    <p.icon size={24} style={{ color: p.color }} />
                  </div>
                  <span className="text-xs font-semibold text-[#1F2937]">{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tom de voz */}
          <div className="bg-white rounded-2xl p-8 border border-[#C8DDD5] mt-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#2A5B46] mb-6">Tom de Voz</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-[#1F2937] mb-3">Como nos comunicamos</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" /> <strong>Profissional e acessivel</strong> — linguagem tecnica quando necessario, mas sempre clara</li>
                  <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" /> <strong>Inspirador e propositivo</strong> — focamos em solucoes, nao apenas em problemas</li>
                  <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" /> <strong>Respeitoso e inclusivo</strong> — valorizamos a diversidade amazonica</li>
                  <li className="flex items-start gap-2"><Check size={14} className="text-green-500 mt-0.5 shrink-0" /> <strong>Baseado em dados</strong> — afirmacoes apoiadas por pesquisa e evidencias</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-[#1F2937] mb-3">O que evitamos</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2"><Shield size={14} className="text-red-400 mt-0.5 shrink-0" /> Linguagem excessivamente informal ou giriada</li>
                  <li className="flex items-start gap-2"><Shield size={14} className="text-red-400 mt-0.5 shrink-0" /> Tons alarmistas ou sensacionalistas sobre meio ambiente</li>
                  <li className="flex items-start gap-2"><Shield size={14} className="text-red-400 mt-0.5 shrink-0" /> Promessas que nao possamos cumprir</li>
                  <li className="flex items-start gap-2"><Shield size={14} className="text-red-400 mt-0.5 shrink-0" /> Apropriacoes culturais ou generalizacoes</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ 5. COMPONENTES ══════ */}
        <section id="componentes">
          <SectionTitle icon={Grid3X3} title="Componentes UI" subtitle="Padroes visuais do sistema digital" />

          {/* Botoes */}
          <div className="bg-white rounded-2xl p-8 border border-[#C8DDD5] mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#2A5B46] mb-6">Botoes</h3>
            <div className="flex flex-wrap gap-4 items-center mb-6">
              <button className="px-6 py-2.5 rounded-lg bg-[#2A5B46] text-white font-semibold text-sm hover:bg-[#1F4A38] transition-colors">Primario</button>
              <button className="px-6 py-2.5 rounded-lg bg-[#C86A3B] text-white font-semibold text-sm hover:bg-[#A8562F] transition-colors">Secundario</button>
              <button className="px-6 py-2.5 rounded-lg bg-[#008080] text-white font-semibold text-sm hover:bg-[#006060] transition-colors">Teal</button>
              <button className="px-6 py-2.5 rounded-lg bg-[#1E40AF] text-white font-semibold text-sm hover:bg-[#1e3a8a] transition-colors">Blue</button>
              <button className="px-6 py-2.5 rounded-lg border-2 border-[#2A5B46] text-[#2A5B46] font-semibold text-sm hover:bg-[#2A5B46]/5 transition-colors">Outline</button>
              <button className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-colors">Ghost</button>
            </div>
            <p className="text-xs text-gray-400">
              Border-radius: <code className="bg-gray-100 px-1 rounded">8px (rounded-lg)</code> &mdash;
              Padding: <code className="bg-gray-100 px-1 rounded">10px 24px</code> &mdash;
              Font: <code className="bg-gray-100 px-1 rounded">Inter 600 14px</code>
            </p>
          </div>

          {/* Cards */}
          <div className="bg-white rounded-2xl p-8 border border-[#C8DDD5] mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#2A5B46] mb-6">Cards</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#C8DDD5] hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-[#2A5B46]/10 flex items-center justify-center mb-4">
                  <Leaf size={24} className="text-[#2A5B46]" />
                </div>
                <h4 className="font-bold text-[#1F2937] mb-2">Card Padrao</h4>
                <p className="text-sm text-gray-500">rounded-2xl, shadow-lg, border C8DDD5, p-6</p>
              </div>
              <div className="bg-[#2A5B46] rounded-2xl p-6 shadow-lg text-white">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <Globe size={24} className="text-[#FBBF24]" />
                </div>
                <h4 className="font-bold mb-2">Card Dark</h4>
                <p className="text-sm text-white/60">bg-forest, text-white, shadow-lg</p>
              </div>
              <div className="bg-gradient-to-br from-[#2A5B46] to-[#008080] rounded-2xl p-6 shadow-lg text-white">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <Sun size={24} className="text-[#FBBF24]" />
                </div>
                <h4 className="font-bold mb-2">Card Gradient</h4>
                <p className="text-sm text-white/60">gradient forest→teal</p>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-2xl p-8 border border-[#C8DDD5]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#2A5B46] mb-6">Badges e Status</h3>
            <div className="flex flex-wrap gap-3">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">Ativo</span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700">Presidente</span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">Vice-Presidente</span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700">Diretor Adm.</span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-red-100 text-red-600">Revogado</span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-500">Inativo</span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-700">Assinar oficios</span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#FBBF24]/20 text-[#92710B]">Destaque</span>
            </div>
          </div>
        </section>

        {/* ══════ 6. APLICACOES ══════ */}
        <section id="aplicacoes">
          <SectionTitle icon={Layout} title="Aplicacoes" subtitle="Exemplos de uso da marca em diferentes contextos" />

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Documento PDF */}
            <div className="bg-white rounded-2xl p-8 border border-[#C8DDD5]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#2A5B46] mb-4">Documentos PDF</h3>
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#2A5B46] px-4 py-3">
                  <span className="text-white font-bold text-sm">IDASAM</span>
                  <p className="text-white/60 text-[10px]">Instituto de Desenvolvimento Ambiental e Social da Amazonia</p>
                </div>
                <div className="p-4 space-y-2">
                  <div className="h-2 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                  <div className="h-2 bg-gray-100 rounded w-full" />
                  <div className="h-2 bg-gray-100 rounded w-full" />
                  <div className="h-2 bg-gray-100 rounded w-2/3" />
                </div>
                <div className="bg-[#2A5B46] px-4 py-2">
                  <p className="text-white/60 text-[8px] text-center">WWW.IDASAM.ORG.BR  CNPJ: 02.906.177/0001-87</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Header verde + rodape verde. Corpo branco com tipografia Rajdhani ou Inter.</p>
            </div>

            {/* Email */}
            <div className="bg-white rounded-2xl p-8 border border-[#C8DDD5]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#2A5B46] mb-4">E-mail Institucional</h3>
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-[#2A5B46] to-[#4E8D7C] px-4 py-4 flex items-center gap-3">
                  <img src={LOGO_URL} alt="Logo" className="w-8 h-8" />
                  <span className="text-white font-bold text-sm">IDASAM</span>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm font-semibold text-[#1F2937]">Assunto do email</p>
                  <div className="h-2 bg-gray-100 rounded w-full" />
                  <div className="h-2 bg-gray-100 rounded w-full" />
                  <div className="h-2 bg-gray-100 rounded w-3/4" />
                  <button className="px-4 py-2 rounded-lg bg-[#2A5B46] text-white text-xs font-semibold">Saiba mais</button>
                </div>
                <div className="bg-gray-50 px-4 py-3 border-t">
                  <p className="text-[9px] text-gray-400 text-center">IDASAM &mdash; Manaus, AM | contato@idasam.org.br</p>
                </div>
              </div>
            </div>
          </div>

          {/* Selo de autenticacao */}
          <div className="bg-white rounded-2xl p-8 border border-[#C8DDD5]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#2A5B46] mb-4">Selo de Autenticacao Digital</h3>
            <div className="bg-[#F0F7F4] border border-[#2A5B46]/20 rounded-xl p-6 max-w-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-[#2A5B46] flex items-center justify-center">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2A5B46]">DOCUMENTO DIGITAL AUTENTICADO</p>
                  <p className="text-[10px] text-gray-500">Codigo: ATO-001/2026-A1B2C3D4</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400">
                Assinatura eletronica nos termos da Lei 14.063/2020. A autenticidade pode ser verificada
                pelo QR Code ou em idasam.org.br/validar.
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Presente em todos os documentos assinados digitalmente pela plataforma. Background verde suave, borda verde, icone Shield.
            </p>
          </div>
        </section>

        {/* ══════ FOOTER INFO ══════ */}
        <section className="bg-[#2A5B46] rounded-2xl p-10 text-white">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img src={LOGO_URL} alt="IDASAM" className="w-24 h-24" />
            <div>
              <h3 className="text-xl font-bold mb-2">IDASAM &mdash; Brandbook 2026</h3>
              <p className="text-white/60 text-sm leading-relaxed max-w-xl">
                Este guia define os padroes visuais e de comunicacao do Instituto de Desenvolvimento Ambiental
                e Social da Amazonia. Para duvidas sobre uso da marca, entre em contato: contato@idasam.org.br
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs text-white/40">
                <span>CNPJ: 02.906.177/0001-87</span>
                <span>Manaus, AM</span>
                <span>www.idasam.org.br</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
