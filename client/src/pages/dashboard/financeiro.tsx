
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

// Mock Data (substituir por dados reais em uma aplicação completa)
const mockTransactions = [
  { id: '1', date: '2024-07-20', description: 'Venda de software', category: 'Receitas', amount: 5000, project: 'Projeto A', isPublic: true, type: 'receita', status: 'public', donor_id: '1' },
  { id: '2', date: '2024-07-19', description: 'Compra de licença', category: 'Despesas', amount: 1200, project: 'Projeto B', isPublic: false, type: 'despesa', status: 'private', supplier_id: '1' },
  { id: '3', date: '2024-07-18', description: 'Consultoria', category: 'Receitas', amount: 1500, project: 'Projeto A', isPublic: true, type: 'receita', status: 'public' },
  { id: '4', date: '2024-07-17', description: 'Salário Desenvolvedor', category: 'Despesas', amount: 7000, project: 'Projeto A', isPublic: false, type: 'despesa', status: 'private', supplier_id: '2' },
  { id: '5', date: '2024-07-16', description: 'Manutenção Servidor', category: 'Despesas', amount: 300, project: null, isPublic: true, type: 'despesa', status: 'public', supplier_id: '1' },
  { id: '6', date: '2024-07-15', description: 'Reembolso Viagem', category: 'Receitas', amount: 450, project: 'Projeto B', isPublic: false, type: 'receita', status: 'private' },
  { id: '7', date: '2024-07-14', description: 'Pagamento Fornecedor', category: 'Despesas', amount: 800, project: 'Projeto C', isPublic: true, type: 'despesa', status: 'public', supplier_id: '3' },
  { id: '8', date: '2024-07-13', description: 'Comissão Venda', category: 'Receitas', amount: 2500, project: 'Projeto C', isPublic: false, type: 'receita', status: 'private', donor_id: '2' },
  { id: '9', date: '2024-07-12', description: 'Licença Software', category: 'Despesas', amount: 950, project: 'Projeto C', isPublic: true, type: 'despesa', status: 'public', supplier_id: '1' },
  { id: '10', date: '2024-07-11', description: 'Serviços Marketing', category: 'Despesas', amount: 600, project: null, isPublic: false, type: 'despesa', status: 'private', supplier_id: '2' },
];

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Tech Solutions Ltda',
    cnpj_cpf: '12.345.678/0001-99',
    contact_person: 'João Silva',
    email: 'contato@techsolutions.com',
    phone: '(11) 99999-9999',
    created_at: '2024-01-15'
  },
  {
    id: '2',
    name: 'Maria Santos Consultoria',
    cnpj_cpf: '123.456.789-00',
    contact_person: 'Maria Santos',
    email: 'maria@consultoria.com',
    phone: '(11) 88888-8888',
    created_at: '2024-02-20'
  },
  {
    id: '3',
    name: 'Equipamentos Norte S.A.',
    cnpj_cpf: '98.765.432/0001-11',
    contact_person: 'Carlos Oliveira',
    email: 'vendas@equipamentosnorte.com',
    phone: '(92) 77777-7777',
    created_at: '2024-03-10'
  }
];

const mockDonors: Donor[] = [
  {
    id: '1',
    name: 'Fundação Amazônia Verde',
    cnpj_cpf: '11.222.333/0001-44',
    contact_person: 'Ana Costa',
    email: 'ana@amazoniaverde.org',
    phone: '(11) 66666-6666',
    created_at: '2024-01-05'
  },
  {
    id: '2',
    name: 'Instituto Desenvolvimento Social',
    cnpj_cpf: '44.555.666/0001-77',
    contact_person: 'Roberto Lima',
    email: 'roberto@ids.org.br',
    phone: '(21) 55555-5555',
    created_at: '2024-02-14'
  }
];

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  project: string | null;
  isPublic: boolean;
  type: 'receita' | 'despesa';
  status: 'public' | 'private';
  supplier_id?: string | null;
  donor_id?: string | null;
}

interface Supplier {
  id: string;
  name: string;
  cnpj_cpf: string;
  contact_person: string;
  email: string;
  phone: string;
  created_at: string;
}

interface Donor {
  id: string;
  name: string;
  cnpj_cpf: string;
  contact_person: string;
  email: string;
  phone: string;
  created_at: string;
}

interface Filters {
  type: 'all' | 'receita' | 'despesa';
  status: 'all' | 'public' | 'private';
  project: string;
}

function DashboardFinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [donors, setDonors] = useState<Donor[]>(mockDonors);
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    status: 'all',
    project: 'all',
  });
  const [activeTab, setActiveTab] = useState('transactions');
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
  });
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, 'id' | 'created_at'>>({
    name: '',
    cnpj_cpf: '',
    contact_person: '',
    email: '',
    phone: '',
  });
  const [newDonor, setNewDonor] = useState<Omit<Donor, 'id' | 'created_at'>>({
    name: '',
    cnpj_cpf: '',
    contact_person: '',
    email: '',
    phone: '',
  });

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

  const toggleTransactionVisibility = (id: string, isPublic: boolean) => {
    setTransactions(prevTransactions =>
      prevTransactions.map(t => (t.id === id ? { ...t, isPublic } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.')) {
      setTransactions(prevTransactions =>
        prevTransactions.filter(t => t.id !== id)
      );
    }
  };

  const handleCreateTransaction = () => {
    const newId = (transactions.length + 1).toString();
    const newTransactionWithId: Transaction = {
      ...newTransaction,
      id: newId,
      status: newTransaction.isPublic ? 'public' : 'private',
      project: newTransaction.project === 'none' || !newTransaction.project ? null : newTransaction.project,
      supplier_id: newTransaction.supplier_id === '' ? null : newTransaction.supplier_id,
      donor_id: newTransaction.donor_id === '' ? null : newTransaction.donor_id,
    };
    setTransactions([...transactions, newTransactionWithId]);
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
    });
  };

  const handleCreateSupplier = () => {
    const newId = (suppliers.length + 1).toString();
    const newSupplierWithId: Supplier = {
      ...newSupplier,
      id: newId,
      created_at: new Date().toISOString(),
    };
    setSuppliers([...suppliers, newSupplierWithId]);
    setShowSupplierForm(false);
    setEditingSupplier(null);
    setNewSupplier({
      name: '',
      cnpj_cpf: '',
      contact_person: '',
      email: '',
      phone: '',
    });
  };

  const handleCreateDonor = () => {
    const newId = (donors.length + 1).toString();
    const newDonorWithId: Donor = {
      ...newDonor,
      id: newId,
      created_at: new Date().toISOString(),
    };
    setDonors([...donors, newDonorWithId]);
    setShowDonorForm(false);
    setEditingDonor(null);
    setNewDonor({
      name: '',
      cnpj_cpf: '',
      contact_person: '',
      email: '',
      phone: '',
    });
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({
      name: supplier.name,
      cnpj_cpf: supplier.cnpj_cpf,
      contact_person: supplier.contact_person,
      email: supplier.email,
      phone: supplier.phone,
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
    });
    setShowDonorForm(true);
  };

  const handleDeleteSupplier = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.')) {
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  const handleDeleteDonor = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este doador? Esta ação não pode ser desfeita.')) {
      setDonors(donors.filter(d => d.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão Financeira</h1>
            <p className="text-gray-600">Controle de receitas, despesas e transparência</p>
          </div>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Transações
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

        {/* Aba 2: Contatos */}
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
                      <div className="flex space-x-2 pt-4">
                        <Button onClick={handleCreateSupplier} className="flex-1">
                          {editingSupplier ? 'Atualizar' : 'Criar'} Fornecedor
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setShowSupplierForm(false);
                          setEditingSupplier(null);
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
                      <div className="flex space-x-2 pt-4">
                        <Button onClick={handleCreateDonor} className="flex-1">
                          {editingDonor ? 'Atualizar' : 'Criar'} Doador
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setShowDonorForm(false);
                          setEditingDonor(null);
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
                  Defina quais transações aparecerão no portal público
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    <strong>{transacoesPublicas.length}</strong> de <strong>{mockTransactions.length}</strong> transações são públicas
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {mockTransactions.map((transaction) => (
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
}

export default DashboardFinanceiroPage;
