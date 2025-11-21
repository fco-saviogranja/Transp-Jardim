import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Building2, Plus, Edit, Trash2, AlertTriangle, Database, HardDrive } from 'lucide-react';
import { useSecretarias } from '../hooks/useSecretarias';
import { toast } from '../utils/toast';
import { JardimBreadcrumb } from './JardimBreadcrumb';

interface Secretaria {
  id: string;
  nome: string;
  sigla?: string;
  descricao?: string;
  data_criacao: string;
}

interface SecretariasManagerProps {
  onBack?: () => void;
}

export const SecretariasManager = ({ onBack }: SecretariasManagerProps) => {
  const {
    secretarias,
    loading,
    usingLocalStorage,
    tableExists,
    createSecretaria,
    updateSecretaria,
    deleteSecretaria,
    migrateToSupabase,
    refresh
  } = useSecretarias();

  const [showDialog, setShowDialog] = useState(false);
  const [editingSecretaria, setEditingSecretaria] = useState<Secretaria | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    sigla: '',
    descricao: ''
  });

  const handleOpenDialog = (secretaria?: Secretaria) => {
    if (secretaria) {
      setEditingSecretaria(secretaria);
      setFormData({
        nome: secretaria.nome,
        sigla: secretaria.sigla || '',
        descricao: secretaria.descricao || ''
      });
    } else {
      setEditingSecretaria(null);
      setFormData({
        nome: '',
        sigla: '',
        descricao: ''
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingSecretaria(null);
    setFormData({
      nome: '',
      sigla: '',
      descricao: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast.error('O nome da secretaria é obrigatório');
      return;
    }

    try {
      if (editingSecretaria) {
        // Editar secretaria existente
        const response = await updateSecretaria(editingSecretaria.id, formData);
        if (response.success) {
          toast.success('Secretaria atualizada com sucesso!');
          refresh();
          handleCloseDialog();
        } else {
          toast.error(response.error || 'Erro ao atualizar secretaria');
        }
      } else {
        // Criar nova secretaria
        const response = await createSecretaria(formData);
        if (response.success) {
          toast.success('Secretaria criada com sucesso!');
          refresh();
          handleCloseDialog();
        } else {
          toast.error(response.error || 'Erro ao criar secretaria');
        }
      }
    } catch (error) {
      console.error('[SecretariasManager] Erro ao salvar secretaria:', error);
      toast.error('Erro ao salvar secretaria');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteSecretaria(id);
      if (response.success) {
        toast.success('Secretaria excluída com sucesso!');
        refresh();
      } else {
        toast.error(response.error || 'Erro ao excluir secretaria');
      }
    } catch (error) {
      console.error('[SecretariasManager] Erro ao excluir secretaria:', error);
      toast.error('Erro ao excluir secretaria');
    }
  };

  return (
    <div className="space-y-6">
      <JardimBreadcrumb
        items={[
          { label: 'Critérios de Controle', onClick: onBack },
          { label: 'Gerenciar Secretarias' }
        ]}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--jardim-green-lighter)]">
                <Building2 className="h-5 w-5 text-[var(--jardim-green)]" />
              </div>
              <div>
                <CardTitle>Gerenciar Secretarias</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Cadastre e gerencie as secretarias do município
                </p>
              </div>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Secretaria
            </Button>
          </div>
          
          {/* Banner de modo localStorage */}
          {usingLocalStorage && (
            <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800">
                  <strong>Modo Local:</strong> Dados salvos no navegador. Para sincronizar com o banco de dados, execute o SQL do arquivo <code className="bg-blue-100 px-1 rounded">EXECUTAR_AGORA.sql</code> no Supabase.
                </p>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando secretarias...
            </div>
          ) : !tableExists ? (
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-8 w-8 text-orange-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 mb-2">
                      Tabela de Secretarias Não Encontrada
                    </h3>
                    <p className="text-sm text-orange-800 mb-4">
                      A tabela de secretarias ainda não foi criada no banco de dados Supabase.
                      Para ativar o gerenciamento de secretarias, execute o SQL abaixo:
                    </p>
                    
                    <div className="space-y-3">
                      <div className="bg-white rounded-md p-4 border border-orange-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">📋 Passo a passo:</p>
                        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                          <li>Acesse o <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a></li>
                          <li>Selecione o projeto TranspJardim</li>
                          <li>Vá em <strong>SQL Editor</strong> no menu lateral</li>
                          <li>Clique em <strong>New Query</strong></li>
                          <li>Copie e cole o SQL do arquivo <code className="bg-gray-100 px-1 rounded">EXECUTAR_AGORA.sql</code></li>
                          <li>Clique em <strong>Run</strong> (ou Ctrl+Enter)</li>
                          <li>Recarregue esta página</li>
                        </ol>
                      </div>
                      
                      <Button 
                        onClick={() => refresh()}
                        variant="outline"
                        className="w-full"
                      >
                        🔄 Tentar Novamente
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : secretarias.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma secretaria cadastrada
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeira Secretaria
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Sigla</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {secretarias.map((secretaria) => (
                  <TableRow key={secretaria.id}>
                    <TableCell className="font-medium">
                      {secretaria.nome}
                    </TableCell>
                    <TableCell>
                      {secretaria.sigla || '-'}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {secretaria.descricao || '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(secretaria.data_criacao).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(secretaria)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a secretaria "{secretaria.nome}"?
                                <br /><br />
                                <div className="flex items-center gap-2 text-orange-600">
                                  <AlertTriangle className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    Atenção: Critérios vinculados a esta secretaria podem ser afetados.
                                  </span>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(secretaria.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar/Editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSecretaria ? 'Editar Secretaria' : 'Nova Secretaria'}
            </DialogTitle>
            <DialogDescription>
              {editingSecretaria 
                ? 'Atualize as informações da secretaria' 
                : 'Preencha os dados da nova secretaria'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Secretaria *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Secretaria de Educação"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sigla">Sigla</Label>
                <Input
                  id="sigla"
                  value={formData.sigla}
                  onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                  placeholder="Ex: SEDUC"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Breve descrição da secretaria"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingSecretaria ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};