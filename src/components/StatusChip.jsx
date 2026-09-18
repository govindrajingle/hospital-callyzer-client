import { Chip } from "@mui/material";

// Single source of truth for how each appointment status is labeled and
// colored, so every list/table renders the same chip instead of each page
// picking its own color for "cancelled" etc. Matches the STATUSES enum in
// the backend's appointment.validation.js.
export const APPOINTMENT_STATUS_META = {
  scheduled: { label: "Scheduled", color: "info" },
  completed: { label: "Completed", color: "success" },
  cancelled: { label: "Cancelled", color: "error" },
  no_show: { label: "No Show", color: "warning" },
};

export const APPOINTMENT_STATUS_OPTIONS = Object.entries(APPOINTMENT_STATUS_META).map(
  ([value, meta]) => ({ value, label: meta.label }),
);

export default function StatusChip({ status }) {
  const meta = APPOINTMENT_STATUS_META[status] || { label: status || "Unknown", color: "default" };
  return <Chip size="small" label={meta.label} color={meta.color} variant="filled" />;
}
