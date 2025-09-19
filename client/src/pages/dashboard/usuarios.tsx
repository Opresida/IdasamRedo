
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Users, Plus, Edit, Trash2, Shield, Settings } from 'lucide-react';

// Tipos
interface User {
  id: string;
  name: string;
  email: string;
  sector: string;
  status: 'Ativo' | 'Inativo';
  createdAt: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  isHighLevel?: boolean;
}

interface Sector {
  id: string;
  name: string;
  permissions: string[];
}

// Dados fictícios para popular a tabela
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@idasam.org',
    sector: 'Admin',
    status: 'Ativo',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Carlos Santos',
    email: 'carlos.santos@idasam.org',
    sector: 'Financeiro',
    status: 'Ativo',
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@idasam.org',
    sector: 'Imprensa',
    status: 'Ativo',
    createdAt: '2024-01-08'
  },
  {
    id: '4',
    name: 'João Costa',
    email: 'joao.costa@idasam.org',
    sector: 'Projetos',
    status: 'Inativo',
    createdAt: '2024-01-05'
  },
  {
    id: '5',
    name: 'Patricia Lima',
    email: 'patricia.lima@idasam.org',
    sector: 'Financeiro',
    status: 'Ativo',
    createdAt: '2024-01-03'
  }
];

const sectorOptions = ['Admin', 'Financeiro', 'Imprensa', 'Projetos'];

// Permissões disponíveis no sistema
const availablePermissions: Permission[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Pode ver a tela inicial de resumo'
  },
  {
    id: 'imprensa',
    name: 'Imprensa',
    description: 'Pode ver, criar e editar artigos e comentários'
  },
  {
    id: 'financeiro',
    name: 'Financeiro',
    description: 'Pode ver e gerenciar todas as finanças'
  },
  {
    id: 'agenda',
    name: 'Agenda',
    description: 'Pode ver e gerenciar tarefas'
  },
  {
    id: 'projetos',
    name: 'Projetos',
    description: 'Pode ver e gerenciar projetos'
  },
  {
    id: 'usuarios',
    name: 'Usuários',
    description: 'Pode criar/editar usuários e alterar permissões',
    isHighLevel: true
  }
];

// Setores com suas permissões
const mockSectors: Sector[] = [
  {
    id: '1',
    name: 'Admin',
    permissions: ['dashboard', 'imprensa', 'financeiro', 'agenda', 'projetos', 'usuarios']
  },
  {
    id: '2',
    name: 'Financeiro',
    permissions: ['dashboard', 'financeiro']
  },
  {
    id: '3',
    name: 'Imprensa',
    permissions: ['dashboard', 'imprensa']
  },
  {
    id: '4',
    name: 'Projetos',
    permissions: ['dashboard', 'projetos']
  }
];

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Estados para gerenciamento de permissões
  const [sectors, setSectors] = useState<Sector[]>(mockSectors);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(mockSectors[0]);
  const [isNewSectorDialogOpen, setIsNewSectorDialogOpen] = useState(false);
  const [newSectorName, setNewSectorName] = useState('');

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    sector: '',
    status: true
  });

  // Handlers
  const handleNewUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      sector: '',
      status: true
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Senha fica vazia ao editar
      sector: user.sector,
      status: user.status === 'Ativo'
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    const confirmMessage = `Tem certeza que deseja excluir o usuário "${userToDelete.name}"?\n\nEsta ação não pode ser desfeita.`;
    
    if (window.confirm(confirmMessage)) {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      alert('Usuário excluído com sucesso!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.sector) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (editingUser) {
      // Editar usuário existente
      const updatedUser: User = {
        ...editingUser,
        name: formData.name,
        email: formData.email,
        sector: formData.sector,
        status: formData.status ? 'Ativo' : 'Inativo'
      };

      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === editingUser.id ? updatedUser : user
        )
      );
      alert('Usuário atualizado com sucesso!');
    } else {
      // Criar novo usuário
      if (!formData.password) {
        alert('A senha é obrigatória para novos usuários.');
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        sector: formData.sector,
        status: formData.status ? 'Ativo' : 'Inativo',
        createdAt: new Date().toISOString().split('T')[0]
      };

      setUsers(prevUsers => [newUser, ...prevUsers]);
      alert('Usuário criado com sucesso!');
    }

    setIsDialogOpen(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      sector: '',
      status: true
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handlers para gerenciamento de permissões
  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    if (!selectedSector) return;

    const updatedSector = {
      ...selectedSector,
      permissions: checked 
        ? [...selectedSector.permissions, permissionId]
        : selectedSector.permissions.filter(p => p !== permissionId)
    };

    setSelectedSector(updatedSector);
    setSectors(prevSectors => 
      prevSectors.map(sector => 
        sector.id === selectedSector.id ? updatedSector : sector
      )
    );
  };

  const handleSectorNameChange = (newName: string) => {
    if (!selectedSector) return;

    const updatedSector = {
      ...selectedSector,
      name: newName
    };

    setSelectedSector(updatedSector);
    setSectors(prevSectors => 
      prevSectors.map(sector => 
        sector.id === selectedSector.id ? updatedSector : sector
      )
    );
  };

  const handleCreateNewSector = () => {
    if (!newSectorName.trim()) {
      alert('Por favor, digite um nome para o novo setor.');
      return;
    }

    const newSector: Sector = {
      id: Date.now().toString(),
      name: newSectorName,
      permissions: ['dashboard'] // Todo setor tem acesso ao dashboard por padrão
    };

    setSectors(prev => [...prev, newSector]);
    setSelectedSector(newSector);
    setNewSectorName('');
    setIsNewSectorDialogOpen(false);
    alert('Novo setor criado com sucesso!');
  };

  const handleDeleteSector = (sectorId: string) => {
    const sectorToDelete = sectors.find(s => s.id === sectorId);
    if (!sectorToDelete) return;

    // Verificar se há usuários usando este setor
    const hasUsers = users.some(u => u.sector === sectorToDelete.name);
    if (hasUsers) {
      alert(`Não é possível excluir o setor "${sectorToDelete.name}" pois existem usuários vinculados a ele.`);
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o setor "${sectorToDelete.name}"?`)) {
      setSectors(prev => prev.filter(s => s.id !== sectorId));
      if (selectedSector?.id === sectorId) {
        setSelectedSector(sectors.find(s => s.id !== sectorId) || null);
      }
      alert('Setor excluído com sucesso!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600 mt-2">
            Administre os usuários do sistema e suas permissões de acesso
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewUser} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-5 h-5 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Modifique as informações do usuário selecionado' 
                  : 'Preencha os dados para criar um novo usuário'
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Login) *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@idasam.org"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {editingUser ? 'Nova Senha (deixe vazio para manter a atual)' : 'Senha *'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={editingUser ? 'Digite para alterar a senha' : 'Digite a senha'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required={!editingUser}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector">Setor (Permissão) *</Label>
                <Select value={formData.sector} onValueChange={(value) => handleInputChange('sector', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectorOptions.map(sector => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="status">Usuário Ativo</Label>
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) => handleInputChange('status', checked)}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {editingUser ? 'Atualizar' : 'Criar'} Usuário
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sistema de Abas */}
      <Tabs defaultValue="usuarios" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Lista de Usuários
          </TabsTrigger>
          <TabsTrigger value="permissoes" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Gerenciar Permissões
          </TabsTrigger>
        </TabsList>

        {/* Aba: Lista de Usuários */}
        <TabsContent value="usuarios" className="space-y-6">
          {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(user => user.status === 'Ativo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Usuários Inativos</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(user => user.status === 'Inativo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(user => user.sector === 'Admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Setor (Permissão)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={
                      user.sector === 'Admin' ? 'default' :
                      user.sector === 'Financeiro' ? 'secondary' :
                      user.sector === 'Imprensa' ? 'outline' : 'destructive'
                    }>
                      {user.sector}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Ativo' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        title="Editar usuário"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Excluir usuário"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Aba: Gerenciar Permissões */}
        <TabsContent value="permissoes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda: Lista de Setores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Setores
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {sectors.map((sector) => (
                    <div
                      key={sector.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
                        selectedSector?.id === sector.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-transparent'
                      }`}
                      onClick={() => setSelectedSector(sector)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{sector.name}</h4>
                          <p className="text-xs text-gray-500">
                            {sector.permissions.length} permissão(ões)
                          </p>
                        </div>
                        {sector.name !== 'Admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSector(sector.id);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="p-3">
                  <Dialog open={isNewSectorDialogOpen} onOpenChange={setIsNewSectorDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Setor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Criar Novo Setor</DialogTitle>
                        <DialogDescription>
                          Digite o nome do novo setor. Ele terá acesso ao Dashboard por padrão.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="sector-name">Nome do Setor</Label>
                          <Input
                            id="sector-name"
                            placeholder="Ex: Marketing, Recursos Humanos..."
                            value={newSectorName}
                            onChange={(e) => setNewSectorName(e.target.value)}
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsNewSectorDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={handleCreateNewSector}
                            className="flex-1"
                          >
                            Criar Setor
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Coluna Direita: Configuração de Permissões */}
            <div className="lg:col-span-2">
              {selectedSector ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Permissões do Setor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Nome do Setor (editável) */}
                    <div className="space-y-2">
                      <Label htmlFor="sector-name-edit">Nome do Setor</Label>
                      <Input
                        id="sector-name-edit"
                        value={selectedSector.name}
                        onChange={(e) => handleSectorNameChange(e.target.value)}
                        disabled={selectedSector.name === 'Admin'}
                        className={selectedSector.name === 'Admin' ? 'bg-gray-100' : ''}
                      />
                      {selectedSector.name === 'Admin' && (
                        <p className="text-xs text-gray-500">
                          O setor Admin não pode ser renomeado por segurança
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Matrix de Permissões */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">
                        Permissões de Acesso para o setor "{selectedSector.name}":
                      </h4>
                      
                      <div className="space-y-4">
                        {availablePermissions.map((permission) => {
                          const isChecked = selectedSector.permissions.includes(permission.id);
                          const isDisabled = selectedSector.name === 'Admin' && permission.id === 'usuarios';
                          
                          return (
                            <div key={permission.id} className="flex items-start space-x-3">
                              <Checkbox
                                id={`permission-${permission.id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => 
                                  handlePermissionToggle(permission.id, checked as boolean)
                                }
                                disabled={isDisabled}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <Label 
                                  htmlFor={`permission-${permission.id}`}
                                  className={`font-medium cursor-pointer ${
                                    permission.isHighLevel ? 'text-red-600' : ''
                                  }`}
                                >
                                  {permission.name}
                                  {permission.isHighLevel && (
                                    <Badge variant="destructive" className="ml-2 text-xs">
                                      Alto Nível
                                    </Badge>
                                  )}
                                </Label>
                                <p className="text-sm text-gray-600 mt-1">
                                  {permission.description}
                                </p>
                                {permission.isHighLevel && (
                                  <p className="text-xs text-red-500 mt-1">
                                    ⚠️ Esta é uma permissão de alto nível que concede acesso administrativo
                                  </p>
                                )}
                                {isDisabled && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Permissão sempre ativa para Administradores
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Resumo das Permissões */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">
                        Resumo das Permissões Ativas:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedSector.permissions.map(permId => {
                          const permission = availablePermissions.find(p => p.id === permId);
                          return permission ? (
                            <Badge 
                              key={permId} 
                              variant={permission.isHighLevel ? "destructive" : "secondary"}
                            >
                              {permission.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Selecione um Setor
                    </h3>
                    <p className="text-gray-600">
                      Escolha um setor na lista à esquerda para configurar suas permissões
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
