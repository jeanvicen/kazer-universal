# Contribuindo com o Kazer Universal

Obrigado por contribuir. O Kazer é um repositório público, mas cada projeto incorporado mantém sua própria identidade, licença, autores e avisos.

## Antes de abrir um pull request

1. Não copie código, pesos, datasets ou documentação sem verificar a licença da versão exata.
2. Prefira propor um adapter ou registro `external` quando a redistribuição não estiver clara.
3. Inclua a origem oficial, commit ou release, licença, hash, modificações e dependências.
4. Preserve `LICENSE`, `NOTICE`, `COPYRIGHT`, `AUTHORS` e atribuições existentes.
5. Não inclua secrets, tokens, chaves, dados pessoais ou arquivos proprietários.
6. Execute os testes e descreva limitações, riscos e permissões necessárias.

## Como adicionar uma integração

Use o template em `registry/` e classifique o item como `core`, `adapter`, `external` ou `review_required`. A classificação `review_required` é a opção correta quando houver dúvida. A equipe pode pedir documentação adicional antes de aceitar a incorporação física.

## Skills

Novas skills devem declarar nome, versão, capabilities, permissões mínimas, dependências, licença e entrypoint. Uma skill nunca deve receber acesso irrestrito ao sistema, rede ou arquivos do usuário.

## Revisão

Pull requests podem ser recusados ou mantidos fora do monorepo quando a licença, segurança, procedência ou compatibilidade não estiver suficientemente comprovada.
