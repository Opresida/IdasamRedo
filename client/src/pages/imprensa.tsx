
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';

export default function ImprensaPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Gestão de Imprensa
          </CardTitle>
          <CardDescription>
            Gerencie releases, contatos de mídia e cobertura jornalística
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Página em Desenvolvimento
            </h3>
            <p className="text-gray-600">
              Esta seção será implementada em breve para gerenciar as atividades de imprensa.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Eye,
  Heart,
  MessageCircle,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Settings,
  Star,
  Tag,
  RefreshCw,
  Globe,
  User,
  Shield,
  CheckCircle,
  Calendar,
  Users,
  TrendingUp,
  Activity,
  BarChart3,
  Download,
  Upload,
  Filter,
  Search,
  Bell,
  Menu,
  Home,
  Database,
  PieChart,
  Newspaper
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Interfaces
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

export default function ImprensaPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Estados principais
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articleStats, setArticleStats] = useState<Record<string, ArticleStats>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Estados do formulário de artigo
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    published: false,
    featured: false,
    category_id: '',
    tags: '',
    image: ''
  });

  // Estados do formulário de categoria
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: ''
  });

  // Estados para o modal de preview
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);

  // Carregar dados iniciais
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
        description: 'Erro ao carregar dados da imprensa',
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

  // Funções de CRUD para artigos
  const handleSaveArticle = async () => {
    if (!user) {
      toast({ title: 'Erro', description: 'Você precisa estar logado.', variant: 'destructive' });
      return;
    }

    // Validações básicas
    if (!articleForm.title.trim()) {
      toast({ title: 'Erro', description: 'O título é obrigatório.', variant: 'destructive' });
      return;
    }

    if (!articleForm.content.trim()) {
      toast({ title: 'Erro', description: 'O conteúdo é obrigatório.', variant: 'destructive' });
      return;
    }

    if (!articleForm.category_id) {
      toast({ title: 'Erro', description: 'Selecione uma categoria.', variant: 'destructive' });
      return;
    }

    try {
      // Gerar slug único
      const baseSlug = articleForm.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplos
        .replace(/^-+|-+$/g, ''); // Remove hífens das bordas

      // Verificar se o slug já existe (para novos artigos)
      let finalSlug = baseSlug;
      if (!editingId) {
        const { data: existingSlugs } = await supabase
          .from('articles')
          .select('slug')
          .like('slug', `${baseSlug}%`);

        if (existingSlugs && existingSlugs.length > 0) {
          const slugNumbers = existingSlugs
            .map(item => {
              const match = item.slug.match(new RegExp(`^${baseSlug}(?:-(\\d+))?$`));
              return match ? (match[1] ? parseInt(match[1]) : 0) : -1;
            })
            .filter(num => num >= 0);

          if (slugNumbers.length > 0) {
            const maxNumber = Math.max(...slugNumbers);
            finalSlug = `${baseSlug}-${maxNumber + 1}`;
          }
        }
      }

      // Preparar dados do artigo
      const articleData = {
        title: articleForm.title.trim(),
        slug: finalSlug,
        content: articleForm.content.trim(),
        excerpt: articleForm.excerpt.trim() || null,
        published: articleForm.published,
        featured: articleForm.featured,
        category_id: articleForm.category_id,
        image: articleForm.image.trim() || null,
        author_id: user.id,
        updated_at: new Date().toISOString()
      };

      let articleId = editingId;

      if (editingId) {
        // ATUALIZAR ARTIGO EXISTENTE
        const updateData = { ...articleData };
        delete updateData.author_id; // Não alterar o autor original

        const { error } = await supabase
          .from('articles')
          .update(updateData)
          .eq('id', editingId);
        
        if (error) {
          throw new Error(`Erro ao atualizar artigo: ${error.message}`);
        }
      } else {
        // CRIAR NOVO ARTIGO
        const createData = {
          ...articleData,
          created_at: new Date().toISOString(),
          publish_date: articleForm.published ? new Date().toISOString() : null
        };

        const { data, error } = await supabase
          .from('articles')
          .insert(createData)
          .select('id')
          .single();
        
        if (error) {
          throw new Error(`Erro ao criar artigo: ${error.message}`);
        }
        
        if (!data?.id) {
          throw new Error("Não foi possível obter o ID do novo artigo.");
        }
        
        articleId = data.id;
      }

      // Processar Tags
      if (articleId && articleForm.tags.trim()) {
        // Remover tags existentes se estiver editando
        if (editingId) {
          await supabase
            .from('article_tags')
            .delete()
            .eq('article_id', articleId);
        }

        const tagNames = articleForm.tags
          .split(',')
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0 && tag.length <= 50);

        if (tagNames.length > 0) {
          // Buscar ou criar tags
          const { data: existingTags } = await supabase
            .from('tags')
            .select('id, name')
            .in('name', tagNames);

          const existingTagMap = new Map((existingTags || []).map(t => [t.name, t.id]));
          const tagsToCreate = tagNames.filter(name => !existingTagMap.has(name));
          
          // Criar novas tags
          if (tagsToCreate.length > 0) {
            const { data: newTags, error: createTagsError } = await supabase
              .from('tags')
              .insert(tagsToCreate.map(name => ({
                name,
                slug: name.replace(/\s+/g, '-').toLowerCase()
              })))
              .select('id, name');
            
            if (!createTagsError) {
              newTags?.forEach(tag => existingTagMap.set(tag.name, tag.id));
            }
          }

          // Criar relacionamentos article_tags
          const tagsToInsert = tagNames
            .map(name => {
              const tagId = existingTagMap.get(name);
              return tagId ? { article_id: articleId, tag_id: tagId } : null;
            })
            .filter(Boolean);

          if (tagsToInsert.length > 0) {
            await supabase
              .from('article_tags')
              .insert(tagsToInsert);
          }
        }
      }

      toast({
        title: 'Sucesso',
        description: `Artigo ${editingId ? 'atualizado' : 'criado'} com sucesso!`,
      });

      // Resetar formulário e recarregar lista
      setIsEditing(false);
      setEditingId(null);
      resetArticleForm();
      await loadArticles();

    } catch (error: any) {
      console.error('Erro ao salvar artigo:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o artigo.',
        variant: 'destructive',
      });
    }
  };

  const handlePreviewArticle = (article: Article) => {
    setPreviewArticle(article);
    setShowPreviewModal(true);
  };

  const handleEditArticle = (article: Article) => {
    setArticleForm({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      published: article.published,
      featured: article.featured,
      category_id: article.category_id || '',
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
      image: article.image || ''
    });
    setEditingId(article.id);
    setIsEditing(true);
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Artigo excluído com sucesso',
      });

      loadArticles();
    } catch (error) {
      console.error('Erro ao excluir artigo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir artigo',
        variant: 'destructive',
      });
    }
  };

  const resetArticleForm = () => {
    setArticleForm({
      title: '',
      content: '',
      excerpt: '',
      published: false,
      featured: false,
      category_id: '',
      tags: '',
      image: ''
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSaveCategory = async () => {
    try {
      const slug = categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-');

      const { error } = await supabase
        .from('categories')
        .insert([{
          ...categoryForm,
          slug
        }]);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Categoria criada com sucesso',
      });

      setShowCategoryDialog(false);
      setCategoryForm({ name: '', slug: '', description: '' });
      loadCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar categoria',
        variant: 'destructive',
      });
    }
  };

  const handleApproveComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ is_approved: true })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Comentário aprovado',
      });

      loadComments();
    } catch (error) {
      console.error('Erro ao aprovar comentário:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao aprovar comentário',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Comentário excluído',
      });

      loadComments();
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir comentário',
        variant: 'destructive',
      });
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (article.content && article.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      {/* Header da Seção Imprensa */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Newspaper className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Imprensa</h1>
            <p className="text-gray-600">Gerencie artigos, comentários e categorias</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4 px-4 py-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{totalArticles}</span>
              <span className="text-gray-500">artigos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-orange-600" />
              <span className="font-medium">{pendingComments}</span>
              <span className="text-gray-500">pendentes</span>
            </div>
          </div>
          <Button onClick={loadInitialData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="articles">Artigos</TabsTrigger>
          <TabsTrigger value="comments">
            Comentários
            {pendingComments > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {pendingComments}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <CardTitle>Gerenciar Artigos</CardTitle>
                      <CardDescription>
                        Crie, edite e gerencie seus artigos
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Buscar artigos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full sm:w-64"
                        />
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas as categorias</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() => {
                          resetArticleForm();
                          setEditingId(null);
                          setIsEditing(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Artigo
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredArticles.map((article) => (
                      <div key={article.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-lg">{article.title}</h3>
                              <Badge variant={article.published ? 'default' : 'secondary'}>
                                {article.published ? 'Publicado' : 'Rascunho'}
                              </Badge>
                              {article.featured && (
                                <Badge variant="outline">
                                  <Star className="w-3 h-3 mr-1" />
                                  Destaque
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-2">{article.excerpt}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Por {article.author_name}</span>
                              <span>•</span>
                              <span>{article.category_name}</span>
                              <span>•</span>
                              <span>{formatDate(article.created_at)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{articleStats[article.id]?.views || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                <span>{articleStats[article.id]?.reaction_counts?.like || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{comments.filter(c => c.article_id === article.id).length}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePreviewArticle(article)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditArticle(article)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir o artigo "{article.title}"?
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteArticle(article.id)}>
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredArticles.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Nenhum artigo encontrado
                        </h3>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {isEditing && (
              <div className="w-full lg:w-96">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        {editingId ? 'Editar Artigo' : 'Novo Artigo'}
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={articleForm.title}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Digite o título do artigo"
                      />
                    </div>

                    <div>
                      <Label htmlFor="excerpt">Resumo</Label>
                      <Textarea
                        id="excerpt"
                        value={articleForm.excerpt}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="Breve descrição do artigo"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">Conteúdo</Label>
                      <Textarea
                        id="content"
                        value={articleForm.content}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Conteúdo completo do artigo"
                        rows={8}
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={articleForm.category_id}
                        onValueChange={(value) => setArticleForm(prev => ({ ...prev, category_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                      <Input
                        id="tags"
                        value={articleForm.tags}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>

                    <div>
                      <Label htmlFor="image">URL da Imagem</Label>
                      <Input
                        id="image"
                        value={articleForm.image}
                        onChange={(e) => setArticleForm(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="published"
                          checked={articleForm.published}
                          onCheckedChange={(checked) => setArticleForm(prev => ({ ...prev, published: checked }))}
                        />
                        <Label htmlFor="published">Publicar artigo</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="featured"
                          checked={articleForm.featured}
                          onCheckedChange={(checked) => setArticleForm(prev => ({ ...prev, featured: checked }))}
                        />
                        <Label htmlFor="featured">Artigo em destaque</Label>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button onClick={handleSaveArticle} className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        {editingId ? 'Atualizar' : 'Criar'} Artigo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Comentários</CardTitle>
              <CardDescription>
                Modere e gerencie comentários dos leitores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{comment.author_name}</span>
                          <span className="text-gray-400">({comment.author_email})</span>
                          <Badge variant={comment.is_approved ? 'default' : 'secondary'}>
                            {comment.is_approved ? 'Aprovado' : 'Pendente'}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-2">{comment.content}</p>
                        <div className="text-sm text-gray-500">
                          Em: <span className="font-medium">{comment.article_title}</span> • {formatDate(comment.created_at)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!comment.is_approved && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveComment(comment.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este comentário?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteComment(comment.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gerenciar Categorias</CardTitle>
                  <CardDescription>
                    Organize seus artigos em categorias
                  </CardDescription>
                </div>
                <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Categoria</DialogTitle>
                      <DialogDescription>
                        Crie uma nova categoria para organizar seus artigos
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="category-name">Nome</Label>
                        <Input
                          id="category-name"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nome da categoria"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category-slug">Slug</Label>
                        <Input
                          id="category-slug"
                          value={categoryForm.slug}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                          placeholder="slug-da-categoria (opcional)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category-description">Descrição</Label>
                        <Textarea
                          id="category-description"
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descrição da categoria (opcional)"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveCategory}>
                        Criar Categoria
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <h3 className="font-medium">{category.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    <div className="text-xs text-gray-500">
                      Slug: {category.slug}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Imprensa</CardTitle>
              <CardDescription>
                Gerencie as configurações da área de imprensa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Atualizar Cache</h3>
                    <p className="text-sm text-gray-600">
                      Limpa o cache e recarrega todos os dados
                    </p>
                  </div>
                  <Button onClick={loadInitialData} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Preview do Artigo */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview do Artigo
            </DialogTitle>
          </DialogHeader>

          {previewArticle && (
            <div className="space-y-6">
              {/* Imagem do artigo */}
              {previewArticle.image && (
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <img
                    src={previewArticle.image}
                    alt={previewArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Metadados do artigo */}
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant={previewArticle.published ? 'default' : 'secondary'}>
                  {previewArticle.published ? 'Publicado' : 'Rascunho'}
                </Badge>
                {previewArticle.featured && (
                  <Badge variant="outline">
                    <Star className="w-3 h-3 mr-1" />
                    Destaque
                  </Badge>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{previewArticle.author_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag className="w-4 h-4" />
                  <span>{previewArticle.category_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(previewArticle.created_at)}</span>
                </div>
              </div>

              {/* Título */}
              <h1 className="text-3xl font-bold text-gray-900">
                {previewArticle.title}
              </h1>

              {/* Resumo */}
              {previewArticle.excerpt && (
                <p className="text-xl text-gray-600 font-medium border-l-4 border-idasam-green pl-4">
                  {previewArticle.excerpt}
                </p>
              )}

              {/* Conteúdo */}
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: previewArticle.content?.replace(/\n/g, '<br>') || ''
                }}
              />

              {/* Tags */}
              {previewArticle.tags && previewArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {previewArticle.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Estatísticas */}
              <div className="flex items-center gap-6 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>{articleStats[previewArticle.id]?.views || 0} visualizações</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Heart className="w-4 h-4" />
                  <span>{articleStats[previewArticle.id]?.reaction_counts?.like || 0} likes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span>{comments.filter(c => c.article_id === previewArticle.id).length} comentários</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
              Fechar
            </Button>
            <Button
              onClick={() => {
                if (previewArticle) {
                  window.open(`/noticias#${previewArticle.id}`, '_blank');
                }
              }}
              variant="default"
            >
              <Globe className="w-4 h-4 mr-2" />
              Ver no Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
