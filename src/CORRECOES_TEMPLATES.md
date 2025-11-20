# Correções dos 8 Erros de Template Literals Aninhados

Execute as correções abaixo **uma por uma** no arquivo `/supabase/functions/server/index.tsx`:

---

## ✅ CORREÇÃO 1 e 2 - Linhas 637-638

**Localizar:**
```typescript
    const emailText = isTestModeRedirect
      ? `[MODO TESTE - Destinatário original: ${to}]\\n\\nTranspJardim - ${subject}\\n\\nCritério: ${criterio?.nome}\\nSecretaria: ${criterio?.secretaria}\\nResponsável: ${usuario?.name}\\nPrazo: ${prazoFormatado}\\n\\nAcesse: https://transparenciajardim.app`
      : `TranspJardim - ${subject}\\n\\nCritério: ${criterio?.nome}\\nSecretaria: ${criterio?.secretaria}\\nResponsável: ${usuario?.name}\\nPrazo: ${prazoFormatado}\\n\\nAcesse: https://transparenciajardim.app`;
```

**Substituir por:**
```typescript
    const emailText = isTestModeRedirect
      ? [
          `[MODO TESTE - Destinatário original: ${to}]`,
          ``,
          `TranspJardim - ${subject}`,
          ``,
          `Critério: ${criterio?.nome}`,
          `Secretaria: ${criterio?.secretaria}`,
          `Responsável: ${usuario?.name}`,
          `Prazo: ${prazoFormatado}`,
          ``,
          `Acesse: https://transparenciajardim.app`
        ].join('\n')
      : [
          `TranspJardim - ${subject}`,
          ``,
          `Critério: ${criterio?.nome}`,
          `Secretaria: ${criterio?.secretaria}`,
          `Responsável: ${usuario?.name}`,
          `Prazo: ${prazoFormatado}`,
          ``,
          `Acesse: https://transparenciajardim.app`
        ].join('\n');
```

---

## ✅ CORREÇÃO 3 - Linha 625 (dentro do replace)

**Localizar (aproximadamente linha 621-629):**
```typescript
    const emailHtml = isTestModeRedirect 
      ? htmlTemplate.replace(
          '<h2>⚠️',
          `<div style="background: #e3f2fd; border: 2px solid #2196f3; padding: 10px; border-radius: 6px; margin-bottom: 15px;">
            <p style="margin: 0; color: #1976d2;"><strong>🧪 MODO TESTE:</strong> Este e-mail deveria ser enviado para <strong>${to}</strong></p>
          </div>
          <h2>⚠️`
        )
      : htmlTemplate;
```

**Substituir por:**
```typescript
    // Extrair interpolação complexa
    const testModeNoticeHtml = `<div style="background: #e3f2fd; border: 2px solid #2196f3; padding: 10px; border-radius: 6px; margin-bottom: 15px;">
            <p style="margin: 0; color: #1976d2;"><strong>🧪 MODO TESTE:</strong> Este e-mail deveria ser enviado para <strong>${to}</strong></p>
          </div>
          <h2>⚠️`;
    
    const emailHtml = isTestModeRedirect 
      ? htmlTemplate.replace('<h2>⚠️', testModeNoticeHtml)
      : htmlTemplate;
```

---

## ✅ CORREÇÃO 4 - Linha 632

**Localizar:**
```typescript
    const emailSubject = isTestModeRedirect 
      ? 'TranspJardim: ' + subject + ' [Destinatário: ' + to + ']'
      : 'TranspJardim: ' + subject;
```

**Substituir por:**
```typescript
    const emailSubject = isTestModeRedirect 
      ? `TranspJardim: ${subject} [Destinatário: ${to}]`
      : `TranspJardim: ${subject}`;
```

---

## ✅ CORREÇÃO 5 - Linha 721

**Localizar:**
```typescript
                text: `TranspJardim - ${subject}\\\\n\\\\nCritério: ${criterio?.nome}\\\\nSecretaria: ${criterio?.secretaria}\\\\nResponsável: ${usuario?.name}\\\\nPrazo: ${prazoFormatadoRetry}\\\\n\\\\nAcesse: https://transparenciajardim.app\\\\n\\\\n[EMAIL REDIRECIONADO PARA MODO DE TESTE]`
```

**Substituir por:**
```typescript
                text: [
                  `TranspJardim - ${subject}`,
                  ``,
                  `Critério: ${criterio?.nome}`,
                  `Secretaria: ${criterio?.secretaria}`,
                  `Responsável: ${usuario?.name}`,
                  `Prazo: ${prazoFormatadoRetry}`,
                  ``,
                  `Acesse: https://transparenciajardim.app`,
                  ``,
                  `[EMAIL REDIRECIONADO PARA MODO DE TESTE]`
                ].join('\n')
```

---

## ✅ CORREÇÃO 6 e 7 - Linhas 1120-1121

**Localizar:**
```typescript
    const emailText = isTestModeRedirect
      ? `TranspJardim - Teste de E-mail\\n\\n[MODO TESTE - Destinatário original: ${testEmail}]\\n\\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\\nData/Hora: ${new Date().toLocaleString('pt-BR')}`
      : `TranspJardim - Teste de E-mail\\n\\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\\nData/Hora: ${new Date().toLocaleString('pt-BR')}`;
```

**Substituir por:**
```typescript
    const dataHoraTeste = new Date().toLocaleString('pt-BR');
    const emailText = isTestModeRedirect
      ? [
          `TranspJardim - Teste de E-mail`,
          ``,
          `[MODO TESTE - Destinatário original: ${testEmail}]`,
          ``,
          `Se você recebeu este e-mail, o sistema está funcionando corretamente.`,
          `Data/Hora: ${dataHoraTeste}`
        ].join('\n')
      : [
          `TranspJardim - Teste de E-mail`,
          ``,
          `Se você recebeu este e-mail, o sistema está funcionando corretamente.`,
          `Data/Hora: ${dataHoraTeste}`
        ].join('\n');
```

---

## ✅ CORREÇÃO 8 - Linha 1236

**Localizar:**
```typescript
                text: `TranspJardim - Teste de E-mail\\\\n\\\\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\\\\nData/Hora: ${new Date().toLocaleString('pt-BR')}\\\\n\\\\nEmail redirecionado de ${testEmail} para ${authorizedEmail} devido ao modo de teste do Resend.`
```

**Substituir por:**
```typescript
                text: [
                  `TranspJardim - Teste de E-mail`,
                  ``,
                  `Se você recebeu este e-mail, o sistema está funcionando corretamente.`,
                  `Data/Hora: ${new Date().toLocaleString('pt-BR')}`,
                  ``,
                  `Email redirecionado de ${testEmail} para ${authorizedEmail} devido ao modo de teste do Resend.`
                ].join('\n')
```

---

## 🔍 ERROS ADICIONAIS ENCONTRADOS

Encontrei também outros 2 problemas similares que devem ser corrigidos:

### EXTRA 1 - Linha 1441

**Localizar:**
```typescript
              text: `[MODO TESTE - Destinatário original: ${to}]\\n\\n${emailText}`
```

**Substituir por:**
```typescript
              text: [
                `[MODO TESTE - Destinatário original: ${to}]`,
                ``,
                emailText
              ].join('\n')
```

### EXTRA 2 - Linha 2068-2069

**Localizar:**
```typescript
        const emailText = isTestModeRedirect
          ? `[MODO TESTE - Destinatário original: ${email}]\\n\\nTranspJardim - ${subject}\\n\\nCritério: ${criterio?.nome}\\nSecretaria: ${criterio?.secretaria}\\nTipo: ${alertType === 'urgent' ? 'URGENTE' : 'AVISO'}\\n\\nAcesse: https://transparenciajardim.app`
          : `TranspJardim - ${subject}\\n\\nCritério: ${criterio?.nome}\\nSecretaria: ${criterio?.secretaria}\\nTipo: ${alertType === 'urgent' ? 'URGENTE' : 'AVISO'}\\n\\nAcesse: https://transparenciajardim.app`;
```

**Substituir por:**
```typescript
        const tipoAlerta = alertType === 'urgent' ? 'URGENTE' : 'AVISO';
        const emailText = isTestModeRedirect
          ? [
              `[MODO TESTE - Destinatário original: ${email}]`,
              ``,
              `TranspJardim - ${subject}`,
              ``,
              `Critério: ${criterio?.nome}`,
              `Secretaria: ${criterio?.secretaria}`,
              `Tipo: ${tipoAlerta}`,
              ``,
              `Acesse: https://transparenciajardim.app`
            ].join('\n')
          : [
              `TranspJardim - ${subject}`,
              ``,
              `Critério: ${criterio?.nome}`,
              `Secretaria: ${criterio?.secretaria}`,
              `Tipo: ${tipoAlerta}`,
              ``,
              `Acesse: https://transparenciajardim.app`
            ].join('\n');
```

---

## 📝 Instruções

1. Abra o arquivo `/supabase/functions/server/index.tsx`
2. Use a busca do editor (Ctrl+F / Cmd+F) para localizar cada bloco
3. Faça as substituições **uma por uma**
4. Salve o arquivo
5. Faça o deploy da Edge Function novamente

Após essas correções, o erro 403 de deploy causado por templates literals aninhados deve ser resolvido! 🚀
