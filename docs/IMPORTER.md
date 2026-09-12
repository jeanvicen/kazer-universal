# Importador seguro

O comando abaixo faz clone temporário, identifica o commit, procura arquivos de licença/NOTICE, gera um registro em `provenance/` e classifica o componente. Por padrão, ele não copia código para dentro do monorepo.

```bash
pnpm kazer:import https://github.com/org/repository
```

A opção `--copy` não é uma aprovação jurídica automática. Mesmo com uma licença indicada, a saída permanece `review_required` e exige revisão humana da versão exata, dependências, copyright, NOTICE, marca, modelos e regras de redistribuição.

```bash
pnpm kazer:import https://github.com/org/repository --copy --license=MIT,Apache-2.0
```

O importador deliberadamente não baixa a internet inteira, não executa scripts do projeto importado e não remove arquivos. O próximo passo para produção é adicionar scanners de secrets, dependências e malware em ambiente isolado.
