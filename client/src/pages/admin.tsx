
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff, 
  Upload, 
  Calendar, 
  Tag, 
  User, 
  BarChart3,
  FileText,
  Settings,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  MessageCircle,
  Heart,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/supabaseClient';
import { newsCache } from '@/lib/newsCache';
import { useAnalyticsAndSEO } from '@/hooks/use-analytics';
import { useAuth } from '@/contexts/auth-context';
import OptimizedImage from '@/components/optimized-image';

// Tipos para o admin
interface ArticleFormData {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image: string;
  tags: string[];
  featured: boolean;
  published: boolean;
}

interface ArticleStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

const categories = ['Bioeconomia', 'Tecnologia', 'Capacitação', 'Pesquisa', 'Eventos'];

const defaultFormData: ArticleFormData = {
  title: '',
  excerpt: '',
  content: '',
  author: 'Equipe IDASAM',
  category: 'Bioeconomia',
  image: '',
  tags: [],
  featured: false,
  published: false
};

export default function Dashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [articles, setArticles] = useState<ArticleFormData[]>([]);
  const [articleStats, setArticleStats] = useState<Record<string, ArticleStats>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');

  // Estados para o editor
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleFormData>(defaultFormData);
  const [newTag, setNewTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Estados para preview
  const [previewArticle, setPreviewArticle] = useState<ArticleFormData | null>(null);

  const { trackPageView, updateSEO } = useAnalyticsAndSEO();
  const { user, logout } = useAuth();

  // Inicializar SEO
  useEffect(() => {
    updateSEO({
      title: 'Dashboard Administrativo | IDASAM',
      description: 'Painel de gerenciamento de notícias e conteúdo do IDASAM',
      keywords: ['dashboard', 'admin', 'IDASAM', 'gerenciamento'],
      url: `${window.location.origin}/dashboard`,
      type: 'website'
    });

    trackPageView('/dashboard', 'Admin Dashboard');
  }, [updateSEO, trackPageView]);

  // Carregar artigos
  const loadArticles = async () => {
    setIsLoading(true);
    try {
      // Tentar carregar do Supabase primeiro
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erro ao carregar artigos do Supabase:', error);
        // Usar dados fallback se necessário
        const fallbackArticles = [
          {
            id: '1',
            title: 'IDASAM Lança Novo Projeto de Bioeconomia na Amazônia',
            excerpt: 'Iniciativa inovadora busca conciliar desenvolvimento econômico com preservação ambiental.',
            content: 'Conteúdo completo do artigo...',
            author: 'Equipe IDASAM',
            category: 'Bioeconomia',
            image: 'https://i.imgur.com/vVksMXp.jpeg',
            tags: ['sustentabilidade', 'bioeconomia', 'comunidades'],
            featured: true,
            published: true,
            publishDate: '2024-12-15'
          }
        ];
        setArticles(fallbackArticles);
      } else {
        setArticles(data || []);
      }

      // Carregar estatísticas simuladas
      const stats: Record<string, ArticleStats> = {};
      (data || []).forEach((article) => {
        stats[article.id] = {
          views: Math.floor(Math.random() * 1000) + 100,
          likes: Math.floor(Math.random() * 50) + 10,
          comments: Math.floor(Math.random() * 20) + 2,
          shares: Math.floor(Math.random() * 30) + 5
        };
      });
      setArticleStats(stats);

    } catch (error) {
      console.error('Erro ao carregar artigos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar artigo
  const saveArticle = async () => {
    if (!editingArticle.title.trim() || !editingArticle.content.trim()) {
      alert('Título e conteúdo são obrigatórios!');
      return;
    }

    setIsLoading(true);
    try {
      const articleData = {
        ...editingArticle,
        updated_at: new Date().toISOString(),
        publishDate: editingArticle.published ? new Date().toISOString() : null
      };

      if (editingArticle.id) {
        // Atualizar artigo existente
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingArticle.id);

        if (error) throw error;
      } else {
        // Criar novo artigo
        const { data, error } = await supabase
          .from('articles')
          .insert([{
            ...articleData,
            id: `article_${Date.now()}`,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        setEditingArticle({ ...editingArticle, id: data.id });
      }

      // Invalidar cache
      newsCache.invalidateArticles();
      
      // Recarregar artigos
      await loadArticles();
      
      alert('Artigo salvo com sucesso!');
      setIsEditorOpen(false);
      
    } catch (error) {
      console.error('Erro ao salvar artigo:', error);
      alert('Erro ao salvar artigo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Deletar artigo
  const deleteArticle = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Invalidar cache
      newsCache.invalidateArticles();
      
      // Recarregar artigos
      await loadArticles();
      
      alert('Artigo deletado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao deletar artigo:', error);
      alert('Erro ao deletar artigo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Alternar status de publicação
  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ 
          published: !currentStatus,
          publishDate: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      await loadArticles();
      newsCache.invalidateArticles();
      
    } catch (error) {
      console.error('Erro ao alterar status de publicação:', error);
    }
  };

  // Adicionar tag
  const addTag = () => {
    if (newTag.trim() && !editingArticle.tags.includes(newTag.trim())) {
      setEditingArticle({
        ...editingArticle,
        tags: [...editingArticle.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  // Remover tag
  const removeTag = (tagToRemove: string) => {
    setEditingArticle({
      ...editingArticle,
      tags: editingArticle.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Simular upload de imagem
  const handleImageUpload = async () => {
    setIsUploading(true);
    
    // Simulação de upload - em um caso real, você usaria um serviço real
    setTimeout(() => {
      const imageUrls = [
        'https://i.imgur.com/vVksMXp.jpeg',
        'https://i.imgur.com/R9rQRGL.jpeg',
        'https://i.imgur.com/5o2gRIQ.jpeg',
        'https://i.imgur.com/i74pvbH.jpeg'
      ];
      
      const randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];
      setEditingArticle({ ...editingArticle, image: randomImage });
      setIsUploading(false);
    }, 2000);
  };

  // Filtrar artigos
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'Todas' || article.category === filterCategory;
    
    const matchesStatus = filterStatus === 'Todos' || 
                         (filterStatus === 'Publicado' && article.published) ||
                         (filterStatus === 'Rascunho' && !article.published);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadArticles();
  }, []);

  // Estatísticas do dashboard
  const totalArticles = articles.length;
  const publishedArticles = articles.filter(a => a.published).length;
  const draftArticles = articles.filter(a => !a.published).length;
  const featuredArticles = articles.filter(a => a.featured).length;

  const totalViews = Object.values(articleStats).reduce((sum, stats) => sum + stats.views, 0);
  const totalLikes = Object.values(articleStats).reduce((sum, stats) => sum + stats.likes, 0);
  const totalComments = Object.values(articleStats).reduce((sum, stats) => sum + stats.comments, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-idasam-text-main">
                Dashboard IDASAM
              </h1>
              <Badge variant="secondary" className="bg-idasam-green-dark/10 text-idasam-green-dark">
                {user?.role === 'admin' ? 'Administrador' : 'Editor'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Olá, {user?.name}
              </span>
              
              <Button
                onClick={() => {
                  setEditingArticle(defaultFormData);
                  setIsEditorOpen(true);
                }}
                className="bg-idasam-green-dark hover:bg-idasam-green-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Notícia
              </Button>

              <Button
                variant="outline"
                onClick={logout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notícias
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Notícias</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalArticles}</div>
                  <p className="text-xs text-muted-foreground">
                    {publishedArticles} publicadas, {draftArticles} rascunhos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% em relação ao mês passado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Curtidas</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalLikes}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% em relação ao mês passado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Comentários</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalComments}</div>
                  <p className="text-xs text-muted-foreground">
                    +15% em relação ao mês passado
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Artigos Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Notícias Recentes</CardTitle>
                <CardDescription>
                  Últimas notícias publicadas e seus desempenhos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {articles.slice(0, 5).map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {article.image && (
                          <OptimizedImage
                            src={article.image}
                            alt={article.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h4 className="font-medium">{article.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant={article.published ? 'default' : 'secondary'}>
                              {article.published ? 'Publicado' : 'Rascunho'}
                            </Badge>
                            <span>{article.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {articleStats[article.id]?.views || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {articleStats[article.id]?.likes || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {articleStats[article.id]?.comments || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <CardTitle>Gerenciar Notícias</CardTitle>
                    <CardDescription>
                      Visualize, edite e publique suas notícias
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar notícias..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todas">Todas</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todos">Todos</SelectItem>
                        <SelectItem value="Publicado">Publicado</SelectItem>
                        <SelectItem value="Rascunho">Rascunho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {isLoading ? (
                    // Loading skeletons
                    [...Array(6)].map((_, i) => (
                      <div key={i} className="border rounded-lg p-4 space-y-4">
                        <div className="aspect-video bg-gray-200 rounded animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                        </div>
                      </div>
                    ))
                  ) : filteredArticles.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhuma notícia encontrada
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Não há notícias que correspondam aos filtros selecionados.
                      </p>
                      <Button
                        onClick={() => {
                          setEditingArticle(defaultFormData);
                          setIsEditorOpen(true);
                        }}
                        className="bg-idasam-green-dark hover:bg-idasam-green-medium"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar primeira notícia
                      </Button>
                    </div>
                  ) : (
                    filteredArticles.map((article) => (
                      <Card key={article.id} className="overflow-hidden">
                        {article.image && (
                          <div className="aspect-video overflow-hidden">
                            <OptimizedImage
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={article.published ? 'default' : 'secondary'}
                                  className={article.published ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {article.published ? (
                                    <><CheckCircle className="w-3 h-3 mr-1" /> Publicado</>
                                  ) : (
                                    <><Clock className="w-3 h-3 mr-1" /> Rascunho</>
                                  )}
                                </Badge>
                                {article.featured && (
                                  <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                                    Destaque
                                  </Badge>
                                )}
                              </div>
                              <CardTitle className="text-sm line-clamp-2">
                                {article.title}
                              </CardTitle>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setPreviewArticle(article)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingArticle(article);
                                    setIsEditorOpen(true);
                                  }}
                                >
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => togglePublishStatus(article.id!, article.published)}
                                >
                                  {article.published ? (
                                    <>
                                      <EyeOff className="w-4 h-4 mr-2" />
                                      Despublicar
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-4 h-4 mr-2" />
                                      Publicar
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <div className="flex items-center w-full">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Deletar
                                      </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja deletar esta notícia? Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteArticle(article.id!)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Deletar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{article.category}</span>
                            <span>{article.author}</span>
                          </div>
                          {articleStats[article.id] && (
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {articleStats[article.id].views}
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {articleStats[article.id].likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {articleStats[article.id].comments}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configure as preferências do painel administrativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Categorias Disponíveis</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Configurações de Cache</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-cache">Cache Automático</Label>
                      <p className="text-sm text-gray-500">
                        Invalidar cache automaticamente ao salvar artigos
                      </p>
                    </div>
                    <Switch id="auto-cache" defaultChecked />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Notificações</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications">Notificações por Email</Label>
                        <p className="text-sm text-gray-500">
                          Receber notificações de novos comentários
                        </p>
                      </div>
                      <Switch id="email-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="publish-notifications">Alertas de Publicação</Label>
                        <p className="text-sm text-gray-500">
                          Confirmar antes de publicar artigos
                        </p>
                      </div>
                      <Switch id="publish-notifications" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArticle.id ? 'Editar Notícia' : 'Nova Notícia'}
            </DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para {editingArticle.id ? 'atualizar' : 'criar'} a notícia.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={editingArticle.title}
                onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                placeholder="Digite o título da notícia..."
              />
            </div>

            {/* Resumo */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumo *</Label>
              <Textarea
                id="excerpt"
                value={editingArticle.excerpt}
                onChange={(e) => setEditingArticle({...editingArticle, excerpt: e.target.value})}
                placeholder="Digite um resumo atrativo da notícia..."
                rows={3}
              />
            </div>

            {/* Conteúdo */}
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo *</Label>
              <Textarea
                id="content"
                value={editingArticle.content}
                onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})}
                placeholder="Digite o conteúdo completo da notícia..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {/* Dados do artigo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  value={editingArticle.author}
                  onChange={(e) => setEditingArticle({...editingArticle, author: e.target.value})}
                  placeholder="Nome do autor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={editingArticle.category} 
                  onValueChange={(value) => setEditingArticle({...editingArticle, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Imagem */}
            <div className="space-y-2">
              <Label>Imagem Principal</Label>
              <div className="flex gap-4">
                <Input
                  value={editingArticle.image}
                  onChange={(e) => setEditingArticle({...editingArticle, image: e.target.value})}
                  placeholder="URL da imagem ou clique em upload"
                  className="flex-1"
                />
                <Button
                  onClick={handleImageUpload}
                  disabled={isUploading}
                  variant="outline"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Carregando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
              {editingArticle.image && (
                <div className="mt-2">
                  <OptimizedImage
                    src={editingArticle.image}
                    alt="Preview"
                    className="w-32 h-20 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nova tag..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button onClick={addTag} variant="outline" size="sm">
                  <Tag className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editingArticle.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Opções */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={editingArticle.featured}
                  onCheckedChange={(checked) => setEditingArticle({...editingArticle, featured: checked})}
                />
                <Label htmlFor="featured">Artigo em destaque</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={editingArticle.published}
                  onCheckedChange={(checked) => setEditingArticle({...editingArticle, published: checked})}
                />
                <Label htmlFor="published">Publicar imediatamente</Label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditorOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => setPreviewArticle(editingArticle)}
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={saveArticle}
              disabled={isLoading}
              className="bg-idasam-green-dark hover:bg-idasam-green-medium"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      {previewArticle && (
        <Dialog open={!!previewArticle} onOpenChange={() => setPreviewArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview da Notícia</DialogTitle>
              <DialogDescription>
                Visualização de como a notícia aparecerá no site
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {previewArticle.image && (
                <OptimizedImage
                  src={previewArticle.image}
                  alt={previewArticle.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${
                    previewArticle.category === 'Bioeconomia' ? 'bg-idasam-green-medium/10 text-idasam-green-dark' :
                    previewArticle.category === 'Tecnologia' ? 'bg-blue-100 text-blue-700' :
                    previewArticle.category === 'Capacitação' ? 'bg-purple-100 text-purple-700' :
                    previewArticle.category === 'Pesquisa' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {previewArticle.category}
                  </Badge>
                  <span className="text-sm text-gray-500">{previewArticle.author}</span>
                </div>
                
                <h1 className="text-3xl font-bold text-idasam-text-main">
                  {previewArticle.title}
                </h1>
                
                <p className="text-lg text-gray-600 italic">
                  {previewArticle.excerpt}
                </p>
                
                <div className="prose max-w-none">
                  {previewArticle.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-700 leading-relaxed mb-4">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {previewArticle.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPreviewArticle(null)}
              >
                Fechar Preview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
