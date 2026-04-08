import { useState } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, CheckCircle, Building2, User, Heart, Landmark, FlaskConical } from 'lucide-react';
import type { CrmStakeholderType } from '@shared/schema';

const TIPO_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  pj: { label: 'Pessoa Jurídica', icon: <Building2 className="w-5 h-5" /> },
  pf: { label: 'Pessoa Física', icon: <User className="w-5 h-5" /> },
  doador: { label: 'Doador', icon: <Heart className="w-5 h-5" /> },
  orgao_publico: { label: 'Órgão Público', icon: <Landmark className="w-5 h-5" /> },
  pesquisador: { label: 'Pesquisador', icon: <FlaskConical className="w-5 h-5" /> },
};

export default function RegistroPublicoPage() {
  const [, params] = useRoute('/registro/:tipo');
  const tipo = (params?.tipo || 'pj') as CrmStakeholderType;
  const config = TIPO_CONFIG[tipo] || TIPO_CONFIG.pj;

  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cidade: '', estado: '' });
  const [subform, setSubform] = useState<Record<string, any>>({});
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.nome || !form.email) { setError('Nome e e-mail são obrigatórios'); return; }
    if (!lgpdConsent) { setError('Consentimento LGPD é obrigatório'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/public/crm/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tipo, subdata: subform, lgpdConsent }),
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <h2 className="text-xl font-bold">Cadastro Realizado!</h2>
            <p className="text-sm text-gray-500">Obrigado por se cadastrar. O IDASAM entrará em contato em breve.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            {config.icon}
          </div>
          <CardTitle>Cadastro — {config.label}</CardTitle>
          <p className="text-sm text-gray-500">IDASAM — Instituto de Desenvolvimento da Amazônia</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Nome completo *</Label><Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
            <div><Label>E-mail *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><Label>Telefone</Label><Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} /></div>
            <div><Label>Cidade</Label><Input value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} /></div>
            <div><Label>Estado</Label><Input value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} /></div>
          </div>

          {tipo === 'pj' && (
            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div><Label>CNPJ</Label><Input value={subform.cnpj || ''} onChange={e => setSubform(f => ({ ...f, cnpj: e.target.value }))} /></div>
              <div><Label>Razão Social</Label><Input value={subform.razaoSocial || ''} onChange={e => setSubform(f => ({ ...f, razaoSocial: e.target.value }))} /></div>
            </div>
          )}
          {tipo === 'pf' && (
            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div><Label>CPF</Label><Input value={subform.cpf || ''} onChange={e => setSubform(f => ({ ...f, cpf: e.target.value }))} /></div>
              <div><Label>Profissão</Label><Input value={subform.profissao || ''} onChange={e => setSubform(f => ({ ...f, profissao: e.target.value }))} /></div>
            </div>
          )}
          {tipo === 'pesquisador' && (
            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div><Label>Instituição</Label><Input value={subform.instituicao || ''} onChange={e => setSubform(f => ({ ...f, instituicao: e.target.value }))} /></div>
              <div><Label>Área de Atuação</Label><Input value={subform.areaAtuacao || ''} onChange={e => setSubform(f => ({ ...f, areaAtuacao: e.target.value }))} /></div>
              <div><Label>Lattes</Label><Input value={subform.lattes || ''} onChange={e => setSubform(f => ({ ...f, lattes: e.target.value }))} /></div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
            <p><strong>LGPD:</strong> Seus dados serão tratados conforme a Lei 13.709/2018 para fins de relacionamento institucional.</p>
            <p>Você pode solicitar exclusão a qualquer momento via contato@idasam.org.</p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="lgpd" checked={lgpdConsent} onCheckedChange={(v) => setLgpdConsent(!!v)} />
            <label htmlFor="lgpd" className="text-sm text-gray-700">
              Li e concordo com o tratamento dos meus dados conforme a LGPD *
            </label>
          </div>

          <Button className="w-full" size="lg" onClick={handleSubmit} disabled={loading}>
            <Shield className="w-4 h-4 mr-2" />
            {loading ? 'Cadastrando...' : 'Realizar Cadastro'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
