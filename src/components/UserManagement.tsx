import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Users, Edit, Trash2, Eye, EyeOff, AlertCircle, UserPlus, CheckCircle, XCircle, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from '../utils/toast';
import { useSupabase } from '../hooks/useSupabase';
import { User, SolicitacaoCadastro } from '../types';
import { secretarias, mockUsers } from '../lib/mockData';
import { SolicitacoesCadastro } from './SolicitacoesCadastro';
import { emailService } from '../lib/emailService';

interface UserFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'padrão';
  secretaria?: string;
}

interface UserManagementProps {
  currentUserId?: string;
}

export const UserManagement = ({ currentUserId }: UserManagementProps = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'padrão',
    secretaria: ''
  });
  
  // Estados para solicitações de cadastro
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCadastro[]>([]);
  const [solicitacaoEditando, setSolicitacaoEditando] = useState<SolicitacaoCadastro | null>(null);
  const [isAprovarDialogOpen, setIsAprovarDialogOpen] = useState(false);
  const [usuarioSenha, setUsuarioSenha] = useState('');
  const [usuarioUsername, setUsuarioUsername] = useState('');

  const supabase = useSupabase();

  // Estado para controlar envio de e-mail
  const [sendingEmailTo, setSendingEmailTo] = useState<string | null>(null);

  // Carregar usuários
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await supabase.getUsers();
      
      // Sempre carregar usuários dinâmicos do localStorage
      let dynamicUsers: User[] = [];
      try {
        const storedDynamicUsers = localStorage.getItem('transpjardim_dynamic_users');
        if (storedDynamicUsers) {
          dynamicUsers = JSON.parse(storedDynamicUsers);
          console.log(`📋 ${dynamicUsers.length} usuários dinâmicos carregados do localStorage`);
        }
      } catch (error) {
        console.warn('Erro ao carregar usuários dinâmicos:', error);
      }
      
      if (response.success && response.data) {
        // Backend disponível - combinar usuários do backend com dinâmicos
        setUsers([...response.data, ...dynamicUsers]);
        setBackendAvailable(true);
      } else {
        console.error('Erro ao carregar usuários:', response.error);
        
        // Se o backend não está disponível, usar dados mock + dinâmicos
        if (response.error?.includes('Failed to fetch') || 
            response.error?.includes('NetworkError')) {
          setBackendAvailable(false);
          setUsers([...mockUsers, ...dynamicUsers]);
          toast.error('Backend indisponível. Usando dados de demonstração + usuários locais.');
        } else {
          toast.error('Erro ao carregar usuários');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setBackendAvailable(false);
      
      // Carregar usuários dinâmicos criados localmente
      let dynamicUsers: User[] = [];
      try {
        const storedDynamicUsers = localStorage.getItem('transpjardim_dynamic_users');
        if (storedDynamicUsers) {
          dynamicUsers = JSON.parse(storedDynamicUsers);
        }
      } catch (error) {
        console.warn('Erro ao carregar usuários dinâmicos:', error);
      }
      
      setUsers([...mockUsers, ...dynamicUsers]);
      toast.error('Servidor indisponível. Modo demonstração ativado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtrar usuários baseado na busca
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.secretaria || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        username: user.username,
        email: user.email || '',
        password: '', // Não pré-preencher senha para edição
        role: user.role,
        secretaria: user.secretaria || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'padrão',
        secretaria: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setShowPassword(false);
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'padrão',
      secretaria: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim()) {
      toast.error('Nome, usuário e e-mail são obrigatórios');
      return;
    }

    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Por favor, digite um e-mail válido');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      toast.error('Senha é obrigatória para novos usuários');
      return;
    }

    if (formData.role === 'padrão' && !formData.secretaria) {
      toast.error('Usuários padrão devem ter uma secretaria associada');
      return;
    }

    setLoading(true);

    try {
      if (!backendAvailable) {
        // Modo demonstração - simular operação
        if (editingUser) {
          setUsers(prev => prev.map(user => 
            user.id === editingUser.id 
              ? { 
                  ...user, 
                  name: formData.name,
                  username: formData.username,
                  email: formData.email,
                  role: formData.role,
                  secretaria: formData.role === 'admin' ? undefined : formData.secretaria
                }
              : user
          ));
          
          // Persistir alterações no localStorage
          try {
            const existingDynamicUsers = localStorage.getItem('transpjardim_dynamic_users');
            let dynamicUsers = existingDynamicUsers ? JSON.parse(existingDynamicUsers) : [];
            
            // Atualizar usuário dinâmico se existir
            dynamicUsers = dynamicUsers.map((u: User) => 
              u.id === editingUser.id 
                ? {
                    ...u,
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    role: formData.role,
                    secretaria: formData.role === 'admin' ? undefined : formData.secretaria
                  }
                : u
            );
            
            localStorage.setItem('transpjardim_dynamic_users', JSON.stringify(dynamicUsers));
            
            // Atualizar senha se foi alterada
            if (formData.password) {
              const userPasswords = JSON.parse(localStorage.getItem('transpjardim_user_passwords') || '{}');
              userPasswords[formData.username] = formData.password;
              localStorage.setItem('transpjardim_user_passwords', JSON.stringify(userPasswords));
            }
            
            console.log(`✅ Usuário ${formData.username} atualizado no localStorage - Email: ${formData.email}`);
          } catch (error) {
            console.error('Erro ao persistir atualização do usuário:', error);
          }
          
          toast.success('Usuário atualizado (modo demonstração)');
        } else {
          const newUser: User = {
            id: `demo_${Date.now()}`,
            name: formData.name,
            username: formData.username,
            email: formData.email,
            role: formData.role,
            secretaria: formData.role === 'admin' ? undefined : formData.secretaria,
            dataCriacao: new Date().toISOString()
          };
          
          // Persistir usuário dinâmico para login
          try {
            const existingDynamicUsers = localStorage.getItem('transpjardim_dynamic_users');
            const dynamicUsers = existingDynamicUsers ? JSON.parse(existingDynamicUsers) : [];
            dynamicUsers.push(newUser);
            localStorage.setItem('transpjardim_dynamic_users', JSON.stringify(dynamicUsers));
            
            // Persistir senha padrão para o usuário
            const userPasswords = JSON.parse(localStorage.getItem('transpjardim_user_passwords') || '{}');
            userPasswords[formData.username] = formData.password;
            localStorage.setItem('transpjardim_user_passwords', JSON.stringify(userPasswords));
            
            console.log(`✅ Usuário ${formData.username} persistido com senha`);
          } catch (error) {
            console.error('Erro ao persistir usuário dinâmico:', error);
          }
          
          setUsers(prev => [...prev, newUser]);
          toast.success(`Usuário "${formData.username}" criado! Senha: "${formData.password}"`);
        }
        handleCloseDialog();
        return;
      }

      if (editingUser) {
        // Atualizar usuário
        const response = await supabase.updateUser(editingUser.id, {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          ...(formData.password && { password: formData.password }),
          role: formData.role,
          secretaria: formData.role === 'admin' ? undefined : formData.secretaria
        });

        if (response.success) {
          toast.success('Usuário atualizado com sucesso');
          loadUsers();
          handleCloseDialog();
        } else {
          toast.error(response.error || 'Erro ao atualizar usuário');
        }
      } else {
        // Criar novo usuário
        const response = await supabase.createUser({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          secretaria: formData.role === 'admin' ? undefined : formData.secretaria
        });

        if (response.success) {
          toast.success('Usuário criado com sucesso');
          loadUsers();
          handleCloseDialog();
        } else {
          toast.error(response.error || 'Erro ao criar usuário');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      if (!backendAvailable) {
        // Modo demonstração
        setUsers(prev => prev.filter(user => user.id !== userId));
        toast.success('Usuário excluído (modo demonstração)');
        return;
      }

      const response = await supabase.deleteUser(userId);
      
      if (response.success) {
        toast.success('Usuário excluído com sucesso');
        loadUsers();
      } else {
        toast.error(response.error || 'Erro ao excluir usuário');
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async (user: User) => {
    if (!user.email) {
      toast.error('Usuário não possui e-mail cadastrado');
      return;
    }

    setSendingEmailTo(user.id);
    
    try {
      console.log(`📧 Tentando enviar e-mail de teste para ${user.name} (${user.email})...`);
      
      const result = await emailService.sendTestEmail(user.email);
      
      console.log('📧 Resultado do envio:', result);
      
      // Verificar diferentes tipos de resposta
      if (result.success) {
        // Sucesso completo - e-mail enviado para o destinatário correto
        if (result.testMode && result.authorizedEmail) {
          // E-mail foi redirecionado pelo Resend (sandbox mode)
          toast.warning(`⚠️ E-mail redirecionado (Resend Sandbox)`, {
            description: `O Resend está em modo sandbox. E-mail enviado para ${result.authorizedEmail} em vez de ${user.email}. Configure o domínio transpjardim.com no Resend para produção.`,
            duration: 8000
          });
        } else {
          // E-mail enviado com sucesso para o destinatário correto
          toast.success(`✅ E-mail de teste enviado para ${user.email}!`, {
            description: `ID: ${result.emailId || 'N/A'}. Verifique a caixa de entrada.`
          });
        }
      } else {
        // Erro no envio - identificar tipo específico
        const errorType = (result as any).errorType || 'unknown';
        const errorMsg = result.error || result.message || 'Erro desconhecido';
        const errorDetails = (result as any).details || '';
        const errorAction = (result as any).action || '';
        
        console.error('❌ Erro ao enviar e-mail:', { errorType, errorMsg, errorDetails, errorAction });
        
        // Mensagens específicas por tipo de erro
        if (errorType === 'sandbox-restriction' || errorMsg.includes('sandbox') || errorMsg.includes('Sandbox')) {
          toast.error(`⚠️ Resend em Modo Sandbox`, {
            description: `${errorDetails || 'A API Key do Resend só pode enviar e-mails para o e-mail cadastrado na conta.'}\n\n✅ Solução: Adicione e verifique o domínio transpjardim.com no Resend.\n📖 Veja: GUIA_CONFIGURACAO_DOMINIO_RESEND.md`,
            duration: 10000
          });
        } else if (errorType === 'invalid_api_key' || errorMsg.includes('API Key')) {
          toast.error(`❌ API Key Inválida`, {
            description: `${errorDetails || 'A API Key do Resend está incorreta ou expirada.'}\n\n🔧 Solução: Verifique a API Key em resend.com/api-keys e atualize nas Configurações do Sistema.`,
            duration: 8000
          });
        } else if (errorType === 'missing_api_key') {
          toast.error(`⚙️ API Key Não Configurada`, {
            description: 'Configure a API Key do Resend nas Configurações do Sistema.',
            duration: 6000
          });
        } else {
          // Erro genérico
          toast.error(`❌ Falha ao enviar e-mail de teste`, {
            description: `${errorMsg}${errorDetails ? `\n\n${errorDetails}` : ''}${errorAction ? `\n\n${errorAction}` : ''}`,
            duration: 8000
          });
        }
      }
    } catch (error) {
      console.error('❌ Exceção ao enviar e-mail de teste:', error);
      toast.error('❌ Erro ao enviar e-mail de teste', {
        description: error instanceof Error ? error.message : 'Erro de comunicação com o servidor. Verifique sua conexão.',
        duration: 6000
      });
    } finally {
      setSendingEmailTo(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-[var(--jardim-green)] p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-[var(--jardim-green)]">Gerenciamento de Usuários</CardTitle>
                <CardDescription>
                  Gerencie usuários e solicitações de cadastro do TranspJardim
                </CardDescription>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="bg-[var(--jardim-green)] hover:bg-[var(--jardim-green-light)]">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUser ? 'Edite as informações do usuário' : 'Preencha os dados do novo usuário'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: João Silva"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de Usuário</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Ex: joao.silva"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Ex: joao.silva@jardim.ce.gov.br"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {editingUser ? 'Nova Senha (deixe vazio para não alterar)' : 'Senha'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder={editingUser ? "Digite apenas se quiser alterar" : "Digite a senha"}
                        required={!editingUser}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Nível de Acesso</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: 'admin' | 'padrão') => 
                        setFormData(prev => ({ 
                          ...prev, 
                          role: value,
                          secretaria: value === 'admin' ? '' : prev.secretaria
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="padrão">Usuário Padrão</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.role === 'padrão' && (
                    <div className="space-y-2">
                      <Label htmlFor="secretaria">Secretaria</Label>
                      <Select
                        value={formData.secretaria}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, secretaria: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a secretaria" />
                        </SelectTrigger>
                        <SelectContent>
                          {secretarias.map((secretaria) => (
                            <SelectItem key={secretaria} value={secretaria}>
                              {secretaria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.role === 'admin' && (
                    <Alert>
                      <AlertDescription>
                        Administradores têm acesso a todos os critérios e funcionalidades do sistema.
                      </AlertDescription>
                    </Alert>
                  )}

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDialog}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-[var(--jardim-green)] hover:bg-[var(--jardim-green-light)]"
                    >
                      {loading ? 'Salvando...' : editingUser ? 'Atualizar' : 'Criar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="usuarios" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="usuarios">
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="solicitacoes">
                <UserPlus className="h-4 w-4 mr-2" />
                Solicitações de Cadastro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="usuarios" className="space-y-4 mt-6">
              <div className="space-y-4">
                {/* Aviso sobre modo demonstração */}
                {!backendAvailable && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>Modo Demonstração:</strong> O backend não está disponível. 
                      As alterações são temporárias e serão perdidas ao recarregar a página.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Barra de pesquisa */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome, usuário, e-mail ou secretaria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                    <div className="text-sm text-blue-600">Total de Usuários</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">
                      {users.filter(u => u.role === 'admin').length}
                    </div>
                    <div className="text-sm text-green-600">Administradores</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-purple-600">
                      {users.filter(u => u.role === 'padrão').length}
                    </div>
                    <div className="text-sm text-purple-600">Usuários Padrão</div>
                  </div>
                </div>

                {/* Tabela de usuários */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Nível</TableHead>
                        <TableHead>Secretaria</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow key="loading">
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--jardim-green)]"></div>
                              <span>Carregando usuários...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
                        <TableRow key="empty">
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell className="font-mono text-sm">{user.username}</TableCell>
                            <TableCell className="text-sm text-blue-600">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role === 'admin' ? 'Administrador' : 'Usuário Padrão'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.secretaria ? (
                                <span className="text-sm">{user.secretaria}</span>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDialog(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id, user.name)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSendTestEmail(user)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  disabled={sendingEmailTo === user.id}
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="solicitacoes" className="space-y-4 mt-6">
              <SolicitacoesCadastro 
                currentUserId={currentUserId} 
                onUsuarioCriado={loadUsers}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Seção de Credenciais de Teste */}
      <Card className="shadow-sm border border-[var(--border)]">
        <CardHeader className="bg-[var(--jardim-green-lighter)] border-b border-[var(--border)]">
          <CardTitle className="text-[var(--jardim-green)] flex items-center gap-2">
            <Users className="h-5 w-5" />
            Credenciais de Teste
          </CardTitle>
          <CardDescription>
            Credenciais padrão para acesso ao sistema em modo de desenvolvimento
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-[var(--jardim-green)]">👤 Administrador</h4>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="text-sm"><strong>Usuário:</strong> <code className="bg-white px-2 py-1 rounded font-mono">admin</code></p>
                <p className="text-sm"><strong>Senha:</strong> <code className="bg-white px-2 py-1 rounded font-mono">admin</code></p>
                <p className="text-xs text-gray-600 mt-1">Acesso completo ao sistema</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm text-[var(--jardim-green)]">👥 Usuários Padrão</h4>
              <div className="space-y-2">
                <div className="bg-gray-50 p-2 rounded border text-sm">
                  <p>🎓 <strong>Educação:</strong> <code className="bg-white px-1 rounded font-mono">educacao</code> / <code className="bg-white px-1 rounded font-mono">123</code></p>
                </div>
                <div className="bg-gray-50 p-2 rounded border text-sm">
                  <p>🏥 <strong>Saúde:</strong> <code className="bg-white px-1 rounded font-mono">saude</code> / <code className="bg-white px-1 rounded font-mono">123</code></p>
                </div>
                <div className="bg-gray-50 p-2 rounded border text-sm">
                  <p>🏗️ <strong>Obras:</strong> <code className="bg-white px-1 rounded font-mono">obras</code> / <code className="bg-white px-1 rounded font-mono">123</code></p>
                </div>
                <div className="bg-gray-50 p-2 rounded border text-sm">
                  <p>🌱 <strong>Ambiente:</strong> <code className="bg-white px-1 rounded font-mono">ambiente</code> / <code className="bg-white px-1 rounded font-mono">123</code></p>
                </div>
              </div>
            </div>
          </div>

          <Alert className="mt-4 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Importante:</strong> Em ambiente de produção, altere todas as senhas padrão e 
              crie usuários específicos para cada secretaria com credenciais seguras.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};