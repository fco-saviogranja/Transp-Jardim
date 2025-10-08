/**
 * Utilitário otimizado para monitoramento e otimização de memória
 */

let lastMemoryCheck = 0;
let memoryWarningCount = 0;

export function optimizeMemoryUsage(): void {
  const now = Date.now();
  
  // Apenas verificar a cada 10 minutos para reduzir overhead drasticamente
  if (now - lastMemoryCheck < 600000) {
    return;
  }
  
  lastMemoryCheck = now;
  
  try {
    // Verificação leve e rápida apenas se necessário
    if ('memory' in performance && typeof (performance as any).memory === 'object') {
      const memInfo = (performance as any).memory;
      const used = memInfo.usedJSHeapSize;
      const limit = memInfo.jsHeapSizeLimit;
      
      // Apenas alertar se uso for crítico (mais de 80% do limite)
      const percentage = (used / limit) * 100;
      if (percentage > 80) {
        memoryWarningCount++;
        
        // Alertar muito raramente para evitar spam
        if (memoryWarningCount % 5 === 1) {
          console.warn('⚠️ Memória crítica:', Math.round(percentage) + '%');
        }
        
        // Otimizações leves
        requestIdleCallback(() => {
          try {
            if (typeof window !== 'undefined' && window.gc) {
              window.gc();
            }
          } catch {}
        });
      } else {
        memoryWarningCount = 0;
      }
    }
  } catch (error) {
    // Ignorar todos os erros silenciosamente
  }
}

function performMemoryOptimizations(): void {
  try {
    // Limpar caches antigos do localStorage
    cleanupLocalStorage();
    
    // Limpar timers órfãos se possível
    cleanupTimers();
    
    // Forçar garbage collection se disponível (apenas em desenvolvimento)
    if (isDevelopment() && 'gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  } catch (error) {
    // Ignorar erros de otimização
  }
}

function cleanupLocalStorage(): void {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    // Remover itens antigos específicos do TranspJardim
    keys.forEach(key => {
      if (key.startsWith('transpjardim-') && key.includes('temp-')) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            // Remover itens temporários com mais de 1 hora
            if (data.timestamp && (now - data.timestamp) > 3600000) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Se não conseguir parsear, remover item
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    // Ignorar erros de limpeza
  }
}

function cleanupTimers(): void {
  // Esta função é limitada no que pode fazer no browser
  // Principalmente serve para demonstrar a intenção de limpeza
}

function isDevelopment(): boolean {
  try {
    return (
      typeof import.meta !== 'undefined' && import.meta.env?.DEV === true ||
      typeof window !== 'undefined' && window.location.hostname === 'localhost'
    );
  } catch {
    return false;
  }
}

// Função para ser chamada quando o componente é desmontado
export function cleanupComponentMemory(componentName: string): void {
  try {
    // Limpar qualquer dados específicos do componente
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes(componentName.toLowerCase())) {
        try {
          localStorage.removeItem(key);
        } catch {
          // Ignorar erros
        }
      }
    });
  } catch (error) {
    // Ignorar erros de limpeza
  }
}