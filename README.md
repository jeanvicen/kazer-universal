# Kazer Open Source Universal

<p align="center">
  <img src="./assets/brand/kazer-sigil.png" width="96" alt="Kazer sigil" />
</p>

<h2 align="center">One API. One ecosystem.</h2>

<p align="center">
  <strong>A universal control plane for open-source models, agents, tools and the systems around them.</strong>
</p>

<p align="center">
  <a href="https://github.com/jeanvicen/kazer-universal">Repository</a> ·
  <a href="./docs/API.md">API reference</a> ·
  <a href="./SECURITY.md">Security</a> ·
  <a href="./CONTRIBUTING.md">Contributing</a>
</p>

![Build](https://github.com/jeanvicen/kazer-universal/actions/workflows/build.yml/badge.svg?branch=main)
![Tests](https://github.com/jeanvicen/kazer-universal/actions/workflows/test.yml/badge.svg?branch=main)
![Latest release](https://img.shields.io/github/v/release/jeanvicen/kazer-universal?display_name=tag&sort=semver)
![License](https://img.shields.io/badge/license-see%20LICENSE-111827)

![Kazer Open Source Universal — guardian hero](./assets/brand/kazer-hero-statue.jpg)

> **Kazer Open Source Universal** organizes AI capabilities, adapters, providers and skills behind a single, auditable interface. The project is designed to make open-source integration powerful without hiding ownership, licenses, provenance or operational boundaries.

## Why Kazer exists

The open-source AI ecosystem is moving quickly, but the integration surface is fragmented. Models, runtimes, agent tools, memory systems, image pipelines and provider APIs frequently expose different contracts and different assumptions about permissions, licensing and deployment.

Kazer creates a consistent layer between those projects and the product that uses them:

| Layer | What Kazer provides |
| --- | --- |
| **Discover** | A searchable registry of projects, tools and planned adapters. |
| **Compose** | Capability contracts for chat, reasoning, vision, image, agents, search, MCP and memory. |
| **Build** | Project creation, capability selection and API key generation through the API Builder. |
| **Govern** | License, provenance, credits and permission metadata attached to integrations. |
| **Operate** | Health, REST discovery, server-side chat, task status and OpenAI-compatible routing. |

## Product tour

The repository includes a dark, responsive web app for exploring the platform. It is available in **Portuguese, English and Spanish**, with the language selector exposed on desktop and mobile.

### Ecosystem Explorer

Search projects by name, description, source, capability or provenance. Combine filters for category, license, status and capability. Results preserve the upstream project name, source URL, license state and integration note so users can distinguish what is native, external, planned or awaiting review.

### API Builder

Authenticated users can create a development project, select capabilities and generate an API key. The secret is returned once and only its hash is persisted. The builder also provides the project base URL and a ready-to-copy cURL starting point.

### Playground and control plane

The app presents the routing model visually: a prompt enters through one surface, a provider route is selected, and the result is returned with status, task and latency context. The current product intentionally distinguishes working capabilities from capabilities that are still awaiting an authorized provider.

![Kazer guardian in the archive](./assets/brand/kazer-guardian-archive.jpg)

### Skills, registry and governance

Skills are catalogued separately from third-party projects. Registry entries carry category, capability, status, license, source, provenance and an explicit note about whether code has actually been imported. This prevents a public repository from implying ownership over external work.

The current registry also includes verified references for **OpenManus, OpenHands, Browser Use, LangGraph, MCP Servers, ComfyUI, FLUX, HiDream-I1, InvokeAI, Qwen3, DeepSeek-R1, gpt-oss, llama.cpp, Wan2.2 and LTX-Video/LTX-2**. Each entry keeps its upstream repository, authors, license source and legal caveats. `connected_adapter`, `adapter_available`, `linked_reference` and `review_required` are deliberately separate states. Official Kazer transport adapters are now available for llama.cpp, Qwen3 and DeepSeek-R1; operators connect their own authorized runtimes through server-side environment variables.

The **Safe Repository Intake** accepts a public GitHub URL and reads only text metadata such as README, license files and manifests. It suggests documented skills and capabilities for the Kazer catalog, but never clones, installs or executes external code. This lets an AI inspect a repository through the Kazer surface without granting it unrestricted permissions.

![Kazer guardian in orbit](./assets/brand/kazer-guardian-orbit.jpg)

## What works today

- Responsive dark web application with desktop and mobile layouts.
- PT/EN/ES language switcher for the main product experience.
- Ecosystem Explorer with text search, combined filters, result counts and empty states.
- Registry and skills catalog exposed through typed tRPC procedures.
- REST discovery endpoints for health, capabilities, registry and skills.
- Server-side chat through the configured LLM provider.
- OpenAI-compatible chat endpoint.
- Official adapter transport for llama.cpp, Qwen3 and DeepSeek-R1 with health checks and exact model identity validation.
- Adapter configuration with bounded request size, timeout, output tokens and server-side bearer credentials.
- API key authentication for execution routes when the database is configured.
- Project creation with environment and capability selection.
- Hashed API key persistence; plaintext secrets are returned only at creation time.
- Initial asynchronous task queue with task status and cancellation contracts.
- TypeScript, Python and Flutter SDK starting points.
- OpenAPI document, Dockerfile and Docker Compose configuration.
- Formal security, privacy, terms, model, open-source and third-party attribution policies.

## API quick start

After creating a project and API key in the app, use the key as a server-side secret:

```bash
export KAZER_API_KEY="kzr_your_secret_here"

curl http://localhost:3000/v1/chat \
  -H "Authorization: Bearer $KAZER_API_KEY" \
  -H "content-type: application/json" \
  -d '{"prompt":"Explain the Kazer control plane in one paragraph."}'
```

Public discovery endpoints do not require an API key:

```bash
curl http://localhost:3000/v1/health
curl http://localhost:3000/v1/capabilities
curl http://localhost:3000/v1/registry
curl http://localhost:3000/v1/skills
```

See [`docs/API.md`](./docs/API.md) for the current endpoint contract and [`docs/SDK.md`](./docs/SDK.md) for SDK examples.

See [`docs/ADAPTERS.md`](./docs/ADAPTERS.md) for adapter setup, upstream license boundaries, health checks and production security requirements.

Repository inspection is available through `POST /v1/repository/inspect` and the typed `platform.inspectRepository` procedure. The endpoint accepts only HTTPS GitHub repository URLs and returns evidence, warnings and a clear `executedExternalCode: false` marker.

## Architecture at a glance

```text
                         KAZER OPEN SOURCE UNIVERSAL
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
        Web application          API gateway              Registry
     search · skills · UI       REST · tRPC · auth     license · source · provenance
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      │
                         Capability contracts and routing
                                      │
             ┌────────────────────────┼────────────────────────┐
             │                        │                        │
          Chat / LLM              Tasks / queue          Future adapters
       configured provider       status and cancellation    vision · image · MCP
```

The current implementation is intentionally honest about its boundaries. Chat is wired server-side through the configured provider. Other capability routes return an explicit not-configured response until an authorized provider is connected; Kazer does not present planned integrations as completed features.

## Repository map

```text
client/       React application, Explorer, Playground and API Builder
server/       tRPC procedures, REST routes, auth and database helpers
drizzle/      MySQL/TiDB schema and migrations
registry/     Registry and skill contracts
provenance/   Provenance data and attribution records
plugins/      Plugin manifest schema and extension guidance
sdk/          TypeScript, Python and Flutter SDK starting points
core/         Capability and runtime contracts
docs/         API, SDK, operations, importer and reference documentation
security/     Security-related extension area
```

## Run locally

Requirements: Node.js 22, pnpm and a configured database for authenticated project/API-key flows.

```bash
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm build
```

The test suite covers authentication logout behavior, registry/skills contracts and REST discovery behavior. The build produces the frontend and server bundles used by the WebDev runtime.

## Open-source boundaries and attribution

Public visibility does not mean every file has the same license. Original Kazer materials and third-party projects remain separate. A component must not be imported until its source, version or commit, license, copyright, NOTICE, changes and adapter boundary are recorded.

Use `external` or `review_required` when incorporation has not been approved. Never infer that an open-source project, an open-weight model and a model runtime share the same license.

Read the project policies before contributing:

- [`LICENSE`](./LICENSE) · [`NOTICE`](./NOTICE) · [`LEGAL_NOTICE.md`](./LEGAL_NOTICE.md)
- [`OPEN_SOURCE_POLICY.md`](./OPEN_SOURCE_POLICY.md) · [`MODEL_POLICY.md`](./MODEL_POLICY.md)
- [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) · [`PROVENANCE.md`](./PROVENANCE.md)
- [`SECURITY.md`](./SECURITY.md) · [`PRIVACY.md`](./PRIVACY.md) · [`TERMS.md`](./TERMS.md)
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) · [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)

## Contributing

Contributions are welcome when they preserve clear ownership and safe boundaries. Start by opening an issue that describes the capability, upstream source, license, intended adapter boundary and security implications. Do not add credentials, copied provider code or unverified model weights.

The visual identity uses original Kazer artwork created for this project. The guardian images are product assets for the Kazer experience and should not be mistaken for third-party project attribution.

## Current limitations

The in-memory task queue loses jobs when the process restarts. Specialized workers, persistent agent memory, a production sandbox, broader MCP execution, advanced observability and complete import scanners require separate implementation phases and provider-specific review. The repository documents these limitations rather than hiding them.

## Maintainer

**Jean Vicence** maintains Kazer Open Source Universal.

- Instagram: [@jeanvicenc4](https://instagram.com/jeanvicenc4)
- Instagram: [@0neajx](https://instagram.com/0neajx)

---

<p align="center"><sub>One API · One ecosystem · Open source by design</sub></p>
