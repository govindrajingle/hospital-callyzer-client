import { Chip } from "@mui/material";

// Single source of truth for how each appointment status is labeled and
// colored, so every list/table renders the same chip instead of each page
// picking its own color for "cancelled" etc. Matches the STATUSES enum in
// the backend's appointment.validation.js.
//
// Colors are custom (bg/text) rather than MUI's plain palette names, per
// an explicit clinic-wide color spec: confirmed/booked = green,
// cancelled = light orange, no_show is kept a neutral grey so it doesn't
// visually collide with "cancelled".
export const APPOINTMENT_STATUS_META = {
  scheduled: { label: "Scheduled", bgcolor: "#e8f5e9", color: "#2e7d32" },
  completed: { label: "Completed", bgcolor: "#e8f5e9", color: "#2e7d32" },
  cancelled: { label: "Cancelled", bgcolor: "#fff3e0", color: "#e65100" },
  no_show: { label: "No Show", bgcolor: "#f5f5f5", color: "#616161" },
};

export const APPOINTMENT_STATUS_OPTIONS = Object.entries(APPOINTMENT_STATUS_META).map(
  ([value, meta]) => ({ value, label: meta.label }),
);

export default function StatusChip({ status }) {
  const meta = APPOINTMENT_STATUS_META[status] || { label: status || "Unknown", bgcolor: "#f5f5f5", color: "#616161" };
  return (
    <Chip
      size="small"
      label={meta.label}
      sx={{ bgcolor: meta.bgcolor, color: meta.color, fontWeight: 600 }}
    />
  );
}
