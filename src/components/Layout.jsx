import { useState } from "react";
import { AppBar, Toolbar, Typography, Box, Button, IconButton, Avatar, Stack, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar, { DRAWER_WIDTH } from "./Sidebar";

// Roles come back from the API as SCREAMING_SNAKE_CASE codes (ADMIN,
// HOSPITAL_ADMIN, RECEPTIONIST, DOCTOR) — fine for logic, unreadable in the
// header. This turns "HOSPITAL_ADMIN" into "Hospital Admin".
const formatRoleLabel = (roleCode) =>
  (roleCode || "")
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ") || "—";

export default function Layout({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleLabel = formatRoleLabel(user?.roleCode);

  const identity = (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
      <Avatar sx={{ width: 32, height: 32, fontSize: "0.8rem", bgcolor: "primary.main", flexShrink: 0 }}>
        {(user?.fullName || "?").charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: "0.8rem", fontWeight: 600, lineHeight: 1.2 }}>
          {user?.fullName || ""}
        </Typography>
        <Typography noWrap sx={{ fontSize: "0.7rem", color: "text.secondary", lineHeight: 1.2 }}>
          {roleLabel}
        </Typography>
      </Box>
    </Stack>
  );

  const logoutButton = (
    <Button variant="outlined" onClick={handleLogout} size={isMobile ? "small" : "medium"} sx={{ flexShrink: 0 }}>
      Log out
    </Button>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <Box sx={{ flexGrow: 1, minWidth: 0, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        <AppBar
          position="static"
          color="transparent"
          sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}
        >
          {/* Below `md`, the title/subtitle plus who's-logged-in plus Log
              out button don't fit on one line without crowding or
              truncating each other (a long page title like "Patient
              Management" made this worse). Splitting into two rows on
              mobile \u2014 title row, then a full-width identity+logout row \u2014
              gives every piece its own space instead of fighting for one
              cramped row. Desktop keeps the original single-row layout. */}
          <Toolbar
            sx={{
              py: 1.5, gap: 1,
              flexWrap: { xs: "wrap", md: "nowrap" },
              alignItems: "center",
            }}
          >
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} edge="start" sx={{ flexShrink: 0 }}>
                <MenuIcon />
              </IconButton>
            )}

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="overline" color="text.secondary" noWrap sx={{ letterSpacing: "0.08em", display: "block" }}>
                {subtitle}
              </Typography>
              <Typography variant="h5" fontWeight={600} noWrap>
                {title}
              </Typography>
            </Box>

            {/* Desktop: identity + logout inline on the same row. */}
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 2 }}>
              {identity}
              {logoutButton}
            </Box>

            {/* Mobile: their own full-width row below the title, so who's
                logged in is always plainly visible without crowding. */}
            <Box sx={{ display: { xs: "flex", md: "none" }, width: "100%", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
              {identity}
              {logoutButton}
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
