import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Paper, Typography, Tabs, Tab, Grid, Stack, Button, Chip, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody,
} from "@mui/material";
import EditIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import Layout from "../components/Layout";
import * as patientApi from "../api/patientApi";
import * as appointmentApi from "../api/appointmentApi";
import { useAuth } from "../context/AuthContext";

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
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date &amp; time</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Fees</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell>{new Date(a.slot_start).toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</TableCell>
                      <TableCell>{a.doctor_name}</TableCell>
                      <TableCell>{a.type}</TableCell>
                      <TableCell><Chip size="small" label={a.status} variant="outlined" /></TableCell>
                      <TableCell align="right">₹{a.fees}</TableCell>
                    </TableRow>
                  ))}
                  {appointments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>No appointments yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}

          {tab === 2 && (
            <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>For</TableCell>
                    <TableCell>Payment mode</TableCell>
                    <TableCell>Collected by</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell>{new Date(a.slot_start).toLocaleDateString()}</TableCell>
                      <TableCell>{a.type}</TableCell>
                      <TableCell>{a.payment_mode?.toUpperCase()}</TableCell>
                      <TableCell>{a.receiver_name || "—"}</TableCell>
                      <TableCell align="right">₹{a.fees}</TableCell>
                    </TableRow>
                  ))}
                  {appointments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>No billing history yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </Paper>
      </Box>
    </Layout>
  );
}
