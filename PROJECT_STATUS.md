# PROJECT STATUS

## Product objective
FastBoard turns an uploaded PDF into a set of interactive study cards
(flashcards, matching "miniboards", and concept-link prompts).

## Current architecture
- Express server (`server.js`) that:
  - serves the static frontend from the repository root,
  - exposes `POST /api/upload`, which parses an uploaded PDF with `pdf-parse`
    and asks OpenRouter to generate cards,
  - falls back to a built-in mock card generator when `OPENROUTER_API_KEY`
    is absent or the AI call fails.
- Static frontend: `index.html` + `css/` + `js/`.

## Technology stack
- Node.js, CommonJS
- express 5, cors, multer 2, pdf-parse, dotenv
- Vanilla HTML / CSS / JavaScript frontend (no build step)

## Working features
Not yet verified by CI or a deployment in this repository. See
"Known issues" below - the import is currently incomplete.

## Current task
Importing the `gravityanti` source archive into this repository and
removing the previous repository contents.

Imported so far (verified by matching git blob SHA):
- `index.html`
- `package.json`
- `server.js`
- `replace.js`
- `update.js`

## Pending tasks
- Add `css/main.css`, `css/components.css`, `css/animations.css`
- Add `js/app.js`, `js/data.js`
- Add `images/paper-texture.png` (binary asset, referenced by `css/main.css`)
- Decide on the Vercel deployment model (see "Important architectural decisions")
- Generate `package-lock.json` via CI

## Known issues
- The application is NOT runnable at the current commit: the frontend
  stylesheets, frontend scripts and the paper texture image have not yet
  been added.
- `replace.js` and `update.js` are one-off codemod scripts that rewrite
  `css/` and `index.html` in place. They are not part of the runtime and
  should not be run casually.
- A previous commit on the default branch contained a committed `.env`
  with a real API key. It has been removed from the branch tip but it
  remains in git history, so the key must be treated as compromised.

## Required environment variables
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `PORT`

(Names only. Never store values in this file.)

## Deployment information
No Vercel project has been inspected or confirmed for this repository yet.

## Important architectural decisions
- `package-lock.json` was deleted rather than hand-written. Lockfiles record
  registry integrity hashes that cannot be inferred, so CI must generate it.
- `server.js` is a long-running Express listener (`app.listen`). That model is
  not native to Vercel. Deploying to Vercel will require either converting
  `/api/upload` into a serverless function or serving the frontend statically
  and hosting the API elsewhere. This has deliberately NOT been changed yet,
  because the current task is a faithful import.

## Last completed change
Removed the previous repository contents (`.env`, `bonus.md`,
`package-lock.json`, and a stray 1-byte `css` file that blocked creation of
the `css/` directory) and added `.gitignore`, `.env.example` and this file.
