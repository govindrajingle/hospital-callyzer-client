import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress, Typography, Stack } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const ADMIN_ROLE_CODES = ["ADMIN", "HOSPITAL_ADMIN"];

export const isAdminRole = (roleCode) => ADMIN_ROLE_CODES.includes(roleCode);

// Same idea as ProtectedRoute (must be logged in) plus an additional check:
// must also hold an admin role. A non-admin who is logged in and types
// /users or /roles directly into the address bar sees a clear "not
// allowed" message instead of the page — hiding the sidebar link alone
// would not have actually stopped that.
export default function AdminRoute({ children }) {
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

  if (!isAdminRole(user.roleCode)) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", px: 3 }}>
        <Stack alignItems="center" spacing={2} sx={{ textAlign: "center", maxWidth: 400 }}>
          <LockOutlinedIcon sx={{ fontSize: 48, color: "text.disabled" }} />
          <Typography variant="h6" fontWeight={600}>
            You don\u2019t have access to this page
          </Typography>
          <Typography variant="body2" color="text.secondary">
            User and role management is restricted to administrators. Contact your hospital admin if you need something changed here.
          </Typography>
        </Stack>
      </Box>
    );
  }

  return children;
}
