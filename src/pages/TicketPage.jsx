import { Link, useParams } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import { useSowData } from "../lib/dataContext";
import { STATUS_LABEL, evidenceUrl } from "../lib/constants";

export default function TicketPage() {
  const { key } = useParams();
  const ticketKey = String(key || "").toUpperCase();
  const { getTicket, loading } = useSowData();
  const t = getTicket(ticketKey);

  if (loading) {
    return (
      <div className="wrap">
        <p>Loading…</p>
      </div>
    );
  }

  if (!t) {
    return (
      <div className="wrap">
        <p className="crumb no-print">
          <Link to="/">← All tickets</Link>
        </p>
        <header className="site">
          <h1>{ticketKey}</h1>
          <div className="meta">Ticket not found in live data.</div>
        </header>
      </div>
    );
  }

  const statusLabel = STATUS_LABEL[t.status] || t.status;
  const ourStatus = t.ourStatusText || statusLabel;
  const evidence = Array.isArray(t.evidenceNames) ? t.evidenceNames : [];
  const whatWasDone = Array.isArray(t.whatWasDone) ? t.whatWasDone : [];
  const findings = Array.isArray(t.findings) ? t.findings : [];
  const suggestedNext = Array.isArray(t.suggestedNext) ? t.suggestedNext : [];
  const hasImage = Boolean(t.imgCaption) || evidence.includes("debug-annotation.png");

  return (
    <div className="wrap">
      <p className="crumb no-print">
        <Link to="/">← All tickets</Link>
      </p>

      <header className="site">
        <h1>
          {t.key} / DWTASK-{t.dwtask}
        </h1>
        <div className="meta">
          <StatusBadge type={t.type} />{" "}
          <StatusBadge status={t.status} /> ·{" "}
          <a
            href={`https://brians.atlassian.net/browse/${t.key}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Jira
          </a>
          {t.prodTaskId ? (
            <>
              {" "}
              · Prod task <code>{t.prodTaskId}</code>
            </>
          ) : null}
        </div>
      </header>

      <div className="toolbar no-print">
        <button className="btn btn-primary" type="button" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
        <Link className="btn" to={`/admin/${t.key}`}>
          Edit findings
        </Link>
        {evidence
          .filter((n) => n.endsWith(".json"))
          .slice(0, 2)
          .map((n) => (
            <a key={n} className="btn" href={evidenceUrl(t.key, n)} download>
              Download {n}
            </a>
          ))}
      </div>

      <div className="card">
        <h2>Ticket summary</h2>
        <dl className="kv">
          <dt>Jira summary</dt>
          <dd>{t.jiraSummary || "—"}</dd>
          <dt>Prod task</dt>
          <dd>{t.prodTaskId ? <code>{t.prodTaskId}</code> : "—"}</dd>
          <dt>Jira status</dt>
          <dd>{t.jiraStatus || "—"}</dd>
          <dt>Our status</dt>
          <dd>{ourStatus}</dd>
        </dl>

        <h3>What was done</h3>
        <ul className="tight">
          {whatWasDone.length ? (
            whatWasDone.map((line) => <li key={line}>{line}</li>)
          ) : (
            <li>—</li>
          )}
        </ul>

        <h3>Findings</h3>
        <ol>
          {findings.length ? (
            findings.map((line) => <li key={line}>{line}</li>)
          ) : (
            <li>—</li>
          )}
        </ol>

        {t.clientConfirm ? (
          <div className="callout">
            <strong>Client confirmation needed</strong>
            {t.clientConfirm}
          </div>
        ) : null}

        {suggestedNext.length ? (
          <>
            <h3>Suggested next (if client says continue)</h3>
            <ul className="tight">
              {suggestedNext.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      {hasImage ? (
        <>
          <h2 className="section-title">Debug annotation (Lua vs audit)</h2>
          <figure className="evidence-img">
            <img
              src={evidenceUrl(t.key, "debug-annotation.png")}
              alt={`Debug annotation for ${t.key}`}
            />
            <figcaption>{t.imgCaption || "Debug annotation screenshot."}</figcaption>
          </figure>
        </>
      ) : null}

      <h2 className="section-title">Evidence files</h2>
      <ul className="file-list">
        {evidence.length ? (
          evidence.map((name) => (
            <li key={name}>
              <span className="name">{name}</span>
              <a href={evidenceUrl(t.key, name)} download>
                Download
              </a>
            </li>
          ))
        ) : (
          <li>No evidence files listed</li>
        )}
      </ul>

      <h2 className="section-title">Key audit excerpts</h2>
      {t.auditExcerpt1Title || t.auditExcerpt1 ? (
        <details className="json-block" open>
          <summary>{t.auditExcerpt1Title || "Audit excerpt 1"}</summary>
          <pre className="json">{t.auditExcerpt1 || ""}</pre>
        </details>
      ) : null}
      {t.auditExcerpt2Title || t.auditExcerpt2 ? (
        <details className="json-block" open>
          <summary>{t.auditExcerpt2Title || "Audit excerpt 2"}</summary>
          <pre className="json">{t.auditExcerpt2 || ""}</pre>
        </details>
      ) : null}

      <p className="footnote">
        {t.footnote ||
          "Full evidence files belong in the evidence/ folder for this ticket."}
      </p>
    </div>
  );
}
