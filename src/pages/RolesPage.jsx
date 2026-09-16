import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box, Paper, Button, Stack, Typography, CircularProgress, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { createColumnHelper } from "@tanstack/react-table";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import * as rolemasterApi from "../api/rolemasterApi";

const columnHelper = createColumnHelper();
const emptyForm = { roleName: "", roleCode: "", parentRoleId: "" };

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      setRoles(await rolemasterApi.getRoles());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const roleNameById = (id) => (!id ? "\u2014 (top-level)" : roles.find((r) => String(r.id) === String(id))?.role_name || `#${id}`);

  const openCreateDialog = () => {
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  };

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await rolemasterApi.createRole({
        roleName: form.roleName,
        roleCode: form.roleCode.toUpperCase().replace(/\s+/g, "_"),
        parentRoleId: form.parentRoleId || null,
      });
      setDialogOpen(false);
      loadRoles();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError((errors && errors.join(", ")) || err.response?.data?.message || "Failed to create role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("role_name", {
        header: "Role name",
        cell: (info) => <Typography fontWeight={600}>{info.getValue()}</Typography>,
      }),
      columnHelper.accessor("role_code", {
        header: "Role code",
        cell: (info) => <Chip size="small" label={info.getValue()} variant="outlined" />,
      }),
      columnHelper.accessor((row) => roleNameById(row.parent_role_id), {
        id: "parent",
        header: "Parent role",
      }),
      columnHelper.accessor("created_at", {
        header: "Created",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roles],
  );

  return (
    <Layout title="Roles" subtitle="Role Management">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog} sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}>
            Create role
          </Button>
        </Stack>

        <Paper sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataTable columns={columns} data={roles} emptyMessage="No roles created yet." />
          )}
        </Paper>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create role</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <TextField label="Role name" fullWidth required placeholder="e.g. Senior Doctor" value={form.roleName} onChange={handleChange("roleName")} />
              <TextField label="Role code" fullWidth required placeholder="e.g. SENIOR_DOCTOR" helperText="Uppercase, no spaces \u2014 used internally for permission checks" value={form.roleCode} onChange={handleChange("roleCode")} />
              <TextField select label="Parent role" fullWidth helperText="Leave blank for a top-level role (e.g. Admin)" value={form.parentRoleId} onChange={handleChange("parentRoleId")}>
                <MenuItem value=""><em>None (top-level role)</em></MenuItem>
                {roles.map((role) => <MenuItem key={role.id} value={role.id}>{role.role_name}</MenuItem>)}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create role"}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Layout>
  );
}
