
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Eye, 
  Heart, 
  MessageCircle, 
  Search, 
  Filter,
  User,
  Tag,
  ChevronRight
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/supabaseClient';
import { useAnalyticsAndSEO } from '@/hooks/use-analytics';
import SocialReactions from '@/components/social-reactions';
import CommentThread from '@/components/comment-thread';
import FloatingNavbar from '@/components/floating-navbar';
import ShadcnblocksComFooter2 from '@/components/shadcnblocks-com-footer2';

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showComments, setShowComments] = useState(false);
  
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
      setLoading(true);
      await Promise.all([loadArticles(), loadCategories()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Incrementar visualizações quando um artigo é visualizado
  const handleViewArticle = async (article: Article) => {
    try {
      // Chamar função do Supabase para incrementar views
      const { error } = await supabase.rpc('increment_article_views', {
        p_article_id: article.id
      });

      if (error) console.error('Erro ao incrementar views:', error);

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

      setSelectedArticle(article);
    } catch (error) {
      console.error('Erro ao visualizar artigo:', error);
    }
  };

  // Filtrar artigos usando category_name
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (article.content && article.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBackToList = () => {
    setSelectedArticle(null);
    setShowComments(false);
    
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

  if (loading) {
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
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!selectedArticle ? (
            <>
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-idasam-green-dark mb-4">
                  Notícias IDASAM
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Acompanhe as últimas novidades e conquistas do IDASAM na transformação sustentável da Amazônia
                </p>
              </div>

              {/* Filtros */}
              <div className="mb-8 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar notícias..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-64">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Grid de artigos */}
              <div className="news-grid">
                {filteredArticles.map((article, index) => {
                  const isNew = new Date(article.publish_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Último semana
                  const isTrending = article.views > 100; // Mais de 100 visualizações
                  const isFeatured = article.featured;
                  
                  return (
                    <div 
                      key={article.id}
                      className={`news-card news-card-enter ${isFeatured ? 'featured-card' : ''}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => handleViewArticle(article)}
                    >
                      {article.image && (
                        <div className="news-card-image">
                          <img
                            src={article.image}
                            alt={article.title}
                            loading="lazy"
                          />
                          
                          {/* Indicadores especiais */}
                          {isNew && (
                            <div className="new-article-indicator">
                              ✨ Novo
                            </div>
                          )}
                          {isTrending && !isNew && (
                            <div className="trending-indicator">
                              🔥 Popular
                            </div>
                          )}
                          
                          {isFeatured && (
                            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-idasam-green to-idasam-green-dark" variant="default">
                              ⭐ Destaque
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="news-card-content">
                        <div className="news-card-badges">
                          <Badge 
                            variant="outline" 
                            style={{ 
                              backgroundColor: `${article.category_color}15`, 
                              borderColor: article.category_color,
                              color: article.category_color
                            }}
                          >
                            {article.category_name}
                          </Badge>
                        </div>
                        
                        <h3 className="news-card-title">
                          {article.title}
                        </h3>
                        
                        <p className="news-card-excerpt">
                          {article.excerpt}
                        </p>

                        <div className="news-card-meta">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{article.author_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(article.publish_date)}</span>
                          </div>
                        </div>

                        <div className="news-card-stats">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{article.views || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{article.reaction_counts?.like || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{Math.floor(Math.random() * 10)}</span>
                          </div>
                        </div>

                        {article.tags && article.tags.length > 0 && (
                          <div className="news-card-tags">
                            {article.tags.slice(0, 4).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Preview expandido no hover */}
                      <div className="news-card-preview">
                        <div className="news-card-preview-content">
                          <h4 className="news-card-preview-title">
                            {article.title}
                          </h4>
                          <p className="news-card-preview-text">
                            {article.content.length > 300 
                              ? article.content.substring(0, 300) + '...' 
                              : article.content}
                          </p>
                        </div>
                        
                        <div className="news-card-preview-actions">
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>{Math.ceil(article.content.length / 200)} min de leitura</span>
                            <span>•</span>
                            <span>{article.views || 0} leituras</span>
                          </div>
                          <button className="news-card-preview-button">
                            Ler artigo <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
            </>
          ) : (
            /* Visualização individual do artigo */
            <div className="max-w-4xl mx-auto">
              <Button 
                variant="ghost" 
                onClick={handleBackToList}
                className="mb-6"
              >
                ← Voltar para notícias
              </Button>

              <article className="bg-white rounded-lg shadow-lg overflow-hidden">
                {selectedArticle.image && (
                  <div className="aspect-video relative">
                    <img
                      src={selectedArticle.image}
                      alt={selectedArticle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <Badge 
                      style={{ 
                        backgroundColor: `${selectedArticle.category_color}15`, 
                        borderColor: selectedArticle.category_color,
                        color: selectedArticle.category_color
                      }}
                    >
                      {selectedArticle.category_name}
                    </Badge>
                    {selectedArticle.featured && (
                      <Badge variant="default">Destaque</Badge>
                    )}
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
                    <SocialReactions 
                      articleId={selectedArticle.id} 
                      initialCounts={selectedArticle.reaction_counts} 
                    />
                  </div>

                  <div className="mt-8">
                    <Button
                      onClick={() => setShowComments(!showComments)}
                      variant="outline"
                      className="mb-6"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {showComments ? 'Ocultar' : 'Mostrar'} comentários
                    </Button>

                    {showComments && (
                      <CommentThread articleId={selectedArticle.id} />
                    )}
                  </div>
                </div>
              </article>
            </div>
          )}
        </div>
      </div>

      <ShadcnblocksComFooter2 />
    </div>
  );
}
