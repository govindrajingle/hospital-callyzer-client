import { useState } from "react";
import { AppBar, Toolbar, Typography, Box, Chip, Button, IconButton, Avatar, Tooltip, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
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

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <Box sx={{ flexGrow: 1, minWidth: 0, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        <AppBar
          position="static"
          color="transparent"
          sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Toolbar sx={{ py: 1.5, gap: 1.5 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} edge="start">
                <MenuIcon />
              </IconButton>
            )}

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
                {subtitle}
              </Typography>
              <Typography variant="h5" fontWeight={600} noWrap>
                {title}
              </Typography>
            </Box>

            {/* Who's logged in has to be visible on every screen size, not
                just desktop \u2014 a mobile user previously saw nothing but a
                Log out button and had no way to tell which account/role
                they were in. On narrow screens a single avatar (tap/long-
                press for the tooltip with full name+role) keeps the header
                from getting cramped next to the title and Log out button;
                the full name+role chip takes over from sm up where there's
                room for it. */}
            <Tooltip title={user ? `${user.fullName} \u00B7 ${roleLabel}` : ""}>
              <Avatar
                sx={{
                  width: 34, height: 34, fontSize: "0.85rem", bgcolor: "primary.main",
                  mr: { xs: 1, sm: 2 }, display: { xs: "flex", sm: "none" }, flexShrink: 0,
                }}
              >
                {(user?.fullName || "?").charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
            <Chip
              icon={<PersonOutlineIcon />}
              label={user ? `${user.fullName} \u00B7 ${roleLabel}` : ""}
              variant="outlined"
              sx={{ mr: 2, display: { xs: "none", sm: "flex" } }}
            />
            <Button variant="outlined" onClick={handleLogout} size={isMobile ? "small" : "medium"}>
              Log out
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
