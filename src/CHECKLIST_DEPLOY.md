# ✅ Checklist de Deploy - TranspJardim

## 📋 Pré-Deploy

### Verificação do Ambiente Local

- [ ] Node.js versão 18.x ou 20.x instalado
- [ ] npm atualizado
- [ ] Git configurado
- [ ] Acesso ao repositório GitHub
- [ ] Acesso ao dashboard do Vercel

### Verificação dos Arquivos

- [ ] `package.json` com scripts atualizados
  - [ ] Script `build` usa `node ./node_modules/vite/bin/vite.js build`
  - [ ] Script `postinstall` configurado
- [ ] `vercel.json` configurado corretamente
  - [ ] `buildCommand: "npm run build"`
  - [ ] `outputDirectory: "dist"`
  - [ ] `installCommand: "npm ci"`
- [ ] `.gitignore` atualizado
- [ ] Documentação criada:
  - [ ] COMECE_AQUI.md
  - [ ] LEIA_PRIMEIRO.md
  - [ ] DEPLOY_IMEDIATO.md
  - [ ] SOLUCAO_ERROS_DEPLOY.md
  - [ ] RESUMO_CORRECOES.txt
  - [ ] verify-build.sh
  - [ ] comandos-uteis.sh

---

## 🔍 Diagnóstico Local (Opcional mas Recomendado)

### Executar Script de Verificação

```bash
chmod +x verify-build.sh
./verify-build.sh
```

Verificações esperadas:

- [ ] ✓ Node.js versão OK
- [ ] ✓ npm instalado
- [ ] ✓ package.json correto
- [ ] ✓ vercel.json correto
- [ ] ✓ Dependências instalam sem erros
- [ ] ✓ Vite instalado
- [ ] ✓ Estrutura de arquivos OK
- [ ] ✓ Build local funciona
- [ ] ✓ dist/ criado corretamente
- [ ] ✓ Edge Function validada

**Resultado esperado:** "✓ TUDO OK!"

---

## 📦 Preparação do Deploy

### Commit das Alterações

- [ ] Arquivos adicionados ao staging
  ```bash
  git add package.json vercel.json .gitignore
  git add COMECE_AQUI.md LEIA_PRIMEIRO.md DEPLOY_IMEDIATO.md
  git add SOLUCAO_ERROS_DEPLOY.md RESUMO_CORRECOES.txt
  git add verify-build.sh comandos-uteis.sh CHECKLIST_DEPLOY.md
  ```

- [ ] Commit criado
  ```bash
  git commit -m "fix: Corrige erro 126 de permissões no build do Vercel

  - Atualiza scripts no package.json para usar node diretamente
  - Adiciona postinstall para garantir permissões
  - Corrige vercel.json com buildCommand correto
  - Adiciona documentação completa de deploy
  - Adiciona ferramentas de diagnóstico"
  ```

- [ ] Push realizado
  ```bash
  git push origin main
  ```

---

## 🚀 Deploy no Vercel

### Deploy Automático

- [ ] Push detectado pelo Vercel
- [ ] Build iniciado automaticamente
- [ ] Logs acessíveis no dashboard

### OU Deploy Manual

- [ ] Acesso ao dashboard do Vercel
- [ ] Projeto TranspJardim selecionado
- [ ] "Redeploy" clicado
- [ ] "Clear cache and redeploy" marcado (se necessário)
- [ ] Deploy iniciado

---

## 📊 Monitoramento do Build

### Logs do Vercel

Verificar nos logs:

- [ ] ✅ `Running "npm ci"`
- [ ] ✅ `installed dependencies`
- [ ] ✅ `Running "npm run build"`
- [ ] ✅ `Executing: node ./node_modules/vite/bin/vite.js build`
- [ ] ✅ `vite v5.1.0 building for production...`
- [ ] ✅ `✓ built in XXXms`
- [ ] ✅ `Build Completed`
- [ ] ✅ `Deployed to Production`

### Erros a Observar

Se aparecer algum destes erros:

- [ ] ❌ Error 126: Permission denied
  - **Solução:** Verifique package.json e vercel.json
  - **Documentação:** SOLUCAO_ERROS_DEPLOY.md → Seção "Erro 126"

- [ ] ❌ Build failed
  - **Solução:** Execute verify-build.sh localmente
  - **Documentação:** SOLUCAO_ERROS_DEPLOY.md → Seção "Troubleshooting"

- [ ] ❌ Module not found
  - **Solução:** Verifique package.json dependencies
  - **Tente:** "Clear cache and redeploy"

---

## ✨ Validação Pós-Deploy

### Acesso à Aplicação

- [ ] URL do Vercel acessível (ex: https://transpjardim.vercel.app)
- [ ] Página inicial carrega
- [ ] Sem erros no console do navegador (F12)
- [ ] CSS carregando corretamente
- [ ] Imagens/logos visíveis

### Funcionalidade - Login

- [ ] Página de login acessível
- [ ] Formulário de login visível
- [ ] Campos funcionando (email, senha)
- [ ] Botão de login clicável
- [ ] Login com credenciais válidas funciona
- [ ] Redirecionamento após login OK

### Funcionalidade - Dashboard

- [ ] Dashboard carrega após login
- [ ] Header institucional visível
- [ ] Menu de navegação funcionando
- [ ] Cards de métricas exibidos
- [ ] Dados carregando do Supabase

### Funcionalidade - Critérios

- [ ] Lista de critérios carrega
- [ ] Filtros funcionando
- [ ] Botões de ação visíveis
- [ ] Modal de criação abre (se admin)
- [ ] Dados persistem após refresh

### Funcionalidade - Tarefas

- [ ] Lista de tarefas carrega
- [ ] Tarefas filtradas por usuário
- [ ] Checkbox de conclusão funciona
- [ ] Status atualiza em tempo real
- [ ] Histórico acessível

### Funcionalidade - Admin (se aplicável)

- [ ] Painel admin acessível
- [ ] Gerenciamento de usuários funciona
- [ ] Configurações carregam
- [ ] Alterações são salvas

---

## 📱 Teste de Responsividade

### Desktop (1920x1080)

- [ ] Layout adequado
- [ ] Sem overflow horizontal
- [ ] Sidebar visível
- [ ] Tabelas legíveis
- [ ] Gráficos renderizados

### Tablet (768x1024)

- [ ] Layout adaptado
- [ ] Menu colapsável funciona
- [ ] Tabelas com scroll horizontal
- [ ] Cards redimensionados
- [ ] Touch funcionando

### Mobile (375x667)

- [ ] Layout mobile aplicado
- [ ] Menu hamburguer visível
- [ ] Navegação por toque OK
- [ ] Formulários utilizáveis
- [ ] Botões clicáveis (tamanho adequado)

---

## 🔒 Segurança e Performance

### Segurança

- [ ] HTTPS ativado (certificado Vercel)
- [ ] Variáveis de ambiente configuradas
- [ ] API keys não expostas no código
- [ ] Autenticação funcionando
- [ ] RLS ativo no Supabase

### Performance

- [ ] Tempo de carregamento < 3s
- [ ] First Contentful Paint < 1.5s
- [ ] Lighthouse Score > 80
- [ ] Imagens otimizadas
- [ ] Bundle size razoável

---

## 📧 Sistema de Emails (Opcional)

### Modo de Teste (Desenvolvimento)

- [ ] Modo de teste ativado no painel
- [ ] Emails simulados (não enviados)
- [ ] Logs indicando simulação
- [ ] Sem erros 403

### OU Modo de Produção

- [ ] Domínio transpjardim.tech adicionado no Resend
- [ ] Registros DNS configurados:
  - [ ] SPF (TXT @)
  - [ ] DKIM (TXT resend._domainkey)
  - [ ] DMARC (TXT _dmarc)
- [ ] Aguardando propagação DNS (até 48h)
- [ ] Domínio verificado no Resend
- [ ] API key de produção gerada
- [ ] API key atualizada no sistema
- [ ] Teste de envio de email OK

---

## 📝 Documentação Pós-Deploy

### Para a Equipe

- [ ] URL de produção documentada
- [ ] Credenciais de admin atualizadas
- [ ] Processo de deploy documentado
- [ ] Guia de uso criado
- [ ] Troubleshooting compartilhado

### Para Monitoramento

- [ ] Alertas de erro configurados (Vercel)
- [ ] Logs do Supabase acessíveis
- [ ] Dashboard de métricas configurado
- [ ] Processo de backup documentado

---

## 🔄 Próximas Melhorias

### Curto Prazo

- [ ] Configurar domínio customizado (transpjardim.tech)
- [ ] Configurar emails de produção
- [ ] Testar todos os fluxos de usuário
- [ ] Coletar feedback inicial

### Médio Prazo

- [ ] Configurar backups automáticos
- [ ] Implementar monitoramento avançado
- [ ] Adicionar testes automatizados
- [ ] Otimizar performance

### Longo Prazo

- [ ] Adicionar analytics
- [ ] Implementar notificações push
- [ ] Criar aplicativo mobile
- [ ] Expandir funcionalidades

---

## 🆘 Troubleshooting Rápido

### Se o erro 126 persistir:

1. [ ] Verifique package.json
2. [ ] Verifique vercel.json
3. [ ] Execute verify-build.sh localmente
4. [ ] Tente "Clear cache and redeploy"
5. [ ] Consulte SOLUCAO_ERROS_DEPLOY.md

### Se o build falhar:

1. [ ] Leia os logs completos do Vercel
2. [ ] Copie mensagem de erro específica
3. [ ] Execute build local: `npm run build`
4. [ ] Compare versões Node local vs Vercel
5. [ ] Consulte SOLUCAO_ERROS_DEPLOY.md

### Se a aplicação não carregar:

1. [ ] Verifique se deploy foi concluído
2. [ ] Abra console do navegador (F12)
3. [ ] Verifique erros de rede
4. [ ] Teste em navegador anônimo
5. [ ] Limpe cache do navegador

### Se login não funcionar:

1. [ ] Verifique conexão com Supabase
2. [ ] Verifique variáveis de ambiente
3. [ ] Teste credenciais no Supabase diretamente
4. [ ] Verifique logs do backend
5. [ ] Verifique RLS policies

---

## ✅ Confirmação Final

### Deploy Concluído com Sucesso

- [ ] Build sem erros
- [ ] Deploy finalizado
- [ ] Aplicação acessível
- [ ] Funcionalidades principais testadas
- [ ] Responsividade verificada
- [ ] Performance aceitável
- [ ] Documentação completa
- [ ] Equipe informada

**Assinatura:** ___________________________

**Data:** ____/____/2025

**Hora:** ____:____

---

## 📞 Contatos e Recursos

### Documentação
- COMECE_AQUI.md - Visão geral
- LEIA_PRIMEIRO.md - Ação rápida
- DEPLOY_IMEDIATO.md - Guia detalhado
- SOLUCAO_ERROS_DEPLOY.md - Troubleshooting

### Ferramentas
- verify-build.sh - Diagnóstico automático
- comandos-uteis.sh - Menu interativo

### Links Importantes
- Vercel: https://vercel.com/dashboard
- Supabase: https://supabase.com/dashboard
- Resend: https://resend.com/domains
- GitHub: https://github.com/[seu-repo]

---

**🎉 Parabéns pelo deploy do TranspJardim!**

*Este checklist pode ser impresso ou salvo como referência para futuros deploys.*

*Última atualização: 20/11/2025*
