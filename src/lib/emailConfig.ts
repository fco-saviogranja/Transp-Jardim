/**
 * Configuração centralizada de e-mails do sistema TranspJardim
 * 
 * IMPORTANTE: Este é o único lugar onde o e-mail remetente deve ser definido.
 * Todas as funções de envio de e-mail devem usar estas constantes.
 */

// 📧 E-MAIL REMETENTE PRINCIPAL
export const SENDER_EMAIL = 'controleinterno@transpjardim.com';
export const SENDER_NAME = 'TranspJardim';
export const SENDER_FULL = `${SENDER_NAME} <${SENDER_EMAIL}>`;

// 📧 E-MAILS SECUNDÁRIOS
export const ADMIN_EMAIL = 'admin@transpjardim.com';
export const ALERTS_EMAIL = 'alertas@transpjardim.com';

// 🌐 DOMÍNIO
export const DOMAIN = 'transpjardim.com';
export const WEBSITE_URL = `https://${DOMAIN}`;

// 📝 INFORMAÇÕES INSTITUCIONAIS
export const ORGANIZATION = {
  name: 'Controladoria Municipal de Jardim/CE',
  shortName: 'Controladoria Jardim/CE',
  city: 'Jardim',
  state: 'CE',
  fullName: 'Controladoria Geral do Município de Jardim - Ceará',
};

// 📞 CONTATO
export const CONTACT = {
  email: SENDER_EMAIL,
  phone: '(88) 3000-0000',
  whatsapp: '(88) 90000-0000',
  address: 'Rua Principal, s/n - Centro - Jardim/CE',
  cep: '63000-000',
};

// ⏰ HORÁRIO DE ATENDIMENTO
export const BUSINESS_HOURS = {
  days: 'Segunda a Sexta',
  hours: '8h às 17h',
  timezone: 'America/Fortaleza',
};

// 🎨 ASSINATURA DE E-MAIL
export const EMAIL_SIGNATURE = `
---
${ORGANIZATION.name}
${SENDER_EMAIL}
${CONTACT.phone}
${WEBSITE_URL}
`.trim();

// 📧 TEMPLATE DE E-MAIL PADRÃO
export const getEmailFrom = () => SENDER_FULL;

export const getEmailReplyTo = () => SENDER_EMAIL;

export const getEmailFooter = () => `
<div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 12px; color: #6b7280;">
  <p style="margin: 0 0 8px 0;">
    <strong>${ORGANIZATION.name}</strong>
  </p>
  <p style="margin: 0 0 8px 0;">
    📧 ${SENDER_EMAIL} | 📞 ${CONTACT.phone}
  </p>
  <p style="margin: 0 0 8px 0;">
    🌐 <a href="${WEBSITE_URL}" style="color: #4a7c59; text-decoration: none;">${WEBSITE_URL}</a>
  </p>
  <p style="margin: 0; font-size: 11px; color: #9ca3af;">
    Horário de atendimento: ${BUSINESS_HOURS.days}, ${BUSINESS_HOURS.hours}
  </p>
</div>
`;

// 🔧 HELPER PARA FORMATAR E-MAIL
export const formatEmailAddress = (email: string, name?: string): string => {
  if (name) {
    return `${name} <${email}>`;
  }
  return email;
};

// ✅ VALIDAÇÃO DE E-MAIL
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 📋 TIPOS DE E-MAIL
export type EmailType = 
  | 'alert-warning'
  | 'alert-urgent'
  | 'notification'
  | 'report'
  | 'system'
  | 'test';

// 🎯 PREFIXOS POR TIPO
export const EMAIL_PREFIXES: Record<EmailType, string> = {
  'alert-warning': '🟡 AVISO',
  'alert-urgent': '🔴 URGENTE',
  'notification': '🔔 NOTIFICAÇÃO',
  'report': '📊 RELATÓRIO',
  'system': '⚙️ SISTEMA',
  'test': '🧪 TESTE',
};

// 📧 GERAR ASSUNTO DE E-MAIL
export const generateEmailSubject = (
  type: EmailType,
  subject: string
): string => {
  const prefix = EMAIL_PREFIXES[type];
  return `${prefix}: ${subject} - ${SENDER_NAME}`;
};

// 📝 INFORMAÇÕES PARA DOCUMENTAÇÃO
export const EMAIL_SETUP_INFO = {
  domain: DOMAIN,
  sender: SENDER_EMAIL,
  provider: 'Hostinger',
  smtp: {
    host: 'smtp.hostinger.com',
    port: 465,
    secure: 'SSL',
  },
  records: {
    spf: `v=spf1 include:_spf.hostinger.com ~all`,
    dmarc: `v=DMARC1; p=none; rua=mailto:${SENDER_EMAIL}`,
    dkim: 'Solicitar ao suporte do Hostinger',
  },
};

export default {
  SENDER_EMAIL,
  SENDER_NAME,
  SENDER_FULL,
  ADMIN_EMAIL,
  ALERTS_EMAIL,
  DOMAIN,
  WEBSITE_URL,
  ORGANIZATION,
  CONTACT,
  BUSINESS_HOURS,
  EMAIL_SIGNATURE,
  getEmailFrom,
  getEmailReplyTo,
  getEmailFooter,
  formatEmailAddress,
  isValidEmail,
  EMAIL_PREFIXES,
  generateEmailSubject,
  EMAIL_SETUP_INFO,
};