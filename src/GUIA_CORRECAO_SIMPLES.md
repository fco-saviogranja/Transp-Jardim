# 🔧 Guia Simplificado de Correção - Template Literals Aninhados

## ⚡ Instruções

Abra o arquivo `/supabase/functions/server/index.tsx` no seu editor e faça as substituições abaixo **usando Find & Replace (Ctrl+H)**:

---

## ✅ CORREÇÃO 1 e 2 - Linhas 637-638

**Buscar (Find):**
```
\n\nTranspJardim -
```

**Context:** Nas linhas próximas a 637-638 você verá dois templates muito longos com múltiplos `\n\n`

**Substituir manualmente essas 3 linhas:**
```typescript
    const emailText = isTestModeRedirect
      ? `[MODO TESTE - Destinatário original: ${to}]\n\nTranspJardim - ${subject}\n\nCritério: ${criterio?.nome}\nSecretaria: ${criterio?.secretaria}\nResponsável: ${usuario?.name}\nPrazo: ${prazoFormatado}\n\nAcesse: https://transparenciajardim.app`
      : `TranspJardim - ${subject}\n\nCritério: ${criterio?.nome}\nSecretaria: ${criterio?.secretaria}\nResponsável: ${usuario?.name}\nPrazo: ${prazoFormatado}\n\nAcesse: https://transparenciajardim.app`;
```

**Por:**
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

## ✅ CORREÇÃO 3 - Linha ~625 (dentro do replace)

**Buscar (Find):**
```
htmlTemplate.replace(
```

**Procure** a seção que tem `htmlTemplate.replace` próxima da linha 621-629

**Substituir essas ~9 linhas:**
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

**Por:**
```typescript
    const testModeNoticeHtml = `<div style="background: #e3f2fd; border: 2px solid #2196f3; padding: 10px; border-radius: 6px; margin-bottom: 15px;">
            <p style="margin: 0; color: #1976d2;"><strong>🧪 MODO TESTE:</strong> Este e-mail deveria ser enviado para <strong>${to}</strong></p>
          </div>
          <h2>⚠️`;
    
    const emailHtml = isTestModeRedirect 
      ? htmlTemplate.replace('<h2>⚠️', testModeNoticeHtml)
      : htmlTemplate;
```

---

## ✅ CORREÇÃO 4 - Linha ~632

**Buscar (Find):**
```
'TranspJardim: ' + subject + ' [Destinatário: ' + to + ']'
```

**Substituir por:**
```
`TranspJardim: ${subject} [Destinatário: ${to}]`
```

**E também buscar:**
```
: 'TranspJardim: ' + subject;
```

**Substituir por:**
```
: `TranspJardim: ${subject}`;
```

---

## ✅ CORREÇÃO 5 - Linha ~721

**Buscar (Find):** (procure por `prazoFormatadoRetry` - deve aparecer apenas uma vez)
```
text: `TranspJardim - ${subject}\\n\\nCritério:
```

**Substituir a linha completa ~721:**
```typescript
                text: `TranspJardim - ${subject}\\n\\nCritério: ${criterio?.nome}\\nSecretaria: ${criterio?.secretaria}\\nResponsável: ${usuario?.name}\\nPrazo: ${prazoFormatadoRetry}\\n\\nAcesse: https://transparenciajardim.app\\n\\n[EMAIL REDIRECIONADO PARA MODO DE TESTE]`
```

**Por:**
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

## ✅ CORREÇÃO 6 e 7 - Linhas ~1120-1121

**Buscar (Find):**
```
TranspJardim - Teste de E-mail
```

**Procure** próximo da linha 1120 onde tem duas linhas similares com `Teste de E-mail` e `toLocaleString`

**Substitua essas 3 linhas:**
```typescript
    const emailText = isTestModeRedirect
      ? `TranspJardim - Teste de E-mail\n\n[MODO TESTE - Destinatário original: ${testEmail}]\n\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\nData/Hora: ${new Date().toLocaleString('pt-BR')}`
      : `TranspJardim - Teste de E-mail\n\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\nData/Hora: ${new Date().toLocaleString('pt-BR')}`;
```

**Por:**
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

## ✅ CORREÇÃO 8 - Linha ~1236

**Buscar (Find):** (procure por `Email redirecionado de`)
```
Email redirecionado de
```

**Substitua a linha completa ~1236:**
```typescript
                text: `TranspJardim - Teste de E-mail\\n\\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\\nData/Hora: ${new Date().toLocaleString('pt-BR')}\\n\\nEmail redirecionado de ${testEmail} para ${authorizedEmail} devido ao modo de teste do Resend.`
```

**Por:**
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

## 🎯 DICA RÁPIDA

Use o **Find & Replace (Ctrl+H)** do VS Code ou editor similar:

1. Cole o texto "Buscar" no campo Find
2. Cole o texto "Substituir por" no campo Replace  
3. Clique em Replace (substitui uma ocorrência) ou Replace All (substitui todas)
4. Verifique se a substituição ficou correta antes de salvar

---

## ✅ Após Aplicar Todas as Correções

1. Salve o arquivo
2. Faça commit das alterações
3. Tente fazer deploy novamente da Edge Function

O erro 403 deve ser resolvido! 🚀
