
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  CreditCard,
  Users,
  Heart,
  Edit,
  Trash2
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

interface Supplier {
  id: string;
  name: string;
  document: string; // CNPJ ou CPF
  documentType: 'cpf' | 'cnpj';
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  category: string;
  notes?: string;
  createdAt: string;
}

interface Donor {
  id: string;
  name: string;
  document: string; // CNPJ ou CPF
  documentType: 'cpf' | 'cnpj';
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  donationType: 'mensal' | 'pontual' | 'anual';
  totalDonated: number;
  lastDonation?: string;
  notes?: string;
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
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [showDonorDialog, setShowDonorDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  
  const [supplierFormData, setSupplierFormData] = useState({
    name: '',
    document: '',
    documentType: 'cnpj' as 'cpf' | 'cnpj',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    category: '',
    notes: ''
  });
  
  const [donorFormData, setDonorFormData] = useState({
    name: '',
    document: '',
    documentType: 'cpf' as 'cpf' | 'cnpj',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    donationType: 'mensal' as 'mensal' | 'pontual' | 'anual',
    notes: ''
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

    // Dados mockados para fornecedores
    const mockSuppliers: Supplier[] = [
      {
        id: '1',
        name: 'Fornecedor de Equipamentos Ltda',
        document: '12.345.678/0001-90',
        documentType: 'cnpj',
        email: 'contato@equipamentos.com.br',
        phone: '(11) 9999-8888',
        address: 'Rua dos Fornecedores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        category: 'Equipamentos',
        notes: 'Fornecedor principal de equipamentos de laboratório',
        createdAt: '2024-01-01T00:00:00'
      },
      {
        id: '2',
        name: 'João Silva - Serviços',
        document: '123.456.789-01',
        documentType: 'cpf',
        email: 'joao@servicos.com',
        phone: '(11) 8888-7777',
        address: 'Av. Prestadores, 456',
        city: 'Ribeirão Preto',
        state: 'SP',
        zipCode: '14000-000',
        category: 'Serviços',
        createdAt: '2024-01-01T00:00:00'
      }
    ];

    // Dados mockados para doadores
    const mockDonors: Donor[] = [
      {
        id: '1',
        name: 'Maria Oliveira',
        document: '987.654.321-09',
        documentType: 'cpf',
        email: 'maria@email.com',
        phone: '(16) 7777-6666',
        address: 'Rua das Flores, 789',
        city: 'Ribeirão Preto',
        state: 'SP',
        zipCode: '14001-000',
        donationType: 'mensal',
        totalDonated: 1500.00,
        lastDonation: '2024-01-15',
        notes: 'Doadora fiel há 3 anos',
        createdAt: '2024-01-01T00:00:00'
      },
      {
        id: '2',
        name: 'Empresa ABC Ltda',
        document: '98.765.432/0001-10',
        documentType: 'cnpj',
        email: 'responsabilidade@abc.com.br',
        phone: '(16) 6666-5555',
        address: 'Av. Corporativa, 1000',
        city: 'Ribeirão Preto',
        state: 'SP',
        zipCode: '14002-000',
        donationType: 'anual',
        totalDonated: 25000.00,
        lastDonation: '2024-01-01',
        notes: 'Parceira estratégica em projetos sociais',
        createdAt: '2024-01-01T00:00:00'
      }
    ];

    setSuppliers(mockSuppliers);
    setDonors(mockDonors);
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

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierFormData.name || !supplierFormData.document || !supplierFormData.email || !supplierFormData.phone) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (editingSupplier) {
      // Atualizar fornecedor existente
      const updatedSupplier: Supplier = {
        ...editingSupplier,
        ...supplierFormData,
        totalDonated: editingSupplier.totalDonated || 0
      };
      setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? updatedSupplier : s));
    } else {
      // Criar novo fornecedor
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        ...supplierFormData,
        totalDonated: 0,
        createdAt: new Date().toISOString()
      };
      setSuppliers([...suppliers, newSupplier]);
    }

    // Resetar formulário
    setSupplierFormData({
      name: '',
      document: '',
      documentType: 'cnpj',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      category: '',
      notes: ''
    });
    setEditingSupplier(null);
    setShowSupplierDialog(false);
    alert(editingSupplier ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor adicionado com sucesso!');
  };

  const handleDonorSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!donorFormData.name || !donorFormData.document || !donorFormData.email || !donorFormData.phone) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (editingDonor) {
      // Atualizar doador existente
      const updatedDonor: Donor = {
        ...editingDonor,
        ...donorFormData
      };
      setDonors(donors.map(d => d.id === editingDonor.id ? updatedDonor : d));
    } else {
      // Criar novo doador
      const newDonor: Donor = {
        id: Date.now().toString(),
        ...donorFormData,
        totalDonated: 0,
        createdAt: new Date().toISOString()
      };
      setDonors([...donors, newDonor]);
    }

    // Resetar formulário
    setDonorFormData({
      name: '',
      document: '',
      documentType: 'cpf',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      donationType: 'mensal',
      notes: ''
    });
    setEditingDonor(null);
    setShowDonorDialog(false);
    alert(editingDonor ? 'Doador atualizado com sucesso!' : 'Doador adicionado com sucesso!');
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSupplierFormData({
      name: supplier.name,
      document: supplier.document,
      documentType: supplier.documentType,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.city,
      state: supplier.state,
      zipCode: supplier.zipCode,
      category: supplier.category,
      notes: supplier.notes || ''
    });
    setEditingSupplier(supplier);
    setShowSupplierDialog(true);
  };

  const handleEditDonor = (donor: Donor) => {
    setDonorFormData({
      name: donor.name,
      document: donor.document,
      documentType: donor.documentType,
      email: donor.email,
      phone: donor.phone,
      address: donor.address,
      city: donor.city,
      state: donor.state,
      zipCode: donor.zipCode,
      donationType: donor.donationType,
      notes: donor.notes || ''
    });
    setEditingDonor(donor);
    setShowDonorDialog(true);
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
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="donors">Doadores</TabsTrigger>
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
          <Card className="mt-8">
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
                  <Card className="mt-8">
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

        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Gerenciar Fornecedores
                  </CardTitle>
                  <CardDescription>
                    Cadastre e gerencie fornecedores da organização
                  </CardDescription>
                </div>
                <Dialog open={showSupplierDialog} onOpenChange={setShowSupplierDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingSupplier(null);
                      setSupplierFormData({
                        name: '',
                        document: '',
                        documentType: 'cnpj',
                        email: '',
                        phone: '',
                        address: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        category: '',
                        notes: ''
                      });
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Fornecedor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingSupplier ? 'Atualize as informações do fornecedor' : 'Cadastre um novo fornecedor'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSupplierSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="supplier-name">Nome/Razão Social *</Label>
                          <Input
                            id="supplier-name"
                            value={supplierFormData.name}
                            onChange={(e) => setSupplierFormData({...supplierFormData, name: e.target.value})}
                            placeholder="Nome do fornecedor"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supplier-document-type">Tipo de Documento *</Label>
                          <Select value={supplierFormData.documentType} onValueChange={(value: 'cpf' | 'cnpj') => setSupplierFormData({...supplierFormData, documentType: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cpf">CPF</SelectItem>
                              <SelectItem value="cnpj">CNPJ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="supplier-document">
                            {supplierFormData.documentType === 'cpf' ? 'CPF' : 'CNPJ'} *
                          </Label>
                          <Input
                            id="supplier-document"
                            value={supplierFormData.document}
                            onChange={(e) => setSupplierFormData({...supplierFormData, document: e.target.value})}
                            placeholder={supplierFormData.documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supplier-category">Categoria</Label>
                          <Select value={supplierFormData.category} onValueChange={(value) => setSupplierFormData({...supplierFormData, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                              <SelectItem value="Serviços">Serviços</SelectItem>
                              <SelectItem value="Materiais">Materiais</SelectItem>
                              <SelectItem value="Alimentação">Alimentação</SelectItem>
                              <SelectItem value="Transporte">Transporte</SelectItem>
                              <SelectItem value="Outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="supplier-email">Email *</Label>
                          <Input
                            id="supplier-email"
                            type="email"
                            value={supplierFormData.email}
                            onChange={(e) => setSupplierFormData({...supplierFormData, email: e.target.value})}
                            placeholder="email@fornecedor.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supplier-phone">Telefone *</Label>
                          <Input
                            id="supplier-phone"
                            value={supplierFormData.phone}
                            onChange={(e) => setSupplierFormData({...supplierFormData, phone: e.target.value})}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supplier-address">Endereço</Label>
                        <Input
                          id="supplier-address"
                          value={supplierFormData.address}
                          onChange={(e) => setSupplierFormData({...supplierFormData, address: e.target.value})}
                          placeholder="Rua, número, bairro"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="supplier-city">Cidade</Label>
                          <Input
                            id="supplier-city"
                            value={supplierFormData.city}
                            onChange={(e) => setSupplierFormData({...supplierFormData, city: e.target.value})}
                            placeholder="Cidade"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supplier-state">Estado</Label>
                          <Input
                            id="supplier-state"
                            value={supplierFormData.state}
                            onChange={(e) => setSupplierFormData({...supplierFormData, state: e.target.value})}
                            placeholder="SP"
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supplier-zip">CEP</Label>
                          <Input
                            id="supplier-zip"
                            value={supplierFormData.zipCode}
                            onChange={(e) => setSupplierFormData({...supplierFormData, zipCode: e.target.value})}
                            placeholder="00000-000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supplier-notes">Observações</Label>
                        <Textarea
                          id="supplier-notes"
                          value={supplierFormData.notes}
                          onChange={(e) => setSupplierFormData({...supplierFormData, notes: e.target.value})}
                          placeholder="Informações adicionais sobre o fornecedor..."
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowSupplierDialog(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          {editingSupplier ? 'Atualizar' : 'Cadastrar'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome/Razão Social</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Nenhum fornecedor cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{supplier.document}</span>
                              <Badge variant="outline" className="text-xs w-fit">
                                {supplier.documentType.toUpperCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <span>{supplier.email}</span>
                              <span className="text-gray-600">{supplier.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{supplier.category}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSupplier(supplier)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
                                    setSuppliers(suppliers.filter(s => s.id !== supplier.id));
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
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

        <TabsContent value="donors">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Gerenciar Doadores
                  </CardTitle>
                  <CardDescription>
                    Cadastre e gerencie doadores da organização
                  </CardDescription>
                </div>
                <Dialog open={showDonorDialog} onOpenChange={setShowDonorDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingDonor(null);
                      setDonorFormData({
                        name: '',
                        document: '',
                        documentType: 'cpf',
                        email: '',
                        phone: '',
                        address: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        donationType: 'mensal',
                        notes: ''
                      });
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Doador
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingDonor ? 'Editar Doador' : 'Novo Doador'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingDonor ? 'Atualize as informações do doador' : 'Cadastre um novo doador'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleDonorSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="donor-name">Nome/Razão Social *</Label>
                          <Input
                            id="donor-name"
                            value={donorFormData.name}
                            onChange={(e) => setDonorFormData({...donorFormData, name: e.target.value})}
                            placeholder="Nome do doador"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="donor-document-type">Tipo de Documento *</Label>
                          <Select value={donorFormData.documentType} onValueChange={(value: 'cpf' | 'cnpj') => setDonorFormData({...donorFormData, documentType: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cpf">CPF</SelectItem>
                              <SelectItem value="cnpj">CNPJ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="donor-document">
                            {donorFormData.documentType === 'cpf' ? 'CPF' : 'CNPJ'} *
                          </Label>
                          <Input
                            id="donor-document"
                            value={donorFormData.document}
                            onChange={(e) => setDonorFormData({...donorFormData, document: e.target.value})}
                            placeholder={donorFormData.documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="donor-donation-type">Tipo de Doação</Label>
                          <Select value={donorFormData.donationType} onValueChange={(value: 'mensal' | 'pontual' | 'anual') => setDonorFormData({...donorFormData, donationType: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mensal">Mensal</SelectItem>
                              <SelectItem value="pontual">Pontual</SelectItem>
                              <SelectItem value="anual">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="donor-email">Email *</Label>
                          <Input
                            id="donor-email"
                            type="email"
                            value={donorFormData.email}
                            onChange={(e) => setDonorFormData({...donorFormData, email: e.target.value})}
                            placeholder="email@doador.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="donor-phone">Telefone *</Label>
                          <Input
                            id="donor-phone"
                            value={donorFormData.phone}
                            onChange={(e) => setDonorFormData({...donorFormData, phone: e.target.value})}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="donor-address">Endereço</Label>
                        <Input
                          id="donor-address"
                          value={donorFormData.address}
                          onChange={(e) => setDonorFormData({...donorFormData, address: e.target.value})}
                          placeholder="Rua, número, bairro"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="donor-city">Cidade</Label>
                          <Input
                            id="donor-city"
                            value={donorFormData.city}
                            onChange={(e) => setDonorFormData({...donorFormData, city: e.target.value})}
                            placeholder="Cidade"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="donor-state">Estado</Label>
                          <Input
                            id="donor-state"
                            value={donorFormData.state}
                            onChange={(e) => setDonorFormData({...donorFormData, state: e.target.value})}
                            placeholder="SP"
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="donor-zip">CEP</Label>
                          <Input
                            id="donor-zip"
                            value={donorFormData.zipCode}
                            onChange={(e) => setDonorFormData({...donorFormData, zipCode: e.target.value})}
                            placeholder="00000-000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="donor-notes">Observações</Label>
                        <Textarea
                          id="donor-notes"
                          value={donorFormData.notes}
                          onChange={(e) => setDonorFormData({...donorFormData, notes: e.target.value})}
                          placeholder="Informações adicionais sobre o doador..."
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowDonorDialog(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          {editingDonor ? 'Atualizar' : 'Cadastrar'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome/Razão Social</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Total Doado</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Nenhum doador cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      donors.map((donor) => (
                        <TableRow key={donor.id}>
                          <TableCell className="font-medium">{donor.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{donor.document}</span>
                              <Badge variant="outline" className="text-xs w-fit">
                                {donor.documentType.toUpperCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <span>{donor.email}</span>
                              <span className="text-gray-600">{donor.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                donor.donationType === 'mensal' ? 'bg-green-50 text-green-700' :
                                donor.donationType === 'anual' ? 'bg-blue-50 text-blue-700' :
                                'bg-orange-50 text-orange-700'
                              }
                            >
                              {donor.donationType.charAt(0).toUpperCase() + donor.donationType.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-green-600">
                            {formatCurrency(donor.totalDonated)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditDonor(donor)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Tem certeza que deseja excluir este doador?')) {
                                    setDonors(donors.filter(d => d.id !== donor.id));
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
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
      </Tabs>
    </div>
  );
}
