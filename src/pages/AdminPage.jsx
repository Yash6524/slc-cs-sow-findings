import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useSowData } from "../lib/dataContext";
import {
  STATUS_OPTIONS,
  STATUS_LABEL,
  TYPE_OPTIONS,
  asLines,
  emptyTicket,
  lines
} from "../lib/constants";
import { deleteTicket, loadBundledSeed, saveTicket, seedDatabase } from "../lib/data";

function field(label, props, hint) {
  const { type, ...rest } = props;
  return (
    <div className="form-row">
      <label htmlFor={props.id}>{label}</label>
      {hint ? <span className="hint">{hint}</span> : null}
      {type === "textarea" ? (
        <textarea {...rest} />
      ) : (
        <input type={type || "text"} {...rest} />
      )}
    </div>
  );
}

export default function AdminPage() {
  const { key: routeKey } = useParams();
  const navigate = useNavigate();
  const { user, ready, isEditor, login, logout } = useAuth();
  const { tickets, getTicket, empty } = useSowData();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [form, setForm] = useState(() => emptyTicket());
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const editKey = (routeKey || "").toUpperCase();

  useEffect(() => {
    if (!editKey) {
      setForm(emptyTicket());
      return;
    }
    const existing = getTicket(editKey);
    if (existing) setForm({ ...emptyTicket(), ...existing });
  }, [editKey, getTicket]);

  const editableKeys = useMemo(
    () => tickets.map((t) => t.key).sort(),
    [tickets]
  );

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError("");
    try {
      await login(email.trim(), password);
    } catch (err) {
      setAuthError(err.message || "Login failed");
    }
  }

  function buildPayload() {
    const key = String(form.key || "").trim().toUpperCase();
    return {
      ...form,
      key,
      dwtask: String(form.dwtask || "").trim(),
      whatWasDone: lines(asLines(form.whatWasDone)),
      findings: lines(asLines(form.findings)),
      suggestedNext: lines(asLines(form.suggestedNext)),
      evidenceNames: lines(asLines(form.evidenceNames)),
      checklistSummary: form.checklistSummary || form.jiraSummary || "",
      summary: form.checklistSummary || form.jiraSummary || ""
    };
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!isEditor) return setMessage("Sign in to save.");
    const payload = buildPayload();
    if (!payload.key || !payload.dwtask || !payload.jiraSummary) {
      setMessage("Ticket key, DWTASK, and Jira summary are required.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await saveTicket(payload);
      setMessage(`Saved ${payload.key} to Firebase. Teammates see it on refresh — no redeploy.`);
      navigate(`/ticket/${payload.key}`);
    } catch (err) {
      setMessage(err.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    const key = String(form.key || editKey).toUpperCase();
    if (!key) return;
    if (!window.confirm(`Soft-skip ${key}? This sets status to skipped.`)) return;
    setBusy(true);
    try {
      const existing = getTicket(key) || form;
      await saveTicket({ ...existing, key, status: "skipped" });
      setMessage(`${key} marked skipped.`);
    } catch (err) {
      setMessage(err.message || "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleHardDelete() {
    const key = String(form.key || editKey).toUpperCase();
    if (!key) return;
    if (!window.confirm(`Permanently delete ${key} from Firebase?`)) return;
    setBusy(true);
    try {
      await deleteTicket(key);
      setMessage(`${key} deleted.`);
      navigate("/admin");
      setForm(emptyTicket());
    } catch (err) {
      setMessage(err.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleSeed() {
    if (!isEditor) return;
    if (
      !empty &&
      !window.confirm(
        "Database already has data. Overwrite everything with bundled seed.json?"
      )
    ) {
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const seed = await loadBundledSeed();
      await seedDatabase(seed);
      setMessage(
        `Imported ${Object.keys(seed.tickets || {}).length} tickets into Firebase.`
      );
    } catch (err) {
      setMessage(err.message || "Seed failed");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="wrap">
        <p>Loading auth…</p>
      </div>
    );
  }

  return (
    <div className="wrap">
      <p className="crumb no-print">
        <Link to="/">← All tickets</Link>
      </p>

      <header className="site">
        <h1>Add / Edit ticket findings</h1>
        <div className="meta">
          Save writes live JSON to Firebase. Teammates see updates without git or Netlify redeploy.
        </div>
      </header>

      {!isEditor ? (
        <form className="card form-grid no-print" onSubmit={handleLogin}>
          <h2>Editor sign-in</h2>
          <p className="hint">
            Use the Email/Password user from Firebase Authentication → Users. Viewers do not need
            this.
          </p>
          <div className="form-row two">
            {field("Email", {
              id: "email",
              type: "email",
              required: true,
              value: email,
              onChange: (e) => setEmail(e.target.value),
              autoComplete: "username"
            })}
            {field("Password", {
              id: "password",
              type: "password",
              required: true,
              value: password,
              onChange: (e) => setPassword(e.target.value),
              autoComplete: "current-password"
            })}
          </div>
          {authError ? (
            <div className="callout">
              <strong>Login failed</strong>
              {authError}
            </div>
          ) : null}
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              Sign in
            </button>
          </div>
        </form>
      ) : (
        <div className="card no-print" style={{ marginBottom: 16 }}>
          <p style={{ margin: 0 }}>
            Signed in as <strong>{user.email}</strong>
          </p>
          <div className="form-actions">
            <button className="btn" type="button" onClick={() => logout()}>
              Sign out
            </button>
            <button className="btn" type="button" disabled={busy} onClick={handleSeed}>
              Import seed into Firebase
            </button>
          </div>
          <p className="hint" style={{ marginTop: 8 }}>
            First time only: import seed loads the existing SOW tickets into the live DB.
          </p>
        </div>
      )}

      <div className="card form-grid no-print">
        <h2>Load existing</h2>
        <div className="form-row">
          <label htmlFor="editSelect">Ticket</label>
          <select
            id="editSelect"
            value={editKey}
            onChange={(e) => {
              const k = e.target.value;
              if (k) navigate(`/admin/${k}`);
              else navigate("/admin");
            }}
          >
            <option value="">— New ticket —</option>
            {editableKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      <form id="ticket-form" className="card form-grid" onSubmit={handleSave}>
        <h2>Basics</h2>
        <div className="form-row two">
          {field("Ticket key *", {
            id: "key",
            required: true,
            placeholder: "DWF-9475",
            pattern: "DWF-\\d+",
            value: form.key || "",
            onChange: (e) => setField("key", e.target.value.toUpperCase())
          })}
          {field("DWTASK *", {
            id: "dwtask",
            required: true,
            placeholder: "676",
            value: form.dwtask || "",
            onChange: (e) => setField("dwtask", e.target.value)
          })}
        </div>
        <div className="form-row two">
          <div className="form-row">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              required
              value={form.type || "bug"}
              onChange={(e) => setField("type", e.target.value)}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {field("SPs", {
            id: "sp",
            placeholder: "1/2",
            value: form.sp || "",
            onChange: (e) => setField("sp", e.target.value)
          })}
        </div>
        <div className="form-row two">
          <div className="form-row">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              required
              value={form.status || "in-progress"}
              onChange={(e) => setField("status", e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          {field("Prod task ID", {
            id: "prodTaskId",
            value: form.prodTaskId || "",
            onChange: (e) => setField("prodTaskId", e.target.value)
          })}
        </div>

        <h2>Summaries</h2>
        {field(
          "Checklist summary",
          {
            id: "checklistSummary",
            value: form.checklistSummary || "",
            onChange: (e) => setField("checklistSummary", e.target.value)
          },
          "Shown on the main checklist table"
        )}
        {field("Jira summary *", {
          id: "jiraSummary",
          required: true,
          value: form.jiraSummary || "",
          onChange: (e) => setField("jiraSummary", e.target.value)
        })}
        <div className="form-row two">
          {field("Jira status", {
            id: "jiraStatus",
            value: form.jiraStatus || "",
            onChange: (e) => setField("jiraStatus", e.target.value)
          })}
          {field("Our status text", {
            id: "ourStatusText",
            value: form.ourStatusText || "",
            onChange: (e) => setField("ourStatusText", e.target.value)
          })}
        </div>

        <h2>Findings</h2>
        {field(
          "What was done (one per line)",
          {
            id: "whatWasDone",
            type: "textarea",
            value: asLines(form.whatWasDone),
            onChange: (e) => setField("whatWasDone", e.target.value)
          }
        )}
        {field(
          "Findings (one per line)",
          {
            id: "findings",
            type: "textarea",
            value: asLines(form.findings),
            onChange: (e) => setField("findings", e.target.value)
          }
        )}
        {field("Client confirmation needed", {
          id: "clientConfirm",
          type: "textarea",
          value: form.clientConfirm || "",
          onChange: (e) => setField("clientConfirm", e.target.value)
        })}
        {field(
          "Suggested next (one per line)",
          {
            id: "suggestedNext",
            type: "textarea",
            value: asLines(form.suggestedNext),
            onChange: (e) => setField("suggestedNext", e.target.value)
          }
        )}

        <h2>Evidence</h2>
        {field(
          "Evidence file names (one per line)",
          {
            id: "evidenceNames",
            type: "textarea",
            value: asLines(form.evidenceNames),
            onChange: (e) => setField("evidenceNames", e.target.value)
          },
          "Files must already exist under public/tickets/<KEY>/evidence/ (rare deploy)"
        )}
        {field("Image caption", {
          id: "imgCaption",
          value: form.imgCaption || "",
          onChange: (e) => setField("imgCaption", e.target.value)
        })}

        <h2>Audit excerpts</h2>
        {field("Excerpt 1 title", {
          id: "auditExcerpt1Title",
          value: form.auditExcerpt1Title || "",
          onChange: (e) => setField("auditExcerpt1Title", e.target.value)
        })}
        {field("Excerpt 1", {
          id: "auditExcerpt1",
          type: "textarea",
          value: form.auditExcerpt1 || "",
          onChange: (e) => setField("auditExcerpt1", e.target.value)
        })}
        {field("Excerpt 2 title", {
          id: "auditExcerpt2Title",
          value: form.auditExcerpt2Title || "",
          onChange: (e) => setField("auditExcerpt2Title", e.target.value)
        })}
        {field("Excerpt 2", {
          id: "auditExcerpt2",
          type: "textarea",
          value: form.auditExcerpt2 || "",
          onChange: (e) => setField("auditExcerpt2", e.target.value)
        })}
        {field("Footnote", {
          id: "footnote",
          value: form.footnote || "",
          onChange: (e) => setField("footnote", e.target.value)
        })}

        <div className="form-actions no-print">
          <button className="btn btn-primary" type="submit" disabled={!isEditor || busy}>
            {editKey ? "Save changes" : "Create ticket"}
          </button>
          <button
            className="btn"
            type="button"
            disabled={!isEditor || busy || !form.key}
            onClick={handleDelete}
          >
            Mark skipped
          </button>
          <button
            className="btn"
            type="button"
            disabled={!isEditor || busy || !form.key}
            onClick={handleHardDelete}
          >
            Delete
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setForm(emptyTicket());
              navigate("/admin");
            }}
          >
            Clear / new
          </button>
        </div>
      </form>

      {message ? (
        <div className="result-box" style={{ marginTop: 14 }}>
          {message}
        </div>
      ) : null}
    </div>
  );
}
