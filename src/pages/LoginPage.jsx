import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, TextField, Button, Typography, Alert, Stack, IconButton, InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-transparent.png";
import tomcatdevsIconWhite from "../assets/tomcatdevs/tomcatdevs-icon-white.png";

const CURRENT_YEAR = new Date().getFullYear();

// A rich dark teal, not pure/near black — stays dark enough for the
// logo's white lettering to read clearly, but reads as "brand teal, dimmed"
// rather than harsh black.
const PANEL_BG = "#0B2A2D";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [error, setError] = useState(() => {
    if (sessionStorage.getItem("sozo_session_expired")) {
      sessionStorage.removeItem("sozo_session_expired");
      return "Your session expired. Please log in again.";
    }
    return "";
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Column on mobile/tablet (brand banner on top, form below, page flows
    // naturally top-to-bottom), row on desktop (side-by-side panels). The
    // old approach hid the brand panel entirely below `md` and instead
    // dropped a small rounded logo box into the vertically-centered form
    // column — on a real phone that left large empty margins above and
    // below and read as a stray floating card, not a designed page.
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: { xs: "column", md: "row" } }}>
      {/* Brand panel — a full-height side panel on desktop, a full-width
          top banner on mobile/tablet (same background, same content, just
          not vertically centered in the viewport on small screens). */}
      <Box
        sx={{
          flex: { md: 1 },
          bgcolor: PANEL_BG,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: { xs: "flex-start", md: "center" },
          py: { xs: 5, sm: 6, md: 6 },
          px: { xs: 4, md: 6 },
        }}
      >
        <Box sx={{ position: "absolute", top: -80, left: -80, width: 320, height: 320, borderRadius: "50%", bgcolor: "primary.main", opacity: 0.25, filter: "blur(60px)" }} />
        <Box sx={{ position: "absolute", bottom: -100, right: -60, width: 380, height: 380, borderRadius: "50%", bgcolor: "primary.main", opacity: 0.18, filter: "blur(70px)" }} />

        <Box component="img" src={logo} alt="Sozo Wellness & Esthetics" sx={{ width: { xs: 200, sm: 240, md: 300 }, maxWidth: "70%", position: "relative", zIndex: 1 }} />

        <Typography
          variant="body1"
          sx={{ color: "rgba(255,255,255,0.7)", mt: { xs: 2.5, md: 4 }, maxWidth: 380, textAlign: "center", position: "relative", zIndex: 1 }}
        >
          Every patient, every visit, every record — organised in one place, built around how Sozo actually works.
        </Typography>

        {/* Footer: a copyright line plus a quiet one-line agency credit.
            On desktop the panel is full viewport height, so this is pinned
            to the bottom; on mobile the panel is only as tall as its
            content, so the same footer sits in normal flow a bit below
            the tagline instead of being absolutely positioned. */}
        <Box
          sx={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, zIndex: 1,
            mt: { xs: 4, md: 0 },
            position: { xs: "static", md: "absolute" },
            bottom: { md: 28 }, left: { md: 0 }, right: { md: 0 },
          }}
        >
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)" }}>
            {"©"} {CURRENT_YEAR} Sozo Wellness & Esthetics
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Box component="img" src={tomcatdevsIconWhite} alt="" sx={{ height: 13, width: "auto", opacity: 0.5 }} />
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
              Built by <Box component="span" sx={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>tomcatdevs</Box>
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          flex: { xs: 1, md: "0 0 480px" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          px: { xs: 3, sm: 6 },
          py: { xs: 5, md: 0 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 360 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
            Sign in to continue to your dashboard
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
              <TextField
                label="Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
              <TextField
                label="Password"
                fullWidth
                required
                type={isPasswordShown ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={() => setIsPasswordShown((show) => !show)}
                          onMouseDown={(e) => e.preventDefault()}
                          tabIndex={-1}
                        >
                          {isPasswordShown ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button type="submit" fullWidth variant="contained" size="large" disabled={isSubmitting} sx={{ mt: 1 }}>
                {isSubmitting ? "Signing in\u2026" : "Log In"}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
