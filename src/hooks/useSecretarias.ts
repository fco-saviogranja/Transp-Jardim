import { useState, useEffect } from 'react';
import { supabaseClient } from './useSupabaseClient';

interface Secretaria {
  id: string;
  nome: string;
  sigla?: string;
  descricao?: string;
  data_criacao: string;
  updated_at?: string;
}

const STORAGE_KEY = 'transpjardim_secretarias';

// Secretarias padrão
const SECRETARIAS_PADRAO: Secretaria[] = [
  {
    id: '1',
    nome: 'Secretaria de Educação',
    sigla: 'SEDUC',
    descricao: 'Responsável pela educação municipal',
    data_criacao: new Date().toISOString()
  },
  {
    id: '2',
    nome: 'Secretaria de Saúde',
    sigla: 'SESAU',
    descricao: 'Responsável pela saúde pública',
    data_criacao: new Date().toISOString()
  },
  {
    id: '3',
    nome: 'Secretaria de Obras e Infraestrutura',
    sigla: 'SEOBRAS',
    descricao: 'Responsável por obras públicas',
    data_criacao: new Date().toISOString()
  },
  {
    id: '4',
    nome: 'Secretaria de Meio Ambiente',
    sigla: 'SEMAM',
    descricao: 'Responsável pelo meio ambiente',
    data_criacao: new Date().toISOString()
  },
  {
    id: '5',
    nome: 'Secretaria de Habitação e Desenvolvimento Social',
    sigla: 'SEHAB',
    descricao: 'Responsável por habitação',
    data_criacao: new Date().toISOString()
  },
  {
    id: '6',
    nome: 'Secretaria de Administração e Finanças',
    sigla: 'SEADM',
    descricao: 'Responsável pela administração',
    data_criacao: new Date().toISOString()
  },
  {
    id: '7',
    nome: 'Secretaria de Cultura, Esporte e Lazer',
    sigla: 'SECEL',
    descricao: 'Responsável por cultura e esporte',
    data_criacao: new Date().toISOString()
  }
];

export const useSecretarias = () => {
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);
  const [tableExists, setTableExists] = useState<boolean | null>(null);

  // Inicializar secretarias
  useEffect(() => {
    initSecretarias();
  }, []);

  const initSecretarias = async () => {
    setLoading(true);
    
    // Tentar buscar do Supabase primeiro
    try {
      const { data, error } = await supabaseClient
        .from('secretarias')
        .select('*')
        .order('nome', { ascending: true });

      if (!error && data) {
        // Tabela existe no Supabase
        console.log('✅ Secretarias carregadas do Supabase:', data.length);
        setSecretarias(data);
        setTableExists(true);
        setUsingLocalStorage(false);
        setLoading(false);
        return;
      }

      // Se erro for de tabela não encontrada, usar localStorage
      if (error && (error.code === 'PGRST205' || error.message.includes('not find'))) {
        console.log('⚠️ Tabela secretarias não encontrada no Supabase, usando localStorage');
        setTableExists(false);
        loadFromLocalStorage();
      } else {
        // Outro tipo de erro
        console.error('Erro ao buscar secretarias:', error);
        loadFromLocalStorage();
      }
    } catch (err) {
      console.error('Erro ao conectar com Supabase:', err);
      loadFromLocalStorage();
    }
    
    setLoading(false);
  };

  const loadFromLocalStorage = () => {
    setUsingLocalStorage(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSecretarias(parsed);
        console.log('📦 Secretarias carregadas do localStorage:', parsed.length);
      } catch (err) {
        console.error('Erro ao parsear secretarias do localStorage:', err);
        setSecretarias(SECRETARIAS_PADRAO);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SECRETARIAS_PADRAO));
      }
    } else {
      // Primeira vez, usar secretarias padrão
      setSecretarias(SECRETARIAS_PADRAO);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SECRETARIAS_PADRAO));
      console.log('🆕 Secretarias padrão inicializadas no localStorage');
    }
  };

  const saveToLocalStorage = (data: Secretaria[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const getSecretarias = async () => {
    if (usingLocalStorage) {
      return { success: true, data: secretarias };
    }

    try {
      const { data, error } = await supabaseClient
        .from('secretarias')
        .select('*')
        .order('nome', { ascending: true });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: errorMsg };
    }
  };

  const createSecretaria = async (data: {
    nome: string;
    sigla?: string;
    descricao?: string;
  }) => {
    if (usingLocalStorage) {
      // Criar localmente
      const newSecretaria: Secretaria = {
        id: Date.now().toString(),
        nome: data.nome,
        sigla: data.sigla,
        descricao: data.descricao,
        data_criacao: new Date().toISOString()
      };

      const updated = [...secretarias, newSecretaria];
      setSecretarias(updated);
      saveToLocalStorage(updated);

      return { success: true, data: newSecretaria };
    }

    try {
      const { data: newSecretaria, error } = await supabaseClient
        .from('secretarias')
        .insert([data])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Atualizar estado local
      const updated = [...secretarias, newSecretaria];
      setSecretarias(updated);

      return { success: true, data: newSecretaria };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: errorMsg };
    }
  };

  const updateSecretaria = async (id: string, data: {
    nome?: string;
    sigla?: string;
    descricao?: string;
  }) => {
    if (usingLocalStorage) {
      // Atualizar localmente
      const updated = secretarias.map(s => 
        s.id === id 
          ? { ...s, ...data, updated_at: new Date().toISOString() }
          : s
      );
      setSecretarias(updated);
      saveToLocalStorage(updated);

      return { success: true, data: updated.find(s => s.id === id) };
    }

    try {
      const { data: updatedSecretaria, error } = await supabaseClient
        .from('secretarias')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Atualizar estado local
      const updated = secretarias.map(s => s.id === id ? updatedSecretaria : s);
      setSecretarias(updated);

      return { success: true, data: updatedSecretaria };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: errorMsg };
    }
  };

  const deleteSecretaria = async (id: string) => {
    if (usingLocalStorage) {
      // Deletar localmente
      const updated = secretarias.filter(s => s.id !== id);
      setSecretarias(updated);
      saveToLocalStorage(updated);

      return { success: true };
    }

    try {
      const { error } = await supabaseClient
        .from('secretarias')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Atualizar estado local
      const updated = secretarias.filter(s => s.id !== id);
      setSecretarias(updated);

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: errorMsg };
    }
  };

  const migrateToSupabase = async () => {
    if (!usingLocalStorage) {
      return { success: false, error: 'Já está usando Supabase' };
    }

    try {
      // Tentar inserir todas as secretarias no Supabase
      const { data, error } = await supabaseClient
        .from('secretarias')
        .insert(secretarias.map(s => ({
          nome: s.nome,
          sigla: s.sigla,
          descricao: s.descricao
        })))
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      // Migração bem-sucedida
      setUsingLocalStorage(false);
      setTableExists(true);
      setSecretarias(data);
      localStorage.removeItem(STORAGE_KEY);

      return { success: true, message: 'Dados migrados com sucesso!' };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: errorMsg };
    }
  };

  return {
    secretarias,
    loading,
    usingLocalStorage,
    tableExists,
    getSecretarias,
    createSecretaria,
    updateSecretaria,
    deleteSecretaria,
    migrateToSupabase,
    refresh: initSecretarias
  };
};
