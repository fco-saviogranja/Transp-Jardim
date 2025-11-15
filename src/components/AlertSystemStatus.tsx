import { useEffect, useState } from 'react';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

interface AlertSystemStatusProps {
  isActive: boolean;
}

export const AlertSystemStatus = ({ isActive }: AlertSystemStatusProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Verificar se já foi mostrado antes
    const hasSeenStatus = localStorage.getItem('transpjardim-alert-system-status-seen');
    if (hasSeenStatus) {
      setShow(false);
    } else {
      // Auto-hide após 10 segundos
      const timer = setTimeout(() => {
        setShow(false);
        localStorage.setItem('transpjardim-alert-system-status-seen', 'true');
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!show || !isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <Alert className="border-green-200 bg-green-50">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="relative">
              <Bell className="h-5 w-5 text-green-600" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-900 text-sm">
                Sistema de Alertas Ativo
              </span>
            </div>
            <AlertDescription className="text-green-800 text-xs">
              <div className="space-y-1">
                <p>✓ Verificação automática de vencimentos</p>
                <p>✓ Notificações baseadas em periodicidade</p>
                <p>✓ Envio em dias úteis configurado</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Verificação a cada 30 minutos</span>
              </div>
            </AlertDescription>
          </div>
          <button
            onClick={() => {
              setShow(false);
              localStorage.setItem('transpjardim-alert-system-status-seen', 'true');
            }}
            className="flex-shrink-0 text-green-600 hover:text-green-800 text-xl leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      </Alert>
    </div>
  );
};
