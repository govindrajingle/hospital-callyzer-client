import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress, Typography, Stack } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

// Same idea as AdminRoute, generalized to an arbitrary set of allowed role
// codes — used for routes like /appointments (Admin/Receptionist) and
// /my-appointments (Doctor only) where "admin-only" isn't the right check.
export default function RoleRoute({ allow, children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(user.roleCode)) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", px: 3 }}>
        <Stack alignItems="center" spacing={2} sx={{ textAlign: "center", maxWidth: 400 }}>
          <LockOutlinedIcon sx={{ fontSize: 48, color: "text.disabled" }} />
          <Typography variant="h6" fontWeight={600}>
            You don’t have access to this page
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This section is restricted to specific roles. Contact your hospital admin if you need access.
          </Typography>
        </Stack>
      </Box>
    );
  }

  return children;
}
