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
