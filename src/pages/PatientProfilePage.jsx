import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Paper, Typography, Tabs, Tab, Grid, Stack, Button, CircularProgress,
} from "@mui/material";
import { createColumnHelper } from "@tanstack/react-table";
import EditIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import StatusChip, { APPOINTMENT_STATUS_OPTIONS } from "../components/StatusChip";
import * as patientApi from "../api/patientApi";
import * as appointmentApi from "../api/appointmentApi";
import { useAuth } from "../context/AuthContext";

const columnHelper = createColumnHelper();

function InfoField({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1">{value || "—"}</Typography>
    </Box>
  );
}

export default function PatientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      patientApi.getPatientById(id),
      appointmentApi.getAppointmentsByPatient(id),
    ]).then(([patientData, appointmentData]) => {
      setPatient(patientData);
      setAppointments(appointmentData);
      setIsLoading(false);
    });
  }, [id]);

  const canManageAppointments = ["ADMIN", "HOSPITAL_ADMIN", "RECEPTIONIST"].includes(user?.roleCode);

  const appointmentColumns = useMemo(
    () => [
      columnHelper.accessor("slot_start", {
        header: "Date & time",
        cell: (info) => new Date(info.getValue()).toLocaleString(undefined, {
          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
        }),
      }),
      columnHelper.accessor("doctor_name", { header: "Doctor" }),
      columnHelper.accessor("type", { id: "type", header: "Type" }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Status",
        cell: (info) => <StatusChip status={info.getValue()} />,
        filterFn: (row, columnId, value) => (!value ? true : row.getValue(columnId) === value),
      }),
      columnHelper.accessor("fees", {
        header: "Fees",
        meta: { align: "right" },
        cell: (info) => `₹${info.getValue()}`,
      }),
    ],
    [],
  );

  const billingColumns = useMemo(
    () => [
      columnHelper.accessor("slot_start", {
        header: "Date",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.accessor("type", { header: "For" }),
      columnHelper.accessor("payment_mode", {
        id: "payment_mode",
        header: "Payment mode",
        cell: (info) => info.getValue()?.toUpperCase(),
      }),
      columnHelper.accessor("receiver_name", {
        header: "Collected by",
        cell: (info) => info.getValue() || "—",
      }),
      columnHelper.accessor("fees", {
        header: "Amount",
        meta: { align: "right" },
        cell: (info) => `₹${info.getValue()}`,
      }),
    ],
    [],
  );

  if (isLoading || !patient) {
    return (
      <Layout title="Patient Profile" subtitle="Patients">
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title={`${patient.first_name} ${patient.last_name || ""}`} subtitle={`${patient.mrn} · ${patient.mobile}`}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/patients")}>
            Back to patients
          </Button>
          <Button variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/patients/${id}/edit`)}>
            Edit
          </Button>
        </Stack>

        <Paper sx={{ border: "1px solid", borderColor: "divider" }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: "1px solid", borderColor: "divider", px: 2 }}>
            <Tab label="Patient Profile" />
            <Tab label="Appointments" />
            <Tab label="Billings" />
          </Tabs>

          {tab === 0 && (
            <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoField label="Gender" value={patient.gender} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoField label="Date of birth" value={patient.date_of_birth?.slice(0, 10)} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoField label="Preferred contact time" value={patient.preferred_contact_time} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoField label="Email" value={patient.email} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoField label="Blood group" value={patient.blood_group} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoField label="Occupation" value={patient.occupation} /></Grid>
                <Grid size={12}>
                  <InfoField
                    label="Address"
                    value={[patient.street, patient.locality, patient.city, patient.state, patient.pin_code].filter(Boolean).join(", ")}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoField label="Plan" value={patient.plan_type} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoField
                    label="Emergency contact"
                    value={patient.emergency_contact_name && `${patient.emergency_contact_name} — ${patient.emergency_contact_number || ""}`}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}><InfoField label="Referred by MRN/PRN" value={patient.referral_patient_mrn} /></Grid>
              </Grid>
            </Box>
          )}

          {tab === 1 && (
            <Box sx={{ p: { xs: 2.5, sm: 4 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
              {canManageAppointments && (
                <Box>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(`/appointments/new?patientId=${id}`)}>
                    Create Appointment
                  </Button>
                </Box>
              )}
              <DataTable
                columns={appointmentColumns}
                data={appointments}
                emptyMessage="No appointments yet."
                filters={[{ columnId: "status", label: "Status", options: APPOINTMENT_STATUS_OPTIONS }]}
              />
            </Box>
          )}

          {tab === 2 && (
            <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
              <DataTable
                columns={billingColumns}
                data={appointments}
                emptyMessage="No billing history yet."
                filters={[{
                  columnId: "payment_mode", label: "Payment",
                  options: [...new Set(appointments.map((a) => a.payment_mode).filter(Boolean))].map((m) => ({ value: m, label: m.toUpperCase() })),
                }]}
              />
            </Box>
          )}
        </Paper>
      </Box>
    </Layout>
  );
}
