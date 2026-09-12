# Plugins, adapters, tasks e bus

Plugins devem declarar capabilities, dependências, permissões, licença, entrypoint e proveniência antes de serem carregados. O Core não deve executar um plugin sem validar o manifesto.

Adapters traduzem interfaces externas para contratos Kazer. Eles não devem copiar ou alterar licenças de upstream. Quando o componente externo não puder ser incorporado, o adapter pode permanecer em `adapters/` e o provider em `third-party/external/`.

Tasks representam trabalho assíncrono. O contrato já define estados, progresso, entrada e timestamp; a fila, retry, timeout, cancelamento, persistência e workers ainda precisam de implementação.

O Bus será responsável por eventos, RPC e streaming entre componentes. A primeira versão apenas define o tipo de evento para evitar dependências acidentais entre providers.
