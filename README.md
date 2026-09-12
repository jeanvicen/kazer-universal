# Kazer Universal

Uma camada pública e extensível para organizar capabilities de IA, adapters, providers e skills com foco em segurança, proveniência e créditos corretos.

> **Importante:** público não significa que todos os arquivos tenham a mesma licença. O código original do Kazer e os componentes de terceiros são mantidos separados e devem ser identificados individualmente.

## O que existe nesta versão

- Dashboard responsivo e mobile-first.
- API tipada com health, capabilities, registry e skills.
- Registry inicial com origem, licença, status e proveniência.
- Área de skills com versão, categoria, permissões e licença.
- Política de contribuição, nota legal e avisos de terceiros.
- Base de autenticação, banco e storage preparada pelo scaffold fullstack.

## Princípio de incorporação

Nenhum projeto é copiado apenas porque está no GitHub. A entrada deve passar por análise de licença, dependências, segurança, copyright e proveniência. Quando a redistribuição não estiver clara, o item permanece `external` ou `review_required`.

## Desenvolvimento

```bash
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm build
```

## Contribuições

Consulte [`CONTRIBUTING.md`](./CONTRIBUTING.md), [`LEGAL_NOTICE.md`](./LEGAL_NOTICE.md) e [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md). Preserve sempre `LICENSE`, `NOTICE`, `COPYRIGHT`, autores, origem e restrições dos projetos incorporados.

## Status

Esta é uma primeira versão funcional de arquitetura e governança. Providers externos, workers, fila de tarefas e SDKs ainda devem ser adicionados de forma incremental, com revisão técnica e jurídica por componente.
