import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  CircularProgress,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";
import PatientsIcon from "@mui/icons-material/PersonOutlined";
import UsersIcon from "@mui/icons-material/GroupOutlined";
import RolesIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import HospitalIcon from "@mui/icons-material/LocalHospitalOutlined";
import BillingIcon from "@mui/icons-material/ReceiptLongOutlined";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import ReportsIcon from "@mui/icons-material/InsightsOutlined";
import PrescriptionsIcon from "@mui/icons-material/DescriptionOutlined";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import * as patientApi from "../api/patientApi";
import * as userApi from "../api/userApi";
import * as rolemasterApi from "../api/rolemasterApi";
import * as hospitalApi from "../api/hospitalApi";

function StatCard({ icon: Icon, label, value, isLoading, color = "primary.main" }) {
  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon sx={{ color: "#fff", fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {isLoading ? (
            <CircularProgress size={20} sx={{ mt: 0.5 }} />
          ) : (
            <Typography variant="h4" fontWeight={600}>
              {value}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

function PlaceholderCard({ icon: Icon, label }) {
  return (
    <Paper sx={{ p: 3, height: "100%", opacity: 0.65 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: "action.disabledBackground",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon sx={{ color: "text.disabled", fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Chip label="Not built yet" size="small" sx={{ mt: 0.5 }} />
        </Box>
      </Stack>
    </Paper>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ patients: null, users: null, roles: null, hospitals: null });
  const [recentPatients, setRecentPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const [patientsRes, usersRes, rolesRes, hospitalsRes] = await Promise.all([
        patientApi.getPatients({ limit: 5, offset: 0 }),
        userApi.getUsers(),
        rolemasterApi.getRoles(),
        hospitalApi.getHospitals(),
      ]);

      setStats({
        patients: patientsRes.pagination.total,
        users: usersRes.length,
        roles: rolesRes.length,
        hospitals: hospitalsRes.length,
      });
      setRecentPatients(patientsRes.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <Layout title="Dashboard" subtitle="Overview">
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Welcome back, {user?.fullName?.split(" ")[0] || "there"} 👋
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={5}>
        Here’s what’s happening across your hospital right now.
      </Typography>

      <Grid container spacing={3} mb={5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={PatientsIcon} label="Total patients" value={stats.patients} isLoading={isLoading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={UsersIcon} label="Total users" value={stats.users} isLoading={isLoading} color="secondary.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={RolesIcon} label="Total roles" value={stats.roles} isLoading={isLoading} color="info.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={HospitalIcon} label="Hospitals" value={stats.hospitals} isLoading={isLoading} color="success.main" />
        </Grid>
      </Grid>

      <Typography variant="overline" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
        Not built yet — shown honestly, not faked
      </Typography>
      <Grid container spacing={3} mb={5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PlaceholderCard icon={BillingIcon} label="Billing this month" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PlaceholderCard icon={PaymentsIcon} label="Payments collected" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PlaceholderCard icon={ReportsIcon} label="Reports generated" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PlaceholderCard icon={PrescriptionsIcon} label="Active prescriptions" />
        </Grid>
      </Grid>

      <Paper sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Recently registered patients
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : recentPatients.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3 }}>
            No patients registered yet.
          </Typography>
        ) : (
          <Stack divider={<Divider />} spacing={0}>
            {recentPatients.map((p) => (
              <Stack
                key={p.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                py={2.5}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40, fontSize: "0.95rem" }}>
                    {(p.first_name || "?").charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={600} noWrap>
                      {p.first_name} {p.last_name || ""}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {p.mobile}
                    </Typography>
                  </Box>
                </Stack>
                <Chip label={p.mrn} size="small" color="primary" variant="outlined" sx={{ flexShrink: 0 }} />
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>
    </Layout>
  );
}
