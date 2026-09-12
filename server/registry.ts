export type RegistryStatus = "core" | "adapter" | "external" | "review_required";

export type RegistryItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  capability: string;
  status: RegistryStatus;
  license: string;
  source: string;
  provenance: string;
  note: string;
};

export type Skill = {
  id: string;
  name: string;
  summary: string;
  category: string;
  version: string;
  status: "ready" | "planned" | "review";
  permissions: string[];
  license: string;
};

export const capabilities = [
  { id: "chat", label: "Chat", description: "Texto e conversas" },
  { id: "reasoning", label: "Reasoning", description: "Análise estruturada" },
  { id: "vision", label: "Vision", description: "Imagens e documentos" },
  { id: "image", label: "Image", description: "Geração visual" },
  { id: "agent", label: "Agents", description: "Tarefas com ferramentas" },
  { id: "search", label: "Search", description: "Pesquisa com fontes" },
  { id: "mcp", label: "MCP", description: "Ferramentas conectáveis" },
  { id: "memory", label: "Memory", description: "Memória controlável" },
] as const;

export const registryItems: RegistryItem[] = [
  {
    id: "kazer-core",
    name: "Kazer Core",
    category: "Platform",
    description: "Interfaces, roteamento e contratos internos da plataforma.",
    capability: "orchestration",
    status: "core",
    license: "Proprietary / Kazer",
    source: "Kazer Universal",
    provenance: "Código original do projeto; versão inicial.",
    note: "Camada própria. Não representa propriedade sobre projetos de terceiros.",
  },
  {
    id: "llama-cpp",
    name: "llama.cpp",
    category: "LLM runtime",
    description: "Runtime local avaliado para inferência eficiente.",
    capability: "chat",
    status: "review_required",
    license: "A confirmar no commit importado",
    source: "https://github.com/ggml-org/llama.cpp",
    provenance: "Somente referência registrada; nenhum código foi copiado nesta versão.",
    note: "A incorporação só deve ocorrer após revisão de licença, avisos e dependências.",
  },
  {
    id: "comfyui",
    name: "ComfyUI",
    category: "Image",
    description: "Pipeline visual considerado para futuros adapters de imagem.",
    capability: "image",
    status: "external",
    license: "A confirmar antes de redistribuir",
    source: "https://github.com/comfyanonymous/ComfyUI",
    provenance: "Integração externa planejada; não incluída no repositório.",
    note: "Providers externos ficam isolados até validação jurídica e técnica.",
  },
];

export const skills: Skill[] = [
  {
    id: "safe-chat",
    name: "Safe Chat",
    summary: "Respostas textuais com validação de entrada e limites de uso.",
    category: "Core",
    version: "0.1.0",
    status: "ready",
    permissions: ["chat"],
    license: "Proprietary / Kazer",
  },
  {
    id: "license-review",
    name: "License Review",
    summary: "Checklist para classificar componentes antes de importar código ou pesos.",
    category: "Governance",
    version: "0.1.0",
    status: "ready",
    permissions: ["registry:read", "provenance:write"],
    license: "Proprietary / Kazer",
  },
  {
    id: "agent-sandbox",
    name: "Agent Sandbox",
    summary: "Contrato de permissões para ferramentas de agentes, sem acesso irrestrito.",
    category: "Security",
    version: "0.1.0",
    status: "planned",
    permissions: ["tasks:run", "filesystem:scoped"],
    license: "Proprietary / Kazer",
  },
  {
    id: "provider-adapter",
    name: "Provider Adapter",
    summary: "Modelo de extensão para conectar providers sem alterar o Core.",
    category: "Extensions",
    version: "0.1.0",
    status: "review",
    permissions: ["provider:register", "capabilities:declare"],
    license: "Proprietary / Kazer",
  },
];

export const platformHealth = {
  api: "operational",
  router: "operational",
  registry: "operational",
  workers: "planned",
  providers: "review",
} as const;
