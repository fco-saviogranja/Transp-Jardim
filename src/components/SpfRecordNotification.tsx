import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { AlertCircle, ExternalLink, X, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { DnsConfigurationGuide } from './DnsConfigurationGuide';

interface SpfRecordNotificationProps {
  onDismiss?: () => void;
  dismissible?: boolean;
}

export function SpfRecordNotification({ 
  onDismiss, 
  dismissible = true 
}: SpfRecordNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleOpenGuide = () => {
    setIsOpen(true);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <>
      <Alert className="border-orange-200 bg-orange-50">
        <div className="flex items-start gap-3 w-full">
          <AlertCircle className="size-5 text-orange-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <AlertTitle className="text-orange-900">
              ⚠️ Registros SPF Pendentes
            </AlertTitle>
            <AlertDescription className="text-orange-800 mt-2">
              <p className="mb-3">
                O Resend está indicando <strong>"Missing required SPF records"</strong>. 
                Isso significa que o domínio <code className="bg-orange-100 px-1.5 py-0.5 rounded">transpjardim.tech</code> ainda 
                não está verificado.
              </p>
              
              <div className="space-y-2 text-sm mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-orange-700">✅</span>
                  <span>Sistema funcionando em modo teste</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-700">✅</span>
                  <span>E-mails sendo enviados para: controleinterno@transpjardim.tech</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-700">⚠️</span>
                  <span>Para enviar para outros destinatários, configure os registros DNS</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={handleOpenGuide}
                >
                  <Settings className="size-4 mr-2" />
                  Configurar DNS
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open('https://resend.com/domains', '_blank')}
                >
                  <ExternalLink className="size-4 mr-2" />
                  Abrir Resend
                </Button>
                {dismissible && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                  >
                    <X className="size-4 mr-2" />
                    Dispensar
                  </Button>
                )}
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configuração de Registros DNS</DialogTitle>
            <DialogDescription>
              Configure os registros SPF, DKIM e DMARC para verificar seu domínio no Resend
            </DialogDescription>
          </DialogHeader>
          <DnsConfigurationGuide />
        </DialogContent>
      </Dialog>
    </>
  );
}
