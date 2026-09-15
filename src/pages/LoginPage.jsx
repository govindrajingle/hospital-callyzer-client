import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, TextField, Button, Typography, Alert, Stack, IconButton, InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-transparent.png";

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
  const [error, setError] = useState("");
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
    <Box sx={{ minHeight: "100vh", display: "flex" }}>
      {/* Left brand panel — hidden on small screens */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: 1,
          bgcolor: PANEL_BG,
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 6,
        }}
      >
        <Box sx={{ position: "absolute", top: -80, left: -80, width: 320, height: 320, borderRadius: "50%", bgcolor: "primary.main", opacity: 0.25, filter: "blur(60px)" }} />
        <Box sx={{ position: "absolute", bottom: -100, right: -60, width: 380, height: 380, borderRadius: "50%", bgcolor: "primary.main", opacity: 0.18, filter: "blur(70px)" }} />

        <Box component="img" src={logo} alt="Sozo Wellness & Esthetics" sx={{ width: 300, maxWidth: "70%", position: "relative", zIndex: 1 }} />

        <Typography
          variant="body1"
          sx={{ color: "rgba(255,255,255,0.7)", mt: 4, maxWidth: 380, textAlign: "center", position: "relative", zIndex: 1 }}
        >
          Every patient, every visit, every record — organised in one place, built around how Sozo actually works.
        </Typography>
      </Box>

      {/* Right form panel */}
      <Box
        sx={{
          flex: { xs: 1, md: "0 0 480px" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          px: { xs: 3, sm: 6 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 360 }}>
          {/* Logo shown here only on mobile, where the left panel is hidden */}
          <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: 5 }}>
            <Box sx={{ bgcolor: PANEL_BG, borderRadius: 2, p: 2.5, display: "flex", justifyContent: "center" }}>
              <Box component="img" src={logo} alt="Sozo" sx={{ width: 160, height: "auto" }} />
            </Box>
          </Box>

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
