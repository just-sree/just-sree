# Brief: senior-technical copy for the portfolio

Status: approved by Sree, 2026-10-06 ("approve").

## Problem
The site's copy was deliberately plain. It was clear, but it undersold the engineering to the reader who matters most: a senior engineer screening the site after a recruiter forwards the link.

## Chosen direction
Rewrite the whole page in a precise engineering register: name the mechanism, state the result it produced or the failure it prevents, give the number, in full sentences. Keep rows short on the page and put depth behind a link for the three projects that are not client work.

## Non-goals
- No visual redesign, new projects or new claims.
- No new facts about EventLinx's system.
- No change to the resumes or their plain-language rules. This is website-only.
- No rewrite of the agent's answers.

## Constraints
- Every claim matches the candidate profile in the job-search repo.
- EventLinx panels use only what was already live, minus the timezone bug.
- Each on-page row stays within about two sentences and 30 words.
- No slogans and no em-dash asides.

## Open risks
- Jargon used loosely reads worse than plain English to this reader.
- The Hasten postmortem needs reasons the repository does not record.
- Hasten's accuracy figures are self-reported from an eval tool that was later removed.
- FutureCanada credit: some of Sree's code was committed under a teammate's identity.

## Success criteria
1. The hero headline is "Researching, building, and deploying AI for real-world problems." and the paragraph beneath names the agents, the guardrails, the vision and forecasting models, and the eval-gated releases.
2. Every project row names a mechanism and a result or prevented failure, in at most two sentences.
3. The WhatsApp panel's last row is "Model choice" (gpt-4.1-mini over gpt-5.4-nano, 35 of 36 against 25), and the timezone bug appears nowhere on the site.
4. No EventLinx fact appears that was not already live.
5. Hasten, BogdAI and FutureCanada each link to a write-up: postmortem, design doc and case study. The two EventLinx panels have no link.
6. Every technical term on the page traces to the candidate profile or a project dossier.
7. The About tile keeps the "business problem and a pile of data" idea in the new register.

## Decisions

| Question | Decision |
|---|---|
| Primary reader | Senior engineer screening the site |
| Register | Precise engineering, full sentences |
| EventLinx disclosure | Resume-level; add nothing new |
| Existing EventLinx facts | Keep the numbers, drop the timezone bug |
| WhatsApp panel last row | Measured model choice |
| Headline | Sree's own line; the mechanism-led statement is the supporting paragraph |
| Scope | Whole page, About included |
| Length | Short rows, longer write-ups behind a link |
| Which write-ups | Hasten, BogdAI, FutureCanada |
| Write-up formats | Postmortem, design doc, case study |
