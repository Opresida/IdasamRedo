
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  FileText, 
  Upload, 
  Eye, 
  Shield,
  Calendar,
  DollarSign,
  Receipt,
  AlertTriangle,
  Download,
  Building2,
  CreditCard
} from 'lucide-react';

interface BankAccount {
  id: string;
  name: string;
  agency: string;
  accountNumber: string;
  initialBalance: number;
  createdAt: string;
}

interface Transaction {
  id: string;
  type: 'entrada' | 'saida';
  description: string;
  value: number;
  category: string;
  date: string;
  attachment?: string;
  accountId: string;
  createdAt: string;
}

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    value: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    accountId: '',
    attachment: null as File | null
  });
  const [bankFormData, setBankFormData] = useState({
    name: '',
    agency: '',
    accountNumber: '',
    initialBalance: ''
  });

  // Dados simulados para demonstração
  useEffect(() => {
    const mockBankAccounts: BankAccount[] = [
      {
        id: '1',
        name: 'Banco do Brasil',
        agency: '1234-5',
        accountNumber: '12345-6',
        initialBalance: 10000,
        createdAt: '2024-01-01T00:00:00'
      },
      {
        id: '2',
        name: 'Caixa Econômica',
        agency: '0678',
        accountNumber: '98765-4',
        initialBalance: 5000,
        createdAt: '2024-01-01T00:00:00'
      }
    ];

    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'entrada',
        description: 'Doação mensal - Projeto Coração Ribeirinho',
        value: 5000,
        category: 'Receita de Projeto',
        date: '2024-01-15',
        attachment: 'comprovante_doacao.pdf',
        accountId: '1',
        createdAt: '2024-01-15T10:30:00'
      },
      {
        id: '2',
        type: 'saida',
        description: 'Compra de equipamentos de laboratório',
        value: 2500,
        category: 'Investimento',
        date: '2024-01-10',
        attachment: 'nota_fiscal_equipamentos.pdf',
        accountId: '1',
        createdAt: '2024-01-10T14:20:00'
      },
      {
        id: '3',
        type: 'saida',
        description: 'Aluguel do escritório',
        value: 1200,
        category: 'Custo Fixo',
        date: '2024-01-05',
        accountId: '2',
        createdAt: '2024-01-05T09:00:00'
      },
      {
        id: '4',
        type: 'entrada',
        description: 'Repasse de verba governamental',
        value: 15000,
        category: 'Receita Institucional',
        date: '2024-01-03',
        attachment: 'contrato_governo.pdf',
        accountId: '2',
        createdAt: '2024-01-03T16:45:00'
      }
    ];

    setBankAccounts(mockBankAccounts);
    setTransactions(mockTransactions);
  }, []);

  // Filtrar transações por conta
  const getFilteredTransactions = () => {
    if (selectedAccountId === 'all') {
      return transactions;
    }
    return transactions.filter(t => t.accountId === selectedAccountId);
  };

  // Calcular resumo financeiro
  const calculateSummary = (accountId?: string) => {
    const filteredTransactions = accountId && accountId !== 'all' 
      ? transactions.filter(t => t.accountId === accountId)
      : transactions;

    const entradas = filteredTransactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + t.value, 0);

    const saidas = filteredTransactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + t.value, 0);

    // Saldo inicial da conta específica
    let saldoInicial = 0;
    if (accountId && accountId !== 'all') {
      const account = bankAccounts.find(acc => acc.id === accountId);
      saldoInicial = account?.initialBalance || 0;
    } else {
      saldoInicial = bankAccounts.reduce((sum, acc) => sum + acc.initialBalance, 0);
    }

    return {
      saldoAtual: saldoInicial + entradas - saidas,
      entradasMes: entradas,
      saidasMes: saidas
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.description || !formData.value || !formData.category || !formData.accountId) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: formData.type as 'entrada' | 'saida',
      description: formData.description,
      value: parseFloat(formData.value),
      category: formData.category,
      date: formData.date,
      accountId: formData.accountId,
      attachment: formData.attachment?.name,
      createdAt: new Date().toISOString()
    };

    setTransactions([newTransaction, ...transactions]);

    // Resetar formulário
    setFormData({
      type: '',
      description: '',
      value: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      accountId: '',
      attachment: null
    });

    alert('Transação adicionada com sucesso!');
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankFormData.name || !bankFormData.agency || !bankFormData.accountNumber || !bankFormData.initialBalance) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newBankAccount: BankAccount = {
      id: Date.now().toString(),
      name: bankFormData.name,
      agency: bankFormData.agency,
      accountNumber: bankFormData.accountNumber,
      initialBalance: parseFloat(bankFormData.initialBalance),
      createdAt: new Date().toISOString()
    };

    setBankAccounts([...bankAccounts, newBankAccount]);

    // Resetar formulário
    setBankFormData({
      name: '',
      agency: '',
      accountNumber: '',
      initialBalance: ''
    });

    alert('Conta bancária adicionada com sucesso!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, attachment: file });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getBankName = (accountId: string) => {
    const account = bankAccounts.find(acc => acc.id === accountId);
    return account?.name || 'Conta não encontrada';
  };

  const summary = calculateSummary(selectedAccountId);

  return (
    <div className="space-y-6">
      {/* Aviso de Acesso */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <strong>Acesso restrito.</strong> Apenas usuários com permissão 'Financeiro' ou 'Admin' podem visualizar e editar estas informações.
          </div>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="accounts">Contas Bancárias</TabsTrigger>
          <TabsTrigger value="new-transaction">Nova Transação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Cards de Resumo - Visão Geral */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Saldo Total</CardTitle>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <PiggyBank className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.saldoAtual)}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Saldo consolidado de todas as contas
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Entradas do Mês</CardTitle>
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.entradasMes)}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Total de receitas
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Saídas do Mês</CardTitle>
                <div className="p-2 bg-red-50 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.saidasMes)}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Total de despesas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Lançamentos - Visão Geral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Histórico Consolidado de Transações
              </CardTitle>
              <CardDescription>
                Visualize todas as transações de todas as contas bancárias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Conta</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-center">Anexo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Nenhuma transação encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {formatDate(transaction.date)}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="font-medium">{transaction.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              <Building2 className="w-3 h-3 mr-1" />
                              {getBankName(transaction.accountId)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={transaction.type === 'entrada' ? 'default' : 'destructive'}
                              className={transaction.type === 'entrada' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                            >
                              {transaction.type === 'entrada' ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                              ) : (
                                <TrendingDown className="w-3 h-3 mr-1" />
                              )}
                              {transaction.type === 'entrada' ? 'Entrada' : 'Saída'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {transaction.category}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-bold ${
                            transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'entrada' ? '+' : '-'}{formatCurrency(transaction.value)}
                          </TableCell>
                          <TableCell className="text-center">
                            {transaction.attachment ? (
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Tabs defaultValue="add-account" className="space-y-6">
            <TabsList>
              <TabsTrigger value="add-account">+ Adicionar Conta</TabsTrigger>
              {bankAccounts.map((account) => (
                <TabsTrigger key={account.id} value={account.id}>
                  {account.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="add-account">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Adicionar Nova Conta Bancária
                  </CardTitle>
                  <CardDescription>
                    Cadastre uma nova conta bancária para gerenciar suas transações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBankSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Nome do Banco *</Label>
                        <Input
                          id="bankName"
                          placeholder="Ex: Banco do Brasil"
                          value={bankFormData.name}
                          onChange={(e) => setBankFormData({ ...bankFormData, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="agency">Agência *</Label>
                        <Input
                          id="agency"
                          placeholder="Ex: 1234-5"
                          value={bankFormData.agency}
                          onChange={(e) => setBankFormData({ ...bankFormData, agency: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Número da Conta *</Label>
                        <Input
                          id="accountNumber"
                          placeholder="Ex: 12345-6"
                          value={bankFormData.accountNumber}
                          onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="initialBalance">Saldo Inicial *</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="initialBalance"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={bankFormData.initialBalance}
                            onChange={(e) => setBankFormData({ ...bankFormData, initialBalance: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setBankFormData({
                          name: '',
                          agency: '',
                          accountNumber: '',
                          initialBalance: ''
                        })}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Conta
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {bankAccounts.map((account) => {
              const accountSummary = calculateSummary(account.id);
              const accountTransactions = transactions.filter(t => t.accountId === account.id);

              return (
                <TabsContent key={account.id} value={account.id}>
                  {/* Cards de Resumo da Conta Específica */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700">Saldo Atual</CardTitle>
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${accountSummary.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(accountSummary.saldoAtual)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {account.name} - Ag: {account.agency} - CC: {account.accountNumber}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700">Entradas</CardTitle>
                        <div className="p-2 bg-green-50 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(accountSummary.entradasMes)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Total de receitas desta conta
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700">Saídas</CardTitle>
                        <div className="p-2 bg-red-50 rounded-lg">
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(accountSummary.saidasMes)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Total de despesas desta conta
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabela de Transações da Conta Específica */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        Extrato - {account.name}
                      </CardTitle>
                      <CardDescription>
                        Histórico de transações desta conta bancária
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Descrição</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Categoria</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                              <TableHead className="text-center">Anexo</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {accountTransactions.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                  Nenhuma transação encontrada para esta conta
                                </TableCell>
                              </TableRow>
                            ) : (
                              accountTransactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                  <TableCell className="font-medium">
                                    {formatDate(transaction.date)}
                                  </TableCell>
                                  <TableCell>
                                    <div className="max-w-xs">
                                      <p className="font-medium">{transaction.description}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={transaction.type === 'entrada' ? 'default' : 'destructive'}
                                      className={transaction.type === 'entrada' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                                    >
                                      {transaction.type === 'entrada' ? (
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                      ) : (
                                        <TrendingDown className="w-3 h-3 mr-1" />
                                      )}
                                      {transaction.type === 'entrada' ? 'Entrada' : 'Saída'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-xs">
                                      {transaction.category}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className={`text-right font-bold ${
                                    transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {transaction.type === 'entrada' ? '+' : '-'}{formatCurrency(transaction.value)}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {transaction.attachment ? (
                                      <Button variant="outline" size="sm">
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    ) : (
                                      <span className="text-gray-400 text-sm">-</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </TabsContent>

        <TabsContent value="new-transaction">
          {/* Formulário de Lançamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Novo Lançamento
              </CardTitle>
              <CardDescription>
                Adicione uma nova transação financeira ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            Entrada
                          </div>
                        </SelectItem>
                        <SelectItem value="saida">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-600" />
                            Saída
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountId">Conta de Origem/Destino *</Label>
                    <Select value={formData.accountId} onValueChange={(value) => setFormData({ ...formData, accountId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-blue-600" />
                              {account.name} - {account.accountNumber}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.type === 'entrada' ? (
                        <>
                          <SelectItem value="Receita de Projeto">Receita de Projeto</SelectItem>
                          <SelectItem value="Receita Institucional">Receita Institucional</SelectItem>
                          <SelectItem value="Doações">Doações</SelectItem>
                          <SelectItem value="Parcerias">Parcerias</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Custo Fixo">Custo Fixo</SelectItem>
                          <SelectItem value="Custo Variável">Custo Variável</SelectItem>
                          <SelectItem value="Investimento">Investimento</SelectItem>
                          <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                          <SelectItem value="Pessoal">Pessoal</SelectItem>
                          <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva a transação..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Valor *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Data *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attachment">Anexar Documento</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Selecionar Arquivo
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {formData.attachment && (
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {formData.attachment.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Formatos aceitos: PDF, JPG, PNG, DOC, DOCX (máx. 10MB)
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({
                      type: '',
                      description: '',
                      value: '',
                      category: '',
                      date: new Date().toISOString().split('T')[0],
                      accountId: '',
                      attachment: null
                    })}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Transação
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
