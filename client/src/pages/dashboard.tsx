
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  FileText,
  Eye,
  Heart,
  MessageCircle,
  Star,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  published: boolean;
  featured: boolean;
  category_id: string;
  tags: string[];
  image?: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  author_name?: string;
  category_name?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface ArticleStats {
  views: number;
  reaction_counts: Record<string, number>;
}

interface Comment {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  article_title?: string;
  articles?: { title: string };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
        loadCategories(),
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
      const { data, error } = await supabase
        .from('articles_full')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Erro ao carregar artigos:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          articles!inner(title)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const commentsWithArticleTitle = (data || []).map(comment => ({
        ...comment,
        article_title: comment.articles?.title
      }));

      setComments(commentsWithArticleTitle);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  };

  const loadArticleStats = async () => {
    try {
      const { data, error } = await supabase
        .from('article_stats')
        .select('*');

      if (error) throw error;

      const statsMap: Record<string, ArticleStats> = {};
      (data || []).forEach(stat => {
        statsMap[stat.article_id] = {
          views: stat.views || 0,
          reaction_counts: stat.reaction_counts || {},
        };
      });

      setArticleStats(statsMap);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const totalArticles = articles.length;
  const publishedArticles = articles.filter(a => a.published).length;
  const draftArticles = articles.filter(a => !a.published).length;
  const featuredArticles = articles.filter(a => a.featured).length;

  const totalViews = Object.values(articleStats).reduce((sum, stats) => sum + (stats.views || 0), 0);
  const totalLikes = Object.values(articleStats).reduce((sum, stats) => sum + (stats.reaction_counts?.like || 0), 0);

  const pendingComments = comments.filter(c => !c.is_approved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-idasam-green-dark"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total de Artigos</CardTitle>
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
                {draftArticles} rascunhos
              </Badge>
            </div>
            <Progress
              value={(publishedArticles / totalArticles) * 100}
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Visualizações</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalViews.toLocaleString()}</div>
            <p className="text-sm text-gray-600 mt-2">
              Engajamento total
            </p>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+12% este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Reações</CardTitle>
            <div className="p-2 bg-red-50 rounded-lg">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalLikes.toLocaleString()}</div>
            <p className="text-sm text-gray-600 mt-2">
              Total de likes
            </p>
            <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
              <Activity className="w-4 h-4" />
              <span>Interação ativa</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Moderação</CardTitle>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <MessageCircle className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{pendingComments}</div>
            <p className="text-sm text-gray-600 mt-2">
              Comentários pendentes
            </p>
            {pendingComments > 0 && (
              <Badge variant="destructive" className="mt-2">
                Ação necessária
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Performance e Distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance de Conteúdo
            </CardTitle>
            <CardDescription>
              Métricas dos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Artigos Publicados</span>
                <span className="font-medium">{publishedArticles}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Artigos em Destaque</span>
                <span className="font-medium">{featuredArticles}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Comentários Aprovados</span>
                <span className="font-medium">{comments.filter(c => c.is_approved).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Categorias Ativas</span>
                <span className="font-medium">{categories.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Distribuição por Categoria
            </CardTitle>
            <CardDescription>
              Artigos por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.length > 0 ? categories.map((category) => {
                const articleCount = articles.filter(a => 
                  a.category_id === category.id || 
                  (a.category_name && a.category_name.toLowerCase() === category.name.toLowerCase())
                ).length;
                const percentage = totalArticles > 0 ? (articleCount / totalArticles) * 100 : 0;

                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-gray-600">{articleCount} {articleCount === 1 ? 'artigo' : 'artigos'}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              }) : (
                <div className="text-center py-4 text-gray-500">
                  <p>Nenhuma categoria cadastrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Artigos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Artigos Recentes</CardTitle>
          <CardDescription>
            Últimos artigos criados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {articles.slice(0, 5).map((article) => (
              <div key={article.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-medium">{article.title}</h3>
                    <p className="text-sm text-gray-600">
                      Por {article.author_name} • {formatDate(article.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={article.published ? 'default' : 'secondary'}>
                    {article.published ? 'Publicado' : 'Rascunho'}
                  </Badge>
                  {article.featured && (
                    <Badge variant="outline">
                      <Star className="w-3 h-3 mr-1" />
                      Destaque
                    </Badge>
                  )}
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>{articleStats[article.id]?.views || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
