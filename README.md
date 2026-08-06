# SLC_CS SOW Findings (React + Firebase)

Live checklist and ticket findings. **Content edits save to Firebase** — no git push / Netlify redeploy for day-to-day updates.

| Piece | Host | Redeploy needed? |
| --- | --- | --- |
| React UI | Netlify (free) | Only for UI/code changes |
| Ticket JSON | Firebase Realtime Database (Spark free) | Never for content |
| Evidence files | Netlify `public/tickets/.../evidence/` | Only when adding new dumps |

## Branches

| Branch | Purpose |
| --- | --- |
| `main` | Previous static HTML site (also mirrored as backup) |
| `backup/static-html-v1` | Frozen backup of the static HTML pack (same commit as `main` at cutover) |
| `feat/react-firebase-spa` | React + Firebase SPA (active development) |

Restore static site anytime: `git checkout backup/static-html-v1`

A copy of the static files also lives under `legacy-static/` on the feature branch.

## Local run

1. Project on **Spark** (no billing).
2. Web app registered.
3. **Realtime Database** created; rules:

```json
{
  "rules": {
    ".read": true,
    ".write": "auth != null"
  }
}
```

4. **Authentication** → Email/Password enabled + at least one Users entry (editor login for Admin only).

## Local run

```bash
cd slc-cs-sow-findings
cp .env.example .env   # already filled if you have .env
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### First load (empty DB)

1. Open **Add / Edit findings**
2. Sign in with the Firebase Auth user
3. Click **Import seed into Firebase** once
4. Home checklist should fill with existing tickets

## Env vars

Copy from Firebase web config into `.env` (and Netlify site env for branch/prod deploys):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Web `apiKey` is public by design; security is Auth + DB rules. Do **not** put the editor password in env or git.

## Scripts

- `npm run dev` — local SPA
- `npm run build` — output to `dist/` (Netlify publish)
- `npm run preview` — preview production build

## Legacy static HTML

Previous static pack is under `legacy-static/` for reference. Evidence used by the SPA lives in `public/tickets/<KEY>/evidence/`.

## Netlify (later)

1. Deploy branch `feat/react-firebase-spa` (or merge to main when ready).
2. Build command: `npm run build` · Publish: `dist` (see `netlify.toml`).
3. Add the same `VITE_FIREBASE_*` variables in Netlify → Site settings → Environment variables.
4. Optional: use this branch as a free Netlify Deploy Preview / branch deploy for staging.
