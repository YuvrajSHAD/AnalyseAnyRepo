# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    # ContextHub (contexthub)

    Context-aware developer UI that surfaces repository files, PRs, and integrates with the Tambo AI provider.

    This README explains how to set up the project locally, required environment variables / tokens, and how to upload the repository to your GitHub account.

    ---

    ## Prerequisites

    - Node.js 18+ (LTS recommended)
    - npm (comes with Node.js) or an alternative package manager
    - Git
    - A Tambo API key (required) — obtain from your Tambo account
    - A GitHub Personal Access Token (recommended) if you need private repo access or to avoid low unauthenticated rate limits

    ---

    ## Quick start (local)

    1. Clone or copy the repo to your machine.

    2. Install dependencies:

    ```bash
    npm install
    ```

    3. Create an environment file at the project root called `.env.local` and add the required keys (do NOT commit this file):

    ```env
    # Required: Tambo API key
    VITE_TAMBO_API_KEY=your_tambo_api_key_here

    # Recommended: GitHub Personal Access Token (to avoid low rate limits and to access private repos)
    VITE_GITHUB_TOKEN=ghp_... (or github_pat_...)
    ```

    4. Start the dev server:

    ```bash
    npm run dev
    ```

    Open the URL shown in the terminal (usually http://localhost:5173).

    ---

    ## npm scripts

    - `npm run dev` — start development server
    - `npm run build` — build for production (`tsc -b && vite build`)
    - `npm run preview` — preview production build
    - `npm run lint` — run ESLint

    ---

    ## Environment variables

    - `VITE_TAMBO_API_KEY` (required) — API key used by the `@tambo-ai/react` provider. Missing this will cause runtime validation errors.
    - `VITE_GITHUB_TOKEN` (recommended) — GitHub Personal Access Token used by `src/services/github/*`. Without it, unauthenticated API requests are rate limited (60 requests/hour). Recommended scopes:
      - `repo` (or `public_repo` if only public repos are needed)
      - `read:user` (optional)

    Notes:
    - Never commit `.env.local` or secrets. This repo already ignores `*.local` in `.gitignore`.

    ---

    ## Common troubleshooting

    - "Component props validation failed: Invalid input: expected string, received undefined" — usually due to missing `VITE_TAMBO_API_KEY`. Add it to `.env.local` and restart the dev server.
    - GitHub rate limit errors — add `VITE_GITHUB_TOKEN` with a PAT that has `repo` or `public_repo` scope.

    ---

    ## How to upload this project to GitHub

    1. Create a repository on GitHub (via the website or `gh` CLI).

    2. From your local project root run:

    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    # replace <username> and <repo> with your values
    git remote add origin https://github.com/<username>/<repo>.git
    git branch -M main
    git push -u origin main
    ```

    If you prefer to use SSH, use the SSH remote URL provided by GitHub instead of HTTPS.

    ---

    ## Project structure (high level)

    - `src/app/providers.tsx` — Tambo provider integration and context helpers
    - `src/lib/tambo-registry.tsx` — registry of UI components (cards) passed to Tambo
    - `src/components/cards` — card components used throughout the UI
    - `src/services/github` — GitHub API helpers

    ---

    ## Next steps I can help with

    - Add a `.env.example` file with variable names (no secrets)
    - Commit and push the repository to your GitHub account (I can create the remote and push if you provide the remote URL)

    If you want me to commit and push these README changes, tell me the GitHub remote URL (or authorize a push) and I will create the commit and push it.
