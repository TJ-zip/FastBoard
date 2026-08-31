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
- Static frontend: `index.html` + `css/` + `js/` + `images/`.

## Technology stack
- Node.js, CommonJS
- express 5, cors, multer 2, pdf-parse, dotenv
- Vanilla HTML / CSS / JavaScript frontend (no build step)

## Working features
The source import is complete, but no feature has been verified by a build,
a test run, or a deployment. Nothing below is a runtime guarantee.

## Current task
COMPLETE - the `gravityanti` archive has been fully imported and the previous
repository contents removed.

All 11 files verified byte-identical to the archive by git blob SHA:

| File | git blob SHA |
|---|---|
| `index.html` | `e4ee1a8eef8cbe9441f4ef802b6d115e1528a178` |
| `package.json` | `5842ddb8d5e4ab8bdb3b03b145e13b454072de50` |
| `server.js` | `d66e420461eb0f8d2393161a5c5bd6cc81a7d68d` |
| `replace.js` | `a3843630306007a9bde98886b4f4c0c5e752e791` |
| `update.js` | `5690e7d6b53a4d11e6b258265e4434afa6a439e2` |
| `css/components.css` | `17dd5793fe9802e8c3302210e9de59abf6c3f288` |
| `css/animations.css` | `b021ec7b087dc0d5f294f6b52f3be4914041d5eb` |
| `js/app.js` | `baf1c20193bacb66216dbd8760984478b8d223fc` |
| `images/paper-texture.png` | `d23785ea283a74d677f8ca06383c1c82a72c4aaa` |

`css/main.css` and `js/data.js` were uploaded via the API and differ from the
archive only in trailing end-of-line bytes at EOF (the archive files end with a
stray `\r\n`). Their content is otherwise identical, confirmed by recomputing
the blob SHA over the stripped bytes.

All 6 local asset references in `index.html` and `css/main.css` resolve to
files that now exist at the expected paths.

## Pending tasks
- Decide on the Vercel deployment model (see "Important architectural decisions")
- Generate `package-lock.json` via CI with a real install
- Add CI workflows (`validate.yml`, `ci-report.yml`) - no build/lint/test has
  ever been executed against this code in this repository
- Rotate the leaked OpenRouter API key (see "Known issues")

## Known issues
- SECURITY: commit `b7d5c86` on the default branch contains a committed `.env`
  holding a live `OPENROUTER_API_KEY`. The file was removed from the branch tip
  but remains readable in git history. The key must be rotated in OpenRouter.
  The repository is public, so assume the key is already harvested.
- `server.js` uses `app.listen()`, which Vercel does not run natively.
- `replace.js` and `update.js` are one-off codemod scripts that rewrite `css/`
  and `index.html` in place. They are not part of the runtime and should not be
  run casually - `update.js` in particular appears to contain unquoted template
  literals and would likely throw if executed as-is.
- No lockfile is present, so installs are currently unpinned.

## Required environment variables
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `PORT`

(Names only. Never store values in this file. Set real values in a local
git-ignored `.env` for development, and in the Vercel project settings for
deployment.)

## Deployment information
No Vercel project has been inspected or confirmed for this repository yet.
No deployment has been attempted.

## Important architectural decisions
- `.env` is deliberately NOT committed. `.env.example` records the variable
  names only. Committing real values to a public repository exposes them
  permanently in git history.
- `package-lock.json` was deleted rather than hand-written. Lockfiles record
  registry integrity hashes that cannot be inferred, so CI must generate it.
- `server.js` is a long-running Express listener. Deploying to Vercel will
  require either converting `/api/upload` into a serverless function under
  `api/` or serving the frontend statically and hosting the API elsewhere.
  This has deliberately NOT been changed, because the task was a faithful
  import.

## Last completed change
Completed the `gravityanti` import: added `css/components.css`,
`css/animations.css`, `js/app.js` and `images/paper-texture.png`, and verified
every file in the repository against the source archive by git blob SHA.
