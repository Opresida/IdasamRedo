import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  CalendarIcon,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Columns,
  Grid3X3,
  Building2,
  FileText,
  Settings,
  Upload,
  CreditCard,
  Target,
  PieChart,
  Loader2
} from 'lucide-react';
import type {
  FinancialAccount,
  FinancialCategory,
  FinancialProject,
  FinancialTransaction,
  CrmStakeholder,
} from '@shared/schema';

// ─── Helper types ────────────────────────────────────────────────────────────
interface ResumoData {
  totalReceitas: number;
  totalDespesas: number;
  saldoAtual: number;
  totalTransacoes: number;
}

// ─── Default form states ─────────────────────────────────────────────────────
const emptyTransactionForm = {
  tipo: '' as string,
  descricao: '',
  valor: '',
  data: new Date(),
  contaId: '',
  categoriaId: '',
  projetoId: '',
  tipoCusto: '',
  fornecedorId: '',
  doadorId: '',
  pesquisadorId: '',
  status: 'pendente',
  isPublic: false,
  observacoes: '',
  documentoAnexo: '',
};

const emptyAccountForm = {
  nome: '',
  banco: '',
  agencia: '',
  conta: '',
  saldoInicial: '',
};

const emptyCategoryForm = {
  nome: '',
  tipo: 'ambos' as string,
};

// ─── Status labels ───────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  a_vencer: 'A Vencer',
  cancelado: 'Cancelado',
};

const TIPO_LABELS: Record<string, string> = {
  receita: 'Receita',
  despesa: 'Despesa',
};

const CATEGORY_TYPE_LABELS: Record<string, string> = {
  ambos: 'Ambos',
  receita: 'Receita',
  despesa: 'Despesa',
};

// ═════════════════════════════════════════════════════════════════════════════
export default function DashboardFinanceiroPage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  // ─── UI state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('transacoes');
  const [activeAccountTab, setActiveAccountTab] = useState('add-account');
  const [viewMode, setViewMode] = useState('lista');
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // ─── Form states ───────────────────────────────────────────────────────────
  const [newTransaction, setNewTransaction] = useState({ ...emptyTransactionForm });
  const [editTransaction, setEditTransaction] = useState({ ...emptyTransactionForm });
  const [newAccount, setNewAccount] = useState({ ...emptyAccountForm });
  const [newCategory, setNewCategory] = useState({ ...emptyCategoryForm });

  const [filters, setFilters] = useState({
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    tipo: '',
    status: '',
    contaId: '',
    categoriaId: '',
    projetoId: '',
  });

  // ─── Queries ───────────────────────────────────────────────────────────────
  const { data: transacoes = [], isLoading: loadingTx } = useQuery<FinancialTransaction[]>({
    queryKey: ['/api/admin/financeiro/transacoes'],
  });

  const { data: contas = [] } = useQuery<FinancialAccount[]>({
    queryKey: ['/api/admin/financeiro/contas'],
  });

  const { data: categorias = [] } = useQuery<FinancialCategory[]>({
    queryKey: ['/api/admin/financeiro/categorias'],
  });

  const { data: projetos = [] } = useQuery<FinancialProject[]>({
    queryKey: ['/api/admin/financeiro/projetos'],
  });

  const { data: resumo } = useQuery<ResumoData>({
    queryKey: ['/api/admin/financeiro/relatorios/resumo'],
  });

  const { data: porCategoria = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/financeiro/relatorios/por-categoria'],
  });

  const { data: stakeholders = [] } = useQuery<CrmStakeholder[]>({
    queryKey: ['/api/admin/crm/stakeholders'],
  });

  // ─── Derived CRM lists ────────────────────────────────────────────────────
  const suppliers = useMemo(
    () => stakeholders.filter((s) => s.tipo === 'pj' && s.status === 'ativo'),
    [stakeholders],
  );
  const donors = useMemo(
    () => stakeholders.filter((s) => ['doador', 'pf', 'pj'].includes(s.tipo) && s.status === 'ativo'),
    [stakeholders],
  );
  const researchers = useMemo(
    () => stakeholders.filter((s) => s.tipo === 'pesquisador' && s.status === 'ativo'),
    [stakeholders],
  );

  // ─── Lookup helpers ────────────────────────────────────────────────────────
  const contaMap = useMemo(() => new Map(contas.map((c) => [c.id, c])), [contas]);
  const categoriaMap = useMemo(() => new Map(categorias.map((c) => [c.id, c])), [categorias]);
  const projetoMap = useMemo(() => new Map(projetos.map((p) => [p.id, p])), [projetos]);
  const stakeholderMap = useMemo(() => new Map(stakeholders.map((s) => [s.id, s])), [stakeholders]);

  // ─── Client-side filtering ─────────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    return transacoes.filter((t) => {
      if (filters.dateFrom) {
        if (new Date(t.data) < filters.dateFrom) return false;
      }
      if (filters.dateTo) {
        if (new Date(t.data) > filters.dateTo) return false;
      }
      if (filters.tipo && t.tipo !== filters.tipo) return false;
      if (filters.status && t.status !== filters.status) return false;
      if (filters.contaId && t.contaId !== filters.contaId) return false;
      if (filters.categoriaId && t.categoriaId !== filters.categoriaId) return false;
      if (filters.projetoId && t.projetoId !== filters.projetoId) return false;
      return true;
    });
  }, [transacoes, filters]);

  // ─── Totals (from server resumo or fallback to client) ─────────────────────
  const totalReceitas = resumo?.totalReceitas ?? filteredTransactions
    .filter((t) => t.tipo === 'receita' && t.status === 'pago')
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const totalDespesas = resumo?.totalDespesas ?? filteredTransactions
    .filter((t) => t.tipo === 'despesa' && t.status === 'pago')
    .reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);

  const saldoAtual = resumo?.saldoAtual ?? (totalReceitas - totalDespesas);

  // ─── Mutations: Transactions ───────────────────────────────────────────────
  const createTxMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/admin/financeiro/transacoes', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/transacoes'] });
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/relatorios/resumo'] });
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/relatorios/por-categoria'] });
      setIsNewTransactionOpen(false);
      setNewTransaction({ ...emptyTransactionForm });
      toast({ title: 'Transacao criada com sucesso' });
    },
    onError: (e: any) => toast({ title: 'Erro ao criar transacao', description: e.message, variant: 'destructive' }),
  });

  const updateTxMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest('PATCH', `/api/admin/financeiro/transacoes/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/transacoes'] });
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/relatorios/resumo'] });
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/relatorios/por-categoria'] });
      setIsEditTransactionOpen(false);
      setEditingTransaction(null);
      setEditTransaction({ ...emptyTransactionForm });
      toast({ title: 'Transacao atualizada com sucesso' });
    },
    onError: (e: any) => toast({ title: 'Erro ao atualizar transacao', description: e.message, variant: 'destructive' }),
  });

  const deleteTxMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/financeiro/transacoes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/transacoes'] });
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/relatorios/resumo'] });
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/relatorios/por-categoria'] });
      toast({ title: 'Transacao excluida com sucesso' });
    },
    onError: (e: any) => toast({ title: 'Erro ao excluir transacao', description: e.message, variant: 'destructive' }),
  });

  // ─── Mutations: Accounts ───────────────────────────────────────────────────
  const createAccountMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/admin/financeiro/contas', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/contas'] });
      setIsNewAccountOpen(false);
      setNewAccount({ ...emptyAccountForm });
      setActiveAccountTab('add-account');
      toast({ title: 'Conta criada com sucesso' });
    },
    onError: (e: any) => toast({ title: 'Erro ao criar conta', description: e.message, variant: 'destructive' }),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/financeiro/contas/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/contas'] });
      setActiveAccountTab('add-account');
      toast({ title: 'Conta excluida com sucesso' });
    },
    onError: (e: any) => toast({ title: 'Erro ao excluir conta', description: e.message, variant: 'destructive' }),
  });

  // ─── Mutations: Categories ─────────────────────────────────────────────────
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/admin/financeiro/categorias', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/categorias'] });
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/relatorios/por-categoria'] });
      setIsNewCategoryOpen(false);
      setNewCategory({ ...emptyCategoryForm });
      setEditingCategoryId(null);
      toast({ title: 'Categoria criada com sucesso' });
    },
    onError: (e: any) => toast({ title: 'Erro ao criar categoria', description: e.message, variant: 'destructive' }),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest('PATCH', `/api/admin/financeiro/categorias/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/categorias'] });
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/relatorios/por-categoria'] });
      setIsNewCategoryOpen(false);
      setNewCategory({ ...emptyCategoryForm });
      setEditingCategoryId(null);
      toast({ title: 'Categoria atualizada com sucesso' });
    },
    onError: (e: any) => toast({ title: 'Erro ao atualizar categoria', description: e.message, variant: 'destructive' }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/financeiro/categorias/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/categorias'] });
      qc.invalidateQueries({ queryKey: ['/api/admin/financeiro/relatorios/por-categoria'] });
      toast({ title: 'Categoria excluida com sucesso' });
    },
    onError: (e: any) => toast({ title: 'Erro ao excluir categoria', description: e.message, variant: 'destructive' }),
  });

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleCreateTransaction = () => {
    const payload: any = {
      tipo: newTransaction.tipo,
      descricao: newTransaction.descricao,
      valor: newTransaction.valor,
      data: format(newTransaction.data, 'yyyy-MM-dd'),
      contaId: newTransaction.contaId || null,
      categoriaId: newTransaction.categoriaId || null,
      projetoId: newTransaction.projetoId || null,
      tipoCusto: newTransaction.tipoCusto || null,
      fornecedorId: newTransaction.fornecedorId || null,
      doadorId: newTransaction.doadorId || null,
      pesquisadorId: newTransaction.pesquisadorId || null,
      status: newTransaction.status,
      isPublic: newTransaction.isPublic,
      observacoes: newTransaction.observacoes || null,
    };
    createTxMutation.mutate(payload);
  };

  const handleEditTransaction = (transaction: FinancialTransaction) => {
    setEditingTransaction(transaction);
    setEditTransaction({
      tipo: transaction.tipo,
      descricao: transaction.descricao,
      valor: transaction.valor,
      data: new Date(transaction.data),
      contaId: transaction.contaId || '',
      categoriaId: transaction.categoriaId || '',
      projetoId: transaction.projetoId || '',
      tipoCusto: transaction.tipoCusto || '',
      fornecedorId: transaction.fornecedorId || '',
      doadorId: transaction.doadorId || '',
      pesquisadorId: transaction.pesquisadorId || '',
      status: transaction.status,
      isPublic: transaction.isPublic,
      observacoes: transaction.observacoes || '',
    });
    setIsEditTransactionOpen(true);
  };

  const handleUpdateTransaction = () => {
    if (!editingTransaction) return;
    const payload: any = {
      tipo: editTransaction.tipo,
      descricao: editTransaction.descricao,
      valor: editTransaction.valor,
      data: format(editTransaction.data, 'yyyy-MM-dd'),
      contaId: editTransaction.contaId || null,
      categoriaId: editTransaction.categoriaId || null,
      projetoId: editTransaction.projetoId || null,
      tipoCusto: editTransaction.tipoCusto || null,
      fornecedorId: editTransaction.fornecedorId || null,
      doadorId: editTransaction.doadorId || null,
      pesquisadorId: editTransaction.pesquisadorId || null,
      status: editTransaction.status,
      isPublic: editTransaction.isPublic,
      observacoes: editTransaction.observacoes || null,
    };
    updateTxMutation.mutate({ id: editingTransaction.id, data: payload });
  };

  const handleDeleteTransaction = (tx: FinancialTransaction) => {
    if (window.confirm(`Tem certeza que deseja excluir a transacao "${tx.descricao}"?\n\nValor: R$ ${Number(tx.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nData: ${format(new Date(tx.data), 'dd/MM/yyyy')}\n\nEsta acao nao pode ser desfeita.`)) {
      deleteTxMutation.mutate(tx.id);
    }
  };

  const handleCreateAccount = () => {
    createAccountMutation.mutate({
      nome: newAccount.nome,
      banco: newAccount.banco,
      agencia: newAccount.agencia,
      conta: newAccount.conta,
      saldoInicial: newAccount.saldoInicial || '0',
    });
  };

  const handleDeleteAccount = (account: FinancialAccount) => {
    const hasTransactions = transacoes.some((t) => t.contaId === account.id);
    if (hasTransactions) {
      toast({ title: 'Erro', description: `Nao e possivel excluir a conta "${account.nome}" pois ha transacoes vinculadas.`, variant: 'destructive' });
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir a conta "${account.nome}"?`)) {
      deleteAccountMutation.mutate(account.id);
    }
  };

  const handleCreateOrUpdateCategory = () => {
    const payload = { nome: newCategory.nome, tipo: newCategory.tipo };
    if (editingCategoryId) {
      updateCategoryMutation.mutate({ id: editingCategoryId, data: payload });
    } else {
      createCategoryMutation.mutate(payload);
    }
  };

  const handleEditCategory = (cat: FinancialCategory) => {
    setEditingCategoryId(cat.id);
    setNewCategory({ nome: cat.nome, tipo: cat.tipo });
    setIsNewCategoryOpen(true);
  };

  const handleDeleteCategory = (cat: FinancialCategory) => {
    const usage = transacoes.filter((t) => t.categoriaId === cat.id).length;
    if (usage > 0) {
      toast({ title: 'Erro', description: `Nao e possivel excluir a categoria "${cat.nome}" pois ela esta sendo usada em transacoes.`, variant: 'destructive' });
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${cat.nome}"?`)) {
      deleteCategoryMutation.mutate(cat.id);
    }
  };

  // Drag and drop handler for kanban
  const handleOnDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const newStatus = destination.droppableId;
    updateTxMutation.mutate({ id: draggableId, data: { status: newStatus } });
  };

  // Filter transactions by account
  const getTransactionsByAccount = (accountId: string) => {
    return transacoes.filter((t) => t.contaId === accountId);
  };

  const clearFilters = () => {
    setFilters({ dateFrom: null, dateTo: null, tipo: '', status: '', contaId: '', categoriaId: '', projetoId: '' });
  };

  // ─── CSV Export ────────────────────────────────────────────────────────────
  const handleExportTransactions = () => {
    if (filteredTransactions.length === 0) {
      toast({ title: 'Nao ha transacoes para exportar com os filtros aplicados.' });
      return;
    }

    const formatCsvField = (value: any) => {
      if (value === null || value === undefined || value === '') return '""';
      const stringValue = String(value).trim();
      const escapedValue = stringValue.replace(/"/g, '""');
      return `"${escapedValue}"`;
    };

    const csvRows: string[] = [];
    const headers = ['Data', 'Descricao', 'Tipo', 'Valor (R$)', 'Conta Bancaria', 'Categoria', 'Projeto', 'Status'];
    csvRows.push(headers.map((h) => formatCsvField(h)).join(';'));

    filteredTransactions.forEach((tx) => {
      const valorNumerico = Math.abs(Number(tx.valor)).toFixed(2);
      const sinalValor = tx.tipo === 'receita' ? '+' : '-';
      const valorFormatado = `${sinalValor}${valorNumerico}`;
      const conta = tx.contaId ? contaMap.get(tx.contaId) : null;
      const categoria = tx.categoriaId ? categoriaMap.get(tx.categoriaId) : null;
      const projeto = tx.projetoId ? projetoMap.get(tx.projetoId) : null;

      const row = [
        formatCsvField(format(new Date(tx.data), 'dd/MM/yyyy')),
        formatCsvField(tx.descricao || ''),
        formatCsvField(TIPO_LABELS[tx.tipo] || tx.tipo),
        formatCsvField(valorFormatado),
        formatCsvField(conta?.nome || ''),
        formatCsvField(categoria?.nome || ''),
        formatCsvField(projeto?.nome || ''),
        formatCsvField(STATUS_LABELS[tx.status] || tx.status),
      ];
      csvRows.push(row.join(';'));
    });

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    let fileName = `transacoes_financeiras_${format(new Date(), 'dd-MM-yyyy')}`;
    if (filters.dateFrom || filters.dateTo) {
      const periodo = `${filters.dateFrom ? format(filters.dateFrom, 'dd-MM-yyyy') : 'inicio'}_a_${filters.dateTo ? format(filters.dateTo, 'dd-MM-yyyy') : 'hoje'}`;
      fileName += `_periodo_${periodo}`;
    }
    if (filters.tipo) fileName += `_${filters.tipo}`;
    fileName += '.csv';

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: `${filteredTransactions.length} transacoes exportadas com sucesso!` });
  };

  const handleExportReport = () => {
    const formatCsvField = (field: any) => {
      if (field === null || field === undefined || field === '') return '""';
      const stringValue = String(field).trim();
      const escapedValue = stringValue.replace(/"/g, '""');
      return `"${escapedValue}"`;
    };

    const csvRows: string[] = [];

    csvRows.push(formatCsvField('RELATORIO FINANCEIRO - IDASAM'));
    csvRows.push(formatCsvField(`Data de Geracao: ${format(new Date(), 'dd/MM/yyyy - HH:mm:ss')}`));
    csvRows.push(formatCsvField(`Total de Transacoes: ${filteredTransactions.length}`));
    csvRows.push('');

    csvRows.push([formatCsvField('Indicador'), formatCsvField('Valor (R$)')].join(';'));
    csvRows.push([formatCsvField('Total de Receitas'), formatCsvField(totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))].join(';'));
    csvRows.push([formatCsvField('Total de Despesas'), formatCsvField(totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))].join(';'));
    csvRows.push([formatCsvField('Saldo Liquido'), formatCsvField(saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))].join(';'));
    csvRows.push('');

    csvRows.push([formatCsvField('Data'), formatCsvField('Descricao'), formatCsvField('Tipo'), formatCsvField('Valor (R$)'), formatCsvField('Conta'), formatCsvField('Categoria'), formatCsvField('Projeto'), formatCsvField('Status')].join(';'));
    filteredTransactions.slice(0, 50).forEach((tx) => {
      const conta = tx.contaId ? contaMap.get(tx.contaId) : null;
      const categoria = tx.categoriaId ? categoriaMap.get(tx.categoriaId) : null;
      const projeto = tx.projetoId ? projetoMap.get(tx.projetoId) : null;
      csvRows.push([
        formatCsvField(format(new Date(tx.data), 'dd/MM/yyyy')),
        formatCsvField(tx.descricao),
        formatCsvField(TIPO_LABELS[tx.tipo] || tx.tipo),
        formatCsvField(`${tx.tipo === 'receita' ? '+' : '-'}${Math.abs(Number(tx.valor)).toFixed(2)}`),
        formatCsvField(conta?.nome || ''),
        formatCsvField(categoria?.nome || ''),
        formatCsvField(projeto?.nome || ''),
        formatCsvField(STATUS_LABELS[tx.status] || tx.status),
      ].join(';'));
    });

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    let fileName = `relatorio_financeiro_IDASAM_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Relatorio exportado com sucesso!' });
  };

  // ─── Transaction form renderer (shared between create and edit) ────────────
  const renderTransactionForm = (
    formState: typeof emptyTransactionForm,
    setFormState: React.Dispatch<React.SetStateAction<typeof emptyTransactionForm>>,
  ) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Tipo *</Label>
        <Select value={formState.tipo} onValueChange={(v) => setFormState({ ...formState, tipo: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="receita">Receita</SelectItem>
            <SelectItem value="despesa">Despesa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Valor (R$) *</Label>
        <Input
          type="number"
          placeholder="0,00"
          value={formState.valor}
          onChange={(e) => setFormState({ ...formState, valor: e.target.value })}
        />
      </div>

      <div className="col-span-2 space-y-2">
        <Label>Descricao *</Label>
        <Input
          placeholder="Descricao da transacao"
          value={formState.descricao}
          onChange={(e) => setFormState({ ...formState, descricao: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Data *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formState.data && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formState.data ? format(formState.data, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formState.data}
              onSelect={(date) => setFormState({ ...formState, data: date || new Date() })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Conta Bancaria *</Label>
        <Select value={formState.contaId} onValueChange={(v) => setFormState({ ...formState, contaId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a conta" />
          </SelectTrigger>
          <SelectContent>
            {contas.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.nome} - {c.banco}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Categoria *</Label>
        <Select value={formState.categoriaId} onValueChange={(v) => setFormState({ ...formState, categoriaId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {categorias
              .filter((cat) => cat.tipo === 'ambos' ||
                (formState.tipo === 'receita' && cat.tipo === 'receita') ||
                (formState.tipo === 'despesa' && cat.tipo === 'despesa'))
              .map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Projeto (Opcional)</Label>
        <Select value={formState.projetoId} onValueChange={(v) => setFormState({ ...formState, projetoId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o projeto" />
          </SelectTrigger>
          <SelectContent>
            {projetos.filter((p) => p.ativo).map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formState.tipo === 'despesa' && (
        <>
          <div className="space-y-2">
            <Label>Tipo de Custo</Label>
            <Select value={formState.tipoCusto} onValueChange={(v) => setFormState({ ...formState, tipoCusto: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixo">Custo Fixo</SelectItem>
                <SelectItem value="variavel">Custo Variavel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fornecedor (CRM)</Label>
            <Select value={formState.fornecedorId} onValueChange={(v) => setFormState({ ...formState, fornecedorId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {formState.tipo === 'receita' && (
        <div className="space-y-2">
          <Label>Doador (CRM)</Label>
          <Select value={formState.doadorId} onValueChange={(v) => setFormState({ ...formState, doadorId: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o doador" />
            </SelectTrigger>
            <SelectContent>
              {donors.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Pesquisador (Opcional)</Label>
        <Select value={formState.pesquisadorId} onValueChange={(v) => setFormState({ ...formState, pesquisadorId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o pesquisador" />
          </SelectTrigger>
          <SelectContent>
            {researchers.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={formState.status} onValueChange={(v) => setFormState({ ...formState, status: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="a_vencer">A Vencer</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-2 flex items-center space-x-2">
        <Switch
          id="public"
          checked={formState.isPublic}
          onCheckedChange={(checked) => setFormState({ ...formState, isPublic: checked })}
        />
        <Label htmlFor="public">Tornar publico na transparencia</Label>
      </div>

      <div className="col-span-2 space-y-2">
        <Label>Observacoes</Label>
        <Textarea
          placeholder="Observacoes adicionais..."
          value={formState.observacoes}
          onChange={(e) => setFormState({ ...formState, observacoes: e.target.value })}
        />
      </div>

      <div className="col-span-2 space-y-2">
        <Label>Comprovante</Label>
        <div className="flex items-center gap-3">
          <label className="flex-1 cursor-pointer">
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border border-dashed transition-colors ${formState.documentoAnexo ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}>
              <Upload className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {formState.documentoAnexo ? 'Comprovante anexado' : 'Selecionar arquivo (PDF, imagem)'}
              </span>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setFormState({ ...formState, documentoAnexo: reader.result as string });
                reader.readAsDataURL(file);
                e.target.value = '';
              }}
            />
          </label>
          {formState.documentoAnexo && (
            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setFormState({ ...formState, documentoAnexo: '' })}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestao Financeira</h1>
          <p className="text-gray-600">Controle completo das financas da organizacao</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transacoes" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Transacoes
          </TabsTrigger>
          <TabsTrigger value="contas" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Contas Bancarias
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatorios
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuracoes
          </TabsTrigger>
        </TabsList>

        {/* ══════════════════ ABA TRANSACOES ══════════════════ */}
        <TabsContent value="transacoes" className="space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {transacoes.filter((t) => t.tipo === 'receita').length} transacoes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {transacoes.filter((t) => t.tipo === 'despesa').length} transacoes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Balanco atual
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transparencia</CardTitle>
                <Eye className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {transacoes.length > 0
                    ? Math.round((transacoes.filter((t) => t.isPublic).length / transacoes.length) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Dados publicos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Dialog open={isNewTransactionOpen} onOpenChange={setIsNewTransactionOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Transacao
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nova Transacao</DialogTitle>
                    <DialogDescription>Adicione uma nova transacao financeira</DialogDescription>
                  </DialogHeader>
                  {renderTransactionForm(newTransaction, setNewTransaction)}
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsNewTransactionOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateTransaction} className="flex-1" disabled={createTxMutation.isPending}>
                      {createTxMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Criar Transacao
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Modal de Edicao de Transacao */}
              <Dialog open={isEditTransactionOpen} onOpenChange={setIsEditTransactionOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Editar Transacao</DialogTitle>
                    <DialogDescription>Modifique os dados da transacao financeira</DialogDescription>
                  </DialogHeader>
                  {renderTransactionForm(editTransaction, setEditTransaction)}
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditTransactionOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdateTransaction} className="flex-1" disabled={updateTxMutation.isPending}>
                      {updateTxMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Salvar Alteracoes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex items-center gap-2">
                <Button variant={viewMode === 'lista' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('lista')}>
                  <Columns className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'quadro' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('quadro')}>
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                    {(filters.dateFrom || filters.dateTo || filters.tipo || filters.status || filters.contaId || filters.categoriaId || filters.projetoId) && (
                      <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                        {[filters.dateFrom, filters.dateTo, filters.tipo, filters.status, filters.contaId, filters.categoriaId, filters.projetoId].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Filtros de Transacao</DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data Inicial</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !filters.dateFrom && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateFrom ? format(filters.dateFrom, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={filters.dateFrom ?? undefined} onSelect={(date) => setFilters({ ...filters, dateFrom: date ?? null })} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Data Final</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !filters.dateTo && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateTo ? format(filters.dateTo, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={filters.dateTo ?? undefined} onSelect={(date) => setFilters({ ...filters, dateTo: date ?? null })} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={filters.tipo} onValueChange={(v) => setFilters({ ...filters, tipo: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="receita">Receita</SelectItem>
                          <SelectItem value="despesa">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem>
                          <SelectItem value="a_vencer">A Vencer</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Conta Bancaria</Label>
                      <Select value={filters.contaId} onValueChange={(v) => setFilters({ ...filters, contaId: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas as contas" />
                        </SelectTrigger>
                        <SelectContent>
                          {contas.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={filters.categoriaId} onValueChange={(v) => setFilters({ ...filters, categoriaId: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas as categorias" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label>Projeto</Label>
                      <Select value={filters.projetoId} onValueChange={(v) => setFilters({ ...filters, projetoId: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os projetos" />
                        </SelectTrigger>
                        <SelectContent>
                          {projetos.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={clearFilters} className="flex-1">
                      Limpar Filtros
                    </Button>
                    <Button onClick={() => setIsFiltersOpen(false)} className="flex-1">
                      Aplicar Filtros
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={handleExportTransactions}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Tabela de Transacoes */}
          {loadingTx ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Carregando transacoes...</p>
              </CardContent>
            </Card>
          ) : viewMode === 'lista' ? (
            <Card>
              <CardHeader>
                <CardTitle>Transacoes Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descricao</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Banco</TableHead>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                          Nenhuma transacao encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const conta = tx.contaId ? contaMap.get(tx.contaId) : null;
                        const projeto = tx.projetoId ? projetoMap.get(tx.projetoId) : null;
                        const valor = Number(tx.valor);
                        return (
                          <TableRow key={tx.id}>
                            <TableCell>{format(new Date(tx.data), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>{tx.descricao}</TableCell>
                            <TableCell>
                              <Badge variant={tx.tipo === 'receita' ? 'default' : 'destructive'}>
                                {TIPO_LABELS[tx.tipo]}
                              </Badge>
                            </TableCell>
                            <TableCell className={tx.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
                              R$ {Math.abs(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                {conta?.banco || '-'}
                              </span>
                            </TableCell>
                            <TableCell>{projeto?.nome || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={
                                tx.status === 'pago' ? 'default' :
                                tx.status === 'pendente' ? 'secondary' :
                                tx.status === 'cancelado' ? 'destructive' : 'outline'
                              }>
                                {STATUS_LABELS[tx.status]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditTransaction(tx)} title="Editar transacao">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTransaction(tx)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Excluir transacao"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            // Visualizacao Quadro (Kanban) com Drag and Drop
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {(['pendente', 'pago', 'a_vencer', 'cancelado'] as const).map((status) => (
                  <Card key={status}>
                    <CardHeader>
                      <CardTitle className="text-center flex items-center justify-center gap-2">
                        {status === 'pendente' && <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>}
                        {status === 'pago' && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                        {status === 'a_vencer' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                        {status === 'cancelado' && <div className="w-3 h-3 bg-gray-500 rounded-full"></div>}
                        {STATUS_LABELS[status]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Droppable droppableId={status}>
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                              snapshot.isDraggingOver ? 'bg-gray-50 border-2 border-dashed border-gray-300' : ''
                            }`}
                          >
                            {filteredTransactions
                              .filter((t) => t.status === status)
                              .map((tx, index) => {
                                const projeto = tx.projetoId ? projetoMap.get(tx.projetoId) : null;
                                const valor = Number(tx.valor);
                                return (
                                  <Draggable key={tx.id} draggableId={tx.id} index={index}>
                                    {(provided, snapshot) => (
                                      <Card
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`p-3 cursor-move transition-shadow ${
                                          snapshot.isDragging ? 'shadow-lg rotate-3' : 'hover:shadow-md'
                                        }`}
                                      >
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <Badge variant={tx.tipo === 'receita' ? 'default' : 'destructive'}>
                                              {TIPO_LABELS[tx.tipo]}
                                            </Badge>
                                            <span className={`font-medium ${tx.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                                              R$ {Math.abs(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                          </div>
                                          <p className="text-sm font-medium">{tx.descricao}</p>
                                          <p className="text-xs text-gray-500">{format(new Date(tx.data), 'dd/MM/yyyy')}</p>
                                          {projeto && (
                                            <p className="text-xs text-blue-600">{projeto.nome}</p>
                                          )}
                                        </div>
                                      </Card>
                                    )}
                                  </Draggable>
                                );
                              })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DragDropContext>
          )}
        </TabsContent>

        {/* ══════════════════ ABA CONTAS BANCARIAS ══════════════════ */}
        <TabsContent value="contas" className="space-y-6">
          <Tabs value={activeAccountTab} onValueChange={setActiveAccountTab}>
            <TabsList className="w-full">
              <TabsTrigger value="add-account" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Conta
              </TabsTrigger>
              {contas.map((account) => (
                <TabsTrigger key={account.id} value={account.id}>
                  {account.nome}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="add-account">
              <Card>
                <CardHeader>
                  <CardTitle>Nova Conta Bancaria</CardTitle>
                  <CardDescription>Adicione uma nova conta bancaria ao sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome da Conta</Label>
                      <Input placeholder="Ex: Bradesco Principal" value={newAccount.nome} onChange={(e) => setNewAccount({ ...newAccount, nome: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Banco</Label>
                      <Input placeholder="Ex: Bradesco" value={newAccount.banco} onChange={(e) => setNewAccount({ ...newAccount, banco: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Agencia</Label>
                      <Input placeholder="Ex: 1234" value={newAccount.agencia} onChange={(e) => setNewAccount({ ...newAccount, agencia: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Numero da Conta</Label>
                      <Input placeholder="Ex: 12345-6" value={newAccount.conta} onChange={(e) => setNewAccount({ ...newAccount, conta: e.target.value })} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Saldo Inicial</Label>
                      <Input type="number" placeholder="0,00" value={newAccount.saldoInicial} onChange={(e) => setNewAccount({ ...newAccount, saldoInicial: e.target.value })} />
                    </div>
                  </div>
                  <Button onClick={handleCreateAccount} className="mt-4" disabled={createAccountMutation.isPending}>
                    {createAccountMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Criar Conta
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {contas.map((account) => {
              const accountTxs = getTransactionsByAccount(account.id);
              const accReceitas = accountTxs.filter((t) => t.tipo === 'receita' && t.status === 'pago').reduce((sum, t) => sum + Number(t.valor), 0);
              const accDespesas = accountTxs.filter((t) => t.tipo === 'despesa' && t.status === 'pago').reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);
              const saldoConta = Number(account.saldoInicial) + accReceitas - accDespesas;

              return (
                <TabsContent key={account.id} value={account.id}>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold">{account.nome}</h3>
                        <p className="text-sm text-gray-600">{account.banco} - Agencia: {account.agencia} - Conta: {account.conta}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteAccount(account); }}
                        className="flex items-center gap-2"
                        disabled={deleteAccountMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir Conta
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-600">
                            R$ {saldoConta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <p className="text-xs text-muted-foreground">{account.banco} - {account.agencia}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            R$ {accReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-600">
                            R$ {accDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Transacoes</CardTitle>
                          <Target className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-purple-600">{accountTxs.length}</div>
                          <p className="text-xs text-muted-foreground">Nesta conta</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Extrato - {account.nome}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Descricao</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Valor</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {accountTxs.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                  Nenhuma transacao nesta conta
                                </TableCell>
                              </TableRow>
                            ) : (
                              accountTxs.map((tx) => {
                                const valor = Number(tx.valor);
                                return (
                                  <TableRow key={tx.id}>
                                    <TableCell>{format(new Date(tx.data), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{tx.descricao}</TableCell>
                                    <TableCell>
                                      <Badge variant={tx.tipo === 'receita' ? 'default' : 'destructive'}>
                                        {TIPO_LABELS[tx.tipo]}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className={tx.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
                                      R$ {Math.abs(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={
                                        tx.status === 'pago' ? 'default' :
                                        tx.status === 'pendente' ? 'secondary' :
                                        tx.status === 'cancelado' ? 'destructive' : 'outline'
                                      }>
                                        {STATUS_LABELS[tx.status]}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </TabsContent>

        {/* ══════════════════ ABA RELATORIOS ══════════════════ */}
        <TabsContent value="relatorios" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Relatorios Financeiros</h3>
            <div className="flex items-center gap-2">
              <Button onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatorio
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Resumo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Receitas:</span>
                    <span className="font-bold text-green-600">R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Despesas:</span>
                    <span className="font-bold text-red-600">R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-bold">Saldo:</span>
                    <span className={`font-bold ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categorias.filter((cat) => cat.tipo === 'despesa' || cat.tipo === 'ambos').map((cat) => {
                    const categoryTotal = transacoes
                      .filter((t) => t.categoriaId === cat.id && t.tipo === 'despesa' && t.status === 'pago')
                      .reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);
                    const percentage = totalDespesas > 0 ? (categoryTotal / totalDespesas) * 100 : 0;

                    return (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{cat.nome}</span>
                          <span>R$ {categoryTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custos Fixos vs Variaveis</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const fixos = transacoes.filter((t) => t.tipo === 'despesa' && t.tipoCusto === 'fixo' && t.status === 'pago').reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);
                  const variaveis = transacoes.filter((t) => t.tipo === 'despesa' && t.tipoCusto === 'variavel' && t.status === 'pago').reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);
                  const totalCustos = fixos + variaveis;
                  const percFixos = totalCustos > 0 ? Math.round((fixos / totalCustos) * 100) : 0;
                  const percVariaveis = totalCustos > 0 ? Math.round((variaveis / totalCustos) * 100) : 0;

                  return (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{percFixos}%</div>
                        <p className="text-sm text-gray-600">Custos Fixos</p>
                        <p className="text-xs text-gray-400">R$ {fixos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">{percVariaveis}%</div>
                        <p className="text-sm text-gray-600">Custos Variaveis</p>
                        <p className="text-xs text-gray-400">R$ {variaveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Evolucao Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                [Grafico de evolucao mensal sera implementado aqui]
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════ ABA CONFIGURACOES ══════════════════ */}
        <TabsContent value="configuracoes" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Categorias de Transacao</h3>
              <p className="text-gray-600">Gerencie as categorias disponiveis para classificar as transacoes</p>
            </div>
            <Dialog
              open={isNewCategoryOpen}
              onOpenChange={(open) => {
                setIsNewCategoryOpen(open);
                if (!open) {
                  setNewCategory({ ...emptyCategoryForm });
                  setEditingCategoryId(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={() => { setNewCategory({ ...emptyCategoryForm }); setEditingCategoryId(null); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCategoryId ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome da Categoria</Label>
                    <Input
                      placeholder="Ex: Marketing"
                      value={newCategory.nome}
                      onChange={(e) => setNewCategory({ ...newCategory, nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={newCategory.tipo} onValueChange={(v) => setNewCategory({ ...newCategory, tipo: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ambos">Receita e Despesa</SelectItem>
                        <SelectItem value="receita">Apenas Receita</SelectItem>
                        <SelectItem value="despesa">Apenas Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setIsNewCategoryOpen(false); setNewCategory({ ...emptyCategoryForm }); setEditingCategoryId(null); }} className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateOrUpdateCategory}
                    className="flex-1"
                    disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  >
                    {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingCategoryId ? 'Salvar Alteracoes' : 'Criar Categoria'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorias.map((cat) => {
                    const usage = transacoes.filter((t) => t.categoriaId === cat.id).length;
                    return (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.nome}</TableCell>
                        <TableCell>
                          <Badge variant={
                            cat.tipo === 'ambos' ? 'default' :
                            cat.tipo === 'receita' ? 'secondary' : 'outline'
                          }>
                            {CATEGORY_TYPE_LABELS[cat.tipo] || cat.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>{usage} transacoes</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditCategory(cat)} title="Editar categoria">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(cat)}
                              disabled={usage > 0}
                              className={usage > 0 ? "opacity-50 cursor-not-allowed" : "text-red-600 hover:text-red-700 hover:bg-red-50"}
                              title={usage > 0 ? "Categoria em uso, nao pode ser excluida" : "Excluir categoria"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
