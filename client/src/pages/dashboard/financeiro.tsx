import React, { useState, useEffect } from 'react';
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
  MoreHorizontal,
  Columns,
  Grid3X3,
  Building2,
  Users,
  FileText,
  Settings,
  Upload,
  CreditCard,
  Target,
  PieChart
} from 'lucide-react';

// Mock data
const mockTransactions = [
  { id: 1, date: '2024-01-15', description: 'Doação João Silva', type: 'Receita', amount: 1500, project: 'Projeto Coração Ribeirinho', status: 'Pago', account: 'Bradesco 001', category: 'Doação' },
  { id: 2, date: '2024-01-14', description: 'Compra de equipamentos', type: 'Despesa', amount: -800, project: 'Infraestrutura', status: 'Pendente', account: 'Caixa 002', category: 'Equipamentos' },
  { id: 3, date: '2024-01-13', description: 'Salário funcionário', type: 'Despesa', amount: -2500, project: null, status: 'Pago', account: 'Bradesco 001', category: 'Recursos Humanos' },
  { id: 4, date: '2024-01-12', description: 'Doação Maria Santos', type: 'Receita', amount: 500, project: 'Projeto Educação', status: 'A Vencer', account: 'Caixa 002', category: 'Doação' }
];

const mockAccounts = [
  { id: 1, name: 'Bradesco 001', bank: 'Bradesco', agency: '1234', number: '12345-6', balance: 15000 },
  { id: 2, name: 'Caixa 002', bank: 'Caixa Econômica', agency: '5678', number: '98765-4', balance: 8500 }
];

const mockSuppliers = [
  { id: 1, name: 'Tech Solutions LTDA', document: '12.345.678/0001-90', contact: '(11) 98765-4321', pix: 'tech@solutions.com' },
  { id: 2, name: 'Materiais Norte', document: '98.765.432/0001-10', contact: '(11) 91234-5678', pix: '98765432000110' }
];

const mockDonors = [
  { id: 1, name: 'João Silva', document: '123.456.789-00', contact: '(11) 99999-8888', pix: 'joao.silva@email.com' },
  { id: 2, name: 'Maria Santos', document: '987.654.321-00', contact: '(11) 88888-7777', pix: '11999998888' }
];

const mockCategories = [
  { id: 1, name: 'Doação', type: 'both' },
  { id: 2, name: 'Recursos Humanos', type: 'expense' },
  { id: 3, name: 'Equipamentos', type: 'expense' },
  { id: 4, name: 'Marketing', type: 'expense' },
  { id: 5, name: 'Infraestrutura', type: 'expense' }
];

const mockProjects = [
  { id: 1, name: 'Projeto Coração Ribeirinho' },
  { id: 2, name: 'Projeto Educação' },
  { id: 3, name: 'Infraestrutura' }
];

export default function DashboardFinanceiroPage() {
  const [activeTab, setActiveTab] = useState('transacoes');
  const [activeAccountTab, setActiveAccountTab] = useState('add-account');
  const [activeContactTab, setActiveContactTab] = useState('fornecedores');
  const [viewMode, setViewMode] = useState('lista'); // 'lista' or 'quadro'
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isNewDonorOpen, setIsNewDonorOpen] = useState(false);
  const [isEditDonorOpen, setIsEditDonorOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState(null);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [accounts, setAccounts] = useState(mockAccounts);
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [donors, setDonors] = useState(mockDonors);
  const [categories, setCategories] = useState(mockCategories);
  const [transactions, setTransactions] = useState(mockTransactions);

  // Form states
  const [newTransaction, setNewTransaction] = useState({
    type: '',
    description: '',
    amount: '',
    date: new Date(),
    account: '',
    category: '',
    project: '',
    costType: '',
    supplier: '',
    donor: '',
    status: 'Pendente',
    isPublic: false,
    document: null
  });

  const [editTransaction, setEditTransaction] = useState({
    type: '',
    description: '',
    amount: '',
    date: new Date(),
    account: '',
    category: '',
    project: '',
    costType: '',
    supplier: '',
    donor: '',
    status: 'Pendente',
    isPublic: false,
    document: null
  });

  const [newAccount, setNewAccount] = useState({
    name: '',
    bank: '',
    agency: '',
    number: '',
    balance: ''
  });

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    document: '',
    contact: '',
    pix: ''
  });

  const [editSupplier, setEditSupplier] = useState({
    name: '',
    document: '',
    contact: '',
    pix: ''
  });

  const [newDonor, setNewDonor] = useState({
    name: '',
    document: '',
    contact: '',
    pix: ''
  });

  const [editDonor, setEditDonor] = useState({
    name: '',
    document: '',
    contact: '',
    pix: ''
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'both'
  });

  // Estados para filters
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: null,
    dateTo: null,
    type: '',
    status: '',
    account: '',
    category: '',
    project: ''
  });

  // Calculate totals (using filtered transactions for display)
  const filteredTransactions = transactions.filter(transaction => {
    // Date filters
    if (filters.dateFrom) {
      const transactionDate = new Date(transaction.date);
      const fromDate = new Date(filters.dateFrom);
      if (transactionDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const transactionDate = new Date(transaction.date);
      const toDate = new Date(filters.dateTo);
      if (transactionDate > toDate) return false;
    }

    // Type filter
    if (filters.type && transaction.type !== filters.type) return false;

    // Status filter
    if (filters.status && transaction.status !== filters.status) return false;

    // Account filter
    if (filters.account && transaction.account !== filters.account) return false;

    // Category filter
    if (filters.category && transaction.category !== filters.category) return false;

    // Project filter
    if (filters.project && transaction.project !== filters.project) return false;

    return true;
  });

  const totalReceitas = filteredTransactions
    .filter(t => t.type === 'Receita' && t.status === 'Pago')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = filteredTransactions
    .filter(t => t.type === 'Despesa' && t.status === 'Pago')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const saldoAtual = totalReceitas - totalDespesas;

  // Handlers
  const handleCreateTransaction = () => {
    const transaction = {
      id: Date.now(),
      date: format(newTransaction.date, 'yyyy-MM-dd'),
      description: newTransaction.description,
      type: newTransaction.type,
      amount: newTransaction.type === 'Despesa' ? -Math.abs(Number(newTransaction.amount)) : Number(newTransaction.amount),
      project: newTransaction.project || null,
      status: newTransaction.status,
      account: newTransaction.account,
      category: newTransaction.category
    };

    setTransactions([transaction, ...transactions]);
    setIsNewTransactionOpen(false);
    setNewTransaction({
      type: '',
      description: '',
      amount: '',
      date: new Date(),
      account: '',
      category: '',
      project: '',
      costType: '',
      supplier: '',
      donor: '',
      status: 'Pendente',
      isPublic: false,
      document: null
    });
  };

  const handleCreateAccount = () => {
    const account = {
      id: Date.now(),
      name: newAccount.name,
      bank: newAccount.bank,
      agency: newAccount.agency,
      number: newAccount.number,
      balance: Number(newAccount.balance)
    };

    setAccounts([...accounts, account]);
    setIsNewAccountOpen(false);
    setNewAccount({ name: '', bank: '', agency: '', number: '', balance: '' });
    setActiveAccountTab(account.name.toLowerCase().replace(/\s+/g, '-'));
  };

  const handleCreateSupplier = () => {
    const supplier = {
      id: Date.now(),
      name: newSupplier.name,
      document: newSupplier.document,
      contact: newSupplier.contact,
      pix: newSupplier.pix
    };

    setSuppliers([...suppliers, supplier]);
    setIsNewSupplierOpen(false);
    setNewSupplier({ name: '', document: '', contact: '', pix: '' });
  };

  const handleCreateDonor = () => {
    const donor = {
      id: Date.now(),
      name: newDonor.name,
      document: newDonor.document,
      contact: newDonor.contact,
      pix: newDonor.pix
    };

    setDonors([...donors, donor]);
    setIsNewDonorOpen(false);
    setNewDonor({ name: '', document: '', contact: '', pix: '' });
  };

  const handleCreateCategory = () => {
    const category = {
      id: Date.now(),
      name: newCategory.name,
      type: newCategory.type
    };

    setCategories([...categories, category]);
    setIsNewCategoryOpen(false);
    setNewCategory({ name: '', type: 'both' });
  };

  const handleDeleteAccount = (accountId) => {
    const accountToDelete = accounts.find(a => a.id === accountId);
    if (!accountToDelete) {
      alert('Conta não encontrada.');
      return;
    }

    const hasTransactions = transactions.some(t => t.account === accountToDelete.name);

    if (hasTransactions) {
      alert(`Não é possível excluir a conta "${accountToDelete.name}" pois há transações vinculadas a ela. Exclua ou transfira as transações primeiro.`);
      return;
    }

    const confirmMessage = `Tem certeza que deseja excluir a conta "${accountToDelete.name}" do banco ${accountToDelete.bank}?\n\nEsta ação não pode ser desfeita.`;

    if (window.confirm(confirmMessage)) {
      setAccounts(prevAccounts => prevAccounts.filter(account => account.id !== accountId));

      const accountTab = accountToDelete.name.toLowerCase().replace(/\s+/g, '-');
      if (activeAccountTab === accountTab) {
        setActiveAccountTab('add-account');
      }

      alert(`Conta "${accountToDelete.name}" excluída com sucesso!`);
    }
  };

  const handleDeleteTransaction = (transactionId) => {
    const transactionToDelete = transactions.find(t => t.id === transactionId);

    if (!transactionToDelete) {
      alert('Transação não encontrada.');
      return;
    }

    const confirmMessage = `Tem certeza que deseja excluir a transação "${transactionToDelete.description}"?\n\nValor: R$ ${Math.abs(transactionToDelete.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nData: ${format(new Date(transactionToDelete.date), 'dd/MM/yyyy')}\n\nEsta ação não pode ser desfeita.`;

    if (window.confirm(confirmMessage)) {
      setTransactions(prevTransactions => prevTransactions.filter(t => t.id !== transactionId));
      alert('Transação excluída com sucesso!');
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setEditTransaction({
      type: transaction.type,
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      date: new Date(transaction.date),
      account: transaction.account,
      category: transaction.category,
      project: transaction.project || '',
      costType: '',
      supplier: '',
      donor: '',
      status: transaction.status,
      isPublic: false,
      document: null
    });
    setIsEditTransactionOpen(true);
  };

  const handleUpdateTransaction = () => {
    if (!editingTransaction) return;

    const updatedTransaction = {
      ...editingTransaction,
      type: editTransaction.type,
      description: editTransaction.description,
      amount: editTransaction.type === 'Despesa' ? -Math.abs(Number(editTransaction.amount)) : Number(editTransaction.amount),
      date: format(editTransaction.date, 'yyyy-MM-dd'),
      account: editTransaction.account,
      category: editTransaction.category,
      project: editTransaction.project || null,
      status: editTransaction.status
    };

    setTransactions(transactions.map(t => 
      t.id === editingTransaction.id ? updatedTransaction : t
    ));

    setIsEditTransactionOpen(false);
    setEditingTransaction(null);
    setEditTransaction({
      type: '',
      description: '',
      amount: '',
      date: new Date(),
      account: '',
      category: '',
      project: '',
      costType: '',
      supplier: '',
      donor: '',
      status: 'Pendente',
      isPublic: false,
      document: null
    });
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setEditSupplier({
      name: supplier.name,
      document: supplier.document,
      contact: supplier.contact,
      pix: supplier.pix,
    });
    setIsEditSupplierOpen(true);
  };

  const handleUpdateSupplier = () => {
    if (!editingSupplier) return;

    const updatedSupplier = {
      ...editingSupplier,
      name: editSupplier.name,
      document: editSupplier.document,
      contact: editSupplier.contact,
      pix: editSupplier.pix,
    };

    setSuppliers(suppliers.map(s =>
      s.id === editingSupplier.id ? updatedSupplier : s
    ));

    setIsEditSupplierOpen(false);
    setEditingSupplier(null);
    setEditSupplier({ name: '', document: '', contact: '', pix: '' });
  };

  const handleEditDonor = (donor) => {
    setEditingDonor(donor);
    setEditDonor({
      name: donor.name,
      document: donor.document,
      contact: donor.contact,
      pix: donor.pix,
    });
    setIsEditDonorOpen(true);
  };

  const handleUpdateDonor = () => {
    if (!editingDonor) return;

    const updatedDonor = {
      ...editingDonor,
      name: editDonor.name,
      document: editDonor.document,
      contact: editDonor.contact,
      pix: editDonor.pix,
    };

    setDonors(donors.map(d =>
      d.id === editingDonor.id ? updatedDonor : d
    ));

    setIsEditDonorOpen(false);
    setEditingDonor(null);
    setEditDonor({ name: '', document: '', contact: '', pix: '' });
  };

  // Drag and drop handler
  const handleOnDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const transactionId = parseInt(draggableId);

    setTransactions(transactions.map(transaction => 
      transaction.id === transactionId 
        ? { ...transaction, status: newStatus }
        : transaction
    ));
  };

  // Filter transactions by account
  const getTransactionsByAccount = (accountName) => {
    return transactions.filter(t => t.account === accountName);
  };

  // Calculate account balance
  const getAccountBalance = (accountName) => {
    const account = accounts.find(a => a.name === accountName);
    const accountTransactions = getTransactionsByAccount(accountName);
    const transactionSum = accountTransactions
      .filter(t => t.status === 'Pago')
      .reduce((sum, t) => sum + t.amount, 0);
    return account ? account.balance + transactionSum : 0;
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      type: '',
      status: '',
      account: '',
      category: '',
      project: ''
    });
  };

  const handleExportTransactions = () => {
    if (filteredTransactions.length === 0) {
      alert('Não há transações para exportar com os filtros aplicados.');
      return;
    }

    // Preparar dados para exportação de forma mais organizada
    const exportData = filteredTransactions.map(transaction => {
      // Formatar valor sem símbolos para melhor compatibilidade
      const valorFormatado = Math.abs(transaction.amount).toFixed(2).replace('.', ',');
      const sinalValor = transaction.type === 'Receita' ? '+' : '-';

      return {
        'Data': format(new Date(transaction.date), 'dd/MM/yyyy'),
        'Descrição': transaction.description || '',
        'Tipo': transaction.type || '',
        'Valor (R$)': `${sinalValor}${valorFormatado}`,
        'Conta Bancária': transaction.account || '',
        'Categoria': transaction.category || '',
        'Projeto': transaction.project || '',
        'Status': transaction.status || ''
      };
    });

    // Definir ordem das colunas
    const headers = [
      'Data',
      'Descrição', 
      'Tipo',
      'Valor (R$)',
      'Conta Bancária',
      'Categoria',
      'Projeto',
      'Status'
    ];

    // Função para escapar caracteres especiais no CSV
    const escapeCsvField = (field) => {
      if (field === null || field === undefined) return '';
      const stringField = String(field);
      // Escapar aspas duplas duplicando-as
      const escapedField = stringField.replace(/"/g, '""');
      // Envolver em aspas se contém vírgula, quebra de linha ou aspas
      if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
        return `"${escapedField}"`;
      }
      return escapedField;
    };

    // Criar conteúdo CSV
    const csvRows = [];

    // Adicionar cabeçalho
    csvRows.push(headers.map(escapeCsvField).join(','));

    // Adicionar dados
    exportData.forEach(row => {
      const csvRow = headers.map(header => escapeCsvField(row[header] || '')).join(',');
      csvRows.push(csvRow);
    });

    // Adicionar BOM para UTF-8 (melhora compatibilidade com Excel)
    const csvContent = '\uFEFF' + csvRows.join('\n');

    // Criar arquivo e fazer download
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Nome do arquivo com informações dos filtros
    let fileName = `transacoes_financeiras_${format(new Date(), 'dd-MM-yyyy')}`;
    if (filters.dateFrom || filters.dateTo) {
      const periodo = `${filters.dateFrom ? format(filters.dateFrom, 'dd-MM-yyyy') : 'inicio'}_a_${filters.dateTo ? format(filters.dateTo, 'dd-MM-yyyy') : 'hoje'}`;
      fileName += `_periodo_${periodo}`;
    }
    if (filters.type) {
      fileName += `_${filters.type.toLowerCase()}`;
    }
    fileName += '.csv';

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpar URL
    URL.revokeObjectURL(url);

    // Feedback para o usuário
    alert(`✅ Exportação concluída!\n\n📊 ${filteredTransactions.length} transações exportadas\n📁 Arquivo: ${fileName}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão Financeira</h1>
          <p className="text-gray-600">Controle completo das finanças da organização</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="transacoes" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Transações
          </TabsTrigger>
          <TabsTrigger value="contas" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Contas Bancárias
          </TabsTrigger>
          <TabsTrigger value="contatos" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contatos
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* ABA TRANSAÇÕES */}
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
                  +12% desde o mês passado
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
                  +5% desde o mês passado
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
                  Balanço atual
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transparência</CardTitle>
                <Eye className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">94%</div>
                <p className="text-xs text-muted-foreground">
                  Dados públicos
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
                    Nova Transação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nova Transação</DialogTitle>
                    <DialogDescription>
                      Adicione uma nova transação financeira
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo *</Label>
                      <Select value={newTransaction.type} onValueChange={(value) => setNewTransaction({...newTransaction, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Receita">Receita</SelectItem>
                          <SelectItem value="Despesa">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Valor (R$) *</Label>
                      <Input
                        type="number"
                        placeholder="0,00"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Descrição *</Label>
                      <Input
                        placeholder="Descrição da transação"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newTransaction.date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newTransaction.date ? format(newTransaction.date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newTransaction.date}
                            onSelect={(date) => setNewTransaction({...newTransaction, date: date || new Date()})}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account">Conta Bancária *</Label>
                      <Select value={newTransaction.account} onValueChange={(value) => setNewTransaction({...newTransaction, account: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a conta" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.id} value={account.name}>{account.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter(cat => cat.type === 'both' || 
                              (newTransaction.type === 'Receita' && cat.type === 'income') ||
                              (newTransaction.type === 'Despesa' && cat.type === 'expense'))
                            .map(category => (
                              <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project">Projeto (Opcional)</Label>
                      <Select value={newTransaction.project} onValueChange={(value) => setNewTransaction({...newTransaction, project: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o projeto" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProjects.map(project => (
                            <SelectItem key={project.id} value={project.name}>{project.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {newTransaction.type === 'Despesa' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="costType">Tipo de Custo</Label>
                          <Select value={newTransaction.costType} onValueChange={(value) => setNewTransaction({...newTransaction, costType: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Custo Fixo">Custo Fixo</SelectItem>
                              <SelectItem value="Custo Variável">Custo Variável</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="supplier">Fornecedor</Label>
                          <Select value={newTransaction.supplier} onValueChange={(value) => setNewTransaction({...newTransaction, supplier: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o fornecedor" />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliers.map(supplier => (
                                <SelectItem key={supplier.id} value={supplier.name}>{supplier.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {newTransaction.type === 'Receita' && (
                      <div className="space-y-2">
                        <Label htmlFor="donor">Doador</Label>
                        <Select value={newTransaction.donor} onValueChange={(value) => setNewTransaction({...newTransaction, donor: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o doador" />
                          </SelectTrigger>
                          <SelectContent>
                            {donors.map(donor => (
                              <SelectItem key={donor.id} value={donor.name}>{donor.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={newTransaction.status} onValueChange={(value) => setNewTransaction({...newTransaction, status: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Pago">Pago</SelectItem>
                          <SelectItem value="A Vencer">A Vencer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2 flex items-center space-x-2">
                      <Switch
                        id="public"
                        checked={newTransaction.isPublic}
                        onCheckedChange={(checked) => setNewTransaction({...newTransaction, isPublic: checked})}
                      />
                      <Label htmlFor="public">Tornar público na transparência</Label>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="document">Anexar Documento</Label>
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar arquivo
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsNewTransactionOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateTransaction} className="flex-1">
                      Criar Transação
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Modal de Edição de Transação */}
              <Dialog open={isEditTransactionOpen} onOpenChange={setIsEditTransactionOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Editar Transação</DialogTitle>
                    <DialogDescription>
                      Modifique os dados da transação financeira
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-type">Tipo *</Label>
                      <Select value={editTransaction.type} onValueChange={(value) => setEditTransaction({...editTransaction, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Receita">Receita</SelectItem>
                          <SelectItem value="Despesa">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-amount">Valor (R$) *</Label>
                      <Input
                        type="number"
                        placeholder="0,00"
                        value={editTransaction.amount}
                        onChange={(e) => setEditTransaction({...editTransaction, amount: e.target.value})}
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="edit-description">Descrição *</Label>
                      <Input
                        placeholder="Descrição da transação"
                        value={editTransaction.description}
                        onChange={(e) => setEditTransaction({...editTransaction, description: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !editTransaction.date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {editTransaction.date ? format(editTransaction.date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={editTransaction.date}
                            onSelect={(date) => setEditTransaction({...editTransaction, date: date || new Date()})}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-account">Conta Bancária *</Label>
                      <Select value={editTransaction.account} onValueChange={(value) => setEditTransaction({...editTransaction, account: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a conta" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.id} value={account.name}>{account.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-category">Categoria *</Label>
                      <Select value={editTransaction.category} onValueChange={(value) => setEditTransaction({...editTransaction, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter(cat => cat.type === 'both' || 
                              (editTransaction.type === 'Receita' && cat.type === 'income') ||
                              (editTransaction.type === 'Despesa' && cat.type === 'expense'))
                            .map(category => (
                              <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-project">Projeto (Opcional)</Label>
                      <Select value={editTransaction.project} onValueChange={(value) => setEditTransaction({...editTransaction, project: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o projeto" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProjects.map(project => (
                            <SelectItem key={project.id} value={project.name}>{project.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select value={editTransaction.status} onValueChange={(value) => setEditTransaction({...editTransaction, status: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Pago">Pago</SelectItem>
                          <SelectItem value="A Vencer">A Vencer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditTransactionOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdateTransaction} className="flex-1">
                      Salvar Alterações
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'lista' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('lista')}
                >
                  <Columns className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'quadro' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('quadro')}
                >
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
                    {(filters.dateFrom || filters.dateTo || filters.type || filters.status || filters.account || filters.category || filters.project) && (
                      <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                        {[filters.dateFrom, filters.dateTo, filters.type, filters.status, filters.account, filters.category, filters.project].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Filtros de Transação</DialogTitle>
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
                          <Calendar
                            mode="single"
                            selected={filters.dateFrom}
                            onSelect={(date) => setFilters({...filters, dateFrom: date})}
                            initialFocus
                          />
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
                          <Calendar
                            mode="single"
                            selected={filters.dateTo}
                            onSelect={(date) => setFilters({...filters, dateTo: date})}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Receita">Receita</SelectItem>
                          <SelectItem value="Despesa">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Pago">Pago</SelectItem>
                          <SelectItem value="A Vencer">A Vencer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Conta Bancária</Label>
                      <Select value={filters.account} onValueChange={(value) => setFilters({...filters, account: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas as contas" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.id} value={account.name}>{account.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas as categorias" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label>Projeto</Label>
                      <Select value={filters.project} onValueChange={(value) => setFilters({...filters, project: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os projetos" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProjects.map(project => (
                            <SelectItem key={project.id} value={project.name}>{project.name}</SelectItem>
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

          {/* Tabela de Transações */}
          {viewMode === 'lista' ? (
            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Banco</TableHead>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === 'Receita' ? 'default' : 'destructive'}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                          R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {accounts.find(acc => acc.name === transaction.account)?.bank || transaction.account}
                          </span>
                        </TableCell>
                        <TableCell>{transaction.project || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            transaction.status === 'Pago' ? 'default' : 
                            transaction.status === 'Pendente' ? 'secondary' : 'outline'
                          }>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditTransaction(transaction)}
                              title="Editar transação"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Excluir transação"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            // Visualização Quadro (Kanban) com Drag and Drop
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Pendente', 'Pago', 'A Vencer'].map((status) => (
                  <Card key={status}>
                    <CardHeader>
                      <CardTitle className="text-center flex items-center justify-center gap-2">
                        {status === 'Pendente' && <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>}
                        {status === 'Pago' && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                        {status === 'A Vencer' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                        {status}
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
                              .filter(t => t.status === status)
                              .map((transaction, index) => (
                                <Draggable key={transaction.id} draggableId={transaction.id.toString()} index={index}>
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
                                          <Badge variant={transaction.type === 'Receita' ? 'default' : 'destructive'}>
                                            {transaction.type}
                                          </Badge>
                                          <span className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                          </span>
                                        </div>
                                        <p className="text-sm font-medium">{transaction.description}</p>
                                        <p className="text-xs text-gray-500">{format(new Date(transaction.date), 'dd/MM/yyyy')}</p>
                                        {transaction.project && (
                                          <p className="text-xs text-blue-600">{transaction.project}</p>
                                        )}
                                      </div>
                                    </Card>
                                  )}
                                </Draggable>
                              ))}
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

        {/* ABA CONTAS BANCÁRIAS */}
        <TabsContent value="contas" className="space-y-6">
          <Tabs value={activeAccountTab} onValueChange={setActiveAccountTab}>
            <TabsList className="w-full">
              <TabsTrigger value="add-account" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Conta
              </TabsTrigger>
              {accounts.map((account) => (
                <TabsTrigger key={account.id} value={account.name.toLowerCase().replace(/\s+/g, '-')}>
                  {account.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="add-account">
              <Card>
                <CardHeader>
                  <CardTitle>Nova Conta Bancária</CardTitle>
                  <CardDescription>Adicione uma nova conta bancária ao sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountName">Nome da Conta</Label>
                      <Input
                        placeholder="Ex: Bradesco Principal"
                        value={newAccount.name}
                        onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank">Banco</Label>
                      <Input
                        placeholder="Ex: Bradesco"
                        value={newAccount.bank}
                        onChange={(e) => setNewAccount({...newAccount, bank: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agency">Agência</Label>
                      <Input
                        placeholder="Ex: 1234"
                        value={newAccount.agency}
                        onChange={(e) => setNewAccount({...newAccount, agency: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="number">Número da Conta</Label>
                      <Input
                        placeholder="Ex: 12345-6"
                        value={newAccount.number}
                        onChange={(e) => setNewAccount({...newAccount, number: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="balance">Saldo Inicial</Label>
                      <Input
                        type="number"
                        placeholder="0,00"
                        value={newAccount.balance}
                        onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateAccount} className="mt-4">
                    Criar Conta
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {accounts.map((account) => (
              <TabsContent key={account.id} value={account.name.toLowerCase().replace(/\s+/g, '-')}>
                <div className="space-y-6">
                  {/* Cabeçalho da Conta com Botão de Excluir */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold">{account.name}</h3>
                      <p className="text-sm text-gray-600">{account.bank} - Agência: {account.agency} - Conta: {account.number}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteAccount(account.id);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir Conta
                    </Button>
                  </div>

                  {/* Resumo da Conta */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          R$ {getAccountBalance(account.name).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {account.bank} - {account.agency}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          R$ {getTransactionsByAccount(account.name)
                            .filter(t => t.type === 'Receita' && t.status === 'Pago')
                            .reduce((sum, t) => sum + t.amount, 0)
                            .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                          R$ {getTransactionsByAccount(account.name)
                            .filter(t => t.type === 'Despesa' && t.status === 'Pago')
                            .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                            .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transações</CardTitle>
                        <Target className="h-4 w-4 text-purple-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                          {getTransactionsByAccount(account.name).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Este mês
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Extrato da Conta */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Extrato - {account.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getTransactionsByAccount(account.name).map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{transaction.description}</TableCell>
                              <TableCell>
                                <Badge variant={transaction.type === 'Receita' ? 'default' : 'destructive'}>
                                  {transaction.type}
                                </Badge>
                              </TableCell>
                              <TableCell className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                                R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  transaction.status === 'Pago' ? 'default' : 
                                  transaction.status === 'Pendente' ? 'secondary' : 'outline'
                                }>
                                  {transaction.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* ABA CONTATOS */}
        <TabsContent value="contatos" className="space-y-6">
          <Tabs value={activeContactTab} onValueChange={setActiveContactTab}>
            <TabsList className="w-full">
              <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
              <TabsTrigger value="doadores">Doadores</TabsTrigger>
            </TabsList>

            <TabsContent value="fornecedores" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Fornecedores</h3>
                <Dialog open={isNewSupplierOpen} onOpenChange={setIsNewSupplierOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Fornecedor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Fornecedor</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nome/Razão Social</Label>
                        <Input
                          placeholder="Nome do fornecedor"
                          value={newSupplier.name}
                          onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CNPJ/CPF</Label>
                        <Input
                          placeholder="00.000.000/0000-00"
                          value={newSupplier.document}
                          onChange={(e) => setNewSupplier({...newSupplier, document: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contato</Label>
                        <Input
                          placeholder="(11) 99999-9999"
                          value={newSupplier.contact}
                          onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>PIX</Label>
                        <Input
                          placeholder="Chave PIX"
                          value={newSupplier.pix}
                          onChange={(e) => setNewSupplier({...newSupplier, pix: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsNewSupplierOpen(false)} className="flex-1">
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateSupplier} className="flex-1">
                        Criar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={isEditSupplierOpen} onOpenChange={setIsEditSupplierOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Fornecedor</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nome/Razão Social</Label>
                        <Input
                          placeholder="Nome do fornecedor"
                          value={editSupplier.name}
                          onChange={(e) => setEditSupplier({...editSupplier, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CNPJ/CPF</Label>
                        <Input
                          placeholder="00.000.000/0000-00"
                          value={editSupplier.document}
                          onChange={(e) => setEditSupplier({...editSupplier, document: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contato</Label>
                        <Input
                          placeholder="(11) 99999-9999"
                          value={editSupplier.contact}
                          onChange={(e) => setEditSupplier({...editSupplier, contact: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>PIX</Label>
                        <Input
                          placeholder="Chave PIX"
                          value={editSupplier.pix}
                          onChange={(e) => setEditSupplier({...editSupplier, pix: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsEditSupplierOpen(false)} className="flex-1">
                        Cancelar
                      </Button>
                      <Button onClick={handleUpdateSupplier} className="flex-1">
                        Salvar
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
                        <TableHead>Documento</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>PIX</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>{supplier.document}</TableCell>
                          <TableCell>{supplier.contact}</TableCell>
                          <TableCell>{supplier.pix}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditSupplier(supplier)}
                                title="Editar fornecedor"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  if (window.confirm(`Tem certeza que deseja excluir o fornecedor "${supplier.name}"?`)) {
                                    setSuppliers(prev => prev.filter(s => s.id !== supplier.id));
                                    alert('Fornecedor excluído com sucesso!');
                                  }
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Excluir fornecedor"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="doadores" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Doadores</h3>
                <Dialog open={isNewDonorOpen} onOpenChange={setIsNewDonorOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Doador
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Doador</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          placeholder="Nome do doador"
                          value={newDonor.name}
                          onChange={(e) => setNewDonor({...newDonor, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CPF</Label>
                        <Input
                          placeholder="000.000.000-00"
                          value={newDonor.document}
                          onChange={(e) => setNewDonor({...newDonor, document: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contato</Label>
                        <Input
                          placeholder="(11) 99999-9999"
                          value={newDonor.contact}
                          onChange={(e) => setNewDonor({...newDonor, contact: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>PIX</Label>
                        <Input
                          placeholder="Chave PIX"
                          value={newDonor.pix}
                          onChange={(e) => setNewDonor({...newDonor, pix: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsNewDonorOpen(false)} className="flex-1">
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateDonor} className="flex-1">
                        Criar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={isEditDonorOpen} onOpenChange={setIsEditDonorOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Doador</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          placeholder="Nome do doador"
                          value={editDonor.name}
                          onChange={(e) => setEditDonor({...editDonor, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CPF</Label>
                        <Input
                          placeholder="000.000.000-00"
                          value={editDonor.document}
                          onChange={(e) => setEditDonor({...editDonor, document: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contato</Label>
                        <Input
                          placeholder="(11) 99999-9999"
                          value={editDonor.contact}
                          onChange={(e) => setEditDonor({...editDonor, contact: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>PIX</Label>
                        <Input
                          placeholder="Chave PIX"
                          value={editDonor.pix}
                          onChange={(e) => setEditDonor({...editDonor, pix: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsEditDonorOpen(false)} className="flex-1">
                        Cancelar
                      </Button>
                      <Button onClick={handleUpdateDonor} className="flex-1">
                        Salvar
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
                        <TableHead>CPF</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>PIX</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donors.map((donor) => (
                        <TableRow key={donor.id}>
                          <TableCell className="font-medium">{donor.name}</TableCell>
                          <TableCell>{donor.document}</TableCell>
                          <TableCell>{donor.contact}</TableCell>
                          <TableCell>{donor.pix}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditDonor(donor)}
                                title="Editar doador"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  if (window.confirm(`Tem certeza que deseja excluir o doador "${donor.name}"?`)) {
                                    setDonors(prev => prev.filter(d => d.id !== donor.id));
                                    alert('Doador excluído com sucesso!');
                                  }
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Excluir doador"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ABA RELATÓRIOS */}
        <TabsContent value="relatorios" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Relatórios Financeiros</h3>
            <div className="flex items-center gap-2">
              <Select defaultValue="este-mes">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="este-mes">Este Mês</SelectItem>
                  <SelectItem value="ultimos-90">Últimos 90 dias</SelectItem>
                  <SelectItem value="personalizado">Período Customizado</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Resumo Mensal
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
                  {categories.filter(cat => cat.type === 'expense' || cat.type === 'both').map((category) => {
                    const categoryTotal = transactions
                      .filter(t => t.category === category.name && t.type === 'Despesa' && t.status === 'Pago')
                      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                    const percentage = totalDespesas > 0 ? (categoryTotal / totalDespesas) * 100 : 0;

                    return (
                      <div key={category.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{category.name}</span>
                          <span>R$ {categoryTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custos Fixos vs Variáveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">75%</div>
                    <p className="text-sm text-gray-600">Custos Fixos</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">25%</div>
                    <p className="text-sm text-gray-600">Custos Variáveis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                [Gráfico de evolução mensal seria implementado aqui]
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA CONFIGURAÇÕES */}
        <TabsContent value="configuracoes" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Categorias de Transação</h3>
              <p className="text-gray-600">Gerencie as categorias disponíveis para classificar as transações</p>
            </div>
            <Dialog open={isNewCategoryOpen} onOpenChange={setIsNewCategoryOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Categoria</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome da Categoria</Label>
                    <Input
                      placeholder="Ex: Marketing"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={newCategory.type} onValueChange={(value) => setNewCategory({...newCategory, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Receita e Despesa</SelectItem>
                        <SelectItem value="income">Apenas Receita</SelectItem>
                        <SelectItem value="expense">Apenas Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsNewCategoryOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateCategory} className="flex-1">
                    Criar
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
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => {
                    const usage = transactions.filter(t => t.category === category.name).length;
                    return (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <Badge variant={
                            category.type === 'both' ? 'default' : 
                            category.type === 'income' ? 'secondary' : 'outline'
                          }>
                            {category.type === 'both' ? 'Ambos' : 
                             category.type === 'income' ? 'Receita' : 'Despesa'}
                          </Badge>
                        </TableCell>
                        <TableCell>{usage} transações</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" disabled={usage > 0}>
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