import { Box, Typography, Paper } from "@mui/material";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import { useLocation } from "react-router-dom";
import Layout from "./Layout";
import { ALL_NAV_ITEMS } from "../config/navConfig";

export default function ComingSoonPage() {
  const location = useLocation();
  const navItem = ALL_NAV_ITEMS.find((item) => item.path === location.pathname);
  const label = navItem ? navItem.label : "This section";

  return (
    <Layout title={label} subtitle="Coming soon">
      <Paper
        sx={{
          py: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "warning.light",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <ConstructionOutlinedIcon sx={{ fontSize: 32, color: "#fff" }} />
        </Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {label} isn't built yet
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={420}>
          This module is on the roadmap but doesn't have a working backend or
          screen yet. It's listed in the sidebar so the app's planned scope
          stays visible, not hidden.
        </Typography>
      </Paper>
    </Layout>
  );
}
