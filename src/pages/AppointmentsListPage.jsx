import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Paper, Button, Chip, Stack, Typography, IconButton, CircularProgress,
  Tooltip, ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { createColumnHelper } from "@tanstack/react-table";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import * as appointmentApi from "../api/appointmentApi";
import { useAuth } from "../context/AuthContext";
import { isAdminRole } from "../components/AdminRoute";

const columnHelper = createColumnHelper();

const shiftDate = (date, view, direction) => {
  const next = new Date(date);
  if (view === "day") next.setDate(next.getDate() + direction);
  else if (view === "week") next.setDate(next.getDate() + direction * 7);
  else next.setMonth(next.getMonth() + direction);
  return next;
};

export default function AppointmentsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState("week");
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      setAppointments(await appointmentApi.getAppointments({ view, date: date.toISOString() }));
    } finally {
      setIsLoading(false);
    }
  }, [view, date]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("slot_start", {
        header: "Date & time",
        cell: (info) => new Date(info.getValue()).toLocaleString(undefined, {
          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
        }),
      }),
      columnHelper.accessor((row) => `${row.patient_first_name} ${row.patient_last_name || ""}`.trim(), {
        id: "patient",
        header: "Patient",
      }),
      columnHelper.accessor("mrn", { header: "MRN" }),
      columnHelper.accessor("doctor_name", { header: "Doctor" }),
      columnHelper.accessor("type", { header: "Type" }),
      columnHelper.accessor("payment_mode", {
        header: "Payment",
        cell: (info) => info.getValue().toUpperCase(),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <Chip size="small" label={info.getValue()} variant="outlined" />,
      }),
      ...(isAdminRole(user?.roleCode)
        ? [columnHelper.display({
            id: "actions",
            header: "Actions",
            meta: { align: "right" },
            cell: ({ row }) => (
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => navigate(`/appointments/${row.original.id}/edit`)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ),
          })]
        : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, navigate],
  );

  return (
    <Layout title="Appointments" subtitle="Scheduling">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <ToggleButtonGroup exclusive size="small" value={view} onChange={(e, v) => v && setView(v)}>
              <ToggleButton value="day">Day</ToggleButton>
              <ToggleButton value="week">Week</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
            </ToggleButtonGroup>
            <IconButton onClick={() => setDate((d) => shiftDate(d, view, -1))}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography fontWeight={600}>{date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</Typography>
            <IconButton onClick={() => setDate((d) => shiftDate(d, view, 1))}>
              <ChevronRightIcon />
            </IconButton>
          </Stack>
          <Button
            variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/appointments/new")}
            sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}
          >
            Create Appointment
          </Button>
        </Stack>

        <Paper sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataTable
              columns={columns} data={appointments}
              searchPlaceholder="Search appointments..."
              emptyMessage="No appointments in this range."
            />
          )}
        </Paper>
      </Box>
    </Layout>
  );
}
