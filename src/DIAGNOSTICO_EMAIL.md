# 🔍 Diagnóstico de E-mail - TranspJardim

## 📍 Como Acessar o Diagnóstico

1. **Faça login** como administrador
2. **Navegue** até **Administração** (menu lateral)
3. **Role até o final** da página do painel administrativo
4. **Localize** a seção **"Seção de Testes de E-mail e Diagnóstico"**
5. **Use o card** "Diagnóstico Completo de E-mail" no lado direito

## 🧪 Como Usar a Ferramenta de Diagnóstico

### Passo 1: Abrir o Console do Navegador
- Pressione **F12** (ou Ctrl+Shift+I)
- Clique na aba **"Console"**
- Deixe aberto durante o diagnóstico

### Passo 2: Executar Diagnóstico
1. **Digite seu e-mail** (opcional) no campo de teste
2. Clique em **"Iniciar Diagnóstico Completo"**
3. **Aguarde** os resultados aparecerem

### Passo 3: Analisar Resultados

O diagnóstico verifica 4 etapas:

#### ✅ Etapa 1: Variável de Ambiente
- **Success (Verde)**: VITE_EMAIL_ENABLED está ativado
- **Warning (Amarelo)**: Sistema em modo SIMULAÇÃO

#### 📍 Etapa 2: URL Edge Function
- **Info (Azul)**: Mostra a URL configurada
- Deve ser: `https://dpnvtorphsxrncqtojvp.supabase.co/functions/v1/enviar-email`

#### 🔌 Etapa 3: Teste de Envio
- **Success (Verde)**: Edge Function respondeu com sucesso! ✅
- **Error (Vermelho)**: Edge Function retornou erro ❌

**Possíveis erros:**

| Erro | Causa Provável | Solução |
|------|---------------|---------|
| `404 Not Found` | Edge Function não foi criada | Criar função no Supabase (Passo 2 do CONFIGURAR_EMAIL.md) |
| `500 Internal Error` | Secrets não configurados ou incorretos | Verificar SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS |
| `Connection failed` | Problema de rede | Verificar internet e firewall |
| `SMTP Authentication Failed` | Senha da Hostinger incorreta | Conferir senha no painel da Hostinger |

#### 📋 Etapa 4: Instruções Finais
- Dicas para verificar logs detalhados

---

## 🛠️ Troubleshooting por Erro

### ❌ Erro: "404 - Function not found"

**Problema:** Edge Function não existe no Supabase

**Solução:**
1. Acesse https://supabase.com/dashboard/project/dpnvtorphsxrncqtojvp
2. Vá em **Edge Functions** → **New Function**
3. Nome: `enviar-email`
4. Cole o código do arquivo `CONFIGURAR_EMAIL.md` (linhas 64-120)
5. Clique em **Deploy**

---

### ❌ Erro: "500 - Internal Server Error"

**Problema:** Secrets não configurados ou incorretos

**Solução:**
1. No Supabase, abra a função `enviar-email`
2. Clique na aba **"Secrets"**
3. Verifique se existem:
   - `SMTP_HOST` = `smtp.hostinger.com`
   - `SMTP_PORT` = `465`
   - `SMTP_USER` = `controleinterno@transpjardim.com`
   - `SMTP_PASS` = **senha do e-mail da Hostinger**

---

### ❌ Erro: "SMTP Authentication Failed"

**Problema:** Senha do e-mail está incorreta

**Solução:**
1. Acesse https://hpanel.hostinger.com
2. Vá em **E-mails**
3. Selecione `controleinterno@transpjardim.com`
4. **Redefinir senha** se necessário
5. Atualize o secret `SMTP_PASS` no Supabase

---

### ⚠️ Warning: "Sistema em modo SIMULAÇÃO"

**Problema:** Arquivo .env não existe ou VITE_EMAIL_ENABLED não está true

**Solução:**
1. Verifique se existe arquivo `.env` na raiz do projeto
2. Conteúdo deve ter: `VITE_EMAIL_ENABLED=true`
3. **Reinicie o servidor**: Ctrl+C e depois `npm run dev`

---

## 📊 Interpretando os Detalhes Técnicos

Clique em **"Ver detalhes técnicos"** para ver o JSON completo da resposta:

### ✅ Resposta de Sucesso:
```json
{
  "success": true,
  "message": "E-mail enviado com sucesso"
}
```

### ❌ Resposta de Erro (Exemplo):
```json
{
  "status": 500,
  "response": {
    "error": "SMTP Authentication Failed"
  }
}
```

---

## 🎯 Checklist Final

Marque cada item conforme completa:

- [ ] Abri o Console do Navegador (F12)
- [ ] Executei o diagnóstico completo
- [ ] Etapa 1 está verde (ou sei que está em simulação)
- [ ] Etapa 2 mostra a URL correta
- [ ] Etapa 3 está verde (e-mail enviado com sucesso)
- [ ] Verifiquei a caixa de entrada do e-mail de teste
- [ ] Verifiquei a pasta de SPAM

---

## 🆘 Precisa de Ajuda?

Se após seguir todos os passos o e-mail ainda não chega:

1. **Copie todo o JSON** dos detalhes técnicos da Etapa 3
2. **Copie as mensagens** do Console do navegador (F12)
3. **Tire um screenshot** da página de diagnóstico
4. **Envie essas informações** para análise

---

## 💡 Dica Profissional

**Teste em etapas:**

1. **Primeiro**: Confirme que a Edge Function existe (deve dar erro 500, não 404)
2. **Segundo**: Configure os Secrets (deve tentar enviar o e-mail)
3. **Terceiro**: Ajuste a senha se der erro de autenticação SMTP
4. **Quarto**: Verifique firewall e spam se o erro sumir mas e-mail não chegar

---

**Desenvolvido para a Controladoria Municipal de Jardim/CE** 🏛️
