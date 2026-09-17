import {
  Drawer,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";
import { NAV_SECTIONS } from "../config/navConfig";
import { isAdminRole } from "./AdminRoute";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpg";

const DRAWER_WIDTH = 264;
const SIDEBAR_BG = "#06070C";

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.roleCode);

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) onMobileClose();
  };

  // Admin-only items (Users, Roles) are only shown to admins — not just
  // blocked at the API level, but not even visible as a temptation for
  // anyone else.
  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.adminOnly || isAdmin),
  })).filter((section) => section.items.length > 0);

  const content = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: SIDEBAR_BG,
      }}
    >
      <Box
        sx={{ display: "flex", justifyContent: "center", pt: 4, pb: 3, px: 3 }}
      >
        <Box
          component="img"
          src={logo}
          alt="Sozo Wellness & Esthetics"
          sx={{ width: 150, height: "auto" }}
        />
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      <Box
        sx={{
          overflowY: "auto",
          py: 1,
          flexGrow: 1,
          // Hides the scrollbar visually while keeping scroll functional —
          // a bare browser scrollbar on a dark sidebar looked out of place.
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {visibleSections.map((section) => (
          <Box key={section.label} sx={{ mb: 1 }}>
            <Typography
              variant="overline"
              sx={{
                px: 3,
                display: "block",
                mt: 2.5,
                mb: 0.75,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {section.label}
            </Typography>
            <List disablePadding>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <ListItemButton
                    key={item.path}
                    selected={isActive}
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      mx: 1.5,
                      mb: 0.5,
                      borderRadius: 2,
                      color: "rgba(255,255,255,0.75)",
                      "& .MuiListItemIcon-root": {
                        color: "rgba(255,255,255,0.5)",
                      },
                      "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                      "&.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "#fff",
                        "& .MuiListItemIcon-root": { color: "#fff" },
                        "&:hover": { bgcolor: "primary.dark" },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 38 }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          fontSize: "0.9rem",
                          fontWeight: isActive ? 600 : 500,
                        },
                      }}
                    />
                    {item.builtStatus === "planned" && (
                      <Chip
                        label="Soon"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          bgcolor: isActive
                            ? "rgba(255,255,255,0.25)"
                            : "rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.85)",
                        }}
                      />
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          border: "none",
        },
      }}
    >
      {content}
    </Drawer>
  );
}

export { DRAWER_WIDTH };
