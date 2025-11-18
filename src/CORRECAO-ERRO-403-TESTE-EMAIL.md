# 🔧 Correção do Erro 403 no Teste de E-mail

## 📋 Problema

Quando você tenta enviar um e-mail de teste, recebe o erro 403:

```json
{
  "statusCode": 403,
  "name": "validation_error",
  "message": "You can only send testing emails to your own email address (controleinterno.jardimce@gmail.com). To send emails to other recipients, please verify a domain at resend.com/domains, and change the `from` address to an email using this domain."
}
```

## 🎯 Causa

A rota de teste de e-mail (`/email/test`) está tentando enviar diretamente para o e-mail fornecido pelo usuário, SEM verificar primeiro se o sistema está em modo de teste. Ela precisa usar a mesma lógica de detecção proativa que já implementamos na rota de alertas.

## ✅ Solução

Já apliquei **PARCIALMENTE** a correção. As seguintes alterações foram feitas:

### 1. Adicionada Detecção de Modo Teste (✅ APLICADO)

Após a linha 1065 em `/supabase/functions/server/index.tsx`, adicionei:

```typescript
// NOVO: Verificar modo de teste ANTES de enviar
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
          <p style="margin: 5px 0; color: #1976d2;">📧 <strong>Destinatário solicitado:</strong> ${testEmail}</p>
          <p style="margin: 5px 0; color: #1976d2;">📮 <strong>Enviado para:</strong> ${emailDestino}</p>
          <p style="margin: 5px 0; font-size: 12px; color: #1565c0;"><em>Em modo teste, e-mails só podem ser enviados para o email cadastrado no Resend.</em></p>
        </div>` : '';

const emailSubject = isTestModeRedirect 
  ? `TranspJardim - Teste de Configuração [Para: ${testEmail}]`
  : `TranspJardim - Teste de Configuração`;

const emailText = isTestModeRedirect
  ? `TranspJardim - Teste de E-mail\n\n[MODO TESTE - Destinatário original: ${testEmail}]\n\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\nData/Hora: ${new Date().toLocaleString('pt-BR')}`
  : `TranspJardim - Teste de E-mail\n\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\nData/Hora: ${new Date().toLocaleString('pt-BR')}`;
```

### 2. Atualizado o Destinatário do E-mail (✅ APLICADO)

Na linha 1102, mudei:
```typescript
// ANTES:
to: [testEmail],
subject: `TranspJardim - Teste de Configuração de E-mail`,

// DEPOIS:
to: [emailDestino],
subject: emailSubject,
```

### 3. PENDENTE: Atualizar Template HTML

A linha 1110-1117 ainda precisa ser atualizada manualmente. Atualmente está assim:

```typescript
<div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
  <h2>✅ Teste de E-mail Realizado com Sucesso!</h2>
  <p>Se você recebeu este e-mail, significa que o sistema de alertas por e-mail do TranspJardim está funcionando corretamente.</p>
  <p><strong>Data/Hora do Teste:</strong> ${new Date().toLocaleString('pt-BR')}</p>
  <p>O sistema agora pode enviar alertas automáticos para os critérios de transparência.</p>
</div>
```

**Deve ser alterado para:**

```typescript
<div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
  ${testModeNotice}
  <h2>✅ Teste de E-mail Realizado com Sucesso!</h2>
  <p>Se você recebeu este e-mail, significa que o sistema de alertas por e-mail do TranspJardim está funcionando corretamente.</p>
  <p><strong>Data/Hora do Teste:</strong> ${new Date().toLocaleString('pt-BR')}</p>
  <p>O sistema agora pode enviar alertas automáticos para os critérios de transparência.</p>
</div>
```

### 4. PENDENTE: Atualizar Texto do E-mail

A linha 1117 ainda precisa ser atualizada. Atualmente:

```typescript
text: `TranspJardim - Teste de E-mail\\n\\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\\nData/Hora: ${new Date().toLocaleString('pt-BR')}`
```

**Deve ser alterado para:**

```typescript
text: emailText
```

---

## 🔨 Como Aplicar Manualmente

Abra `/supabase/functions/server/index.tsx` e:

### Passo 1: Encontre a linha 1110
Procure por:
```typescript
<div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
  <h2>✅ Teste de E-mail Realizado com Sucesso!</h2>
```

### Passo 2: Adicione `${testModeNotice}` logo antes do `<h2>`
```typescript
<div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
  ${testModeNotice}
  <h2>✅ Teste de E-mail Realizado com Sucesso!</h2>
```

### Passo 3: Encontre a linha 1117  
Procure por:
```typescript
text: `TranspJardim - Teste de E-mail\\n\\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\\nData/Hora: ${new Date().toLocaleString('pt-BR')}`
```

### Passo 4: Substitua por `emailText`
```typescript
text: emailText
```

---

## 🧪 Como Testar

1. Salve as alterações
2. Reinicie o servidor Supabase (se necessário)
3. No painel do TranspJardim, vá em "Configurar E-mail"
4. Clique em "Testar E-mail"
5. Digite QUALQUER e-mail (pode ser teste@exemplo.com)
6. O sistema deve:
   - ✅ Detectar que está em modo teste
   - ✅ Redirecionar para controleinterno.jardimce@gmail.com
   - ✅ Enviar com sucesso SEM erro 403
   - ✅ Mostrar notificação no e-mail sobre o redirecionamento

---

## 📊 Resultado Esperado

### Antes da Correção:
```
❌ Erro 403: "You can only send testing emails to your own email address"
```

### Depois da Correção:
```
✅ E-mail enviado com sucesso!
📧 Modo de teste: E-mail redirecionado para controleinterno.jardimce@gmail.com
```

No e-mail recebido, você verá um banner azul informando:
```
🧪 MODO TESTE:
📧 Destinatário solicitado: teste@exemplo.com
📮 Enviado para: controleinterno.jardimce@gmail.com
Em modo teste, e-mails só podem ser enviados para o email cadastrado no Resend.
```

---

## 💡 Por Que Isso Funciona

A correção implementa **detecção proativa de modo teste**:

1. **ANTES de enviar**: Verifica se está em modo teste
2. **Se sim**: Redireciona automaticamente para o e-mail autorizado
3. **Se não**: Envia para o destinatário solicitado
4. **Resultado**: Nunca tenta enviar para e-mail não autorizado = nunca recebe erro 403

Esta é a MESMA lógica já funcionando na rota de alertas (`/email/send-alert`), agora aplicada também na rota de teste.

---

## 🎯 Status da Correção

- [x] ✅ Código de detecção de modo teste adicionado
- [x] ✅ Variáveis `emailDestino`, `emailSubject`, `emailText` criadas
- [x] ✅ Linha `to: [emailDestino]` atualizada
- [x] ✅ Linha `subject: emailSubject` atualizada
- [ ] ⏳ Template HTML precisa incluir `${testModeNotice}`
- [ ] ⏳ Linha `text` precisa usar `emailText`

**AÇÃO NECESSÁRIA:** Aplicar os Passos 1-4 acima manualmente no arquivo.

---

## 📝 Arquivo Referência

Criei um arquivo de referência em `/supabase/functions/server/email-test-fixed.tsx` com a função completa corrigida. Você pode consultar este arquivo para ver como deve ficar o código final.

---

**Status:** ⏳ PARCIALMENTE APLICADO - Requer ajuste manual final  
**Data:** 17/11/2024  
**Urgência:** Alta - Impede teste de e-mail  
**Complexidade:** Baixa - Apenas adicionar 2 linhas
