
import React, { useState } from 'react';
import { Calendar, User, Clock, Tag, ArrowRight, Search, Filter } from 'lucide-react';
import FloatingNavbar from '@/components/floating-navbar';
import WhatsAppFloat from '@/components/whatsapp-float';
import ShadcnblocksComFooter2 from '@/components/shadcnblocks-com-footer2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

// Dados das notícias (simulando um banco de dados)
const articles: Article[] = [
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

export default function NoticiasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

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
      {featuredArticles.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-idasam-text-main mb-12 text-center">
              Destaques
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredArticles.slice(0, 2).map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
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
              ))}
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
            {regularArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="aspect-video overflow-hidden">
                  <img
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
            ))}
          </div>
        </div>
      </section>

      {/* Modal do Artigo */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-64 md:h-80 object-cover"
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8">
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedArticle.category === 'Bioeconomia' ? 'bg-idasam-green-medium/10 text-idasam-green-dark' :
                  selectedArticle.category === 'Tecnologia' ? 'bg-blue-100 text-blue-700' :
                  selectedArticle.category === 'Capacitação' ? 'bg-purple-100 text-purple-700' :
                  selectedArticle.category === 'Pesquisa' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedArticle.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedArticle.publishDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedArticle.readTime}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {selectedArticle.author}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-idasam-text-main mb-6">
                {selectedArticle.title}
              </h1>
              
              <div className="prose prose-lg max-w-none">
                {selectedArticle.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-8">
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
            </div>
          </div>
        </div>
      )}

      <ShadcnblocksComFooter2 />
    </div>
  );
}
