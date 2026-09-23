# Sree — portfolio, terminal edition

A standalone Node 22 app with no install step: a single-page portfolio styled as a terminal session (intro, projects, experience, contact), project notes, and a custom portfolio-agent interface. No animation libraries are loaded; fonts come from Google Fonts with system fallbacks. Identity and motion rules are in `BRAND.md`.

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

- `public/index.html`: page copy and dialogs. The page is complete without JavaScript; scripts add only project notes and the agent.
- `public/style.css`: colour tokens, single-column monospace layout, terminal-style dialogs, mobile layout.
- `public/mark.svg`: the S mark, used in the header and as the favicon.
- `ai-config.mjs`: server-only Foundry/OpenAI configuration.
- `http-app.mjs`: shared local and Vercel request handler.
- `public/projects.json`: curated project evidence shared by the UI and agent.
- `public/shell.js`: the command line at the end of the page.
- `public/aquarium.js`, `public/portrait.js`: the background aquarium and the ASCII headshot.
- `public/og.png`: the link preview card.
- `public/app.js`: navigation, architecture trace, project notes, chat, and keyboard behavior.
- `agent.mjs`: approved knowledge, preview responses, provider integration, and response validation.
- `job-match.mjs`: checks a pasted job description against the approved knowledge (model-backed when connected, keyword preview otherwise).

`Ctrl/Cmd + K` opens the agent. Native dialogs provide keyboard focus containment and Escape dismissal. The cursor animation stops under reduced motion.

## Analytics

`public/app.js` loads Vercel Web Analytics on the deployed site only. It counts page views without cookies or personal data, from the site's own domain (`/_vercel/insights`), so the Content Security Policy is unchanged. It records nothing until Analytics is enabled in the Vercel project (Project → Analytics → Enable).

## Content provenance

The September 2026 content pass uses the owner's approved project list, public GitHub metadata and selected READMEs, the supplied resume for the IRCC capstone and career details, and the BogdAI README for the Microsoft Agents League Hackathon 2026 pipeline. The border-traffic anomaly study is a separate supporting project; it is not used as a source for the IRCC capstone.

All figures on the page come from the supplied resume and the approved project list. `public/projects.json` is the approved catalogue shared with the agent. `scope.mjs` intercepts excluded topics before provider calls and checks responses; no excluded project details are part of the knowledge context.

Run `npm run check` and `npm test` before deployment. Changes to the profile README and portfolio are deployed from the same repository.
