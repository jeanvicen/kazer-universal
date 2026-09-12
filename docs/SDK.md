# SDKs e compatibilidade

## TypeScript

```ts
import Kazer from './sdk/typescript/kazer';
const kazer = new Kazer({ baseURL: 'https://api.example.com', apiKey: process.env.KAZER_API_KEY });
const answer = await kazer.chat('Explique inteligência artificial.');
```

## Python

```python
from sdk.python.kazer import Kazer
kazer = Kazer(api_key='...', base_url='https://api.example.com')
answer = kazer.chat(prompt='Explique inteligência artificial.')
```

## Flutter

O arquivo `sdk/flutter/lib/kazer.dart` fornece chat, capabilities, registry e skills. A aplicação Flutter deve adicionar o pacote HTTP no próprio `pubspec.yaml` antes de compilar.

## OpenAI-compatible

Use `POST /v1/chat/completions` com o formato de mensagens conhecido por clientes OpenAI. O endpoint devolve a estrutura de completion do provider configurado. Autenticação e rate limit de produção ainda precisam ser finalizados antes de oferecer o endpoint publicamente.
