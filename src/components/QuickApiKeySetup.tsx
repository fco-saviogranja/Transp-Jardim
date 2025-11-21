import { useState } from 'react';
import { AlertCircle, CheckCircle2, Key, Loader2, ExternalLink } from 'lucide-react';

interface QuickApiKeySetupProps {
  onSuccess?: () => void;
}

export function QuickApiKeySetup({ onSuccess }: QuickApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    testMode?: boolean;
    authorizedEmail?: string;
  } | null>(null);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setResult({
        success: false,
        message: 'Por favor, insira uma API Key'
      });
      return;
    }

    if (!apiKey.startsWith('re_')) {
      setResult({
        success: false,
        message: 'API Key inválida. Deve começar com "re_"'
      });
      return;
    }

    setTesting(true);
    setResult(null);

    try {
      // Importar dinâmicamente as informações do Supabase
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/config/resend-api-key`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ apiKey: apiKey.trim() }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message || 'API Key configurada com sucesso!',
          testMode: data.testMode,
          authorizedEmail: data.authorizedEmail
        });
        
        if (onSuccess) {
          setTimeout(onSuccess, 2000);
        }
      } else {
        setResult({
          success: false,
          message: data.error || 'Erro ao salvar API Key'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro de conexão'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <Key className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold text-green-900">Configurar API Key do Resend</h2>
            <p className="text-sm text-gray-600">Configure para habilitar envio de e-mails</p>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Como obter sua API Key:</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>
              Acesse{' '}
              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-1 hover:text-blue-600"
              >
                resend.com/api-keys
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>Faça login ou crie uma conta gratuita</li>
            <li>Clique em "Create API Key"</li>
            <li>Dê um nome (ex: "TranspJardim")</li>
            <li>Copie a chave gerada (começa com "re_")</li>
            <li>Cole aqui embaixo e clique em "Salvar"</li>
          </ol>
        </div>

        {/* Input da API Key */}
        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              API Key do Resend
            </label>
            <input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="re_..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
              disabled={testing}
            />
            <p className="text-xs text-gray-500 mt-1">
              Exemplo: re_123abc456def789ghi012jkl345mno678
            </p>
          </div>

          {/* Resultado */}
          {result && (
            <div
              className={`p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      result.success ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.success && result.testMode && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs text-yellow-800">
                        ⚠️ <strong>Modo Sandbox (Teste):</strong> E-mails serão enviados apenas para:
                      </p>
                      <p className="text-xs font-mono text-yellow-900 mt-1">
                        {result.authorizedEmail}
                      </p>
                      <p className="text-xs text-yellow-700 mt-2">
                        Perfeito para testes! Para enviar para outros destinatários,{' '}
                        <a
                          href="https://resend.com/domains"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          verifique seu domínio
                        </a>
                        .
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botão */}
          <button
            onClick={handleSaveApiKey}
            disabled={testing || !apiKey.trim()}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Testando e salvando...
              </>
            ) : (
              <>
                <Key className="w-5 h-5" />
                Salvar e Testar API Key
              </>
            )}
          </button>
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">💡 Informações importantes:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>Gratuito:</strong> Resend oferece 3.000 e-mails/mês no plano free</li>
            <li>• <strong>Modo sandbox:</strong> Conta nova só envia para seu e-mail de cadastro</li>
            <li>• <strong>Produção:</strong> Verifique um domínio para enviar para qualquer e-mail</li>
            <li>• <strong>Segurança:</strong> A API Key é armazenada de forma segura no servidor</li>
          </ul>
        </div>
      </div>
    </div>
  );
}