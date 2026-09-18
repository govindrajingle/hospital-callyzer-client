import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Paper, Chip, Stack, Typography, IconButton, CircularProgress,
  ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { createColumnHelper } from "@tanstack/react-table";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import * as appointmentApi from "../api/appointmentApi";

const columnHelper = createColumnHelper();

const shiftDate = (date, view, direction) => {
  const next = new Date(date);
  if (view === "day") next.setDate(next.getDate() + direction);
  else if (view === "week") next.setDate(next.getDate() + direction * 7);
  else next.setMonth(next.getMonth() + direction);
  return next;
};

// Doctors only ever see their own appointments — the backend enforces this
// (GET /api/appointments/mine is scoped to req.user.userId), this page just
// gives them the day/week/month view over that scoped data.
export default function DoctorAppointmentsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState("week");
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      setAppointments(await appointmentApi.getMyAppointments({ view, date: date.toISOString() }));
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
        cell: (info) => (
          <Typography
            component="button"
            onClick={() => navigate(`/patients/${info.row.original.patient_id}`)}
            sx={{ border: 0, background: "none", p: 0, cursor: "pointer", color: "primary.main", fontWeight: 600 }}
          >
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor("mrn", { header: "MRN" }),
      columnHelper.accessor("type", { header: "Type" }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <Chip size="small" label={info.getValue()} variant="outlined" />,
      }),
    ],
    [navigate],
  );

  return (
    <Layout title="My Appointments" subtitle="Your schedule">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
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

        <Paper sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataTable
              columns={columns} data={appointments}
              searchPlaceholder="Search your appointments..."
              emptyMessage="No appointments in this range."
            />
          )}
        </Paper>
      </Box>
    </Layout>
  );
}
