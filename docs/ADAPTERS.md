# Kazer LLM adapters

O Kazer Open Source Universal fornece três adapters de transporte para servidores de inferência compatíveis com OpenAI. Eles **não baixam pesos, não executam binários externos e não expõem chaves no navegador**. O operador deve provisionar o runtime, validar os pesos e fornecer apenas a URL e a configuração por ambiente.

## Adapters

| Adapter | Endpoint usado | Modelo padrão | Licença do runtime/modelo |
| --- | --- | --- | --- |
| `llama-cpp` | `BASE_URL/v1/chat/completions` e `BASE_URL/health` | `KAZER_LLAMA_CPP_MODEL` | llama.cpp é MIT; GGUF e LoRA continuam com a licença upstream |
| `qwen3` | `BASE_URL/v1/chat/completions` e `BASE_URL/v1/models` | `KAZER_QWEN3_MODEL` | Pesos Qwen3 declarados Apache-2.0; código do repositório e dependências exigem revisão separada |
| `deepseek-r1` | `BASE_URL/v1/chat/completions` e `BASE_URL/v1/models` | `deepseek-reasoner` | R1 original MIT; variantes destiladas preservam obrigações de Qwen/Llama |

## Configuração

Use variáveis de ambiente no servidor. Nunca faça commit de `.env`, tokens, pesos ou URLs internas expostas publicamente.

```bash
# llama.cpp: llama-server local ou privado
KAZER_LLAMA_CPP_BASE_URL=http://127.0.0.1:8080
KAZER_LLAMA_CPP_MODEL=your-gguf-alias
KAZER_LLAMA_CPP_API_KEY=optional-server-key

# Qwen3: vLLM, SGLang, Model Studio ou outro servidor autorizado
KAZER_QWEN3_BASE_URL=http://127.0.0.1:8000/v1
KAZER_QWEN3_MODEL=Qwen/Qwen3-8B
KAZER_QWEN3_API_KEY=optional-provider-key

# DeepSeek-R1: endpoint oficial ou deployment privado
KAZER_DEEPSEEK_R1_BASE_URL=https://api.deepseek.com
KAZER_DEEPSEEK_R1_MODEL=deepseek-reasoner
KAZER_DEEPSEEK_R1_API_KEY=secret
# DEEPSEEK_API_KEY também é aceito como alternativa server-side
```

O `BASE_URL` pode ser informado com ou sem `/v1`; o adapter acrescenta a rota esperada. Para `llama.cpp`, o health check consulta `/health` e depois `/v1/models`. Para Qwen3 e DeepSeek-R1, o adapter consulta `/v1/models` e marca `degraded` quando o modelo configurado não aparece. **Não existe fallback silencioso** para outro modelo.

## API

```http
GET /v1/adapters
GET /v1/adapters/llama-cpp/health
GET /v1/adapters/qwen3/health
GET /v1/adapters/deepseek-r1/health
POST /v1/adapters/:id/chat
```

Exemplo:

```json
{
  "messages": [{"role": "user", "content": "Olá"}],
  "max_tokens": 512,
  "temperature": 0.6,
  "stream": false
}
```

Quando o banco está configurado, o endpoint de chat exige `Authorization: Bearer <KAZER_API_KEY>`. O adapter limita mensagens a 100, saída a 8.192 tokens, timeout upstream a 30 segundos e respostas a 2 MB. Respostas de raciocínio (`reasoning_content`) são repassadas somente no formato upstream ao servidor e não são incluídas na UI por padrão.

## Segurança e operação

Execute `llama-server`, vLLM ou SGLang em processo/contêiner isolado, com bind privado, autenticação, TLS ou proxy privado, CORS restritivo, limites de concorrência e monitoramento. Não carregue GGUF, LoRA, checkpoints ou código remoto não verificados. Fixe revisões e hashes de modelos; modelo e runtime são supply-chain inputs.

Tool calls e argumentos produzidos pelo modelo são dados não confiáveis. O Kazer não executa ferramentas automaticamente neste adapter: qualquer camada futura de tools deve usar allowlist, JSON Schema, autorização, sandbox, limite de tempo e confirmação para efeitos destrutivos.

DeepSeek-R1 pode enviar `reasoning_content` e requer verificação do modelo servido. Qwen3 pode retornar raciocínio em campos não padronizados e possui modos thinking/non-thinking específicos. O Kazer preserva a identidade do modelo e não promete que todo servidor OpenAI-compatible tenha semântica idêntica; teste o checkpoint e runtime exatos antes de produção.

Consulte os documentos oficiais e mantenha notices correspondentes:

- [llama.cpp](https://github.com/ggml-org/llama.cpp) e [licença MIT](https://github.com/ggml-org/llama.cpp/blob/master/LICENSE)
- [Qwen3](https://github.com/QwenLM/Qwen3) e [model card Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- [DeepSeek-R1](https://github.com/deepseek-ai/DeepSeek-R1) e [API oficial](https://api-docs.deepseek.com/)
