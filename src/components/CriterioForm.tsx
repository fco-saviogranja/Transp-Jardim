import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Criterio } from '../types';
import { secretarias } from '../lib/mockData';
import { toast } from '../utils/toast';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { User } from '../types';

interface CriterioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (criterio: Omit<Criterio, 'id'>) => void;
  editCriterio?: Criterio | null;
}

export const CriterioForm = ({ isOpen, onClose, onSubmit, editCriterio }: CriterioFormProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    status: 'ativo' as 'ativo' | 'inativo' | 'pendente' | 'vencido',
    valor: 0,
    meta: 100, // Meta sempre fixa em 100%
    dataVencimento: '',
    responsavel: '',
    secretaria: '',
    descricao: '',
    periodicidade: 'mensal' as '15_dias' | '30_dias' | 'mensal' | 'bimestral' | 'semestral' | 'anual'
  });

  const [loading, setLoading] = useState(false);
  const [responsaveisDisponiveis, setResponsaveisDisponiveis] = useState<User[]>([]);
  const [loadingResponsaveis, setLoadingResponsaveis] = useState(false);

  // Resetar form quando o dialog abrir/fechar ou quando editCriterio mudar
  useEffect(() => {
    if (isOpen) {
      if (editCriterio) {
        setFormData({
          nome: editCriterio.nome,
          status: editCriterio.status,
          valor: editCriterio.valor,
          meta: 100, // Meta sempre fixa em 100%
          dataVencimento: editCriterio.dataVencimento,
          responsavel: editCriterio.responsavel,
          secretaria: editCriterio.secretaria,
          descricao: editCriterio.descricao,
          periodicidade: editCriterio.periodicidade
        });
        // Buscar responsáveis da secretaria do critério sendo editado
        if (editCriterio.secretaria) {
          buscarResponsaveisPorSecretaria(editCriterio.secretaria);
        }
      } else {
        setFormData({
          nome: '',
          status: 'ativo',
          valor: 0,
          meta: 100,
          dataVencimento: '',
          responsavel: '',
          secretaria: '',
          descricao: '',
          periodicidade: 'mensal'
        });
        setResponsaveisDisponiveis([]);
      }
    }
  }, [isOpen, editCriterio]);

  // Buscar responsáveis quando a secretaria mudar
  const buscarResponsaveisPorSecretaria = async (secretaria: string) => {
    if (!secretaria) {
      setResponsaveisDisponiveis([]);
      return;
    }

    setLoadingResponsaveis(true);
    try {
      console.log('Buscando responsáveis para secretaria:', secretaria);
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/users/by-secretaria/${encodeURIComponent(secretaria)}`;
      console.log('URL da requisição:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Status da resposta:', response.status);
      
      const result = await response.json();
      console.log('Resultado completo:', result);

      if (!response.ok) {
        throw new Error(result.error || `Erro HTTP ${response.status}`);
      }
      
      if (result.success && Array.isArray(result.data)) {
        setResponsaveisDisponiveis(result.data);
        console.log(`${result.data.length} responsáveis encontrados para ${secretaria}`);
      } else {
        setResponsaveisDisponiveis([]);
        console.warn('Resposta sem dados:', result);
      }
    } catch (error) {
      console.error('Erro detalhado ao buscar responsáveis:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao buscar responsáveis: ${errorMessage}`);
      setResponsaveisDisponiveis([]);
    } finally {
      setLoadingResponsaveis(false);
    }
  };

  // Atualizar responsáveis quando secretaria mudar
  useEffect(() => {
    if (formData.secretaria) {
      buscarResponsaveisPorSecretaria(formData.secretaria);
      // Limpar responsável selecionado ao mudar secretaria (exceto quando estiver editando)
      if (!editCriterio || formData.secretaria !== editCriterio.secretaria) {
        setFormData(prev => ({ ...prev, responsavel: '' }));
      }
    } else {
      setResponsaveisDisponiveis([]);
      setFormData(prev => ({ ...prev, responsavel: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.secretaria]);

  const statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'inativo', label: 'Inativo' },
    { value: 'vencido', label: 'Vencido' }
  ];

  const periodicidadeOptions = [
    { value: '15_dias', label: 'A cada 15 dias' },
    { value: '30_dias', label: 'A cada 30 dias' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'bimestral', label: 'Bimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações básicas
      if (!formData.nome.trim()) {
        toast.error('O nome do critério é obrigatório');
        return;
      }

      if (!formData.responsavel.trim()) {
        toast.error('O responsável é obrigatório');
        return;
      }

      if (!formData.secretaria) {
        toast.error('A secretaria é obrigatória');
        return;
      }

      if (!formData.periodicidade) {
        toast.error('A periodicidade é obrigatória');
        return;
      }

      if (formData.valor < 0 || formData.valor > 100) {
        toast.error('O valor atual deve estar entre 0 e 100');
        return;
      }

      // Validar data de vencimento
      if (formData.dataVencimento) {
        const dataVencimento = new Date(formData.dataVencimento);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        if (dataVencimento < hoje) {
          toast.error('A data de vencimento não pode ser anterior a hoje');
          return;
        }
      }

      onSubmit({
        ...formData,
        meta: 100, // Garantir que a meta seja sempre 100%
        nome: formData.nome.trim(),
        responsavel: formData.responsavel.trim(),
        descricao: formData.descricao.trim()
      });

      toast.success(editCriterio ? 'Critério atualizado com sucesso!' : 'Critério criado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar critério:', error);
      toast.error('Erro ao salvar critério. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editCriterio ? 'Editar Critério' : 'Novo Critério'}
          </DialogTitle>
          <DialogDescription>
            {editCriterio 
              ? 'Edite as informações do critério selecionado'
              : 'Preencha as informações para criar um novo critério'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Critério *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Ex: Taxa de Escolarização Infantil"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secretaria">Secretaria *</Label>
              <Select value={formData.secretaria} onValueChange={(value) => handleChange('secretaria', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a secretaria" />
                </SelectTrigger>
                <SelectContent>
                  {secretarias.map(secretaria => (
                    <SelectItem key={secretaria} value={secretaria}>
                      {secretaria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável *</Label>
              <Select 
                value={formData.responsavel} 
                onValueChange={(value) => handleChange('responsavel', value)}
                disabled={!formData.secretaria || loadingResponsaveis || responsaveisDisponiveis.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !formData.secretaria 
                      ? "Selecione primeiro a secretaria" 
                      : loadingResponsaveis 
                        ? "Carregando..." 
                        : responsaveisDisponiveis.length === 0
                          ? "Nenhum responsável nesta secretaria"
                          : "Selecione o responsável"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {responsaveisDisponiveis.map(user => (
                    <SelectItem key={user.id} value={user.name}>
                      {user.name} ({user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.secretaria && responsaveisDisponiveis.length === 0 && !loadingResponsaveis && (
                <p className="text-sm text-muted-foreground">
                  Nenhum usuário cadastrado nesta secretaria
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor Atual (%)</Label>
              <Input
                id="valor"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.valor}
                onChange={(e) => handleChange('valor', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta">Meta (%)</Label>
              <Input
                id="meta"
                type="number"
                value={100}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
              <p className="text-sm text-muted-foreground">
                Todas as metas são fixas em 100%
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataVencimento">Data de Vencimento</Label>
              <Input
                id="dataVencimento"
                type="date"
                value={formData.dataVencimento}
                onChange={(e) => handleChange('dataVencimento', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodicidade">Periodicidade *</Label>
              <Select value={formData.periodicidade} onValueChange={(value) => handleChange('periodicidade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a periodicidade" />
                </SelectTrigger>
                <SelectContent>
                  {periodicidadeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                placeholder="Descreva os detalhes e objetivos do critério..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (editCriterio ? 'Atualizar' : 'Criar Critério')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};