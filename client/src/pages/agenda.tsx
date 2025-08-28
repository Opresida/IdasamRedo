
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, CalendarDays, Plus, Filter, Users, CheckCircle, Clock, AlertCircle, XCircle, Calendar as CalendarIcon } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  assignedToAvatar?: string;
  sector: string;
  dueDate: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function AgendaPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState('Todos');
  const [selectedResponsible, setSelectedResponsible] = useState('Todos');
  const [activeTab, setActiveTab] = useState('lista');

  // Form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    sector: '',
    dueDate: '',
    status: 'Pendente' as const
  });

  const sectors = ['Todos', 'Imprensa', 'Financeiro', 'Diretoria', 'Projetos', 'Administrativo'];
  
  // Mock data para demonstração
  useEffect(() => {
    const mockUsers: User[] = [
      { id: '1', name: 'Ana Silva', email: 'ana@idasam.org', avatar: '' },
      { id: '2', name: 'Carlos Santos', email: 'carlos@idasam.org', avatar: '' },
      { id: '3', name: 'Maria Oliveira', email: 'maria@idasam.org', avatar: '' },
      { id: '4', name: 'João Costa', email: 'joao@idasam.org', avatar: '' }
    ];

    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Relatório mensal de atividades',
        description: 'Compilar dados e criar relatório das atividades do mês',
        assignedTo: '1',
        assignedToName: 'Ana Silva',
        sector: 'Imprensa',
        dueDate: '2024-01-30',
        status: 'Em Andamento',
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        title: 'Análise de custos Q1',
        description: 'Revisar e analisar custos do primeiro trimestre',
        assignedTo: '2',
        assignedToName: 'Carlos Santos',
        sector: 'Financeiro',
        dueDate: '2024-02-15',
        status: 'Pendente',
        createdAt: '2024-01-10'
      },
      {
        id: '3',
        title: 'Reunião com parceiros',
        description: 'Organizar reunião trimestral com parceiros estratégicos',
        assignedTo: '3',
        assignedToName: 'Maria Oliveira',
        sector: 'Diretoria',
        dueDate: '2024-02-01',
        status: 'Concluído',
        createdAt: '2024-01-05'
      },
      {
        id: '4',
        title: 'Atualização do site',
        description: 'Implementar melhorias na seção de projetos',
        assignedTo: '4',
        assignedToName: 'João Costa',
        sector: 'Projetos',
        dueDate: '2024-01-25',
        status: 'Em Andamento',
        createdAt: '2024-01-12'
      }
    ];

    setUsers(mockUsers);
    setTasks(mockTasks);
    setFilteredTasks(mockTasks);
  }, []);

  // Filter tasks based on selected filters
  useEffect(() => {
    let filtered = tasks;

    if (selectedSector !== 'Todos') {
      filtered = filtered.filter(task => task.sector === selectedSector);
    }

    if (selectedResponsible !== 'Todos') {
      filtered = filtered.filter(task => task.assignedTo === selectedResponsible);
    }

    setFilteredTasks(filtered);
  }, [tasks, selectedSector, selectedResponsible]);

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.assignedTo || !newTask.sector || !newTask.dueDate) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const assignedUser = users.find(user => user.id === newTask.assignedTo);
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      assignedToName: assignedUser?.name || '',
      assignedToAvatar: assignedUser?.avatar,
      sector: newTask.sector,
      dueDate: newTask.dueDate,
      status: newTask.status,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      sector: '',
      dueDate: '',
      status: 'Pendente'
    });
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: Task['status']) => {
    const variants = {
      'Pendente': { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      'Em Andamento': { variant: 'default' as const, icon: AlertCircle, color: 'text-blue-600' },
      'Concluído': { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      'Cancelado': { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`w-3 h-3 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  const groupTasksBySector = (tasks: Task[]) => {
    return tasks.reduce((groups, task) => {
      if (!groups[task.sector]) {
        groups[task.sector] = [];
      }
      groups[task.sector].push(task);
      return groups;
    }, {} as Record<string, Task[]>);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Componente de visualização em Gantt (simplificado)
  const GanttView = () => {
    const today = new Date();
    const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás
    const endDate = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 dias à frente

    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Visualização de Cronograma
          </h3>
          <p className="text-gray-600 mb-4">
            Aqui será implementada a visualização em linha do tempo (Gantt) das tarefas.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Esta funcionalidade será desenvolvida em uma próxima iteração e incluirá:
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• Barras horizontais representando a duração das tarefas</li>
              <li>• Visualização por semanas e meses</li>
              <li>• Dependências entre tarefas</li>
              <li>• Arrastar e soltar para reagendar</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agenda e Tarefas</h1>
            <p className="text-gray-600">Gerencie tarefas e projetos da equipe</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="sector-filter" className="text-sm font-medium">Setor:</Label>
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Label htmlFor="responsible-filter" className="text-sm font-medium">Responsável:</Label>
            <Select value={selectedResponsible} onValueChange={setSelectedResponsible}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
                <DialogDescription>
                  Adicione uma nova tarefa para a equipe
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Título da Tarefa *</Label>
                  <Input
                    id="task-title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Ex: Relatório mensal de atividades"
                  />
                </div>

                <div>
                  <Label htmlFor="task-description">Anotações/Descrição</Label>
                  <Textarea
                    id="task-description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Descreva os detalhes da tarefa..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="task-assignee">Atribuir a (Responsável) *</Label>
                  <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask({...newTask, assignedTo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="task-sector">Setor *</Label>
                  <Select value={newTask.sector} onValueChange={(value) => setNewTask({...newTask, sector: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um setor" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.filter(s => s !== 'Todos').map(sector => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="task-due-date">Data de Conclusão *</Label>
                  <Input
                    id="task-due-date"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="task-status">Status</Label>
                  <Select value={newTask.status} onValueChange={(value: any) => setNewTask({...newTask, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTask} className="bg-purple-600 hover:bg-purple-700">
                    Criar Tarefa
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Visualização com Abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-6">
          {Object.entries(groupTasksBySector(filteredTasks)).map(([sector, sectorTasks]) => (
            <Card key={sector}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  {sector} ({sectorTasks.length} tarefa{sectorTasks.length !== 1 ? 's' : ''})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome da Tarefa</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Data de Conclusão</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectorTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-gray-500 mt-1">{task.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={task.assignedToAvatar} />
                              <AvatarFallback className="text-xs">
                                {getInitials(task.assignedToName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{task.assignedToName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            {formatDate(task.dueDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(task.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}

          {filteredTasks.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma tarefa encontrada
                </h3>
                <p className="text-gray-600">
                  {selectedSector !== 'Todos' || selectedResponsible !== 'Todos' 
                    ? 'Tente ajustar os filtros ou criar uma nova tarefa.'
                    : 'Comece criando sua primeira tarefa clicando no botão "Nova Tarefa".'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cronograma">
          <Card>
            <CardHeader>
              <CardTitle>Cronograma de Tarefas</CardTitle>
              <CardDescription>
                Visualização em linha do tempo das tarefas e projetos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GanttView />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
