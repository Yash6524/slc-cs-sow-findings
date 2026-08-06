import { Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import { useSowData } from "../lib/dataContext";
import { useAuth } from "../lib/auth";

function ChecklistTable({ rows, startIndex = 1 }) {
  return (
    <table className="checklist">
      <thead>
        <tr>
          <th>#</th>
          <th>Ticket</th>
          <th>DWTASK</th>
          <th>SPs</th>
          <th>Status</th>
          <th>Summary</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={6}>No tickets in this section.</td>
          </tr>
        ) : (
          rows.map((t, i) => (
            <tr key={t.key}>
              <td>{startIndex + i}</td>
              <td>
                <Link to={`/ticket/${t.key}`}>
                  <strong>{t.key}</strong>
                </Link>
              </td>
              <td className="code">{t.dwtask}</td>
              <td>{t.sp || "—"}</td>
              <td>
                <StatusBadge status={t.status} />
              </td>
              <td>{t.checklistSummary || t.summary || "—"}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default function ListPage() {
  const { meta, bugs, enhancements, loading, empty, error } = useSowData();
  const { isEditor, user, logout } = useAuth();

  if (loading) {
    return (
      <div className="wrap">
        <p>Loading findings…</p>
      </div>
    );
  }

  return (
    <div className="wrap">
      <header className="site">
        <h1>{meta?.title || "SLC_CS SOW Ticket Findings"}</h1>
        <div className="meta">
          Parent story:{" "}
          {meta?.parentUrl ? (
            <a href={meta.parentUrl} target="_blank" rel="noopener noreferrer">
              {meta.parentKey || "DWF-9481"}
            </a>
          ) : (
            meta?.parentKey || "—"
          )}
          {meta?.started ? ` · Started ${meta.started}` : null}
          {meta?.updated ? ` · Updated ${meta.updated}` : null}
        </div>
        {meta?.reviewOrder ? (
          <div className="meta" style={{ marginTop: 4 }}>
            {meta.reviewOrder}
          </div>
        ) : null}
      </header>

      <div className="toolbar no-print">
        <button className="btn btn-primary" type="button" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
        <Link className="btn btn-primary" to="/admin">
          Add / Edit findings
        </Link>
        {isEditor ? (
          <>
            <span className="hint" style={{ alignSelf: "center" }}>
              Signed in as {user?.email}
            </span>
            <button className="btn" type="button" onClick={() => logout()}>
              Sign out
            </button>
          </>
        ) : null}
      </div>

      {error ? (
        <div className="callout">
          <strong>Could not load data</strong>
          Please try refreshing the page. If it keeps failing, contact the site editor.
        </div>
      ) : null}

      {empty && !error ? (
        <div className="callout">
          <strong>No tickets yet</strong>
          Open <Link to="/admin">Add / Edit findings</Link>, sign in, then choose{" "}
          <strong>Load initial tickets</strong> once.
        </div>
      ) : null}

      <h2 className="section-title">Bugs / Defects</h2>
      <ChecklistTable rows={bugs} />

      <h2 className="section-title">Enhancements</h2>
      <ChecklistTable rows={enhancements} />

      <p className="footnote">
        Parent story checklist for SLC_CS SOW review. Use Print / Save as PDF when needed.
      </p>
    </div>
  );
}
