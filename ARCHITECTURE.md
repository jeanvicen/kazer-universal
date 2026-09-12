# Kazer Universal — Arquitetura inicial

## Escopo entregue nesta primeira versão

A aplicação fornece um dashboard responsivo com visão geral da plataforma, catálogo de capabilities, registry com status de licença/proveniência, uma área de skills extensível e uma base de API tipada via tRPC. O objetivo é validar a experiência e os contratos antes de incorporar código ou conectar providers externos.

## Camadas

- **Web app:** dashboard mobile-first para operar o catálogo e as skills.
- **API:** procedimentos tipados para health, capabilities, registry e skills.
- **Core registry:** metadados explícitos de origem, licença, status e proveniência.
- **Skills:** extensões declarativas com versão, categoria, permissões e licença.
- **Governance:** classificação `core`, `adapter`, `external` e `review_required`.

## Próximas fases seguras

1. Persistir registry, skills, projetos e chaves em banco com autorização por usuário.
2. Implementar task queue e auditoria com limites e isolamento.
3. Adicionar adapters somente após revisão de licença e segurança por componente.
4. Criar SDKs oficiais e endpoints REST compatíveis a partir dos contratos estabilizados.
5. Adicionar workers locais/cloud/híbridos e secrets gerenciados, sem colocar credenciais no cliente.
