# Kazer API — versão inicial

## Descoberta pública

| Método | Endpoint | Estado |
| --- | --- | --- |
| GET | `/v1/health` | Implementado |
| GET | `/v1/capabilities` | Implementado |
| GET | `/v1/registry` | Implementado |
| GET | `/v1/skills` | Implementado |
| GET | `/v1/models` | Implementado usando o catálogo LLM disponível |
| GET | `/v1/providers` | Implementado com status do provider configurado |

## Chat

`POST /v1/chat` aceita `{ "prompt": "..." }` ou uma lista `messages` e executa o helper LLM server-side, sem expor credenciais no navegador. `POST /v1/chat/completions` devolve o formato compatível com clientes OpenAI.

## Tasks

`POST /v1/tasks` cria um job assíncrono de chat e retorna `202` com `task_id`. `GET /v1/tasks/:id` acompanha status, progresso, resultado e erro. `DELETE /v1/tasks/:id` tenta cancelar tarefas ainda não concluídas. Esta fila é um runtime inicial em memória; para produção, deve ser substituída por fila persistente com retry, timeout, auditoria e workers separados.

## Capacidades ainda não configuradas

Os endpoints `POST /v1/reason`, `/v1/agent`, `/v1/search`, `/v1/vision`, `/v1/image`, `/v1/video`, `/v1/audio`, `/v1/speech`, `/v1/embed`, `/v1/code`, `/v1/tools` e `/v1/mcp` respondem `501 capability_not_configured` enquanto não houver um provider autorizado e configurado.
