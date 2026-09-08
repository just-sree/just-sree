# Vercel + Azure AI Foundry

Deploy this directory: D:\Portfolio\just-sree\portfolio. Do not deploy the parent Portfolio directory, which contains unrelated private projects.

## Foundry environment

For a fresh checkout, copy .env.example to .env and fill these in locally, then restart npm run dev:

    AI_PROVIDER=azure
    AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE.openai.azure.com/
    AZURE_OPENAI_API_KEY=your-resource-key
    AZURE_OPENAI_DEPLOYMENT=your-deployment-name

The endpoint can also use the services.ai.azure.com host, with or without /openai/v1/. Supply a Foundry resource endpoint, not a project endpoint or Agent Service ID. The deployment must support Responses API and strict JSON-schema structured outputs. The deployment name is passed as the model; no api-version variable is required for v1.

All three Azure values blank keeps the curated preview. A partial configuration is reported as unavailable rather than silently using a different provider. The public status endpoint returns only mode and provider, never credentials, endpoint, or deployment name.

The key is read server-side and sent to Azure in the api-key header. Browser requests only go to this site's /api/agent. The direct OpenAI alternative remains available with AI_PROVIDER=openai, OPENAI_API_KEY, and OPENAI_MODEL.

## Deploy

This app uses public/ for static assets and api/agent.js and api/status.js for Node 22 Vercel Functions. vercel.json sets the output directory, a 60-second function duration, project JSON inclusion, and security headers. No framework or dependency install is needed by the app. The build runs npm run check.

From this directory:

    npx vercel login
    npx vercel

Choose your account/team and a new or existing portfolio project. Preview can be deployed before adding Foundry credentials.

In the linked Vercel project's Settings > Environment Variables, add AI_PROVIDER and the three Azure variables above. Select Production and, if desired, Preview. Mark the API key sensitive. These variables do not use any public/client prefix. Do not upload .env: it is excluded by .gitignore and .vercelignore.

Deploy production after setting the variables:

    npx vercel --prod

Vercel environment changes apply to new deployments. Local .env values are not automatically transferred to Vercel. HOST and PORT are local-only and should not be added to Vercel.

For Git-based deployment, import a repository containing this app, choose Other as the framework, and set the root to the directory containing vercel.json.

## Verification and operating limits

Run npm test and npm run check. After deployment, check the home page, /api/status, project notes, and a real agent question. Status "live" means credentials are configured; it is not a provider health check. The current tests mock Azure requests. Live authentication, model support, latency, and answer quality must be verified with the supplied deployment.

The existing 15 requests/minute/IP limiter is per function instance and resets on cold starts. It is not a global cost limit. Use a Vercel Firewall rate-limit rule for POST /api/agent or a shared limiter when exposing a paid model publicly, and set the Azure deployment's quota to match the intended traffic.

The agent does not send emails, book meetings, or execute project code. Briefs are visitor-editable downloads. The supplied two-page resume is served unchanged at /resume.pdf.

## References

- Azure Responses API and key authentication: https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/responses
- Vercel Node runtime: https://vercel.com/docs/functions/runtimes/node-js
- Vercel configuration: https://vercel.com/docs/project-configuration/vercel-json
- Vercel environment variables: https://vercel.com/docs/environment-variables

## Connected repository

Vercel project: just-sree (just-srees-projects). Connected GitHub repository: https://github.com/just-sree/just-sree. Project root: portfolio. Production branch: master. Intended domain: https://just-sree.vercel.app.

The Vercel CLI link is stored at the repository root. Run deployment commands from D:\Portfolio\just-sree so the configured portfolio root resolves correctly. The site directory contains no committed credentials.
