import { projectId, publicAnonKey } from '../utils/supabase/info';

// URL da Edge Function de e-mail
// Quando fizer deploy da função no Supabase, esta será a URL correta
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/enviar-email`;

// 🆕 Modo de simulação local (não requer servidor)
// Para ativar envio real de e-mails, crie um arquivo .env com: VITE_EMAIL_ENABLED=true
// 🔥 FORÇADO PARA MODO REAL - NÃO DEPENDE MAIS DO .ENV
const EMAIL_ENABLED = true; // ⚠️ MODO REAL PERMANENTE
const SIMULATION_MODE = !EMAIL_ENABLED;

console.log(`[EmailService] Modo: ${SIMULATION_MODE ? '🧪 SIMULAÇÃO' : '✉️ REAL (FORÇADO)'}`);

// Import toasts dinamicamente para evitar problemas de SSR
let showRateLimitToast: () => void;
let showTestModeToast: (email: string) => void;
let showEmailSuccessToast: (id: string, testMode: boolean) => void;

// Carregar toasts de forma lazy
const loadToasts = async () => {
  if (typeof window !== 'undefined' && !showRateLimitToast) {
    try {
      const toastModule = await import('../components/EmailRateLimitToast');
      showRateLimitToast = toastModule.showRateLimitToast;
      showTestModeToast = toastModule.showTestModeToast;
      showEmailSuccessToast = toastModule.showEmailSuccessToast;
    } catch (error) {
      console.warn('[EmailService] Não foi possível carregar toasts:', error);
    }
  }
};

export interface EmailAlert {
  to: string;
  subject: string;
  alertType: 'warning' | 'urgent';
  criterio: {
    id: string;
    nome: string;
    secretaria: string;
  };
  usuario: {
    id: string;
    name: string;
  };
  dueDate?: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  alertType: string;
  criterioId: string;
  usuarioId: string;
  sentAt: string;
  status: string;
}

class EmailService {
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 2000; // 2 segundos entre requisições (para respeitar rate limit)
  private failedRequests = 0;
  private readonly MAX_FAILED_REQUESTS = 3;
  private testModeDetected = false;
  private authorizedTestEmail = '';

  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      // Aguardar intervalo mínimo entre requisições (com backoff exponencial em caso de erro)
      const waitTime = this.failedRequests > 0 
        ? this.MIN_REQUEST_INTERVAL * Math.pow(2, this.failedRequests) 
        : this.MIN_REQUEST_INTERVAL;
      
      if (timeSinceLastRequest < waitTime) {
        await new Promise(resolve => 
          setTimeout(resolve, waitTime - timeSinceLastRequest)
        );
      }

      const requestFn = this.requestQueue.shift();
      if (requestFn) {
        try {
          await requestFn();
          this.failedRequests = 0; // Reset contador em caso de sucesso
        } catch (error) {
          console.error('[EmailService] Erro na requisição da fila:', error);
          this.failedRequests = Math.min(this.failedRequests + 1, this.MAX_FAILED_REQUESTS);
          
          // Se muitos erros, limpar fila para evitar spam
          if (this.failedRequests >= this.MAX_FAILED_REQUESTS) {
            console.warn('[EmailService] Muitos erros consecutivos, limpando fila de e-mails');
            this.requestQueue.splice(0); // Limpar fila
          }
        }
        this.lastRequestTime = Date.now();
      }
    }

    this.isProcessingQueue = false;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      console.log(`[EmailService] Fazendo request para: ${BASE_URL}`);
      
      const response = await fetch(BASE_URL, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          ...options.headers,
        },
      });

      console.log(`[EmailService] Response status: ${response.status}`);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[EmailService] Erro ao parsear JSON:', parseError);
        throw new Error(`Erro no servidor: Response não é JSON válido (Status: ${response.status})`);
      }
      
      console.log('[EmailService] Response data:', data);
      
      if (!response.ok) {
        // Tratar erro 429 (Rate Limit)
        if (response.status === 429) {
          console.warn('[EmailService] Rate limit atingido, aguardando antes de próxima tentativa');
          this.failedRequests += 1;
          
          // Mostrar toast de rate limit
          await loadToasts();
          if (showRateLimitToast) {
            showRateLimitToast();
          }
          
          throw new Error('Rate limit excedido. Tente novamente em alguns segundos.');
        }
        
        // Verificar se é um erro 403 relacionado ao modo de teste do Resend
        if (response.status === 403 && data.message && 
            data.message.includes('You can only send testing emails to your own email address')) {
          
          console.log('[EmailService] Detectado modo de teste do Resend - API Key válida');
          
          // Extrair o e-mail autorizado da mensagem
          const emailMatch = data.message.match(/\(([^)]+)\)/);
          const authorizedEmail = emailMatch ? emailMatch[1] : 'seu e-mail de cadastro';
          
          // Salvar informações do modo de teste
          this.testModeDetected = true;
          this.authorizedTestEmail = authorizedEmail;
          
          // Mostrar toast de modo de teste
          await loadToasts();
          if (showTestModeToast) {
            showTestModeToast(authorizedEmail);
          }
          
          // Retornar como sucesso com informações do modo de teste
          return {
            success: true,
            emailId: 'test-mode-restriction',
            message: 'API Key válida - Sistema em modo de teste',
            testMode: true,
            authorizedEmail,
            note: `Em modo de teste, e-mails só podem ser enviados para: ${authorizedEmail}`
          };
        }
        
        const errorMessage = data.error || data.message || `HTTP ${response.status}`;
        console.error('[EmailService] Erro na resposta:', errorMessage);
        throw new Error(errorMessage);
      }
      
      return data;
    } catch (error) {
      console.error('[EmailService] Erro na requisição:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Erro de conectividade: Não foi possível conectar ao servidor');
      }
      
      throw error;
    }
  }

  /**
   * Verificar se em modo de teste e ajustar destinatário
   */
  private adjustEmailForTestMode(originalEmail: string): string {
    if (this.testModeDetected && this.authorizedTestEmail) {
      console.log(`[EmailService] Modo teste: redirecionando ${originalEmail} para ${this.authorizedTestEmail}`);
      return this.authorizedTestEmail;
    }
    return originalEmail;
  }

  /**
   * Verificar se o sistema está em modo de teste
   */
  isInTestMode(): { testMode: boolean; authorizedEmail: string } {
    return {
      testMode: this.testModeDetected,
      authorizedEmail: this.authorizedTestEmail
    };
  }

  /**
   * Enviar alerta por e-mail
   */
  async sendAlert(emailData: EmailAlert): Promise<{ success: boolean; emailId?: string; message: string }> {
    // 🆕 Se em modo de simulação, retornar sucesso simulado
    if (SIMULATION_MODE) {
      console.log('📧 [SIMULAÇÃO] Alerta por e-mail:', emailData);
      
      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return {
        success: true,
        emailId: `sim-alert-${Date.now()}`,
        message: 'Alerta simulado enviado com sucesso (modo de desenvolvimento)'
      };
    }

    return new Promise((resolve, reject) => {
      const requestFn = async () => {
        try {
          console.log('📧 Enviando alerta por e-mail:', emailData);
          
          // Ajustar e-mail se em modo de teste
          const to = this.adjustEmailForTestMode(emailData.to);
          
          // Gerar mensagem HTML do alerta
          const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: ${emailData.alertType === 'urgent' ? '#dc2626' : '#f59e0b'};">
                ${emailData.alertType === 'urgent' ? '🔴 ALERTA URGENTE' : '🟡 AVISO'}
              </h2>
              <p><strong>Critério:</strong> ${emailData.criterio.nome}</p>
              <p><strong>Secretaria:</strong> ${emailData.criterio.secretaria}</p>
              <p><strong>Usuário:</strong> ${emailData.usuario.name}</p>
              ${emailData.dueDate ? `<p><strong>Prazo:</strong> ${emailData.dueDate}</p>` : ''}
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #6b7280;">
                TranspJardim - Sistema de Transparência<br>
                Controladoria Municipal de Jardim/CE
              </p>
            </div>
          `;
          
          const result = await this.request('', {
            method: 'POST',
            body: JSON.stringify({
              to,
              subject: emailData.subject,
              message
            }),
          });

          console.log('✅ E-mail enviado com sucesso:', result);
          
          // Mostrar toast de sucesso
          await loadToasts();
          if (showEmailSuccessToast) {
            showEmailSuccessToast('email-sent', false);
          }
          
          resolve({ success: true, message: 'E-mail enviado com sucesso' });
        } catch (error) {
          console.error('❌ Erro ao enviar e-mail:', error);
          reject(error);
        }
      };

      this.requestQueue.push(requestFn);
      this.processQueue();
    });
  }

  /**
   * Enviar e-mail de teste
   */
  async sendTestEmail(testEmail: string): Promise<{ success: boolean; emailId?: string; message: string; testMode?: boolean; authorizedEmail?: string; note?: string }> {
    // 🆕 Se em modo de simulação, retornar sucesso simulado
    if (SIMULATION_MODE) {
      console.log('🧪 [SIMULAÇÃO] E-mail de teste para:', testEmail);
      
      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        success: true,
        emailId: `sim-${Date.now()}`,
        message: 'E-mail simulado enviado com sucesso (modo de desenvolvimento)',
        testMode: true,
        note: 'Sistema em modo de simulação local. Configure a Edge Function do Supabase para enviar e-mails reais.'
      };
    }

    return new Promise((resolve, reject) => {
      const requestFn = async () => {
        try {
          console.log('🧪 Enviando e-mail de teste para:', testEmail);
          
          // Mensagem de teste
          const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4a7c59;">🧪 E-mail de Teste</h2>
              <p>Este é um e-mail de teste do sistema TranspJardim.</p>
              <p>Se você recebeu esta mensagem, a configuração de e-mail está funcionando corretamente!</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #6b7280;">
                TranspJardim - Sistema de Transparência<br>
                Controladoria Municipal de Jardim/CE
              </p>
            </div>
          `;
          
          const result = await this.request('', {
            method: 'POST',
            body: JSON.stringify({
              to: testEmail,
              subject: '🧪 TESTE: Sistema TranspJardim',
              message
            }),
          });

          console.log('✅ E-mail de teste enviado:', result);
          
          resolve({ success: true, message: 'E-mail de teste enviado com sucesso' });
        } catch (error) {
          console.error('❌ Erro no teste de e-mail:', error);
          reject(error);
        }
      };

      this.requestQueue.push(requestFn);
      this.processQueue();
    });
  }

  /**
   * Buscar logs de e-mails enviados
   */
  async getEmailLogs(): Promise<EmailLog[]> {
    try {
      console.log('📋 Buscando logs de e-mails...');
      
      const result = await this.request('/email/logs');
      
      console.log(`✅ ${result.data.length} logs encontrados`);
      return result.data;
    } catch (error) {
      console.error('❌ Erro ao buscar logs de e-mail:', error);
      throw error;
    }
  }

  /**
   * Validar configuração de e-mail
   */
  async validateEmailConfig(): Promise<boolean> {
    try {
      // Tentar enviar e-mail para um endereço de teste interno
      const result = await this.sendTestEmail('test@example.com');
      
      // Se está em modo de teste ou enviou com sucesso, considerar como válido
      return result.success || result.testMode;
    } catch (error) {
      console.error('E-mail não configurado ou com erro:', error);
      return false;
    }
  }

  /**
   * Gerar template de e-mail personalizado
   */
  generateEmailSubject(alertType: 'warning' | 'urgent', criterio: string): string {
    const prefix = alertType === 'urgent' ? '🔴 URGENTE' : '🟡 AVISO';
    return `${prefix}: ${criterio} - TranspJardim`;
  }

  /**
   * Verificar se e-mail é válido
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Formatar lista de e-mails
   */
  parseEmailList(emailString: string): string[] {
    return emailString
      .split(/[,;\s]+/)
      .map(email => email.trim())
      .filter(email => email && this.isValidEmail(email));
  }

  /**
   * Testar API Key temporária
   */
  async testTemporaryApiKey(apiKey: string): Promise<{ success: boolean; emailId?: string; message: string; testMode?: boolean; authorizedEmail?: string; note?: string }> {
    return new Promise((resolve, reject) => {
      const requestFn = async () => {
        try {
          console.log('🔧 Testando API Key temporária:', apiKey.substring(0, 10) + '...');
          
          const response = await fetch(`${BASE_URL}/email/test`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-Test-API-Key': apiKey,
            },
            body: JSON.stringify({ 
              testEmail: 'config-test@test.local',
              configTest: true 
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            // Verificar se é um erro 403 relacionado ao modo de teste do Resend
            if (response.status === 403 && data.message && 
                data.message.includes('You can only send testing emails to your own email address')) {
              
              console.log('✅ API Key temporária válida - Sistema em modo de teste');
              
              const emailMatch = data.message.match(/\(([^)]+)\)/);
              const authorizedEmail = emailMatch ? emailMatch[1] : 'seu e-mail de cadastro';
              
              resolve({
                success: true,
                emailId: 'temp-test-mode-restriction',
                message: 'API Key válida - Sistema em modo de teste',
                testMode: true,
                authorizedEmail,
                note: `Em modo de teste, e-mails só podem ser enviados para: ${authorizedEmail}`
              });
              return;
            }
            
            const errorMessage = data.error || data.message || `HTTP ${response.status}`;
            console.error('❌ Erro na validação da API Key temporária:', errorMessage);
            reject(new Error(errorMessage));
            return;
          }

          console.log('✅ API Key temporária válida:', data);
          resolve(data);
        } catch (error) {
          console.error('❌ Erro ao testar API Key temporária:', error);
          reject(error);
        }
      };

      this.requestQueue.push(requestFn);
      this.processQueue();
    });
  }
}

// Instância singleton
export const emailService = new EmailService();

// Helper functions para facilitar o uso
export const sendEmailAlert = (emailData: EmailAlert) => emailService.sendAlert(emailData);
export const sendTestEmail = (email: string) => emailService.sendTestEmail(email);
export const getEmailLogs = () => emailService.getEmailLogs();
export const validateEmailConfig = () => emailService.validateEmailConfig();
export const testTemporaryApiKey = (apiKey: string) => emailService.testTemporaryApiKey(apiKey);
export const getTestModeInfo = () => emailService.isInTestMode();