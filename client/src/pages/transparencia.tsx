
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  PieChart, 
  BarChart3,
  Receipt,
  DollarSign,
  Calendar,
  Info
} from 'lucide-react';

interface PublicProject {
  id: string;
  name: string;
  description: string;
  category: string;
  totalBudget: number;
  usedBudget: number;
  publicRevenue: number;
  publicExpenses: number;
}

interface PublicTransaction {
  id: string;
  date: string;
  description: string;
  value: number;
  type: 'entrada' | 'saida';
  category: string;
}

interface ExpenseCategory {
  category: string;
  total: number;
  percentage: number;
  color: string;
}

export default function TransparenciaPage() {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [publicProjects, setPublicProjects] = useState<PublicProject[]>([]);
  const [publicTransactions, setPublicTransactions] = useState<PublicTransaction[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);

  // Dados simulados - representa apenas projetos e transações marcados como públicos pelo admin
  useEffect(() => {
    const mockPublicProjects: PublicProject[] = [
      {
        id: '1',
        name: 'Projeto Coração Ribeirinho',
        description: 'Programa de apoio às comunidades ribeirinhas da Amazônia, focado em educação, saúde e desenvolvimento sustentável.',
        category: 'Social',
        totalBudget: 150000,
        usedBudget: 45000,
        publicRevenue: 65000, // Apenas receitas marcadas como públicas
        publicExpenses: 32000  // Apenas despesas marcadas como públicas
      },
      {
        id: '3',
        name: 'Bioeconomia Amazônica',
        description: 'Iniciativas de desenvolvimento sustentável na região amazônica, promovendo a economia verde e a conservação.',
        category: 'Sustentabilidade',
        totalBudget: 300000,
        usedBudget: 120000,
        publicRevenue: 180000,
        publicExpenses: 95000
      }
    ];

    const mockPublicTransactions: PublicTransaction[] = [
      // Projeto Coração Ribeirinho - Transações Públicas
      {
        id: '1',
        date: '2024-01-15',
        description: 'Doação mensal da comunidade local para o projeto',
        value: 5000,
        type: 'entrada',
        category: 'Doações'
      },
      {
        id: '5',
        date: '2024-01-20',
        description: 'Parceria com empresa local - Materiais educacionais',
        value: 12000,
        type: 'entrada',
        category: 'Parcerias'
      },
      {
        id: '7',
        date: '2024-01-25',
        description: 'Compra de materiais didáticos para escolas ribeirinhas',
        value: 8500,
        type: 'saida',
        category: 'Educação'
      },
      // Bioeconomia Amazônica - Transações Públicas
      {
        id: '3',
        date: '2024-01-08',
        description: 'Financiamento governamental para pesquisa em bioeconomia',
        value: 35000,
        type: 'entrada',
        category: 'Financiamentos'
      },
      {
        id: '8',
        date: '2024-01-18',
        description: 'Aquisição de equipamentos para laboratório de sustentabilidade',
        value: 15000,
        type: 'saida',
        category: 'Equipamentos'
      },
      {
        id: '9',
        date: '2024-01-22',
        description: 'Capacitação de agricultores locais em técnicas sustentáveis',
        value: 7200,
        type: 'saida',
        category: 'Capacitação'
      }
    ];

    setPublicProjects(mockPublicProjects);
    setPublicTransactions(mockPublicTransactions);

    // Calcular categorias de despesas para gráfico
    calculateExpenseCategories(mockPublicTransactions);
  }, []);

  const calculateExpenseCategories = (transactions: PublicTransaction[]) => {
    const expenses = transactions.filter(t => t.type === 'saida');
    const totalExpenses = expenses.reduce((sum, t) => sum + t.value, 0);
    
    const categoryTotals = expenses.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.value;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    
    const categories = Object.entries(categoryTotals).map(([category, total], index) => ({
      category,
      total,
      percentage: (total / totalExpenses) * 100,
      color: colors[index % colors.length]
    }));

    setExpenseCategories(categories);
  };

  const getSelectedProjectData = () => {
    if (selectedProject === 'all') {
      return {
        totalRevenue: publicProjects.reduce((sum, p) => sum + p.publicRevenue, 0),
        totalExpenses: publicProjects.reduce((sum, p) => sum + p.publicExpenses, 0),
        transactions: publicTransactions
      };
    }
    
    const project = publicProjects.find(p => p.id === selectedProject);
    if (!project) return { totalRevenue: 0, totalExpenses: 0, transactions: [] };

    // Filtrar transações do projeto selecionado (simulação baseada no nome/categoria)
    const projectTransactions = publicTransactions.filter(t => {
      if (selectedProject === '1') return ['Doações', 'Parcerias', 'Educação'].includes(t.category);
      if (selectedProject === '3') return ['Financiamentos', 'Equipamentos', 'Capacitação'].includes(t.category);
      return false;
    });

    return {
      totalRevenue: project.publicRevenue,
      totalExpenses: project.publicExpenses,
      transactions: projectTransactions
    };
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

  const selectedData = getSelectedProjectData();
  const selectedProjectInfo = publicProjects.find(p => p.id === selectedProject);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-10 h-10 text-green-600" />
              <h1 className="text-4xl font-bold text-gray-900">Portal da Transparência</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              O IDASAM acredita na transparência como pilar fundamental da nossa gestão. 
              Aqui você pode acompanhar como utilizamos os recursos recebidos em nossos projetos,
              garantindo total clareza sobre nosso impacto social e ambiental.
            </p>
            <div className="flex items-center justify-center gap-2 mt-6 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-full w-fit mx-auto">
              <Eye className="w-4 h-4" />
              <span>Dados atualizados em tempo real</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Filtro Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Selecione um Projeto
            </CardTitle>
            <CardDescription>
              Escolha o projeto para visualizar suas informações financeiras públicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Projetos (Consolidado)</SelectItem>
                {publicProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Informações do Projeto Selecionado */}
            {selectedProjectInfo && selectedProject !== 'all' && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900">{selectedProjectInfo.name}</h3>
                    <p className="text-blue-700 mt-1">{selectedProjectInfo.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <Badge variant="outline" className="text-blue-700 border-blue-300">
                        {selectedProjectInfo.category}
                      </Badge>
                      <span className="text-sm text-blue-600">
                        Orçamento Total: {formatCurrency(selectedProjectInfo.totalBudget)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cards de Resumo */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Arrecadado (Público)</CardTitle>
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(selectedData.totalRevenue)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Receitas públicas divulgadas
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Investido (Público)</CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingDown className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(selectedData.totalExpenses)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Investimentos públicos divulgados
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Saldo Transparente</CardTitle>
              <div className="p-2 bg-purple-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (selectedData.totalRevenue - selectedData.totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(selectedData.totalRevenue - selectedData.totalExpenses)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Diferença entre receitas e investimentos
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Gráfico de Despesas por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Distribuição dos Investimentos
              </CardTitle>
              <CardDescription>
                Como os recursos públicos estão sendo aplicados por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenseCategories.map((category, index) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatCurrency(category.total)}</div>
                        <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    <Progress 
                      value={category.percentage} 
                      className="h-2"
                      style={{
                        '--progress-background': category.color
                      } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>

              {expenseCategories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum dado de investimento disponível para exibição</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de Transações Notáveis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Transações Notáveis
              </CardTitle>
              <CardDescription>
                Principais movimentações financeiras divulgadas publicamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedData.transactions.length > 0 ? (
                <div className="space-y-4">
                  {selectedData.transactions.slice(0, 8).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'entrada' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {transaction.type === 'entrada' ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{formatDate(transaction.date)}</span>
                            <Badge variant="outline" className="text-xs">
                              {transaction.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className={`text-right font-bold ${
                        transaction.type === 'entrada' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {transaction.type === 'entrada' ? '+' : '-'}{formatCurrency(transaction.value)}
                      </div>
                    </div>
                  ))}
                  
                  {selectedData.transactions.length > 8 && (
                    <div className="text-center pt-4 border-t">
                      <p className="text-sm text-gray-500">
                        + {selectedData.transactions.length - 8} transações adicionais
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma transação pública disponível para este projeto</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rodapé Informativo */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Compromisso com a Transparência</h3>
                <p className="text-green-800 text-sm leading-relaxed">
                  As informações apresentadas neste portal representam os dados financeiros que escolhemos 
                  compartilhar publicamente como parte do nosso compromisso com a transparência. 
                  Nosso objetivo é demonstrar como cada recurso recebido é aplicado de forma responsável 
                  para gerar o máximo impacto positivo nas comunidades amazônicas.
                </p>
                <p className="text-green-700 text-xs mt-3">
                  Última atualização: {new Date().toLocaleDateString('pt-BR')} • 
                  Para mais informações, entre em contato conosco através dos nossos canais oficiais.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
