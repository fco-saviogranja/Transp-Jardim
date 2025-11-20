#!/usr/bin/env python3
"""
Script para corrigir template literals aninhados no arquivo index.tsx
Executa todas as 8 correções identificadas
"""

import re

FILE_PATH = "/supabase/functions/server/index.tsx"

def read_file():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(content):
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_templates():
    print("🔧 Lendo arquivo...")
    content = read_file()
    
    #  Backup
    with open(FILE_PATH + '.backup', 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"💾 Backup criado: {FILE_PATH}.backup")
    
    # CORREÇÃO 1 e 2 - Linhas 637-638
    print("📝 Aplicando correção 1 e 2...")
    old_1 = r'''\? `\[MODO TESTE - Destinatário original: \${to}\]\\n\\nTranspJardim - \${subject}\\n\\nCritério: \${criterio\?\.nome}\\nSecretaria: \${criterio\?\.secretaria}\\nResponsável: \${usuario\?\.name}\\nPrazo: \${prazoFormatado}\\n\\nAcesse: https://transparenciajardim\.app`'''
    
    new_1 = r'''? [
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
        ].join('\n')'''
    
    content = re.sub(old_1, new_1, content)
    
    old_2 = r''': `TranspJardim - \${subject}\\n\\nCritério: \${criterio\?\.nome}\\nSecretaria: \${criterio\?\.secretaria}\\nResponsável: \${usuario\?\.name}\\nPrazo: \${prazoFormatado}\\n\\nAcesse: https://transparenciajardim\.app`;'''
    
    new_2 = r''': [
          `TranspJardim - ${subject}`,
          ``,
          `Critério: ${criterio?.nome}`,
          `Secretaria: ${criterio?.secretaria}`,
          `Responsável: ${usuario?.name}`,
          `Prazo: ${prazoFormatado}`,
          ``,
          `Acesse: https://transparenciajardim.app`
        ].join('\n');'''
    
    content = re.sub(old_2, new_2, content)
    
    # CORREÇÃO 3 - Linha 625
    print("📝 Aplicando correção 3...")
    content = content.replace(
        '      ? htmlTemplate.replace(\n          \'<h2>⚠️\',\n          `<div style="background: #e3f2fd; border: 2px solid #2196f3; padding: 10px; border-radius: 6px; margin-bottom: 15px;">\n            <p style="margin: 0; color: #1976d2;"><strong>🧪 MODO TESTE:</strong> Este e-mail deveria ser enviado para <strong>${to}</strong></p>\n          </div>\n          <h2>⚠️`\n        )\n      : htmlTemplate;',
        '''    // ✅ CORREÇÃO: Extrair interpolação complexa para evitar template aninhado
    const testModeNoticeHtml = `<div style="background: #e3f2fd; border: 2px solid #2196f3; padding: 10px; border-radius: 6px; margin-bottom: 15px;">
            <p style="margin: 0; color: #1976d2;"><strong>🧪 MODO TESTE:</strong> Este e-mail deveria ser enviado para <strong>${to}</strong></p>
          </div>
          <h2>⚠️`;
    
    const emailHtml = isTestModeRedirect 
      ? htmlTemplate.replace('<h2>⚠️', testModeNoticeHtml)
      : htmlTemplate;'''
    )
    
    # CORREÇÃO 4 - Linha 632
    print("📝 Aplicando correção 4...")
    content = content.replace(
        "? 'TranspJardim: ' + subject + ' [Destinatário: ' + to + ']'",
        "? `TranspJardim: ${subject} [Destinatário: ${to}]`"
    )
    content = content.replace(
        ": 'TranspJardim: ' + subject;",
        ": `TranspJardim: ${subject}`;"
    )
    
    # CORREÇÃO 5 - Linha 721
    print("📝 Aplicando correção 5...")
    content = content.replace(
        "text: `TranspJardim - ${subject}\\\\n\\\\nCritério: ${criterio?.nome}\\\\nSecretaria: ${criterio?.secretaria}\\\\nResponsável: ${usuario?.name}\\\\nPrazo: ${prazoFormatadoRetry}\\\\n\\\\nAcesse: https://transparenciajardim.app\\\\n\\\\n[EMAIL REDIRECIONADO PARA MODO DE TESTE]`",
        '''text: [
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
                ].join('\\n')'''
    )
    
    # CORREÇÃO 6 e 7 - Linhas 1120-1121
    print("📝 Aplicando correção 6 e 7...")
    content = content.replace(
        "const emailText = isTestModeRedirect\n      ? `TranspJardim - Teste de E-mail\\n\\n[MODO TESTE - Destinatário original: ${testEmail}]\\n\\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\\nData/Hora: ${new Date().toLocaleString('pt-BR')}`\n      : `TranspJardim - Teste de E-mail\\n\\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\\nData/Hora: ${new Date().toLocaleString('pt-BR')}`;",
        '''const dataHoraTeste = new Date().toLocaleString('pt-BR');
    const emailText = isTestModeRedirect
      ? [
          `TranspJardim - Teste de E-mail`,
          ``,
          `[MODO TESTE - Destinatário original: ${testEmail}]`,
          ``,
          `Se você recebeu este e-mail, o sistema está funcionando corretamente.`,
          `Data/Hora: ${dataHoraTeste}`
        ].join('\\n')
      : [
          `TranspJardim - Teste de E-mail`,
          ``,
          `Se você recebeu este e-mail, o sistema está funcionando corretamente.`,
          `Data/Hora: ${dataHoraTeste}`
        ].join('\\n');'''
    )
    
    # CORREÇÃO 8 - Linha 1236
    print("📝 Aplicando correção 8...")
    content = content.replace(
        "text: `TranspJardim - Teste de E-mail\\\\n\\\\nSe você recebeu este e-mail, o sistema está funcionando corretamente.\\\\nData/Hora: ${new Date().toLocaleString('pt-BR')}\\\\n\\\\nEmail redirecionado de ${testEmail} para ${authorizedEmail} devido ao modo de teste do Resend.`",
        '''text: [
                  `TranspJardim - Teste de E-mail`,
                  ``,
                  `Se você recebeu este e-mail, o sistema está funcionando corretamente.`,
                  `Data/Hora: ${new Date().toLocaleString('pt-BR')}`,
                  ``,
                  `Email redirecionado de ${testEmail} para ${authorizedEmail} devido ao modo de teste do Resend.`
                ].join('\\n')'''
    )
    
    # CORREÇÃO EXTRA 1 - Linha 1441
    print("📝 Aplicando correção extra 1...")
    content = content.replace(
        "text: `[MODO TESTE - Destinatário original: ${to}]\\n\\n${emailText}`",
        '''text: [
                `[MODO TESTE - Destinatário original: ${to}]`,
                ``,
                emailText
              ].join('\\n')'''
    )
    
    # CORREÇÃO EXTRA 2 - Linhas 2068-2069
    print("📝 Aplicando correção extra 2...")
    content = content.replace(
        "const emailText = isTestModeRedirect\n          ? `[MODO TESTE - Destinatário original: ${email}]\\n\\nTranspJardim - ${subject}\\n\\nCritério: ${criterio?.nome}\\nSecretaria: ${criterio?.secretaria}\\nTipo: ${alertType === 'urgent' ? 'URGENTE' : 'AVISO'}\\n\\nAcesse: https://transparenciajardim.app`\n          : `TranspJardim - ${subject}\\n\\nCritério: ${criterio?.nome}\\nSecretaria: ${criterio?.secretaria}\\nTipo: ${alertType === 'urgent' ? 'URGENTE' : 'AVISO'}\\n\\nAcesse: https://transparenciajardim.app`;",
        '''const tipoAlerta = alertType === 'urgent' ? 'URGENTE' : 'AVISO';
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
            ].join('\\n')
          : [
              `TranspJardim - ${subject}`,
              ``,
              `Critério: ${criterio?.nome}`,
              `Secretaria: ${criterio?.secretaria}`,
              `Tipo: ${tipoAlerta}`,
              ``,
              `Acesse: https://transparenciajardim.app`
            ].join('\\n');'''
    )
    
    # Escrever arquivo corrigido
    print("💾 Salvando arquivo corrigido...")
    write_file(content)
    
    print("✅ Todas as correções aplicadas com sucesso!")
    print(f"📁 Arquivo original salvo em: {FILE_PATH}.backup")

if __name__ == "__main__":
    try:
        fix_templates()
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
