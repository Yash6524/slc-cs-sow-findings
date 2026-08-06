export const STATUS_LABEL = {
  pending: "Pending",
  skipped: "Skipped",
  "pending-client": "Pending client",
  "in-progress": "In progress",
  done: "Done",
  "dev-dependent": "Dev dependent",
  covered: "Covered by ministry suite"
};

export const STATUS_OPTIONS = Object.keys(STATUS_LABEL);

export const TYPE_OPTIONS = [
  { value: "bug", label: "Bug" },
  { value: "enhancement", label: "Enhancement" }
];

export function emptyTicket(overrides = {}) {
  return {
    key: "",
    dwtask: "",
    sp: "",
    type: "bug",
    status: "in-progress",
    summary: "",
    checklistSummary: "",
    page: null,
    prodTaskId: null,
    jiraSummary: "",
    jiraStatus: "In Progress",
    ourStatusText: "",
    whatWasDone: [],
    findings: [],
    clientConfirm: "",
    suggestedNext: [],
    imgCaption: "",
    evidenceNames: [],
    auditExcerpt1Title: "",
    auditExcerpt1: "",
    auditExcerpt2Title: "",
    auditExcerpt2: "",
    footnote: "",
    generatedAt: null,
    ...overrides
  };
}

export function ticketsToList(ticketsMap) {
  if (!ticketsMap) return [];
  return Object.values(ticketsMap);
}

export function sortTickets(list) {
  const typeOrder = { bug: 0, enhancement: 1 };
  return [...list].sort((a, b) => {
    const ta = typeOrder[a.type] ?? 9;
    const tb = typeOrder[b.type] ?? 9;
    if (ta !== tb) return ta - tb;
    return String(a.key).localeCompare(String(b.key));
  });
}

export function asLines(value) {
  if (Array.isArray(value)) return value.join("\n");
  return String(value || "");
}

export function lines(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function evidenceUrl(key, name) {
  return `/tickets/${key}/evidence/${encodeURIComponent(name)}`;
}
