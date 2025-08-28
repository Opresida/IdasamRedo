import React, { useState, useEffect } from 'react';
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
  // Campos financeiros integrados
  totalBudget: number;
  usedBudget: number;
  publicRevenue: number;
  publicExpenses: number;
  // Controles de transparência financeira
  showBudgetInTransparency: boolean;
  showTransactionsInTransparency: boolean;
  transparencyLevel: 'basic' | 'detailed' | 'complete';
}

// Interface para transações vinculadas ao projeto
interface ProjectTransaction {
  id: string;
  projectId: string;
  date: string;
  description: string;
  value: number;
  type: 'entrada' | 'saida';
  category: string;
  isPublic: boolean;
  supplier?: string;
  attachment?: string;
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
    isVisibleInTransparency: true,
    totalBudget: 150000,
    usedBudget: 45000,
    publicRevenue: 67000,
    publicExpenses: 32500,
    showBudgetInTransparency: true,
    showTransactionsInTransparency: true,
    transparencyLevel: 'complete'
  },
  {
    id: 'goma-sustentavel',
    title: 'Goma Sustentável: Produção em Roraima',
    shortDescription: 'Promover a produção sustentável de goma de tapioca em Roraima, capacitando agricultores em práticas de cultivo.',
    fullDescription: 'Promover a produção sustentável de goma de tapioca em Roraima, capacitando agricultores e comunidades em práticas de cultivo.',
    category: 'Bioeconomia',
    icon: ProjectIcons.tapioca,
    isVisibleInTransparency: false,
    totalBudget: 120000,
    usedBudget: 28000,
    publicRevenue: 15000,
    publicExpenses: 8000,
    showBudgetInTransparency: false,
    showTransactionsInTransparency: false,
    transparencyLevel: 'basic'
  },
  {
    id: 'biofertilizantes',
    title: 'Produção de Biofertilizantes e Insumos',
    shortDescription: 'Produzir biofertilizantes a partir de resíduos sólidos orgânicos para mitigar impactos ambientais.',
    fullDescription: 'Produzir biofertilizantes e insumos agropecuários a partir de resíduos sólidos orgânicos.',
    category: 'Bioeconomia',
    icon: ProjectIcons.biofertilizante,
    isVisibleInTransparency: true,
    totalBudget: 200000,
    usedBudget: 78000,
    publicRevenue: 85000,
    publicExpenses: 45000,
    showBudgetInTransparency: true,
    showTransactionsInTransparency: true,
    transparencyLevel: 'detailed'
  },
  {
    id: 'camarao-quitosana',
    title: 'Produção de Camarão Amazônico e Obtenção de Quitosana',
    shortDescription: 'Criar um módulo sustentável para produção de camarão amazônico e extração de quitosana em Parintins.',
    fullDescription: 'Criar um módulo sustentável para a produção de camarão amazônico e extração de quitosana.',
    category: 'Bioeconomia',
    icon: ProjectIcons.camarao,
    isVisibleInTransparency: false,
    totalBudget: 180000,
    usedBudget: 52000,
    publicRevenue: 25000,
    publicExpenses: 18000,
    showBudgetInTransparency: false,
    showTransactionsInTransparency: false,
    transparencyLevel: 'basic'
  },
  {
    id: 'cogumelos-amazonicos',
    title: 'Biossíntese de Cogumelos Amazônicos',
    shortDescription: 'Promover a produção sustentável de cogumelos comestíveis na região amazônica.',
    fullDescription: 'Promover a produção sustentável de cogumelos comestíveis na região amazônica.',
    category: 'Bioeconomia',
    icon: ProjectIcons.cogumelos,
    isVisibleInTransparency: true,
    totalBudget: 95000,
    usedBudget: 35000,
    publicRevenue: 42000,
    publicExpenses: 28000,
    showBudgetInTransparency: true,
    showTransactionsInTransparency: true,
    transparencyLevel: 'complete'
  },
  {
    id: 'chas-medicinais',
    title: 'Chás Medicinais Amazônicos Liofilizados',
    shortDescription: 'Desenvolver modelo de produção sustentável de chás medicinais amazônicos liofilizados.',
    fullDescription: 'Desenvolver um modelo de produção sustentável e geração de renda a partir de chás medicinais.',
    category: 'Bioeconomia',
    icon: ProjectIcons.cha,
    isVisibleInTransparency: false,
    totalBudget: 75000,
    usedBudget: 22000,
    publicRevenue: 12000,
    publicExpenses: 8000,
    showBudgetInTransparency: false,
    showTransactionsInTransparency: false,
    transparencyLevel: 'basic'
  },
  {
    id: 'cesta-verde',
    title: 'Cesta Verde (Reaproveitamento de Alimentos)',
    shortDescription: 'Reduzir o desperdício de alimentos através da coleta e reaproveitamento de frutas e vegetais.',
    fullDescription: 'Reduzir o desperdício de alimentos na região amazônica através da coleta e reaproveitamento.',
    category: 'Bioeconomia',
    icon: ProjectIcons.cesta,
    isVisibleInTransparency: true,
    totalBudget: 65000,
    usedBudget: 38000,
    publicRevenue: 45000,
    publicExpenses: 25000,
    showBudgetInTransparency: true,
    showTransactionsInTransparency: true,
    transparencyLevel: 'detailed'
  },
  {
    id: 'ceiba',
    title: 'CEIBA: Centro de Inovação e Biotecnologia da Amazônia',
    shortDescription: 'Criar infraestrutura de ponta para promover formação profissional em Bioeconomia e Biotecnologia.',
    fullDescription: 'Criar uma infraestrutura de ponta para promover a formação de profissionais qualificados.',
    category: 'Bioeconomia',
    icon: ProjectIcons.ceiba,
    isVisibleInTransparency: true,
    totalBudget: 500000,
    usedBudget: 180000,
    publicRevenue: 320000,
    publicExpenses: 150000,
    showBudgetInTransparency: true,
    showTransactionsInTransparency: true,
    transparencyLevel: 'complete'
  },
  {
    id: 'plantio-sustentavel',
    title: 'Projeto Plantio Sustentável',
    shortDescription: 'Capacitar pequenos agricultores em práticas de plantio sustentável em Roraima.',
    fullDescription: 'Capacitar pequenos agricultores, comunidades indígenas e assentamentos rurais em Roraima.',
    category: 'Sustentabilidade',
    icon: ProjectIcons.drone,
    isVisibleInTransparency: false,
    totalBudget: 85000,
    usedBudget: 25000,
    publicRevenue: 15000,
    publicExpenses: 12000,
    showBudgetInTransparency: false,
    showTransactionsInTransparency: false,
    transparencyLevel: 'basic'
  },
  {
    id: 'residuos-solidos',
    title: 'Tratamento de Resíduos Sólidos',
    shortDescription: 'Implementar soluções para tratamento de resíduos sólidos nos municípios da Amazônia.',
    fullDescription: 'Implementar soluções para o tratamento de resíduos sólidos nos municípios da Amazônia.',
    category: 'Sustentabilidade',
    icon: ProjectIcons.reciclagem,
    isVisibleInTransparency: true,
    totalBudget: 250000,
    usedBudget: 95000,
    publicRevenue: 180000,
    publicExpenses: 85000,
    showBudgetInTransparency: true,
    showTransactionsInTransparency: true,
    transparencyLevel: 'complete'
  }
];

export default function ProjetosAdminPage() {
  const [projectList, setProjectList] = useState<Project[]>(projects);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectTransactions, setProjectTransactions] = useState<ProjectTransaction[]>([]);

  // Carregar transações vinculadas aos projetos
  useEffect(() => {
    const mockProjectTransactions: ProjectTransaction[] = [
      // Projeto Curupira
      {
        id: '1',
        projectId: 'curupira',
        date: '2024-01-15',
        description: 'Doação para implementação da fecularia',
        value: 25000,
        type: 'entrada',
        category: 'Doações',
        isPublic: true,
        supplier: 'Doador Anônimo'
      },
      {
        id: '2',
        projectId: 'curupira',
        date: '2024-01-10',
        description: 'Aquisição de equipamentos para fecularia',
        value: 18000,
        type: 'saida',
        category: 'Equipamentos',
        isPublic: true,
        supplier: 'Equipamentos Industriais Ltda'
      },
      // CEIBA
      {
        id: '3',
        projectId: 'ceiba',
        date: '2024-01-20',
        description: 'Financiamento governamental para infraestrutura',
        value: 150000,
        type: 'entrada',
        category: 'Financiamentos',
        isPublic: true,
        supplier: 'Governo Federal'
      },
      {
        id: '4',
        projectId: 'ceiba',
        date: '2024-01-18',
        description: 'Construção do laboratório de biotecnologia',
        value: 85000,
        type: 'saida',
        category: 'Infraestrutura',
        isPublic: true,
        supplier: 'Construtora Amazônia Ltda'
      },
      // Biofertilizantes
      {
        id: '5',
        projectId: 'biofertilizantes',
        date: '2024-01-12',
        description: 'Parceria com cooperativa de agricultores',
        value: 35000,
        type: 'entrada',
        category: 'Parcerias',
        isPublic: true,
        supplier: 'Cooperativa Rural Verde'
      },
      {
        id: '6',
        projectId: 'biofertilizantes',
        date: '2024-01-08',
        description: 'Equipamentos para produção de biofertilizantes',
        value: 22000,
        type: 'saida',
        category: 'Equipamentos',
        isPublic: true,
        supplier: 'BioTech Equipamentos'
      }
    ];

    setProjectTransactions(mockProjectTransactions);
  }, []);

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
    showBudgetInTransparency: true,
    showTransactionsInTransparency: true,
    transparencyLevel: 'detailed' as 'basic' | 'detailed' | 'complete',

    // Aba 3: Gestão de Doações
    pixKey: '',
    stripeUsdLink: '',
    stripeEurLink: ''
  });

  // Função para calcular dados financeiros de um projeto
  const getProjectFinancials = (projectId: string) => {
    const transactions = projectTransactions.filter(t => t.projectId === projectId);
    const revenues = transactions.filter(t => t.type === 'entrada');
    const expenses = transactions.filter(t => t.type === 'saida');

    const totalRevenue = revenues.reduce((sum, t) => sum + t.value, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.value, 0);
    const publicRevenue = revenues.filter(t => t.isPublic).reduce((sum, t) => sum + t.value, 0);
    const publicExpenses = expenses.filter(t => t.isPublic).reduce((sum, t) => sum + t.value, 0);

    return {
      totalRevenue,
      totalExpenses,
      publicRevenue,
      publicExpenses,
      balance: totalRevenue - totalExpenses,
      publicBalance: publicRevenue - publicExpenses,
      transactionCount: transactions.length,
      publicTransactionCount: transactions.filter(t => t.isPublic).length
    };
  };

  // Função para obter transações de um projeto específico
  const getProjectTransactions = (projectId: string) => {
    return projectTransactions.filter(t => t.projectId === projectId);
  };

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
        totalBudget: project.totalBudget.toString(),
        isVisibleInTransparency: project.isVisibleInTransparency,
        showBudgetInTransparency: project.showBudgetInTransparency,
        showTransactionsInTransparency: project.showTransactionsInTransparency,
        transparencyLevel: project.transparencyLevel,
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

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Função para adicionar nova transação
  const handleAddTransaction = (transactionData: {
    projectId: string;
    type: 'entrada' | 'saida';
    date: string;
    description: string;
    value: number;
    category: string;
    supplier?: string;
    isPublic: boolean;
    notes?: string;
  }) => {
    const newTransaction: ProjectTransaction = {
      id: `temp-${Date.now()}`,
      ...transactionData
    };

    setProjectTransactions(prev => [newTransaction, ...prev]);

    // Atualizar dados financeiros do projeto
    setProjectList(prev =>
      prev.map(project => {
        if (project.id === transactionData.projectId) {
          const newUsedBudget = transactionData.type === 'saida'
            ? project.usedBudget + transactionData.value
            : project.usedBudget;

          const newPublicRevenue = transactionData.type === 'entrada' && transactionData.isPublic
            ? project.publicRevenue + transactionData.value
            : project.publicRevenue;

          const newPublicExpenses = transactionData.type === 'saida' && transactionData.isPublic
            ? project.publicExpenses + transactionData.value
            : project.publicExpenses;

          return {
            ...project,
            usedBudget: newUsedBudget,
            publicRevenue: newPublicRevenue,
            publicExpenses: newPublicExpenses
          };
        }
        return project;
      })
    );
  };

  // Função para excluir transação
  const handleDeleteTransaction = (transactionId: string) => {
    const transactionToDelete = projectTransactions.find(t => t.id === transactionId);

    if (!transactionToDelete) return;

    // Confirmar exclusão
    if (!confirm(`Tem certeza que deseja excluir a transação "${transactionToDelete.description}"?`)) {
      return;
    }

    // Remover da lista de transações
    setProjectTransactions(prev => prev.filter(t => t.id !== transactionId));

    // Atualizar dados financeiros do projeto (reverter valores)
    setProjectList(prev =>
      prev.map(project => {
        if (project.id === transactionToDelete.projectId) {
          const newUsedBudget = transactionToDelete.type === 'saida'
            ? Math.max(0, project.usedBudget - transactionToDelete.value)
            : project.usedBudget;

          const newPublicRevenue = transactionToDelete.type === 'entrada' && transactionToDelete.isPublic
            ? Math.max(0, project.publicRevenue - transactionToDelete.value)
            : project.publicRevenue;

          const newPublicExpenses = transactionToDelete.type === 'saida' && transactionToDelete.isPublic
            ? Math.max(0, project.publicExpenses - transactionToDelete.value)
            : project.publicExpenses;

          return {
            ...project,
            usedBudget: newUsedBudget,
            publicRevenue: newPublicRevenue,
            publicExpenses: newPublicExpenses
          };
        }
        return project;
      })
    );
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
                  {/* Controles Básicos */}
                  <div className="space-y-4">
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

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Gestão de Lançamentos
                        </h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Use os controles abaixo para registrar receitas e despesas deste projeto.
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1 text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <TrendingUp className="w-4 h-4" />
                                Adicionar Receita
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-green-600">
                                  <TrendingUp className="w-5 h-5" />
                                  Nova Receita
                                </DialogTitle>
                                <DialogDescription>
                                  Registrar entrada de recursos para este projeto
                                </DialogDescription>
                              </DialogHeader>
                              <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label>Data da Receita</Label>
                                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Valor (R$)</Label>
                                    <Input type="number" placeholder="0,00" step="0.01" min="0" />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Descrição</Label>
                                  <Input placeholder="Ex: Doação mensal de apoiador" />
                                </div>
                                <div className="space-y-2">
                                  <Label>Categoria</Label>
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="doacoes">Doações</SelectItem>
                                      <SelectItem value="financiamentos">Financiamentos</SelectItem>
                                      <SelectItem value="parcerias">Parcerias</SelectItem>
                                      <SelectItem value="patrocinios">Patrocínios</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Doador/Fonte (Opcional)</Label>
                                  <Input placeholder="Nome do doador ou instituição" />
                                </div>
                                <div className="flex items-center space-x-3">
                                  <Switch id="revenue-public" defaultChecked />
                                  <Label htmlFor="revenue-public" className="text-sm">Visível na transparência</Label>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                  <DialogTrigger asChild>
                                    <Button variant="outline">Cancelar</Button>
                                  </DialogTrigger>
                                  <Button className="bg-green-600 hover:bg-green-700">Salvar Receita</Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <TrendingDown className="w-4 h-4" />
                                Adicionar Despesa
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-red-600">
                                  <TrendingDown className="w-5 h-5" />
                                  Nova Despesa
                                </DialogTitle>
                                <DialogDescription>
                                  Registrar gasto ou investimento deste projeto
                                </DialogDescription>
                              </DialogHeader>
                              <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label>Data da Despesa</Label>
                                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Valor (R$)</Label>
                                    <Input type="number" placeholder="0,00" step="0.01" min="0" />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Descrição</Label>
                                  <Input placeholder="Ex: Compra de equipamentos de laboratório" />
                                </div>
                                <div className="space-y-2">
                                  <Label>Categoria</Label>
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="equipamentos">Equipamentos</SelectItem>
                                      <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                                      <SelectItem value="materiais">Materiais</SelectItem>
                                      <SelectItem value="servicos">Serviços</SelectItem>
                                      <SelectItem value="pessoal">Pessoal</SelectItem>
                                      <SelectItem value="administrativo">Administrativo</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Fornecedor (Opcional)</Label>
                                  <Input placeholder="Nome da empresa ou prestador" />
                                </div>
                                <div className="flex items-center space-x-3">
                                  <Switch id="expense-public" defaultChecked />
                                  <Label htmlFor="expense-public" className="text-sm">Visível na transparência</Label>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                  <DialogTrigger asChild>
                                    <Button variant="outline">Cancelar</Button>
                                  </DialogTrigger>
                                  <Button className="bg-red-600 hover:bg-red-700">Salvar Despesa</Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Visibilidade Geral */}
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
                            Tornar Projeto Visível no Portal de Transparência
                          </Label>
                          <p className="text-xs text-gray-600 mt-1">
                            Controla se o projeto aparece no portal público
                          </p>
                        </div>
                      </div>

                      {/* Visibilidade do Orçamento */}
                      <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <Switch
                          id="budget-transparency"
                          checked={projectFormData.showBudgetInTransparency}
                          onCheckedChange={(checked) =>
                            setProjectFormData({...projectFormData, showBudgetInTransparency: checked})
                          }
                        />
                        <div className="flex-1">
                          <Label htmlFor="budget-transparency" className="text-sm font-medium">
                            Mostrar Informações de Orçamento
                          </Label>
                          <p className="text-xs text-gray-600 mt-1">
                            Exibe valores de orçamento total e percentual usado no portal
                          </p>
                        </div>
                      </div>

                      {/* Visibilidade das Transações */}
                      <div className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <Switch
                          id="transactions-transparency"
                          checked={projectFormData.showTransactionsInTransparency}
                          onCheckedChange={(checked) =>
                            setProjectFormData({...projectFormData, showTransactionsInTransparency: checked})
                          }
                        />
                        <div className="flex-1">
                          <Label htmlFor="transactions-transparency" className="text-sm font-medium">
                            Mostrar Transações Individuais
                          </Label>
                          <p className="text-xs text-gray-600 mt-1">
                            Permite que transações marcadas como públicas apareçam no portal
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Nível de Transparência */}
                    <div className="space-y-2">
                      <Label htmlFor="transparency-level">Nível de Transparência</Label>
                      <Select
                        value={projectFormData.transparencyLevel}
                        onValueChange={(value: 'basic' | 'detailed' | 'complete') =>
                          setProjectFormData({...projectFormData, transparencyLevel: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full" />
                              <span>Básico - Apenas informações gerais</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="detailed">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              <span>Detalhado - Inclui categorias e resumos</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="complete">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span>Completo - Todas as informações públicas</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
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

                      {/* Cards de Resumo - Dados Dinâmicos */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {(() => {
                          // Obter dados financeiros do projeto sendo editado
                          const projectData = editingProject ? getProjectFinancials(editingProject.id) : {
                            totalRevenue: 67000,
                            totalExpenses: 32500,
                            publicRevenue: 45000,
                            publicExpenses: 28000,
                            balance: 34500,
                            publicBalance: 17000,
                            transactionCount: 12,
                            publicTransactionCount: 8
                          };
                          const budgetValue = parseFloat(projectFormData.totalBudget) || 150000;
                          const executionPercentage = ((projectData.totalExpenses / budgetValue) * 100).toFixed(1);

                          return (
                            <>
                              {/* Total Arrecadado */}
                              <Card className="border-l-4 border-l-green-500">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm text-gray-600">Total Arrecadado</p>
                                      <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(projectData.totalRevenue)}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        Público: {formatCurrency(projectData.publicRevenue)}
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
                                      <p className="text-sm text-gray-600">Total Investido</p>
                                      <p className="text-2xl font-bold text-red-600">
                                        {formatCurrency(projectData.totalExpenses)}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        Público: {formatCurrency(projectData.publicExpenses)}
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
                                      <p className={`text-2xl font-bold ${projectData.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        {formatCurrency(projectData.balance)}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        Público: {formatCurrency(projectData.publicBalance)}
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
                                        <span>{executionPercentage}% utilizado</span>
                                        <span className="text-purple-600 font-medium">
                                          {formatCurrency(projectData.totalExpenses)} / {formatCurrency(budgetValue)}
                                        </span>
                                      </div>
                                      <Progress value={parseFloat(executionPercentage)} className="h-2" />
                                      <div className="text-xs text-gray-500 flex justify-between">
                                        <span>{projectData.transactionCount} transações</span>
                                        <span>{projectData.publicTransactionCount} públicas</span>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </>
                          );
                        })()}
                      </div>

                      {/* Lista de Transações */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-base font-medium text-gray-900 flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-gray-600" />
                            Últimos Lançamentos Vinculados
                          </h5>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1 text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <Plus className="w-4 h-4" />
                                Nova Transação
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <DollarSign className="w-5 h-5 text-green-600" />
                                  Nova Transação Financeira
                                </DialogTitle>
                                <DialogDescription>
                                  Adicionar receita ou despesa para este projeto
                                </DialogDescription>
                              </DialogHeader>

                              <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label htmlFor="transaction-type">Tipo de Transação</Label>
                                    <Select>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="entrada">
                                          <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                            Receita/Entrada
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="saida">
                                          <div className="flex items-center gap-2">
                                            <TrendingDown className="w-4 h-4 text-red-600" />
                                            Despesa/Saída
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="transaction-date">Data</Label>
                                    <Input
                                      id="transaction-date"
                                      type="date"
                                      defaultValue={new Date().toISOString().split('T')[0]}
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="transaction-description">Descrição</Label>
                                  <Input
                                    id="transaction-description"
                                    placeholder="Ex: Doação para equipamentos de laboratório"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label htmlFor="transaction-value">Valor (R$)</Label>
                                    <Input
                                      id="transaction-value"
                                      type="number"
                                      placeholder="0,00"
                                      step="0.01"
                                      min="0"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="transaction-category">Categoria</Label>
                                    <Select>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="doacoes">Doações</SelectItem>
                                        <SelectItem value="financiamentos">Financiamentos</SelectItem>
                                        <SelectItem value="parcerias">Parcerias</SelectItem>
                                        <SelectItem value="equipamentos">Equipamentos</SelectItem>
                                        <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                                        <SelectItem value="materiais">Materiais</SelectItem>
                                        <SelectItem value="servicos">Serviços</SelectItem>
                                        <SelectItem value="outros">Outros</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="transaction-supplier">Fornecedor/Doador (Opcional)</Label>
                                  <Input
                                    id="transaction-supplier"
                                    placeholder="Nome da empresa ou pessoa"
                                  />
                                </div>

                                <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <Switch id="transaction-public" defaultChecked />
                                  <div className="flex-1">
                                    <Label htmlFor="transaction-public" className="text-sm font-medium">
                                      Transação Pública
                                    </Label>
                                    <p className="text-xs text-gray-600 mt-1">
                                      Será visível no Portal de Transparência
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="transaction-notes">Observações (Opcional)</Label>
                                  <Textarea
                                    id="transaction-notes"
                                    placeholder="Informações adicionais sobre esta transação..."
                                    className="min-h-[80px]"
                                  />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                  <DialogTrigger asChild>
                                    <Button variant="outline">Cancelar</Button>
                                  </DialogTrigger>
                                  <Button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Salvar Transação
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="text-xs">Data</TableHead>
                                <TableHead className="text-xs">Descrição</TableHead>
                                <TableHead className="text-xs">Categoria</TableHead>
                                <TableHead className="text-xs">Fornecedor/Doador</TableHead>
                                <TableHead className="text-xs text-right">Valor</TableHead>
                                <TableHead className="text-xs text-center">Status</TableHead>
                                <TableHead className="text-xs">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(() => {
                                const transactions = editingProject ? getProjectTransactions(editingProject.id) : [];

                                if (transactions.length === 0) {
                                  return (
                                    <TableRow>
                                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                        Nenhuma transação vinculada a este projeto ainda.
                                      </TableCell>
                                    </TableRow>
                                  );
                                }

                                return transactions.slice(0, 5).map((transaction) => (
                                  <TableRow key={transaction.id}>
                                    <TableCell className="text-xs">{formatDate(transaction.date)}</TableCell>
                                    <TableCell className="text-xs">{transaction.description}</TableCell>
                                    <TableCell className="text-xs">
                                      <Badge variant="outline" className="text-xs">{transaction.category}</Badge>
                                    </TableCell>
                                    <TableCell className="text-xs">{transaction.supplier || 'Não informado'}</TableCell>
                                    <TableCell className={`text-xs text-right font-bold ${
                                      transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {transaction.type === 'entrada' ? '+' : '-'}{formatCurrency(transaction.value)}
                                    </TableCell>
                                    <TableCell className="text-xs text-center">
                                      <Badge
                                        variant={transaction.isPublic ? "default" : "outline"}
                                        className={transaction.isPublic ? "bg-green-100 text-green-800 text-xs" : "text-gray-600 text-xs"}
                                      >
                                        {transaction.isPublic ? "Público" : "Privado"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteTransaction(transaction.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        title="Excluir transação"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ));
                              })()}
                            </TableBody>
                          </Table>
                        </div>

                        <div className="text-center py-2">
                          {(() => {
                            const transactions = editingProject ? getProjectTransactions(editingProject.id) : [];
                            const publicCount = transactions.filter(t => t.isPublic).length;

                            return (
                              <p className="text-xs text-gray-500">
                                Total de {transactions.length} transações vinculadas ({publicCount} públicas). <br />
                                <span className="text-blue-600 cursor-pointer hover:underline">
                                  Ver todas as transações no módulo Financeiro →
                                </span>
                              </p>
                            );
                          })()}
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

              {/* Resumo Financeiro */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <h5 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Resumo Financeiro
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Orçamento:</span>
                    <div className="font-semibold">{formatCurrency(project.totalBudget)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Utilizado:</span>
                    <div className="font-semibold">{formatCurrency(project.usedBudget)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Receitas Públicas:</span>
                    <div className="font-semibold text-green-600">{formatCurrency(project.publicRevenue)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Gastos Públicos:</span>
                    <div className="font-semibold text-blue-600">{formatCurrency(project.publicExpenses)}</div>
                  </div>
                </div>
                <div className="pt-1 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Execução:</span>
                    <span className="text-xs font-semibold">
                      {((project.usedBudget / project.totalBudget) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={(project.usedBudget / project.totalBudget) * 100}
                    className="h-1 mt-1"
                  />
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FolderKanban className="w-4 h-4" />
                  Controles de Administrador
                </h4>

                {/* Controles de Visibilidade */}
                <div className="space-y-3">
                  {/* Visibilidade Geral */}
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

                  {/* Controles Adicionais quando visível */}
                  {project.isVisibleInTransparency && (
                    <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Mostrar Orçamento</span>
                        <Badge variant={project.showBudgetInTransparency ? "default" : "outline"} className="text-xs">
                          {project.showBudgetInTransparency ? "Sim" : "Não"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Mostrar Transações</span>
                        <Badge variant={project.showTransactionsInTransparency ? "default" : "outline"} className="text-xs">
                          {project.showTransactionsInTransparency ? "Sim" : "Não"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Nível</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            project.transparencyLevel === 'complete' ? 'bg-green-50 text-green-700' :
                            project.transparencyLevel === 'detailed' ? 'bg-blue-50 text-blue-700' :
                            'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {project.transparencyLevel === 'complete' ? 'Completo' :
                           project.transparencyLevel === 'detailed' ? 'Detalhado' : 'Básico'}
                        </Badge>
                      </div>
                    </div>
                  )}

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