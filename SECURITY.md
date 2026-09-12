# Security Policy

## Estado

O Kazer Universal está em fase inicial. Ainda não deve ser tratado como serviço de produção ou ambiente seguro para secrets de clientes.

## Reporte responsável

Não publique vulnerabilidades não corrigidas em issues públicas. Para este estágio, abra uma issue privada no GitHub ou contate os mantenedores pelo canal definido no repositório. Um endereço de e-mail não é inventado aqui porque o domínio oficial ainda não foi definido.

Inclua versão ou commit, impacto, passos de reprodução, evidências mínimas e uma sugestão de mitigação. Não inclua tokens, dados pessoais, credenciais ou exploits destrutivos.

## Regras obrigatórias

- Secrets não entram em código, logs, screenshots ou commits.
- Agents e plugins devem usar permissões mínimas e sandbox explícito.
- Providers externos são tratados como não confiáveis.
- Uploads precisam de validação de tamanho, MIME type, extensão e conteúdo.
- Releases devem passar por testes, dependency scanning, secret scanning e revisão de licenças.

## Limitações atuais

Sandbox real de agentes, rate limiting de produção, auditoria persistente, SBOM automático e execução de providers ainda estão planejados e não devem ser considerados implementados.
