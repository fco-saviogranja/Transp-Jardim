/**
 * Configuração SMTP do Hostinger para TranspJardim
 * 
 * E-mail: controleinterno@transpjardim.com
 * Provedor: Hostinger
 */

// 📧 CONFIGURAÇÃO SMTP HOSTINGER
export const SMTP_CONFIG = {
  // Servidor SMTP (Outgoing)
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true, // SSL
  
  // Credenciais
  user: 'controleinterno@transpjardim.com',
  // IMPORTANTE: A senha deve ser configurada nas variáveis de ambiente
  // Nunca commitar a senha no código!
  
  // Servidores de entrada (para referência)
  incoming: {
    imap: {
      host: 'imap.hostinger.com',
      port: 993,
      secure: true, // SSL
    },
    pop: {
      host: 'pop.hostinger.com',
      port: 995,
      secure: true, // SSL
    },
  },
};

// 📝 VARIÁVEIS DE AMBIENTE NECESSÁRIAS
export const REQUIRED_ENV_VARS = {
  SMTP_PASSWORD: 'Senha do e-mail controleinterno@transpjardim.com',
  SMTP_USER: 'controleinterno@transpjardim.com (opcional, já definido no código)',
  SMTP_HOST: 'smtp.hostinger.com (opcional, já definido no código)',
  SMTP_PORT: '465 (opcional, já definido no código)',
};

// 🔐 Obter senha do ambiente
export const getSMTPPassword = (): string | undefined => {
  // No Supabase Edge Functions
  if (typeof Deno !== 'undefined') {
    return Deno.env.get('SMTP_PASSWORD');
  }
  
  // No Node.js
  if (typeof process !== 'undefined') {
    return process.env.SMTP_PASSWORD;
  }
  
  return undefined;
};

// ✅ Validar configuração SMTP
export const validateSMTPConfig = (): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} => {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  if (!getSMTPPassword()) {
    missing.push('SMTP_PASSWORD');
    warnings.push('Configure a senha do e-mail nas variáveis de ambiente');
  }
  
  if (!SMTP_CONFIG.host) {
    missing.push('SMTP_HOST');
  }
  
  if (!SMTP_CONFIG.port) {
    missing.push('SMTP_PORT');
  }
  
  if (!SMTP_CONFIG.user) {
    missing.push('SMTP_USER');
  }
  
  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
};

// 📋 Obter configuração completa para uso
export const getSMTPConfig = () => {
  const password = getSMTPPassword();
  
  return {
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: SMTP_CONFIG.secure,
    auth: {
      user: SMTP_CONFIG.user,
      pass: password || '',
    },
  };
};

// 📊 Status da configuração
export const getSMTPStatus = () => {
  const validation = validateSMTPConfig();
  const hasPassword = !!getSMTPPassword();
  
  return {
    configured: validation.valid && hasPassword,
    provider: 'Hostinger',
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: SMTP_CONFIG.secure ? 'SSL' : 'TLS',
    user: SMTP_CONFIG.user,
    hasPassword,
    validation,
  };
};

export default {
  SMTP_CONFIG,
  REQUIRED_ENV_VARS,
  getSMTPPassword,
  validateSMTPConfig,
  getSMTPConfig,
  getSMTPStatus,
};
