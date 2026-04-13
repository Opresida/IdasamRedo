import React, { useState } from 'react';
import { sanitizeHtml } from '@/lib/sanitize';
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
  CheckCircle,
  Calendar,
  Newspaper,
  Mail,
  Users,
  Copy
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  published: string;
  featured: string;
  categoryId?: string | null;
  tags?: string[] | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  categoryName?: string | null;
  views?: number;
}

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
}

interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isApproved: string;
  createdAt: string;
  articleTitle?: string | null;
}

export default function ImprensaPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    published: 'false',
    featured: 'false',
    categoryId: '',
    tags: '',
    image: '',
    readingTime: 5,
  });

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);

  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('idasam_admin_token') : null);
  const authFetch = async (method: string, url: string, body?: unknown): Promise<Response> => {
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
    if (!res.ok) { const text = await res.text(); throw new Error(text || res.statusText); }
    return res;
  };

  const authHeaders: Record<string, string> = (() => {
    const token = getToken();
    const h: Record<string, string> = {};
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  })();

  const { data: articles = [], isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
    queryFn: async () => {
      const res = await fetch('/api/articles', { headers: authHeaders });
      if (!res.ok) throw new Error('Erro ao buscar artigos');
      return res.json();
    },
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/article-categories'],
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ['/api/admin/comments'],
    queryFn: async () => {
      const res = await fetch('/api/admin/comments', { headers: authHeaders });
      if (!res.ok) throw new Error('Erro ao buscar comentários');
      return res.json();
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: (data: any) => authFetch('POST', '/api/articles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({ title: 'Sucesso', description: 'Artigo criado com sucesso' });
      resetArticleForm();
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message || 'Erro ao criar artigo', variant: 'destructive' }),
  });

  const updateArticleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => authFetch('PUT', `/api/articles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({ title: 'Sucesso', description: 'Artigo atualizado com sucesso' });
      resetArticleForm();
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message || 'Erro ao atualizar artigo', variant: 'destructive' }),
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id: string) => authFetch('DELETE', `/api/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({ title: 'Sucesso', description: 'Artigo excluído com sucesso' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message || 'Erro ao excluir artigo', variant: 'destructive' }),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => authFetch('POST', '/api/article-categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/article-categories'] });
      toast({ title: 'Sucesso', description: 'Categoria criada com sucesso' });
      setShowCategoryDialog(false);
      setNewCategory({ name: '', slug: '', description: '' });
      setEditingCategory(null);
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message || 'Erro ao criar categoria', variant: 'destructive' }),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => authFetch('PUT', `/api/article-categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/article-categories'] });
      toast({ title: 'Sucesso', description: 'Categoria atualizada com sucesso' });
      setShowCategoryDialog(false);
      setNewCategory({ name: '', slug: '', description: '' });
      setEditingCategory(null);
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message || 'Erro ao atualizar categoria', variant: 'destructive' }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => authFetch('DELETE', `/api/article-categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/article-categories'] });
      toast({ title: 'Sucesso', description: 'Categoria excluída com sucesso' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message || 'Erro ao excluir categoria', variant: 'destructive' }),
  });

  const approveCommentMutation = useMutation({
    mutationFn: (id: string) => authFetch('PUT', `/api/admin/comments/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/comments'] });
      toast({ title: 'Sucesso', description: 'Comentário aprovado' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message || 'Erro ao aprovar comentário', variant: 'destructive' }),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id: string) => authFetch('DELETE', `/api/admin/comments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/comments'] });
      toast({ title: 'Sucesso', description: 'Comentário excluído' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message || 'Erro ao excluir comentário', variant: 'destructive' }),
  });

  const handleSaveArticle = () => {
    if (!articleForm.title || !articleForm.content) {
      toast({ title: 'Erro', description: 'Título e conteúdo são obrigatórios', variant: 'destructive' });
      return;
    }

    const data = {
      title: articleForm.title,
      content: articleForm.content,
      excerpt: articleForm.excerpt || null,
      published: articleForm.published,
      featured: articleForm.featured,
      categoryId: (articleForm.categoryId && articleForm.categoryId !== 'none') ? articleForm.categoryId : null,
      tags: articleForm.tags ? articleForm.tags.split(',').map(t => t.trim()).filter(t => t) : [],
      image: articleForm.image || null,
      readingTime: articleForm.readingTime || 5,
      authorName: user?.email || 'Admin',
    };

    if (editingId) {
      updateArticleMutation.mutate({ id: editingId, data });
    } else {
      createArticleMutation.mutate(data);
    }
  };

  const handleEditArticle = (article: Article) => {
    setArticleForm({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      published: article.published,
      featured: article.featured,
      categoryId: article.categoryId || '',
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
      image: article.image || '',
      readingTime: 5,
    });
    setEditingId(article.id);
    setIsEditing(true);
  };

  const handlePreviewArticle = (article: Article) => {
    setPreviewArticle(article);
    setShowPreviewModal(true);
  };

  const resetArticleForm = () => {
    setArticleForm({ title: '', content: '', excerpt: '', published: 'false', featured: 'false', categoryId: '', tags: '', image: '', readingTime: 5 });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSaveCategory = () => {
    if (!newCategory.name) {
      toast({ title: 'Erro', description: 'Nome da categoria é obrigatório', variant: 'destructive' });
      return;
    }
    const slug = newCategory.slug || newCategory.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const data = { ...newCategory, slug };
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.content && article.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalArticles = articles.length;
  const publishedArticles = articles.filter(a => a.published === 'true').length;
  const pendingComments = comments.filter(c => c.isApproved !== 'true').length;

  const isLoading = articlesLoading || categoriesLoading;
  const isSaving = createArticleMutation.isPending || updateArticleMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-idasam-green-dark"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              <span className="font-medium">{publishedArticles}/{totalArticles}</span>
              <span className="text-gray-500">publicados</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-orange-600" />
              <span className="font-medium">{pendingComments}</span>
              <span className="text-gray-500">pendentes</span>
            </div>
          </div>
          <Button onClick={() => { queryClient.invalidateQueries({ queryKey: ['/api/articles'] }); queryClient.invalidateQueries({ queryKey: ['/api/admin/comments'] }); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="articles">Artigos</TabsTrigger>
          <TabsTrigger value="comments">
            Comentários
            {pendingComments > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">{pendingComments}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
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
                      <CardDescription>Crie, edite e gerencie seus artigos</CardDescription>
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
                              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={() => { resetArticleForm(); setIsEditing(true); }}>
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
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-medium text-lg">{article.title}</h3>
                              <Badge variant={article.published === 'true' ? 'default' : 'secondary'}>
                                {article.published === 'true' ? 'Publicado' : 'Rascunho'}
                              </Badge>
                              {article.featured === 'true' && (
                                <Badge variant="outline">
                                  <Star className="w-3 h-3 mr-1" />
                                  Destaque
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-2">{article.excerpt}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                              <span>Por {article.authorName}</span>
                              {article.categoryName && <><span>•</span><span>{article.categoryName}</span></>}
                              <span>•</span>
                              <span>{formatDate(article.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{article.views || 0}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handlePreviewArticle(article)}>
                                <Eye className="w-4 h-4 mr-2" />Preview
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditArticle(article)}>
                                <Edit className="w-4 h-4 mr-2" />Editar
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />Excluir
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir "{article.title}"? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteArticleMutation.mutate(article.id)}>Excluir</AlertDialogAction>
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
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum artigo encontrado</h3>
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
                      <CardTitle>{editingId ? 'Editar Artigo' : 'Novo Artigo'}</CardTitle>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <Input id="title" value={articleForm.title} onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Título do artigo" />
                    </div>
                    <div>
                      <Label htmlFor="excerpt">Resumo</Label>
                      <Textarea id="excerpt" value={articleForm.excerpt} onChange={(e) => setArticleForm(prev => ({ ...prev, excerpt: e.target.value }))} placeholder="Breve descrição" rows={3} />
                    </div>
                    <div>
                      <Label htmlFor="content">Conteúdo *</Label>
                      <Textarea id="content" value={articleForm.content} onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))} placeholder="Conteúdo completo" rows={8} />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select value={articleForm.categoryId} onValueChange={(value) => setArticleForm(prev => ({ ...prev, categoryId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem categoria</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                      <Input id="tags" value={articleForm.tags} onChange={(e) => setArticleForm(prev => ({ ...prev, tags: e.target.value }))} placeholder="tag1, tag2, tag3" />
                    </div>
                    <div>
                      <Label htmlFor="image">URL da Imagem</Label>
                      <Input id="image" value={articleForm.image} onChange={(e) => setArticleForm(prev => ({ ...prev, image: e.target.value }))} placeholder="https://exemplo.com/imagem.jpg" />
                    </div>
                    <div>
                      <Label htmlFor="readingTime">Tempo de leitura (min)</Label>
                      <Input id="readingTime" type="number" value={articleForm.readingTime} onChange={(e) => setArticleForm(prev => ({ ...prev, readingTime: parseInt(e.target.value) || 5 }))} min={1} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch id="published" checked={articleForm.published === 'true'} onCheckedChange={(checked) => setArticleForm(prev => ({ ...prev, published: checked ? 'true' : 'false' }))} />
                        <Label htmlFor="published">Publicar artigo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="featured" checked={articleForm.featured === 'true'} onCheckedChange={(checked) => setArticleForm(prev => ({ ...prev, featured: checked ? 'true' : 'false' }))} />
                        <Label htmlFor="featured">Artigo em destaque</Label>
                      </div>
                    </div>
                    <Separator />
                    <Button onClick={handleSaveArticle} className="w-full" disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Salvando...' : (editingId ? 'Atualizar' : 'Criar')} Artigo
                    </Button>
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
              <CardDescription>Modere e gerencie comentários dos leitores</CardDescription>
            </CardHeader>
            <CardContent>
              {commentsLoading ? (
                <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-idasam-green-dark mx-auto"></div></div>
              ) : (
                <div className="space-y-4">
                  {comments.length === 0 && <p className="text-center text-gray-500 py-8">Nenhum comentário encontrado</p>}
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{comment.authorName}</span>
                            <span className="text-gray-400">({comment.authorEmail})</span>
                            <Badge variant={comment.isApproved === 'true' ? 'default' : 'secondary'}>
                              {comment.isApproved === 'true' ? 'Aprovado' : 'Pendente'}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-2">{comment.content}</p>
                          <div className="text-sm text-gray-500">
                            {comment.articleTitle && <>Em: <span className="font-medium">{comment.articleTitle}</span> • </>}
                            {formatDate(comment.createdAt)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {comment.isApproved !== 'true' && (
                            <Button size="sm" onClick={() => approveCommentMutation.mutate(comment.id)} disabled={approveCommentMutation.isPending}>
                              <CheckCircle className="w-4 h-4 mr-1" />Aprovar
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>Tem certeza que deseja excluir este comentário?</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteCommentMutation.mutate(comment.id)}>Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="newsletter" className="space-y-6">
          <NewsletterTab />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gerenciar Categorias</CardTitle>
                  <CardDescription>Organize seus artigos em categorias</CardDescription>
                </div>
                <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setNewCategory({ name: '', slug: '', description: '' }); setEditingCategory(null); }}>
                      <Plus className="w-4 h-4 mr-2" />Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
                      <DialogDescription>Crie ou edite uma categoria para organizar seus artigos</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="category-name">Nome *</Label>
                        <Input id="category-name" value={newCategory.name} onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))} placeholder="Nome da categoria" />
                      </div>
                      <div>
                        <Label htmlFor="category-slug">Slug (gerado automaticamente)</Label>
                        <Input id="category-slug" value={newCategory.slug} onChange={(e) => setNewCategory(prev => ({ ...prev, slug: e.target.value }))} placeholder="slug-da-categoria" />
                      </div>
                      <div>
                        <Label htmlFor="category-description">Descrição</Label>
                        <Textarea id="category-description" value={newCategory.description} onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))} placeholder="Descrição da categoria" rows={3} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => { setShowCategoryDialog(false); setEditingCategory(null); }}>Cancelar</Button>
                      <Button onClick={handleSaveCategory} disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                        {editingCategory ? 'Atualizar' : 'Criar'} Categoria
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
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <h3 className="font-medium">{category.name}</h3>
                    </div>
                    {category.description && <p className="text-sm text-gray-600 mb-2">{category.description}</p>}
                    <div className="text-xs text-gray-500 mb-2">Slug: {category.slug}</div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => { setNewCategory({ name: category.name, slug: category.slug || '', description: category.description || '' }); setEditingCategory(category); setShowCategoryDialog(true); }}>
                        <Edit className="w-3 h-3 mr-1" />Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive"><Trash2 className="w-3 h-3 mr-1" />Excluir</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>Tem certeza que deseja excluir "{category.name}"?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCategoryMutation.mutate(category.id)}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">Nenhuma categoria criada ainda</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Imprensa</CardTitle>
              <CardDescription>Gerencie as configurações da área de imprensa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Atualizar Cache</h3>
                    <p className="text-sm text-gray-600">Limpa o cache e recarrega todos os dados</p>
                  </div>
                  <Button onClick={() => { queryClient.invalidateQueries({ queryKey: ['/api/articles'] }); queryClient.invalidateQueries({ queryKey: ['/api/article-categories'] }); queryClient.invalidateQueries({ queryKey: ['/api/admin/comments'] }); }}>
                    <RefreshCw className="w-4 h-4 mr-2" />Atualizar
                  </Button>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Resumo</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">{totalArticles}</p>
                      <p className="text-sm text-blue-700">Total de Artigos</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{publishedArticles}</p>
                      <p className="text-sm text-green-700">Publicados</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-orange-600">{pendingComments}</p>
                      <p className="text-sm text-orange-700">Comentários Pendentes</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />Preview do Artigo
            </DialogTitle>
          </DialogHeader>
          {previewArticle && (
            <div className="space-y-6">
              {previewArticle.image && (
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <img src={previewArticle.image} alt={previewArticle.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant={previewArticle.published === 'true' ? 'default' : 'secondary'}>
                  {previewArticle.published === 'true' ? 'Publicado' : 'Rascunho'}
                </Badge>
                {previewArticle.featured === 'true' && (
                  <Badge variant="outline"><Star className="w-3 h-3 mr-1" />Destaque</Badge>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" /><span>{previewArticle.authorName}</span>
                </div>
                {previewArticle.categoryName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Tag className="w-4 h-4" /><span>{previewArticle.categoryName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" /><span>{formatDate(previewArticle.createdAt)}</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{previewArticle.title}</h1>
              {previewArticle.excerpt && (
                <p className="text-xl text-gray-600 font-medium border-l-4 border-idasam-green pl-4">{previewArticle.excerpt}</p>
              )}
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(previewArticle.content?.replace(/\n/g, '<br>') || '') }} />
              {previewArticle.tags && previewArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {previewArticle.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary"><Tag className="w-3 h-3 mr-1" />{tag}</Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-6 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Eye className="w-4 h-4" /><span>{previewArticle.views || 0} visualizações</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>Fechar</Button>
            <Button onClick={() => { if (previewArticle) window.open(`/noticias?artigo=${previewArticle.id}`, '_blank'); }}>
              <Globe className="w-4 h-4 mr-2" />Ver no Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewsletterTab() {
  const { data: subscribers = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/newsletter'],
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      apiRequest('PATCH', `/api/admin/newsletter/${id}/toggle`, { ativo }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/admin/newsletter'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/newsletter/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/admin/newsletter'] }),
  });

  const copyEmails = () => {
    const emails = subscribers.filter(s => s.ativo).map(s => s.email).join(', ');
    navigator.clipboard.writeText(emails);
  };

  const ativos = subscribers.filter(s => s.ativo).length;
  const inativos = subscribers.filter(s => !s.ativo).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{subscribers.length}</p>
          <p className="text-xs text-gray-500">Total Inscritos</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{ativos}</p>
          <p className="text-xs text-gray-500">Ativos</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-400">{inativos}</p>
          <p className="text-xs text-gray-500">Inativos</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-idasam-green-dark" />
              <CardTitle className="text-lg">Inscritos na Newsletter</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={copyEmails} disabled={ativos === 0}>
              <Copy className="w-4 h-4 mr-1" /> Copiar E-mails Ativos
            </Button>
          </div>
          <CardDescription>
            Pessoas inscritas via formulário na página de notícias. Disponíveis como público no módulo de Marketing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-gray-400 py-8">Carregando...</p>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">Nenhum inscrito ainda</p>
              <p className="text-xs text-gray-300 mt-1">Os inscritos aparecerão aqui quando se cadastrarem em /noticias</p>
            </div>
          ) : (
            <div className="divide-y">
              {subscribers.map((sub: any) => (
                <div key={sub.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${sub.ativo ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sub.name}</p>
                      <p className="text-xs text-gray-500">{sub.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(sub.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <Switch
                      checked={sub.ativo}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: sub.id, ativo: checked })}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 h-8 w-8 p-0"
                      onClick={() => { if (confirm('Remover este inscrito?')) deleteMutation.mutate(sub.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
