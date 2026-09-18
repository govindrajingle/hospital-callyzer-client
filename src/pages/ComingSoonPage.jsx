import { Box, Typography, Chip } from "@mui/material";

export default function ComingSoonPage({ title = "This feature" }) {
  return (
    <Box sx={{ textAlign: "center", py: 10 }}>
      <Typography variant="h5" fontWeight={800} gutterBottom>{title}</Typography>
      <Chip label="Not built yet" />
    </Box>
  );
}
