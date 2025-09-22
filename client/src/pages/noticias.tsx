
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  Tag,
  TrendingUp,
  Newspaper,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAnalytics } from '@/hooks/use-analytics';
import CommentThread from '@/components/comment-thread';
import SocialReactions from '@/components/social-reactions';

// Interfaces
interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image?: string;
  publish_date: string;
  author: string;
  category: string;
  tags: string[];
  reading_time: number;
  views: number;
  likes: number;
  published: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

// Dados mocados para desenvolvimento
const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Bioeconomia', slug: 'bioeconomia', color: 'bg-green-100 text-green-800' },
  { id: '2', name: 'Tecnologia', slug: 'tecnologia', color: 'bg-blue-100 text-blue-800' },
  { id: '3', name: 'Educação', slug: 'educacao', color: 'bg-purple-100 text-purple-800' },
  { id: '4', name: 'Sustentabilidade', slug: 'sustentabilidade', color: 'bg-emerald-100 text-emerald-800' },
  { id: '5', name: 'Pesquisa', slug: 'pesquisa', color: 'bg-orange-100 text-orange-800' },
];

const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'IDASAM Lança Revolucionário Projeto de Bioeconomia Circular na Amazônia',
    excerpt: 'Iniciativa inovadora promete transformar resíduos florestais em produtos de alto valor agregado, gerando renda sustentável para comunidades tradicionais.',
    content: `O Instituto de Desenvolvimento Sustentável da Amazônia (IDASAM) anunciou hoje o lançamento de seu mais ambicioso projeto até o momento: a implementação de um sistema de bioeconomia circular que transformará resíduos florestais em produtos de alto valor agregado.

O projeto, desenvolvido em parceria com universidades nacionais e internacionais, utilizará tecnologias avançadas de biotecnologia para converter biomassa residual da floresta amazônica em bioprodutos como bioplásticos, cosméticos naturais e compostos farmacêuticos.

"Esta iniciativa representa um marco na nossa missão de conciliar conservação ambiental com desenvolvimento econômico", explicou a Dra. Maria Silva, diretora científica do IDASAM. "Estamos criando uma nova economia baseada na floresta em pé."

O projeto beneficiará diretamente mais de 500 famílias em 12 comunidades ribeirinhas, oferecendo capacitação técnica e oportunidades de trabalho sustentável. A expectativa é gerar uma renda média adicional de R$ 800 por família mensalmente.

A primeira fase do projeto será implementada na região do Alto Solimões, com previsão de expansão para outras áreas da Amazônia brasileira nos próximos dois anos.`,
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    publish_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Dr. Maria Silva',
    category: 'Bioeconomia',
    tags: ['bioeconomia', 'sustentabilidade', 'amazônia', 'comunidades'],
    reading_time: 5,
    views: 1247,
    likes: 89,
    published: true
  },
  {
    id: '2',
    title: 'Tecnologia Verde: IDASAM Desenvolve Sistema de Monitoramento Florestal por IA',
    excerpt: 'Inovador sistema utiliza inteligência artificial e sensores IoT para detectar desmatamento e queimadas em tempo real.',
    content: `O IDASAM apresentou seu mais recente desenvolvimento tecnológico: um sistema integrado de monitoramento florestal que combina inteligência artificial, sensores IoT e imagens de satélite para detectar atividades de desmatamento e queimadas em tempo real.

O sistema, batizado de "GuardianForest", utiliza algoritmos de machine learning treinados com mais de 10 anos de dados florestais para identificar padrões anômalos na cobertura vegetal com precisão superior a 95%.

"Nossa tecnologia pode identificar uma área desmatada de apenas 0,1 hectare em menos de 2 horas", explica o engenheiro João Santos, líder da equipe de desenvolvimento. "Isso representa um avanço significativo na proteção florestal."

O GuardianForest já está sendo testado em uma área de 50.000 hectares na região de Tefé, com resultados promissores. O sistema enviou mais de 200 alertas precisos nos últimos três meses, permitindo ação rápida das autoridades competentes.

A tecnologia será disponibilizada gratuitamente para órgãos de fiscalização ambiental e comunidades indígenas interessadas em monitorar seus territórios.`,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2025&q=80',
    publish_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Eng. João Santos',
    category: 'Tecnologia',
    tags: ['tecnologia', 'monitoramento', 'ia', 'floresta'],
    reading_time: 4,
    views: 892,
    likes: 67,
    published: true
  },
  {
    id: '3',
    title: 'Educação Transformadora: Programa de Capacitação Técnica Forma 150 Jovens',
    excerpt: 'Iniciativa do IDASAM capacita jovens amazônicos em tecnologias sustentáveis e empreendedorismo verde.',
    content: `O programa "Jovens Amazônicos do Futuro", desenvolvido pelo IDASAM, celebra a formatura de sua terceira turma, totalizando 150 jovens capacitados em tecnologias sustentáveis e empreendedorismo verde nos últimos 18 meses.

O programa oferece formação técnica em áreas como aquicultura sustentável, manejo florestal, energias renováveis e biotecnologia aplicada. Os participantes, com idades entre 16 e 25 anos, recebem bolsa de estudos e acompanhamento pedagógico personalizado.

"Ver esses jovens desenvolvendo projetos inovadores e criando suas próprias empresas sustentáveis é extremamente gratificante", comenta Ana Costa, coordenadora do programa. "Eles são o futuro da Amazônia."

Entre os destaques desta turma está o projeto de aquaponia desenvolvido por cinco formandos, que já produz 200kg de peixes e 150kg de hortaliças mensalmente, gerando renda para suas famílias.

O programa conta com parcerias estratégicas com empresas locais para garantir estágios e oportunidades de emprego aos formandos. A taxa de empregabilidade dos egressos supera 85%.

As inscrições para a próxima turma serão abertas em março de 2024, com 60 vagas disponíveis.`,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    publish_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Ana Costa',
    category: 'Educação',
    tags: ['educação', 'jovens', 'capacitação', 'sustentabilidade'],
    reading_time: 3,
    views: 634,
    likes: 45,
    published: true
  },
  {
    id: '4',
    title: 'Parceria Internacional: IDASAM e Universidade de Oxford Desenvolvem Pesquisa Pioneira',
    excerpt: 'Colaboração científica resultará em banco de dados genético da biodiversidade amazônica.',
    content: `O IDASAM firmou parceria estratégica com a Universidade de Oxford para desenvolvimento de pesquisa pioneira sobre a biodiversidade amazônica. O projeto, com duração de cinco anos, criará o maior banco de dados genético da flora e fauna amazônica já desenvolvido.

A pesquisa utilizará técnicas de sequenciamento genético de última geração para catalogar e preservar digitalmente o patrimônio genético de espécies amazônicas, muitas delas ainda não catalogadas pela ciência.

"Esta parceria representa uma oportunidade única de preservar o conhecimento genético da Amazônia para as futuras gerações", destaca o Dr. Carlos Mendes, coordenador científico do projeto. "Estamos literalmente decodificando os segredos da floresta."

O banco de dados será disponibilizado gratuitamente para a comunidade científica mundial e incluirá informações sobre mais de 10.000 espécies. O projeto também prevê a capacitação de 50 pesquisadores brasileiros nas técnicas mais avançadas de biologia molecular.

A primeira fase da pesquisa, já em andamento, foca na catalogação de plantas medicinais utilizadas por comunidades tradicionais, visando identificar compostos com potencial farmacêutico.

Os resultados preliminares serão apresentados no Congresso Mundial de Biodiversidade em dezembro de 2024.`,
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    publish_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Dr. Carlos Mendes',
    category: 'Pesquisa',
    tags: ['pesquisa', 'biodiversidade', 'genética', 'parceria'],
    reading_time: 6,
    views: 1543,
    likes: 112,
    published: true
  },
  {
    id: '5',
    title: 'Agricultura Regenerativa: Técnicas Ancestrais Aliadas à Ciência Moderna',
    excerpt: 'IDASAM resgata conhecimentos tradicionais e os combina com tecnologias modernas para revolucionar a agricultura amazônica.',
    content: `Um projeto inovador do IDASAM está resgatando técnicas ancestrais de agricultura indígena e combinando-as com tecnologias modernas para desenvolver um sistema de agricultura regenerativa perfeitamente adaptado ao ecossistema amazônico.

O projeto "Terra Viva" trabalha diretamente com cinco etnias indígenas para documentar e aprimorar práticas agrícolas tradicionais que mantém a fertilidade do solo por décadas sem uso de agroquímicos.

"Os povos indígenas desenvolveram ao longo de milênios técnicas agrícolas que a ciência moderna está apenas começando a compreender", explica a etnobotânica Dra. Isabel Ribeiro, líder do projeto. "Estamos aprendendo com eles enquanto oferecemos tecnologias que podem potencializar seus conhecimentos."

O sistema desenvolvido utiliza consórcios de plantas nativas, compostagem avançada e biochar produzido a partir de resíduos agrícolas. Os resultados mostram aumento de 40% na produtividade e melhoria significativa na qualidade nutricional dos alimentos.

Quinze comunidades já adotaram as técnicas, produzindo alimentos suficientes para subsistência e comercializando o excedente em mercados regionais. A renda média das famílias participantes aumentou em 60%.

O projeto está expandindo para outras regiões da Amazônia e já despertou interesse internacional, com delegações de países africanos visitando as comunidades para conhecer as técnicas desenvolvidas.`,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2025&q=80',
    publish_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Dra. Isabel Ribeiro',
    category: 'Sustentabilidade',
    tags: ['agricultura', 'indígenas', 'regenerativa', 'tradicional'],
    reading_time: 5,
    views: 789,
    likes: 58,
    published: true
  },
  {
    id: '6',
    title: 'Economia Verde: IDASAM Apoia Criação de 25 Microempresas Sustentáveis',
    excerpt: 'Programa de incubação empresarial gera 120 empregos diretos e fortalece economia local com foco na sustentabilidade.',
    content: `O programa de incubação empresarial do IDASAM celebra a criação de 25 microempresas sustentáveis que, juntas, geraram 120 empregos diretos nos últimos dois anos. As empresas atuam em diversos segmentos da economia verde, desde produção de cosméticos naturais até desenvolvimento de tecnologias limpas.

O programa "Empreende Amazônia" oferece mentoria, capacitação empresarial, microcrédito e espaço de trabalho compartilhado para empreendedores que desenvolvem soluções sustentáveis para desafios amazônicos.

"Nosso objetivo é mostrar que é possível gerar renda e desenvolvimento econômico respeitando o meio ambiente", destaca Roberto Silva, coordenador do programa. "Essas empresas são prova viva de que a economia verde é viável e rentável."

Entre os destaques estão uma empresa que produz biocombustível a partir de óleo de peixe, outra que desenvolve aplicativos para rastreamento de produtos orgânicos e uma cooperativa que produz açaí liofilizado para exportação.

O faturamento conjunto das empresas incubadas atingiu R$ 2,8 milhões em 2023, crescimento de 150% em relação ao ano anterior. Cinco empresas já se graduaram do programa e continuam operando de forma independente.

Para 2024, o programa pretende incubar mais 15 empresas e lançar um fundo de investimento específico para startups de tecnologia verde amazônica.`,
    image: 'https://images.unsplash.com/photo-1556155092-8707de31f9c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    publish_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Roberto Silva',
    category: 'Bioeconomia',
    tags: ['empreendedorismo', 'economia', 'sustentabilidade', 'incubação'],
    reading_time: 4,
    views: 567,
    likes: 43,
    published: true
  }
];

export default function NoticiasPage() {
  const { trackEvent, trackPageView } = useAnalytics();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Carregar dados mocados
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simular delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setArticles(MOCK_ARTICLES);
      setCategories(MOCK_CATEGORIES);
      setIsLoading(false);
    };

    loadData();
    trackPageView('/noticias', 'Notícias IDASAM');
  }, [trackPageView]);

  // Filtrar e ordenar artigos
  const filteredArticles = articles
    .filter(article => {
      const matchesSearch = 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'all' || article.category === selectedCategory;
      
      return matchesSearch && matchesCategory && article.published;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.views - a.views;
        case 'liked':
          return b.likes - a.likes;
        case 'recent':
        default:
          return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
      }
    });

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    trackEvent('article_view', 'content', 'article_open', article.title);
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-idasam-green-dark"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
            <Newspaper className="w-5 h-5 text-idasam-green" />
            <span className="text-sm font-medium text-gray-600">Central de Notícias</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Últimas <span className="text-idasam-green">Notícias</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Acompanhe as últimas novidades e conquistas do IDASAM na transformação sustentável da Amazônia
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar notícias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
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

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <TrendingUp className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="popular">Mais visualizadas</SelectItem>
                <SelectItem value="liked">Mais curtidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Artigos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <Card 
              key={article.id} 
              className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => handleArticleClick(article)}
            >
              {article.image && (
                <div className="relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={getCategoryColor(article.category)}>
                      {article.category}
                    </Badge>
                  </div>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(article.publish_date)}</span>
                  <span>•</span>
                  <Clock className="w-4 h-4" />
                  <span>{article.reading_time} min</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-idasam-green transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{article.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700">{article.author}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{article.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{article.likes}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-4">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhuma notícia encontrada
            </h3>
            <p className="text-gray-500">
              Tente ajustar seus filtros de busca
            </p>
          </div>
        )}

        {/* Modal do Artigo */}
        <Dialog open={selectedArticle !== null} onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedArticle && (
              <>
                <DialogHeader>
                  <div className="space-y-4">
                    {selectedArticle.image && (
                      <img
                        src={selectedArticle.image}
                        alt={selectedArticle.title}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(selectedArticle.category)}>
                        {selectedArticle.category}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(selectedArticle.publish_date)}
                      </span>
                      <span>•</span>
                      <span className="text-sm text-gray-500">
                        {selectedArticle.reading_time} min de leitura
                      </span>
                    </div>
                    
                    <DialogTitle className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                      {selectedArticle.title}
                    </DialogTitle>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {selectedArticle.author.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{selectedArticle.author}</p>
                          <p className="text-sm text-gray-500">Autor</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="w-5 h-5" />
                          <span>{selectedArticle.views}</span>
                        </div>
                        <SocialReactions 
                          articleId={selectedArticle.id}
                          initialCounts={{ like: selectedArticle.likes }}
                        />
                      </div>
                    </div>
                  </div>
                </DialogHeader>
                
                <Separator className="my-6" />
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-gray-700 font-medium mb-6">
                    {selectedArticle.excerpt}
                  </p>
                  
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: selectedArticle.content.replace(/\n/g, '<br><br>')
                    }}
                  />
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Link direto
                    </Button>
                  </div>
                  
                  <CommentThread articleId={selectedArticle.id} />
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
