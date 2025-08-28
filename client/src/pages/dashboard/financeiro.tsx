
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
  ExternalLink
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

// Mock Data (substituir por dados reais em uma aplicação completa)
const mockTransactions = [
  { id: '1', date: '2024-07-20', description: 'Venda de software', category: 'Receitas', amount: 5000, project: 'Projeto A', isPublic: true, type: 'receita', status: 'public' },
  { id: '2', date: '2024-07-19', description: 'Compra de licença', category: 'Despesas', amount: 1200, project: 'Projeto B', isPublic: false, type: 'despesa', status: 'private' },
  { id: '3', date: '2024-07-18', description: 'Consultoria', category: 'Receitas', amount: 1500, project: 'Projeto A', isPublic: true, type: 'receita', status: 'public' },
  { id: '4', date: '2024-07-17', description: 'Salário Desenvolvedor', category: 'Despesas', amount: 7000, project: 'Projeto A', isPublic: false, type: 'despesa', status: 'private' },
  { id: '5', date: '2024-07-16', description: 'Manutenção Servidor', category: 'Despesas', amount: 300, project: null, isPublic: true, type: 'despesa', status: 'public' },
  { id: '6', date: '2024-07-15', description: 'Reembolso Viagem', category: 'Receitas', amount: 450, project: 'Projeto B', isPublic: false, type: 'receita', status: 'private' },
  { id: '7', date: '2024-07-14', description: 'Pagamento Fornecedor', category: 'Despesas', amount: 800, project: 'Projeto C', isPublic: true, type: 'despesa', status: 'public' },
  { id: '8', date: '2024-07-13', description: 'Comissão Venda', category: 'Receitas', amount: 2500, project: 'Projeto C', isPublic: false, type: 'receita', status: 'private' },
  { id: '9', date: '2024-07-12', description: 'Licença Software', category: 'Despesas', amount: 950, project: 'Projeto C', isPublic: true, type: 'despesa', status: 'public' },
  { id: '10', date: '2024-07-11', description: 'Serviços Marketing', category: 'Despesas', amount: 600, project: null, isPublic: false, type: 'despesa', status: 'private' },
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
}

interface Filters {
  type: 'all' | 'receita' | 'despesa';
  status: 'all' | 'public' | 'private';
  project: string;
}

function DashboardFinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    status: 'all',
    project: 'all',
  });
  const [activeTab, setActiveTab] = useState('transactions');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, 'id' | 'status'>>({
    date: '',
    description: '',
    category: '',
    amount: 0,
    project: '',
    isPublic: false,
    type: 'receita',
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
    });
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Transações
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

        {/* Aba 2: Transparência */}
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
