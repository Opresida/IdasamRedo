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
  Button } from '@/components/ui/button';
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

// Definição de tipos locais
interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'receita' | 'despesa';
  project: string | null;
  status: 'public' | 'private';
  isPublic: boolean;
  supplier_id: string | null;
  donor_id: string | null;
  bank_account_id: string | null;
}

interface Supplier {
  id: string;
  name: string;
  cnpj_cpf: string;
  contact_person: string;
  email: string;
  phone: string;
  pix_key: string;
  created_at: string;
}

interface Donor {
  id: string;
  name: string;
  cnpj_cpf: string;
  contact_person: string;
  email: string;
  phone: string;
  pix_key: string;
  created_at: string;
}

interface BankAccount {
  id: string;
  name: string;
  agency: string;
  account_number: string;
  initial_balance: number;
  created_at: string;
}

interface Filters {
  type: 'all' | 'receita' | 'despesa';
  status: 'all' | 'public' | 'private';
  project: string;
}

const GestaoFinanceira: React.FC = () => {
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
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState<'list' | 'chart'>('list');
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

  // Carregar dados na inicialização
  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      // Mock data temporário até implementar banco de dados
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          date: '2024-01-15',
          description: 'Doação mensal - Janeiro',
          category: 'Doações',
          amount: 5000,
          type: 'receita',
          project: 'Coração Ribeirinho',
          status: 'public',
          isPublic: true,
          supplier_id: null,
          donor_id: '1',
          bank_account_id: '1'
        },
        {
          id: '2',
          date: '2024-01-20',
          description: 'Compra de materiais pedagógicos',
          category: 'Material Didático',
          amount: 1500,
          type: 'despesa',
          project: 'Educação Digital',
          status: 'public',
          isPublic: true,
          supplier_id: '1',
          donor_id: null,
          bank_account_id: '1'
        }
      ];

      const mockBankAccounts: BankAccount[] = [
        {
          id: '1',
          name: 'Conta Corrente Principal',
          agency: '1234',
          account_number: '567890',
          initial_balance: 10000,
          created_at: '2024-01-01'
        }
      ];

      const mockSuppliers: Supplier[] = [
        {
          id: '1',
          name: 'Fornecedor Exemplo',
          cnpj_cpf: '12.345.678/0001-90',
          contact_person: 'João Silva',
          email: 'contato@fornecedor.com',
          phone: '(92) 99999-9999',
          pix_key: 'fornecedor@email.com',
          created_at: '2024-01-01'
        }
      ];

      const mockDonors: Donor[] = [
        {
          id: '1',
          name: 'Doador Exemplo',
          cnpj_cpf: '123.456.789-00',
          contact_person: 'Maria Santos',
          email: 'maria@email.com',
          phone: '(92) 98888-8888',
          pix_key: 'maria@email.com',
          created_at: '2024-01-01'
        }
      ];

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTransactions(mockTransactions);
      setBankAccounts(mockBankAccounts);
      setSuppliers(mockSuppliers);
      setDonors(mockDonors);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Falha ao carregar dados financeiros. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
            <Button onClick={fetchFinancialData} variant="outline">
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
              Banco de dados local: ✅
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GestaoFinanceira;