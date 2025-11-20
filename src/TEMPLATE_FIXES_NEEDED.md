# Template Literals Aninhados que Causam Erro 403

## Linhas que AINDA precisam ser corrigidas:

1. **Linha 628** - emailText com dueDate condicional aninhado (`\\n`)
2. **Linha 629** - emailText com dueDate condicional aninhado (`\\n`)  
3. **Linha 711** - text com dueDate condicional aninhado (`\\\\n` - 4 barras)
4. **Linha 1110** - emailText com new Date() condicional aninhado (`\\n`)
5. **Linha 1111** - emailText com new Date() condicional aninhado (`\\n`)
6. **Linha 1226** - text com new Date() + testEmail + authorizedEmail condicional aninhado (`\\\\n` - 4 barras)
7. **Linha 2054** - emailSubject com email condicional aninhado
8. **Linha 2055-2057** - emailText com alertType condicional aninhado

## Estratégia:
Converter TODOS para concatenação de strings simples usando operador `+`
Extrair condicionais complexos para variáveis separadas ANTES do template
