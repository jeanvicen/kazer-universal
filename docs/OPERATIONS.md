# Operations

O health endpoint mostra o estado declarativo do API, router, registry, workers, providers e chat. O build executa TypeScript, testes Vitest e bundle de produção. O container usa variáveis externas e não embute credenciais.

A fila de tasks atual é em memória e perde jobs ao reiniciar o processo. Antes de produção, adicionar Redis ou banco para fila, métricas, tracing, logs estruturados sem secrets, retry com backoff, timeout, cancelamento, dead-letter queue e isolamento de workers.

O aviso de chunk grande do Vite é de performance, não de falha. A próxima otimização deve usar code splitting para páginas de dashboard e SDKs separados.
