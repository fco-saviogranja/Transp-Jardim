#!/bin/bash

# ============================================
# Comandos para Edge Function - TranspJardim
# ============================================

echo "📧 Edge Function - TranspJardim"
echo "================================"
echo ""

# Função para mostrar menu
show_menu() {
    echo "Escolha uma opção:"
    echo ""
    echo "1) 🧪 Testar localmente (reiniciar servidor)"
    echo "2) 🚀 Fazer deploy no Supabase"
    echo "3) 🔐 Configurar secrets"
    echo "4) 📋 Ver logs da função"
    echo "5) ❌ Sair"
    echo ""
}

# Função para testar localmente
test_local() {
    echo "🧪 Testando Edge Function localmente..."
    echo ""
    echo "⚠️  Pressione Ctrl+C no outro terminal se o servidor já estiver rodando"
    echo ""
    read -p "Pressione ENTER quando estiver pronto..."
    
    echo "Iniciando servidor local..."
    supabase functions serve enviar-email --env-file .env.local
}

# Função para fazer deploy
deploy_function() {
    echo "🚀 Fazendo deploy da Edge Function..."
    echo ""
    
    read -p "Tem certeza? (s/n): " confirm
    if [ "$confirm" = "s" ] || [ "$confirm" = "S" ]; then
        supabase functions deploy enviar-email
        echo ""
        echo "✅ Deploy concluído!"
        echo ""
        echo "🧪 Testar agora? Execute:"
        echo "   curl https://seu-project-id.supabase.co/functions/v1/enviar-email"
    else
        echo "Deploy cancelado."
    fi
}

# Função para configurar secrets
configure_secrets() {
    echo "🔐 Configurando secrets..."
    echo ""
    echo "Configure os seguintes secrets no Supabase:"
    echo ""
    
    echo "1) SMTP_HOST"
    read -p "   Valor (pressione ENTER para usar smtp.hostinger.com): " smtp_host
    smtp_host=${smtp_host:-smtp.hostinger.com}
    
    echo "2) SMTP_PORT"
    read -p "   Valor (pressione ENTER para usar 465): " smtp_port
    smtp_port=${smtp_port:-465}
    
    echo "3) SMTP_USER"
    read -p "   Valor (pressione ENTER para usar controleinterno@transpjardim.com): " smtp_user
    smtp_user=${smtp_user:-controleinterno@transpjardim.com}
    
    echo "4) SMTP_PASSWORD"
    read -sp "   Valor (senha do e-mail): " smtp_pass
    echo ""
    
    if [ -z "$smtp_pass" ]; then
        echo ""
        echo "❌ Senha é obrigatória!"
        return
    fi
    
    echo ""
    echo "Configurando secrets..."
    
    supabase secrets set SMTP_HOST="$smtp_host"
    supabase secrets set SMTP_PORT="$smtp_port"
    supabase secrets set SMTP_USER="$smtp_user"
    supabase secrets set SMTP_PASSWORD="$smtp_pass"
    
    echo ""
    echo "✅ Secrets configurados!"
    echo ""
    echo "⚠️  Você precisa fazer REDEPLOY da função para usar os novos secrets:"
    echo "   supabase functions deploy enviar-email"
}

# Função para ver logs
view_logs() {
    echo "📋 Logs da Edge Function..."
    echo ""
    echo "⚠️  Para ver logs em tempo real, use:"
    echo "   supabase functions logs enviar-email --follow"
    echo ""
    echo "Ou veja no Dashboard:"
    echo "   https://supabase.com/dashboard → Edge Functions → enviar-email → Logs"
    echo ""
    read -p "Ver últimos logs agora? (s/n): " view
    if [ "$view" = "s" ] || [ "$view" = "S" ]; then
        supabase functions logs enviar-email
    fi
}

# Loop do menu
while true; do
    show_menu
    read -p "Opção: " option
    echo ""
    
    case $option in
        1)
            test_local
            ;;
        2)
            deploy_function
            ;;
        3)
            configure_secrets
            ;;
        4)
            view_logs
            ;;
        5)
            echo "👋 Até logo!"
            exit 0
            ;;
        *)
            echo "❌ Opção inválida!"
            ;;
    esac
    
    echo ""
    echo "================================"
    echo ""
done
