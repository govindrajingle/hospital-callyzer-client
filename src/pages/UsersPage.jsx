import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box, Paper, Button, Stack, Typography, IconButton, CircularProgress, Chip, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import KeyIcon from "@mui/icons-material/VpnKeyOutlined";
import { createColumnHelper } from "@tanstack/react-table";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import * as userApi from "../api/userApi";
import * as rolemasterApi from "../api/rolemasterApi";
import * as hospitalApi from "../api/hospitalApi";

const columnHelper = createColumnHelper();
const emptyForm = { hospitalId: "", roleId: "", userName: "", fullName: "", email: "", password: "" };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersData, rolesData, hospitalsData] = await Promise.all([
        userApi.getUsers(),
        rolemasterApi.getRoles(),
        hospitalApi.getHospitals(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setHospitals(hospitalsData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const roleNameById = (id) => roles.find((r) => String(r.id) === String(id))?.role_name || `#${id}`;
  const hospitalNameById = (id) => hospitals.find((h) => String(h.id) === String(id))?.hospital_name || `#${id}`;

  const openCreateDialog = () => {
    setForm({ ...emptyForm, hospitalId: hospitals[0]?.id || "" });
    setError("");
    setCreateOpen(true);
  };

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await userApi.createUser(form);
      setCreateOpen(false);
      loadAll();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError((errors && errors.join(", ")) || err.response?.data?.message || "Failed to create user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (user) => {
    if (user.is_active) await userApi.deactivateUser(user.id);
    else await userApi.activateUser(user.id);
    loadAll();
  };

  const openResetDialog = (user) => {
    setResetTarget(user);
    setNewPassword("");
    setResetError("");
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError("");
    try {
      await userApi.resetUserPassword(resetTarget.id, newPassword);
      setResetTarget(null);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setResetError((errors && errors.join(", ")) || err.response?.data?.message || "Failed to reset password.");
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("username", { header: "Username" }),
      columnHelper.accessor("full_name", { header: "Full name" }),
      columnHelper.accessor("email", { header: "Email", cell: (info) => info.getValue() || "\u2014" }),
      columnHelper.accessor((row) => roleNameById(row.role_id), {
        id: "role",
        header: "Role",
        cell: (info) => <Chip size="small" label={info.getValue()} variant="outlined" />,
        filterFn: (row, columnId, value) => (!value ? true : String(row.original.role_id) === String(value)),
      }),
      columnHelper.accessor((row) => hospitalNameById(row.hospital_id), {
        id: "hospital",
        header: "Hospital",
      }),
      columnHelper.accessor("is_active", {
        id: "is_active",
        header: "Status",
        cell: (info) => (
          <Chip size="small" label={info.getValue() ? "Active" : "Inactive"} color={info.getValue() ? "success" : "default"} variant="outlined" />
        ),
        filterFn: (row, columnId, value) => (!value ? true : String(row.getValue(columnId)) === value),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        meta: { align: "right" },
        cell: ({ row }) => {
          const user = row.original;
          return (
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Tooltip title="Reset password">
                <IconButton size="small" onClick={() => openResetDialog(user)}>
                  <KeyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={user.is_active ? "Deactivate" : "Activate"}>
                <IconButton size="small" onClick={() => toggleActive(user)}>
                  {user.is_active ? <BlockIcon fontSize="small" color="error" /> : <CheckCircleIcon fontSize="small" color="success" />}
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roles, hospitals],
  );

  return (
    <Layout title="Users" subtitle="User Management">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog} sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}>
            Create user
          </Button>
        </Stack>

        <Paper sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataTable
              columns={columns}
              data={users}
              searchPlaceholder="Search users..."
              emptyMessage="No users created yet."
              filters={[
                { columnId: "role", label: "Role", options: roles.map((r) => ({ value: r.id, label: r.role_name })) },
                { columnId: "is_active", label: "Status", options: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }] },
              ]}
            />
          )}
        </Paper>
      </Box>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create user</DialogTitle>
        <form onSubmit={handleCreateSubmit}>
          <DialogContent dividers>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <TextField select label="Hospital" fullWidth required value={form.hospitalId} onChange={handleChange("hospitalId")}>
                {hospitals.map((h) => <MenuItem key={h.id} value={h.id}>{h.hospital_name}</MenuItem>)}
              </TextField>
              <TextField select label="Role" fullWidth required value={form.roleId} onChange={handleChange("roleId")}>
                {roles.map((r) => <MenuItem key={r.id} value={r.id}>{r.role_name} ({r.role_code})</MenuItem>)}
              </TextField>
              <TextField label="Username" fullWidth required value={form.userName} onChange={handleChange("userName")} />
              <TextField label="Full name" fullWidth required value={form.fullName} onChange={handleChange("fullName")} />
              <TextField label="Email" type="email" fullWidth value={form.email} onChange={handleChange("email")} />
              <TextField label="Password" type="password" fullWidth required helperText="Minimum 8 characters" value={form.password} onChange={handleChange("password")} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create user"}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={Boolean(resetTarget)} onClose={() => setResetTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Reset password for {resetTarget?.username}</DialogTitle>
        <form onSubmit={handleResetSubmit}>
          <DialogContent dividers>
            {resetError && <Alert severity="error" sx={{ mb: 3 }}>{resetError}</Alert>}
            <TextField label="New password" type="password" fullWidth required autoFocus helperText="Minimum 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} sx={{ mt: 0.5 }} />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setResetTarget(null)}>Cancel</Button>
            <Button type="submit" variant="contained">Reset password</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Layout>
  );
}
