import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Activity, ArrowUpRight, Boxes, BrainCircuit, CheckCircle2, ChevronRight, Copy,
  CircleDot, Code2, Command, Database, GitBranch, KeyRound, Layers3,
  LockKeyhole, Menu, Network, Plus, Search, ShieldCheck, Sparkles, X,
} from "lucide-react";

const nav = [
  { label: "Overview", icon: Activity },
  { label: "API Builder", icon: Command },
  { label: "Skills", icon: Sparkles },
  { label: "Registry", icon: Boxes },
  { label: "Providers", icon: Network },
  { label: "Tasks", icon: Layers3 },
  { label: "Security", icon: ShieldCheck },
];

const colors: Record<string, string> = {
  Core: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
  Governance: "bg-violet-400/10 text-violet-300 border-violet-400/20",
  Security: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  Extensions: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
};

function StatusDot({ status }: { status: string }) {
  const isGood = status === "operational" || status === "ready" || status === "core";
  return <span className={cn("inline-block h-2 w-2 rounded-full", isGood ? "bg-emerald-400" : "bg-amber-400")} />;
}

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [active, setActive] = useState("Overview");
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const registry = trpc.platform.registry.useQuery();
  const skills = trpc.platform.skills.useQuery();
  const health = trpc.platform.health.useQuery();
  const capabilities = trpc.platform.capabilities.useQuery();
  const projects = trpc.workspace.projects.useQuery(undefined, { retry: false });
  const createProject = trpc.workspace.createProject.useMutation({ onSuccess: () => projects.refetch() });
  const createApiKey = trpc.workspace.createApiKey.useMutation();
  const [projectDialog, setProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [createdProject, setCreatedProject] = useState<{ id: number; projectId: string; name: string } | null>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const filteredRegistry = useMemo(() => registry.data?.filter(item =>
    `${item.name} ${item.category} ${item.capability}`.toLowerCase().includes(query.toLowerCase())
  ) ?? [], [registry.data, query]);

  const select = (label: string) => { setActive(label); setMobileOpen(false); };
  const openProjectDialog = () => { setProjectDialog(true); setCreatedProject(null); setNewApiKey(null); setProjectName(""); };
  const submitProject = async () => {
    if (projectName.trim().length < 2) return;
    const result = await createProject.mutateAsync({ name: projectName.trim(), environment: "development", capabilities: capabilities.data?.map(item => item.id) ?? [] });
    setCreatedProject(result);
  };
  const issueApiKey = async () => {
    if (!createdProject) return;
    const result = await createApiKey.mutateAsync({ projectId: createdProject.id, label: "Default key" });
    setNewApiKey(result.secret);
  };

  return (
    <div className="min-h-screen bg-[#071014] text-slate-100 selection:bg-cyan-400/30">
      <aside className={cn("fixed inset-y-0 left-0 z-40 w-64 border-r border-white/8 bg-[#081419] p-5 transition-transform lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="mb-10 flex items-center justify-between px-2">
          <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300 text-[#061014] shadow-[0_0_24px_rgba(103,232,249,.25)]"><Sparkles className="h-5 w-5" /></div><div><div className="font-semibold tracking-tight">Kazer</div><div className="text-[10px] uppercase tracking-[.22em] text-slate-500">Universal</div></div></div>
          <button className="lg:hidden text-slate-400" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <div className="mb-3 px-2 text-[10px] font-medium uppercase tracking-[.2em] text-slate-600">Workspace</div>
        <nav className="space-y-1">
          {nav.map(({ label, icon: Icon }) => <button key={label} onClick={() => select(label)} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors", active === label ? "bg-cyan-300/10 text-cyan-200" : "text-slate-400 hover:bg-white/5 hover:text-slate-200")}><Icon className="h-4 w-4" />{label}{label === "Skills" && <Badge className="ml-auto border-0 bg-cyan-300/15 px-1.5 text-[10px] text-cyan-300">4</Badge>}</button>)}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/8 bg-white/[.025] p-3"><div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300"><LockKeyhole className="h-3.5 w-3.5 text-emerald-400" /> Public workspace</div><p className="text-[11px] leading-relaxed text-slate-500">Contribuições são bem-vindas. Licenças e créditos continuam separados e visíveis.</p></div>
      </aside>

      <main className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/8 bg-[#071014]/90 px-4 backdrop-blur-xl sm:px-8"><div className="flex items-center gap-3"><button className="lg:hidden text-slate-400" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button><div className="text-sm text-slate-500">Workspace / <span className="text-slate-200">{active}</span></div></div><div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-lg border border-white/8 bg-white/[.03] px-3 py-1.5 text-xs text-slate-500 sm:flex"><Search className="h-3.5 w-3.5" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar registry..." className="w-32 bg-transparent outline-none placeholder:text-slate-600" /></div>{isAuthenticated ? <Button variant="ghost" size="sm" onClick={() => logout()} className="text-xs text-slate-400 hover:bg-white/5 hover:text-white">Sair</Button> : <Button size="sm" onClick={() => startLogin()} className="bg-cyan-300 text-[#061014] hover:bg-cyan-200">Entrar</Button>}<div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-cyan-300 to-violet-400 text-xs font-bold text-[#071014]">{user?.name?.[0] ?? "K"}</div></div></header>

        <div className="mx-auto max-w-7xl p-4 sm:p-8">
          {active !== "Overview" && <Card className="mb-8 border-cyan-300/15 bg-cyan-300/[.035] shadow-none"><CardHeader className="border-b border-white/8 px-5 py-4"><div className="flex items-center justify-between"><div><CardTitle className="text-base text-slate-100">{active}</CardTitle><p className="mt-1 text-xs text-slate-500">Área funcional do control plane</p></div><Badge className="border-0 bg-cyan-300/10 text-cyan-300">MVP</Badge></div></CardHeader><CardContent className="p-5">
            {active === "Skills" && <div className="grid gap-3 md:grid-cols-2">{skills.data?.map(skill => <div key={skill.id} className="rounded-xl border border-white/8 bg-black/10 p-4"><div className="flex items-start justify-between gap-3"><div><div className="font-medium text-slate-200">{skill.name}</div><div className="mt-1 text-xs leading-relaxed text-slate-500">{skill.summary}</div></div><StatusDot status={skill.status} /></div><div className="mt-4 flex flex-wrap gap-1.5">{skill.permissions.map(permission => <Badge key={permission} variant="outline" className="border-white/10 text-[10px] text-slate-500">{permission}</Badge>)}</div></div>)}</div>}
            {active === "Registry" && <div className="space-y-3">{filteredRegistry.map(item => <div key={item.id} className="rounded-xl border border-white/8 bg-black/10 p-4"><div className="flex flex-wrap items-center gap-2"><span className="font-medium text-slate-200">{item.name}</span><Badge variant="outline" className="border-white/10 text-[10px] text-slate-500">{item.status.replace("_", " ")}</Badge></div><p className="mt-2 text-xs text-slate-500">{item.provenance}</p><div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-600"><span>{item.license}</span><span>{item.source}</span></div></div>)}</div>}
            {active === "API Builder" && <div className="grid gap-5 md:grid-cols-[1fr_1fr]"><div><div className="mb-3 text-sm font-medium text-slate-200">Capabilities disponíveis</div><div className="flex flex-wrap gap-2">{capabilities.data?.map(capability => <Badge key={capability.id} className="border border-cyan-300/15 bg-cyan-300/10 text-cyan-200">{capability.label}</Badge>)}</div></div><div className="rounded-xl border border-white/8 bg-black/20 p-4 font-mono text-xs leading-relaxed text-slate-400"><span className="text-violet-300">const</span> kazer = <span className="text-cyan-300">new Kazer</span>({'{'}<br />&nbsp;&nbsp;apiKey: process.env.KAZER_API_KEY<br />{'}'});<br /><br /><span className="text-violet-300">await</span> kazer.capabilities();</div></div>}
            {active === "Security" && <div className="grid gap-3 md:grid-cols-3"><div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[.04] p-4"><ShieldCheck className="mb-3 h-5 w-5 text-emerald-300" /><div className="text-sm text-slate-200">Secrets</div><div className="mt-1 text-xs text-slate-500">API keys são armazenadas apenas por hash no backend.</div></div><div className="rounded-xl border border-amber-400/15 bg-amber-400/[.04] p-4"><LockKeyhole className="mb-3 h-5 w-5 text-amber-300" /><div className="text-sm text-slate-200">Permissões</div><div className="mt-1 text-xs text-slate-500">Skills declaram permissões antes de executar.</div></div><div className="rounded-xl border border-violet-400/15 bg-violet-400/[.04] p-4"><GitBranch className="mb-3 h-5 w-5 text-violet-300" /><div className="text-sm text-slate-200">Proveniência</div><div className="mt-1 text-xs text-slate-500">Terceiros ficam em revisão até validação.</div></div></div>}
            {(active === "Providers" || active === "Tasks") && <div className="rounded-xl border border-white/8 bg-black/10 p-5 text-sm text-slate-400">Esta área já possui contrato e status no backend, mas ainda não há provider ou worker real habilitado. O sistema mostra essa limitação explicitamente para não criar uma falsa impressão de capacidade.</div>}
          </CardContent></Card>}
          <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[.2em] text-cyan-300"><CircleDot className="h-3 w-3" /> Control plane</div><h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">One API. <span className="text-slate-500">One ecosystem.</span></h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">Uma camada segura para organizar capacidades de IA, conectar providers e evoluir suas skills sem perder controle de licenças ou proveniência.</p></div><Button onClick={openProjectDialog} className="w-fit gap-2 bg-cyan-300 text-[#061014] hover:bg-cyan-200"><Plus className="h-4 w-4" /> Criar projeto</Button></section>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card className="border-white/8 bg-white/[.035] shadow-none"><CardContent className="p-5"><div className="mb-5 flex items-center justify-between"><span className="text-xs text-slate-500">API status</span><StatusDot status="operational" /></div><div className="text-2xl font-semibold">Operational</div><div className="mt-1 text-xs text-slate-500">Última verificação agora</div></CardContent></Card><Card className="border-white/8 bg-white/[.035] shadow-none"><CardContent className="p-5"><div className="mb-5 flex items-center justify-between"><span className="text-xs text-slate-500">Capabilities</span><BrainCircuit className="h-4 w-4 text-violet-300" /></div><div className="text-2xl font-semibold">{capabilities.data?.length ?? 8}</div><div className="mt-1 text-xs text-slate-500">Contratos disponíveis</div></CardContent></Card><Card className="border-white/8 bg-white/[.035] shadow-none"><CardContent className="p-5"><div className="mb-5 flex items-center justify-between"><span className="text-xs text-slate-500">Skills</span><Sparkles className="h-4 w-4 text-cyan-300" /></div><div className="text-2xl font-semibold">{skills.data?.length ?? 4}</div><div className="mt-1 text-xs text-slate-500">Extensões catalogadas</div></CardContent></Card><Card className="border-white/8 bg-white/[.035] shadow-none"><CardContent className="p-5"><div className="mb-5 flex items-center justify-between"><span className="text-xs text-slate-500">Registry review</span><ShieldCheck className="h-4 w-4 text-amber-300" /></div><div className="text-2xl font-semibold">{registry.data?.filter(x => x.status === "review_required").length ?? 1}</div><div className="mt-1 text-xs text-slate-500">Itens aguardando validação</div></CardContent></Card></div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]"><Card className="border-white/8 bg-white/[.035] shadow-none"><CardHeader className="flex-row items-center justify-between border-b border-white/8 px-5 py-4"><div><CardTitle className="text-base text-slate-100">Registry & provenance</CardTitle><p className="mt-1 text-xs text-slate-500">Nada entra no Core sem status, licença e origem</p></div><Button variant="ghost" size="sm" onClick={() => select("Registry")} className="gap-1 text-xs text-cyan-300 hover:bg-cyan-300/10 hover:text-cyan-200">Ver tudo <ArrowUpRight className="h-3.5 w-3.5" /></Button></CardHeader><ScrollArea className="h-[330px]"><CardContent className="p-0">{filteredRegistry.map(item => <div key={item.id} className="flex items-start gap-4 border-b border-white/6 px-5 py-4 last:border-0"><div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5"><GitBranch className="h-4 w-4 text-slate-400" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium text-slate-200">{item.name}</span><Badge variant="outline" className="border-white/10 text-[10px] text-slate-500">{item.category}</Badge></div><p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p><div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-600"><span className="flex items-center gap-1"><StatusDot status={item.status} /> {item.status.replace("_", " ")}</span><span>{item.license}</span></div></div><ChevronRight className="mt-2 h-4 w-4 text-slate-700" /></div>)}</CardContent></ScrollArea></Card>

            <Card className="border-white/8 bg-white/[.035] shadow-none"><CardHeader className="border-b border-white/8 px-5 py-4"><div className="flex items-center justify-between"><div><CardTitle className="text-base text-slate-100">Skills</CardTitle><p className="mt-1 text-xs text-slate-500">Extensões prontas para crescer</p></div><Button variant="outline" size="icon" onClick={() => select("Skills")} className="h-8 w-8 border-white/10 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white"><Plus className="h-4 w-4" /></Button></div></CardHeader><CardContent className="space-y-3 p-5">{skills.data?.map(skill => <button key={skill.id} onClick={() => select("Skills")} className="group flex w-full items-center gap-3 text-left"><div className={cn("grid h-8 w-8 place-items-center rounded-lg border", colors[skill.category] ?? "border-white/10 bg-white/5 text-slate-400")}><Sparkles className="h-3.5 w-3.5" /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="truncate text-sm text-slate-300 group-hover:text-cyan-200">{skill.name}</span><StatusDot status={skill.status} /></div><div className="truncate text-[11px] text-slate-600">{skill.summary}</div></div><ArrowUpRight className="h-3.5 w-3.5 text-slate-700 group-hover:text-cyan-300" /></button>)}</CardContent></Card></div>

          <section className="mt-6 grid gap-4 md:grid-cols-3"><Card className="border-white/8 bg-gradient-to-br from-cyan-300/10 to-transparent shadow-none"><CardContent className="p-5"><Code2 className="mb-5 h-5 w-5 text-cyan-300" /><h3 className="font-medium text-slate-100">API Builder</h3><p className="mt-2 text-xs leading-relaxed text-slate-500">Defina capabilities, permissões e limites em um único projeto.</p><button onClick={() => select("API Builder")} className="mt-4 flex items-center gap-1 text-xs text-cyan-300">Configurar <ChevronRight className="h-3.5 w-3.5" /></button></CardContent></Card><Card className="border-white/8 bg-gradient-to-br from-violet-300/10 to-transparent shadow-none"><CardContent className="p-5"><KeyRound className="mb-5 h-5 w-5 text-violet-300" /><h3 className="font-medium text-slate-100">Chaves seguras</h3><p className="mt-2 text-xs leading-relaxed text-slate-500">Acesso por projeto, sem segredos expostos no cliente.</p><button onClick={() => select("Security")} className="mt-4 flex items-center gap-1 text-xs text-violet-300">Revisar segurança <ChevronRight className="h-3.5 w-3.5" /></button></CardContent></Card><Card className="border-white/8 bg-gradient-to-br from-amber-300/10 to-transparent shadow-none"><CardContent className="p-5"><Database className="mb-5 h-5 w-5 text-amber-300" /><h3 className="font-medium text-slate-100">Proveniência</h3><p className="mt-2 text-xs leading-relaxed text-slate-500">Registro explícito de origem, versão, commit e alterações.</p><button onClick={() => select("Registry")} className="mt-4 flex items-center gap-1 text-xs text-amber-300">Abrir registry <ChevronRight className="h-3.5 w-3.5" /></button></CardContent></Card></section>

          <footer className="mt-10 flex flex-col justify-between gap-3 border-t border-white/8 pt-5 text-[11px] text-slate-600 sm:flex-row"><span>Kazer Universal · public workspace · v0.1.0</span><span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Licenças e atribuições são tratadas separadamente</span></footer>
        </div>
        <Dialog open={projectDialog} onOpenChange={setProjectDialog}>
          <DialogContent className="border-white/10 bg-[#0b1a20] text-slate-100 sm:max-w-md">
            <DialogHeader><DialogTitle>{createdProject ? "Projeto criado" : "Criar projeto Kazer"}</DialogTitle><DialogDescription className="text-slate-500">{createdProject ? "Agora gere uma API key. O segredo será mostrado somente uma vez." : "O projeto começa em development com as capabilities declaradas pelo Core."}</DialogDescription></DialogHeader>
            {!createdProject ? <div className="space-y-3"><label className="text-xs text-slate-400">Nome do projeto</label><Input value={projectName} onChange={event => setProjectName(event.target.value)} placeholder="Meu aplicativo" className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-600" /><p className="text-[11px] text-slate-600">Projetos e chaves exigem login. Nenhum segredo é colocado no navegador antes da criação.</p></div> : <div className="space-y-4"><div className="rounded-lg border border-white/8 bg-black/20 p-3"><div className="text-[10px] uppercase tracking-wider text-slate-600">Project ID</div><div className="mt-1 font-mono text-sm text-cyan-200">{createdProject.projectId}</div></div>{newApiKey ? <div className="rounded-lg border border-amber-300/20 bg-amber-300/[.06] p-3"><div className="text-[10px] uppercase tracking-wider text-amber-300">Copie agora — não será exibida novamente</div><div className="mt-2 flex items-center gap-2"><code className="min-w-0 flex-1 break-all text-xs text-slate-200">{newApiKey}</code><Button size="icon" variant="outline" onClick={() => navigator.clipboard.writeText(newApiKey)} className="h-8 w-8 shrink-0 border-white/10 bg-transparent"><Copy className="h-3.5 w-3.5" /></Button></div></div> : <Button onClick={issueApiKey} disabled={createApiKey.isPending} className="w-full bg-cyan-300 text-[#061014] hover:bg-cyan-200">{createApiKey.isPending ? "Gerando..." : "Gerar API key"}</Button>}</div>}
            <DialogFooter><Button variant="ghost" onClick={() => setProjectDialog(false)} className="text-slate-400 hover:bg-white/5 hover:text-white">Fechar</Button>{!createdProject && <Button onClick={submitProject} disabled={createProject.isPending || projectName.trim().length < 2} className="bg-cyan-300 text-[#061014] hover:bg-cyan-200">{createProject.isPending ? "Criando..." : "Criar projeto"}</Button>}</DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
