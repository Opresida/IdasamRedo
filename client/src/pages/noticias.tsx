import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, Tag, ArrowRight, Search, Filter, Heart, MessageCircle, Globe, Send, ThumbsUp, Share2, Mail } from 'lucide-react';
import SocialReactions, { ReactionStats } from '@/components/social-reactions';
import CommentThread, { organizeCommentsIntoThreads } from '@/components/comment-thread';
import { socialInteractions, type CommentWithThread, type ReactionCounts } from '@/lib/socialInteractions';
import FloatingNavbar from '@/components/floating-navbar';
import WhatsAppFloat from '@/components/whatsapp-float';
import Logos3 from '@/components/logos3';
import ShadcnblocksComFooter2 from '@/components/shadcnblocks-com-footer2';
import OptimizedImage, { HeroImage } from '@/components/optimized-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/supabaseClient';
import { newsCache, cacheHelpers } from '@/lib/newsCache';
import { useAnalyticsAndSEO } from '@/hooks/use-analytics';
import { Badge } from '@/components/ui/badge'; // Import Badge

// Import TTS Audio Player
import TTSAudioPlayer from '@/components/tts-audio-player'; // Assume this component exists

// Tipos para as notícias
interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  image: string;
  tags: string[];
  featured: boolean;
}

interface ArticleStats {
  likes: number;
  views: number;
  comments: CommentWithThread[];
  reaction_counts: ReactionCounts;
  userReactions: string[];
}

// Dados das notícias (fallback se Supabase não estiver disponível)
const fallbackArticles: Article[] = [
  {
    id: '1',
    title: 'IDASAM Lança Novo Projeto de Bioeconomia na Amazônia',
    excerpt: 'Iniciativa inovadora busca conciliar desenvolvimento econômico com preservação ambiental, beneficiando comunidades locais.',
    content: `O Instituto de Desenvolvimento Sustentável da Amazônia (IDASAM) anunciou oficialmente o lançamento de um novo projeto de bioeconomia que promete revolucionar a forma como as comunidades amazônicas se relacionam com os recursos naturais da região.

    O projeto, denominado "Amazônia Sustentável 2025", foi desenvolvido ao longo de dois anos em parceria com universidades renomadas e organizações internacionais. A iniciativa tem como objetivo principal criar cadeias produtivas sustentáveis que gerem renda para as comunidades locais sem comprometer a integridade do ecossistema amazônico.

    "Este projeto representa um marco na nossa missão de promover o desenvolvimento sustentável", afirmou o diretor executivo do IDASAM. "Estamos criando um modelo que pode ser replicado em toda a região amazônica."

    As atividades incluem o cultivo de plantas medicinais, produção de óleos essenciais, manejo florestal comunitário e turismo ecológico. Mais de 500 famílias já foram cadastradas para participar da primeira fase do projeto.`,
    author: 'Equipe IDASAM',
    publishDate: '2024-12-15',
    readTime: '5 min',
    category: 'Bioeconomia',
    image: 'https://i.imgur.com/vVksMXp.jpeg',
    tags: ['sustentabilidade', 'bioeconomia', 'comunidades'],
    featured: true
  },
  {
    id: '2',
    title: 'Tecnologia de Monitoramento Ambiental Ganha Reconhecimento Internacional',
    excerpt: 'Sistema desenvolvido pelo IDASAM para monitorar desmatamento em tempo real recebe prêmio de inovação.',
    content: `O sistema de monitoramento ambiental desenvolvido pelo IDASAM conquistou o primeiro lugar no Prêmio Internacional de Inovação Tecnológica para Conservação, realizado em Genebra, Suíça.

    A tecnologia, que combina inteligência artificial, drones e análise de imagens de satélite, permite detectar atividades de desmatamento em tempo real com precisão de 98%. O sistema já está sendo utilizado em uma área de mais de 10 mil hectares na região do Alto Solimões.

    "Estamos orgulhosos de ver nossa tecnologia reconhecida mundialmente", disse a coordenadora de tecnologia do instituto. "Isso mostra que é possível desenvolver soluções inovadoras na Amazônia para problemas globais."

    O prêmio inclui um financiamento de 500 mil euros para expandir o projeto para outras regiões da Amazônia Legal. A próxima fase prevê a implementação do sistema em parceria com comunidades indígenas e organizações ambientais.`,
    author: 'Maria Silva',
    publishDate: '2024-12-10',
    readTime: '4 min',
    category: 'Tecnologia',
    image: 'https://i.imgur.com/R9rQRGL.jpeg',
    tags: ['tecnologia', 'monitoramento', 'inovação'],
    featured: true
  },
  {
    id: '3',
    title: 'Capacitação em Agricultura Sustentável Beneficia 200 Famílias',
    excerpt: 'Programa de formação técnica ensina práticas agrícolas ecológicas para pequenos produtores rurais.',
    content: `O programa de capacitação em agricultura sustentável do IDASAM concluiu sua terceira turma, beneficiando mais 200 famílias de pequenos produtores rurais em municípios do interior do Amazonas.

    Durante seis meses, os participantes aprenderam técnicas de plantio orgânico, compostagem, manejo integrado de pragas e sistemas agroflorestais. O curso também incluiu módulos sobre empreendedorismo rural e marketing digital.

    "Aprendi técnicas que aumentaram minha produtividade em 40% sem usar agrotóxicos", relatou João Santos, agricultor de Parintins. "Agora consigo vender meus produtos com certificação orgânica e obter melhor preço."

    O programa é financiado por recursos federais e parcerias internacionais. A próxima turma já tem 150 inscritos e começará em fevereiro de 2025.`,
    author: 'Carlos Mendes',
    publishDate: '2024-12-05',
    readTime: '3 min',
    category: 'Capacitação',
    image: 'https://i.imgur.com/5o2gRIQ.jpeg',
    tags: ['agricultura', 'capacitação', 'sustentabilidade'],
    featured: false
  },
  {
    id: '4',
    title: 'Parceria Internacional Fortalece Pesquisa em Biotecnologia',
    excerpt: 'IDASAM firma acordo com universidades europeias para desenvolvimento de pesquisas em biotecnologia amazônica.',
    content: `O IDASAM assinou um acordo de cooperação técnica com três universidades europeias renomadas para desenvolver pesquisas avançadas em biotecnologia utilizando recursos da biodiversidade amazônica.

    O acordo, que terá duração de cinco anos, prevê intercâmbio de pesquisadores, compartilhamento de equipamentos científicos e desenvolvimento conjunto de projetos de pesquisa e desenvolvimento.

    "Esta parceria representa um salto qualitativo em nossa capacidade de pesquisa", explicou o diretor científico do instituto. "Poderemos explorar o potencial biotecnológico da Amazônia com tecnologia de ponta."

    Os primeiros projetos focarão no desenvolvimento de novos medicamentos a partir de plantas medicinais amazônicas e na criação de bioplásticos utilizando resíduos vegetais da região.`,
    author: 'Ana Rodriguez',
    publishDate: '2024-11-28',
    readTime: '4 min',
    category: 'Pesquisa',
    image: 'https://i.imgur.com/i74pvbH.jpeg',
    tags: ['biotecnologia', 'pesquisa', 'parceria'],
    featured: false
  },
  {
    id: '5',
    title: 'Festival de Inovação Amazônica Reúne Empreendedores Regionais',
    excerpt: 'Evento anual promove networking entre startups, investidores e organizações focadas em soluções sustentáveis.',
    content: `O Festival de Inovação Amazônica, organizado pelo IDASAM, reuniu mais de 300 participantes em Manaus para três dias de palestras, workshops e networking focados em empreendedorismo sustentável na região.

    O evento contou com a participação de startups locais, investidores nacionais e internacionais, representantes de grandes corporações e líderes de organizações não-governamentais.

    Durante o festival, foram apresentados 45 projetos inovadores, dos quais 12 receberam investimento inicial totalizando R$ 2,5 milhões. Os projetos contemplados abrangem áreas como biotecnologia, tecnologia limpa e economia circular.

    "O festival mostra que a Amazônia pode ser um polo de inovação mundial", destacou o organizador do evento. "Temos talentos e recursos únicos que podem gerar soluções para desafios globais."`,
    author: 'Pedro Lima',
    publishDate: '2024-11-20',
    readTime: '6 min',
    category: 'Eventos',
    image: 'https://i.imgur.com/vVksMXp.jpeg',
    tags: ['inovação', 'empreendedorismo', 'festival'],
    featured: false
  }
];

const categories = ['Todas', 'Bioeconomia', 'Tecnologia', 'Capacitação', 'Pesquisa', 'Eventos'];

// Componente de Loading Skeleton para os cards de notícias
const NewsCardSkeleton = ({ featured = false }: { featured?: boolean }) => (
  <div className={`bg-white rounded-2xl overflow-hidden shadow-lg ${featured ? 'col-span-1' : ''}`}>
    <div className={`${featured ? 'aspect-video' : 'aspect-video'} bg-gray-200 animate-pulse`}></div>
    <div className="p-6">
      <div className="flex items-center gap-4 mb-3">
        <div className="px-3 py-1 rounded-full bg-gray-200 animate-pulse w-20 h-6"></div>
        <div className="bg-gray-200 animate-pulse w-24 h-6 rounded"></div>
        <div className="bg-gray-200 animate-pulse w-16 h-6 rounded"></div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="bg-gray-200 animate-pulse h-6 rounded w-full"></div>
        <div className="bg-gray-200 animate-pulse h-6 rounded w-4/5"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="bg-gray-200 animate-pulse h-4 rounded w-full"></div>
        <div className="bg-gray-200 animate-pulse h-4 rounded w-3/4"></div>
        <div className="bg-gray-200 animate-pulse h-4 rounded w-1/2"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="bg-gray-200 animate-pulse h-4 rounded w-24"></div>
        <div className="bg-gray-200 animate-pulse h-8 rounded w-20"></div>
      </div>
    </div>
  </div>
);

// Componente para estado vazio
const EmptyNewsState = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
    <div className="text-gray-400 mb-4">
      <Search className="w-16 h-16" />
    </div>
    <h3 className="text-2xl font-bold text-gray-600 mb-2">
      Nenhuma notícia encontrada
    </h3>
    <p className="text-gray-500 text-center max-w-md">
      Não encontramos notícias que correspondam aos seus critérios de busca.
      Tente alterar os filtros ou termos de pesquisa.
    </p>
  </div>
);

export default function NoticiasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articleStats, setArticleStats] = useState<Record<string, ArticleStats>>({});
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [userCommentReactions, setUserCommentReactions] = useState<Record<string, string[]>>({});
  const [userIdentifier] = useState(() => socialInteractions.getUserIdentifier());
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState('pt');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);

  // Estados para paginação
  const [displayedArticles, setDisplayedArticles] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);

  // Estados para newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');

  // Hooks de analytics e SEO
  const {
    trackPageView,
    trackArticleView,
    trackArticleLike,
    trackComment,
    trackShare,
    trackSearch,
    trackNewsletterSignup,
    trackError,
    updateSEO,
    updateArticleSEO
  } = useAnalyticsAndSEO();

  // Inicializar SEO da página
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

  // Carregar artigos do Supabase ou cache
  const loadArticles = async (): Promise<Article[]> => {
    return await cacheHelpers.getOrFetch(
      'articles',
      async () => {
        console.log('🌐 Buscando artigos do Supabase...');

        try {
          // Tentar buscar do Supabase primeiro
          const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('publishDate', { ascending: false });

          if (error) {
            console.warn('⚠️ Erro ao buscar artigos do Supabase:', error);
            console.log('📦 Usando artigos fallback');
            return fallbackArticles;
          }

          if (!data || data.length === 0) {
            console.log('📦 Nenhum artigo encontrado no Supabase, usando fallback');
            return fallbackArticles;
          }

          console.log(`✅ ${data.length} artigos carregados do Supabase`);
          return data;

        } catch (error) {
          console.warn('⚠️ Erro de conexão com Supabase:', error);
          trackError(`Erro ao carregar artigos: ${error}`, 'loadArticles');
          return fallbackArticles;
        }
      },
      (key) => newsCache.getArticles(),
      (key, data) => newsCache.setArticles(data)
    );
  };

  // Filtrar artigos baseado na busca e categoria
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'Todas' || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredArticles = filteredArticles.filter(article => article.featured);
  const regularArticles = filteredArticles.filter(article => !article.featured);
  const paginatedRegularArticles = regularArticles.slice(0, displayedArticles);

  // Função para carregar mais artigos
  const loadMoreArticles = () => {
    if (isLoadingMore || !hasMoreArticles) return;

    setIsLoadingMore(true);

    // Simular carregamento
    setTimeout(() => {
      const newDisplayedCount = displayedArticles + 6;
      setDisplayedArticles(newDisplayedCount);

      if (newDisplayedCount >= regularArticles.length) {
        setHasMoreArticles(false);
      }

      setIsLoadingMore(false);
    }, 1000);
  };

  // Reset paginação quando filtros mudarem
  useEffect(() => {
    setDisplayedArticles(6);
    setHasMoreArticles(regularArticles.length > 6);

    // Rastrear busca se houver termo
    if (searchTerm.trim()) {
      trackSearch(searchTerm, filteredArticles.length);
    }
  }, [searchTerm, selectedCategory, regularArticles.length, filteredArticles.length, trackSearch]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Buscar comentários e estatísticas do artigo no Supabase
  const loadArticleData = async (articleId: string) => {
    return await cacheHelpers.getOrFetch(
      `article_stats_${articleId}`,
      async () => {
        try {
          // Incrementar visualizações usando a função SQL
          const { error: incrementError } = await supabase
            .rpc('increment_article_views', { p_article_id: articleId });

          if (incrementError) {
            console.warn('⚠️ Erro ao incrementar visualizações:', incrementError);
          }

          // Buscar ou criar estatísticas do artigo
          let { data: articleStatsData, error: statsError } = await supabase
            .from('article_stats')
            .select('*')
            .eq('article_id', articleId)
            .single();

          if (statsError && statsError.code === 'PGRST116') {
            // Artigo não existe, criar novo
            const defaultReactionCounts = {
              like: Math.floor(Math.random() * 20) + 5,
              love: Math.floor(Math.random() * 15) + 3,
              clap: Math.floor(Math.random() * 10) + 2,
              wow: Math.floor(Math.random() * 8) + 1,
              sad: Math.floor(Math.random() * 3),
              angry: Math.floor(Math.random() * 2)
            };

            const { data: newStats, error: createError } = await supabase
              .from('article_stats')
              .insert({
                article_id: articleId,
                likes: defaultReactionCounts.like,
                views: Math.floor(Math.random() * 500) + 100,
                reaction_counts: defaultReactionCounts
              })
              .select()
              .single();

            if (createError) {
              console.error('Erro ao criar estatísticas:', createError);
              trackError(`Erro ao criar estatísticas: ${createError.message}`, 'loadArticleData');
              return null;
            }
            articleStatsData = newStats;
          }

          // Buscar comentários com threads organizadas
          const commentsData = await socialInteractions.getCommentsWithThreads(articleId);

          // Buscar reações do usuário para o artigo
          const userArticleReactions = await socialInteractions.getUserArticleReactions(articleId, userIdentifier);

          // Buscar reações do usuário para comentários
          const allCommentIds = getAllCommentIds(commentsData);
          const userCommentsReactions = await socialInteractions.getUserCommentReactions(allCommentIds, userIdentifier);
          setUserCommentReactions(prev => ({ ...prev, ...userCommentsReactions }));

          const result = {
            likes: articleStatsData?.likes || 0,
            views: articleStatsData?.views || 0,
            comments: commentsData,
            reaction_counts: articleStatsData?.reaction_counts || {
              like: 0, love: 0, clap: 0, wow: 0, sad: 0, angry: 0
            },
            userReactions: userArticleReactions
          };

          return result;

        } catch (error) {
          console.error('Erro ao carregar dados do artigo:', error);
          trackError(`Erro geral ao carregar artigo: ${error}`, 'loadArticleData');

          // Retornar dados padrão em caso de erro
          return {
            likes: Math.floor(Math.random() * 50) + 10,
            views: Math.floor(Math.random() * 500) + 100,
            comments: [],
            reaction_counts: { like: 0, love: 0, clap: 0, wow: 0, sad: 0, angry: 0 },
            userReactions: []
          };
        }
      },
      (key) => newsCache.getArticleStats(articleId),
      (key, data) => {
        if (data) {
          newsCache.setArticleStats(articleId, data);
          newsCache.setComments(articleId, data.comments);
        }
      }
    );
  };

  // Alternar reação do artigo
  const handleArticleReactionToggle = async (articleId: string, reactionType: string) => {
    try {
      const wasAdded = await socialInteractions.toggleArticleReaction(articleId, reactionType, userIdentifier);

      // Recarregar dados do artigo
      const updatedData = await loadArticleData(articleId);
      if (updatedData) {
        setArticleStats(prev => ({
          ...prev,
          [articleId]: updatedData
        }));
      }

      // Rastrear evento
      const article = articles.find(a => a.id === articleId);
      if (article) {
        trackArticleLike(articleId, article.title, wasAdded, reactionType);
      }

    } catch (error) {
      console.error('Erro ao alternar reação do artigo:', error);
      trackError(`Erro ao reagir ao artigo: ${error}`, 'handleArticleReactionToggle');
    }
  };

  // Adicionar comentário
  const handleAddComment = async (articleId: string, parentCommentId?: string) => {
    if (!newComment.trim() || !commentAuthor.trim()) return;

    setIsLoading(true);

    try {
      const newCommentData = await socialInteractions.addComment(
        articleId,
        commentAuthor.trim(),
        newComment.trim(),
        parentCommentId
      );

      // Recarregar comentários organizados
      const updatedComments = await socialInteractions.getCommentsWithThreads(articleId);

      // Atualizar estado local
      setArticleStats(prev => ({
        ...prev,
        [articleId]: {
          ...prev[articleId],
          comments: updatedComments
        }
      }));

      // Rastrear evento
      trackComment(articleId, newComment.trim());

      // Limpar formulário
      setNewComment('');
      setCommentAuthor('');

    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      trackError(`Erro ao adicionar comentário: ${error}`, 'handleAddComment');
    } finally {
      setIsLoading(false);
    }
  };

  // Responder a um comentário específico
  const handleReply = async (parentCommentId: string, content: string, author: string) => {
    if (!selectedArticle) return;

    try {
      await socialInteractions.addComment(selectedArticle.id, author, content, parentCommentId);

      // Recarregar comentários
      const updatedComments = await socialInteractions.getCommentsWithThreads(selectedArticle.id);

      setArticleStats(prev => ({
        ...prev,
        [selectedArticle.id]: {
          ...prev[selectedArticle.id],
          comments: updatedComments
        }
      }));

      trackComment(selectedArticle.id, content);

    } catch (error) {
      console.error('Erro ao responder comentário:', error);
      trackError(`Erro ao responder comentário: ${error}`, 'handleReply');
      throw error;
    }
  };

  // Alternar reação do comentário
  const handleCommentReactionToggle = async (commentId: string, reactionType: string) => {
    if (!selectedArticle) return;

    try {
      await socialInteractions.toggleCommentReaction(commentId, reactionType, userIdentifier);

      // Recarregar comentários para refletir as mudanças
      const updatedComments = await socialInteractions.getCommentsWithThreads(selectedArticle.id);

      // Atualizar reações do usuário para comentários
      const allCommentIds = getAllCommentIds(updatedComments);
      const userCommentsReactions = await socialInteractions.getUserCommentReactions(allCommentIds, userIdentifier);
      setUserCommentReactions(userCommentsReactions);

      // Atualizar estado local
      setArticleStats(prev => ({
        ...prev,
        [selectedArticle.id]: {
          ...prev[selectedArticle.id],
          comments: updatedComments
        }
      }));

    } catch (error) {
      console.error('Erro ao alternar reação do comentário:', error);
      trackError(`Erro ao reagir ao comentário: ${error}`, 'handleCommentReactionToggle');
    }
  };

  const getArticleStats = (articleId: string): ArticleStats => {
    return articleStats[articleId] || {
      likes: 0,
      views: 0,
      comments: [],
      reaction_counts: { like: 0, love: 0, clap: 0, wow: 0, sad: 0, angry: 0 },
      userReactions: []
    };
  };

  // Função utilitária para extrair todos os IDs de comentários (incluindo respostas)
  const getAllCommentIds = (comments: CommentWithThread[]): string[] => {
    const ids: string[] = [];

    const extractIds = (commentList: CommentWithThread[]) => {
      commentList.forEach(comment => {
        ids.push(comment.id);
        if (comment.replies && comment.replies.length > 0) {
          extractIds(comment.replies);
        }
      });
    };

    extractIds(comments);
    return ids;
  };

  const translateContent = async (content: string, targetLang: string) => {
    setIsTranslating(true);

    // Simulação de tradução (em um caso real, usaria Google Translate API ou similar)
    const translations: Record<string, Record<string, string>> = {
      'en': {
        'Projeto': 'Project',
        'sustentável': 'sustainable',
        'Amazônia': 'Amazon',
        'desenvolvimento': 'development',
        'comunidades': 'communities',
        'tecnologia': 'technology',
        'inovação': 'innovation'
      },
      'es': {
        'Projeto': 'Proyecto',
        'sustentável': 'sostenible',
        'Amazônia': 'Amazonas',
        'desenvolvimento': 'desarrollo',
        'comunidades': 'comunidades',
        'tecnologia': 'tecnología',
        'inovação': 'innovación'
      },
      'fr': {
        'Projeto': 'Projet',
        'sustentável': 'durable',
        'Amazônia': 'Amazonie',
        'desenvolvimento': 'développement',
        'comunidades': 'communautés',
        'tecnologia': 'technologie',
        'inovação': 'innovation'
      }
    };

    setTimeout(() => {
      if (targetLang === 'pt') {
        setTranslatedContent(content);
      } else {
        let translated = content;
        const langTranslations = translations[targetLang];
        if (langTranslations) {
          Object.entries(langTranslations).forEach(([pt, translation]) => {
            translated = translated.replace(new RegExp(pt, 'gi'), translation);
          });
        }
        setTranslatedContent(translated);
      }
      setIsTranslating(false);
    }, 1500);
  };

  // Funções de compartilhamento
  const shareArticle = (platform: string, article: Article) => {
    const articleUrl = `${window.location.origin}/noticias#${article.id}`;
    const shareText = `${article.title} - IDASAM`;

    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + articleUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(articleUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`
    };

    const url = shareUrls[platform as keyof typeof shareUrls];
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      trackShare(article.id, platform, article.title);
    }
  };

  // Função para newsletter
  const handleNewsletterSubscription = async () => {
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      setSubscriptionMessage('Por favor, insira um email válido.');
      return;
    }

    setIsSubscribing(true);

    try {
      // Em um caso real, aqui você faria uma chamada para sua API ou serviço de newsletter
      // Por exemplo: Mailchimp, SendGrid, ou sua própria tabela no Supabase

      // Simulação de inscrição
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Aqui você poderia salvar no Supabase
      // const { error } = await supabase
      //   .from('newsletter_subscriptions')
      //   .insert({ email: newsletterEmail.trim() });

      trackNewsletterSignup(newsletterEmail.trim());
      setSubscriptionMessage('✅ Inscrição realizada com sucesso! Você receberá nossas novidades.');
      setNewsletterEmail('');

    } catch (error) {
      console.error('Erro ao inscrever na newsletter:', error);
      trackError(`Erro na newsletter: ${error}`, 'handleNewsletterSubscription');
      setSubscriptionMessage('❌ Erro ao realizar inscrição. Tente novamente.');
    } finally {
      setIsSubscribing(false);
      // Limpar mensagem após 5 segundos
      setTimeout(() => setSubscriptionMessage(''), 5000);
    }
  };

  // Carregar artigos inicial
  useEffect(() => {
    const initializeArticles = async () => {
      setIsLoadingNews(true);
      try {
        const loadedArticles = await loadArticles();
        setArticles(loadedArticles);
      } catch (error) {
        console.error('Erro ao inicializar artigos:', error);
        trackError(`Erro ao inicializar: ${error}`, 'initializeArticles');
        setArticles(fallbackArticles);
      } finally {
        setIsLoadingNews(false);
      }
    };

    initializeArticles();
  }, []);

  // Carregar dados quando selecionar um artigo
  useEffect(() => {
    if (selectedArticle) {
      setIsLoadingComments(true);

      // Atualizar SEO do artigo
      updateArticleSEO(selectedArticle);

      // Rastrear visualização
      trackArticleView(selectedArticle.id, selectedArticle.title);

      // Carregar dados
      loadArticleData(selectedArticle.id).then((data) => {
        if (data) {
          setArticleStats(prev => ({
            ...prev,
            [selectedArticle.id]: data
          }));
        }
        setIsLoadingComments(false);
      });
    }
  }, [selectedArticle, updateArticleSEO, trackArticleView]);

  // Hook para scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 // Carrega quando está a 1000px do final
      ) {
        loadMoreArticles();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayedArticles, isLoadingMore, hasMoreArticles]);

  return (
    <div className="min-h-screen bg-idasam-bg font-inter">
      <FloatingNavbar />
      <WhatsAppFloat />

      {/* Hero Section */}
      <section
        className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden bg-cover bg-center"
        style={{backgroundImage: "url('https://i.imgur.com/SUSPfjl.jpeg')"}}
      >
        {/* Overlay com máscara preta */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10 text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-montserrat animate-fade-in-up">
            Notícias
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90 animate-fade-in-up animation-delay-200">
            Acompanhe as últimas novidades e conquistas do IDASAM na transformação sustentável da Amazônia.
          </p>
        </div>
      </section>

      {/* Filtros e Busca */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar notícias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Filter className="text-gray-600 w-5 h-5" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoria" />
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
        </div>
      </section>

      {/* Artigos em Destaque */}
      {(isLoadingNews || featuredArticles.length > 0) && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-idasam-text-main mb-12 text-center">
              Destaques
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {isLoadingNews ? (
                <>
                  <NewsCardSkeleton featured />
                  <NewsCardSkeleton featured />
                </>
              ) : (
                featuredArticles.slice(0, 2).map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="aspect-video overflow-hidden">
                    <OptimizedImage
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      priority={true}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        article.category === 'Bioeconomia' ? 'bg-idasam-green-medium/10 text-idasam-green-dark' :
                        article.category === 'Tecnologia' ? 'bg-blue-100 text-blue-700' :
                        article.category === 'Capacitação' ? 'bg-purple-100 text-purple-700' :
                        article.category === 'Pesquisa' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {article.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(article.publishDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {article.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-idasam-text-main mb-3 group-hover:text-idasam-green-dark transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        {article.author}
                      </span>
                      <Button variant="ghost" size="sm" className="text-idasam-green-dark hover:text-idasam-green-medium">
                        Ler mais
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Todas as Notícias */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-idasam-text-main mb-12 text-center">
            Todas as Notícias
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoadingNews ? (
              // Loading skeletons
              <>
                <NewsCardSkeleton />
                <NewsCardSkeleton />
                <NewsCardSkeleton />
                <NewsCardSkeleton />
                <NewsCardSkeleton />
                <NewsCardSkeleton />
              </>
            ) : paginatedRegularArticles.length === 0 && filteredArticles.length === 0 ? (
              // Estado vazio
              <EmptyNewsState />
            ) : (
              paginatedRegularArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="aspect-video overflow-hidden">
                  <OptimizedImage
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      article.category === 'Bioeconomia' ? 'bg-idasam-green-medium/10 text-idasam-green-dark' :
                      article.category === 'Tecnologia' ? 'bg-blue-100 text-blue-700' :
                      article.category === 'Capacitação' ? 'bg-purple-100 text-purple-700' :
                      article.category === 'Pesquisa' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-idasam-text-main mb-3 group-hover:text-idasam-green-dark transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatDate(article.publishDate)}
                    </span>
                    <Button variant="ghost" size="sm" className="text-idasam-green-dark hover:text-idasam-green-medium">
                      Ler mais
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </article>
            ))
            )}
          </div>

          {/* Loading de mais artigos e botão carregar mais */}
          {paginatedRegularArticles.length > 0 && (
            <div className="flex flex-col items-center mt-12">
              {isLoadingMore && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-idasam-green-dark"></div>
                  <span className="text-gray-600">Carregando mais artigos...</span>
                </div>
              )}

              {hasMoreArticles && !isLoadingMore && (
                <Button
                  onClick={loadMoreArticles}
                  className="bg-idasam-green-dark hover:bg-idasam-green-medium text-white px-8 py-3 rounded-full transition-colors"
                >
                  Carregar Mais Artigos
                </Button>
              )}

              {!hasMoreArticles && paginatedRegularArticles.length > 6 && (
                <p className="text-gray-500 text-sm">
                  Você viu todos os {regularArticles.length} artigos disponíveis
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modal do Artigo */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-5xl min-h-[90vh] sm:max-h-[90vh] sm:overflow-y-auto mt-4 sm:mt-8 mb-4">
            <div className="relative">
              <HeroImage
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-t-xl sm:rounded-t-2xl"
              />
              <button
                onClick={() => {
                  setSelectedArticle(null);
                  setTranslatedContent('');
                  setSelectedLanguage('pt');
                }}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors z-10"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-4">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                  selectedArticle.category === 'Bioeconomia' ? 'bg-idasam-green-medium/10 text-idasam-green-dark' :
                  selectedArticle.category === 'Tecnologia' ? 'bg-blue-100 text-blue-700' :
                  selectedArticle.category === 'Capacitação' ? 'bg-purple-100 text-purple-700' :
                  selectedArticle.category === 'Pesquisa' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedArticle.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{formatDate(selectedArticle.publishDate)}</span>
                  <span className="sm:hidden">{formatDate(selectedArticle.publishDate).split(' ').slice(0, 2).join(' ')}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  {selectedArticle.readTime}
                </span>
                <span className="hidden md:flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {selectedArticle.author}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-idasam-text-main mb-4 sm:mb-6 leading-tight">
                {selectedArticle.title}
              </h1>

              {/* Barra de Ações */}
              <div className="flex flex-col gap-4 mb-6 pb-4 border-b">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    {/* Reações Sociais */}
                    <SocialReactions
                      targetId={selectedArticle.id}
                      targetType="article"
                      reactions={getArticleStats(selectedArticle.id).reaction_counts}
                      userReactions={getArticleStats(selectedArticle.id).userReactions}
                      onReactionToggle={(reactionType) => handleArticleReactionToggle(selectedArticle.id, reactionType)}
                      size="md"
                    />

                    {/* Comentários */}
                    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm">
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>{getArticleStats(selectedArticle.id).comments.length}</span>
                    </div>

                    {/* Visualizações */}
                    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm">
                      <span>👁️</span>
                      <span>{getArticleStats(selectedArticle.id).views || 0}</span>
                    </div>
                  </div>

                  {/* Tradução */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <select
                      value={selectedLanguage}
                      onChange={(e) => {
                        setSelectedLanguage(e.target.value);
                        translateContent(selectedArticle.content, e.target.value);
                      }}
                      className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-idasam-green-dark text-sm flex-1 sm:flex-initial"
                    >
                      <option value="pt">Português</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                </div>

                {/* Botões de Compartilhamento */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Compartilhar:</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => shareArticle('whatsapp', selectedArticle)}
                      className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                    >
                      <span className="text-base">📱</span>
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                    <button
                      onClick={() => shareArticle('facebook', selectedArticle)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <span className="text-base">📘</span>
                      <span className="hidden sm:inline">Facebook</span>
                    </button>
                    <button
                      onClick={() => shareArticle('twitter', selectedArticle)}
                      className="flex items-center gap-2 px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-sm"
                    >
                      <span className="text-base">🐦</span>
                      <span className="hidden sm:inline">Twitter</span>
                    </button>
                    <button
                      onClick={() => shareArticle('linkedin', selectedArticle)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors text-sm"
                    >
                      <span className="text-base">💼</span>
                      <span className="hidden sm:inline">LinkedIn</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Conteúdo do Artigo */}
              <div className="prose prose-lg max-w-none mb-8">
                {isTranslating ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-idasam-green-dark"></div>
                    <span className="ml-3 text-gray-600">Traduzindo...</span>
                  </div>
                ) : (
                  (translatedContent || selectedArticle.content).split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-700 leading-relaxed mb-4">
                      {paragraph.trim()}
                    </p>
                  ))
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedArticle.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-idasam-green-dark/10 text-idasam-green-dark rounded-full text-sm flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Estatísticas das Reações */}
              <ReactionStats
                reactions={getArticleStats(selectedArticle.id).reaction_counts}
                className="mb-8 pb-6 border-b border-gray-100"
              />

              {/* Seção de Comentários */}
              <div className="border-t pt-6 sm:pt-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-idasam-text-main mb-4 sm:mb-6 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  Comentários ({isLoadingComments ? '...' : getArticleStats(selectedArticle.id).comments.length})
                </h3>

                {/* Formulário de Comentário */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <Input
                      placeholder="Seu nome"
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      className="border-gray-300 text-sm sm:text-base"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Escreva seu comentário..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 border-gray-300 text-sm sm:text-base"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment(selectedArticle.id);
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleAddComment(selectedArticle.id)}
                      className="bg-idasam-green-dark hover:bg-idasam-green-medium px-3 sm:px-4 whitespace-nowrap"
                      disabled={!newComment.trim() || !commentAuthor.trim() || isLoading}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Send className="w-4 h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Enviar</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Lista de Comentários com Threads */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {isLoadingComments ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="bg-gray-200 animate-pulse h-4 rounded w-24"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="bg-gray-200 animate-pulse h-4 rounded w-full"></div>
                            <div className="bg-gray-200 animate-pulse h-4 rounded w-3/4"></div>
                          </div>
                          <div className="bg-gray-200 animate-pulse h-6 rounded w-16 mt-3"></div>
                        </div>
                      ))}
                    </div>
                  ) : getArticleStats(selectedArticle.id).comments.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium mb-2">
                        Nenhum comentário ainda
                      </p>
                      <p className="text-gray-400 text-sm">
                        Seja o primeiro a comentar nesta notícia!
                      </p>
                    </div>
                  ) : (
                    getArticleStats(selectedArticle.id).comments.map((comment) => (
                      <CommentThread
                        key={comment.id}
                        comment={comment}
                        articleId={selectedArticle.id}
                        userReactions={userCommentReactions}
                        onReply={handleReply}
                        onReactionToggle={handleCommentReactionToggle}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seção de Newsletter */}
      <section className="py-16 bg-gradient-to-br from-idasam-green-dark to-idasam-green-medium">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 sm:p-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-montserrat">
              📧 Newsletter IDASAM
            </h2>

            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Mantenha-se atualizado com as últimas novidades, projetos e conquistas do IDASAM.
              Receba conteúdo exclusivo diretamente em seu email!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-6">
              <Input
                type="email"
                placeholder="Digite seu melhor email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-white border-0 focus:ring-2 focus:ring-white/50 placeholder:text-gray-500"
                disabled={isSubscribing}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleNewsletterSubscription();
                  }
                }}
              />
              <Button
                onClick={handleNewsletterSubscription}
                disabled={isSubscribing || !newsletterEmail.trim()}
                className="px-6 py-3 bg-white text-idasam-green-dark hover:bg-gray-100 font-medium whitespace-nowrap transition-all disabled:opacity-50"
              >
                {isSubscribing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-idasam-green-dark mr-2"></div>
                    Inscrevendo...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Inscrever-se
                  </>
                )}
              </Button>
            </div>

            {subscriptionMessage && (
              <div className={`text-sm px-4 py-2 rounded-lg inline-block ${
                subscriptionMessage.includes('✅')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {subscriptionMessage}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm mt-8">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white/60 rounded-full"></span>
                Conteúdo exclusivo
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white/60 rounded-full"></span>
                Sem spam
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white/60 rounded-full"></span>
                Cancele quando quiser
              </div>
            </div>
          </div>
        </div>
      </section>

      <Logos3 />
      <ShadcnblocksComFooter2 />
    </div>
  );
}