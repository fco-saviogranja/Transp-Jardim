#!/bin/bash

# Comandos Úteis - TranspJardim
# Atalhos para operações comuns de desenvolvimento e troubleshooting

echo "============================================"
echo "  Comandos Úteis - TranspJardim"
echo "============================================"
echo ""

# Função para exibir menu
show_menu() {
    echo "Escolha uma opção:"
    echo ""
    echo "  BUILD E DEPLOY:"
    echo "  1)  Verificar build (diagnóstico completo)"
    echo "  2)  Build limpo (remove node_modules e reconstrói)"
    echo "  3)  Build rápido (apenas vite build)"
    echo "  4)  Deploy rápido (add, commit, push)"
    echo ""
    echo "  TROUBLESHOOTING:"
    echo "  5)  Limpar cache e dependências"
    echo "  6)  Verificar versões (Node, npm, etc)"
    echo "  7)  Testar scripts do package.json"
    echo "  8)  Verificar permissões do Vite"
    echo ""
    echo "  GIT:"
    echo "  9)  Status do Git"
    echo "  10) Ver último commit"
    echo "  11) Ver diferenças (git diff)"
    echo ""
    echo "  LOGS:"
    echo "  12) Ver log do último build"
    echo "  13) Verificar estrutura do dist/"
    echo ""
    echo "  0)  Sair"
    echo ""
    echo -n "Opção: "
}

# Função 1: Verificar build
verificar_build() {
    echo ""
    echo "======================================"
    echo "  Executando Verificação Completa"
    echo "======================================"
    echo ""
    
    if [ -f "./verify-build.sh" ]; then
        chmod +x verify-build.sh
        ./verify-build.sh
    else
        echo "❌ Arquivo verify-build.sh não encontrado!"
        echo "Execute este script do diretório raiz do projeto."
    fi
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}

# Função 2: Build limpo
build_limpo() {
    echo ""
    echo "======================================"
    echo "  Build Limpo"
    echo "======================================"
    echo ""
    
    echo "1. Removendo node_modules, dist e cache..."
    rm -rf node_modules dist .vite package-lock.json
    echo "✓ Removidos"
    echo ""
    
    echo "2. Instalando dependências limpas (npm ci)..."
    npm ci
    if [ $? -eq 0 ]; then
        echo "✓ Dependências instaladas"
    else
        echo "❌ Erro ao instalar dependências"
        read -p "Pressione ENTER para continuar..."
        return 1
    fi
    echo ""
    
    echo "3. Executando build..."
    npm run build
    if [ $? -eq 0 ]; then
        echo "✓ Build concluído com sucesso"
        echo ""
        echo "Arquivos gerados em dist/:"
        ls -lh dist/ | head -10
    else
        echo "❌ Erro no build"
    fi
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}

# Função 3: Build rápido
build_rapido() {
    echo ""
    echo "======================================"
    echo "  Build Rápido"
    echo "======================================"
    echo ""
    
    npm run build
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ Build concluído com sucesso!"
        echo ""
        echo "Tamanho do dist/:"
        du -sh dist/
    else
        echo ""
        echo "❌ Build falhou. Verifique os erros acima."
    fi
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}

# Função 4: Deploy rápido
deploy_rapido() {
    echo ""
    echo "======================================"
    echo "  Deploy Rápido"
    echo "======================================"
    echo ""
    
    # Verificar se há alterações
    if git diff-index --quiet HEAD --; then
        echo "⚠️  Não há alterações para commitar."
        echo ""
        read -p "Deseja fazer push mesmo assim? (s/N): " resposta
        if [[ ! "$resposta" =~ ^[Ss]$ ]]; then
            echo "Operação cancelada."
            read -p "Pressione ENTER para continuar..."
            return
        fi
    fi
    
    echo "Arquivos alterados:"
    git status --short
    echo ""
    
    read -p "Mensagem do commit (ou ENTER para usar padrão): " msg
    if [ -z "$msg" ]; then
        msg="chore: Atualizações do sistema"
    fi
    
    echo ""
    echo "1. Adicionando arquivos..."
    git add .
    echo "✓ Arquivos adicionados"
    echo ""
    
    echo "2. Fazendo commit..."
    git commit -m "$msg"
    if [ $? -eq 0 ]; then
        echo "✓ Commit realizado"
    else
        echo "⚠️  Nenhuma alteração para commitar ou erro no commit"
    fi
    echo ""
    
    echo "3. Fazendo push..."
    git push origin main
    if [ $? -eq 0 ]; then
        echo "✓ Push realizado com sucesso!"
        echo ""
        echo "Deploy automático iniciado no Vercel."
        echo "Acesse o dashboard para acompanhar:"
        echo "https://vercel.com/dashboard"
    else
        echo "❌ Erro no push. Verifique suas credenciais e conexão."
    fi
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}

# Função 5: Limpar cache
limpar_cache() {
    echo ""
    echo "======================================"
    echo "  Limpeza de Cache e Dependências"
    echo "======================================"
    echo ""
    
    echo "⚠️  Esta operação irá remover:"
    echo "  - node_modules/"
    echo "  - dist/"
    echo "  - .vite/"
    echo "  - package-lock.json"
    echo ""
    read -p "Continuar? (s/N): " resposta
    
    if [[ "$resposta" =~ ^[Ss]$ ]]; then
        echo ""
        rm -rf node_modules dist .vite package-lock.json
        echo "✓ Cache e dependências removidos"
        echo ""
        echo "Execute 'npm ci' para reinstalar dependências."
    else
        echo "Operação cancelada."
    fi
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}

# Função 6: Verificar versões
verificar_versoes() {
    echo ""
    echo "======================================"
    echo "  Versões Instaladas"
    echo "======================================"
    echo ""
    
    echo "Node.js:"
    node --version
    echo ""
    
    echo "npm:"
    npm --version
    echo ""
    
    echo "Git:"
    git --version
    echo ""
    
    if [ -f "package.json" ]; then
        echo "Vite (do package.json):"
        grep '"vite"' package.json
        echo ""
        
        echo "React (do package.json):"
        grep '"react"' package.json | head -2
    fi
    
    echo ""
    echo "Sistema Operacional:"
    uname -a
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}

# Função 7: Testar scripts
testar_scripts() {
    echo ""
    echo "======================================"
    echo "  Testar Scripts do package.json"
    echo "======================================"
    echo ""
    
    echo "Scripts disponíveis:"
    echo ""
    grep '".*":' package.json | grep -A 20 '"scripts"' | grep '"' | grep -v '"scripts"'
    echo ""
    
    echo "Qual script deseja testar?"
    read -p "Nome do script (ex: build, dev, preview): " script_name
    
    if [ -z "$script_name" ]; then
        echo "Nenhum script especificado."
    else
        echo ""
        echo "Executando: npm run $script_name"
        echo "------------------------------"
        npm run "$script_name"
    fi
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}

# Função 8: Verificar permissões do Vite
verificar_vite() {
    echo ""
    echo "======================================"
    echo "  Verificar Vite"
    echo "======================================"
    echo ""
    
    if [ -d "node_modules" ]; then
        echo "1. Verificando binário do Vite:"
        if [ -f "node_modules/.bin/vite" ]; then
            ls -lh node_modules/.bin/vite
            echo ""
            
            if [ -x "node_modules/.bin/vite" ]; then
                echo "✓ Vite tem permissão de execução"
            else
                echo "⚠️  Vite NÃO tem permissão de execução"
                echo ""
                read -p "Deseja adicionar permissão? (s/N): " resposta
                if [[ "$resposta" =~ ^[Ss]$ ]]; then
                    chmod +x node_modules/.bin/vite
                    echo "✓ Permissão adicionada"
                fi
            fi
        else
            echo "❌ Binário do Vite não encontrado!"
            echo "Execute 'npm install' primeiro."
        fi
        echo ""
        
        echo "2. Verificando instalação do Vite:"
        if [ -d "node_modules/vite" ]; then
            echo "✓ Vite está instalado"
            echo ""
            echo "Arquivos principais:"
            ls -lh node_modules/vite/bin/ 2>/dev/null || echo "Diretório bin/ não encontrado"
        else
            echo "❌ Vite não está instalado!"
        fi
    else
        echo "❌ node_modules/ não existe!"
        echo "Execute 'npm install' primeiro."
    fi
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}

# Função 9: Status do Git
git_status() {
    echo ""
    echo "======================================"
    echo "  Status do Git"
    echo "======================================"
    echo ""
    
    git status
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}

# Função 10: Último commit
git_ultimo_commit() {
    echo ""
    echo "======================================"
    echo "  Último Commit"
    echo "======================================"
    echo ""
    
    git log -1 --stat
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}

# Função 11: Git diff
git_diferencas() {
    echo ""
    echo "======================================"
    echo "  Diferenças (git diff)"
    echo "======================================"
    echo ""
    
    git diff
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ Comando executado. Se não apareceu nada, não há diferenças."
    fi
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}

# Função 12: Log do build
ver_log_build() {
    echo ""
    echo "======================================"
    echo "  Log do Último Build"
    echo "======================================"
    echo ""
    
    if [ -f "/tmp/transpjardim-build.log" ]; then
        echo "Últimas 50 linhas do log:"
        echo "------------------------------"
        tail -n 50 /tmp/transpjardim-build.log
        echo "------------------------------"
        echo ""
        echo "Log completo em: /tmp/transpjardim-build.log"
    else
        echo "❌ Log não encontrado em /tmp/transpjardim-build.log"
        echo ""
        echo "Execute um build primeiro:"
        echo "  npm run build > /tmp/transpjardim-build.log 2>&1"
    fi
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}

# Função 13: Estrutura do dist
ver_dist() {
    echo ""
    echo "======================================"
    echo "  Estrutura do dist/"
    echo "======================================"
    echo ""
    
    if [ -d "dist" ]; then
        echo "Conteúdo do dist/:"
        echo ""
        tree dist/ -L 2 2>/dev/null || ls -lhR dist/
        echo ""
        echo "Tamanho total:"
        du -sh dist/
    else
        echo "❌ Diretório dist/ não existe!"
        echo ""
        echo "Execute 'npm run build' primeiro."
    fi
    
    echo ""
    read -p "Pressione ENTER para continuar..."
}

# Loop principal
while true; do
    clear
    show_menu
    read opcao
    
    case $opcao in
        1) verificar_build ;;
        2) build_limpo ;;
        3) build_rapido ;;
        4) deploy_rapido ;;
        5) limpar_cache ;;
        6) verificar_versoes ;;
        7) testar_scripts ;;
        8) verificar_vite ;;
        9) git_status ;;
        10) git_ultimo_commit ;;
        11) git_diferencas ;;
        12) ver_log_build ;;
        13) ver_dist ;;
        0) 
            echo ""
            echo "Saindo..."
            echo ""
            exit 0
            ;;
        *)
            echo ""
            echo "Opção inválida!"
            sleep 2
            ;;
    esac
done
