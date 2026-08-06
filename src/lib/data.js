import {
  onValue,
  ref,
  set,
  update,
  remove,
  get
} from "firebase/database";
import { db } from "./firebase";
import { emptyTicket } from "./constants";

export function subscribeSow(callback) {
  const rootRef = ref(db, "/");
  return onValue(
    rootRef,
    (snap) => {
      const val = snap.val();
      callback({
        meta: val?.meta || null,
        tickets: val?.tickets || {},
        empty: !val || (!val.meta && !val.tickets)
      });
    },
    (err) => {
      console.error(err);
      callback({ meta: null, tickets: {}, empty: true, error: err.message });
    }
  );
}

export async function getSowOnce() {
  const snap = await get(ref(db, "/"));
  const val = snap.val();
  return {
    meta: val?.meta || null,
    tickets: val?.tickets || {},
    empty: !val || (!val.meta && !val.tickets)
  };
}

export async function saveTicket(ticket) {
  const key = String(ticket.key || "").trim().toUpperCase();
  if (!key) throw new Error("Ticket key is required");
  const payload = {
    ...emptyTicket(),
    ...ticket,
    key,
    summary: ticket.checklistSummary || ticket.summary || ticket.jiraSummary || "",
    checklistSummary:
      ticket.checklistSummary || ticket.summary || ticket.jiraSummary || "",
    page: `tickets/${key}`,
    generatedAt: new Date().toISOString()
  };
  await set(ref(db, `tickets/${key}`), payload);
  await update(ref(db, "meta"), { updated: new Date().toISOString().slice(0, 10) });
  return payload;
}

export async function deleteTicket(key) {
  await remove(ref(db, `tickets/${key}`));
  await update(ref(db, "meta"), { updated: new Date().toISOString().slice(0, 10) });
}

export async function seedDatabase(seed) {
  if (!seed?.meta || !seed?.tickets) {
    throw new Error("Invalid seed: need meta + tickets");
  }
  await set(ref(db, "/"), {
    meta: seed.meta,
    tickets: seed.tickets
  });
}

export async function loadBundledSeed() {
  const res = await fetch(`/seed.json?t=${Date.now()}`);
  if (!res.ok) throw new Error(`Could not load seed.json (${res.status})`);
  return res.json();
}
