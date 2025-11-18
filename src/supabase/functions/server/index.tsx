import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Configurar CORS aberto
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

// Logger simples
app.use('*', async (c, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.url}`);
  await next();
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.url} - ${Date.now() - start}ms - ${c.res.status}`);
});

// Cliente Supabase para operações administrativas
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.log('Inicializando servidor TranspJardim...');
console.log('Supabase URL:', supabaseUrl ? 'Configurada' : 'Não configurada');
console.log('Supabase Key:', supabaseKey ? 'Configurada' : 'Não configurada');

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Helper function para obter API Key do Resend
async function getResendApiKey(): Promise<string | null> {
  try {
    // Primeiro tenta pegar do KV Store
    const config = await kv.get('config:resend_api_key');
    if (config && config.apiKey) {
      return config.apiKey;
    }
    
    // Se não encontrar no KV, tenta do ambiente
    const envKey = Deno.env.get('RESEND_API_KEY');
    if (envKey) {
      return envKey;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao obter API Key do Resend:', error);
    return Deno.env.get('RESEND_API_KEY') || null;
  }
}

// Helper function para obter info do modo de teste
async function getTestModeInfo(): Promise<{ testMode: boolean; authorizedEmail?: string }> {
  try {
    const config = await kv.get('config:resend_api_key');
    // Se o config não existe ou não tem testMode explícito, assume modo teste com email padrão
    if (config && config.testMode === false) {
      return { testMode: false };
    }
    // Por padrão, assume modo teste com o e-mail autorizado
    return {
      testMode: true,
      authorizedEmail: config?.authorizedEmail || 'controleinterno@transpjardim.tech'
    };
  } catch (error) {
    console.error('Erro ao obter info do modo de teste:', error);
    return { 
      testMode: true,
      authorizedEmail: 'controleinterno@transpjardim.tech'
    };
  }
}

// Helper function para parsear resposta do Resend com segurança
async function parseResendResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');
  
  console.log(`[ParseResend] Status: ${response.status}, Content-Type: ${contentType}`);
  
  try {
    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log(`[ParseResend] JSON Response:`, jsonData);
      return jsonData;
    } else {
      // Se não for JSON, pegar como texto
      const textResponse = await response.text();
      console.error('❌ [ParseResend] Resposta não-JSON do Resend (primeiros 500 chars):', textResponse.substring(0, 500));
      
      // Se for HTML, indicar erro de API Key
      if (textResponse.includes('<!DOCTYPE') || textResponse.includes('<html')) {
        console.error('❌ [ParseResend] Detectada resposta HTML - API Key inválida ou expirada');
        return { 
          error: 'API Key inválida ou expirada',
          isHtmlResponse: true,
          rawResponse: textResponse.substring(0, 200),
          statusCode: response.status
        };
      }
      
      console.error('❌ [ParseResend] Resposta texto não-HTML:', textResponse);
      return { 
        error: textResponse,
        parseError: true,
        statusCode: response.status
      };
    }
  } catch (parseError) {
    console.error('❌ [ParseResend] Erro ao fazer parsing da resposta:', parseError);
    return { 
      error: 'Falha ao processar resposta',
      parseError: parseError instanceof Error ? parseError.message : 'Erro desconhecido'
    };
  }
}

// ============================================
// ROTAS DO TRANSPJARDIM
// ============================================

// Rota de health check
app.get('/make-server-225e1157/health', async (c) => {
  console.log('Health check solicitado');
  
  // Verificar se há dados inicializados
  let hasData = false;
  let userCount = 0;
  try {
    const adminUser = await kv.get('usuario:admin');
    if (adminUser) {
      hasData = true;
      
      // Contar usuários (método aproximado)
      const testUsers = ['admin', 'educacao', 'saude', 'obras', 'ambiente', 'franciscosavio'];
      for (const username of testUsers) {
        const user = await kv.get(`usuario:${username}`);
        if (user) userCount++;
      }
    }
  } catch (error) {
    console.warn('Erro ao verificar dados:', error);
  }
  
  return c.json({ 
    status: 'ok', 
    service: 'TranspJardim API',
    timestamp: new Date().toISOString(),
    version: '1.0.2',
    dataStatus: {
      initialized: hasData,
      userCount: userCount
    },
    environment: {
      deno: Deno.version.deno,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey
    },
    kvStore: {
      available: typeof kv === 'object',
      functions: Object.keys(kv).sort(),
      getByPrefix: typeof kv.getByPrefix,
      set: typeof kv.set,
      get: typeof kv.get
    }
  });
});

// Rota de debug para verificar KV store
app.get('/make-server-225e1157/debug/kv', async (c) => {
  try {
    console.log('Debug KV solicitado');
    
    const debug = {
      kvObject: typeof kv,
      availableFunctions: Object.keys(kv),
      functionTypes: {},
      testResults: {}
    };
    
    // Verificar tipos das funções
    for (const funcName of Object.keys(kv)) {
      debug.functionTypes[funcName] = typeof kv[funcName];
    }
    
    // Testar função count se disponível
    if (typeof kv.count === 'function') {
      try {
        debug.testResults.count = await kv.count();
      } catch (error) {
        debug.testResults.countError = error.message;
      }
    }
    
    // Testar função getByPrefix se disponível
    if (typeof kv.getByPrefix === 'function') {
      try {
        const testResult = await kv.getByPrefix('test_');
        debug.testResults.getByPrefix = {
          success: true,
          resultType: typeof testResult,
          isArray: Array.isArray(testResult),
          length: testResult?.length || 0
        };
      } catch (error) {
        debug.testResults.getByPrefixError = error.message;
      }
    }
    
    return c.json({ 
      status: 'ok',
      debug,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro no debug KV:', error);
    return c.json({ 
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// ============================================
// INICIALIZAÇÃO DE DADOS
// ============================================

app.post('/make-server-225e1157/init-data', async (c) => {
  try {
    console.log('=== INICIANDO INICIALIZAÇÃO DE DADOS ===');
    
    // Verificar se as funções KV estão disponíveis
    console.log('Verificando funções KV disponíveis:', Object.keys(kv));
    
    if (typeof kv.set !== 'function') {
      console.error('ERRO CRÍTICO: kv.set não é uma função');
      return c.json({ 
        success: false, 
        error: 'Sistema de armazenamento não configurado corretamente' 
      }, 500);
    }
    
    // Criar usuários de exemplo (senhas mais simples para facilitar testes)
    const usuarios = [
      {
        id: 'admin001',
        name: 'Administrador Sistema',
        username: 'admin',
        password: 'admin',
        role: 'admin',
        email: 'controleinterno@transpjardim.tech'
      },
      {
        id: 'user001',
        name: 'João Silva',
        username: 'educacao',
        password: '123',
        role: 'padrão',
        secretaria: 'Secretaria de Educação',
        email: 'educacao@transpjardim.tech'
      },
      {
        id: 'user002',
        name: 'Maria Santos',
        username: 'saude',
        password: '123',
        role: 'padrão',
        secretaria: 'Secretaria de Saúde',
        email: 'saude@transpjardim.tech'
      },
      {
        id: 'user003',
        name: 'Carlos Oliveira',
        username: 'obras',
        password: '123',
        role: 'padrão',
        secretaria: 'Secretaria de Obras e Infraestrutura',
        email: 'obras@transpjardim.tech'
      },
      {
        id: 'user004',
        name: 'Ana Costa',
        username: 'ambiente',
        password: '123',
        role: 'padrão',
        secretaria: 'Secretaria de Meio Ambiente',
        email: 'ambiente@transpjardim.tech'
      },
      {
        id: 'user005',
        name: 'Francisco Savio',
        username: 'franciscosavio',
        password: '123',
        role: 'padrão',
        secretaria: 'Secretaria de Administração e Finanças',
        email: 'franciscosavio@transpjardim.tech'
      }
    ];
    
    console.log(`Criando ${usuarios.length} usuários...`);
    
    let usuariosCriados = 0;
    for (const usuario of usuarios) {
      try {
        const usuarioComData = {
          ...usuario,
          dataCriacao: new Date().toISOString()
        };
        
        await kv.set(`usuario:${usuario.username}`, usuarioComData);
        await kv.set(`usuario_id:${usuario.id}`, usuarioComData);
        
        usuariosCriados++;
        console.log(`✓ Usuário criado: ${usuario.username} (${usuario.name})`);
      } catch (userError) {
        console.error(`✗ Erro ao criar usuário ${usuario.username}:`, userError);
      }
    }
    
    console.log(`=== INICIALIZAÇÃO CONCLUÍDA: ${usuariosCriados}/${usuarios.length} usuários criados ===`);
    
    return c.json({ 
      success: true, 
      message: 'Dados inicializados com sucesso',
      usuarios: usuariosCriados,
      total: usuarios.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('=== ERRO NA INICIALIZAÇÃO ===', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor ao inicializar dados',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// ============================================
// AUTENTICAÇÃO SIMPLES
// ============================================

app.post('/make-server-225e1157/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    console.log(`Tentativa de login: ${username}`);
    
    // Buscar usuário
    let usuario = await kv.get(`usuario:${username}`);
    
    if (!usuario) {
      console.log(`Usuário não encontrado: ${username}. Tentando auto-inicialização...`);
      
      // Tentar auto-inicialização se o usuário não existir
      try {
        console.log('Executando auto-inicialização de dados...');
        
        // Lista de usuários padrão para inicialização automática
        const usuariosDefault = [
          {
            id: 'admin001',
            name: 'Administrador Sistema',
            username: 'admin',
            password: 'admin',
            role: 'admin',
            email: 'controleinterno@transpjardim.tech'
          },
          {
            id: 'user001',
            name: 'João Silva',
            username: 'educacao',
            password: '123',
            role: 'padrão',
            secretaria: 'Secretaria de Educação',
            email: 'educacao@transpjardim.tech'
          },
          {
            id: 'user002',
            name: 'Maria Santos',
            username: 'saude',
            password: '123',
            role: 'padrão',
            secretaria: 'Secretaria de Saúde',
            email: 'saude@transpjardim.tech'
          },
          {
            id: 'user003',
            name: 'Carlos Oliveira',
            username: 'obras',
            password: '123',
            role: 'padrão',
            secretaria: 'Secretaria de Obras e Infraestrutura',
            email: 'obras@transpjardim.tech'
          },
          {
            id: 'user004',
            name: 'Ana Costa',
            username: 'ambiente',
            password: '123',
            role: 'padrão',
            secretaria: 'Secretaria de Meio Ambiente',
            email: 'ambiente@transpjardim.tech'
          },
          {
            id: 'user005',
            name: 'Francisco Savio',
            username: 'franciscosavio',
            password: '123',
            role: 'padrão',
            secretaria: 'Secretaria de Administração e Finanças',
            email: 'franciscosavio@transpjardim.tech'
          }
        ];
        
        // Criar usuários se não existirem
        for (const user of usuariosDefault) {
          const existingUser = await kv.get(`usuario:${user.username}`);
          if (!existingUser) {
            const usuarioComData = {
              ...user,
              dataCriacao: new Date().toISOString()
            };
            
            await kv.set(`usuario:${user.username}`, usuarioComData);
            await kv.set(`usuario_id:${user.id}`, usuarioComData);
            console.log(`✓ Auto-criado usuário: ${user.username}`);
          }
        }
        
        // Tentar buscar o usuário novamente após inicialização
        usuario = await kv.get(`usuario:${username}`);
        
        if (!usuario) {
          console.log(`Usuário ainda não encontrado após auto-inicialização: ${username}`);
          return c.json({ 
            success: false, 
            error: `Usuário '${username}' não encontrado. Tente admin/admin, educacao/123 ou outro usuário padrão.` 
          }, 401);
        }
        
        console.log(`✅ Auto-inicialização concluída, usuário encontrado: ${username}`);
      } catch (initError) {
        console.error('Erro na auto-inicialização:', initError);
        return c.json({ 
          success: false, 
          error: `Usuário '${username}' não encontrado e falha na inicialização automática.` 
        }, 401);
      }
    }
    
    if (usuario.password !== password) {
      console.log(`Senha incorreta para usuário: ${username}`);
      return c.json({ 
        success: false, 
        error: 'Credenciais inválidas' 
      }, 401);
    }
    
    // Gerar token simples (em produção usar JWT)
    const token = `token_${username}_${Date.now()}`;
    
    // Salvar sessão
    await kv.set(`sessao:${token}`, {
      userId: usuario.id,
      username,
      role: usuario.role,
      secretaria: usuario.secretaria,
      dataLogin: new Date().toISOString()
    });
    
    console.log(`Login bem-sucedido: ${username} (${usuario.role})`);
    
    return c.json({ 
      success: true, 
      data: {
        user: {
          id: usuario.id,
          name: usuario.name,
          username,
          email: usuario.email,
          role: usuario.role,
          secretaria: usuario.secretaria
        },
        token
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, 500);
  }
});

// ============================================
// SISTEMA DE E-MAILS - RESEND
// ============================================

// Função para selecionar domínio de e-mail
function getEmailSender(): string {
  // Agora usando domínio personalizado transpjardim.tech (DNS já configurado)
  const customDomain = 'TranspJardim - Controladoria Geral <controleinterno@transpjardim.tech>';
  return customDomain;
}

// Enviar e-mail de alerta
app.post('/make-server-225e1157/email/send-alert', async (c) => {
  try {
    const { to, subject, alertType, criterio, usuario, dueDate } = await c.req.json();
    console.log(`Enviando alerta por e-mail para: ${to}`);
    
    const resendApiKey = await getResendApiKey();
    if (!resendApiKey) {
      console.error('RESEND_API_KEY não configurada');
      return c.json({ 
        success: false, 
        error: 'RESEND_API_KEY não configurada no servidor',
        errorType: 'missing_api_key',
        details: 'Configure a API Key na interface de configuração'
      }, 500);
    }

    // Validar formato da API key
    const apiKeyTrimmed = resendApiKey.trim();
    if (!apiKeyTrimmed.startsWith('re_') || apiKeyTrimmed.length < 32) {
      const maskedKey = apiKeyTrimmed.length > 10 ? 
        apiKeyTrimmed.substring(0, 10) + '...' : 
        apiKeyTrimmed;
      
      console.error('RESEND_API_KEY com formato inválido:', maskedKey);
      return c.json({ 
        success: false, 
        error: 'RESEND_API_KEY com formato inválido',
        errorType: 'invalid_api_key_format',
        details: `A API Key deve começar com "re_" e ter pelo menos 32 caracteres. Recebido: ${maskedKey}`
      }, 500);
    }
    
    // Template HTML do e-mail
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TranspJardim - Alerta de Critério</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4a7c59, #6c9a6f); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
            .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .alert-urgent { background: #f8d7da; border: 1px solid #f5c6cb; }
            .button { display: inline-block; background: #4a7c59; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏛️ TranspJardim</div>
                <h1>Alerta de Transparência</h1>
                <p>Controladoria Municipal de Jardim/CE</p>
            </div>
            
            <div class="content">
                <h2>⚠️ ${subject}</h2>
                
                <div class="alert-box ${alertType === 'urgent' ? 'alert-urgent' : ''}">
                    <h3>📋 Critério: ${criterio?.nome || 'N/A'}</h3>
                    <p><strong>Secretaria:</strong> ${criterio?.secretaria || 'N/A'}</p>
                    <p><strong>Responsável:</strong> ${usuario?.name || 'N/A'}</p>
                    <p><strong>Prazo:</strong> ${dueDate ? new Date(dueDate).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    <p><strong>Tipo de Alerta:</strong> ${alertType === 'urgent' ? '🔴 URGENTE' : '🟡 AVISO'}</p>
                </div>
                
                <p>Este é um alerta automático do sistema TranspJardim da Controladoria Municipal de Jardim/CE.</p>
                
                <p>Por favor, acesse o sistema para marcar este critério como concluído quando apropriado.</p>
                
                <a href="https://transpjardim.tech" class="button">Acessar TranspJardim</a>
            </div>
            
            <div class="footer">
                <p>© 2024 Prefeitura Municipal de Jardim/CE - Controladoria Geral</p>
                <p>Este e-mail foi enviado automaticamente pelo sistema TranspJardim</p>
                <p>Para dúvidas, entre em contato com a Controladoria Municipal</p>
            </div>
        </div>
    </body>
    </html>`;
    
    // Verificar se está em modo de teste proativamente
    const testModeInfo = await getTestModeInfo();
    console.log(`📧 Modo de teste: ${testModeInfo.testMode ? 'ATIVO' : 'DESATIVADO'}`, testModeInfo.authorizedEmail ? `- Email autorizado: ${testModeInfo.authorizedEmail}` : '');
    
    // Se está em modo teste, enviar direto para o e-mail autorizado
    const emailDestino = testModeInfo.testMode ? testModeInfo.authorizedEmail : to;
    const isTestModeRedirect = testModeInfo.testMode && to !== testModeInfo.authorizedEmail;
    
    // Modificar template se for redirecionamento de teste
    const emailHtml = isTestModeRedirect 
      ? htmlTemplate.replace(
          '<h2>⚠️',
          `<div style="background: #e3f2fd; border: 2px solid #2196f3; padding: 10px; border-radius: 6px; margin-bottom: 15px;">
            <p style="margin: 0; color: #1976d2;"><strong>🧪 MODO TESTE:</strong> Este e-mail deveria ser enviado para <strong>${to}</strong></p>
          </div>
          <h2>⚠️`
        )
      : htmlTemplate;
    
    const emailSubject = isTestModeRedirect 
      ? `TranspJardim: ${subject} [Destinatário: ${to}]`
      : `TranspJardim: ${subject}`;
    
    const emailText = isTestModeRedirect
      ? `[MODO TESTE - Destinatário original: ${to}]\n\nTranspJardim - ${subject}\n\nCritério: ${criterio?.nome}\nSecretaria: ${criterio?.secretaria}\nResponsável: ${usuario?.name}\nPrazo: ${dueDate ? new Date(dueDate).toLocaleDateString('pt-BR') : 'N/A'}\n\nAcesse: https://transparenciajardim.app`
      : `TranspJardim - ${subject}\n\nCritério: ${criterio?.nome}\nSecretaria: ${criterio?.secretaria}\nResponsável: ${usuario?.name}\nPrazo: ${dueDate ? new Date(dueDate).toLocaleDateString('pt-BR') : 'N/A'}\n\nAcesse: https://transparenciajardim.app`;
    
    console.log(`📤 Enviando para: ${emailDestino}${isTestModeRedirect ? ` (original: ${to})` : ''}`);
    
    // Enviar e-mail via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getEmailSender(),
        to: [emailDestino],
        subject: emailSubject,
        html: emailHtml,
        text: emailText
      }),
    });
    
    // Parsear resposta do Resend
    const result = await parseResendResponse(response);
    
    // Verificar se houve erro no parsing
    if (result.isHtmlResponse) {
      return c.json({
        success: false,
        error: 'API Key do Resend inválida ou expirada',
        errorType: 'invalid_api_key',
        details: 'O Resend retornou uma página HTML em vez de JSON. Isso indica que a API Key está incorreta ou expirada.',
        hint: 'Verifique a API Key do Resend em resend.com/api-keys'
      }, 401);
    }
    
    if (result.parseError) {
      return c.json({
        success: false,
        error: 'Erro ao processar resposta do Resend',
        errorType: 'parse_error',
        details: result.error,
        hint: 'Verifique se a API Key do Resend está correta e não expirou'
      }, 500);
    }
    
    if (!response.ok) {
      console.error('Erro do Resend:', result);
      
      // Determinar tipo específico de erro
      let errorMessage = 'Falha ao enviar e-mail';
      let errorType = 'send_failed';
      
      if (response.status === 401) {
        errorMessage = 'API Key do Resend inválida ou expirada';
        errorType = 'invalid_api_key';
      } else if (response.status === 403) {
        // Modo de teste ainda detectado após tentativa
        if (result.message && result.message.includes('You can only send testing emails to your own email address')) {
          console.log('⚠️ [SERVER] Erro 403 persistiu mesmo após verificação de modo teste');
          console.error('Detalhes do erro 403:', JSON.stringify(result, null, 2));
          console.error(`Email de destino usado: ${emailDestino}`);
          console.error(`TestModeInfo: ${JSON.stringify(testModeInfo, null, 2)}`);
          
          // Extrair o e-mail autorizado da mensagem como fallback
          const emailMatch = result.message.match(/\(([^)]+)\)/);
          const authorizedEmail = emailMatch ? emailMatch[1] : testModeInfo.authorizedEmail || 'controleinterno@transpjardim.tech';
          
          console.log(`📧 [SERVER] Email autorizado detectado na mensagem de erro: ${authorizedEmail}`);
          
          // Tentar enviar novamente para o email autorizado
          try {
            const retryResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: getEmailSender(),
                to: [authorizedEmail],
                subject: `TranspJardim: ${subject} [MODO TESTE - Redirecionado]`,
                html: htmlTemplate,
                text: `TranspJardim - ${subject}\\n\\nCritério: ${criterio?.nome}\\nSecretaria: ${criterio?.secretaria}\\nResponsável: ${usuario?.name}\\nPrazo: ${dueDate ? new Date(dueDate).toLocaleDateString('pt-BR') : 'N/A'}\\n\\nAcesse: https://transparenciajardim.app\\n\\n[EMAIL REDIRECIONADO PARA MODO DE TESTE]`
              }),
            });
            
            const retryResult = await parseResendResponse(retryResponse);
            
            if (retryResponse.ok && retryResult.id) {
              console.log(`✅ [SERVER] Email enviado com sucesso para ${authorizedEmail} (modo teste)`);
              
              // Salvar log do e-mail enviado
              const emailLog = {
                id: retryResult.id,
                to: authorizedEmail,
                originalTo: to,
                subject: `${subject} [MODO TESTE]`,
                alertType,
                criterioId: criterio?.id,
                usuarioId: usuario?.id,
                sentAt: new Date().toISOString(),
                status: 'sent',
                testModeRedirect: true
              };
              
              await kv.set(`email_log:${retryResult.id}`, emailLog);
              
              return c.json({ 
                success: true,
                emailId: retryResult.id,
                message: `Email enviado com sucesso em modo de teste para ${authorizedEmail}`,
                testMode: true,
                authorizedEmail,
                originalEmail: to,
                note: `Sistema em modo de teste: email redirecionado de ${to} para ${authorizedEmail}`
              });
            } else {
              console.error(`❌ [SERVER] Falha no retry para email autorizado:`, retryResult);
            }
          } catch (retryError) {
            console.error(`❌ [SERVER] Erro no retry:`, retryError);
          }
          
          // Se o retry falhou, retornar informação do modo de teste
          return c.json({ 
            success: true,
            emailId: 'test-mode-restriction',
            message: 'API Key válida - Sistema em modo de teste',
            testMode: true,
            authorizedEmail,
            note: `Em modo de teste, e-mails só podem ser enviados para: ${authorizedEmail}`
          });
        } else if (result.message && result.message.includes('domain is not verified')) {
          errorMessage = '📧 Sistema usando domínio padrão. Para domínio personalizado, configure transpjardim.tech no Resend.';
          errorType = 'domain_not_verified';
        } else {
          errorMessage = 'Acesso negado ao serviço Resend';
          errorType = 'access_denied';
        }
      } else if (response.status === 429) {
        console.warn('⚠️ [SERVER] Rate limit atingido - aguardando próxima tentativa');
        errorMessage = 'Rate limit atingido. Sistema aguardará antes da próxima tentativa.';
        errorType = 'rate_limit';
      } else if (response.status === 422) {
        errorMessage = 'Dados do e-mail inválidos';
        errorType = 'validation_error';
      } else if (result.message) {
        errorMessage = `Erro Resend: ${result.message}`;
        errorType = 'resend_error';
      }
      
      return c.json({ 
        success: false, 
        error: errorMessage,
        errorType,
        statusCode: response.status,
        details: result
      }, 500);
    }
    
    console.log(`E-mail enviado com sucesso. ID: ${result.id}`);
    
    // Salvar log do e-mail enviado
    const emailLog = {
      id: result.id,
      to: to,
      subject,
      alertType,
      criterioId: criterio?.id,
      usuarioId: usuario?.id,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };
    
    await kv.set(`email_log:${result.id}`, emailLog);
    
    return c.json({ 
      success: true, 
      emailId: result.id,
      message: 'E-mail enviado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ [SEND-ALERT] Erro ao enviar e-mail:', error);
    
    // Determinar tipo específico de erro
    let errorMessage = 'Erro interno do servidor ao enviar e-mail';
    let errorType = 'unknown';
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Erro de conectividade com serviço Resend';
      errorType = 'connectivity';
    } else if (error instanceof Error) {
      if (error.message.includes('RESEND_API_KEY')) {
        errorMessage = 'API Key do Resend não configurada';
        errorType = 'config';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Erro ao processar dados do e-mail';
        errorType = 'data';
      } else {
        errorMessage = `Erro no envio: ${error.message}`;
        errorType = 'send';
      }
    }
    
    console.error('❌ [SEND-ALERT] Error type:', errorType);
    console.error('❌ [SEND-ALERT] Error message:', errorMessage);
    console.error('❌ [SEND-ALERT] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    return c.json({ 
      success: false, 
      error: errorMessage,
      errorType,
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Verificar apenas configuração de e-mail (sem envio de teste)
app.get('/make-server-225e1157/email/check-config', async (c) => {
  try {
    console.log('Verificando configuração de e-mail...');
    
    const resendApiKey = await getResendApiKey();
    
    if (!resendApiKey) {
      return c.json({ 
        configured: false,
        error: 'RESEND_API_KEY não configurada'
      });
    }

    // Validar formato da API key
    const apiKeyTrimmed = resendApiKey.trim();
    if (!apiKeyTrimmed.startsWith('re_') || apiKeyTrimmed.length < 32) {
      return c.json({ 
        configured: false,
        error: 'RESEND_API_KEY com formato inválido'
      });
    }
    
    console.log('✅ API Key configurada e válida');
    return c.json({ 
      configured: true,
      message: 'Sistema de e-mail configurado'
    });
    
  } catch (error) {
    console.error('Erro ao verificar configuração de e-mail:', error);
    return c.json({ 
      configured: false,
      error: 'Erro ao verificar configuração'
    }, 500);
  }
});

// Buscar logs de e-mails
app.get('/make-server-225e1157/email/logs', async (c) => {
  try {
    console.log('Buscando logs de e-mails...');
    
    if (typeof kv.getByPrefix !== 'function') {
      return c.json({ 
        success: false, 
        error: 'Sistema de armazenamento não configurado' 
      }, 500);
    }
    
    const emailLogs = await kv.getByPrefix('email_log:');
    
    const logs = emailLogs.map(item => item.value).sort((a, b) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
    
    return c.json({ 
      success: true, 
      data: logs,
      count: logs.length 
    });
    
  } catch (error) {
    console.error('Erro ao buscar logs de e-mail:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, 500);
  }
});

// Rotas de verificação de domínio removidas - configuração feita diretamente no Resend

// Salvar API Key do Resend
app.post('/make-server-225e1157/email/save-api-key', async (c) => {
  try {
    const { apiKey } = await c.req.json();
    
    if (!apiKey) {
      return c.json({ 
        success: false, 
        error: 'API Key é obrigatória' 
      }, 400);
    }
    
    // Validar formato da API key
    const apiKeyTrimmed = apiKey.trim();
    if (!apiKeyTrimmed.startsWith('re_') || apiKeyTrimmed.length < 32) {
      return c.json({ 
        success: false, 
        error: 'API Key com formato inválido. Deve começar com "re_" e ter pelo menos 32 caracteres.',
        errorType: 'invalid_api_key_format'
      }, 400);
    }
    
    console.log('💾 Salvando RESEND_API_KEY no ambiente...');
    
    // Testar a API Key primeiro
    const testResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKeyTrimmed}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: ['test@test.local'],
        subject: 'Test',
        html: '<p>Test</p>',
      }),
    });
    
    const testResult = await parseResendResponse(testResponse);
    
    // Se for 401, a API Key é inválida
    if (testResponse.status === 401 || testResult.isHtmlResponse) {
      return c.json({ 
        success: false, 
        error: 'API Key inválida ou expirada',
        errorType: 'invalid_api_key'
      }, 401);
    }
    
    // Se for 403 com mensagem de modo de teste, a API Key é válida
    let isTestMode = false;
    let authorizedEmail = '';
    
    if (testResponse.status === 403) {
      if (testResult.message && testResult.message.includes('You can only send testing emails to your own email address')) {
        console.log('🔵 API Key válida - Modo de teste detectado');
        isTestMode = true;
        
        // Extrair e-mail autorizado
        const emailMatch = testResult.message.match(/\(([^)]+)\)/);
        authorizedEmail = emailMatch ? emailMatch[1] : '';
        
        console.log(`📧 E-mail autorizado: ${authorizedEmail}`);
      } else if (testResult.message && testResult.message.includes('domain is not verified')) {
        console.log('🔵 API Key válida - Domínio não verificado');
        isTestMode = false;
      } else {
        return c.json({ 
          success: false, 
          error: 'Erro ao validar API Key: ' + testResult.message,
          errorType: 'validation_failed'
        }, 403);
      }
    }
    
    // Salvar no KV Store
    try {
      await kv.set('config:resend_api_key', {
        apiKey: apiKeyTrimmed,
        savedAt: new Date().toISOString(),
        testMode: isTestMode,
        authorizedEmail: authorizedEmail || undefined
      });
      
      console.log('✅ RESEND_API_KEY salva com sucesso no KV Store');
      
      return c.json({ 
        success: true, 
        message: 'API Key salva com sucesso',
        testMode: isTestMode,
        authorizedEmail: isTestMode ? authorizedEmail : undefined,
        note: isTestMode 
          ? `Sistema em modo de teste. E-mails serão enviados para: ${authorizedEmail}`
          : 'API Key configurada com sucesso'
      });
      
    } catch (kvError) {
      console.error('❌ Erro ao salvar API Key no KV Store:', kvError);
      return c.json({ 
        success: false, 
        error: 'Erro ao salvar API Key no sistema de armazenamento',
        errorType: 'storage_error',
        details: kvError instanceof Error ? kvError.message : 'Erro desconhecido'
      }, 500);
    }
    
  } catch (error) {
    console.error('❌ Erro ao salvar API Key:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// Testar configuração de e-mail
app.post('/make-server-225e1157/email/test', async (c) => {
  try {
    const { testEmail, configTest } = await c.req.json();
    
    if (!testEmail) {
      return c.json({ 
        success: false, 
        error: 'E-mail de teste é obrigatório' 
      }, 400);
    }
    
    // Permitir API key temporária para testes de configuração
    const tempApiKey = c.req.header('X-Test-API-Key');
    let resendApiKey: string | null = null;
    
    if (configTest && tempApiKey) {
      console.log('🔧 Usando API Key temporária para teste de configuração');
      resendApiKey = tempApiKey;
    } else {
      resendApiKey = await getResendApiKey();
    }
    
    if (!resendApiKey) {
      return c.json({ 
        success: false, 
        error: 'RESEND_API_KEY não configurada no servidor',
        errorType: 'missing_api_key'
      }, 500);
    }

    // Validar formato da API key
    const apiKeyTrimmed = resendApiKey.trim();
    if (!apiKeyTrimmed.startsWith('re_') || apiKeyTrimmed.length < 32) {
      const maskedKey = apiKeyTrimmed.length > 10 ? 
        apiKeyTrimmed.substring(0, 10) + '...' : 
        apiKeyTrimmed;
      
      console.error('RESEND_API_KEY com formato inválido (teste):', maskedKey);
      return c.json({ 
        success: false, 
        error: 'RESEND_API_KEY com formato inválido',
        errorType: 'invalid_api_key_format',
        details: `A API Key deve começar com "re_" e ter pelo menos 32 caracteres. Recebido: ${maskedKey}`
      }, 500);
    }
    
    // NOVO: Verificar modo de teste ANTES de enviar
    const testModeInfo = await getTestModeInfo();
    console.log(`📧 [TEST] Modo de teste: ${testModeInfo.testMode ? 'ATIVO' : 'DESATIVADO'}`, testModeInfo.authorizedEmail ? `- Email autorizado: ${testModeInfo.authorizedEmail}` : '');
    
    // Decidir para qual e-mail enviar
    const emailDestino = testModeInfo.testMode ? testModeInfo.authorizedEmail : testEmail;
    const isTestModeRedirect = testModeInfo.testMode && testEmail !== testModeInfo.authorizedEmail;
    
    console.log(`📤 [TEST] Enviando para: ${emailDestino}${isTestModeRedirect ? ` (original: ${testEmail})` : ''}`);
    
    // Preparar o template HTML com notificação de modo teste se necessário
    const testModeNotice = isTestModeRedirect ? `
            <div style="background: #e3f2fd; border: 2px solid #2196f3; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 0; color: #1976d2;"><strong>🧪 MODO TESTE:</strong></p>
              <p style="margin: 5px 0; color: #1976d2;">📮 <strong>Enviado para:</strong> ${emailDestino}</p>
              <p style="margin: 5px 0; font-size: 12px; color: #1565c0;"><em>Em modo teste, e-mails só podem ser enviados para o email cadastrado no Resend.</em></p>
            </div>` : '';
    
    const emailSubject = isTestModeRedirect 
      ? `TranspJardim - Teste de Configuração [Para: ${testEmail}]`
      : `TranspJardim - Teste de Configuração`;
    
    const emailText = isTestModeRedirect
      ? `TranspJardim - Teste de E-mail\n\n[MODO TESTE - Destinatário original: ${testEmail}]\n\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\nData/Hora: ${new Date().toLocaleString('pt-BR')}`
      : `TranspJardim - Teste de E-mail\n\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\nData/Hora: ${new Date().toLocaleString('pt-BR')}`;
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getEmailSender(),
        to: [emailDestino],
        subject: emailSubject,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4a7c59, #6c9a6f); color: white; padding: 20px; text-align: center; border-radius: 8px;">
            <h1>🏛️ TranspJardim</h1>
            <p>Controladoria Municipal de Jardim/CE</p>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
            ${testModeNotice}
            <h2>✅ Teste de E-mail Realizado com Sucesso!</h2>
            <p>Se você recebeu este e-mail, significa que o sistema de alertas por e-mail do TranspJardim está funcionando corretamente.</p>
            <p><strong>Data/Hora do Teste:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <p>O sistema agora pode enviar alertas automáticos para os critérios de transparência.</p>
          </div>
        </div>`,
        text: emailText
      }),
    });
    
    // Parsear resposta do Resend
    const result = await parseResendResponse(response);
    
    // Verificar se houve erro no parsing
    if (result.isHtmlResponse) {
      return c.json({
        success: false,
        error: 'API Key do Resend inválida ou expirada',
        errorType: 'invalid_api_key',
        details: 'O Resend retornou uma página HTML em vez de JSON. Isso indica que a API Key está incorreta ou expirada.',
        action: 'Verifique a API Key do Resend em resend.com/api-keys'
      }, 401);
    }
    
    if (result.parseError) {
      return c.json({
        success: false,
        error: 'Erro ao processar resposta do Resend',
        errorType: 'parse_error',
        details: result.error,
        hint: 'Verifique se a API Key do Resend está correta e não expirou'
      }, 500);
    }
    
    if (!response.ok) {
      console.error('Erro no teste de e-mail:', result);
      
      // Determinar tipo específico de erro
      let errorMessage = 'Falha no teste de e-mail';
      let errorType = 'test_failed';
      
      if (response.status === 401) {
        errorMessage = 'API Key do Resend inválida ou expirada';
        errorType = 'invalid_api_key';
      } else if (response.status === 403) {
        if (result.message && result.message.includes('domain is not verified')) {
          errorMessage = 'API Key válida! Configure domínio transpjardim.tech no Resend.';
          errorType = 'success_with_domain_note';
          
          // Mesmo com erro 403 de domínio, se chegou até aqui a API key está válida
          return c.json({ 
            success: true, 
            emailId: 'domain-not-verified-but-api-valid',
            message: errorMessage,
            note: 'Para envios em produção, configure o domínio transpjardim.tech no painel do Resend.'
          });
        } else if (result.message && result.message.includes('You can only send testing emails to your own email address')) {
          console.log('🔵 [SERVER] Modo de teste detectado no endpoint de teste');
          
          // Extrair o e-mail autorizado da mensagem
          const emailMatch = result.message.match(/\(([^)]+)\)/);
          const authorizedEmail = emailMatch ? emailMatch[1] : '2421541@faculdadececape.edu.br';
          
          console.log(`📧 [SERVER] Email autorizado para teste: ${authorizedEmail}`);
          
          // Tentar enviar para o email autorizado
          try {
            const retryResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: getEmailSender(),
                to: [authorizedEmail],
                subject: `TranspJardim - Teste de Configuração [REDIRECIONADO]`,
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #4a7c59, #6c9a6f); color: white; padding: 20px; text-align: center; border-radius: 8px;">
                    <h1>🏛️ TranspJardim</h1>
                    <p>Controladoria Municipal de Jardim/CE</p>
                  </div>
                  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
                    <h2>✅ Teste de E-mail Realizado com Sucesso!</h2>
                    <p>Se você recebeu este e-mail, significa que o sistema de alertas por e-mail do TranspJardim está funcionando corretamente.</p>
                    <p><strong>Data/Hora do Teste:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                    <div style="background: #e3f2fd; border: 1px solid #2196f3; padding: 15px; border-radius: 6px; margin: 20px 0;">
                      <p><strong>🔄 Email Redirecionado (Modo Teste):</strong></p>
                      <p>📮 <strong>Enviado para:</strong> ${authorizedEmail}</p>
                      <p><em>Contas novas do Resend só podem enviar para o email de cadastro.</em></p>
                    </div>
                    <p>O sistema agora pode enviar alertas automáticos para os critérios de transparência.</p>
                  </div>
                </div>`,
                text: `TranspJardim - Teste de E-mail\\n\\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\\nData/Hora: ${new Date().toLocaleString('pt-BR')}\\n\\nEmail redirecionado de ${testEmail} para ${authorizedEmail} devido ao modo de teste do Resend.`
              }),
            });
            
            const retryResult = await parseResendResponse(retryResponse);
            
            if (retryResponse.ok && retryResult.id) {
              console.log(`✅ [SERVER] Email de teste enviado com sucesso para ${authorizedEmail}`);
              
              return c.json({ 
                success: true, 
                emailId: retryResult.id,
                message: `Email de teste enviado com sucesso!`,
                note: `Sistema em modo de teste: email redirecionado de ${testEmail} para ${authorizedEmail}`,
                testMode: true,
                authorizedEmail,
                originalEmail: testEmail
              });
            } else {
              console.error(`❌ [SERVER] Falha no retry do teste:`, retryResult);
            }
          } catch (retryError) {
            console.error(`❌ [SERVER] Erro no retry do teste:`, retryError);
          }
          
          // Se o retry falhou, retornar informação básica
          return c.json({ 
            success: true, 
            emailId: 'test-restriction-but-api-valid',
            message: '✅ API Key configurada corretamente!',
            note: `Sistema funcionando! Em modo de teste, só pode enviar para: ${authorizedEmail}`,
            testMode: true,
            authorizedEmail
          });
        } else {
          errorMessage = 'Acesso negado ao serviço Resend';
          errorType = 'access_denied';
        }
      } else if (response.status === 429) {
        console.warn('⚠️ [SERVER] Rate limit atingido no teste de e-mail');
        errorMessage = '⏱️ Rate limit atingido. Aguarde alguns segundos antes de tentar novamente.';
        errorType = 'rate_limit';
      } else if (response.status === 422) {
        errorMessage = 'Dados do e-mail inválidos';
        errorType = 'validation_error';
      } else if (result.message) {
        errorMessage = `Erro Resend: ${result.message}`;
        errorType = 'resend_error';
      }
      
      return c.json({ 
        success: false, 
        error: errorMessage,
        errorType,
        statusCode: response.status,
        details: result
      }, 500);
    }
    
    console.log(`Teste de e-mail enviado com sucesso. ID: ${result.id}`);
    
    return c.json({ 
      success: true, 
      emailId: result.id,
      message: isTestModeRedirect 
        ? `E-mail enviado em modo de teste (redirecionado para ${emailDestino})`
        : `E-mail de teste enviado para ${testEmail}`,
      testMode: isTestModeRedirect,
      authorizedEmail: isTestModeRedirect ? emailDestino : undefined
    });
    
  } catch (error) {
    console.error('❌ [SERVER] Erro no teste de e-mail:', error);
    console.error('❌ [SERVER] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      errorType: 'server_error'
    }, 500);
  }
});

// ============================================
// USUÁRIOS - CRUD
// ============================================

// Listar usuários
app.get('/make-server-225e1157/users', async (c) => {
  try {
    console.log('=== INICIANDO LISTAGEM DE USUÁRIOS ===');
    
    // Timeout de segurança (2 segundos)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout ao buscar usuários')), 2000)
    );
    
    // Verificar se a função kv.getByPrefix existe
    if (typeof kv.getByPrefix !== 'function') {
      console.error('ERRO CRÍTICO: kv.getByPrefix não é uma função');
      console.log('Funções disponíveis no kv:', Object.keys(kv));
      return c.json({ 
        success: false, 
        error: 'Erro de configuração do sistema de armazenamento',
        debug: 'kv.getByPrefix is not a function'
      }, 500);
    }
    
    console.log('Chamando kv.getByPrefix("usuario_id:") com limite de 100...');
    
    // Usar Promise.race para aplicar timeout
    const usuarios = await Promise.race([
      kv.getByPrefix('usuario_id:', 100),
      timeoutPromise
    ]) as Array<{key: string, value: any}>;
    
    console.log(`Resultado da busca: ${usuarios?.length || 0} usuários`);
    
    if (!Array.isArray(usuarios)) {
      console.error('ERRO: getByPrefix não retornou um array:', typeof usuarios);
      return c.json({ 
        success: false, 
        error: 'Formato de dados inesperado do armazenamento' 
      }, 500);
    }
    
    const usuariosSemSenha = usuarios.map(item => {
      if (!item || !item.value) {
        console.warn('Item de usuário inválido:', item);
        return null;
      }
      
      const { password, ...usuarioSemSenha } = item.value;
      return usuarioSemSenha;
    }).filter(Boolean); // Remove nulls
    
    console.log(`✅ ${usuariosSemSenha.length} usuários processados com sucesso`);
    
    return c.json({ 
      success: true, 
      data: usuariosSemSenha,
      count: usuariosSemSenha.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('💥 ERRO ao buscar usuários:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Se for timeout, retornar erro mais específico
    if (error instanceof Error && error.message.includes('Timeout')) {
      return c.json({ 
        success: false, 
        error: 'Timeout ao buscar usuários - banco de dados lento',
        details: 'A operação demorou mais de 2 segundos',
        timestamp: new Date().toISOString()
      }, 504);
    }
    
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor ao buscar usuários',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Criar usuário
app.post('/make-server-225e1157/users', async (c) => {
  try {
    const { name, username, email, password, role, secretaria } = await c.req.json();
    console.log(`Criando usuário: ${username}`);
    
    // Validações básicas
    if (!name || !username || !password || !role) {
      return c.json({ 
        success: false, 
        error: 'Nome, usuário, senha e role são obrigatórios' 
      }, 400);
    }
    
    // Validar e-mail se fornecido
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return c.json({ 
          success: false, 
          error: 'E-mail inválido' 
        }, 400);
      }
    }
    
    // Verificar se username já existe
    const usuarioExistente = await kv.get(`usuario:${username}`);
    if (usuarioExistente) {
      return c.json({ 
        success: false, 
        error: 'Nome de usuário já existe' 
      }, 400);
    }
    
    const id = `user_${Date.now()}`;
    const novoUsuario = {
      id,
      name,
      username,
      email: email || '',
      password,
      role,
      secretaria: role === 'admin' ? undefined : secretaria,
      dataCriacao: new Date().toISOString()
    };
    
    await kv.set(`usuario:${username}`, novoUsuario);
    await kv.set(`usuario_id:${id}`, novoUsuario);
    
    console.log(`✅ Usuário criado: ${username} - Email: ${email || 'N/A'}`);
    
    const { password: _, ...usuarioSemSenha } = novoUsuario;
    
    return c.json({ 
      success: true, 
      data: usuarioSemSenha,
      message: 'Usuário criado com sucesso' 
    }, 201);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor ao criar usuário' 
    }, 500);
  }
});

// Atualizar usuário
app.put('/make-server-225e1157/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { name, username, email, password, role, secretaria } = await c.req.json();
    console.log(`Atualizando usuário ID: ${id}`);
    
    const usuarioAtual = await kv.get(`usuario_id:${id}`);
    if (!usuarioAtual) {
      return c.json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      }, 404);
    }
    
    const usuarioAtualizado = {
      ...usuarioAtual,
      ...(name && { name }),
      ...(username && { username }),
      ...(email && { email }),
      ...(password && { password }),
      ...(role && { role }),
      secretaria: role === 'admin' ? undefined : secretaria,
      dataAtualizacao: new Date().toISOString()
    };
    
    // Se username mudou, remover chave antiga
    if (username && username !== usuarioAtual.username) {
      await kv.del(`usuario:${usuarioAtual.username}`);
      await kv.set(`usuario:${username}`, usuarioAtualizado);
    } else {
      await kv.set(`usuario:${usuarioAtual.username}`, usuarioAtualizado);
    }
    
    await kv.set(`usuario_id:${id}`, usuarioAtualizado);
    
    console.log(`✅ Usuário atualizado: ${usuarioAtualizado.username} - Email: ${usuarioAtualizado.email || 'N/A'}`);
    
    const { password: _, ...usuarioSemSenha } = usuarioAtualizado;
    
    return c.json({ 
      success: true, 
      data: usuarioSemSenha,
      message: 'Usuário atualizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, 500);
  }
});

// Deletar usuário
app.delete('/make-server-225e1157/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`Deletando usuário ID: ${id}`);
    
    const usuario = await kv.get(`usuario_id:${id}`);
    if (!usuario) {
      return c.json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      }, 404);
    }
    
    await kv.del(`usuario:${usuario.username}`);
    await kv.del(`usuario_id:${id}`);
    
    console.log(`Usuário deletado: ${usuario.username}`);
    
    return c.json({ 
      success: true, 
      message: 'Usuário deletado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, 500);
  }
});

// ============================================
// ROTA PARA BUSCAR E-MAILS DE USUÁRIOS
// ============================================

// Buscar e-mails de usuários para notificações
app.get('/make-server-225e1157/users/emails', async (c) => {
  try {
    console.log('=== BUSCANDO E-MAILS DE USUÁRIOS ===');
    
    // Verificar parâmetros de consulta
    const secretaria = c.req.query('secretaria');
    const role = c.req.query('role');
    
    if (typeof kv.getByPrefix !== 'function') {
      console.error('ERRO: kv.getByPrefix não disponível');
      return c.json({ 
        success: false, 
        error: 'Sistema de armazenamento não configurado' 
      }, 500);
    }
    
    // Buscar todos os usuários
    const usuarios = await kv.getByPrefix('usuario:');
    
    if (!Array.isArray(usuarios)) {
      return c.json({ 
        success: false, 
        error: 'Erro ao buscar usuários' 
      }, 500);
    }
    
    // Filtrar usuários e extrair e-mails
    let usuariosFiltrados = usuarios.map(item => item.value).filter(Boolean);
    
    // Aplicar filtros se especificados
    if (secretaria) {
      usuariosFiltrados = usuariosFiltrados.filter(user => user.secretaria === secretaria);
    }
    
    if (role) {
      usuariosFiltrados = usuariosFiltrados.filter(user => user.role === role);
    }
    
    // Extrair e-mails válidos
    const emails = usuariosFiltrados
      .filter(user => user.email && user.email.includes('@'))
      .map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        secretaria: user.secretaria,
        role: user.role
      }));
    
    console.log(`✅ ${emails.length} e-mails encontrados`);
    
    return c.json({ 
      success: true, 
      data: emails,
      count: emails.length,
      filters: { secretaria, role }
    });
    
  } catch (error) {
    console.error('Erro ao buscar e-mails de usuários:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, 500);
  }
});

// Buscar usuários por secretaria (para seleção de responsáveis em critérios)
app.get('/make-server-225e1157/users/by-secretaria/:secretaria', async (c) => {
  try {
    const secretaria = decodeURIComponent(c.req.param('secretaria') || '');
    console.log(`=== BUSCANDO USUÁRIOS DA SECRETARIA: "${secretaria}" ===`);
    
    if (!secretaria) {
      console.error('❌ Secretaria não especificada');
      return c.json({ 
        success: false, 
        error: 'Secretaria não especificada' 
      }, 400);
    }
    
    // Timeout de segurança (5 segundos para operações de leitura)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout ao buscar usuários')), 5000)
    );
    
    if (typeof kv.getByPrefix !== 'function') {
      console.error('ERRO CRÍTICO: kv.getByPrefix não é uma função');
      return c.json({ 
        success: false, 
        error: 'Erro de configuração do sistema de armazenamento'
      }, 500);
    }
    
    console.log('Buscando todos os usuários com prefixo "usuario_id:"...');
    
    // Buscar todos os usuários
    const usuarios = await Promise.race([
      kv.getByPrefix('usuario_id:', 100),
      timeoutPromise
    ]) as Array<{key: string, value: any}>;
    
    console.log(`✓ Encontrados ${usuarios?.length || 0} usuários no total`);
    
    if (!Array.isArray(usuarios)) {
      console.error('ERRO: getByPrefix não retornou um array');
      return c.json({ 
        success: false, 
        error: 'Formato de dados inesperado do armazenamento' 
      }, 500);
    }
    
    // Filtrar usuários pela secretaria
    const usuariosDaSecretaria = usuarios
      .map(item => item.value)
      .filter(user => user && user.secretaria === secretaria)
      .map(({ password, ...usuarioSemSenha }) => usuarioSemSenha);
    
    console.log(`✅ ${usuariosDaSecretaria.length} usuários encontrados na secretaria ${secretaria}`);
    
    return c.json({ 
      success: true, 
      data: usuariosDaSecretaria,
      count: usuariosDaSecretaria.length,
      secretaria: secretaria,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('💥 ERRO ao buscar usuários por secretaria:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof Error && error.message.includes('Timeout')) {
      return c.json({ 
        success: false, 
        error: 'Timeout ao buscar usuários - banco de dados lento',
        details: 'A operação demorou mais de 2 segundos',
        timestamp: new Date().toISOString()
      }, 504);
    }
    
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor ao buscar usuários',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Enviar notificação para múltiplos usuários baseado em critério
app.post('/make-server-225e1157/email/notify-users', async (c) => {
  try {
    const { criterio, alertType, secretaria, includeAdmin } = await c.req.json();
    console.log(`Enviando notificações para critério: ${criterio?.nome}`);
    
    // Buscar e-mails dos usuários que devem receber a notificação
    const usuarios = await kv.getByPrefix('usuario:');
    
    if (!Array.isArray(usuarios)) {
      return c.json({ 
        success: false, 
        error: 'Erro ao buscar usuários' 
      }, 500);
    }
    
    // Filtrar usuários que devem receber a notificação
    let usuariosParaNotificar = usuarios.map(item => item.value).filter(Boolean);
    
    // Se especificada secretaria, filtrar por ela
    if (secretaria) {
      usuariosParaNotificar = usuariosParaNotificar.filter(user => 
        user.secretaria === secretaria || (includeAdmin && user.role === 'admin')
      );
    }
    
    // Se includeAdmin é false, excluir admins
    if (!includeAdmin) {
      usuariosParaNotificar = usuariosParaNotificar.filter(user => user.role !== 'admin');
    }
    
    // Filtrar apenas usuários com e-mail válido
    const emailsParaEnviar = usuariosParaNotificar
      .filter(user => user.email && user.email.includes('@'))
      .map(user => user.email);
    
    if (emailsParaEnviar.length === 0) {
      return c.json({ 
        success: false, 
        error: 'Nenhum usuário com e-mail válido encontrado para notificação',
        filters: { secretaria, includeAdmin }
      }, 400);
    }
    
    // Preparar dados do e-mail
    const subject = alertType === 'urgent' 
      ? `🔴 URGENTE: ${criterio?.nome}` 
      : `🟡 AVISO: ${criterio?.nome}`;
    
    const resendApiKey = await getResendApiKey();
    if (!resendApiKey) {
      return c.json({ 
        success: false, 
        error: 'RESEND_API_KEY não configurada' 
      }, 500);
    }
    
    // Template HTML do e-mail
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TranspJardim - Notificação de Critério</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4a7c59, #6c9a6f); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
            .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .alert-urgent { background: #f8d7da; border: 1px solid #f5c6cb; }
            .button { display: inline-block; background: #4a7c59; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏛️ TranspJardim</div>
                <h1>Notificação de Transparência</h1>
                <p>Controladoria Municipal de Jardim/CE</p>
            </div>
            
            <div class="content">
                <h2>📋 ${subject}</h2>
                
                <div class="alert-box ${alertType === 'urgent' ? 'alert-urgent' : ''}">
                    <h3>Critério: ${criterio?.nome || 'N/A'}</h3>
                    <p><strong>Secretaria:</strong> ${criterio?.secretaria || 'N/A'}</p>
                    <p><strong>Tipo de Alerta:</strong> ${alertType === 'urgent' ? '🔴 URGENTE' : '🟡 AVISO'}</p>
                    <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                </div>
                
                <p>Esta é uma notificação automática do sistema TranspJardim da Controladoria Municipal de Jardim/CE.</p>
                
                <p>Por favor, acesse o sistema para verificar e atualizar o status dos critérios quando apropriado.</p>
                
                <a href="https://transpjardim.tech" class="button">Acessar TranspJardim</a>
            </div>
            
            <div class="footer">
                <p>© 2024 Prefeitura Municipal de Jardim/CE - Controladoria Geral</p>
                <p>Este e-mail foi enviado automaticamente pelo sistema TranspJardim</p>
                <p><strong>Sistema:</strong> TranspJardim - Controladoria Municipal</p>
            </div>
        </div>
    </body>
    </html>`;
    
    // Verificar se está em modo de teste
    const testModeInfo = await getTestModeInfo();
    console.log(`📧 Modo de teste: ${testModeInfo.testMode ? 'ATIVO' : 'DESATIVADO'}`, testModeInfo.authorizedEmail ? `- Email autorizado: ${testModeInfo.authorizedEmail}` : '');
    
    // Enviar e-mails individuais para cada destinatário
    const enviosRealizados = [];
    const errosEnvio = [];
    
    for (const email of emailsParaEnviar) {
      try {
        // Se está em modo teste, enviar direto para o e-mail autorizado
        const emailDestino = testModeInfo.testMode ? testModeInfo.authorizedEmail : email;
        const isTestModeRedirect = testModeInfo.testMode && email !== testModeInfo.authorizedEmail;
        
        // Modificar template se for redirecionamento de teste
        const emailHtml = isTestModeRedirect 
          ? htmlTemplate.replace(
              '<h2>📋',
              `<div style="background: #e3f2fd; border: 2px solid #2196f3; padding: 10px; border-radius: 6px; margin-bottom: 15px;">
                <p style="margin: 0; color: #1976d2;"><strong>🧪 MODO TESTE:</strong> Este e-mail deveria ser enviado para <strong>${email}</strong></p>
              </div>
              <h2>📋`
            )
          : htmlTemplate;
        
        const emailSubject = isTestModeRedirect 
          ? `TranspJardim: ${subject} [Destinatário: ${email}]`
          : `TranspJardim: ${subject}`;
        
        const emailText = isTestModeRedirect
          ? `[MODO TESTE - Destinatário original: ${email}]\n\nTranspJardim - ${subject}\n\nCritério: ${criterio?.nome}\nSecretaria: ${criterio?.secretaria}\nTipo: ${alertType === 'urgent' ? 'URGENTE' : 'AVISO'}\n\nAcesse: https://transparenciajardim.app`
          : `TranspJardim - ${subject}\n\nCritério: ${criterio?.nome}\nSecretaria: ${criterio?.secretaria}\nTipo: ${alertType === 'urgent' ? 'URGENTE' : 'AVISO'}\n\nAcesse: https://transparenciajardim.app`;
        
        console.log(`📤 Enviando para: ${emailDestino}${isTestModeRedirect ? ` (original: ${email})` : ''}`);
        
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: getEmailSender(),
            to: [emailDestino],
            subject: emailSubject,
            html: emailHtml,
            text: emailText
          }),
        });
        
        const result = await parseResendResponse(response);
        
        if (response.ok && result.id) {
          enviosRealizados.push({
            email: emailDestino,
            originalEmail: isTestModeRedirect ? email : undefined,
            id: result.id,
            status: isTestModeRedirect ? 'sent_test_mode' : 'sent'
          });
          console.log(`✅ Notificação enviada para ${emailDestino}${isTestModeRedirect ? ` (original: ${email})` : ''}`);
        } else {
          // Se ainda assim falhar, logar o erro
          errosEnvio.push({
            email,
            error: result.message || 'Erro desconhecido',
            statusCode: response.status
          });
          console.error(`❌ Falha ao enviar para ${emailDestino}:`, result);
        }
      } catch (error) {
        errosEnvio.push({
          email,
          error: error instanceof Error ? error.message : 'Erro de conexão'
        });
        console.error(`❌ Erro ao enviar para ${email}:`, error);
      }
    }
    
    console.log(`Notificações processadas: ${enviosRealizados.length} enviadas, ${errosEnvio.length} com erro`);
    
    // Salvar logs dos e-mails enviados
    for (const envio of enviosRealizados) {
      const emailLog = {
        id: envio.id,
        to: envio.email,
        originalTo: envio.originalEmail || envio.email,
        subject,
        alertType,
        criterioId: criterio?.id,
        sentAt: new Date().toISOString(),
        status: envio.status,
        notificationType: 'mass_notification',
        testModeRedirect: envio.status === 'sent_test_mode'
      };
      
      await kv.set(`email_log:${envio.id}`, emailLog);
    }
    
    // Retornar resultado
    if (enviosRealizados.length > 0) {
      const testModeCount = enviosRealizados.filter(e => e.status === 'sent_test_mode').length;
      const normalCount = enviosRealizados.filter(e => e.status === 'sent').length;
      
      return c.json({ 
        success: true, 
        message: testModeCount > 0 
          ? `Notificações enviadas: ${normalCount} normal, ${testModeCount} redirecionadas (modo teste)`
          : `Notificações enviadas para ${enviosRealizados.length} usuários`,
        recipients: enviosRealizados.length,
        testMode: testModeCount > 0,
        sentEmails: enviosRealizados,
        errors: errosEnvio.length > 0 ? errosEnvio : undefined
      });
    } else {
      return c.json({ 
        success: false, 
        error: 'Nenhum e-mail foi enviado',
        errors: errosEnvio
      }, 500);
    }
    
  } catch (error) {
    console.error('Erro ao enviar notificações em massa:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// ============================================
// ROTAS DE CRITÉRIOS (CRUD)
// ============================================

// Listar todos os critérios
app.get('/make-server-225e1157/criterios', async (c) => {
  try {
    console.log('📋 Buscando critérios...');
    const resultados = await kv.getByPrefix('criterio:');
    
    // Mapear para retornar apenas os valores (objetos critério)
    const criterios = resultados.map(item => item.value);
    
    console.log(`✅ ${criterios.length} critérios encontrados`);
    return c.json({ 
      success: true, 
      data: criterios,
      count: criterios.length
    });
  } catch (error) {
    console.error('❌ Erro ao buscar critérios:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao buscar critérios',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// Criar novo critério
app.post('/make-server-225e1157/criterios', async (c) => {
  try {
    const criterioData = await c.req.json();
    console.log('📝 Criando novo critério:', criterioData.nome);
    
    // Gerar ID único
    const id = `criterio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const criterio = {
      id,
      ...criterioData,
      meta: 100, // Meta sempre 100%
      conclusoesPorUsuario: {}, // Inicializar vazio
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Salvar no KV Store
    await kv.set(`criterio:${id}`, criterio);
    
    console.log(`✅ Critério criado com sucesso: ${id}`);
    return c.json({ 
      success: true, 
      data: criterio,
      message: 'Critério criado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar critério:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao criar critério',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// Atualizar critério existente
app.put('/make-server-225e1157/criterios/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const criterioData = await c.req.json();
    console.log('📝 Atualizando critério com ID:', id);
    console.log('📝 Dados recebidos:', JSON.stringify(criterioData, null, 2));
    
    // DEBUG: Listar todas as chaves de critérios para debug
    const todasChaves = await kv.getByPrefix('criterio:');
    console.log('🔍 Total de critérios no KV:', todasChaves.length);
    console.log('🔍 Primeiras chaves encontradas:', todasChaves.slice(0, 5).map(c => ({ key: c.key, id: c.value?.id })));
    
    // Buscar critério existente
    const criterioExistente = await kv.get(`criterio:${id}`);
    
    if (!criterioExistente) {
      console.error(`❌ Critério não encontrado com chave: criterio:${id}`);
      console.error(`❌ Critérios disponíveis:`, todasChaves.map(c => c.value?.id || c.key).slice(0, 10));
      
      return c.json({ 
        success: false, 
        error: 'Critério não encontrado',
        debug: {
          searchedKey: `criterio:${id}`,
          availableKeys: todasChaves.map(c => c.key).slice(0, 10),
          availableIds: todasChaves.map(c => c.value?.id).slice(0, 10)
        }
      }, 404);
    }
    
    // Atualizar mantendo conclusões
    const criterioAtualizado = {
      ...criterioExistente,
      ...criterioData,
      id, // Manter ID original
      meta: 100, // Garantir meta 100%
      conclusoesPorUsuario: criterioExistente.conclusoesPorUsuario || {},
      createdAt: criterioExistente.createdAt,
      updatedAt: new Date().toISOString()
    };
    
    // Salvar no KV Store
    await kv.set(`criterio:${id}`, criterioAtualizado);
    
    console.log(`✅ Critério atualizado com sucesso: ${id}`);
    return c.json({ 
      success: true, 
      data: criterioAtualizado,
      message: 'Critério atualizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar critério:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao atualizar critério',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// Deletar critério
app.delete('/make-server-225e1157/criterios/:id', async (c) => {
  try {
    const id = c.req.param('id');
    console.log('🗑️ Deletando critério:', id);
    
    // Verificar se existe
    const criterioExistente = await kv.get(`criterio:${id}`);
    
    if (!criterioExistente) {
      return c.json({ 
        success: false, 
        error: 'Critério não encontrado'
      }, 404);
    }
    
    // ✅ CRÍTICO: Deletar todas as tarefas associadas ao critério
    console.log(`🧹 Limpando tarefas do critério ${id}...`);
    const todasTarefas = await kv.getByPrefix('tarefa:');
    let tarefasDeletadas = 0;
    
    for (const item of todasTarefas) {
      const tarefa = item.value;
      if (tarefa.criterioId === id) {
        await kv.del(`tarefa:${tarefa.id}`);
        tarefasDeletadas++;
        console.log(`  ✓ Tarefa deletada: ${tarefa.id}`);
      }
    }
    
    // ✅ Deletar todos os alertas associados ao critério
    console.log(`🧹 Limpando alertas do critério ${id}...`);
    const todosAlertas = await kv.getByPrefix('alerta:');
    let alertasDeletados = 0;
    
    for (const item of todosAlertas) {
      const alerta = item.value;
      if (alerta.criterioId === id) {
        await kv.del(`alerta:${alerta.id}`);
        alertasDeletados++;
        console.log(`  ✓ Alerta deletado: ${alerta.id}`);
      }
    }
    
    // Deletar o critério do KV Store
    await kv.del(`criterio:${id}`);
    
    console.log(`✅ Critério deletado com sucesso: ${id}`);
    console.log(`   └─ ${tarefasDeletadas} tarefas removidas`);
    console.log(`   └─ ${alertasDeletados} alertas removidos`);
    
    return c.json({ 
      success: true, 
      message: 'Critério deletado com sucesso',
      tarefasDeletadas,
      alertasDeletados
    });
  } catch (error) {
    console.error('❌ Erro ao deletar critério:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao deletar critério',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// Marcar/desmarcar conclusão de critério por usuário
app.post('/make-server-225e1157/criterios/:id/toggle-completion', async (c) => {
  try {
    const criterioId = c.req.param('id');
    const { userId, completed } = await c.req.json();
    
    console.log(`🔄 Alternando conclusão do critério ${criterioId} para usuário ${userId}: ${completed}`);
    
    // Buscar critério
    const criterio = await kv.get(`criterio:${criterioId}`);
    
    if (!criterio) {
      return c.json({ 
        success: false, 
        error: 'Critério não encontrado'
      }, 404);
    }
    
    // Atualizar conclusão do usuário
    if (!criterio.conclusoesPorUsuario) {
      criterio.conclusoesPorUsuario = {};
    }
    
    criterio.conclusoesPorUsuario[userId] = {
      concluido: completed,
      dataConclusao: completed ? new Date().toISOString() : null
    };
    
    criterio.updatedAt = new Date().toISOString();
    
    // Salvar
    await kv.set(`criterio:${criterioId}`, criterio);
    
    console.log(`✅ Conclusão atualizada com sucesso`);
    return c.json({ 
      success: true, 
      data: criterio,
      message: completed ? 'Critério marcado como concluído' : 'Conclusão revertida'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar conclusão:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao atualizar conclusão',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// ============================================
// ROTAS DE ALERTAS
// ============================================

// Listar todos os alertas
app.get('/make-server-225e1157/alertas', async (c) => {
  try {
    console.log('🔔 Buscando alertas...');
    const alertas = await kv.getByPrefix('alerta:');
    
    // Ordenar por data (mais recentes primeiro)
    const alertasOrdenados = alertas
      .map(item => item.value)
      .sort((a, b) => new Date(b.dataEnvio).getTime() - new Date(a.dataEnvio).getTime());
    
    console.log(`✅ ${alertasOrdenados.length} alertas encontrados`);
    return c.json({ 
      success: true, 
      data: alertasOrdenados,
      count: alertasOrdenados.length
    });
  } catch (error) {
    console.error('❌ Erro ao buscar alertas:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao buscar alertas',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// Criar novo alerta
app.post('/make-server-225e1157/alertas', async (c) => {
  try {
    const alertaData = await c.req.json();
    console.log('🔔 Criando novo alerta:', alertaData.mensagem);
    
    // ✅ PROTEÇÃO ANTI-DUPLICAÇÃO NO BACKEND
    // Verificar se já existe alerta similar nas últimas 24h
    if (alertaData.tarefaId) {
      const todosAlertas = await kv.getByPrefix('alerta:');
      const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      const alertaDuplicado = todosAlertas.find(item => {
        const alerta = item.value;
        return alerta.tarefaId === alertaData.tarefaId &&
               alerta.tipo === (alertaData.tipo || 'status') &&
               new Date(alerta.dataEnvio).getTime() > twentyFourHoursAgo;
      });
      
      if (alertaDuplicado) {
        console.log(`⚠️ Alerta duplicado detectado para tarefa ${alertaData.tarefaId} - Ignorando`);
        return c.json({ 
          success: true, 
          data: alertaDuplicado.value,
          message: 'Alerta já existe',
          duplicate: true
        });
      }
    }
    
    const id = alertaData.id || `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const alerta = {
      id,
      criterioId: alertaData.criterioId,
      tarefaId: alertaData.tarefaId, // ✅ Adicionar tarefaId
      tipo: alertaData.tipo || 'status',
      mensagem: alertaData.mensagem,
      prioridade: alertaData.prioridade || 'média',
      dataEnvio: alertaData.dataEnvio || new Date().toISOString(),
      lido: alertaData.lido || false,
      createdAt: new Date().toISOString()
    };
    
    // Salvar no KV Store
    await kv.set(`alerta:${id}`, alerta);
    
    console.log(`✅ Alerta criado com sucesso: ${id}`);
    return c.json({ 
      success: true, 
      data: alerta,
      message: 'Alerta criado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar alerta:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao criar alerta',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// Marcar alerta como lido/não lido
app.patch('/make-server-225e1157/alertas/:id/toggle-lido', async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`📖 Alternando status de leitura do alerta: ${id}`);
    
    const alerta = await kv.get(`alerta:${id}`);
    
    if (!alerta) {
      return c.json({ 
        success: false, 
        error: 'Alerta não encontrado'
      }, 404);
    }
    
    alerta.lido = !alerta.lido;
    alerta.updatedAt = new Date().toISOString();
    
    await kv.set(`alerta:${id}`, alerta);
    
    console.log(`✅ Status do alerta atualizado: ${alerta.lido ? 'lido' : 'não lido'}`);
    return c.json({ 
      success: true, 
      data: alerta,
      message: alerta.lido ? 'Alerta marcado como lido' : 'Alerta marcado como não lido'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar alerta:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao atualizar alerta',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// Marcar todos os alertas como lidos
app.post('/make-server-225e1157/alertas/mark-all-read', async (c) => {
  try {
    console.log('📖 Marcando todos os alertas como lidos...');
    
    const alertas = await kv.getByPrefix('alerta:');
    let count = 0;
    
    for (const item of alertas) {
      const alerta = item.value;
      if (!alerta.lido) {
        alerta.lido = true;
        alerta.updatedAt = new Date().toISOString();
        await kv.set(`alerta:${alerta.id}`, alerta);
        count++;
      }
    }
    
    console.log(`✅ ${count} alertas marcados como lidos`);
    return c.json({ 
      success: true, 
      count,
      message: `${count} alertas marcados como lidos`
    });
  } catch (error) {
    console.error('❌ Erro ao marcar alertas como lidos:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao marcar alertas como lidos',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// Deletar alerta
app.delete('/make-server-225e1157/alertas/:id', async (c) => {
  try {
    const id = c.req.param('id');
    console.log('🗑️ Deletando alerta:', id);
    
    const alerta = await kv.get(`alerta:${id}`);
    
    if (!alerta) {
      return c.json({ 
        success: false, 
        error: 'Alerta não encontrado'
      }, 404);
    }
    
    await kv.del(`alerta:${id}`);
    
    console.log(`✅ Alerta deletado com sucesso: ${id}`);
    return c.json({ 
      success: true, 
      message: 'Alerta deletado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar alerta:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao deletar alerta',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// Limpar alertas antigos (mais de 30 dias)
app.post('/make-server-225e1157/alertas/cleanup', async (c) => {
  try {
    console.log('🧹 Limpando alertas antigos...');
    
    const alertas = await kv.getByPrefix('alerta:');
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    let count = 0;
    
    for (const item of alertas) {
      const alerta = item.value;
      const alertDate = new Date(alerta.dataEnvio).getTime();
      
      // Deletar se for mais antigo que 30 dias E estiver lido
      if (alertDate < thirtyDaysAgo && alerta.lido) {
        await kv.del(`alerta:${alerta.id}`);
        count++;
      }
    }
    
    console.log(`✅ ${count} alertas antigos removidos`);
    return c.json({ 
      success: true, 
      count,
      message: `${count} alertas antigos removidos`
    });
  } catch (error) {
    console.error('❌ Erro ao limpar alertas:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao limpar alertas',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// Deletar TODOS os alertas (reset completo)
app.post('/make-server-225e1157/alertas/delete-all', async (c) => {
  try {
    console.log('🗑️💥 DELETANDO TODOS OS ALERTAS...');
    
    const alertas = await kv.getByPrefix('alerta:');
    let count = 0;
    
    for (const item of alertas) {
      await kv.del(item.key);
      count++;
    }
    
    console.log(`✅ ${count} alertas deletados com sucesso`);
    return c.json({ 
      success: true, 
      count,
      message: `${count} alertas deletados com sucesso`
    });
  } catch (error) {
    console.error('❌ Erro ao deletar todos os alertas:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao deletar todos os alertas',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// ✅ LIMPEZA DE TAREFAS ÓRFÃS (tarefas sem critério válido)
app.post('/make-server-225e1157/tarefas/cleanup-orphans', async (c) => {
  try {
    console.log('🧹 Limpando tarefas órfãs (sem critério válido)...');
    
    // Buscar todos os critérios válidos
    const criterios = await kv.getByPrefix('criterio:');
    const criterioIdsValidos = new Set(criterios.map(item => item.value.id));
    
    console.log(`📋 ${criterioIdsValidos.size} critérios válidos encontrados`);
    
    // Buscar todas as tarefas
    const todasTarefas = await kv.getByPrefix('tarefa:');
    let tarefasOrfas = 0;
    let alertasOrfaos = 0;
    
    for (const item of todasTarefas) {
      const tarefa = item.value;
      
      // Se a tarefa tem um criterioId mas o critério não existe mais
      if (tarefa.criterioId && !criterioIdsValidos.has(tarefa.criterioId)) {
        console.log(`  🗑️ Deletando tarefa órfã: ${tarefa.id} (critério ${tarefa.criterioId} não existe)`);
        await kv.del(`tarefa:${tarefa.id}`);
        tarefasOrfas++;
        
        // Deletar alertas relacionados a essa tarefa
        const alertas = await kv.getByPrefix('alerta:');
        for (const alertaItem of alertas) {
          const alerta = alertaItem.value;
          if (alerta.tarefaId === tarefa.id) {
            await kv.del(`alerta:${alerta.id}`);
            alertasOrfaos++;
            console.log(`    ✓ Alerta órfão deletado: ${alerta.id}`);
          }
        }
      }
    }
    
    console.log(`✅ Limpeza concluída!`);
    console.log(`   └─ ${tarefasOrfas} tarefas órfãs removidas`);
    console.log(`   └─ ${alertasOrfaos} alertas órfãos removidos`);
    
    return c.json({ 
      success: true, 
      tarefasOrfas,
      alertasOrfaos,
      message: `${tarefasOrfas} tarefas e ${alertasOrfaos} alertas órfãos removidos`
    });
  } catch (error) {
    console.error('❌ Erro ao limpar tarefas órfãs:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao limpar tarefas órfãs',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// Deletar TODOS os critérios (reset completo)
app.post('/make-server-225e1157/criterios/delete-all', async (c) => {
  try {
    console.log('🗑️💥 DELETANDO TODOS OS CRITÉRIOS...');
    
    const criterios = await kv.getByPrefix('criterio:');
    let count = 0;
    
    for (const item of criterios) {
      await kv.del(item.key);
      count++;
    }
    
    console.log(`✅ ${count} critérios deletados com sucesso`);
    return c.json({ 
      success: true, 
      count,
      message: `${count} critérios deletados com sucesso`
    });
  } catch (error) {
    console.error('❌ Erro ao deletar todos os critérios:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao deletar todos os critérios',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// Processar alertas automáticos com base nos critérios
app.post('/make-server-225e1157/alertas/process-automatic', async (c) => {
  try {
    console.log('🤖 Processando alertas automáticos baseados nos critérios...');
    
    // Buscar todos os critérios
    const criteriosData = await kv.getByPrefix('criterio:');
    const criterios = criteriosData.map(item => item.value);
    
    // Buscar alertas existentes para evitar duplicatas
    const alertasExistentes = await kv.getByPrefix('alerta:');
    const hoje = new Date().toISOString().split('T')[0];
    
    let novosAlertas = 0;
    const alertasGerados = [];
    
    for (const criterio of criterios) {
      // Verificar se critério tem data de vencimento
      if (!criterio.dataVencimento) continue;
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const dataVencimento = new Date(criterio.dataVencimento);
      dataVencimento.setHours(0, 0, 0, 0);
      
      const diffTime = dataVencimento.getTime() - hoje.getTime();
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let deveGerar = false;
      let tipo = 'status';
      let prioridade = 'baixa';
      let mensagem = '';
      
      // Vencido
      if (diasRestantes < 0) {
        const diasAtrasado = Math.abs(diasRestantes);
        tipo = 'vencimento';
        prioridade = 'alta';
        mensagem = `VENCIDO: Critério "${criterio.nome}" venceu há ${diasAtrasado} dia(s)`;
        deveGerar = true;
      }
      // Vence hoje
      else if (diasRestantes === 0) {
        tipo = 'vencimento';
        prioridade = 'alta';
        mensagem = `URGENTE: Critério "${criterio.nome}" vence HOJE`;
        deveGerar = true;
      }
      // Vence em 7 dias
      else if (diasRestantes === 7) {
        tipo = 'vencimento';
        prioridade = 'média';
        mensagem = `Critério "${criterio.nome}" vence em 7 dias`;
        deveGerar = true;
      }
      // Vence em 3 dias
      else if (diasRestantes === 3) {
        tipo = 'vencimento';
        prioridade = 'alta';
        mensagem = `ATENÇÃO: Critério "${criterio.nome}" vence em 3 dias`;
        deveGerar = true;
      }
      
      // Verificar meta se houver valor e meta definidos
      if (criterio.valor !== undefined && criterio.meta !== undefined && criterio.meta > 0) {
        const percentualAtual = (criterio.valor / criterio.meta) * 100;
        
        if (percentualAtual < 25) {
          tipo = 'meta';
          prioridade = 'alta';
          const diferenca = Math.round(100 - percentualAtual);
          mensagem = `CRÍTICO: Critério "${criterio.nome}" está ${diferenca}% abaixo da meta`;
          deveGerar = true;
        } else if (percentualAtual < 50) {
          tipo = 'meta';
          prioridade = 'média';
          const diferenca = Math.round(100 - percentualAtual);
          mensagem = `AVISO: Critério "${criterio.nome}" está ${diferenca}% abaixo da meta`;
          deveGerar = true;
        }
      }
      
      if (deveGerar) {
        // Verificar se já existe alerta similar hoje
        const alertaSimilarHoje = alertasExistentes.some(item => {
          const alerta = item.value;
          const alertaHoje = alerta.dataEnvio.split('T')[0] === hoje;
          return alertaHoje && 
                 alerta.criterioId === criterio.id && 
                 alerta.tipo === tipo;
        });
        
        if (!alertaSimilarHoje) {
          const novoAlerta = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            criterioId: criterio.id,
            tipo,
            mensagem,
            prioridade,
            dataEnvio: new Date().toISOString(),
            lido: false,
            createdAt: new Date().toISOString()
          };
          
          await kv.set(`alerta:${novoAlerta.id}`, novoAlerta);
          alertasGerados.push(novoAlerta);
          novosAlertas++;
          
          console.log(`✅ Alerta gerado: ${mensagem}`);
        }
      }
    }
    
    console.log(`✅ Processamento concluído: ${novosAlertas} novos alertas gerados`);
    return c.json({ 
      success: true, 
      count: novosAlertas,
      alertas: alertasGerados,
      message: `${novosAlertas} alertas gerados automaticamente`
    });
  } catch (error) {
    console.error('❌ Erro ao processar alertas automáticos:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao processar alertas automáticos',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, 500);
  }
});

// ============================================
// ROTA CATCH-ALL (DEVE SER A ÚLTIMA ROTA)
// ============================================
app.all('*', (c) => {
  console.log(`❌ Rota não encontrada: ${c.req.method} ${c.req.path}`);
  return c.json({ 
    success: false, 
    error: 'Rota não encontrada',
    path: c.req.path,
    method: c.req.method,
    availableRoutes: [
      'POST /make-server-225e1157/login',
      'POST /make-server-225e1157/signup',
      'GET /make-server-225e1157/users',
      'GET /make-server-225e1157/users/emails',
      'GET /make-server-225e1157/users/by-secretaria/:secretaria',
      'POST /make-server-225e1157/users',
      'PUT /make-server-225e1157/users/:id',
      'DELETE /make-server-225e1157/users/:id',
      'GET /make-server-225e1157/criterios',
      'POST /make-server-225e1157/criterios',
      'PUT /make-server-225e1157/criterios/:id',
      'DELETE /make-server-225e1157/criterios/:id',
      'POST /make-server-225e1157/criterios/delete-all',
      'GET /make-server-225e1157/alertas',
      'POST /make-server-225e1157/alertas',
      'PATCH /make-server-225e1157/alertas/:id/toggle-lido',
      'POST /make-server-225e1157/alertas/mark-all-read',
      'DELETE /make-server-225e1157/alertas/:id',
      'POST /make-server-225e1157/alertas/cleanup',
      'POST /make-server-225e1157/alertas/delete-all',
      'POST /make-server-225e1157/alertas/process-automatic',
      'POST /make-server-225e1157/email/send',
      'POST /make-server-225e1157/email/save-api-key',
      'POST /make-server-225e1157/email/notify-users'
    ]
  }, 404);
});

console.log('Servidor TranspJardim inicializado e pronto para receber requisições');

// Iniciar servidor
Deno.serve(app.fetch);