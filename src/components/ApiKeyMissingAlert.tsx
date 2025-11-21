import { useState, useEffect } from 'react';
import { AlertCircle, X, Key, ExternalLink } from 'lucide-react';

interface ApiKeyMissingAlertProps {
  onConfigure?: () => void;
}

export function ApiKeyMissingAlert({ onConfigure }: ApiKeyMissingAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Verificar se o alerta já foi dispensado nesta sessão
    const dismissed = sessionStorage.getItem('api-key-alert-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      setChecking(false);
      return;
    }

    // Verificar se a API Key está configurada
    const checkApiKey = async () => {
      try {
        const { projectId, publicAnonKey } = await import('../utils/supabase/info');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/email/status`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        const data = await response.json();

        // Se não está configurada, mostrar o alerta
        if (!data.configured) {
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Erro ao verificar status da API Key:', error);
        // Em caso de erro, assumir que precisa configurar
        setIsVisible(true);
      } finally {
        setChecking(false);
      }
    };

    checkApiKey();
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem('api-key-alert-dismissed', 'true');
  };

  if (checking || isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-amber-50 border-2 border-amber-400 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-amber-100 rounded-lg">
            <AlertCircle className="w-6 h-6 text-amber-700" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-amber-900">
                Sistema de E-mail Não Configurado
              </h3>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-amber-700 hover:text-amber-900 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-amber-800 mt-1">
              Configure a API Key do Resend para habilitar envio de alertas por e-mail.
            </p>

            <div className="flex flex-col gap-2 mt-3">
              {onConfigure && (
                <button
                  onClick={() => {
                    handleDismiss();
                    onConfigure();
                  }}
                  className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <Key className="w-4 h-4" />
                  Configurar Agora
                </button>
              )}
              
              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-amber-700 hover:text-amber-900 transition-colors text-sm"
              >
                <ExternalLink className="w-3 h-3" />
                Obter API Key no Resend
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
