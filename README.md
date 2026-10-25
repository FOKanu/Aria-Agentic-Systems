# Aria Agentics

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

For local Option C development, clone this repo and work in your IDE (Postgres + Ollama/vLLM local-first; no Lovable Cloud).

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up your local environment (fill in values locally, never commit .env).
cp .env.example .env

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## Project Structure

```
src/
├── core/           # Shared hooks, types, utils, providers
├── shell/          # App chrome, routing, context providers
├── features/       # Feature modules (chat, agents, dashboard, auth, etc.)
├── agent-engine/   # AI routing & model services
├── components/     # Shared UI components
├── pages/          # Page components
└── integrations/   # External integrations (Supabase)
```

## Hybrid AI Architecture

ARIA implements a robust **Hybrid AI Strategy** to balance privacy, cost, and accessibility:

1.  **Local First (Privacy Mode):**
    *   The app first attempts to connect to a local Ollama instance (`localhost:11434`).
    *   If available, all chat traffic stays on your machine.
    *   **Benefit:** 100% Privacy, Free, Offline capable.

2.  **Cloud Fallback (Zero Setup):**
    *   If Local AI is offline (default for new users), the app seamlessly switches to the **Supabase Edge Function**.
    *   This function routes requests to **Gemini 1.5 Flash**.
    *   **Benefit:** Works instantly without Docker/Ollama setup.

## How can I deploy this project?

Run `npm run build`, then deploy the `dist/` directory (and edge/API functions as needed).

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
