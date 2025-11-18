// Função corrigida para testar e-mail com detecção proativa de modo teste
// Esta correção deve ser integrada em index.tsx na rota /email/test

async function emailTestFixed(c, getResendApiKey, getEmailSender, getTestModeInfo) {
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
    
    // ✅ CORREÇÃO: Verificar modo de teste ANTES de enviar
    const testModeInfo = await getTestModeInfo();
    console.log(`📧 [TEST] Modo de teste: ${testModeInfo.testMode ? 'ATIVO' : 'DESATIVADO'}`, 
                testModeInfo.authorizedEmail ? `- Email autorizado: ${testModeInfo.authorizedEmail}` : '');
    
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
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Erro no teste de e-mail:', result);
      // ... continua tratamento de erros ...
      return c.json({ success: false, error: 'Erro ao enviar teste' }, 500);
    }
    
    console.log(`Teste de e-mail enviado com sucesso. ID: ${result.id}`);
    
    return c.json({ 
      success: true, 
      emailId: result.id,
      message: 'E-mail de teste enviado com sucesso!',
      testMode: isTestModeRedirect,
      authorizedEmail: isTestModeRedirect ? emailDestino : undefined,
      originalEmail: isTestModeRedirect ? testEmail : undefined
    });
    
  } catch (error) {
    console.error('Erro ao enviar e-mail de teste:', error);
    return c.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, 500);
  }
}
