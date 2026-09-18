import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Box, Paper, TextField, Button, Grid, MenuItem, Alert, Typography,
  Autocomplete, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import Layout from "../components/Layout";
import CreatableTypeSelect from "../components/CreatableTypeSelect";
import * as appointmentApi from "../api/appointmentApi";
import * as patientApi from "../api/patientApi";
import * as userApi from "../api/userApi";
import { useAuth } from "../context/AuthContext";

const PAYMENT_MODES = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

const toDateInput = (iso) => new Date(iso).toISOString().slice(0, 10);
const toTimeInput = (iso) => new Date(iso).toISOString().slice(11, 16);

export default function AppointmentFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [types, setTypes] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patient, setPatient] = useState(null);
  const [patientOptions, setPatientOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Backend fallback for the "confirm new category" flow: CreatableTypeSelect
  // shows its own dialog when the Autocomplete's onChange fires (selecting
  // from the list, or pressing Enter), but typing a value and simply
  // tabbing/clicking away never fires that — so the server is the actual
  // source of truth on whether a type is new, and this dialog is what
  // catches that case instead of leaving the user at a dead-end error.
  const [pendingNewType, setPendingNewType] = useState(null);

  const [form, setForm] = useState({
    patientId: preselectedPatientId || "",
    doctorId: "",
    receiverName: user?.fullName || "",
    slotDate: new Date().toISOString().slice(0, 10),
    slotTime: "10:00",
    type: "",
    confirmNewType: false,
    fees: "",
    paymentMode: "cash",
  });

  useEffect(() => {
    appointmentApi.getAppointmentTypes().then(setTypes);
    userApi.getDoctors().then(setDoctors);

    if (preselectedPatientId) {
      patientApi.getPatientById(preselectedPatientId).then(setPatient);
    }

    if (isEditMode) {
      appointmentApi.getAppointmentById(id).then((appointment) => {
        setForm({
          patientId: appointment.patient_id,
          doctorId: appointment.doctor_id,
          receiverName: appointment.receiver_name || "",
          slotDate: toDateInput(appointment.slot_start),
          slotTime: toTimeInput(appointment.slot_start),
          type: appointment.type,
          fees: appointment.fees,
          paymentMode: appointment.payment_mode,
        });
        setPatient({
          id: appointment.patient_id,
          first_name: appointment.patient_first_name,
          last_name: appointment.patient_last_name,
          mrn: appointment.mrn,
        });
        setIsLoading(false);
      });
    }
  }, [id, isEditMode, preselectedPatientId]);

  const handlePatientSearch = async (query) => {
    if (!query) return;
    setPatientOptions(await patientApi.searchPatients({ name: query, mobile: query, mrn: query }));
  };

  const submitAppointment = async (confirmNewType) => {
    setError("");
    setIsSubmitting(true);

    try {
      const slotStart = new Date(`${form.slotDate}T${form.slotTime}:00`).toISOString();
      const payload = {
        patientId: Number(form.patientId),
        doctorId: Number(form.doctorId),
        receiverName: form.receiverName,
        slotStart,
        type: form.type,
        confirmNewType,
        fees: Number(form.fees),
        paymentMode: form.paymentMode,
      };

      const result = isEditMode
        ? await appointmentApi.updateAppointment(id, payload)
        : await appointmentApi.createAppointment(payload);

      if (!result.success && result.needsTypeConfirmation) {
        setPendingNewType(result.typeName);
        return;
      }

      if (!result.success && result.slotConflict) {
        setError(result.message || "This doctor already has an appointment booked in that slot.");
        return;
      }

      navigate(`/patients/${form.patientId}`);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError((errors && errors.join(", ")) || err.response?.data?.message || "Failed to save the appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    submitAppointment(form.confirmNewType);
  };

  const confirmNewTypeAndRetry = () => {
    setPendingNewType(null);
    setForm((f) => ({ ...f, confirmNewType: true }));
    submitAppointment(true);
  };

  if (isLoading) {
    return (
      <Layout title={isEditMode ? "Edit Appointment" : "Create Appointment"} subtitle="Appointments">
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title={isEditMode ? "Edit Appointment" : "Create Appointment"} subtitle="Appointments">
      <Box sx={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ alignSelf: "flex-start" }}>
          Back
        </Button>

        {error && <Alert severity="warning">{error}</Alert>}

        <Paper sx={{ p: { xs: 2.5, sm: 4 }, border: "1px solid", borderColor: "divider" }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid size={12}>
                {patient ? (
                  <TextField
                    label="Patient" fullWidth disabled
                    value={`${patient.first_name} ${patient.last_name || ""} (${patient.mrn})`}
                  />
                ) : (
                  <Autocomplete
                    options={patientOptions}
                    getOptionLabel={(option) => `${option.first_name} ${option.last_name || ""} (${option.mrn}) — ${option.mobile}`}
                    onInputChange={(e, val) => handlePatientSearch(val)}
                    onChange={(e, val) => { setPatient(val); setForm((f) => ({ ...f, patientId: val?.id || "" })); }}
                    renderInput={(params) => <TextField {...params} label="Search patient by name / MRN / mobile" required />}
                  />
                )}
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select label="Doctor" fullWidth required value={form.doctorId}
                  onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value }))}
                  helperText={doctors.length === 0 ? "No doctors found — create a DOCTOR-role user first." : ""}
                >
                  {doctors.map((d) => <MenuItem key={d.id} value={d.id}>{d.full_name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Date" type="date" fullWidth required value={form.slotDate}
                  onChange={(e) => setForm((f) => ({ ...f, slotDate: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Time" type="time" fullWidth required value={form.slotTime}
                  onChange={(e) => setForm((f) => ({ ...f, slotTime: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>

              <Grid size={12}>
                <CreatableTypeSelect
                  options={types} value={form.type}
                  onChange={(value, confirmNewType) => setForm((f) => ({ ...f, type: value, confirmNewType }))}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 4 }}>
                <TextField
                  label="Fees" type="number" fullWidth required value={form.fees}
                  onChange={(e) => setForm((f) => ({ ...f, fees: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <TextField
                  select label="Payment mode" fullWidth required value={form.paymentMode}
                  onChange={(e) => setForm((f) => ({ ...f, paymentMode: e.target.value }))}
                >
                  {PAYMENT_MODES.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Payment collected by" fullWidth value={form.receiverName}
                  onChange={(e) => setForm((f) => ({ ...f, receiverName: e.target.value }))}
                />
              </Grid>
              <Grid size={12}>
                <Typography variant="caption" color="text.secondary">
                  "Payment collected by" is whoever is handling payment for this specific appointment — not
                  necessarily the person creating the record.
                </Typography>
              </Grid>

              <Grid size={12}>
                <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ mt: 1 }}>
                  {isSubmitting ? "Saving..." : isEditMode ? "Save changes" : "Create appointment"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>

      <Dialog open={Boolean(pendingNewType)} onClose={() => setPendingNewType(null)}>
        <DialogTitle>Add new appointment category?</DialogTitle>
        <DialogContent>
          <Typography>
            "{pendingNewType}" isn't an existing category yet. Add it to the list and continue with this appointment?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingNewType(null)}>Cancel</Button>
          <Button variant="contained" onClick={confirmNewTypeAndRetry}>Yes, add it &amp; continue</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
