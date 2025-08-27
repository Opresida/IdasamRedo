import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, User, MessageSquare, Eye, ThumbsUp, Share2, X, Send, AlertCircle, Globe, Facebook, Twitter, Linkedin, Copy, Star, TrendingUp, Filter, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAnalyticsAndSEO } from '@/hooks/use-analytics';
import { supabase } from '@/supabaseClient';
import CommentThread from '@/components/comment-thread';
import SocialReactions from '@/components/social-reactions';
import TTSAudioPlayer from '@/components/tts-audio-player';
import FloatingNavbar from '@/components/floating-navbar';
import ShadcnblocksComFooter2 from '@/components/shadcnblocks-com-footer2';
import Logos3 from '@/components/logos3';
import NewsletterSection from '@/components/newsletter-section';

// Interface baseada na view articles_full
interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_name: string;
  author_id: string;
  category_name: string;
  category_slug: string;
  category_color: string;
  image?: string;
  featured: boolean;
  published: boolean;
  publish_date: string;
  created_at: string;
  updated_at: string;
  views: number;
  reaction_counts: Record<string, number>;
  tags?: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export default function NoticiasPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('pt');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareArticle, setShareArticle] = useState<Article | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);

  const { trackPageView, updateSEO } = useAnalyticsAndSEO();

  // Configurar SEO
  useEffect(() => {
    updateSEO({
      title: 'Notícias | IDASAM - Instituto de Desenvolvimento Sustentável da Amazônia',
      description: 'Acompanhe as últimas novidades e conquistas do IDASAM na transformação sustentável da Amazônia. Notícias sobre bioeconomia, tecnologia, capacitação e pesquisa.',
      keywords: ['IDASAM', 'Amazônia', 'sustentabilidade', 'notícias', 'bioeconomia', 'tecnologia', 'conservação'],
      url: `${window.location.origin}/noticias`,
      type: 'website'
    });

    trackPageView('/noticias', 'Notícias IDASAM');
  }, [updateSEO, trackPageView]);

  // Carregar artigos da view articles_full
  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles_full')
        .select('*')
        .eq('published', true)
        .order('publish_date', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Erro ao carregar artigos:', error);
      // Fallback para dados fictícios se necessário
      setArticles([]);
    }
  };

  // Carregar categorias
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
      setCategories([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadArticles(), loadCategories()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Incrementar visualizações quando um artigo é visualizado
  const incrementArticleViews = async (articleId: string) => {
    try {
      const { error } = await supabase.rpc('increment_article_views', {
        p_article_id: articleId
      });

      if (error) {
        console.error('Erro ao incrementar views:', error);
        return;
      }

      // Atualizar views no estado local
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, views: (article.views || 0) + 1 }
          : article
      ));
    } catch (error) {
      console.error('Erro ao incrementar views:', error);
    }
  };

  // Função para abrir dialog de compartilhamento
  const handleShare = (article: Article) => {
    setShareArticle(article);
    setShareDialogOpen(true);
  };

  // Função para compartilhar no WhatsApp
  const shareOnWhatsApp = (article: Article) => {
    const url = `${window.location.origin}/noticias#${article.id}`;
    const text = `${article.title} - ${article.excerpt}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`);
  };

  // Função para compartilhar no Facebook
  const shareOnFacebook = (article: Article) => {
    const url = `${window.location.origin}/noticias#${article.id}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  };

  // Função para compartilhar no Twitter
  const shareOnTwitter = (article: Article) => {
    const url = `${window.location.origin}/noticias#${article.id}`;
    const text = `${article.title} - ${article.excerpt}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
  };

  // Função para compartilhar no LinkedIn
  const shareOnLinkedIn = (article: Article) => {
    const url = `${window.location.origin}/noticias#${article.id}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
  };

  // Função para copiar link
  const copyToClipboard = async (article: Article) => {
    try {
      const url = `${window.location.origin}/noticias#${article.id}`;
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
    }
  };

  // Função para calcular tempo de leitura
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  // Função para verificar se é artigo novo (últimas 48h)
  const isNewArticle = (publishDate: string) => {
    const now = new Date();
    const articleDate = new Date(publishDate);
    const diffInHours = (now.getTime() - articleDate.getTime()) / (1000 * 3600);
    return diffInHours <= 48;
  };

  // Traduções
  const translations = {
    pt: {
      news: 'Notícias',
      search: 'Buscar artigos...',
      featuredArticle: 'Artigo em Destaque',
      readMore: 'Ler mais',
      close: 'Fechar',
      share: 'Compartilhar',
      shareOn: 'Compartilhar em',
      copyLink: 'Copiar link',
      linkCopied: 'Link copiado!',
      views: 'visualizações',
      newArticle: 'Novo',
      trending: 'Trending',
      readingTime: 'min de leitura',
      publishedBy: 'Publicado por',
      on: 'em',
      category: 'Categoria'
    },
    en: {
      news: 'News',
      search: 'Search articles...',
      featuredArticle: 'Featured Article',
      readMore: 'Read more',
      close: 'Close',
      share: 'Share',
      shareOn: 'Share on',
      copyLink: 'Copy link',
      linkCopied: 'Link copied!',
      views: 'views',
      newArticle: 'New',
      trending: 'Trending',
      readingTime: 'min read',
      publishedBy: 'Published by',
      on: 'on',
      category: 'Category'
    },
    es: {
      news: 'Noticias',
      search: 'Buscar artículos...',
      featuredArticle: 'Artículo Destacado',
      readMore: 'Leer más',
      close: 'Cerrar',
      share: 'Compartir',
      shareOn: 'Compartir en',
      copyLink: 'Copiar enlace',
      linkCopied: '¡Enlace copiado!',
      views: 'visualizaciones',
      newArticle: 'Nuevo',
      trending: 'Tendencia',
      readingTime: 'min de lectura',
      publishedBy: 'Publicado por',
      on: 'en',
      category: 'Categoría'
    },
    fr: {
      news: 'Actualités',
      search: 'Rechercher des articles...',
      featuredArticle: 'Article en Vedette',
      readMore: 'Lire la suite',
      close: 'Fermer',
      share: 'Partager',
      shareOn: 'Partager sur',
      copyLink: 'Copier le lien',
      linkCopied: 'Lien copié!',
      views: 'vues',
      newArticle: 'Nouveau',
      trending: 'Tendance',
      readingTime: 'min de lecture',
      publishedBy: 'Publié par',
      on: 'le',
      category: 'Catégorie'
    }
  };

  const t = translations[selectedLanguage as keyof typeof translations];
  
  const openArticle = (article: Article) => {
    incrementArticleViews(article.id);
    setSelectedArticle(article);
    setIsDialogOpen(true);

    // Atualizar SEO para o artigo específico
    updateSEO({
      title: `${article.title} | IDASAM Notícias`,
      description: article.excerpt,
      keywords: ['IDASAM', 'Amazônia', 'sustentabilidade', ...(article.tags || [])],
      image: article.image,
      url: `${window.location.origin}/noticias#${article.id}`,
      type: 'article'
    });

    // Track analytics
    trackPageView(`/noticias/${article.slug}`, `Article: ${article.title}`, {
      articleId: article.id,
      title: article.title
    });
  };

  // Filtrar artigos usando category_name
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (article.content && article.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Encontrar TODOS os artigos em destaque
  const featuredArticles = filteredArticles.filter(article => article.featured);
  // Outros artigos (não em destaque)
  const otherArticles = filteredArticles.filter(article => !article.featured);


  const handleBackToList = () => {
    setSelectedArticle(null);
    setIsDialogOpen(false);

    // Restaurar SEO da página principal
    updateSEO({
      title: 'Notícias | IDASAM - Instituto de Desenvolvimento Sustentável da Amazônia',
      description: 'Acompanhe as últimas novidades e conquistas do IDASAM na transformação sustentável da Amazônia.',
      keywords: ['IDASAM', 'Amazônia', 'sustentabilidade', 'notícias'],
      url: `${window.location.origin}/noticias`,
      type: 'website'
    });
  };

  const SkeletonCard = () => (
    <div className="news-card-skeleton">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-line h-4 w-1/2 mb-3"></div>
        <div className="skeleton-line h-6 w-3/4 mb-2"></div>
        <div className="skeleton-line h-6 w-full mb-4"></div>
        <div className="skeleton-line h-4 w-2/3 mb-2"></div>
        <div className="skeleton-line h-4 w-1/2"></div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand">
        <FloatingNavbar />

        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header skeleton */}
            <div className="text-center mb-12">
              <div className="h-12 bg-gray-200 rounded w-96 mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-[600px] mx-auto animate-pulse"></div>
            </div>

            {/* Filtros skeleton */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4">
              <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>

            {/* Grid skeleton */}
            <div className="news-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand">
      <FloatingNavbar />

      {/* Hero Section com Imagem */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://i.imgur.com/SUSPfjl.jpeg')"
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg">
            Notícias
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl opacity-90 leading-relaxed">
            Acompanhe as últimas novidades e conquistas do IDASAM na transformação sustentável da Amazônia.
          </p>
        </div>
      </section>

      <div className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!isDialogOpen ? (
            <>
              {/* Header */}
              <div className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4 sm:py-6">
                  <div className="flex flex-col gap-4">
                    <div className="text-center sm:text-left">
                      <h1 className="text-2xl sm:text-3xl font-bold text-forest mb-2">📰 {t.news} IDASAM</h1>
                      <p className="text-sm sm:text-base text-gray-600">Acompanhe as últimas novidades e conquistas do Instituto</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      {/* Seletor de idioma */}
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-full sm:w-40">
                          <Globe className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt">🇧🇷 Português</SelectItem>
                          <SelectItem value="en">🇺🇸 English</SelectItem>
                          <SelectItem value="es">🇪🇸 Español</SelectItem>
                          <SelectItem value="fr">🇫🇷 Français</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder={t.search}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-16 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {/* Slider de Artigos em Destaque */}
                  {featuredArticles.length > 0 && (
                    <div className="mb-12 sm:mb-16">
                      <div className="text-center mb-6 sm:mb-8 px-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-forest mb-2">🌟 Artigos em Destaque</h2>
                        <p className="text-sm sm:text-base text-gray-600">As principais notícias e conquistas do IDASAM</p>
                      </div>
                      
                      <div className="relative overflow-hidden">
                        <div className="flex gap-4 sm:gap-8 featured-slider">
                          {/* Duplicar os artigos para criar loop infinito suave */}
                          {[...featuredArticles, ...featuredArticles].map((featuredArticle, index) => (
                            <Card key={`${featuredArticle.id}-${index}`} className="flex-shrink-0 w-full max-w-4xl overflow-hidden shadow-xl bg-gradient-to-r from-forest/5 to-forest/10 border-forest/20 hover:shadow-2xl transition-all duration-500 group relative" style={{ minWidth: '320px', maxWidth: '1000px' }}>
                              {/* Indicador de artigo novo */}
                              {isNewArticle(featuredArticle.publish_date) && (
                                <div className="absolute top-4 right-4 z-10">
                                  <Badge className="bg-red-500 text-white border-0 animate-pulse">
                                    <Star className="w-3 h-3 mr-1" />
                                    {t.newArticle}
                                  </Badge>
                                </div>
                              )}

                              <div className="flex flex-col sm:flex-row">
                                <div className="sm:w-1/2">
                                  <div className="aspect-video sm:aspect-auto sm:h-full bg-gray-200 overflow-hidden">
                                    <img
                                      src={featuredArticle.image}
                                      alt={featuredArticle.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      loading="lazy"
                                    />
                                  </div>
                                </div>
                                <div className="sm:w-1/2 p-4 sm:p-6 lg:p-8">
                                  <div className="flex items-center gap-2 mb-4">
                                    <Badge 
                                      variant="outline" 
                                      className="bg-forest/10 text-forest border-forest font-semibold"
                                    >
                                      🌟 {t.featuredArticle}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge 
                                      variant="outline" 
                                      style={{ 
                                        backgroundColor: `${featuredArticle.category_color}15`, 
                                        borderColor: featuredArticle.category_color,
                                        color: featuredArticle.category_color
                                      }}
                                    >
                                      {featuredArticle.category_name}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs text-gray-500">
                                      {calculateReadingTime(featuredArticle.content)} {t.readingTime}
                                    </Badge>
                                  </div>
                                  <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-forest transition-colors duration-300 line-clamp-2">
                                    {featuredArticle.title}
                                  </h2>
                                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed line-clamp-3 sm:line-clamp-none">
                                    {featuredArticle.excerpt}
                                  </p>
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
                                      <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        <span>{featuredArticle.author_name}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(featuredArticle.created_at)}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        <span>{featuredArticle.views || 0} {t.views}</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                      <Button 
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleShare(featuredArticle)}
                                        className="hover:bg-gray-50 p-2 sm:px-3"
                                      >
                                        <Share2 className="w-4 h-4" />
                                        <span className="sr-only sm:not-sr-only sm:ml-2">{t.share}</span>
                                      </Button>
                                      <Button 
                                        onClick={() => openArticle(featuredArticle)}
                                        className="bg-forest hover:bg-forest/90 text-xs sm:text-sm"
                                        size="sm"
                                      >
                                        {t.readMore}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Indicadores de quantidade */}
                      <div className="text-center mt-6">
                        <p className="text-sm text-gray-500">
                          {featuredArticles.length} artigo{featuredArticles.length !== 1 ? 's' : ''} em destaque
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Separador visual */}
                  <div className="my-16">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  </div>

                  {/* Filtros */}
                  <div className="news-filters-section mb-8 sm:mb-12 mx-4 sm:mx-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
                      <h3 className="text-base sm:text-lg font-semibold text-forest text-center sm:text-left">🔍 Filtrar por:</h3>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-80 h-11 sm:h-12 border-2 border-gray-200 hover:border-forest transition-colors">
                          <Filter className="w-4 h-4 mr-2 text-forest" />
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">📰 Todas as categorias</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              🏷️ {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Título da seção de outros artigos */}
                  {otherArticles.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-forest mb-2">📚 Outras Notícias</h2>
                      <p className="text-gray-600">Descubra mais conteúdos sobre nossos projetos e iniciativas</p>
                    </div>
                  )}

                  {/* Grid de outros artigos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8 mb-16 sm:mb-20 px-4 sm:px-0">
                    {otherArticles.map((article) => (
                      <Card key={article.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-2xl hover:-translate-y-1 relative">
                        {/* Indicadores de status */}
                        <div className="absolute top-3 left-3 z-10 flex gap-2">
                          {isNewArticle(article.publish_date) && (
                            <Badge className="bg-red-500 text-white border-0 text-xs animate-pulse">
                              <Star className="w-3 h-3 mr-1" />
                              {t.newArticle}
                            </Badge>
                          )}
                          {article.views && article.views > 100 && (
                            <Badge className="bg-orange-500 text-white border-0 text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {t.trending}
                            </Badge>
                          )}
                        </div>

                        {/* Botão de compartilhar flutuante */}
                        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(article);
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="aspect-video bg-gray-200 overflow-hidden">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Badge 
                              variant="outline" 
                              style={{ 
                                backgroundColor: `${article.category_color}15`, 
                                borderColor: article.category_color,
                                color: article.category_color
                              }}
                              className="text-xs"
                            >
                              {article.category_name}
                            </Badge>
                            <Badge variant="outline" className="text-xs text-gray-500">
                              {calculateReadingTime(article.content)} {t.readingTime}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-forest transition-colors duration-300">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs text-gray-500 mb-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span className="truncate">{article.author_name}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(article.created_at)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{article.views || 0}</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            onClick={() => openArticle(article)}
                            className="w-full bg-forest hover:bg-forest/90 text-sm"
                            size="sm"
                          >
                            {t.readMore}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredArticles.length === 0 && (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhuma notícia encontrada
                      </h3>
                      <p className="text-gray-600">
                        Tente ajustar os filtros ou buscar por outros termos
                      </p>
                    </div>
                  )}
                </div>

                {/* Seção Newsletter */}
                <div className="mt-24">
                  <NewsletterSection />
                </div>

                {/* Seção de Parceiros Estratégicos */}
                <div className="mt-16">
                  <Logos3 />
                </div>
              </div>
            </>
          ) : (
            /* Visualização individual do artigo */
            <div className="max-w-4xl mx-auto">
              <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
                if (!isOpen) handleBackToList();
              }}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <div className="flex items-center justify-between w-full">
                      <DialogTitle className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-idasam-green" />
                        {selectedArticle?.category_name}
                      </DialogTitle>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShare(selectedArticle)}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          {t.share}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          <X className="w-4 h-4" />
                          {t.close}
                        </Button>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      {selectedArticle.featured && (
                        <Badge variant="default">Destaque</Badge>
                      )}
                      <Badge 
                        style={{ 
                          backgroundColor: `${selectedArticle.category_color}15`, 
                          borderColor: selectedArticle.category_color,
                          color: selectedArticle.category_color
                        }}
                      >
                        {selectedArticle.category_name}
                      </Badge>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      {selectedArticle.title}
                    </h1>

                    <div className="flex items-center gap-6 mb-8 text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        <span>{selectedArticle.author_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <span>{formatDate(selectedArticle.publish_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        <span>{selectedArticle.views || 0} visualizações</span>
                      </div>
                    </div>

                    {selectedArticle.excerpt && (
                      <p className="text-xl text-gray-600 mb-8 font-medium border-l-4 border-idasam-green pl-4">
                        {selectedArticle.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mb-8">
                      {selectedArticle.image && (
                        <div className="aspect-video md:aspect-auto md:h-64 bg-gray-200 overflow-hidden rounded-lg flex-shrink-0">
                          <img
                            src={selectedArticle.image}
                            alt={selectedArticle.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <TTSAudioPlayer text={selectedArticle.content} />
                        <SocialReactions 
                          articleId={selectedArticle.id} 
                          initialCounts={selectedArticle.reaction_counts} 
                        />
                      </div>
                    </div>

                    <div 
                      className="prose prose-lg max-w-none mb-8"
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/\n/g, '<br>') }}
                    />

                    {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-8">
                        {selectedArticle.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="border-t pt-8">
                      <CommentThread articleId={selectedArticle.id} />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      <ShadcnblocksComFooter2 />

      {/* Dialog de Compartilhamento */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              {t.share}
            </DialogTitle>
          </DialogHeader>

          {shareArticle && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-1">{shareArticle.title}</h4>
                <p className="text-xs text-gray-600 line-clamp-2">{shareArticle.excerpt}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => shareOnWhatsApp(shareArticle)}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </Button>

                <Button
                  onClick={() => shareOnFacebook(shareArticle)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>

                <Button
                  onClick={() => shareOnTwitter(shareArticle)}
                  className="flex items-center gap-2 bg-blue-400 hover:bg-blue-500"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>

                <Button
                  onClick={() => shareOnLinkedIn(shareArticle)}
                  className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
              </div>

              <Separator />

              <Button
                onClick={() => copyToClipboard(shareArticle)}
                variant="outline"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copySuccess ? t.linkCopied : t.copyLink}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};