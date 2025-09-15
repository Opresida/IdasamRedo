import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Filter,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Eye,
  EyeOff,
  List,
  BarChart3,
  Plus,
  Download,
  Edit,
  Trash2,
  X,
  Calendar,
  Settings,
  ExternalLink,
  Users,
  Building,
  Heart
} from 'lucide-react';

import {
  financialTransactionsService,
  bankAccountsService,
  suppliersService,
  donorsService,
  type FinancialTransaction,
  type BankAccount,
  type Supplier,
  type Donor
} from '@/lib/supabaseFinancial';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Adaptação para compatibilidade com o componente existente
interface Transaction extends Omit<FinancialTransaction, 'project_id'> {
  project: string | null;
  status: 'public' | 'private';
  isPublic: boolean;
}

export default function GestaoFinanceira() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState<'list' | 'chart'>('list');
}

interface Filters {
  type: 'all' | 'receita' | 'despesa';
  status: 'all' | 'public' | 'private';
  project: string;
}

const DashboardFinanceiroPage: React.FC = () => {
  // Estado para controle de loading
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    status: 'all',
    project: 'all',
  });
  const [activeTab, setActiveTab] = useState('transactions');
  const [activeBankTab, setActiveBankTab] = useState('add-account');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showDonorForm, setShowDonorForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, 'id' | 'status'>>({
    date: '',
    description: '',
    category: '',
    amount: 0,
    project: '',
    isPublic: false,
    type: 'receita',
    supplier_id: null,
    donor_id: null,
    bank_account_id: null,
  });
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, 'id' | 'created_at'>>({
    name: '',
    cnpj_cpf: '',
    contact_person: '',
    email: '',
    phone: '',
    pix_key: '',
  });
  const [newDonor, setNewDonor] = useState<Omit<Donor, 'id' | 'created_at'>>({
    name: '',
    cnpj_cpf: '',
    contact_person: '',
    email: '',
    phone: '',
    pix_key: '',
  });
  const [newBankAccount, setNewBankAccount] = useState<Omit<BankAccount, 'id' | 'created_at'>>({
    name: '',
    agency: '',
    account_number: '',
    initial_balance: 0,
  });

  // Função para carregar dados do Supabase
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [transactionsData, suppliersData, donorsData, bankAccountsData] = await Promise.all([
        financialTransactionsService.getAll(),
        suppliersService.getAll(),
        donorsService.getAll(),
        bankAccountsService.getAll()
      ]);

      // Converter transações para o formato do componente
      const convertedTransactions: Transaction[] = transactionsData.map(t => ({
        ...t,
        project: t.project_id,
        status: t.is_public ? 'public' : 'private',
        isPublic: t.is_public
      }));

      setTransactions(convertedTransactions);
      setSuppliers(suppliersData);
      setDonors(donorsData);
      setBankAccounts(bankAccountsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadData();
  }, []);

  const totalReceitas = useMemo(() =>
    transactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalDespesas = useMemo(() =>
    transactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const saldoAtual = totalReceitas - totalDespesas;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-medium mb-2">Erro ao carregar dados</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão Financeira</h1>
          <p className="text-gray-600">Controle completo das finanças da organização</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
            size="sm"
          >
            <List className="w-4 h-4 mr-2" />
            Lista
          </Button>
          <Button
            variant={view === 'chart' ? 'default' : 'outline'}
            onClick={() => setView('chart')}
            size="sm"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Gráficos
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as transações</SelectItem>
                <SelectItem value="receita">Apenas receitas</SelectItem>
                <SelectItem value="despesa">Apenas despesas</SelectItem>
                <SelectItem value="public">Transações públicas</SelectItem>
                <SelectItem value="private">Transações privadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      {view === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>
              {transactions.length} transação(ões) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions
                  .filter(transaction => {
                    if (filter === 'all') return true;
                    if (filter === 'receita' || filter === 'despesa') return transaction.type === filter;
                    if (filter === 'public') return transaction.isPublic;
                    if (filter === 'private') return !transaction.isPublic;
                    return true;
                  })
                  .map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'receita' ? 'default' : 'destructive'}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}>
                        R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.isPublic ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm">
                            {transaction.isPublic ? 'Público' : 'Privado'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Informações de Debug */}
      {transactions.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhuma transação encontrada</p>
            <p className="text-sm text-gray-400 mt-2">
              Conectado ao Supabase: {suppliers.length + donors.length + bankAccounts.length > 0 ? '✅' : '❌'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GestaoFinanceira;

const DashboardFinanceiroPage: React.FC = () => {
  // Estado para controle de loading
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    status: 'all',
    project: 'all',
  });
  const [activeTab, setActiveTab] = useState('transactions');
  const [activeBankTab, setActiveBankTab] = useState('add-account');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showDonorForm, setShowDonorForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, 'id' | 'status'>>({
    date: '',
    description: '',
    category: '',
    amount: 0,
    project: '',
    isPublic: false,
    type: 'receita',
    supplier_id: null,
    donor_id: null,
    bank_account_id: null,
  });
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, 'id' | 'created_at'>>({
    name: '',
    cnpj_cpf: '',
    contact_person: '',
    email: '',
    phone: '',
    pix_key: '',
  });
  const [newDonor, setNewDonor] = useState<Omit<Donor, 'id' | 'created_at'>>({
    name: '',
    cnpj_cpf: '',
    contact_person: '',
    email: '',
    phone: '',
    pix_key: '',
  });
  const [newBankAccount, setNewBankAccount] = useState<Omit<BankAccount, 'id' | 'created_at'>>({
    name: '',
    agency: '',
    account_number: '',
    initial_balance: 0,
  });

  // Função para carregar dados do Supabase
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [transactionsData, suppliersData, donorsData, bankAccountsData] = await Promise.all([
        financialTransactionsService.getAll(),
        suppliersService.getAll(),
        donorsService.getAll(),
        bankAccountsService.getAll()
      ]);

      // Converter transações para o formato do componente
      const convertedTransactions: Transaction[] = transactionsData.map(t => ({
        ...t,
        project: t.project_id,
        status: t.is_public ? 'public' : 'private',
        isPublic: t.is_public
      }));

      setTransactions(convertedTransactions);
      setSuppliers(suppliersData);
      setDonors(donorsData);
      setBankAccounts(bankAccountsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadData();
  }, []);

  const totalReceitas = useMemo(() =>
    transactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalDespesas = useMemo(() =>
    transactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const saldoAtual = totalReceitas - totalDespesas;

  const transacoesPublicas = useMemo(() =>
    transactions.filter(t => t.isPublic),
    [transactions]
  );

  const receitasPublicas = useMemo(() =>
    transacoesPublicas
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0),
    [transacoesPublicas]
  );

  const despesasPublicas = useMemo(() =>
    transacoesPublicas
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0),
    [transacoesPublicas]
  );

  const getAccountTransactions = (accountId: string) => {
    return transactions.filter(t => t.bank_account_id === accountId);
  };

  const getAccountSummary = (accountId: string) => {
    const accountTransactions = getAccountTransactions(accountId);
    const receitas = accountTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);
    const despesas = accountTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);
    const account = bankAccounts.find(a => a.id === accountId);
    const saldo = (account?.initial_balance || 0) + receitas - despesas;

    return { receitas, despesas, saldo };
  };

  const categorySummary = useMemo(() => {
    const summary: { [key: string]: number } = {};
    transactions.filter(t => t.type === 'despesa').forEach(t => {
      summary[t.category] = (summary[t.category] || 0) + t.amount;
    });
    return Object.entries(summary).map(([category, amount]) => ({ category, amount }));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesType = filters.type === 'all' || transaction.type === filters.type;
      const matchesStatus = filters.status === 'all' || (filters.status === 'public' && transaction.isPublic) || (filters.status === 'private' && !transaction.isPublic);
      const matchesProject = filters.project === 'all' || transaction.project === filters.project || (filters.project === 'unassigned' && transaction.project === null);
      return matchesType && matchesStatus && matchesProject;
    });
  }, [transactions, filters]);

  const toggleTransactionVisibility = async (id: string, isPublic: boolean) => {
    try {
      await financialTransactionsService.updateVisibility(id, isPublic);
      setTransactions(prevTransactions =>
        prevTransactions.map(t => (t.id === id ? { ...t, isPublic, status: isPublic ? 'public' : 'private' } : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar visibilidade');
      console.error('Erro ao atualizar visibilidade:', err);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.')) {
      try {
        await financialTransactionsService.delete(id);
        setTransactions(prevTransactions =>
          prevTransactions.filter(t => t.id !== id)
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao excluir transação');
        console.error('Erro ao excluir transação:', err);
      }
    }
  };

  const handleCreateTransaction = async () => {
    try {
      const transactionData: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'> = {
        date: newTransaction.date,
        description: newTransaction.description,
        amount: newTransaction.amount,
        type: newTransaction.type,
        category: newTransaction.category,
        project_id: newTransaction.project === 'none' || !newTransaction.project ? null : newTransaction.project,
        is_public: newTransaction.isPublic,
        status: 'approved',
        supplier_id: newTransaction.supplier_id === '' ? null : newTransaction.supplier_id,
        donor_id: newTransaction.donor_id === '' ? null : newTransaction.donor_id,
        bank_account_id: newTransaction.bank_account_id === '' ? null : newTransaction.bank_account_id,
      };

      const createdTransaction = await financialTransactionsService.create(transactionData);

      // Converter para o formato do componente
      const convertedTransaction: Transaction = {
        ...createdTransaction,
        project: createdTransaction.project_id,
        status: createdTransaction.is_public ? 'public' : 'private',
        isPublic: createdTransaction.is_public
      };

      setTransactions([convertedTransaction, ...transactions]);
      setShowTransactionForm(false);
      setNewTransaction({
        date: '',
        description: '',
        category: '',
        amount: 0,
        project: '',
        isPublic: false,
        type: 'receita',
        supplier_id: null,
        donor_id: null,
        bank_account_id: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar transação');
      console.error('Erro ao criar transação:', err);
    }
  };

  const handleCreateSupplier = async () => {
    try {
      if (editingSupplier) {
        // Atualizar fornecedor existente
        const updatedSupplier = await suppliersService.update(editingSupplier.id, newSupplier);
        setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? updatedSupplier : s));
      } else {
        // Criar novo fornecedor
        const createdSupplier = await suppliersService.create(newSupplier);
        setSuppliers([createdSupplier, ...suppliers]);
      }

      setShowSupplierForm(false);
      setEditingSupplier(null);
      setNewSupplier({
        name: '',
        cnpj_cpf: '',
        contact_person: '',
        email: '',
        phone: '',
        pix_key: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar fornecedor');
      console.error('Erro ao salvar fornecedor:', err);
    }
  };

  const handleCreateDonor = async () => {
    try {
      if (editingDonor) {
        // Atualizar doador existente
        const updatedDonor = await donorsService.update(editingDonor.id, newDonor);
        setDonors(donors.map(d => d.id === editingDonor.id ? updatedDonor : d));
      } else {
        // Criar novo doador
        const createdDonor = await donorsService.create(newDonor);
        setDonors([createdDonor, ...donors]);
      }

      setShowDonorForm(false);
      setEditingDonor(null);
      setNewDonor({
        name: '',
        cnpj_cpf: '',
        contact_person: '',
        email: '',
        phone: '',
        pix_key: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar doador');
      console.error('Erro ao salvar doador:', err);
    }
  };

  const handleCreateBankAccount = async () => {
    try {
      const createdAccount = await bankAccountsService.create(newBankAccount);
      setBankAccounts([createdAccount, ...bankAccounts]);
      setNewBankAccount({
        name: '',
        agency: '',
        account_number: '',
        initial_balance: 0,
      });
      // Mudar para a aba da nova conta criada
      setActiveBankTab(createdAccount.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta bancária');
      console.error('Erro ao criar conta bancária:', err);
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({
      name: supplier.name,
      cnpj_cpf: supplier.cnpj_cpf,
      contact_person: supplier.contact_person,
      email: supplier.email,
      phone: supplier.phone,
      pix_key: supplier.pix_key,
    });
    setShowSupplierForm(true);
  };

  const handleEditDonor = (donor: Donor) => {
    setEditingDonor(donor);
    setNewDonor({
      name: donor.name,
      cnpj_cpf: donor.cnpj_cpf,
      contact_person: donor.contact_person,
      email: donor.email,
      phone: donor.phone,
      pix_key: donor.pix_key,
    });
    setShowDonorForm(true);
  };

  const handleDeleteSupplier = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.')) {
      try {
        await suppliersService.delete(id);
        setSuppliers(suppliers.filter(s => s.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao excluir fornecedor');
        console.error('Erro ao excluir fornecedor:', err);
      }
    }
  };

  const handleDeleteDonor = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este doador? Esta ação não pode ser desfeita.')) {
      try {
        await donorsService.delete(id);
        setDonors(donors.filter(d => d.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao excluir doador');
        console.error('Erro ao excluir doador:', err);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-600 hover:text-red-500 mt-2"
              >
                Dispensar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestão Financeira</h1>
              <p className="text-gray-600">Controle de receitas, despesas e transparência</p>
            </div>
          </div>
          <Button
            onClick={loadData}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros de Visualização */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
        </div>

        <Select value={filters.type} onValueChange={(value: Filters['type']) => setFilters({...filters, type: value})}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo de transação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as transações</SelectItem>
            <SelectItem value="receita">Apenas receitas</SelectItem>
            <SelectItem value="despesa">Apenas despesas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value: Filters['status']) => setFilters({...filters, status: value})}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="public">Públicas</SelectItem>
            <SelectItem value="private">Privadas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.project} onValueChange={(value: string) => setFilters({...filters, project: value})}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Projeto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os projetos</SelectItem>
            <SelectItem value="projeto-1">Sistema de Monitoramento</SelectItem>
            <SelectItem value="projeto-2">Capacitação Digital</SelectItem>
            <SelectItem value="projeto-3">Infraestrutura Comunitária</SelectItem>
            <SelectItem value="unassigned">Sem projeto vinculado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totalReceitas.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-gray-600 mt-1">+8.2% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {totalDespesas.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-gray-600 mt-1">-2.1% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Saldo Atual</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {saldoAtual.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-gray-600 mt-1">Disponível</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Transparência</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{transacoesPublicas.length}</div>
            <p className="text-xs text-gray-600 mt-1">Transações públicas</p>
          </CardContent>
        </Card>
      </div>

      {/* Abas Principais */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Transações
          </TabsTrigger>
          <TabsTrigger value="bank-accounts" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Contas Bancárias
          </TabsTrigger>
          <TabsTrigger value="contatos" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Contatos
          </TabsTrigger>
          <TabsTrigger value="transparency" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Transparência
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Aba 1: Gestão de Transações */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Todas as Transações</h3>
            <Button onClick={() => setShowTransactionForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Transação
            </Button>
          </div>

          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Mostrando {filteredTransactions.length} transações</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projeto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                          <div className="text-sm text-gray-500">{transaction.category}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={transaction.type === 'receita' ? 'default' : 'destructive'}>
                          {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <span className={transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}>
                          R$ {transaction.amount.toLocaleString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {transaction.project || 'Não vinculado'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1">
                          {transaction.isPublic ? (
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                              <Eye className="w-3 h-3 mr-1" />
                              Público
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Privado
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteTransaction(transaction.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Aba 2: Contas Bancárias */}
        <TabsContent value="bank-accounts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gestão de Contas Bancárias</h3>
              <p className="text-sm text-gray-600">Gerencie suas contas bancárias e visualize os extratos individuais</p>
            </div>
          </div>

          <Tabs value={activeBankTab} onValueChange={setActiveBankTab} className="space-y-4">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="add-account" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                + Adicionar Conta
              </TabsTrigger>
              {bankAccounts.map((account) => (
                <TabsTrigger key={account.id} value={account.id} className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {account.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Sub-aba Adicionar Conta */}
            <TabsContent value="add-account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cadastrar Nova Conta Bancária</CardTitle>
                  <CardDescription>
                    Adicione uma nova conta para gerenciar suas transações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nome do Banco</Label>
                    <Input
                      value={newBankAccount.name}
                      onChange={(e) => setNewBankAccount({...newBankAccount, name: e.target.value})}
                      placeholder="Ex: Banco do Brasil"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Agência</Label>
                      <Input
                        value={newBankAccount.agency}
                        onChange={(e) => setNewBankAccount({...newBankAccount, agency: e.target.value})}
                        placeholder="Ex: 1234-5"
                      />
                    </div>
                    <div>
                      <Label>Número da Conta</Label>
                      <Input
                        value={newBankAccount.account_number}
                        onChange={(e) => setNewBankAccount({...newBankAccount, account_number: e.target.value})}
                        placeholder="Ex: 12345-6"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Saldo Inicial (R$)</Label>
                    <Input
                      type="number"
                      value={newBankAccount.initial_balance}
                      onChange={(e) => setNewBankAccount({...newBankAccount, initial_balance: Number(e.target.value)})}
                      placeholder="0,00"
                    />
                  </div>
                  <Button onClick={handleCreateBankAccount} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Conta
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sub-abas das Contas Bancárias */}
            {bankAccounts.map((account) => (
              <TabsContent key={account.id} value={account.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{account.name}</h4>
                    <p className="text-sm text-gray-600">
                      Agência: {account.agency} • Conta: {account.account_number}
                    </p>
                  </div>
                </div>

                {/* Cards de Resumo da Conta */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-700">Receitas</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        R$ {getAccountSummary(account.id).receitas.toLocaleString('pt-BR')}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-700">Despesas</CardTitle>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        R$ {getAccountSummary(account.id).despesas.toLocaleString('pt-BR')}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-700">Saldo Atual</CardTitle>
                      <PiggyBank className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${getAccountSummary(account.id).saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        R$ {getAccountSummary(account.id).saldo.toLocaleString('pt-BR')}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Inicial: R$ {account.initial_balance.toLocaleString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabela de Transações da Conta */}
                <div className="bg-white rounded-lg border">
                  <div className="p-4 border-b">
                    <h5 className="font-medium text-gray-900">Histórico de Transações</h5>
                    <p className="text-sm text-gray-600">
                      Mostrando {getAccountTransactions(account.id).length} transações desta conta
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {getAccountTransactions(account.id).map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(transaction.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                                <div className="text-sm text-gray-500">{transaction.category}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={transaction.type === 'receita' ? 'default' : 'destructive'}>
                                {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              <span className={transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}>
                                R$ {transaction.amount.toLocaleString('pt-BR')}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {transaction.isPublic ? (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Público
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Privado
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {getAccountTransactions(account.id).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <PiggyBank className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Nenhuma transação encontrada para esta conta</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* Aba 3: Contatos */}
        <TabsContent value="contatos" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gerenciamento de Contatos</h3>
              <p className="text-sm text-gray-600">Gerencie fornecedores e doadores da organização</p>
            </div>
          </div>

          <Tabs defaultValue="suppliers" className="space-y-4">
            <TabsList>
              <TabsTrigger value="suppliers" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Fornecedores
              </TabsTrigger>
              <TabsTrigger value="donors" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Doadores
              </TabsTrigger>
            </TabsList>

            {/* Sub-aba Fornecedores */}
            <TabsContent value="suppliers" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900">Fornecedores Cadastrados</h4>
                <Dialog open={showSupplierForm} onOpenChange={setShowSupplierForm}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingSupplier(null);
                      setNewSupplier({
                        name: '',
                        cnpj_cpf: '',
                        contact_person: '',
                        email: '',
                        phone: '',
                        pix_key: '',
                      });
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Fornecedor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Nome/Razão Social</Label>
                        <Input
                          value={newSupplier.name}
                          onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                          placeholder="Nome do fornecedor"
                        />
                      </div>
                      <div>
                        <Label>CNPJ/CPF</Label>
                        <Input
                          value={newSupplier.cnpj_cpf}
                          onChange={(e) => setNewSupplier({...newSupplier, cnpj_cpf: e.target.value})}
                          placeholder="00.000.000/0000-00 ou 000.000.000-00"
                        />
                      </div>
                      <div>
                        <Label>Pessoa de Contato</Label>
                        <Input
                          value={newSupplier.contact_person}
                          onChange={(e) => setNewSupplier({...newSupplier, contact_person: e.target.value})}
                          placeholder="Nome do responsável"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newSupplier.email}
                          onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input
                          value={newSupplier.phone}
                          onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div>
                        <Label>Chave PIX</Label>
                        <Input
                          value={newSupplier.pix_key}
                          onChange={(e) => setNewSupplier({...newSupplier, pix_key: e.target.value})}
                          placeholder="Email, CPF/CNPJ, telefone ou chave aleatória"
                        />
                      </div>
                      <div className="flex space-x-2 pt-4">
                        <Button onClick={handleCreateSupplier} className="flex-1">
                          {editingSupplier ? 'Atualizar' : 'Criar'} Fornecedor
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setShowSupplierForm(false);
                          setEditingSupplier(null);
                          setNewSupplier({
                            name: '',
                            cnpj_cpf: '',
                            contact_person: '',
                            email: '',
                            phone: '',
                            pix_key: '',
                          });
                        }}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="bg-white rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CNPJ/CPF</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Chave PIX</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{supplier.cnpj_cpf}</TableCell>
                        <TableCell>{supplier.contact_person}</TableCell>
                        <TableCell>{supplier.email}</TableCell>
                        <TableCell>{supplier.phone}</TableCell>
                        <TableCell className="text-sm text-gray-600">{supplier.pix_key || 'Não cadastrada'}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSupplier(supplier)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteSupplier(supplier.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Sub-aba Doadores */}
            <TabsContent value="donors" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900">Doadores Cadastrados</h4>
                <Dialog open={showDonorForm} onOpenChange={setShowDonorForm}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingDonor(null);
                      setNewDonor({
                        name: '',
                        cnpj_cpf: '',
                        contact_person: '',
                        email: '',
                        phone: '',
                        pix_key: '',
                      });
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Doador
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingDonor ? 'Editar Doador' : 'Novo Doador'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Nome/Razão Social</Label>
                        <Input
                          value={newDonor.name}
                          onChange={(e) => setNewDonor({...newDonor, name: e.target.value})}
                          placeholder="Nome do doador"
                        />
                      </div>
                      <div>
                        <Label>CNPJ/CPF</Label>
                        <Input
                          value={newDonor.cnpj_cpf}
                          onChange={(e) => setNewDonor({...newDonor, cnpj_cpf: e.target.value})}
                          placeholder="00.000.000/0000-00 ou 000.000.000-00"
                        />
                      </div>
                      <div>
                        <Label>Pessoa de Contato</Label>
                        <Input
                          value={newDonor.contact_person}
                          onChange={(e) => setNewDonor({...newDonor, contact_person: e.target.value})}
                          placeholder="Nome do responsável"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newDonor.email}
                          onChange={(e) => setNewDonor({...newDonor, email: e.target.value})}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input
                          value={newDonor.phone}
                          onChange={(e) => setNewDonor({...newDonor, phone: e.target.value})}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div>
                        <Label>Chave PIX</Label>
                        <Input
                          value={newDonor.pix_key}
                          onChange={(e) => setNewDonor({...newDonor, pix_key: e.target.value})}
                          placeholder="Email, CPF/CNPJ, telefone ou chave aleatória"
                        />
                      </div>
                      <div className="flex space-x-2 pt-4">
                        <Button onClick={handleCreateDonor} className="flex-1">
                          {editingDonor ? 'Atualizar' : 'Criar'} Doador
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setShowDonorForm(false);
                          setEditingDonor(null);
                          setNewDonor({
                            name: '',
                            cnpj_cpf: '',
                            contact_person: '',
                            email: '',
                            phone: '',
                            pix_key: '',
                          });
                        }}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="bg-white rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CNPJ/CPF</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Chave PIX</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donors.map((donor) => (
                      <TableRow key={donor.id}>
                        <TableCell className="font-medium">{donor.name}</TableCell>
                        <TableCell>{donor.cnpj_cpf}</TableCell>
                        <TableCell>{donor.contact_person}</TableCell>
                        <TableCell>{donor.email}</TableCell>
                        <TableCell>{donor.phone}</TableCell>
                        <TableCell className="text-sm text-gray-600">{donor.pix_key || 'Não cadastrada'}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditDonor(donor)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteDonor(donor.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Aba 3: Transparência */}
        <TabsContent value="transparency" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Portal de Transparência Financeira</h3>
              <p className="text-sm text-gray-600">Gerencie quais informações são públicas no portal</p>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Ver Portal Público
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Transações para Transparência */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurar Visibilidade
                </CardTitle>
                <CardDescription>
                  Defina quais transações aparecerão no portal de transparência
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    <strong>{transacoesPublicas.length}</strong> de <strong>{transactions.length}</strong> transações são públicas
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{transaction.description}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')} • R$ {transaction.amount.toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <Switch
                          checked={transaction.isPublic}
                          onCheckedChange={(checked) => toggleTransactionVisibility(transaction.id, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview do Portal Público */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview Portal Público
                </CardTitle>
                <CardDescription>
                  Como os dados aparecerão no portal de transparência
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded text-center">
                      <div className="text-lg font-bold text-green-600">R$ {receitasPublicas.toLocaleString('pt-BR')}</div>
                      <div className="text-xs text-gray-600">Receitas Públicas</div>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <div className="text-lg font-bold text-red-600">R$ {despesasPublicas.toLocaleString('pt-BR')}</div>
                      <div className="text-xs text-gray-600">Despesas Públicas</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Transações Recentes Públicas:</div>
                    {transacoesPublicas.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="bg-white p-2 rounded text-xs">
                        <div className="flex justify-between">
                          <span>{transaction.description}</span>
                          <span className={transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}>
                            R$ {transaction.amount.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba 3: Relatórios */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Relatórios Financeiros</h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Período
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total de Receitas:</span>
                    <span className="font-medium text-green-600">R$ {totalReceitas.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de Despesas:</span>
                    <span className="font-medium text-red-600">R$ {totalDespesas.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Saldo:</span>
                      <span className={saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}>
                        R$ {saldoAtual.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categorySummary.map((cat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{cat.category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(cat.amount / totalDespesas) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">R$ {cat.amount.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Nova Transação */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nova Transação</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowTransactionForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Tipo</Label>
                <Select value={newTransaction.type} onValueChange={(value: 'receita' | 'despesa') => setNewTransaction({...newTransaction, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Descrição</Label>
                <Input
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="Descrição da transação"
                />
              </div>

              <div>
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                  placeholder="0,00"
                />
              </div>

              <div>
                <Label>Categoria</Label>
                <Select value={newTransaction.category} onValueChange={(value: string) => setNewTransaction({...newTransaction, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pessoal">Pessoal</SelectItem>
                    <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                    <SelectItem value="Serviços">Serviços</SelectItem>
                    <SelectItem value="Materiais">Materiais</SelectItem>
                    <SelectItem value="Doações">Doações</SelectItem>
                    <SelectItem value="Convênios">Convênios</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Projeto (Opcional)</Label>
                <Select value={newTransaction.project || ''} onValueChange={(value: string) => setNewTransaction({...newTransaction, project: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não vincular</SelectItem>
                    <SelectItem value="projeto-1">Sistema de Monitoramento</SelectItem>
                    <SelectItem value="projeto-2">Capacitação Digital</SelectItem>
                    <SelectItem value="projeto-3">Infraestrutura Comunitária</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campo condicional para Fornecedor (apenas para despesas) */}
              {newTransaction.type === 'despesa' && (
                <div>
                  <Label>Fornecedor (Opcional)</Label>
                  <Select value={newTransaction.supplier_id || ''} onValueChange={(value: string) => setNewTransaction({...newTransaction, supplier_id: value === 'none' ? null : value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não vincular</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Campo condicional para Doador (apenas para receitas) */}
              {newTransaction.type === 'receita' && (
                <div>
                  <Label>Doador (Opcional)</Label>
                  <Select value={newTransaction.donor_id || ''} onValueChange={(value: string) => setNewTransaction({...newTransaction, donor_id: value === 'none' ? null : value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um doador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não vincular</SelectItem>
                      {donors.map((donor) => (
                        <SelectItem key={donor.id} value={donor.id}>
                          {donor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Conta Bancária *</Label>
                <Select value={newTransaction.bank_account_id || ''} onValueChange={(value: string) => setNewTransaction({...newTransaction, bank_account_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta bancária" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - {account.agency} / {account.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newTransaction.isPublic}
                  onCheckedChange={(checked) => setNewTransaction({...newTransaction, isPublic: checked})}
                />
                <Label>Tornar público no portal de transparência</Label>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={handleCreateTransaction} className="flex-1">
                  Criar Transação
                </Button>
                <Button variant="outline" onClick={() => setShowTransactionForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFinanceiroPage;