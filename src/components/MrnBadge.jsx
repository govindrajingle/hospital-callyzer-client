import { Box } from "@mui/material";

// Every patient record number in this app follows SOZO{hospitalId}-{sequence}.
// Highlighting the "SOZO" brand prefix in the brand teal (vs. the numeric
// part in ink) makes an MRN/PRN instantly recognizable at a glance in any
// table, chip, or detail view — rather than one flat block of text.
// Renders as an inline <span>, so it drops into Typography, Chip labels,
// table cells, or plain text anywhere in the app.
export default function MrnBadge({ value, sx }) {
  if (!value) return "—";

  const match = /^(SOZO)(.*)$/i.exec(value);
  if (!match) {
    return (
      <Box component="span" sx={{ fontWeight: 700, ...sx }}>
        {value}
      </Box>
    );
  }

  const [, prefix, rest] = match;
  return (
    <Box component="span" sx={{ fontWeight: 700, whiteSpace: "nowrap", ...sx }}>
      <Box component="span" sx={{ color: "primary.main" }}>{prefix}</Box>
      <Box component="span" sx={{ color: "secondary.main" }}>{rest}</Box>
    </Box>
  );
}
