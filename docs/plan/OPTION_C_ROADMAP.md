# Option C roadmap

Option C: local-first desktop app. React/Vite frontend, FastAPI sidecar (`server/`, port 8001), local PostgreSQL 16, local LLM (Ollama/vLLM) and a Tauri 2 shell. Supabase and Lovable are removed.

Base: `integrate/option-c`. Each brief is one PR, or one PR per step where noted, from a `feat|fix|chore|test|docs/*` branch. Local Coder works audit-first. Nothing merges to `main` without Francis.

Reviewers: Adison on every PR. Zahir on anything that touches auth, secrets, CORS or backend endpoints.

## Audit baseline (`f4a6b5e`)

**Supabase**
- `supabase/` holds `config.toml` (`[functions.chat] verify_jwt=false`), `functions/chat/index.ts` and 5 migrations defining 12 tables.
- The Supabase client is used by:
  - `src/integrations/supabase/{client,types}.ts`
  - `src/hooks/{useAuth,useCalendarEvents,useEmailAccounts,useEmailAutomationRules,usePhoneConfigurations}.ts(x)`
  - `src/components/settings/ProviderConfigSection.tsx`
  - `src/core/providers/lovableCloud.ts`
  - In total there are 23 `.auth` / `.functions.invoke` / `.storage` call sites.

**Lovable**
- `src/agent-engine/services/lovableAI.ts` and `src/core/providers/lovableCloud.ts`.
- References in `agent-engine/lib/{router,streaming}.ts`, `agentChatRunner.ts`, `core/types/{ai.types,database}.ts` and `core/providers/types.ts`.
- `lovable-tagger` is removed in Brief 2.

**LLM**
- `src/lib/ai.ts` and `src/agent-engine/services/localModel.ts`.
- `docker-compose.yml` runs `ollama` bound to `11434:11434` on all interfaces.

**Sidecar (`server/`)**
- FastAPI with routers `filesystem` and `terminal`, and `security/{auth,sandbox,validator}.py`. Auth is a per-launch Bearer token.
- There is no DB code yet.
- Compiled `server/**/__pycache__/*.pyc` files are tracked in git.

**Packaging and CI**
- No Tauri, no `.github/workflows`.
- Lint has 17 errors on the base.

## Briefs

| # | Brief | Scope | Files touched | Acceptance gates | Depends on / parallel-safe |
|---|---|---|---|---|---|
| 2 | npm-only (PR #3) | Drop `bun.lockb` and `lovable-tagger`; pin npm and Node | `bun.lockb`, `.gitignore`, `package.json`, `package-lock.json`, `vite.config.ts` | `npm ci && npm run build` (lint is pre-existing red, see Brief 9) | none |
| 2b | untrack pycache | Remove committed `server/__pycache__`; ignore `__pycache__/` | `server/**/__pycache__/*`, `.gitignore` | `git ls-files \| grep pycache` is empty | after 2 (`.gitignore` overlap) |
| 3 | Postgres + Alembic baseline | See `brief-3-alembic.md` (final, D1–D7 approved). 9 steps, **one PR per step** into `integrate/option-c`, stacked. Includes the Ollama `127.0.0.1` bind in step 1. | `docker-compose.yml`, `.env.example`, `server/requirements.txt`, `server/alembic*`, `server/README.md` | upgrade→downgrade→upgrade on fresh `postgres:16`; ports bound to 127.0.0.1 only; `aria_app` cannot CREATE/DROP; token-without-`key_version` CHECK rejects the row; `pg_roles` empty after downgrade | after 2. Zahir reviews step 1, rev 0001 and rev 0005 |
| 3b | Sidecar data API | SQLAlchemy models, session as `aria_app`, CRUD routers for the 12 tables. `user_id` comes from the session, never the body. Binds to 127.0.0.1. | `server/models/*`, `server/db.py`, `server/routers/*`, `server/main.py` | pytest against Postgres; ownership tests; no CORS `*` | after 3. Zahir |
| 4 | React API client | Replace Supabase calls with a typed `src/lib/api/` client to the sidecar | `src/lib/api/*`, the 5 hooks above, `ProviderConfigSection.tsx`, `core/types/database.ts` | build green; no `@supabase/supabase-js` imports outside `src/integrations/` | after 3b. Hooks can be split across parallel PRs |
| 5 | Remove Supabase and Lovable | Delete `supabase/` (incl. the open `chat` fn), `src/integrations/supabase/`, `lovableCloud.ts`, `lovableAI.ts` and the dependency | the files above, `package.json`, lock, the router/types references | `rg -i 'supabase\|lovable' src supabase` is empty; build green | after 4 and 7 (`lovableAI` is replaced in 7) |
| 6 | Auth replacement + chat→tools→sidecar HITL | Local single-user session (D1) with the per-launch token from the Tauri shell. Chat calls tools through the sidecar with human-in-the-loop approval. Each tool call writes one row to `tool_call_events` (request_id, tool, latency_ms, success, human_interrupted) as a new Alembic revision after 0005. Damian adds the metrics addendum. | `useAuth.tsx`, `server/security/auth.py`, `server/routers/tools.py`, `server/alembic/versions/0006_*`, `agentChatRunner.ts` | token required on every route; one event row per tool call; interrupt path tested | after 3b. Zahir |
| 6b | Secret encryption | AES-GCM in the sidecar for the `*_encrypted` bytea columns plus `key_version`. Key held in Python `keyring`. Refuse to start on the `fail` or plaintext keyring backends. | `server/security/crypto.py`, `server/requirements.txt`, the email/phone routers | round-trip and tamper tests; startup refuses insecure backends | after 3b; parallel with 6. Zahir |
| 7 | LLM provider layer | One provider interface covering Ollama and vLLM (OpenAI-compatible); replaces `lovableAI.ts` | `src/agent-engine/services/*`, `src/lib/ai.ts`, `agent-engine/lib/router.ts`, `core/types/ai.types.ts` | unit tests with a mocked provider; streaming works against local Ollama | after 2; **parallel-safe** with 3/3b/6 |
| 8 | Tauri 2 shell (Windows + Linux) | `src-tauri/` that launches the sidecar, passes the per-launch token and runs the CSP | `src-tauri/**`, `package.json` scripts | `tauri build` succeeds on Linux and Windows; the app starts the sidecar | after 6; frontend work otherwise parallel |
| 9 | CI | GitHub Actions: `npm ci`, build, lint (first fix the 17 base errors), pytest, Alembic round-trip on a `postgres:16` service, Tauri matrix later | `.github/workflows/*`, lint fixes in `tailwind.config.ts` etc. | workflow green on the PR | parallel-safe any time. `.github/**` is forbidden to Local Coder, so the operator does it |

## Order

2 → 2b → 3 (steps 1…9, stacked PRs) → 3b → {4, 6, 6b} → 5 → 8. Briefs 7 and 9 run in parallel with everything.
