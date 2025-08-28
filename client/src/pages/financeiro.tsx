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
  Download
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'entrada' | 'saida';
  description: string;
  value: number;
  category: string;
  date: string;
  attachment?: string;
  createdAt: string;
}

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    value: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    attachment: null as File | null
  });

  // Dados simulados para demonstração
  useEffect(() => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'entrada',
        description: 'Doação mensal - Projeto Coração Ribeirinho',
        value: 5000,
        category: 'Receita de Projeto',
        date: '2024-01-15',
        attachment: 'comprovante_doacao.pdf',
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
        createdAt: '2024-01-10T14:20:00'
      },
      {
        id: '3',
        type: 'saida',
        description: 'Aluguel do escritório',
        value: 1200,
        category: 'Custo Fixo',
        date: '2024-01-05',
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
        createdAt: '2024-01-03T16:45:00'
      }
    ];
    setTransactions(mockTransactions);
  }, []);

  // Calcular resumo financeiro
  const calculateSummary = () => {
    const entradas = transactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + t.value, 0);

    const saidas = transactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + t.value, 0);

    return {
      saldoAtual: entradas - saidas,
      entradasMes: entradas,
      saidasMes: saidas
    };
  };

  const summary = calculateSummary();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.description || !formData.value || !formData.category) {
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
      attachment: null
    });

    alert('Transação adicionada com sucesso!');
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

      {/* Cards de Resumo */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Saldo Atual</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <PiggyBank className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.saldoAtual)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Diferença entre entradas e saídas
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

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Lançamentos</TabsTrigger>
          <TabsTrigger value="new-transaction">Nova Transação</TabsTrigger>
        </TabsList>

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

        <TabsContent value="transactions">
          {/* Tabela de Lançamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Histórico de Transações
              </CardTitle>
              <CardDescription>
                Visualize e gerencie todas as transações financeiras
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
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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

              {transactions.length > 0 && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Mostrando {transactions.length} transação(ões)
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Excel
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Relatório PDF
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}