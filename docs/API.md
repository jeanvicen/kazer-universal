# Kazer API — versão inicial

## Descoberta pública

| Método | Endpoint | Estado |
| --- | --- | --- |
| GET | `/v1/health` | Implementado |
| GET | `/v1/capabilities` | Implementado |
| GET | `/v1/registry` | Implementado |
| GET | `/v1/skills` | Implementado |
| GET | `/v1/models` | Implementado; retorna lista vazia até provider ser configurado |
| GET | `/v1/providers` | Implementado; retorna lista vazia até provider ser configurado |

## Operações declaradas

Os endpoints `POST /v1/chat`, `/v1/reason`, `/v1/agent`, `/v1/search`, `/v1/vision`, `/v1/image`, `/v1/video`, `/v1/audio`, `/v1/speech`, `/v1/embed`, `/v1/code`, `/v1/tools` e `/v1/mcp` já possuem contrato HTTP e validação básica de JSON, mas respondem `501 capability_not_configured` enquanto não houver um provider autorizado e configurado.

Isso é intencional: a API não finge que uma capacidade está pronta quando nenhum modelo, worker ou provider real foi conectado.

## Workspace autenticado

A camada tRPC possui procedimentos autenticados para listar e criar projetos, gerar uma API key mostrada uma única vez e revogar uma key. O segredo não é salvo em texto puro; apenas o hash SHA-256 é persistido.

Antes de expor essas operações em REST público, adicionar rate limiting, auditoria, rotação segura, expiração, escopos por capability e uma política de recuperação de conta.
