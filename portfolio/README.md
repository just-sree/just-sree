# Sree — portfolio, first working version

A standalone, dependency-free Node 22 app with a minimal forest-green and warm-paper portfolio with animated bamboo, scroll-driven architecture storytelling, project notes, and a custom portfolio-agent interface. The original S emblem and full generation prompt are documented in `BRAND.md`.

## Run

```powershell
cd D:\Portfolio\just-sree\portfolio
npm run dev
```

Open http://127.0.0.1:4173. No install step is required. The server binds to loopback by default. It serves only explicitly allowed public assets and the home page; source files and environment configuration are not publicly served.

## Connect the agent

Copy `.env.example` to `.env` for local Foundry development. Set `AI_PROVIDER=azure` and fill `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, and `AZURE_OPENAI_DEPLOYMENT`, then restart the server. The resource endpoint is normalized to `/openai/v1/responses`; use the deployment name rather than assuming it matches the model name. See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel setup. Keep the key server-side; never put it in public files.

The implementation uses the [Azure OpenAI Responses API](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/responses) with strict structured outputs. Direct OpenAI remains an optional provider. Replies contain plain text plus a validated project identifier and optional contact-link flag. Project navigation requires a visitor click. There is no shell execution, calendar booking, or outbound messaging tool.

Without credentials, the panel is explicitly labelled as a **local preview with curated replies**. Preview routing is deterministic, with basic named-project followups, source-linked comparisons, and editable collaboration briefs. It does not pretend to be live AI. With a provider connected, the last ten messages are sent as context; conversations are kept in browser memory only, and provider requests set `store: false`. The UI discloses the provider transmission. Provider failures remain errors rather than silently switching to scripted replies.

Vercel deployment is configured in `vercel.json` with two Node function entries in `api/`. The current IP limiter is per instance, not a global cost limit; use a Vercel Firewall rule or shared limiter for public model traffic. See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment and environment setup. Live provider connectivity and answer quality require validation with the supplied resource.

## Edit content

- `public/index.html`: page copy and project illustrations.
- `public/style.css`: responsive design, motion, typography, and dialog styling.
- `public/scroll.css`: forest-green identity, minimal layout, project chapters, and responsive scroll presentation.
- `public/bamboo-logo.png`: original generated bamboo S emblem, also used as the favicon.
- `public/bamboo.js`: decorative bamboo canvas with reduced-motion and offscreen handling.
- `ai-config.mjs`: server-only Foundry/OpenAI configuration.
- `http-app.mjs`: shared local and Vercel request handler.
- `public/projects.json`: curated project evidence shared by the UI and agent.
- `public/app.js`: navigation, architecture trace, project notes, chat, and keyboard behavior.
- `agent.mjs`: approved knowledge, preview responses, provider integration, and response validation.

`Ctrl/Cmd + K` opens the agent. Native dialogs provide keyboard focus containment and Escape dismissal. The layout respects reduced motion. Google Fonts are optional; system font fallbacks are included.

## Content provenance and review items

Project content was drafted from local repository READMEs on September 8, 2026:

- `D:\Portfolio\just-sree\README.md`: name, public profile links, and email.
- `D:\Portfolio\Personal Projects\public repos\agent-preflight\README.md`: local action validation and its limited scope.
- `D:\Portfolio\Personal Projects\Hackathon\BogdAI\bogdai-contract-risk-agent\README.md`: synthetic contract pipeline and team repository. Sree's exact individual contribution is not confirmed.
- `D:\Portfolio\Personal Projects\hasten-quality\README.md`: quality tooling and explicit distinction that the app's text engine is rule-based.
- `D:\Portfolio\Personal Projects\public repos\ocr-proofkit\README.md` and `quota-journal\README.md`: initialization-stage projects.

Review project selection, individual contributions, and current project stages with Sree before publishing. No commercial outcomes, customers, performance metrics, or employment history are invented. Project visuals and the hero trace are labelled illustrations, not current runtime evidence.

## Validate

```powershell
npm run check
npm test
```

Tests cover request validation, unknown-question handling, provider request/response contracts, provider failure behavior, static-file restrictions, origin checks, body limits, and rate limiting. Provider tests use mocks and do not consume API credit.
