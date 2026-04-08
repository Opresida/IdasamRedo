import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Plus, Search, Edit, Trash2, Eye, Send, FileText,
  Building2, User, Heart, Landmark, FlaskConical,
  Shield, Copy, ExternalLink, MessageCircle
} from 'lucide-react';
import type { CrmStakeholder, CrmStakeholderType } from '@shared/schema';

const TIPO_LABELS: Record<CrmStakeholderType, { label: string; icon: React.ReactNode; color: string }> = {
  pj: { label: 'Pessoa Jurídica', icon: <Building2 className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
  pf: { label: 'Pessoa Física', icon: <User className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
  doador: { label: 'Doador', icon: <Heart className="w-4 h-4" />, color: 'bg-pink-100 text-pink-700' },
  orgao_publico: { label: 'Órgão Público', icon: <Landmark className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700' },
  pesquisador: { label: 'Pesquisador', icon: <FlaskConical className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700' },
};

const STATUS_BADGE: Record<string, string> = {
  ativo: 'bg-green-100 text-green-700',
  inativo: 'bg-gray-100 text-gray-600',
  pendente_lgpd: 'bg-yellow-100 text-yellow-700',
};

export default function CrmPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStakeholder, setSelectedStakeholder] = useState<any>(null);
  const [activeDetailTab, setActiveDetailTab] = useState('info');

  // Form state
  const [form, setForm] = useState({
    tipo: 'pj' as CrmStakeholderType,
    nome: '', email: '', telefone: '', endereco: '', cidade: '', estado: '', cep: '', observacoes: '',
  });
  const [subform, setSubform] = useState<Record<string, any>>({});

  const { data: stakeholders = [], isLoading } = useQuery<CrmStakeholder[]>({
    queryKey: ['/api/admin/crm/stakeholders'],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/admin/crm/stakeholders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/crm/stakeholders'] });
      setShowForm(false);
      resetForm();
      toast({ title: 'Stakeholder cadastrado com sucesso' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest('PATCH', `/api/admin/crm/stakeholders/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/crm/stakeholders'] });
      setShowForm(false);
      resetForm();
      toast({ title: 'Stakeholder atualizado' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/crm/stakeholders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/crm/stakeholders'] });
      toast({ title: 'Stakeholder removido' });
    },
  });

  const resetForm = () => {
    setForm({ tipo: 'pj', nome: '', email: '', telefone: '', endereco: '', cidade: '', estado: '', cep: '', observacoes: '' });
    setSubform({});
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!form.nome || !form.email) {
      toast({ title: 'Preencha nome e e-mail', variant: 'destructive' });
      return;
    }
    const payload = { ...form, subdata: subform };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = async (s: CrmStakeholder) => {
    const res = await fetch(`/api/admin/crm/stakeholders/${s.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
    });
    const full = await res.json();
    setForm({
      tipo: full.tipo,
      nome: full.nome,
      email: full.email,
      telefone: full.telefone || '',
      endereco: full.endereco || '',
      cidade: full.cidade || '',
      estado: full.estado || '',
      cep: full.cep || '',
      observacoes: full.observacoes || '',
    });
    setSubform(full.subdata || {});
    setEditingId(full.id);
    setShowForm(true);
  };

  const handleViewDetail = async (s: CrmStakeholder) => {
    const res = await fetch(`/api/admin/crm/stakeholders/${s.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
    });
    const full = await res.json();
    setSelectedStakeholder(full);
    setActiveDetailTab('info');
    setShowDetail(true);
  };

  const copyLgpdLink = (token: string) => {
    const link = `${window.location.origin}/lgpd/${token}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Link LGPD copiado!' });
  };

  const copyPublicLink = (tipo: string) => {
    const link = `${window.location.origin}/registro/${tipo}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Link de registro público copiado!' });
  };

  const filtered = stakeholders.filter(s => {
    const matchSearch = !search || s.nome.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filterTipo === 'all' || s.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  const counts = {
    total: stakeholders.length,
    pj: stakeholders.filter(s => s.tipo === 'pj').length,
    pf: stakeholders.filter(s => s.tipo === 'pf').length,
    doador: stakeholders.filter(s => s.tipo === 'doador').length,
    orgao_publico: stakeholders.filter(s => s.tipo === 'orgao_publico').length,
    pesquisador: stakeholders.filter(s => s.tipo === 'pesquisador').length,
    pendente_lgpd: stakeholders.filter(s => s.status === 'pendente_lgpd').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM — Stakeholders</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão de partes interessadas do IDASAM</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => copyPublicLink('pj')}>
            <ExternalLink className="w-4 h-4 mr-1" /> Link Público
          </Button>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Novo Stakeholder
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total', value: counts.total, color: 'text-gray-700' },
          { label: 'PJ', value: counts.pj, color: 'text-blue-600' },
          { label: 'PF', value: counts.pf, color: 'text-green-600' },
          { label: 'Doadores', value: counts.doador, color: 'text-pink-600' },
          { label: 'Órgãos', value: counts.orgao_publico, color: 'text-purple-600' },
          { label: 'Pesquisadores', value: counts.pesquisador, color: 'text-amber-600' },
          { label: 'Pendente LGPD', value: counts.pendente_lgpd, color: 'text-yellow-600' },
        ].map(stat => (
          <Card key={stat.label} className="p-3">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Buscar por nome ou e-mail..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="pj">Pessoa Jurídica</SelectItem>
            <SelectItem value="pf">Pessoa Física</SelectItem>
            <SelectItem value="doador">Doador</SelectItem>
            <SelectItem value="orgao_publico">Órgão Público</SelectItem>
            <SelectItem value="pesquisador">Pesquisador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>LGPD</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">Carregando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-400">Nenhum stakeholder encontrado</TableCell></TableRow>
            ) : filtered.map(s => {
              const tipo = TIPO_LABELS[s.tipo as CrmStakeholderType];
              return (
                <TableRow key={s.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewDetail(s)}>
                  <TableCell className="font-medium">{s.nome}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={tipo?.color || ''}>
                      <span className="mr-1">{tipo?.icon}</span> {tipo?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{s.email}</TableCell>
                  <TableCell className="text-sm text-gray-600">{s.telefone || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={STATUS_BADGE[s.status] || ''}>
                      {s.status === 'pendente_lgpd' ? 'Pendente LGPD' : s.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {s.lgpdConsentimento ? (
                      <Shield className="w-4 h-4 text-green-600" />
                    ) : (
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyLgpdLink(s.tokenPublico || ''); }}>
                        <Send className="w-3 h-3 mr-1" /> Enviar
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => {
                        if (confirm('Remover este stakeholder?')) deleteMutation.mutate(s.id);
                      }}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Stakeholder' : 'Novo Stakeholder'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo *</Label>
              <Select value={form.tipo} onValueChange={(v) => { setForm(f => ({ ...f, tipo: v as CrmStakeholderType })); setSubform({}); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                  <SelectItem value="pf">Pessoa Física</SelectItem>
                  <SelectItem value="doador">Doador</SelectItem>
                  <SelectItem value="orgao_publico">Órgão Público</SelectItem>
                  <SelectItem value="pesquisador">Pesquisador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
              <div><Label>E-mail *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><Label>Telefone</Label><Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} /></div>
              <div><Label>CEP</Label><Input value={form.cep} onChange={e => setForm(f => ({ ...f, cep: e.target.value }))} /></div>
              <div><Label>Cidade</Label><Input value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} /></div>
              <div><Label>Estado</Label><Input value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} /></div>
            </div>
            <div><Label>Endereço</Label><Input value={form.endereco} onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} /></div>
            <div><Label>Observações</Label><Textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} rows={3} /></div>

            {/* Type-specific fields */}
            {form.tipo === 'pj' && <PjFields subform={subform} setSubform={setSubform} />}
            {form.tipo === 'pf' && <PfFields subform={subform} setSubform={setSubform} />}
            {form.tipo === 'doador' && <DoadorFields subform={subform} setSubform={setSubform} />}
            {form.tipo === 'orgao_publico' && <OrgaoFields subform={subform} setSubform={setSubform} />}
            {form.tipo === 'pesquisador' && <PesquisadorFields subform={subform} setSubform={setSubform} />}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedStakeholder && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="text-lg">{TIPO_LABELS[selectedStakeholder.tipo as CrmStakeholderType]?.icon}</div>
                  <div>
                    <DialogTitle>{selectedStakeholder.nome}</DialogTitle>
                    <p className="text-sm text-gray-500">{selectedStakeholder.email}</p>
                  </div>
                  <Badge variant="secondary" className={STATUS_BADGE[selectedStakeholder.status] || ''}>
                    {selectedStakeholder.status === 'pendente_lgpd' ? 'Pendente LGPD' : selectedStakeholder.status}
                  </Badge>
                </div>
              </DialogHeader>
              <Tabs value={activeDetailTab} onValueChange={setActiveDetailTab}>
                <TabsList>
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="interacoes">Interações</TabsTrigger>
                  <TabsTrigger value="documentos">Documentos</TabsTrigger>
                  {selectedStakeholder.tipo === 'doador' && <TabsTrigger value="recibos">Recibos</TabsTrigger>}
                </TabsList>
                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Telefone:</span> {selectedStakeholder.telefone || '—'}</div>
                    <div><span className="text-gray-500">Cidade:</span> {selectedStakeholder.cidade || '—'}, {selectedStakeholder.estado || ''}</div>
                    <div className="col-span-2"><span className="text-gray-500">Endereço:</span> {selectedStakeholder.endereco || '—'}</div>
                    {selectedStakeholder.observacoes && <div className="col-span-2"><span className="text-gray-500">Obs:</span> {selectedStakeholder.observacoes}</div>}
                  </div>
                  {selectedStakeholder.subdata && (
                    <Card className="p-4">
                      <h4 className="text-sm font-semibold mb-2">Dados Específicos ({TIPO_LABELS[selectedStakeholder.tipo as CrmStakeholderType]?.label})</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(selectedStakeholder.subdata).filter(([k]) => k !== 'id' && k !== 'stakeholderId').map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-500">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:</span>{' '}
                            {String(value) || '—'}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className={`w-4 h-4 ${selectedStakeholder.lgpdConsentimento ? 'text-green-600' : 'text-yellow-500'}`} />
                    {selectedStakeholder.lgpdConsentimento
                      ? `LGPD consentido em ${new Date(selectedStakeholder.lgpdConsentidoEm).toLocaleString('pt-BR')}`
                      : 'Consentimento LGPD pendente'}
                    {!selectedStakeholder.lgpdConsentimento && selectedStakeholder.tokenPublico && (
                      <Button variant="outline" size="sm" onClick={() => copyLgpdLink(selectedStakeholder.tokenPublico)}>
                        <Copy className="w-3 h-3 mr-1" /> Copiar Link LGPD
                      </Button>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="interacoes">
                  <InteracoesTab stakeholderId={selectedStakeholder.id} />
                </TabsContent>
                <TabsContent value="documentos">
                  <DocumentosTab stakeholderId={selectedStakeholder.id} />
                </TabsContent>
                {selectedStakeholder.tipo === 'doador' && (
                  <TabsContent value="recibos">
                    <RecibosTab stakeholderId={selectedStakeholder.id} />
                  </TabsContent>
                )}
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Type-specific form fields ──

function PjFields({ subform, setSubform }: { subform: Record<string, any>; setSubform: (f: Record<string, any>) => void }) {
  const set = (k: string, v: string) => setSubform({ ...subform, [k]: v });
  return (
    <Card className="p-4 space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2"><Building2 className="w-4 h-4" /> Dados da Pessoa Jurídica</h4>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>CNPJ *</Label><Input value={subform.cnpj || ''} onChange={e => set('cnpj', e.target.value)} /></div>
        <div><Label>Razão Social *</Label><Input value={subform.razaoSocial || ''} onChange={e => set('razaoSocial', e.target.value)} /></div>
        <div><Label>Nome Fantasia</Label><Input value={subform.nomeFantasia || ''} onChange={e => set('nomeFantasia', e.target.value)} /></div>
        <div><Label>Segmento</Label><Input value={subform.segmento || ''} onChange={e => set('segmento', e.target.value)} /></div>
        <div><Label>Porte</Label><Input value={subform.porte || ''} onChange={e => set('porte', e.target.value)} placeholder="MEI, ME, EPP, Médio, Grande" /></div>
        <div><Label>Inscrição Estadual</Label><Input value={subform.inscricaoEstadual || ''} onChange={e => set('inscricaoEstadual', e.target.value)} /></div>
      </div>
      <h5 className="text-xs font-semibold text-gray-500 mt-2">Responsável</h5>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Nome</Label><Input value={subform.responsavelNome || ''} onChange={e => set('responsavelNome', e.target.value)} /></div>
        <div><Label>Cargo</Label><Input value={subform.responsavelCargo || ''} onChange={e => set('responsavelCargo', e.target.value)} /></div>
        <div><Label>Telefone</Label><Input value={subform.responsavelTelefone || ''} onChange={e => set('responsavelTelefone', e.target.value)} /></div>
        <div><Label>E-mail</Label><Input value={subform.responsavelEmail || ''} onChange={e => set('responsavelEmail', e.target.value)} /></div>
      </div>
    </Card>
  );
}

function PfFields({ subform, setSubform }: { subform: Record<string, any>; setSubform: (f: Record<string, any>) => void }) {
  const set = (k: string, v: string) => setSubform({ ...subform, [k]: v });
  return (
    <Card className="p-4 space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2"><User className="w-4 h-4" /> Dados Pessoa Física</h4>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>CPF *</Label><Input value={subform.cpf || ''} onChange={e => set('cpf', e.target.value)} /></div>
        <div><Label>RG</Label><Input value={subform.rg || ''} onChange={e => set('rg', e.target.value)} /></div>
        <div><Label>Data de Nascimento</Label><Input type="date" value={subform.dataNascimento || ''} onChange={e => set('dataNascimento', e.target.value)} /></div>
        <div><Label>Profissão</Label><Input value={subform.profissao || ''} onChange={e => set('profissao', e.target.value)} /></div>
        <div><Label>Nacionalidade</Label><Input value={subform.nacionalidade || ''} onChange={e => set('nacionalidade', e.target.value)} /></div>
      </div>
    </Card>
  );
}

function DoadorFields({ subform, setSubform }: { subform: Record<string, any>; setSubform: (f: Record<string, any>) => void }) {
  const set = (k: string, v: string) => setSubform({ ...subform, [k]: v });
  return (
    <Card className="p-4 space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2"><Heart className="w-4 h-4" /> Dados do Doador</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tipo de Doador</Label>
          <Select value={subform.tipoDoador || 'pf'} onValueChange={v => set('tipoDoador', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pf">Pessoa Física</SelectItem>
              <SelectItem value="pj">Pessoa Jurídica</SelectItem>
              <SelectItem value="internacional">Internacional</SelectItem>
              <SelectItem value="fundo">Fundo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>CPF/CNPJ</Label><Input value={subform.cpfCnpj || ''} onChange={e => set('cpfCnpj', e.target.value)} /></div>
        <div><Label>Área de Interesse</Label><Input value={subform.areaInteresse || ''} onChange={e => set('areaInteresse', e.target.value)} /></div>
        <div><Label>Valor Médio Doação</Label><Input value={subform.valorMedioDoacao || ''} onChange={e => set('valorMedioDoacao', e.target.value)} placeholder="R$ 0,00" /></div>
      </div>
    </Card>
  );
}

function OrgaoFields({ subform, setSubform }: { subform: Record<string, any>; setSubform: (f: Record<string, any>) => void }) {
  const set = (k: string, v: string) => setSubform({ ...subform, [k]: v });
  return (
    <Card className="p-4 space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2"><Landmark className="w-4 h-4" /> Dados do Órgão Público</h4>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Nome do Órgão *</Label><Input value={subform.nomeOrgao || ''} onChange={e => set('nomeOrgao', e.target.value)} /></div>
        <div>
          <Label>Esfera *</Label>
          <Select value={subform.esfera || ''} onValueChange={v => set('esfera', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="municipal">Municipal</SelectItem>
              <SelectItem value="estadual">Estadual</SelectItem>
              <SelectItem value="federal">Federal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Sigla</Label><Input value={subform.sigla || ''} onChange={e => set('sigla', e.target.value)} /></div>
        <div><Label>Setor Responsável</Label><Input value={subform.setorResponsavel || ''} onChange={e => set('setorResponsavel', e.target.value)} /></div>
      </div>
      <h5 className="text-xs font-semibold text-gray-500 mt-2">Contato</h5>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Nome</Label><Input value={subform.contatoNome || ''} onChange={e => set('contatoNome', e.target.value)} /></div>
        <div><Label>Cargo</Label><Input value={subform.contatoCargo || ''} onChange={e => set('contatoCargo', e.target.value)} /></div>
        <div><Label>Telefone</Label><Input value={subform.contatoTelefone || ''} onChange={e => set('contatoTelefone', e.target.value)} /></div>
        <div><Label>E-mail</Label><Input value={subform.contatoEmail || ''} onChange={e => set('contatoEmail', e.target.value)} /></div>
      </div>
    </Card>
  );
}

function PesquisadorFields({ subform, setSubform }: { subform: Record<string, any>; setSubform: (f: Record<string, any>) => void }) {
  const set = (k: string, v: string) => setSubform({ ...subform, [k]: v });
  return (
    <Card className="p-4 space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2"><FlaskConical className="w-4 h-4" /> Dados do Pesquisador</h4>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>CPF</Label><Input value={subform.cpf || ''} onChange={e => set('cpf', e.target.value)} /></div>
        <div><Label>Instituição</Label><Input value={subform.instituicao || ''} onChange={e => set('instituicao', e.target.value)} /></div>
        <div>
          <Label>Titulação</Label>
          <Select value={subform.titulacao || ''} onValueChange={v => set('titulacao', v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="graduacao">Graduação</SelectItem>
              <SelectItem value="especializacao">Especialização</SelectItem>
              <SelectItem value="mestrado">Mestrado</SelectItem>
              <SelectItem value="doutorado">Doutorado</SelectItem>
              <SelectItem value="pos_doutorado">Pós-Doutorado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Área de Atuação</Label><Input value={subform.areaAtuacao || ''} onChange={e => set('areaAtuacao', e.target.value)} /></div>
        <div><Label>Lattes</Label><Input value={subform.lattes || ''} onChange={e => set('lattes', e.target.value)} placeholder="URL do Lattes" /></div>
        <div><Label>ORCID</Label><Input value={subform.orcid || ''} onChange={e => set('orcid', e.target.value)} /></div>
        <div className="col-span-2"><Label>Grupos de Pesquisa</Label><Input value={subform.gruposPesquisa || ''} onChange={e => set('gruposPesquisa', e.target.value)} /></div>
      </div>
    </Card>
  );
}

// ── Detail Sub-tabs ──

function InteracoesTab({ stakeholderId }: { stakeholderId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ tipo: 'email', descricao: '', responsavel: '' });

  const { data: interacoes = [] } = useQuery({
    queryKey: [`/api/admin/crm/stakeholders/${stakeholderId}/interacoes`],
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', `/api/admin/crm/stakeholders/${stakeholderId}/interacoes`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/crm/stakeholders/${stakeholderId}/interacoes`] });
      setShowAdd(false);
      setForm({ tipo: 'email', descricao: '', responsavel: '' });
      toast({ title: 'Interação registrada' });
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold">Histórico de Interações</h4>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}><Plus className="w-3 h-3 mr-1" /> Nova</Button>
      </div>
      {showAdd && (
        <Card className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="telefone">Telefone</SelectItem>
                <SelectItem value="reuniao">Reunião</SelectItem>
                <SelectItem value="visita">Visita</SelectItem>
                <SelectItem value="documento">Documento</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Responsável" value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))} />
          </div>
          <Textarea placeholder="Descrição..." value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={2} />
          <Button size="sm" onClick={() => addMutation.mutate(form)} disabled={!form.descricao}>Salvar</Button>
        </Card>
      )}
      {(interacoes as any[]).length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Nenhuma interação registrada</p>
      ) : (interacoes as any[]).map((i: any) => (
        <Card key={i.id} className="p-3">
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="outline" className="text-xs mb-1">{i.tipo}</Badge>
              <p className="text-sm">{i.descricao}</p>
              {i.responsavel && <p className="text-xs text-gray-500">por {i.responsavel}</p>}
            </div>
            <span className="text-xs text-gray-400">{new Date(i.data).toLocaleString('pt-BR')}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function DocumentosTab({ stakeholderId }: { stakeholderId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: documentos = [] } = useQuery({
    queryKey: [`/api/admin/crm/stakeholders/${stakeholderId}/documentos`],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/crm/documentos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/crm/stakeholders/${stakeholderId}/documentos`] });
      toast({ title: 'Documento removido' });
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const fileData = reader.result as string;
      await apiRequest('POST', `/api/admin/crm/stakeholders/${stakeholderId}/documentos`, {
        nome: file.name,
        tipo: file.type,
        fileData,
        tamanho: file.size,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/crm/stakeholders/${stakeholderId}/documentos`] });
      toast({ title: 'Documento enviado' });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold">Documentos</h4>
        <label className="cursor-pointer">
          <Button size="sm" asChild><span><Plus className="w-3 h-3 mr-1" /> Upload</span></Button>
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>
      {(documentos as any[]).length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Nenhum documento</p>
      ) : (documentos as any[]).map((d: any) => (
        <Card key={d.id} className="p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium">{d.nome}</p>
              <p className="text-xs text-gray-400">{d.tamanho ? `${(d.tamanho / 1024).toFixed(1)} KB` : ''} — {new Date(d.criadoEm).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate(d.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </Card>
      ))}
    </div>
  );
}

function RecibosTab({ stakeholderId }: { stakeholderId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ numero: '', valor: '', descricao: '', dataEmissao: '' });

  const { data: recibos = [] } = useQuery({
    queryKey: [`/api/admin/crm/stakeholders/${stakeholderId}/recibos`],
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', `/api/admin/crm/stakeholders/${stakeholderId}/recibos`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/crm/stakeholders/${stakeholderId}/recibos`] });
      setShowAdd(false);
      setForm({ numero: '', valor: '', descricao: '', dataEmissao: '' });
      toast({ title: 'Recibo emitido' });
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold">Recibos de Doação</h4>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}><Plus className="w-3 h-3 mr-1" /> Novo Recibo</Button>
      </div>
      {showAdd && (
        <Card className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Número</Label><Input value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} /></div>
            <div><Label>Valor</Label><Input value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} placeholder="R$ 0,00" /></div>
            <div><Label>Data Emissão</Label><Input type="date" value={form.dataEmissao} onChange={e => setForm(f => ({ ...f, dataEmissao: e.target.value }))} /></div>
          </div>
          <Textarea placeholder="Descrição..." value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={2} />
          <Button size="sm" onClick={() => addMutation.mutate(form)} disabled={!form.numero || !form.valor || !form.descricao}>Emitir</Button>
        </Card>
      )}
      {(recibos as any[]).length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Nenhum recibo emitido</p>
      ) : (recibos as any[]).map((r: any) => (
        <Card key={r.id} className="p-3">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium">Recibo #{r.numero}</p>
              <p className="text-xs text-gray-500">{r.descricao}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-600">{r.valor}</p>
              <p className="text-xs text-gray-400">{r.dataEmissao}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
