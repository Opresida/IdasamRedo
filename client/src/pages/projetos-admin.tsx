import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  Globe,
  DollarSign,
  Heart,
  TrendingUp,
  TrendingDown,
  Building2,
  Receipt,
  Leaf,
  TreePine,
  GraduationCap,
  Loader2,
} from 'lucide-react';
import type {
  FinancialProject,
  FinancialTransaction,
  FinancialCategory,
} from '@shared/schema';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('pt-BR');

const getCategoryColor = (category: string | null | undefined) => {
  switch (category) {
    case 'Bioeconomia':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Sustentabilidade':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Saúde e Social':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Capacitação':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getCategoryIcon = (category: string | null | undefined) => {
  switch (category) {
    case 'Bioeconomia':
      return <Leaf className="w-8 h-8 text-green-600" />;
    case 'Sustentabilidade':
      return <TreePine className="w-8 h-8 text-blue-600" />;
    case 'Saúde e Social':
      return <Heart className="w-8 h-8 text-red-600" />;
    case 'Capacitação':
      return <GraduationCap className="w-8 h-8 text-purple-600" />;
    default:
      return <FolderKanban className="w-8 h-8 text-gray-600" />;
  }
};

const statusLabels: Record<string, string> = {
  planejamento: 'Planejamento',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
};

const transparencyLabels: Record<string, string> = {
  basico: 'Básico',
  detalhado: 'Detalhado',
  completo: 'Completo',
};

// ─── Empty form states ───────────────────────────────────────────────────────

const emptyProjectForm = {
  nome: '',
  descricaoCurta: '',
  descricaoCompleta: '',
  imagemUrl: '',
  status: 'planejamento',
  categoria: 'Bioeconomia',
  visivelSite: true,
  orcamentoTotal: '',
  visivelTransparencia: false,
  mostrarOrcamento: false,
  mostrarTransacoes: false,
  nivelTransparencia: 'basico',
  pixKey: '',
};

const emptyTxForm = {
  tipo: 'receita' as string,
  data: new Date().toISOString().split('T')[0],
  descricao: '',
  valor: '',
  categoriaId: '',
  isPublic: true,
  status: 'pago',
  observacoes: '',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProjetosAdminPage() {
  const qc = useQueryClient();
  const { toast } = useToast();

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<FinancialProject | null>(null);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [showTxDialog, setShowTxDialog] = useState(false);
  const [txForm, setTxForm] = useState(emptyTxForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ─── Queries ──────────────────────────────────────────────────────────────
  const { data: projetos = [], isLoading: loadingProjects } = useQuery<FinancialProject[]>({
    queryKey: ['/api/admin/financeiro/projetos'],
  });

  const { data: transacoes = [] } = useQuery<FinancialTransaction[]>({
    queryKey: ['/api/admin/financeiro/transacoes'],
  });

  const { data: categorias = [] } = useQuery<FinancialCategory[]>({
    queryKey: ['/api/admin/financeiro/categorias'],
  });

  // ─── Mutations: Projects ──────────────────────────────────────────────────
  const createProjectMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/admin/financeiro/projetos', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/projetos'] });
      toast({ title: 'Projeto criado com sucesso' });
      setShowProjectDialog(false);
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao criar projeto', description: err.message, variant: 'destructive' });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest('PATCH', `/api/admin/financeiro/projetos/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/projetos'] });
      toast({ title: 'Projeto atualizado com sucesso' });
      setShowProjectDialog(false);
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao atualizar projeto', description: err.message, variant: 'destructive' });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/financeiro/projetos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/projetos'] });
      toast({ title: 'Projeto excluído com sucesso' });
      setDeleteConfirmId(null);
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao excluir projeto', description: err.message, variant: 'destructive' });
    },
  });

  // ─── Mutations: Transactions ──────────────────────────────────────────────
  const createTxMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/admin/financeiro/transacoes', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/transacoes'] });
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/projetos'] });
      toast({ title: 'Transação criada com sucesso' });
      setShowTxDialog(false);
      setTxForm(emptyTxForm);
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao criar transação', description: err.message, variant: 'destructive' });
    },
  });

  const deleteTxMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/financeiro/transacoes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/transacoes'] });
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/projetos'] });
      toast({ title: 'Transação excluída' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao excluir transação', description: err.message, variant: 'destructive' });
    },
  });

  // ─── Derived data ─────────────────────────────────────────────────────────
  const getProjectTransactions = (projectId: string) =>
    transacoes.filter((t) => t.projetoId === projectId);

  const getProjectFinancials = (projectId: string) => {
    const txs = getProjectTransactions(projectId);
    const totalReceitas = txs
      .filter((t) => t.tipo === 'receita')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.valor) || 0), 0);
    const totalDespesas = txs
      .filter((t) => t.tipo === 'despesa')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.valor) || 0), 0);
    return {
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
      count: txs.length,
    };
  };

  const categoriaMap = useMemo(
    () => new Map(categorias.map((c) => [c.id, c])),
    [categorias],
  );

  // ─── Form handlers ────────────────────────────────────────────────────────
  const openNewProject = () => {
    setEditingProject(null);
    setProjectForm(emptyProjectForm);
    setShowProjectDialog(true);
  };

  const openEditProject = (project: FinancialProject) => {
    setEditingProject(project);
    setProjectForm({
      nome: project.nome || '',
      descricaoCurta: project.descricaoCurta || '',
      descricaoCompleta: project.descricaoCompleta || '',
      imagemUrl: project.imagemUrl || '',
      status: project.status || 'planejamento',
      categoria: project.categoria || 'Bioeconomia',
      visivelSite: project.visivelSite ?? true,
      orcamentoTotal: project.orcamentoTotal || '',
      visivelTransparencia: project.visivelTransparencia ?? false,
      mostrarOrcamento: project.mostrarOrcamento ?? false,
      mostrarTransacoes: project.mostrarTransacoes ?? false,
      nivelTransparencia: project.nivelTransparencia || 'basico',
      pixKey: project.pixKey || '',
    });
    setShowProjectDialog(true);
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...projectForm,
      orcamentoTotal: projectForm.orcamentoTotal || null,
      imagemUrl: projectForm.imagemUrl || null,
      descricaoCurta: projectForm.descricaoCurta || null,
      descricaoCompleta: projectForm.descricaoCompleta || null,
      pixKey: projectForm.pixKey || null,
    };
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data: payload });
    } else {
      createProjectMutation.mutate(payload);
    }
  };

  const handleToggleField = (project: FinancialProject, field: string, value: boolean) => {
    updateProjectMutation.mutate({ id: project.id, data: { [field]: value } });
  };

  const openTxDialog = (tipo: 'receita' | 'despesa') => {
    setTxForm({ ...emptyTxForm, tipo });
    setShowTxDialog(true);
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    createTxMutation.mutate({
      ...txForm,
      projetoId: editingProject.id,
      valor: txForm.valor,
      categoriaId: txForm.categoriaId || null,
    });
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loadingProjects) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-3 text-gray-600">Carregando projetos...</span>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-green-600" />
            Gestão de Projetos
          </h1>
          <p className="text-gray-600 mt-2">
            Administre todos os projetos do IDASAM e suas configurações de visibilidade
          </p>
        </div>
        <Button onClick={openNewProject} size="lg" className="bg-green-600 hover:bg-green-700">
          <Plus className="w-5 h-5 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Projetos</p>
                <p className="text-2xl font-bold text-gray-900">{projetos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Visíveis na Transparência</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projetos.filter((p) => p.visivelTransparencia).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Visíveis no Site</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projetos.filter((p) => p.visivelSite).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projetos.filter((p) => p.status === 'em_andamento').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projetos.map((project) => {
          const fin = getProjectFinancials(project.id);
          const budget = parseFloat(project.orcamentoTotal || '0') || 0;
          const execPct = budget > 0 ? (fin.totalDespesas / budget) * 100 : 0;

          return (
            <Card key={project.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center border">
                    {getCategoryIcon(project.categoria)}
                  </div>
                </div>
                <CardTitle className="text-lg text-center leading-tight">
                  {project.nome}
                </CardTitle>
                <div className="flex justify-center gap-2 mt-2">
                  <Badge variant="outline" className={`text-xs ${getCategoryColor(project.categoria)}`}>
                    {project.categoria || 'Sem categoria'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {statusLabels[project.status || 'planejamento'] || project.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {project.descricaoCurta || 'Sem descrição'}
                </p>

                {/* Financial summary */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <h5 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Resumo Financeiro
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Receitas:</span>
                      <div className="font-semibold text-green-600">{formatCurrency(fin.totalReceitas)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Despesas:</span>
                      <div className="font-semibold text-red-600">{formatCurrency(fin.totalDespesas)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Saldo:</span>
                      <div className={`font-semibold ${fin.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(fin.saldo)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Orçamento:</span>
                      <div className="font-semibold">{budget > 0 ? formatCurrency(budget) : '-'}</div>
                    </div>
                  </div>
                  {budget > 0 && (
                    <div className="pt-1 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Execução:</span>
                        <span className="text-xs font-semibold">{execPct.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(execPct, 100)} className="h-1 mt-1" />
                    </div>
                  )}
                </div>

                {/* Admin controls */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Visível no Site</Label>
                    <Switch
                      checked={project.visivelSite}
                      onCheckedChange={(checked) => handleToggleField(project, 'visivelSite', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Visível na Transparência</Label>
                    <Switch
                      checked={project.visivelTransparencia}
                      onCheckedChange={(checked) => handleToggleField(project, 'visivelTransparencia', checked)}
                    />
                  </div>

                  {project.visivelTransparencia && (
                    <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Mostrar Orçamento</span>
                        <Badge variant={project.mostrarOrcamento ? 'default' : 'outline'} className="text-xs">
                          {project.mostrarOrcamento ? 'Sim' : 'Não'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Mostrar Transações</span>
                        <Badge variant={project.mostrarTransacoes ? 'default' : 'outline'} className="text-xs">
                          {project.mostrarTransacoes ? 'Sim' : 'Não'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Nível</span>
                        <Badge variant="outline" className="text-xs">
                          {transparencyLabels[project.nivelTransparencia || 'basico']}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditProject(project)}
                      className="flex-1"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Dialog open={deleteConfirmId === project.id} onOpenChange={(open) => setDeleteConfirmId(open ? project.id : null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirmar Exclusão</DialogTitle>
                          <DialogDescription>
                            Tem certeza que deseja excluir o projeto "{project.nome}"? Esta ação não pode ser desfeita.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancelar</Button>
                          <Button
                            variant="destructive"
                            onClick={() => deleteProjectMutation.mutate(project.id)}
                            disabled={deleteProjectMutation.isPending}
                          >
                            {deleteProjectMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-1" />
                            )}
                            Excluir
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open('/projetos', '_blank')}
                    className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Ver no Site Público
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {projetos.length === 0 && !loadingProjects && (
        <Card className="p-12 text-center">
          <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">Nenhum projeto cadastrado</h3>
          <p className="text-gray-500 mt-1">Crie seu primeiro projeto clicando no botão acima.</p>
        </Card>
      )}

      {/* ─── Project Create/Edit Dialog ──────────────────────────────────────── */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <FolderKanban className="w-6 h-6 text-green-600" />
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
            </DialogTitle>
            <DialogDescription>
              {editingProject
                ? 'Atualize as informações do projeto existente'
                : 'Crie um novo projeto para o IDASAM'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProjectSubmit} className="space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Conteúdo do Site
                </TabsTrigger>
                <TabsTrigger value="financial" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Financeiro e Transparência
                </TabsTrigger>
                <TabsTrigger value="donations" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Doações
                </TabsTrigger>
              </TabsList>

              {/* ─── Tab 1: Site Content ─────────────────────────────────────── */}
              <TabsContent value="content" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-nome">Nome do Projeto *</Label>
                    <Input
                      id="project-nome"
                      value={projectForm.nome}
                      onChange={(e) => setProjectForm({ ...projectForm, nome: e.target.value })}
                      placeholder="Ex: Projeto Curupira"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-status">Status *</Label>
                    <Select
                      value={projectForm.status}
                      onValueChange={(value) => setProjectForm({ ...projectForm, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planejamento">Planejamento</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-descricaoCurta">Descrição Curta</Label>
                  <Textarea
                    id="project-descricaoCurta"
                    value={projectForm.descricaoCurta}
                    onChange={(e) => setProjectForm({ ...projectForm, descricaoCurta: e.target.value })}
                    placeholder="Breve descrição que aparecerá nos cards de projeto..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-descricaoCompleta">Descrição Completa</Label>
                  <Textarea
                    id="project-descricaoCompleta"
                    value={projectForm.descricaoCompleta}
                    onChange={(e) => setProjectForm({ ...projectForm, descricaoCompleta: e.target.value })}
                    placeholder="Descrição detalhada do projeto para a página individual..."
                    className="min-h-[200px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-imagemUrl">URL da Imagem de Capa</Label>
                    <Input
                      id="project-imagemUrl"
                      type="url"
                      value={projectForm.imagemUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, imagemUrl: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-categoria">Categoria</Label>
                    <Select
                      value={projectForm.categoria}
                      onValueChange={(value) => setProjectForm({ ...projectForm, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bioeconomia">Bioeconomia</SelectItem>
                        <SelectItem value="Sustentabilidade">Sustentabilidade</SelectItem>
                        <SelectItem value="Saúde e Social">Saúde e Social</SelectItem>
                        <SelectItem value="Capacitação">Capacitação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Switch
                    id="form-visivelSite"
                    checked={projectForm.visivelSite}
                    onCheckedChange={(checked) => setProjectForm({ ...projectForm, visivelSite: checked })}
                  />
                  <div className="flex-1">
                    <Label htmlFor="form-visivelSite" className="text-sm font-medium">
                      Visível no Site Público
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Controla se o projeto aparece na página pública de projetos
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* ─── Tab 2: Financial & Transparency ─────────────────────────── */}
              <TabsContent value="financial" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-orcamento">Orçamento Total do Projeto (R$)</Label>
                    <Input
                      id="project-orcamento"
                      value={projectForm.orcamentoTotal}
                      onChange={(e) => setProjectForm({ ...projectForm, orcamentoTotal: e.target.value })}
                      placeholder="Ex: 150000.00"
                    />
                  </div>

                  {/* Transparency toggles */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Switch
                        id="form-visivelTransparencia"
                        checked={projectForm.visivelTransparencia}
                        onCheckedChange={(checked) =>
                          setProjectForm({ ...projectForm, visivelTransparencia: checked })
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor="form-visivelTransparencia" className="text-sm font-medium">
                          Visível no Portal de Transparência
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">
                          Controla se o projeto aparece no portal público
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <Switch
                        id="form-mostrarOrcamento"
                        checked={projectForm.mostrarOrcamento}
                        onCheckedChange={(checked) =>
                          setProjectForm({ ...projectForm, mostrarOrcamento: checked })
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor="form-mostrarOrcamento" className="text-sm font-medium">
                          Mostrar Informações de Orçamento
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">
                          Exibe valores de orçamento total e percentual usado no portal
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <Switch
                        id="form-mostrarTransacoes"
                        checked={projectForm.mostrarTransacoes}
                        onCheckedChange={(checked) =>
                          setProjectForm({ ...projectForm, mostrarTransacoes: checked })
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor="form-mostrarTransacoes" className="text-sm font-medium">
                          Mostrar Transações Individuais
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">
                          Permite que transações marcadas como públicas apareçam no portal
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="form-nivelTransparencia">Nível de Transparência</Label>
                    <Select
                      value={projectForm.nivelTransparencia}
                      onValueChange={(value) =>
                        setProjectForm({ ...projectForm, nivelTransparencia: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basico">Básico - Apenas informações gerais</SelectItem>
                        <SelectItem value="detalhado">Detalhado - Inclui categorias e resumos</SelectItem>
                        <SelectItem value="completo">Completo - Todas as informações públicas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Financial summary (only when editing) */}
                {editingProject && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Resumo Financeiro do Projeto
                      </h4>

                      {(() => {
                        const fin = getProjectFinancials(editingProject.id);
                        const budget = parseFloat(projectForm.orcamentoTotal) || 0;
                        const execPct = budget > 0 ? ((fin.totalDespesas / budget) * 100) : 0;

                        return (
                          <>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <Card className="border-l-4 border-l-green-500">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm text-gray-600">Total Receitas</p>
                                      <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(fin.totalReceitas)}
                                      </p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                  </div>
                                </CardContent>
                              </Card>

                              <Card className="border-l-4 border-l-red-500">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm text-gray-600">Total Despesas</p>
                                      <p className="text-2xl font-bold text-red-600">
                                        {formatCurrency(fin.totalDespesas)}
                                      </p>
                                    </div>
                                    <TrendingDown className="h-8 w-8 text-red-600" />
                                  </div>
                                </CardContent>
                              </Card>

                              <Card className="border-l-4 border-l-blue-500">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm text-gray-600">Saldo</p>
                                      <p className={`text-2xl font-bold ${fin.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        {formatCurrency(fin.saldo)}
                                      </p>
                                    </div>
                                    <Building2 className="h-8 w-8 text-blue-600" />
                                  </div>
                                </CardContent>
                              </Card>

                              <Card className="border-l-4 border-l-purple-500">
                                <CardContent className="p-4">
                                  <div>
                                    <p className="text-sm text-gray-600 mb-2">Execução Orçamentária</p>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span>{execPct.toFixed(1)}% utilizado</span>
                                        <span className="text-purple-600 font-medium">
                                          {formatCurrency(fin.totalDespesas)} / {budget > 0 ? formatCurrency(budget) : '-'}
                                        </span>
                                      </div>
                                      <Progress value={Math.min(execPct, 100)} className="h-2" />
                                      <p className="text-xs text-gray-500">{fin.count} transações vinculadas</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Add transaction buttons */}
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Gestão de Lançamentos
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openTxDialog('receita')}
                                  className="flex items-center gap-1 text-green-600 border-green-300 hover:bg-green-50"
                                >
                                  <TrendingUp className="w-4 h-4" />
                                  Adicionar Receita
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openTxDialog('despesa')}
                                  className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <TrendingDown className="w-4 h-4" />
                                  Adicionar Despesa
                                </Button>
                              </div>
                            </div>

                            {/* Transaction list */}
                            <div className="space-y-3">
                              <h5 className="text-base font-medium text-gray-900 flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-gray-600" />
                                Lançamentos Vinculados
                              </h5>
                              <div className="border rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-gray-50">
                                      <TableHead className="text-xs">Data</TableHead>
                                      <TableHead className="text-xs">Descrição</TableHead>
                                      <TableHead className="text-xs">Categoria</TableHead>
                                      <TableHead className="text-xs text-right">Valor</TableHead>
                                      <TableHead className="text-xs text-center">Público</TableHead>
                                      <TableHead className="text-xs">Ações</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {(() => {
                                      const txs = getProjectTransactions(editingProject.id);
                                      if (txs.length === 0) {
                                        return (
                                          <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                              Nenhuma transação vinculada a este projeto ainda.
                                            </TableCell>
                                          </TableRow>
                                        );
                                      }
                                      return txs.slice(0, 10).map((tx) => (
                                        <TableRow key={tx.id}>
                                          <TableCell className="text-xs">{formatDate(tx.data)}</TableCell>
                                          <TableCell className="text-xs">{tx.descricao}</TableCell>
                                          <TableCell className="text-xs">
                                            <Badge variant="outline" className="text-xs">
                                              {tx.categoriaId ? (categoriaMap.get(tx.categoriaId)?.nome || '-') : '-'}
                                            </Badge>
                                          </TableCell>
                                          <TableCell
                                            className={`text-xs text-right font-bold ${
                                              tx.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                                            }`}
                                          >
                                            {tx.tipo === 'receita' ? '+' : '-'}
                                            {formatCurrency(Math.abs(parseFloat(tx.valor) || 0))}
                                          </TableCell>
                                          <TableCell className="text-xs text-center">
                                            <Badge
                                              variant={tx.isPublic ? 'default' : 'outline'}
                                              className={tx.isPublic ? 'bg-green-100 text-green-800 text-xs' : 'text-gray-600 text-xs'}
                                            >
                                              {tx.isPublic ? 'Sim' : 'Não'}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                if (confirm(`Excluir transação "${tx.descricao}"?`)) {
                                                  deleteTxMutation.mutate(tx.id);
                                                }
                                              }}
                                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ));
                                    })()}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ─── Tab 3: Donations ────────────────────────────────────────── */}
              <TabsContent value="donations" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="form-pixKey">Chave PIX</Label>
                  <Input
                    id="form-pixKey"
                    value={projectForm.pixKey}
                    onChange={(e) => setProjectForm({ ...projectForm, pixKey: e.target.value })}
                    placeholder="Ex: projeto@idasam.org.br ou CPF/CNPJ"
                  />
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Rastreamento de Doações</h4>
                  <p className="text-sm text-yellow-700">
                    Futuramente, aqui será exibido um resumo das doações recebidas,
                    incluindo valor total arrecadado, número de doadores, média por doação
                    e gráficos de evolução temporal das contribuições.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Form buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProjectDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
              >
                {(createProjectMutation.isPending || updateProjectMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                {editingProject ? 'Atualizar Projeto' : 'Criar Projeto'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Transaction Dialog (within project edit context) ────────────────── */}
      <Dialog open={showTxDialog} onOpenChange={setShowTxDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${txForm.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
              {txForm.tipo === 'receita' ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              {txForm.tipo === 'receita' ? 'Nova Receita' : 'Nova Despesa'}
            </DialogTitle>
            <DialogDescription>
              {txForm.tipo === 'receita'
                ? 'Registrar entrada de recursos para este projeto'
                : 'Registrar gasto ou investimento deste projeto'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTxSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={txForm.tipo}
                  onValueChange={(value) => setTxForm({ ...txForm, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={txForm.data}
                  onChange={(e) => setTxForm({ ...txForm, data: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input
                value={txForm.descricao}
                onChange={(e) => setTxForm({ ...txForm, descricao: e.target.value })}
                placeholder="Ex: Doação mensal de apoiador"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Valor (R$) *</Label>
                <Input
                  value={txForm.valor}
                  onChange={(e) => setTxForm({ ...txForm, valor: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={txForm.categoriaId}
                  onValueChange={(value) => setTxForm({ ...txForm, categoriaId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias
                      .filter(
                        (c) =>
                          c.tipo === 'ambos' ||
                          c.tipo === txForm.tipo,
                      )
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Switch
                id="tx-isPublic"
                checked={txForm.isPublic}
                onCheckedChange={(checked) => setTxForm({ ...txForm, isPublic: checked })}
              />
              <div className="flex-1">
                <Label htmlFor="tx-isPublic" className="text-sm font-medium">
                  Transação Pública
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  Será visível no Portal de Transparência
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações (Opcional)</Label>
              <Textarea
                value={txForm.observacoes}
                onChange={(e) => setTxForm({ ...txForm, observacoes: e.target.value })}
                placeholder="Informações adicionais sobre esta transação..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowTxDialog(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className={txForm.tipo === 'receita' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                disabled={createTxMutation.isPending}
              >
                {createTxMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Salvar {txForm.tipo === 'receita' ? 'Receita' : 'Despesa'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
