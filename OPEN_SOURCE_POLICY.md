# Open Source and Open-Weight Policy

## Princípio

Kazer Universal integra tecnologias de múltiplas comunidades, mas não é proprietário de todos os projetos relacionados. O Kazer fornece interfaces, adapters, routing, orchestration, developer experience e governança.

## Classificação

- `core`: código original do Kazer.
- `adapter`: código Kazer que integra uma interface externa.
- `embedded`: código de terceiro fisicamente incorporado após revisão.
- `adapted`: componente de terceiro adaptado conforme sua licença.
- `external`: dependência acessada fora do repositório.
- `review_required`: ainda não aprovado para distribuição.

## Obrigatório antes da incorporação

Registrar repositório oficial, commit, release, data, licença, copyright, NOTICE, autores, dependências, modificações, hash e adapter. Preservar avisos nos locais exigidos pela licença.

Código, pesos, datasets e documentação podem possuir regras diferentes. A licença do código não cobre automaticamente os pesos do modelo. Restrições de uso, redistribuição, pesquisa, território, finalidade e marca devem ser registradas separadamente.

Quando houver dúvida, não incorporar: manter `external` ou `review_required`.
