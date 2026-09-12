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
| GET | `/v1/adapters` | Catálogo público de llama.cpp, Qwen3 e DeepSeek-R1 sem segredos |
| GET | `/v1/adapters/:id/health` | Health e verificação da identidade do modelo configurado |
| POST | `/v1/adapters/:id/chat` | Chat real protegido por API key quando o banco está ativo |

## Intake seguro de repositórios

`POST /v1/repository/inspect` aceita `{ "url": "https://github.com/owner/repository" }` e lê somente metadados públicos de um repositório GitHub: README, arquivos de licença e manifestos textuais nas branches `main` ou `master`. A resposta sugere `declaredSkills` e `capabilities` por sinais documentais e informa as fontes lidas.

O endpoint aceita apenas URLs HTTPS do GitHub, não clona nem executa código externo, não instala dependências e não habilita permissões automaticamente. Skills, pesos, dependências, APIs, marcas e serviços cloud permanecem sujeitos a revisão humana e às licenças próprias. O objetivo é permitir que uma IA consulte o catálogo do Kazer e avalie compatibilidade sem transformar um link externo em execução irrestrita.

Os adapters são configurados por ambiente; veja [`docs/ADAPTERS.md`](./ADAPTERS.md). O código não inclui pesos nem executa runtimes externos. Um adapter sem URL retorna `not_configured`, e um modelo que não aparece em `/v1/models` retorna `degraded` em vez de ser substituído silenciosamente.

## Chat

`POST /v1/chat` aceita `{ "prompt": "..." }` ou uma lista `messages` e executa o helper LLM server-side, sem expor credenciais no navegador. `POST /v1/chat/completions` devolve o formato compatível com clientes OpenAI.

## Tasks

`POST /v1/tasks` cria um job assíncrono de chat e retorna `202` com `task_id`. `GET /v1/tasks/:id` acompanha status, progresso, resultado e erro. `DELETE /v1/tasks/:id` tenta cancelar tarefas ainda não concluídas. Esta fila é um runtime inicial em memória; para produção, deve ser substituída por fila persistente com retry, timeout, auditoria e workers separados.

## Capacidades ainda não configuradas

Os endpoints `POST /v1/reason`, `/v1/agent`, `/v1/search`, `/v1/vision`, `/v1/image`, `/v1/video`, `/v1/audio`, `/v1/speech`, `/v1/embed`, `/v1/code`, `/v1/tools` e `/v1/mcp` respondem `501 capability_not_configured` enquanto não houver um provider autorizado e configurado.
