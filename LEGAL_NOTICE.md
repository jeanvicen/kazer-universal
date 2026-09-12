# Kazer Universal — Nota pública de propriedade e compliance

Este repositório é **público e colaborativo**. A visibilidade pública não significa que todo arquivo tenha a mesma licença. O código original do Kazer e os componentes de terceiros devem permanecer claramente separados e identificados.

Antes de incorporar qualquer componente, é obrigatório verificar a licença aplicável à versão exata, os arquivos `LICENSE`, `NOTICE`, `COPYRIGHT`, autores, dependências, restrições de uso e regras específicas para pesos de modelos. A proposta de licença do código original do Kazer deve ser definida pelo titular do projeto antes da primeira release distribuível; até essa decisão, não assumir permissão de reutilização além da visualização e contribuição autorizada.

Cada contribuição ou importação deve registrar nome, origem oficial, versão ou commit, licença, hash quando aplicável, alterações feitas, adapter Kazer e arquivos de atribuição. Nenhuma licença, atribuição, aviso de copyright ou `NOTICE` de terceiros pode ser removida. Componentes ainda não validados permanecem classificados como `external` ou `review_required`.

Esta nota é orientação de engenharia e não substitui aconselhamento jurídico. Antes de distribuir o produto, publicar SDKs, aceitar contribuições externas ou oferecer serviços pagos, faça uma revisão com advogado especializado em software, propriedade intelectual, privacidade e proteção de dados aplicável ao país de operação.

## Política de segurança inicial

- Nunca colocar secrets em código, logs ou commits.
- Não permitir que agentes tenham acesso irrestrito a terminal, filesystem, rede ou contas.
- Validar entradas, arquivos, tamanho, MIME type, permissões e limites.
- Registrar proveniência, hash e versão de qualquer componente incorporado.
- Manter dependências atualizadas e executar scanners antes de releases.
- Tratar providers externos como não confiáveis até haver contrato e revisão.
