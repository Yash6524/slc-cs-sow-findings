import { STATUS_LABEL } from "../lib/constants";

export default function StatusBadge({ status, type }) {
  if (type) {
    return <span className={`badge badge-${type}`}>{type}</span>;
  }
  const label = STATUS_LABEL[status] || status || "—";
  return <span className={`badge badge-${status || "pending"}`}>{label}</span>;
}
