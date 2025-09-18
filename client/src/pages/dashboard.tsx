
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  LayoutDashboard,
  FileText,
  MessageCircle,
  Calendar,
  PiggyBank,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Heart,
  Star
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { dashboardQueries } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Interfaces
interface Article {
  id: string;
  title: string;
  published: boolean;
  featured: boolean;
  created_at: string;
  author_name?: string;
}

interface ArticleStats {
  views: number;
  reaction_counts: Record<string, number>;
}

interface Comment {
  id: string;
  is_approved: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [articles, setArticles] = useState<Article[]>([]);
  const [articleStats, setArticleStats] = useState<Record<string, ArticleStats>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadArticles(),
        loadComments(),
        loadArticleStats()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    try {
      const articles = await dashboardQueries.getArticlesFull();
      setArticles(articles || []);
    } catch (error) {
      console.error('Erro ao carregar artigos:', error);
    }
  };

  const loadComments = async () => {
    try {
      const comments = await dashboardQueries.getComments();
      setComments(comments || []);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  };

  const loadArticleStats = async () => {
    try {
      const stats = await dashboardQueries.getArticleStats();

      const statsMap: Record<string, ArticleStats> = {};
      (stats || []).forEach(stat => {
        statsMap[stat.article_id] = {
          views: stat.views || 0,
          reaction_counts: { like: stat.likes || 0 },
        };
      });

      setArticleStats(statsMap);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const totalArticles = articles.length;
  const publishedArticles = articles.filter(a => a.published).length;
  const featuredArticles = articles.filter(a => a.featured).length;
  const pendingComments = comments.filter(c => !c.is_approved).length;
  const totalViews = Object.values(articleStats).reduce((sum, stats) => sum + (stats.views || 0), 0);
  const totalLikes = Object.values(articleStats).reduce((sum, stats) => sum + (stats.reaction_counts?.like || 0), 0);

  // Dados fictícios para demonstração
  const nextMeeting = {
    title: "Reunião de Planejamento 2024",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias à frente
    time: "14:00"
  };

  const monthlyBalance = {
    income: 15000,
    expenses: 8500,
    balance: 6500
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-idasam-green-dark"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do Dashboard */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Geral</h1>
            <p className="text-gray-600">Visão geral das atividades do IDASAM</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </div>
          <Button onClick={loadInitialData} disabled={loading} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Artigos */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Imprensa</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalArticles}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-600">
                {publishedArticles} publicados
              </p>
              <Badge variant="secondary" className="text-xs">
                {featuredArticles} em destaque
              </Badge>
            </div>
            <Progress
              value={(publishedArticles / Math.max(totalArticles, 1)) * 100}
              className="mt-3 h-2"
            />
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{totalViews.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{totalLikes}</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-3"
              onClick={() => setLocation('/imprensa')}
            >
              Gerenciar
            </Button>
          </CardContent>
        </Card>

        {/* Comentários Pendentes */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Moderação</CardTitle>
            <div className="p-2 bg-orange-50 rounded-lg">
              <MessageCircle className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{pendingComments}</div>
            <p className="text-sm text-gray-600 mt-2">
              Comentários pendentes
            </p>
            {pendingComments > 0 ? (
              <Badge variant="destructive" className="mt-2">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Ação necessária
              </Badge>
            ) : (
              <Badge variant="outline" className="mt-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                Tudo em dia
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-3"
              onClick={() => setLocation('/imprensa')}
            >
              Ver Comentários
            </Button>
          </CardContent>
        </Card>

        {/* Próxima Reunião (Agenda) */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Agenda</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900 mb-1">
              {nextMeeting.title}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {formatDate(nextMeeting.date.toISOString())} às {nextMeeting.time}
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <Clock className="w-4 h-4" />
              <span>Em {Math.ceil((nextMeeting.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-3"
              onClick={() => setLocation('/agenda')}
            >
              Ver Agenda
            </Button>
          </CardContent>
        </Card>

        {/* Saldo do Mês (Financeiro) */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Financeiro</CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg">
              <PiggyBank className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R$ {monthlyBalance.balance.toLocaleString('pt-BR')}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Saldo do mês
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-green-600">Receitas:</span>
                <span>R$ {monthlyBalance.income.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Despesas:</span>
                <span>R$ {monthlyBalance.expenses.toLocaleString('pt-BR')}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-purple-600 mt-2">
              <TrendingUp className="w-4 h-4" />
              <span>+12% vs mês anterior</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-3"
              onClick={() => setLocation('/financeiro')}
            >
              Ver Detalhes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Artigos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Artigos Recentes
            </CardTitle>
            <CardDescription>
              Últimos artigos publicados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {articles.slice(0, 5).map((article) => (
                <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{article.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>Por {article.author_name}</span>
                      <span>•</span>
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={article.published ? 'default' : 'secondary'} className="text-xs">
                      {article.published ? 'Publicado' : 'Rascunho'}
                    </Badge>
                    {article.featured && (
                      <Badge variant="outline" className="text-xs">
                        <Star className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {articles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>Nenhum artigo encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumo Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Resumo Geral
            </CardTitle>
            <CardDescription>
              Estatísticas gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Total de Conteúdo</p>
                    <p className="text-xs text-gray-600">{totalArticles} artigos criados</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{totalArticles}</p>
                  <p className="text-xs text-gray-500">itens</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Eye className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Engajamento Total</p>
                    <p className="text-xs text-gray-600">Views e interações</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{totalViews.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">views</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <MessageCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Interações</p>
                    <p className="text-xs text-gray-600">Comentários recebidos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{comments.length}</p>
                  <p className="text-xs text-gray-500">comentários</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Heart className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Likes Recebidos</p>
                    <p className="text-xs text-gray-600">Reações positivas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{totalLikes}</p>
                  <p className="text-xs text-gray-500">likes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
