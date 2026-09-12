const MAX_TEXT = 120_000;
const ALLOWED_HOSTS = new Set(["github.com", "www.github.com"]);

export type RepositoryInspection = {
  repository: string;
  canonicalUrl: string;
  safeMode: true;
  executedExternalCode: false;
  license: string;
  licenseSource: string | null;
  declaredSkills: string[];
  capabilities: string[];
  filesRead: string[];
  warnings: string[];
  summary: string;
};

function cleanText(value: string) {
  return value.replace(/\u0000/g, "").slice(0, MAX_TEXT);
}

function parseGithubRepository(input: string) {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("repository_url_invalid");
  }
  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) throw new Error("repository_host_not_allowed");
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) throw new Error("repository_path_invalid");
  const [owner, repo] = parts;
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) throw new Error("repository_path_invalid");
  return { owner, repo: repo.replace(/\.git$/, ""), canonicalUrl: `https://github.com/${owner}/${repo.replace(/\.git$/, "")}` };
}

async function readPublicFile(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(8_000), headers: { "user-agent": "Kazer-Repository-Intake/0.1" } });
  if (!response.ok) return null;
  return cleanText(await response.text());
}

function detectCapabilities(text: string) {
  const lower = text.toLowerCase();
  const checks: Array<[string, string[]]> = [
    ["agent", ["agent", "autonomous", "multi-agent"]],
    ["browser", ["browser", "playwright", "selenium"]],
    ["mcp", ["model context protocol", "mcp"]],
    ["chat", ["chat", "language model", "llm"]],
    ["reasoning", ["reasoning", "chain of thought"]],
    ["image", ["text-to-image", "image generation", "diffusion"]],
    ["video", ["text-to-video", "video generation"]],
    ["audio", ["audio", "speech"]],
    ["runtime", ["inference", "runtime", "openai-compatible"]],
  ];
  return checks.filter(([, terms]) => terms.some(term => lower.includes(term))).map(([name]) => name);
}

function detectSkills(text: string) {
  const lower = text.toLowerCase();
  const skills: Array<[string, string[]]> = [
    ["repository:read", ["repository", "github", "git"]],
    ["agent:plan", ["planning", "planner", "workflow"]],
    ["tools:use", ["tool use", "function calling", "tools"]],
    ["browser:control", ["browser", "playwright", "web automation"]],
    ["mcp:connect", ["mcp", "model context protocol"]],
    ["image:generate", ["image generation", "text-to-image", "diffusion"]],
    ["video:generate", ["video generation", "text-to-video"]],
    ["model:inference", ["inference", "model weights", "checkpoint"]],
    ["memory:persist", ["persistent memory", "long-term memory", "knowledge graph"]],
  ];
  return skills.filter(([, terms]) => terms.some(term => lower.includes(term))).map(([name]) => name);
}

function detectLicense(files: Array<[string, string | null]>) {
  const match = files.find(([, content]) => content && /permission is hereby granted|apache license|gnu general public license|mit license/i.test(content));
  if (!match) return { license: "unknown", source: null };
  const content = match[1] ?? "";
  if (/apache license/i.test(content)) return { license: "Apache-2.0 (declared text detected)", source: match[0] };
  if (/gnu general public license/i.test(content)) return { license: "GPL (declared text detected)", source: match[0] };
  if (/mit license|permission is hereby granted/i.test(content)) return { license: "MIT (declared text detected)", source: match[0] };
  return { license: "declared license (manual review required)", source: match[0] };
}

export async function inspectPublicRepository(input: string): Promise<RepositoryInspection> {
  const { owner, repo, canonicalUrl } = parseGithubRepository(input);
  const base = `https://raw.githubusercontent.com/${owner}/${repo}`;
  const candidates = [
    [`${base}/main/README.md`, "README.md"],
    [`${base}/master/README.md`, "README.md"],
    [`${base}/main/LICENSE`, "LICENSE"],
    [`${base}/main/LICENSE.txt`, "LICENSE.txt"],
    [`${base}/master/LICENSE`, "LICENSE"],
    [`${base}/master/LICENSE.txt`, "LICENSE.txt"],
    [`${base}/main/package.json`, "package.json"],
    [`${base}/main/pyproject.toml`, "pyproject.toml"],
  ] as const;
  const files: Array<[string, string | null]> = [];
  for (const [url, name] of candidates) {
    const content = await readPublicFile(url);
    if (content) files.push([url, content]);
  }
  const combined = files.map(([, content]) => content ?? "").join("\n");
  const license = detectLicense(files.filter(([url]) => /LICENSE/i.test(url)));
  const warnings = [
    "Somente arquivos públicos de texto foram lidos; nenhum código foi executado.",
    "Skills detectadas por sinais documentais são sugestões e exigem revisão humana antes de habilitar permissões.",
    "Modelos, pesos, dependências, APIs, marcas e serviços cloud podem ter licenças e termos diferentes do repositório.",
  ];
  if (files.length === 0) warnings.push("Não foi possível ler README/licença nas branches main ou master; revise o repositório manualmente.");
  return {
    repository: `${owner}/${repo}`,
    canonicalUrl,
    safeMode: true,
    executedExternalCode: false,
    license: license.license,
    licenseSource: license.source,
    declaredSkills: detectSkills(combined),
    capabilities: detectCapabilities(combined),
    filesRead: files.map(([url]) => url),
    warnings,
    summary: `Inspeção segura de ${owner}/${repo}: metadados públicos lidos sem executar código externo.`,
  };
}

export function isAllowedRepositoryUrl(input: string) {
  try {
    parseGithubRepository(input);
    return true;
  } catch {
    return false;
  }
}
