#!/bin/bash

# Script de Verificação do Build - TranspJardim
# Verifica se o ambiente está correto antes do deploy

echo "======================================"
echo "  Verificação de Build - TranspJardim"
echo "======================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de problemas
PROBLEMS=0

# 1. Verificar Node.js version
echo "1. Verificando versão do Node.js..."
NODE_VERSION=$(node --version)
if [[ $NODE_VERSION == v18* ]] || [[ $NODE_VERSION == v20* ]]; then
    echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION (OK)"
else
    echo -e "${RED}✗${NC} Node.js $NODE_VERSION (Recomendado: v18.x ou v20.x)"
    PROBLEMS=$((PROBLEMS + 1))
fi
echo ""

# 2. Verificar npm
echo "2. Verificando npm..."
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓${NC} npm $NPM_VERSION"
echo ""

# 3. Verificar package.json
echo "3. Verificando package.json..."
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json existe"
    
    # Verificar se o script build está correto
    if grep -q '"build".*node.*vite/bin/vite.js' package.json; then
        echo -e "${GREEN}✓${NC} Script 'build' configurado corretamente (usando node)"
    else
        echo -e "${RED}✗${NC} Script 'build' não está usando node ./node_modules/vite/bin/vite.js"
        PROBLEMS=$((PROBLEMS + 1))
    fi
    
    # Verificar postinstall
    if grep -q '"postinstall"' package.json; then
        echo -e "${GREEN}✓${NC} Script 'postinstall' configurado"
    else
        echo -e "${YELLOW}⚠${NC} Script 'postinstall' não encontrado (opcional)"
    fi
else
    echo -e "${RED}✗${NC} package.json não encontrado!"
    PROBLEMS=$((PROBLEMS + 1))
fi
echo ""

# 4. Verificar vercel.json
echo "4. Verificando vercel.json..."
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓${NC} vercel.json existe"
    
    # Verificar buildCommand
    if grep -q '"buildCommand".*npm run build' vercel.json; then
        echo -e "${GREEN}✓${NC} buildCommand configurado corretamente"
    else
        echo -e "${RED}✗${NC} buildCommand não está executando 'npm run build'"
        PROBLEMS=$((PROBLEMS + 1))
    fi
    
    # Verificar outputDirectory
    if grep -q '"outputDirectory".*dist' vercel.json; then
        echo -e "${GREEN}✓${NC} outputDirectory configurado para 'dist'"
    else
        echo -e "${YELLOW}⚠${NC} outputDirectory pode estar incorreto"
    fi
else
    echo -e "${YELLOW}⚠${NC} vercel.json não encontrado (será criado automaticamente)"
fi
echo ""

# 5. Testar instalação de dependências
echo "5. Testando instalação de dependências..."
echo "   (Isso pode levar alguns segundos...)"

# Salvar node_modules atual se existir
if [ -d "node_modules" ]; then
    HAS_NODE_MODULES=true
else
    HAS_NODE_MODULES=false
fi

# Criar diretório temporário para teste
TEST_DIR=$(mktemp -d)
cp package.json "$TEST_DIR/"
cp package-lock.json "$TEST_DIR/" 2>/dev/null || true

cd "$TEST_DIR"
npm ci --silent > /dev/null 2>&1
INSTALL_RESULT=$?
cd - > /dev/null

if [ $INSTALL_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Instalação de dependências: OK"
    
    # Verificar se vite foi instalado
    if [ -f "$TEST_DIR/node_modules/.bin/vite" ]; then
        echo -e "${GREEN}✓${NC} Vite instalado corretamente"
        
        # Verificar permissões
        if [ -x "$TEST_DIR/node_modules/.bin/vite" ]; then
            echo -e "${GREEN}✓${NC} Vite tem permissão de execução"
        else
            echo -e "${YELLOW}⚠${NC} Vite sem permissão de execução (OK, usamos node diretamente)"
        fi
    else
        echo -e "${RED}✗${NC} Vite não foi instalado!"
        PROBLEMS=$((PROBLEMS + 1))
    fi
else
    echo -e "${RED}✗${NC} Erro ao instalar dependências"
    PROBLEMS=$((PROBLEMS + 1))
fi

# Limpar diretório temporário
rm -rf "$TEST_DIR"
echo ""

# 6. Verificar estrutura de arquivos
echo "6. Verificando estrutura de arquivos..."

REQUIRED_FILES=("index.html" "App.tsx" "vite.config.ts" "tsconfig.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file existe"
    else
        echo -e "${RED}✗${NC} $file não encontrado!"
        PROBLEMS=$((PROBLEMS + 1))
    fi
done
echo ""

# 7. Testar build local
echo "7. Testando build local..."
echo "   (Isso pode levar alguns minutos...)"

# Garantir que node_modules existe
if [ "$HAS_NODE_MODULES" = false ]; then
    echo "   Instalando dependências..."
    npm ci --silent > /dev/null 2>&1
fi

# Tentar build
npm run build > /tmp/transpjardim-build.log 2>&1
BUILD_RESULT=$?

if [ $BUILD_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Build executado com sucesso!"
    
    # Verificar se dist foi criado
    if [ -d "dist" ]; then
        echo -e "${GREEN}✓${NC} Diretório dist/ criado"
        
        # Verificar se index.html foi gerado
        if [ -f "dist/index.html" ]; then
            echo -e "${GREEN}✓${NC} dist/index.html gerado"
        else
            echo -e "${RED}✗${NC} dist/index.html não foi gerado!"
            PROBLEMS=$((PROBLEMS + 1))
        fi
    else
        echo -e "${RED}✗${NC} Diretório dist/ não foi criado!"
        PROBLEMS=$((PROBLEMS + 1))
    fi
else
    echo -e "${RED}✗${NC} Erro ao executar build!"
    echo ""
    echo "Log do build (últimas 20 linhas):"
    echo "-----------------------------------"
    tail -n 20 /tmp/transpjardim-build.log
    echo "-----------------------------------"
    PROBLEMS=$((PROBLEMS + 1))
fi
echo ""

# 8. Verificar Edge Function do Supabase
echo "8. Verificando Edge Function do Supabase..."
EDGE_FUNCTION="supabase/functions/server/index.tsx"

if [ -f "$EDGE_FUNCTION" ]; then
    echo -e "${GREEN}✓${NC} Edge Function existe"
    
    # Verificar imports
    if grep -q "npm:hono" "$EDGE_FUNCTION"; then
        echo -e "${GREEN}✓${NC} Imports do Hono corretos (npm:)"
    else
        echo -e "${YELLOW}⚠${NC} Imports podem estar incorretos"
    fi
    
    # Verificar helper buildTextEmail
    if grep -q "buildTextEmail" "$EDGE_FUNCTION"; then
        echo -e "${GREEN}✓${NC} Helper buildTextEmail encontrado"
    else
        echo -e "${YELLOW}⚠${NC} Helper buildTextEmail não encontrado"
    fi
else
    echo -e "${YELLOW}⚠${NC} Edge Function não encontrada (opcional)"
fi
echo ""

# Resumo final
echo "======================================"
echo "  RESUMO"
echo "======================================"
if [ $PROBLEMS -eq 0 ]; then
    echo -e "${GREEN}✓ TUDO OK!${NC}"
    echo ""
    echo "O projeto está pronto para deploy!"
    echo ""
    echo "Próximos passos:"
    echo "  1. git add ."
    echo "  2. git commit -m 'fix: Corrige build e permissões'"
    echo "  3. git push origin main"
    echo "  4. Deploy automático no Vercel"
    echo ""
    exit 0
else
    echo -e "${RED}✗ $PROBLEMS PROBLEMA(S) ENCONTRADO(S)${NC}"
    echo ""
    echo "Por favor, corrija os problemas acima antes de fazer deploy."
    echo ""
    echo "Para mais informações, consulte:"
    echo "  - SOLUCAO_ERROS_DEPLOY.md"
    echo "  - Logs em /tmp/transpjardim-build.log"
    echo ""
    exit 1
fi
