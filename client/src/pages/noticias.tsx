
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  Clock,
  User,
  Search,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  Tag,
  TrendingUp,
  Newspaper,
  ArrowRight,
  Leaf,
  Star,
  Users,
  MapPin,
  GraduationCap,
  Store,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAnalytics } from '@/hooks/use-analytics';
import CommentThread from '@/components/comment-thread';
import SocialReactions from '@/components/social-reactions';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  categoryId?: string | null;
  categoryName?: string | null;
  tags?: string[] | null;
  readingTime: number;
  views: number;
  published: string;
  featured: string;
}

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  Bioeconomia: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Tecnologia: 'bg-blue-100 text-blue-800 border-blue-200',
  Educação: 'bg-purple-100 text-purple-800 border-purple-200',
  Sustentabilidade: 'bg-green-100 text-green-800 border-green-200',
  Pesquisa: 'bg-amber-100 text-amber-800 border-amber-200',
};

function getAnonymousUserId(): string {
  let userId = localStorage.getItem('anonymous_user_id');
  if (!userId) {
    userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('anonymous_user_id', userId);
  }
  return userId;
}

function useIntersectionObserver(options?: IntersectionObserverInit) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, isVisible } = useIntersectionObserver();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    >
      {children}
    </div>
  );
}

function useCountUp(target: number, suffix: string, duration = 1600) {
  const [display, setDisplay] = useState(`0${suffix}`);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplay(`${target}${suffix}`);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(ease * target);
            setDisplay(`${current}${suffix}`);
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, suffix, duration]);

  return { display, ref };
}

function StatCard({
  value,
  suffix,
  label,
  Icon,
  isLast,
}: {
  value: number;
  suffix: string;
  label: string;
  Icon: React.ElementType;
  isLast: boolean;
}) {
  const { display, ref } = useCountUp(value, suffix);
  return (
    <div
      ref={ref}
      className={`flex-1 flex flex-col items-center justify-center text-center px-6 py-10 md:py-12 ${
        !isLast ? 'border-b md:border-b-0 md:border-r border-white/15' : ''
      }`}
    >
      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-5 ring-1 ring-white/20">
        <Icon className="w-7 h-7 text-amber-400" />
      </div>
      <div className="text-5xl font-extrabold text-amber-400 tracking-tight leading-none mb-3">
        {display}
      </div>
      <div className="text-sm text-white/65 font-medium tracking-widest uppercase">
        {label}
      </div>
    </div>
  );
}

function ArticleCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-48" />
      <CardContent className="p-6">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <div className="flex justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function NoticiasPage() {
  const { trackEvent, trackPageView } = useAnalytics();
  const { toast } = useToast();

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({});
  const deepLinkHandled = useRef(false);
  const routeParams = useParams<{ id?: string }>();

  const { data: articles = [], isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/article-categories'],
  });

  const { data: articleReactions, refetch: refetchReactions } = useQuery<{ counts: Record<string, number>; userReactions: string[] }>({
    queryKey: ['/api/articles', selectedArticle?.id, 'reactions'],
    queryFn: async () => {
      if (!selectedArticle) return { counts: {}, userReactions: [] };
      const userId = getAnonymousUserId();
      const res = await fetch(`/api/articles/${selectedArticle.id}/reactions?userId=${userId}`);
      if (!res.ok) return { counts: {}, userReactions: [] };
      return res.json();
    },
    enabled: !!selectedArticle,
  });

  const incrementViewsMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/articles/${id}/views`, { method: 'POST' }).then(r => r.json()),
  });

  const toggleReactionMutation = useMutation({
    mutationFn: async ({ articleId, reactionType }: { articleId: string; reactionType: string }) => {
      const userId = getAnonymousUserId();
      const res = await fetch(`/api/articles/${articleId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType, anonymousUserId: userId }),
      });
      return res.json();
    },
    onSuccess: () => {
      refetchReactions();
    },
  });

  useEffect(() => {
    trackPageView('/noticias', 'Notícias IDASAM');
  }, [trackPageView]);

  useEffect(() => {
    if (!deepLinkHandled.current && articles.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const artigoId = params.get('artigo') || routeParams?.id;
      if (artigoId) {
        const found = articles.find((a: Article) => a.id === artigoId);
        if (found) {
          deepLinkHandled.current = true;
          handleArticleClick(found);
        }
      }
    }
  }, [articles, routeParams?.id]);

  const publishedArticles = articles.filter(a => a.published === 'true');

  const filteredArticles = publishedArticles
    .filter(article => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.content && article.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        article.authorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || article.categoryId === selectedCategory || article.categoryName === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular': return b.views - a.views;
        case 'recent':
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const featuredArticle = publishedArticles.find(a => a.featured === 'true') || publishedArticles[0];
  const recentArticles = filteredArticles.filter(a => a.id !== featuredArticle?.id).slice(0, 9);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    incrementViewsMutation.mutate(article.id);
    trackEvent('article_view', { category: 'content', action: 'article_open', label: article.title });
    const url = new URL(window.location.href);
    url.searchParams.set('artigo', article.id);
    window.history.replaceState({}, '', url.toString());
  };

  const handleArticleClose = () => {
    setSelectedArticle(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('artigo');
    window.history.replaceState({}, '', url.toString());
  };

  const handleShare = async (article: Article) => {
    const url = `${window.location.origin}/noticias?artigo=${article.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.title,
          url,
        });
      } catch (e) {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Link copiado!', description: 'Link do artigo copiado para a área de transferência' });
      } catch (e) {
        toast({ title: 'Erro', description: 'Não foi possível copiar o link', variant: 'destructive' });
      }
    }
  };

  const handleReactionToggle = async (reactionType: string) => {
    if (!selectedArticle) return;
    await toggleReactionMutation.mutateAsync({ articleId: selectedArticle.id, reactionType });
  };

  const getCategoryColor = (categoryName?: string | null) => {
    if (!categoryName) return 'bg-gray-100 text-gray-700 border-gray-200';
    return CATEGORY_COLORS[categoryName] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const impactStats = [
    { value: 500, suffix: '+', label: 'Famílias beneficiadas', Icon: Users },
    { value: 12, suffix: '', label: 'Comunidades atendidas', Icon: MapPin },
    { value: 150, suffix: '', label: 'Jovens capacitados', Icon: GraduationCap },
    { value: 25, suffix: '', label: 'Microempresas apoiadas', Icon: Store },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <div
        className="relative h-[300px] sm:h-[420px] md:h-[600px] bg-cover bg-center flex items-end"
        style={{ backgroundImage: "linear-gradient(to bottom, rgba(42,91,70,0.3) 0%, rgba(42,91,70,0.85) 100%), url('https://i.imgur.com/9FFKkFD.jpeg')" }}
      >
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-400/90 text-amber-900 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Newspaper className="w-4 h-4" />
              Central de Notícias IDASAM
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Histórias que <span className="text-amber-400">transformam</span> a Amazônia
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
              Acompanhe as iniciativas que estão construindo um futuro sustentável para comunidades ribeirinhas e para a maior floresta tropical do mundo.
            </p>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar notícias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/95 border-0 shadow-lg rounded-xl h-12"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="bg-[#2A5B46]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row">
            {impactStats.map((stat, i) => (
              <StatCard
                key={i}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                Icon={stat.Icon}
                isLast={i === impactStats.length - 1}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-10 items-center">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'bg-[#2A5B46] hover:bg-[#2A5B46]/90' : ''}
          >
            Todas
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id ? 'bg-[#2A5B46] hover:bg-[#2A5B46]/90' : ''}
            >
              {cat.name}
            </Button>
          ))}
          <div className="ml-auto flex gap-2">
            <Button
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('recent')}
              className={sortBy === 'recent' ? 'bg-[#2A5B46] hover:bg-[#2A5B46]/90' : ''}
            >
              <Calendar className="w-3 h-3 mr-1" />Recentes
            </Button>
            <Button
              variant={sortBy === 'popular' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('popular')}
              className={sortBy === 'popular' ? 'bg-[#2A5B46] hover:bg-[#2A5B46]/90' : ''}
            >
              <TrendingUp className="w-3 h-3 mr-1" />Populares
            </Button>
          </div>
        </div>

        {/* Featured Article */}
        {!articlesLoading && featuredArticle && selectedCategory === 'all' && !searchTerm && (
          <AnimatedCard>
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">Em Destaque</span>
              </div>
              <div
                className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300"
                onClick={() => handleArticleClick(featuredArticle)}
              >
                <div className="flex flex-col md:flex-row">
                  {featuredArticle.image && (
                    <div className="md:w-1/2 h-64 md:h-auto overflow-hidden">
                      <img
                        src={featuredArticle.image}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className={`${featuredArticle.image ? 'md:w-1/2' : 'w-full'} p-8 md:p-10 bg-gradient-to-br from-[#2A5B46] to-[#1e4433] flex flex-col justify-center`}>
                    {featuredArticle.categoryName && (
                      <Badge className="w-fit mb-4 bg-amber-400 text-amber-900 border-0">
                        {featuredArticle.categoryName}
                      </Badge>
                    )}
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight group-hover:text-amber-300 transition-colors">
                      {featuredArticle.title}
                    </h2>
                    {featuredArticle.excerpt && (
                      <p className="text-white/80 mb-6 line-clamp-3 text-base leading-relaxed">{featuredArticle.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-white/70 text-sm mb-6">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{featuredArticle.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{featuredArticle.readingTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{featuredArticle.views}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-amber-400 font-medium group-hover:gap-3 transition-all">
                      Ler matéria completa <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        )}

        {/* Per-Category Sections (visible only when no filter/search active) */}
        {!articlesLoading && !searchTerm && selectedCategory === 'all' && categories.length > 0 && (
          <>
            {categories.map((cat) => {
              const catArticles = publishedArticles
                .filter(a => a.categoryId === cat.id || a.categoryName === cat.name)
                .slice(0, 3);
              if (catArticles.length === 0) return null;
              return (
                <AnimatedCard key={cat.id}>
                  <div className="mb-12">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Badge className={`${getCategoryColor(cat.name)} border text-xs font-semibold px-2 py-1`}>
                          {cat.name}
                        </Badge>
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#2A5B46] hover:text-[#2A5B46] hover:bg-[#2A5B46]/5 flex items-center gap-1 text-sm"
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        Ver todos <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {catArticles.map((article, idx) => (
                        <Card
                          key={article.id}
                          className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-gray-100 rounded-xl"
                          onClick={() => handleArticleClick(article)}
                        >
                          {article.image && (
                            <div className="relative overflow-hidden h-36">
                              <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                          )}
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(article.createdAt)}</span>
                              <span>•</span>
                              <Clock className="w-3 h-3" />
                              <span>{article.readingTime} min</span>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#2A5B46] transition-colors line-clamp-2 leading-snug mb-2">
                              {article.title}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Eye className="w-3 h-3" />
                              <span>{article.views} visualizações</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </AnimatedCard>
              );
            })}
          </>
        )}

        {/* Loading Skeleton */}
        {articlesLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} />)}
          </div>
        )}

        {/* Articles Grid */}
        {!articlesLoading && (
          <>
            {recentArticles.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Newspaper className="w-6 h-6 text-[#2A5B46]" />
                  {searchTerm || selectedCategory !== 'all' ? 'Resultados' : 'Todas as Notícias'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recentArticles.map((article, index) => (
                    <AnimatedCard key={article.id} delay={index * 80}>
                      <Card
                        className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-gray-100 rounded-2xl h-full"
                        onClick={() => handleArticleClick(article)}
                      >
                        {article.image && (
                          <div className="relative overflow-hidden h-52">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            {article.categoryName && (
                              <div className="absolute top-4 left-4">
                                <Badge className={`${getCategoryColor(article.categoryName)} border text-xs font-medium`}>
                                  {article.categoryName}
                                </Badge>
                              </div>
                            )}
                          </div>
                        )}
                        <CardContent className="p-6">
                          {!article.image && article.categoryName && (
                            <Badge className={`${getCategoryColor(article.categoryName)} border text-xs font-medium mb-3`}>
                              {article.categoryName}
                            </Badge>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(article.createdAt)}</span>
                            <span>•</span>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{article.readingTime} min</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#2A5B46] transition-colors line-clamp-2 leading-snug">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">{article.excerpt}</p>
                          )}
                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#2A5B46]/10 flex items-center justify-center text-[#2A5B46] font-bold text-xs">
                                {article.authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <span className="text-sm font-medium text-gray-700 truncate max-w-[100px]">{article.authorName}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{article.views}</span>
                              </div>
                            </div>
                          </div>
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {article.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs py-0 border-gray-200 text-gray-500">
                                  <Tag className="w-2.5 h-2.5 mr-1" />{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </AnimatedCard>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!articlesLoading && filteredArticles.length === 0 && (
          <div className="text-center py-24">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma notícia encontrada</h3>
            <p className="text-gray-500 mb-4">Tente ajustar seus filtros de busca</p>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
              Limpar filtros
            </Button>
          </div>
        )}

        {/* Testimonial / Impact Section */}
        {!searchTerm && selectedCategory === 'all' && (
          <AnimatedCard>
            <div className="mt-16 rounded-2xl overflow-hidden bg-gradient-to-r from-[#2A5B46] to-[#3a7a5f] p-8 md:p-12 text-white">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Leaf className="w-4 h-4 text-amber-400" />
                  <span>Depoimento de impacto</span>
                </div>
                <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-6 text-white/95">
                  "O IDASAM mudou a vida da nossa comunidade. Hoje temos acesso a tecnologia, capacitação e, principalmente, esperança de um futuro melhor para nossos filhos."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">MA</div>
                  <div>
                    <div className="font-semibold">Maria Aparecida</div>
                    <div className="text-white/70 text-sm">Comunidade Ribeirinha do Alto Solimões</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        )}
      </div>

      {/* Article Modal */}
      <Dialog open={selectedArticle !== null} onOpenChange={(open) => { if (!open) handleArticleClose(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <div className="space-y-4">
                  {selectedArticle.image && (
                    <img
                      src={selectedArticle.image}
                      alt={selectedArticle.title}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedArticle.categoryName && (
                      <Badge className={`${getCategoryColor(selectedArticle.categoryName)} border`}>
                        {selectedArticle.categoryName}
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">{formatDate(selectedArticle.createdAt)}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">{selectedArticle.readingTime} min de leitura</span>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{selectedArticle.views} visualizações</span>
                    </div>
                  </div>
                  <DialogTitle className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {selectedArticle.title}
                  </DialogTitle>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                {selectedArticle.excerpt && (
                  <p className="text-lg text-gray-600 border-l-4 border-[#2A5B46] pl-4 font-medium leading-relaxed">
                    {selectedArticle.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-[#2A5B46]/10 flex items-center justify-center text-[#2A5B46] font-bold text-sm">
                    {selectedArticle.authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{selectedArticle.authorName}</div>
                    <div className="text-sm text-gray-500">Autor</div>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none prose-headings:text-[#2A5B46] prose-a:text-[#2A5B46]">
                  {selectedArticle.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>
                  ))}
                </div>

                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    {selectedArticle.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-[#2A5B46]/20 text-[#2A5B46]">
                        <Tag className="w-3 h-3 mr-1" />{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Social Reactions */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Como você se sentiu com essa notícia?</h4>
                  <div className="flex items-center justify-between">
                    <SocialReactions
                      targetId={selectedArticle.id}
                      targetType="article"
                      reactions={articleReactions?.counts || {}}
                      userReactions={articleReactions?.userReactions || []}
                      onReactionToggle={handleReactionToggle}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(selectedArticle)}
                      className="flex items-center gap-2 border-[#2A5B46]/20 text-[#2A5B46] hover:bg-[#2A5B46]/5"
                    >
                      <Share2 className="w-4 h-4" />
                      Compartilhar
                    </Button>
                  </div>
                </div>

                {/* Comment Thread */}
                <div className="pt-4 border-t border-gray-100">
                  <CommentThread articleId={selectedArticle.id} articleTitle={selectedArticle.title} />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
