# Kazer Universal

Uma camada pública e extensível para organizar capabilities de IA, adapters, providers e skills com foco em segurança, proveniência e créditos corretos.

> **Importante:** público não significa que todos os arquivos tenham a mesma licença. O código original do Kazer e os componentes de terceiros são mantidos separados e devem ser identificados individualmente.

## O que está implementado

O MVP possui dashboard responsivo, área de skills, registry com licença e proveniência, API tRPC, endpoints REST de descoberta, OpenAPI inicial, políticas formais de segurança/privacidade/modelos/open source, estrutura de monorepo e migração persistente para projetos e API keys. API keys são armazenadas somente por hash e o segredo é retornado apenas no momento da criação.

As operações de execução (`chat`, `reason`, `agent`, `image` e outras) respondem explicitamente `501 capability_not_configured` enquanto nenhum provider autorizado estiver conectado. Isso é intencional: a API não finge que uma capacidade está pronta.

## Estrutura

As pastas `core`, `api`, `gateway`, `router`, `bus`, `memory`, `runtime`, `sdk`, `mobile`, `ecosystem`, `adapters`, `providers`, `models`, `plugins`, `registry`, `provenance` e `security` já existem como pontos de extensão. Nenhum código de terceiro é baixado automaticamente.

## Desenvolvimento

```bash
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm build
```

## Contribuições e licenças

Consulte [`CONTRIBUTING.md`](./CONTRIBUTING.md), [`LICENSE`](./LICENSE), [`NOTICE`](./NOTICE), [`LEGAL_NOTICE.md`](./LEGAL_NOTICE.md), [`OPEN_SOURCE_POLICY.md`](./OPEN_SOURCE_POLICY.md), [`MODEL_POLICY.md`](./MODEL_POLICY.md), [`SECURITY.md`](./SECURITY.md), [`PRIVACY.md`](./PRIVACY.md), [`TERMS.md`](./TERMS.md) e [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md).

Antes de incorporar um projeto, registre origem oficial, versão ou commit, licença, copyright, NOTICE, alterações e adapter. Na dúvida, use `external` ou `review_required`.

## Estado atual

Esta é uma primeira versão funcional de arquitetura e governança. Providers reais, workers, fila de tarefas, SDKs completos, sandbox de agentes, MCP, memória persistente, Docker Compose e importador automatizado ainda precisam ser adicionados em fases separadas, com revisão técnica e jurídica por componente.
