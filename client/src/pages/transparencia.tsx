
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Footer from '@/components/shadcnblocks-com-footer2';
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
  Info,
  Loader2
} from 'lucide-react';

interface TransparencyProject {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  orcamentoTotal: number;
  receitas: number;
  despesas: number;
  saldo: number;
  mostrarOrcamento: boolean;
  mostrarTransacoes: boolean;
  nivelTransparencia: string;
  transacoes: TransparencyTransaction[];
}

interface TransparencyTransaction {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
}

export default function TransparenciaPage() {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [projects, setProjects] = useState<TransparencyProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Read query param for direct project filter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('projeto') || params.get('p');
    if (projectId) setSelectedProject(projectId);
  }, []);

  useEffect(() => {
    fetch('/api/public/transparencia')
      .then(r => r.ok ? r.json() : [])
      .then(data => setProjects(data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const selectedData = useMemo(() => {
    if (selectedProject === 'all') {
      const allTxs = projects.flatMap(p => p.transacoes);
      return {
        totalRevenue: projects.reduce((s, p) => s + p.receitas, 0),
        totalExpenses: projects.reduce((s, p) => s + p.despesas, 0),
        transactions: allTxs,
      };
    }
    const project = projects.find(p => p.id === selectedProject);
    if (!project) return { totalRevenue: 0, totalExpenses: 0, transactions: [] };
    return {
      totalRevenue: project.receitas,
      totalExpenses: project.despesas,
      transactions: project.transacoes,
    };
  }, [selectedProject, projects]);

  const expenseCategories = useMemo(() => {
    const expenses = selectedData.transactions.filter(t => t.tipo === 'despesa');
    const totalExpenses = expenses.reduce((s, t) => s + t.valor, 0);
    if (totalExpenses === 0) return [];
    const categoryTotals: Record<string, number> = {};
    for (const t of expenses) {
      categoryTotals[t.categoria || 'Outros'] = (categoryTotals[t.categoria || 'Outros'] || 0) + t.valor;
    }
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    return Object.entries(categoryTotals).map(([category, total], i) => ({
      category,
      total,
      percentage: (total / totalExpenses) * 100,
      color: colors[i % colors.length],
    }));
  }, [selectedData.transactions]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (dateString: string) => new Date(dateString + 'T12:00:00').toLocaleDateString('pt-BR');

  const selectedProjectInfo = projects.find(p => p.id === selectedProject);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

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

        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhum projeto com transparência ativa no momento.</p>
              <p className="text-gray-400 text-sm mt-2">Os dados aparecerão aqui quando projetos forem marcados como públicos pela administração.</p>
            </CardContent>
          </Card>
        ) : (
          <>
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
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {project.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedProjectInfo && selectedProject !== 'all' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900">{selectedProjectInfo.nome}</h3>
                        <p className="text-blue-700 mt-1">{selectedProjectInfo.descricao}</p>
                        <div className="flex items-center gap-4 mt-3">
                          {selectedProjectInfo.categoria && (
                            <Badge variant="outline" className="text-blue-700 border-blue-300">
                              {selectedProjectInfo.categoria}
                            </Badge>
                          )}
                          {selectedProjectInfo.mostrarOrcamento && selectedProjectInfo.orcamentoTotal > 0 && (
                            <span className="text-sm text-blue-600">
                              Orçamento Total: {formatCurrency(selectedProjectInfo.orcamentoTotal)}
                            </span>
                          )}
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
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedData.totalRevenue)}</div>
                  <p className="text-sm text-gray-600 mt-1">Receitas públicas divulgadas</p>
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
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(selectedData.totalExpenses)}</div>
                  <p className="text-sm text-gray-600 mt-1">Investimentos públicos divulgados</p>
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
                  <div className={`text-2xl font-bold ${(selectedData.totalRevenue - selectedData.totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(selectedData.totalRevenue - selectedData.totalExpenses)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Diferença entre receitas e investimentos</p>
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
                  {expenseCategories.length > 0 ? (
                    <div className="space-y-4">
                      {expenseCategories.map((category) => (
                        <div key={category.category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                              <span className="text-sm font-medium">{category.category}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">{formatCurrency(category.total)}</div>
                              <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                          <Progress value={category.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
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
                      {selectedData.transactions.slice(0, 10).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${transaction.tipo === 'receita' ? 'bg-green-100' : 'bg-blue-100'}`}>
                              {transaction.tipo === 'receita' ? (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{transaction.descricao}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{formatDate(transaction.data)}</span>
                                {transaction.categoria && (
                                  <Badge variant="outline" className="text-xs">{transaction.categoria}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={`text-right font-bold ${transaction.tipo === 'receita' ? 'text-green-600' : 'text-blue-600'}`}>
                            {transaction.tipo === 'receita' ? '+' : '-'}{formatCurrency(transaction.valor)}
                          </div>
                        </div>
                      ))}
                      {selectedData.transactions.length > 10 && (
                        <div className="text-center pt-4 border-t">
                          <p className="text-sm text-gray-500">+ {selectedData.transactions.length - 10} transações adicionais</p>
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
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
