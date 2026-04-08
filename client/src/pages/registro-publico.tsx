import { useState } from 'react';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Shield, CheckCircle, Building2, User, Heart, FlaskConical,
  Mail, Phone, MapPin, Briefcase, GraduationCap, TreePine,
  Linkedin, Instagram, Facebook
} from 'lucide-react';
import type { CrmStakeholderType } from '@shared/schema';

const TIPO_CONFIG: Record<string, {
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  accentColor: string;
  bgPattern: string;
  heroText: string;
}> = {
  pj: {
    label: 'Pessoa Jurídica',
    subtitle: 'Cadastro Empresarial',
    icon: <Building2 className="w-8 h-8" />,
    gradient: 'from-[#2A5B46] via-[#3a7a5e] to-[#4E8D7C]',
    accentColor: '#2A5B46',
    bgPattern: 'radial-gradient(circle at 20% 80%, rgba(42,91,70,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(78,141,124,0.06) 0%, transparent 50%)',
    heroText: 'Conecte sua empresa ao desenvolvimento sustentável da Amazônia.',
  },
  pf: {
    label: 'Pessoa Física',
    subtitle: 'Cadastro Individual',
    icon: <User className="w-8 h-8" />,
    gradient: 'from-[#2A5B46] via-[#3a7a5e] to-[#4E8D7C]',
    accentColor: '#2A5B46',
    bgPattern: 'radial-gradient(circle at 30% 70%, rgba(42,91,70,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(78,141,124,0.06) 0%, transparent 50%)',
    heroText: 'Faça parte da rede de colaboradores que transformam a Amazônia.',
  },
  doador: {
    label: 'Doador',
    subtitle: 'Cadastro de Apoiador',
    icon: <Heart className="w-8 h-8" />,
    gradient: 'from-[#2A5B46] via-[#3a7a5e] to-[#4E8D7C]',
    accentColor: '#2A5B46',
    bgPattern: 'radial-gradient(circle at 25% 75%, rgba(42,91,70,0.08) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(220,50,100,0.04) 0%, transparent 50%)',
    heroText: 'Seu apoio transforma vidas e preserva o maior bioma do planeta.',
  },
  pesquisador: {
    label: 'Pesquisador',
    subtitle: 'Cadastro Acadêmico',
    icon: <FlaskConical className="w-8 h-8" />,
    gradient: 'from-[#2A5B46] via-[#3a7a5e] to-[#4E8D7C]',
    accentColor: '#2A5B46',
    bgPattern: 'radial-gradient(circle at 35% 65%, rgba(42,91,70,0.08) 0%, transparent 50%), radial-gradient(circle at 65% 35%, rgba(78,141,124,0.06) 0%, transparent 50%)',
    heroText: 'Colabore com pesquisas que impactam o futuro da Amazônia.',
  },
};

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

export default function RegistroPublicoPage() {
  const [, params] = useRoute('/registro/:tipo');
  const tipo = (params?.tipo || 'pj') as CrmStakeholderType;
  const config = TIPO_CONFIG[tipo] || TIPO_CONFIG.pj;

  const [form, setForm] = useState({
    nome: '', email: '', telefone: '', endereco: '', cidade: '', estado: '', cep: '', observacoes: '',
  });
  const [subform, setSubform] = useState<Record<string, any>>({});
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const setSub = (k: string, v: string) => setSubform(f => ({ ...f, [k]: v }));

  const validateStep1 = () => {
    if (!form.nome.trim()) return 'Nome é obrigatório';
    if (!form.email.trim()) return 'E-mail é obrigatório';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'E-mail inválido';
    return '';
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!lgpdConsent) { setError('Consentimento LGPD é obrigatório para prosseguir'); return; }
    setError('');
    setLoading(true);
    try {
      const finalForm = { ...form };
      if (tipo === 'pj' && (subform.nomeFantasia || subform.razaoSocial)) {
        finalForm.nome = subform.nomeFantasia || subform.razaoSocial;
      }
      const res = await fetch('/api/public/crm/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...finalForm, tipo, subdata: subform, lgpdConsent }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || 'Erro no cadastro');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: config.bgPattern, backgroundColor: '#f8faf9' }}>
        <div className="max-w-md w-full mx-4 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${config.accentColor}, #4E8D7C)` }}>
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Cadastro Realizado!</h2>
            <p className="text-gray-500 mb-6">
              Obrigado por se cadastrar no IDASAM. Nossa equipe entrará em contato em breve para dar continuidade.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Shield className="w-4 h-4" />
              Seus dados estão protegidos conforme a LGPD
            </div>
          </div>
        </div>
        <IdasamFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: config.bgPattern, backgroundColor: '#f8faf9' }}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${config.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="max-w-2xl mx-auto px-6 py-10 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-white border border-white/20">
              {config.icon}
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium tracking-wider uppercase">{config.subtitle}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{config.label}</h1>
            </div>
          </div>
          <p className="text-white/80 text-sm md:text-base max-w-lg leading-relaxed">
            {config.heroText}
          </p>
          {/* Steps indicator */}
          <div className="flex items-center gap-3 mt-8">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${step >= 1 ? 'bg-white text-[#2A5B46]' : 'bg-white/20 text-white/60'}`}>
              <span className="w-5 h-5 rounded-full bg-[#2A5B46] text-white flex items-center justify-center text-[10px]">1</span>
              Dados Pessoais
            </div>
            <div className="w-8 h-px bg-white/30" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${step >= 2 ? 'bg-white text-[#2A5B46]' : 'bg-white/20 text-white/60'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-[#2A5B46] text-white' : 'bg-white/30 text-white/60'}`}>2</span>
              {tipo === 'pj' ? 'Dados Empresa' : tipo === 'doador' ? 'Dados Doação' : tipo === 'pesquisador' ? 'Dados Acadêmicos' : 'Dados Complementares'}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 -mt-4 pb-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {error && (
            <div className="bg-red-50 border-b border-red-100 px-6 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="p-6 md:p-8 space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Informações de Contato</h3>
                <p className="text-sm text-gray-500">Preencha seus dados pessoais para iniciar o cadastro.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">{tipo === 'pj' ? 'Nome do Proprietário / Responsável *' : 'Nome completo *'}</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input className="pl-10" placeholder={tipo === 'pj' ? 'Nome do responsável legal' : 'Seu nome completo'} value={form.nome} onChange={e => set('nome', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">E-mail *</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input className="pl-10" type="email" placeholder="seu@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Telefone</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input className="pl-10" placeholder="(00) 00000-0000" value={form.telefone} onChange={e => set('telefone', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Endereço</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input className="pl-10" placeholder="Rua, número, bairro" value={form.endereco} onChange={e => set('endereco', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Cidade</Label>
                    <Input className="mt-1" placeholder="Sua cidade" value={form.cidade} onChange={e => set('cidade', e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Estado</Label>
                    <Select value={form.estado} onValueChange={v => set('estado', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="UF" /></SelectTrigger>
                      <SelectContent>
                        {ESTADOS_BR.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">CEP</Label>
                    <Input className="mt-1" placeholder="00000-000" value={form.cep} onChange={e => set('cep', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button size="lg" onClick={handleNext} style={{ background: config.accentColor }} className="hover:opacity-90 text-white px-8">
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-6 md:p-8 space-y-5">
              {/* PJ Fields */}
              {tipo === 'pj' && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2"><Building2 className="w-5 h-5" style={{ color: config.accentColor }} /> Dados da Empresa</h3>
                    <p className="text-sm text-gray-500">Informações da pessoa jurídica.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label className="text-sm font-medium text-gray-700">CNPJ *</Label><Input className="mt-1" placeholder="00.000.000/0000-00" value={subform.cnpj || ''} onChange={e => setSub('cnpj', e.target.value)} /></div>
                      <div><Label className="text-sm font-medium text-gray-700">Razão Social *</Label><Input className="mt-1" placeholder="Razão social da empresa" value={subform.razaoSocial || ''} onChange={e => setSub('razaoSocial', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label className="text-sm font-medium text-gray-700">Nome Fantasia</Label><Input className="mt-1" placeholder="Nome fantasia" value={subform.nomeFantasia || ''} onChange={e => setSub('nomeFantasia', e.target.value)} /></div>
                      <div><Label className="text-sm font-medium text-gray-700">Segmento</Label><Input className="mt-1" placeholder="Ex: Tecnologia, Agronegócio" value={subform.segmento || ''} onChange={e => setSub('segmento', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Porte</Label>
                        <Select value={subform.porte || ''} onValueChange={v => setSub('porte', v)}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEI">MEI</SelectItem>
                            <SelectItem value="ME">ME</SelectItem>
                            <SelectItem value="EPP">EPP</SelectItem>
                            <SelectItem value="Médio">Médio</SelectItem>
                            <SelectItem value="Grande">Grande</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-sm font-medium text-gray-700">Inscrição Estadual</Label><Input className="mt-1" value={subform.inscricaoEstadual || ''} onChange={e => setSub('inscricaoEstadual', e.target.value)} /></div>
                      <div><Label className="text-sm font-medium text-gray-700">Inscrição Municipal</Label><Input className="mt-1" value={subform.inscricaoMunicipal || ''} onChange={e => setSub('inscricaoMunicipal', e.target.value)} /></div>
                    </div>
                  </div>
                </>
              )}

              {/* PF Fields */}
              {tipo === 'pf' && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2"><User className="w-5 h-5" style={{ color: config.accentColor }} /> Dados Pessoais</h3>
                    <p className="text-sm text-gray-500">Informações complementares.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label className="text-sm font-medium text-gray-700">CPF *</Label><Input className="mt-1" placeholder="000.000.000-00" value={subform.cpf || ''} onChange={e => setSub('cpf', e.target.value)} /></div>
                      <div><Label className="text-sm font-medium text-gray-700">RG</Label><Input className="mt-1" placeholder="Número do RG" value={subform.rg || ''} onChange={e => setSub('rg', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><Label className="text-sm font-medium text-gray-700">Data de Nascimento</Label><Input className="mt-1" type="date" value={subform.dataNascimento || ''} onChange={e => setSub('dataNascimento', e.target.value)} /></div>
                      <div><Label className="text-sm font-medium text-gray-700">Profissão</Label><Input className="mt-1" placeholder="Sua profissão" value={subform.profissao || ''} onChange={e => setSub('profissao', e.target.value)} /></div>
                      <div><Label className="text-sm font-medium text-gray-700">Nacionalidade</Label><Input className="mt-1" placeholder="Brasileira" value={subform.nacionalidade || ''} onChange={e => setSub('nacionalidade', e.target.value)} /></div>
                    </div>
                  </div>
                </>
              )}

              {/* Doador Fields */}
              {tipo === 'doador' && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2"><Heart className="w-5 h-5" style={{ color: config.accentColor }} /> Informações de Doação</h3>
                    <p className="text-sm text-gray-500">Ajude-nos a direcionar seu apoio da melhor forma.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Tipo de Doador</Label>
                        <Select value={subform.tipoDoador || 'pf'} onValueChange={v => setSub('tipoDoador', v)}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pf">Pessoa Física</SelectItem>
                            <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                            <SelectItem value="internacional">Internacional</SelectItem>
                            <SelectItem value="fundo">Fundo / Fundação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-sm font-medium text-gray-700">CPF / CNPJ</Label><Input className="mt-1" placeholder="Documento" value={subform.cpfCnpj || ''} onChange={e => setSub('cpfCnpj', e.target.value)} /></div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Área de Interesse</Label>
                      <Select value={subform.areaInteresse || ''} onValueChange={v => setSub('areaInteresse', v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione uma área" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Conservação ambiental">Conservação Ambiental</SelectItem>
                          <SelectItem value="Bioeconomia">Bioeconomia</SelectItem>
                          <SelectItem value="Educação e capacitação">Educação e Capacitação</SelectItem>
                          <SelectItem value="Pesquisa científica">Pesquisa Científica</SelectItem>
                          <SelectItem value="Desenvolvimento social">Desenvolvimento Social</SelectItem>
                          <SelectItem value="Tecnologia sustentável">Tecnologia Sustentável</SelectItem>
                          <SelectItem value="Geral">Geral — Onde mais precisar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-4 rounded-xl border border-dashed border-[#2A5B46]/30 bg-[#2A5B46]/5">
                      <div className="flex items-start gap-3">
                        <TreePine className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: config.accentColor }} />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium text-gray-800 mb-1">Cada doação faz a diferença</p>
                          <p>O IDASAM é uma organização sem fins lucrativos. Todas as doações são direcionadas integralmente para projetos de desenvolvimento sustentável na Amazônia.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Pesquisador Fields */}
              {tipo === 'pesquisador' && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2"><GraduationCap className="w-5 h-5" style={{ color: config.accentColor }} /> Dados Acadêmicos</h3>
                    <p className="text-sm text-gray-500">Informações sobre sua trajetória acadêmica e pesquisa.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label className="text-sm font-medium text-gray-700">CPF</Label><Input className="mt-1" placeholder="000.000.000-00" value={subform.cpf || ''} onChange={e => setSub('cpf', e.target.value)} /></div>
                      <div><Label className="text-sm font-medium text-gray-700">Instituição *</Label><Input className="mt-1" placeholder="Ex: UFAM, INPA, UEA" value={subform.instituicao || ''} onChange={e => setSub('instituicao', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Titulação</Label>
                        <Select value={subform.titulacao || ''} onValueChange={v => setSub('titulacao', v)}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="graduacao">Graduação</SelectItem>
                            <SelectItem value="especializacao">Especialização</SelectItem>
                            <SelectItem value="mestrado">Mestrado</SelectItem>
                            <SelectItem value="doutorado">Doutorado</SelectItem>
                            <SelectItem value="pos_doutorado">Pós-Doutorado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-sm font-medium text-gray-700">Área de Atuação</Label><Input className="mt-1" placeholder="Ex: Ecologia, Eng. Ambiental" value={subform.areaAtuacao || ''} onChange={e => setSub('areaAtuacao', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label className="text-sm font-medium text-gray-700">Lattes</Label><Input className="mt-1" placeholder="URL do currículo Lattes" value={subform.lattes || ''} onChange={e => setSub('lattes', e.target.value)} /></div>
                      <div><Label className="text-sm font-medium text-gray-700">ORCID</Label><Input className="mt-1" placeholder="0000-0000-0000-0000" value={subform.orcid || ''} onChange={e => setSub('orcid', e.target.value)} /></div>
                    </div>
                    <div><Label className="text-sm font-medium text-gray-700">Grupos de Pesquisa</Label><Input className="mt-1" placeholder="Grupos de pesquisa que participa" value={subform.gruposPesquisa || ''} onChange={e => setSub('gruposPesquisa', e.target.value)} /></div>
                  </div>
                </>
              )}

              {/* Observações */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Observações (opcional)</Label>
                <Textarea className="mt-1" rows={3} placeholder="Algo mais que gostaria de compartilhar?" value={form.observacoes} onChange={e => set('observacoes', e.target.value)} />
              </div>

              {/* LGPD */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4" style={{ color: config.accentColor }} />
                  <span className="text-sm font-semibold text-gray-800">Proteção de Dados — LGPD</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1.5">
                  <p><strong>Finalidade:</strong> Gestão de relacionamento institucional, comunicação e prestação de serviços pelo IDASAM.</p>
                  <p><strong>Dados tratados:</strong> Nome, e-mail, telefone, endereço e dados profissionais/institucionais informados neste formulário.</p>
                  <p><strong>Compartilhamento:</strong> Seus dados não serão compartilhados com terceiros sem seu consentimento prévio.</p>
                  <p><strong>Seus direitos:</strong> Você pode solicitar a exclusão, correção ou portabilidade dos seus dados a qualquer momento pelo e-mail <strong>contato@idasam.org</strong>.</p>
                  <p><strong>Base legal:</strong> Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
                </div>
                <div className="flex items-start space-x-3 pt-2 border-t border-gray-200">
                  <Checkbox id="lgpd" checked={lgpdConsent} onCheckedChange={(v) => setLgpdConsent(!!v)} className="mt-0.5" />
                  <label htmlFor="lgpd" className="text-sm text-gray-700 leading-snug cursor-pointer">
                    Li e concordo com o tratamento dos meus dados pessoais conforme descrito acima, nos termos da LGPD. *
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => { setStep(1); setError(''); }}>
                  Voltar
                </Button>
                <Button size="lg" onClick={handleSubmit} disabled={loading} style={{ background: config.accentColor }} className="hover:opacity-90 text-white px-8">
                  {loading ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" /> Cadastrando...</>
                  ) : (
                    <><Shield className="w-4 h-4 mr-2" /> Finalizar Cadastro</>
                  )}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer IDASAM */}
      <IdasamFooter />
    </div>
  );
}

function IdasamFooter() {
  return (
    <footer className="bg-forest text-white py-14 px-4 mt-12">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div>
            <img src="https://i.imgur.com/01OfFEi.png" alt="IDASAM" className="w-[120px] h-auto object-contain mb-4" />
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              Inovação e Tecnologia para o Desenvolvimento da Amazônia.
            </p>
            <div className="flex items-start gap-2 text-gray-300 text-xs mb-4">
              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Centro Empresarial Art Center, 3694, Manaus - AM</span>
            </div>
            <div className="flex gap-3">
              <a href="#" className="text-gray-300 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Institucional</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/#quem-somos" className="hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="/noticias" className="hover:text-white transition-colors">Notícias</a></li>
              <li><a href="/projetos" className="hover:text-white transition-colors">Projetos</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Capacitação</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/capacitacao" className="hover:text-white transition-colors">Cursos 2026</a></li>
              <li><a href="/meu-certificado" className="hover:text-white transition-colors">Meu Certificado</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Transparência</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/transparencia" className="hover:text-white transition-colors">Legislação</a></li>
              <li><a href="/transparencia" className="hover:text-white transition-colors">Relatórios</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-600 pt-6 text-center">
          <p className="text-xs text-gray-300 leading-relaxed max-w-3xl mx-auto mb-3">
            O Instituto de Desenvolvimento Ambiental e Social da Amazônia — IDASAM (CNPJ: 02.906.177/0001-87)
            cumpre rigorosamente as leis brasileiras, assegurando transparência, ética e integridade em todas as suas atividades.
          </p>
          <p className="text-xs text-gray-400">© 2024 IDASAM. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
