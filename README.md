# SLC_CS SOW Findings (HTML pack)

**Open:** [`index.html`](index.html) in a browser · **Print → Save as PDF** when done.

## Layout

```
slc-cs-sow-findings/
  index.html                 ← checklist + links
  assets/styles.css
  data/tracker.json          ← status source of truth
  tickets/
    DWF-8270/
      ticket.html            ← findings + image + JSON excerpts
      evidence/              ← png + full json dumps
```

## Workflow

1. Share ticket findings + any image/JSON paths in chat.
2. I append a `tickets/<KEY>/` page, archive evidence, update `index.html` + `tracker.json`.
3. At the end: open `index.html` → Print → Save as PDF.

`FINDINGS.md` is retired; use the HTML pack.

## Add / Edit findings via form

Open **[admin/add-ticket.html](admin/add-ticket.html)** (or **Add / Edit findings** on the live site).

**New:** fill fields → Generate & download → place under `tickets/<KEY>/` → push.

**Edit:** select existing ticket (or open `?edit=DWF-8270`) → Load into form → change fields → Update & download → overwrite files → push.

Requires `tickets/<KEY>/ticket-data.json` for each editable ticket (auto-downloaded by the form).

## Netlify hosting

1. Push latest to GitHub (`Yash6524/slc-cs-sow-findings`).
2. [Netlify](https://app.netlify.com) → **Add new site** → **Import an existing project** → **GitHub**.
3. Authorize **Yash6524** and select `slc-cs-sow-findings`.
4. Deploy settings (auto-detected from `netlify.toml`):
   - Build command: *(empty)*
   - Publish directory: `.`
5. **Deploy site** → live URL like `https://random-name.netlify.app`

Each `git push` to `main` redeploys automatically.
