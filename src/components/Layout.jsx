import { useState } from "react";
import { AppBar, Toolbar, Typography, Box, Chip, Button, IconButton, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar, { DRAWER_WIDTH } from "./Sidebar";

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

            <Chip
              icon={<PersonOutlineIcon />}
              label={user ? `${user.fullName} \u00B7 ${user.roleCode}` : ""}
              variant="outlined"
              sx={{ mr: { xs: 0, sm: 2 }, display: { xs: "none", sm: "flex" } }}
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
