// Script para identificar e corrigir template literals aninhados
// Este arquivo é apenas para referência - não será executado

const problematicLines = [
  {line: 604, issue: "template aninhado em console.log"},
  {line: 623, issue: "template aninhado em subject"},
  {line: 627-629, issue: "template aninhado complexo em emailText"},
  {line: 630, issue: "template aninhado em console.log"},
  {line: 709, issue: "template aninhado com escapes duplos"},
  {line: 741, issue: "template aninhado em note"},
  {line: 1085, issue: "template aninhado em console.log"},
  {line: 1107-1108, issue: "template aninhado em emailText"},
  {line: 1223, issue: "template aninhado com escapes duplos"},
  {line: 1359, issue: "template aninhado em console.log"},
  {line: 1426-1427, issue: "template aninhado - código residual"},
  {line: 1454, issue: "template aninhado em note"},
  {line: 2052-2053, issue: "template aninhado em subject"},
  {line: 2055-2057, issue: "template aninhado em emailText"},
  {line: 2059, issue: "template aninhado em console.log"}
];

// Todos precisam ser convertidos para concatenação de strings
