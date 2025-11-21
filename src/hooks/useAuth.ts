import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types';
import { getStoredAuth, setStoredAuth, clearStoredAuth, validateLogin, generateMockToken } from '../lib/auth';
import { useSupabase } from './useSupabase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();

  useEffect(() => {
    // Carregamento síncrono e instantâneo da autenticação
    try {
      const { user: storedUser, token: storedToken } = getStoredAuth();
      setUser(storedUser);
      setToken(storedToken);
      console.log('🔐 Auth carregado:', storedUser ? 'Logado' : 'Não logado');
    } catch (error) {
      console.warn('Erro ao carregar autenticação:', error);
    } finally {
      setLoading(false);
    }

  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log(`🔐 Tentando login para usuário: ${username}`);
      
      // SEMPRE usar autenticação local (não tentar backend)
      const validatedUser = validateLogin(username, password);
      
      if (validatedUser) {
        console.log(`✅ Login bem-sucedido para: ${username}`);
        const newToken = generateMockToken(validatedUser);
        
        setUser(validatedUser);
        setToken(newToken);
        setStoredAuth(validatedUser, newToken);
        
        // Notificar usuário de forma assíncrona para não bloquear login
        requestAnimationFrame(async () => {
          try {
            const { toast } = await import('sonner@2.0.3');
            toast.success('🎯 Login realizado com sucesso!', {
              description: `Bem-vindo, ${validatedUser.name}!`,
              duration: 3000
            });
          } catch {
            // Ignorar erro de toast
          }
        });
        
        return true;
      }
      
      console.log(`❌ Credenciais inválidas para: ${username}`);
      
      // Mostrar toast de erro
      requestAnimationFrame(async () => {
        try {
          const { toast } = await import('sonner@2.0.3');
          toast.error('❌ Credenciais inválidas', {
            description: 'Usuário ou senha incorretos',
            duration: 3000
          });
        } catch {
          // Ignorar erro de toast
        }
      });
      
      return false;
    } catch (error) {
      console.error('❌ Erro crítico no login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearStoredAuth();
    
    // Limpar também a view persistida
    if (typeof window !== 'undefined') {
      localStorage.removeItem('transpjardim-current-view');
    }
  };

  return {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    loading
  };
};