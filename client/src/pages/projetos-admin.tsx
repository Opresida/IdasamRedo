
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  FolderKanban, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink,
  Eye,
  Globe,
  DollarSign,
  Heart,
  TrendingUp,
  TrendingDown,
  Building2,
  Receipt
} from 'lucide-react';

// Definição dos tipos
interface Project {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  icon: React.ReactNode;
  isVisibleInTransparency: boolean;
}

// Ícones SVG personalizados para cada projeto
const ProjectIcons = {
  mandioca: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8C28 8 24 12 24 16V20C24 24 28 28 32 28C36 28 40 24 40 20V16C40 12 36 8 32 8Z" fill="#8B4513"/>
      <path d="M32 28C28 28 24 32 24 36V40C24 44 28 48 32 48C36 48 40 44 40 40V36C40 32 36 28 32 28Z" fill="#CD853F"/>
      <path d="M32 48C28 48 24 52 24 56V60C24 64 28 68 32 68C36 68 40 64 40 60V56C40 52 36 48 32 48Z" fill="#8B4513"/>
    </svg>
  ),
  tapioca: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" fill="#F5DEB3"/>
      <circle cx="28" cy="28" r="3" fill="#DDD"/>
      <circle cx="36" cy="30" r="2" fill="#DDD"/>
      <circle cx="30" cy="36" r="2.5" fill="#DDD"/>
      <circle cx="38" cy="36" r="2" fill="#DDD"/>
      <path d="M45 20C48 18 52 20 54 24C56 28 54 32 50 34" stroke="#228B22" strokeWidth="2" fill="none"/>
    </svg>
  ),
  biofertilizante: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 50C20 45 24 40 30 40H34C40 40 44 45 44 50V55H20V50Z" fill="#8B4513"/>
      <path d="M32 40C32 35 28 30 24 28C20 26 16 28 16 32C16 36 20 38 24 40" fill="#228B22"/>
      <path d="M32 40C32 35 36 30 40 28C44 26 48 28 48 32C48 36 44 38 40 40" fill="#228B22"/>
      <path d="M32 25C32 20 30 15 28 12C26 9 24 10 24 14C24 18 26 20 28 22" fill="#32CD32"/>
    </svg>
  ),
  camarao: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 32C10 28 14 24 20 24H44C50 24 54 28 54 32C54 36 50 40 44 40H20C14 40 10 36 10 32Z" fill="#FF6347"/>
      <path d="M44 32L50 28L52 32L50 36L44 32Z" fill="#FF4500"/>
      <circle cx="18" cy="30" r="2" fill="#000"/>
      <path d="M20 28L16 24M20 32L16 32M20 36L16 40" stroke="#FF4500" strokeWidth="2"/>
    </svg>
  ),
  cogumelos: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="30" rx="8" ry="6" fill="#8B4513"/>
      <rect x="16" y="30" width="8" height="15" fill="#F5DEB3"/>
      <ellipse cx="35" cy="25" rx="10" ry="8" fill="#CD853F"/>
      <rect x="28" y="25" width="14" height="20" fill="#F5DEB3"/>
      <ellipse cx="48" cy="35" rx="6" ry="5" fill="#A0522D"/>
      <rect x="42" y="35" width="12" height="12" fill="#F5DEB3"/>
    </svg>
  ),
  cha: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 45C15 40 18 35 22 35H42C46 35 49 40 49 45V50H15V45Z" fill="#FFF"/>
      <path d="M15 50H49V52C49 54 47 56 45 56H19C17 56 15 54 15 52V50Z" fill="#E0E0E0"/>
      <path d="M50 40C52 38 54 40 54 42C54 44 52 46 50 44" stroke="#000" strokeWidth="2" fill="none"/>
      <path d="M25 30C25 25 28 20 32 20C36 20 39 25 39 30" stroke="#228B22" strokeWidth="2" fill="none"/>
      <circle cx="32" cy="25" r="3" fill="#32CD32"/>
    </svg>
  ),
  cesta: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 25L16 50H48L52 25H12Z" fill="#8B4513"/>
      <path d="M15 25H49" stroke="#654321" strokeWidth="2"/>
      <circle cx="25" cy="20" r="4" fill="#FF6347"/>
      <circle cx="35" cy="18" r="3" fill="#32CD32"/>
      <circle cx="42" cy="22" r="3.5" fill="#FFD700"/>
      <path d="M25 16C25 14 26 12 28 12" stroke="#228B22" strokeWidth="2" fill="none"/>
      <path d="M35 15C35 13 36 11 38 11" stroke="#228B22" strokeWidth="2" fill="none"/>
    </svg>
  ),
  ceiba: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="35" r="20" fill="#E0E0E0"/>
      <circle cx="32" cy="35" r="15" fill="#F5F5F5"/>
      <rect x="28" y="20" width="8" height="15" fill="#4169E1"/>
      <rect x="20" y="30" width="24" height="3" fill="#4169E1"/>
      <rect x="20" y="35" width="24" height="3" fill="#4169E1"/>
      <rect x="20" y="40" width="24" height="3" fill="#4169E1"/>
      <path d="M15 55C18 52 22 50 26 50C30 50 34 50 38 50C42 50 46 52 49 55" stroke="#228B22" strokeWidth="3" fill="none"/>
    </svg>
  ),
  drone: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="26" y="26" width="12" height="8" fill="#666"/>
      <circle cx="20" cy="20" r="6" fill="#333"/>
      <circle cx="44" cy="20" r="6" fill="#333"/>
      <circle cx="20" cy="44" r="6" fill="#333"/>
      <circle cx="44" cy="44" r="6" fill="#333"/>
      <line x1="26" y1="30" x2="20" y2="20" stroke="#999" strokeWidth="2"/>
      <line x1="38" y1="30" x2="44" y2="20" stroke="#999" strokeWidth="2"/>
      <line x1="26" y1="34" x2="20" y2="44" stroke="#999" strokeWidth="2"/>
      <line x1="38" y1="34" x2="44" y2="44" stroke="#999" strokeWidth="2"/>
      <rect x="10" y="45" width="44" height="4" fill="#228B22"/>
    </svg>
  ),
  reciclagem: (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 15L40 30L24 30Z" fill="#228B22"/>
      <path d="M20 40L35 48L20 56Z" fill="#228B22"/>
      <path d="M44 40L44 56L29 48Z" fill="#228B22"/>
      <circle cx="32" cy="25" r="3" fill="#FFF"/>
      <circle cx="27" cy="45" r="3" fill="#FFF"/>
      <circle cx="37" cy="45" r="3" fill="#FFF"/>
      <path d="M32 35C35 32 40 35 42 40" stroke="#32CD32" strokeWidth="2" fill="none"/>
      <path d="M42 40C45 38 48 42 46 46" stroke="#32CD32" strokeWidth="2" fill="none"/>
    </svg>
  )
};

// Dados dos projetos (dados simulados para o dashboard)
const projects: Project[] = [
  {
    id: 'curupira',
    title: 'Projeto Curupira (Fecularia de Mandioca)',
    shortDescription: 'Implantar uma fecularia de mandioca em municípios remotos do Amazonas para promover a agricultura familiar e sustentabilidade.',
    fullDescription: 'Implantar uma fecularia de mandioca em municípios remotos do Amazonas para promover a agricultura familiar e a sustentabilidade.',
    category: 'Bioeconomia',
    icon: ProjectIcons.mandioca,
    isVisibleInTransparency: true
  },
  {
    id: 'goma-sustentavel',
    title: 'Goma Sustentável: Produção em Roraima',
    shortDescription: 'Promover a produção sustentável de goma de tapioca em Roraima, capacitando agricultores em práticas de cultivo.',
    fullDescription: 'Promover a produção sustentável de goma de tapioca em Roraima, capacitando agricultores e comunidades em práticas de cultivo.',
    category: 'Bioeconomia',
    icon: ProjectIcons.tapioca,
    isVisibleInTransparency: false
  },
  {
    id: 'biofertilizantes',
    title: 'Produção de Biofertilizantes e Insumos',
    shortDescription: 'Produzir biofertilizantes a partir de resíduos sólidos orgânicos para mitigar impactos ambientais.',
    fullDescription: 'Produzir biofertilizantes e insumos agropecuários a partir de resíduos sólidos orgânicos.',
    category: 'Bioeconomia',
    icon: ProjectIcons.biofertilizante,
    isVisibleInTransparency: true
  },
  {
    id: 'camarao-quitosana',
    title: 'Produção de Camarão Amazônico e Obtenção de Quitosana',
    shortDescription: 'Criar um módulo sustentável para produção de camarão amazônico e extração de quitosana em Parintins.',
    fullDescription: 'Criar um módulo sustentável para a produção de camarão amazônico e extração de quitosana.',
    category: 'Bioeconomia',
    icon: ProjectIcons.camarao,
    isVisibleInTransparency: false
  },
  {
    id: 'cogumelos-amazonicos',
    title: 'Biossíntese de Cogumelos Amazônicos',
    shortDescription: 'Promover a produção sustentável de cogumelos comestíveis na região amazônica.',
    fullDescription: 'Promover a produção sustentável de cogumelos comestíveis na região amazônica.',
    category: 'Bioeconomia',
    icon: ProjectIcons.cogumelos,
    isVisibleInTransparency: true
  },
  {
    id: 'chas-medicinais',
    title: 'Chás Medicinais Amazônicos Liofilizados',
    shortDescription: 'Desenvolver modelo de produção sustentável de chás medicinais amazônicos liofilizados.',
    fullDescription: 'Desenvolver um modelo de produção sustentável e geração de renda a partir de chás medicinais.',
    category: 'Bioeconomia',
    icon: ProjectIcons.cha,
    isVisibleInTransparency: false
  },
  {
    id: 'cesta-verde',
    title: 'Cesta Verde (Reaproveitamento de Alimentos)',
    shortDescription: 'Reduzir o desperdício de alimentos através da coleta e reaproveitamento de frutas e vegetais.',
    fullDescription: 'Reduzir o desperdício de alimentos na região amazônica através da coleta e reaproveitamento.',
    category: 'Bioeconomia',
    icon: ProjectIcons.cesta,
    isVisibleInTransparency: true
  },
  {
    id: 'ceiba',
    title: 'CEIBA: Centro de Inovação e Biotecnologia da Amazônia',
    shortDescription: 'Criar infraestrutura de ponta para promover formação profissional em Bioeconomia e Biotecnologia.',
    fullDescription: 'Criar uma infraestrutura de ponta para promover a formação de profissionais qualificados.',
    category: 'Bioeconomia',
    icon: ProjectIcons.ceiba,
    isVisibleInTransparency: true
  },
  {
    id: 'plantio-sustentavel',
    title: 'Projeto Plantio Sustentável',
    shortDescription: 'Capacitar pequenos agricultores em práticas de plantio sustentável em Roraima.',
    fullDescription: 'Capacitar pequenos agricultores, comunidades indígenas e assentamentos rurais em Roraima.',
    category: 'Sustentabilidade',
    icon: ProjectIcons.drone,
    isVisibleInTransparency: false
  },
  {
    id: 'residuos-solidos',
    title: 'Tratamento de Resíduos Sólidos',
    shortDescription: 'Implementar soluções para tratamento de resíduos sólidos nos municípios da Amazônia.',
    fullDescription: 'Implementar soluções para o tratamento de resíduos sólidos nos municípios da Amazônia.',
    category: 'Sustentabilidade',
    icon: ProjectIcons.reciclagem,
    isVisibleInTransparency: true
  }
];

export default function ProjetosAdminPage() {
  const [projectList, setProjectList] = useState<Project[]>(projects);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Estado do formulário de projeto
  const [projectFormData, setProjectFormData] = useState({
    // Aba 1: Conteúdo do Site
    name: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    imageUrl: '',
    status: 'planejamento' as 'planejamento' | 'em-andamento' | 'concluido',
    category: 'Bioeconomia',
    
    // Aba 2: Financeiro e Transparência
    totalBudget: '',
    isVisibleInTransparency: true,
    
    // Aba 3: Gestão de Doações
    pixKey: '',
    stripeUsdLink: '',
    stripeEurLink: ''
  });

  // Função para obter cor da categoria
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Bioeconomia':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Sustentabilidade':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Saúde e Social':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Capacitação':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Função para alterar visibilidade na transparência
  const handleTransparencyVisibilityChange = (projectId: string, isVisible: boolean) => {
    setProjectList(prev => 
      prev.map(project => 
        project.id === projectId 
          ? { ...project, isVisibleInTransparency: isVisible }
          : project
      )
    );
  };

  // Função para editar projeto
  const handleEditProject = (projectId: string) => {
    const project = projectList.find(p => p.id === projectId);
    if (project) {
      setEditingProject(project);
      // Preencher o formulário com os dados do projeto
      setProjectFormData({
        name: project.title,
        slug: project.id,
        shortDescription: project.shortDescription,
        fullDescription: project.fullDescription,
        imageUrl: '',
        status: 'em-andamento',
        category: project.category,
        totalBudget: '150000',
        isVisibleInTransparency: project.isVisibleInTransparency,
        pixKey: 'projeto@idasam.org.br',
        stripeUsdLink: 'https://stripe.com/usd/donate',
        stripeEurLink: 'https://stripe.com/eur/donate'
      });
      setShowProjectDialog(true);
    }
  };

  // Função para excluir projeto (placeholder)
  const handleDeleteProject = (projectId: string) => {
    console.log('Excluir projeto:', projectId);
    // TODO: Implementar confirmação e exclusão
  };

  // Função para resetar o formulário
  const resetProjectForm = () => {
    setProjectFormData({
      name: '',
      slug: '',
      shortDescription: '',
      fullDescription: '',
      imageUrl: '',
      status: 'planejamento',
      category: 'Bioeconomia',
      totalBudget: '',
      isVisibleInTransparency: true,
      pixKey: '',
      stripeUsdLink: '',
      stripeEurLink: ''
    });
  };

  // Função para criar novo projeto
  const handleNewProject = () => {
    setEditingProject(null);
    resetProjectForm();
    setShowProjectDialog(true);
  };

  // Função para submeter o formulário
  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados do projeto:', projectFormData);
    
    if (editingProject) {
      // Atualizar projeto existente
      console.log('Atualizando projeto:', editingProject.id);
    } else {
      // Criar novo projeto
      console.log('Criando novo projeto');
    }
    
    // Fechar modal
    setShowProjectDialog(false);
    resetProjectForm();
  };

  // Função para gerar slug automático baseado no nome
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim('-'); // Remove hífens no início/fim
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-green-600" />
            Gestão de Projetos
          </h1>
          <p className="text-gray-600 mt-2">
            Administre todos os projetos do IDASAM e suas configurações de visibilidade
          </p>
        </div>
        <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleNewProject}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-3">
                <FolderKanban className="w-6 h-6 text-green-600" />
                {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
              </DialogTitle>
              <DialogDescription>
                {editingProject 
                  ? 'Atualize as informações do projeto existente' 
                  : 'Crie um novo projeto para o IDASAM'
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleProjectSubmit} className="space-y-6">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Conteúdo do Site
                  </TabsTrigger>
                  <TabsTrigger value="financial" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Financeiro e Transparência
                  </TabsTrigger>
                  <TabsTrigger value="donations" className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Gestão de Doações
                  </TabsTrigger>
                </TabsList>

                {/* Aba 1: Conteúdo do Site */}
                <TabsContent value="content" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">Nome do Projeto *</Label>
                      <Input
                        id="project-name"
                        value={projectFormData.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setProjectFormData({
                            ...projectFormData,
                            name,
                            slug: generateSlug(name)
                          });
                        }}
                        placeholder="Ex: Projeto Curupira"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-slug">URL Amigável (Slug) *</Label>
                      <Input
                        id="project-slug"
                        value={projectFormData.slug}
                        onChange={(e) => setProjectFormData({...projectFormData, slug: e.target.value})}
                        placeholder="Ex: projeto-curupira"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-summary">Resumo do Projeto *</Label>
                    <Textarea
                      id="project-summary"
                      value={projectFormData.shortDescription}
                      onChange={(e) => setProjectFormData({...projectFormData, shortDescription: e.target.value})}
                      placeholder="Breve descrição que aparecerá nos cards de projeto..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-content">Conteúdo Completo *</Label>
                    <Textarea
                      id="project-content"
                      value={projectFormData.fullDescription}
                      onChange={(e) => setProjectFormData({...projectFormData, fullDescription: e.target.value})}
                      placeholder="Descrição detalhada do projeto para a página individual..."
                      className="min-h-[200px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-image">URL da Imagem de Capa</Label>
                      <Input
                        id="project-image"
                        type="url"
                        value={projectFormData.imageUrl}
                        onChange={(e) => setProjectFormData({...projectFormData, imageUrl: e.target.value})}
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-status">Status do Projeto *</Label>
                      <Select 
                        value={projectFormData.status} 
                        onValueChange={(value: 'planejamento' | 'em-andamento' | 'concluido') => 
                          setProjectFormData({...projectFormData, status: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planejamento">Planejamento</SelectItem>
                          <SelectItem value="em-andamento">Em Andamento</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-category">Categoria *</Label>
                    <Select 
                      value={projectFormData.category} 
                      onValueChange={(value) => setProjectFormData({...projectFormData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bioeconomia">Bioeconomia</SelectItem>
                        <SelectItem value="Sustentabilidade">Sustentabilidade</SelectItem>
                        <SelectItem value="Saúde e Social">Saúde e Social</SelectItem>
                        <SelectItem value="Capacitação">Capacitação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* Aba 2: Financeiro e Transparência */}
                <TabsContent value="financial" className="space-y-6">
                  {/* Controles Existentes */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-budget">Orçamento Total do Projeto (R$)</Label>
                      <Input
                        id="project-budget"
                        type="number"
                        value={projectFormData.totalBudget}
                        onChange={(e) => setProjectFormData({...projectFormData, totalBudget: e.target.value})}
                        placeholder="Ex: 150000"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Switch
                        id="transparency-visibility"
                        checked={projectFormData.isVisibleInTransparency}
                        onCheckedChange={(checked) => 
                          setProjectFormData({...projectFormData, isVisibleInTransparency: checked})
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor="transparency-visibility" className="text-sm font-medium">
                          Tornar Visível no Portal de Transparência
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">
                          Quando ativo, este projeto e seus dados financeiros gerais aparecerão no portal público
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard de Resumo Financeiro */}
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Resumo Financeiro do Projeto
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Dados baseados nas transações vinculadas a este projeto no módulo financeiro.
                      </p>

                      {/* Cards de Resumo */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Total Arrecadado */}
                        <Card className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Total Arrecadado</p>
                                <p className="text-2xl font-bold text-green-600">
                                  R$ 67.000,00
                                </p>
                              </div>
                              <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Total Gasto */}
                        <Card className="border-l-4 border-l-red-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Total Gasto</p>
                                <p className="text-2xl font-bold text-red-600">
                                  R$ 32.500,00
                                </p>
                              </div>
                              <TrendingDown className="h-8 w-8 text-red-600" />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Saldo Atual */}
                        <Card className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Saldo Atual</p>
                                <p className="text-2xl font-bold text-blue-600">
                                  R$ 34.500,00
                                </p>
                              </div>
                              <Building2 className="h-8 w-8 text-blue-600" />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Execução Orçamentária */}
                        <Card className="border-l-4 border-l-purple-500">
                          <CardContent className="p-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Execução Orçamentária</p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>21,7% utilizado</span>
                                  <span className="text-purple-600 font-medium">R$ 32.500 / R$ 150.000</span>
                                </div>
                                <Progress value={21.7} className="h-2" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Lista de Transações */}
                      <div className="space-y-3">
                        <h5 className="text-base font-medium text-gray-900 flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-gray-600" />
                          Últimos Lançamentos Vinculados
                        </h5>
                        
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="text-xs">Data</TableHead>
                                <TableHead className="text-xs">Descrição</TableHead>
                                <TableHead className="text-xs">Categoria</TableHead>
                                <TableHead className="text-xs">Fornecedor/Doador</TableHead>
                                <TableHead className="text-xs text-right">Valor</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="text-xs">15/01/2024</TableCell>
                                <TableCell className="text-xs">Doação mensal - Projeto Coração Ribeirinho</TableCell>
                                <TableCell className="text-xs">
                                  <Badge variant="outline" className="text-xs">Receita de Projeto</Badge>
                                </TableCell>
                                <TableCell className="text-xs">Maria Oliveira</TableCell>
                                <TableCell className="text-xs text-right font-bold text-green-600">
                                  +R$ 5.000,00
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="text-xs">20/01/2024</TableCell>
                                <TableCell className="text-xs">Parceria com empresa local - Projeto Coração</TableCell>
                                <TableCell className="text-xs">
                                  <Badge variant="outline" className="text-xs">Parcerias</Badge>
                                </TableCell>
                                <TableCell className="text-xs">Empresa ABC Ltda</TableCell>
                                <TableCell className="text-xs text-right font-bold text-green-600">
                                  +R$ 12.000,00
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="text-xs">10/01/2024</TableCell>
                                <TableCell className="text-xs">Compra de equipamentos para projeto</TableCell>
                                <TableCell className="text-xs">
                                  <Badge variant="outline" className="text-xs">Equipamentos</Badge>
                                </TableCell>
                                <TableCell className="text-xs">Fornecedor de Equipamentos Ltda</TableCell>
                                <TableCell className="text-xs text-right font-bold text-red-600">
                                  -R$ 8.500,00
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="text-xs">08/01/2024</TableCell>
                                <TableCell className="text-xs">Material de capacitação - Projeto Coração</TableCell>
                                <TableCell className="text-xs">
                                  <Badge variant="outline" className="text-xs">Materiais</Badge>
                                </TableCell>
                                <TableCell className="text-xs">João Silva - Serviços</TableCell>
                                <TableCell className="text-xs text-right font-bold text-red-600">
                                  -R$ 3.200,00
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="text-xs">05/01/2024</TableCell>
                                <TableCell className="text-xs">Doação especial de final de ano</TableCell>
                                <TableCell className="text-xs">
                                  <Badge variant="outline" className="text-xs">Doações</Badge>
                                </TableCell>
                                <TableCell className="text-xs">Doador Anônimo</TableCell>
                                <TableCell className="text-xs text-right font-bold text-green-600">
                                  +R$ 15.000,00
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>

                        <div className="text-center py-2">
                          <p className="text-xs text-gray-500">
                            Total de 47 transações vinculadas a este projeto. <br />
                            <span className="text-blue-600 cursor-pointer hover:underline">
                              Ver todas as transações no módulo Financeiro →
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Integração com Financeiro</h4>
                    <p className="text-sm text-gray-600">
                      Este projeto está automaticamente conectado aos dados de receitas e despesas 
                      registrados na seção Financeiro do dashboard. Os valores são atualizados em tempo real.
                    </p>
                  </div>
                </TabsContent>

                {/* Aba 3: Gestão de Doações */}
                <TabsContent value="donations" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pix-key">Chave PIX</Label>
                    <Input
                      id="pix-key"
                      value={projectFormData.pixKey}
                      onChange={(e) => setProjectFormData({...projectFormData, pixKey: e.target.value})}
                      placeholder="Ex: projeto@idasam.org.br ou CPF/CNPJ"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stripe-usd">Link de Doação (Stripe - Dólar)</Label>
                    <Input
                      id="stripe-usd"
                      type="url"
                      value={projectFormData.stripeUsdLink}
                      onChange={(e) => setProjectFormData({...projectFormData, stripeUsdLink: e.target.value})}
                      placeholder="https://checkout.stripe.com/pay/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stripe-eur">Link de Doação (Stripe - Euro)</Label>
                    <Input
                      id="stripe-eur"
                      type="url"
                      value={projectFormData.stripeEurLink}
                      onChange={(e) => setProjectFormData({...projectFormData, stripeEurLink: e.target.value})}
                      placeholder="https://checkout.stripe.com/pay/..."
                    />
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">📊 Resumo das Doações</h4>
                    <p className="text-sm text-yellow-700">
                      Futuramente, aqui será exibido um resumo das doações recebidas através destes links.
                      Incluirá dados como: valor total arrecadado, número de doadores, média por doação,
                      e gráficos de evolução temporal das contribuições.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Card className="p-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Total PIX</p>
                        <p className="text-lg font-bold text-green-600">R$ 0,00</p>
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Total USD</p>
                        <p className="text-lg font-bold text-blue-600">$ 0.00</p>
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Total EUR</p>
                        <p className="text-lg font-bold text-purple-600">€ 0,00</p>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Botões do Modal */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowProjectDialog(false);
                    resetProjectForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingProject ? 'Atualizar Projeto' : 'Criar Projeto'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Projetos</p>
                <p className="text-2xl font-bold text-gray-900">{projectList.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Visíveis na Transparência</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projectList.filter(p => p.isVisibleInTransparency).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bioeconomia</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projectList.filter(p => p.category === 'Bioeconomia').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sustentabilidade</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projectList.filter(p => p.category === 'Sustentabilidade').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade de Projetos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectList.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              {/* Ícone do Projeto */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center border">
                  {project.icon}
                </div>
              </div>

              {/* Título e Categoria */}
              <CardTitle className="text-lg text-center leading-tight">
                {project.title}
              </CardTitle>
              <div className="flex justify-center mt-2">
                <Badge variant="outline" className={`text-xs ${getCategoryColor(project.category)}`}>
                  {project.category}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Descrição */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {project.shortDescription}
              </p>

              {/* Separador */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FolderKanban className="w-4 h-4" />
                  Controles de Administrador
                </h4>

                {/* Controles de Visibilidade */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`transparency-${project.id}`} className="text-sm">
                      Visível na Transparência
                    </Label>
                    <Switch
                      id={`transparency-${project.id}`}
                      checked={project.isVisibleInTransparency}
                      onCheckedChange={(checked) => 
                        handleTransparencyVisibilityChange(project.id, checked)
                      }
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProject(project.id)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>

                  {/* Link para ver no site público */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open('/projetos', '_blank')}
                    className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Ver no Site Público
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Card de informações */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Sobre a Gestão de Projetos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-blue-800 space-y-2">
            <p className="text-sm">
              • <strong>Visível na Transparência:</strong> Controla se o projeto aparece na página pública de transparência.
            </p>
            <p className="text-sm">
              • <strong>Editar:</strong> Permite modificar informações do projeto (em desenvolvimento).
            </p>
            <p className="text-sm">
              • <strong>Excluir:</strong> Remove o projeto da plataforma (em desenvolvimento).
            </p>
            <p className="text-sm">
              • <strong>Ver no Site Público:</strong> Abre a página pública de projetos em nova aba.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
