#!/bin/bash

# Script para aplicar correções de template literals no arquivo index.tsx
# Execute: bash fix_templates.sh

FILE="/supabase/functions/server/index.tsx"

echo "🔧 Aplicando correções de template literals..."

# Backup
cp "$FILE" "$FILE.backup"

# CORREÇÃO 1 e 2 - Linhas 637-638
sed -i 's/? `\[MODO TESTE - Destinatário original: \${to}\]\\n\\nTranspJardim - \${subject}\\n\\nCritério: \${criterio?.nome}\\nSecretaria: \${criterio?.secretaria}\\nResponsável: \${usuario?.name}\\nPrazo: \${prazoFormatado}\\n\\nAcesse: https:\/\/transparenciajardim.app`/? [\n          `[MODO TESTE - Destinatário original: ${to}]`,\n          ``,\n          `TranspJardim - ${subject}`,\n          ``,\n          `Critério: ${criterio?.nome}`,\n          `Secretaria: ${criterio?.secretaria}`,\n          `Responsável: ${usuario?.name}`,\n          `Prazo: ${prazoFormatado}`,\n          ``,\n          `Acesse: https:\/\/transparenciajardim.app`\n        ].join('\''\\n'\'')/g' "$FILE"

echo "✅ Correções aplicadas!"
echo "📁 Backup criado em: $FILE.backup"
