import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Box, Paper, TextField, Button, Grid, MenuItem, Alert, Typography,
  Autocomplete, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  ToggleButton, Stack,
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

// .toISOString() always returns UTC, never the viewer's own clock — using
// it to pull out "the date"/"the time" silently shows UTC digits labeled
// as if they were local. These use the Date object's own local getters
// instead, so what's displayed is whatever wall-clock time the browser
// itself is set to (IST for this clinic's actual users).
const pad2 = (n) => String(n).padStart(2, "0");
const toDateInput = (value) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const toTimeInput = (value) => {
  const d = new Date(value);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
// Booking is future-only, so the date picker's native min is today.
const todayInput = toDateInput(new Date());

// The slot grid's underlying value/selection logic stays in 24-hour
// "HH:MM" (matches toTimeInput and what's sent to the backend) — this is
// purely for what's printed on each button, since a bare "14:30" reads as
// ambiguous/no AM-PM to most people.
const formatTime12h = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
};

export default function AppointmentFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [types, setTypes] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [staff, setStaff] = useState([]);
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

  // The doctor's OWN consultation-hours slot grid for the currently-chosen
  // doctor + date, each flagged available/booked/past/on-break — this is
  // what lets the receptionist pick a genuinely free time instead of
  // guessing one and hitting a 409 conflict or an outside-hours rejection.
  const [availableSlots, setAvailableSlots] = useState([]);
  const [doctorSchedule, setDoctorSchedule] = useState(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [form, setForm] = useState({
    patientId: preselectedPatientId || "",
    doctorId: "",
    // Defaults to whoever is creating the appointment — the most common
    // case — but is a real staff picker below so it can be reassigned to
    // whoever actually ends up collecting the payment.
    receiverId: user?.id || "",
    receiverName: user?.fullName || "",
    slotDate: new Date().toISOString().slice(0, 10),
    slotTime: "",
    type: "",
    confirmNewType: false,
    fees: "",
    paymentMode: "cash",
  });

  useEffect(() => {
    appointmentApi.getAppointmentTypes().then(setTypes);
    userApi.getDoctors().then(setDoctors);
    userApi.getStaff().then(setStaff);

    if (preselectedPatientId) {
      patientApi.getPatientById(preselectedPatientId).then(setPatient);
    }

    if (isEditMode) {
      appointmentApi.getAppointmentById(id).then((appointment) => {
        setForm({
          patientId: appointment.patient_id,
          doctorId: appointment.doctor_id,
          receiverId: appointment.receiver_id || "",
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

  // Re-fetches the doctor's available-slots grid whenever the doctor or date
  // changes, so the time picker below always reflects real availability
  // instead of letting the receptionist type a time blind. In edit mode the
  // appointment's own current slot is excluded from the "booked" set so it
  // still shows up as pickable (editing without changing the time works).
  useEffect(() => {
    if (!form.doctorId || !form.slotDate) {
      setAvailableSlots([]);
      return;
    }
    setIsLoadingSlots(true);
    appointmentApi
      .getAvailableSlots({ doctorId: form.doctorId, date: form.slotDate, excludeAppointmentId: id })
      .then(({ schedule, slots }) => {
        setDoctorSchedule(schedule);
        setAvailableSlots(slots);
      })
      .finally(() => setIsLoadingSlots(false));
  }, [form.doctorId, form.slotDate, id]);

  const handlePatientSearch = async (query) => {
    if (!query) return;
    setPatientOptions(await patientApi.searchPatients({ name: query, mobile: query, mrn: query }));
  };

  const submitAppointment = async (confirmNewType) => {
    if (!form.slotTime) {
      setError("Please pick an available time slot for this doctor.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const slotStart = new Date(`${form.slotDate}T${form.slotTime}:00`).toISOString();
      const payload = {
        patientId: Number(form.patientId),
        doctorId: Number(form.doctorId),
        receiverId: form.receiverId ? Number(form.receiverId) : null,
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
                  onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value, slotTime: "" }))}
                  helperText={doctors.length === 0 ? "No doctors found — create a DOCTOR-role user first." : ""}
                >
                  {doctors.map((d) => <MenuItem key={d.id} value={d.id}>{d.full_name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Date" type="date" fullWidth required value={form.slotDate}
                  onChange={(e) => setForm((f) => ({ ...f, slotDate: e.target.value, slotTime: "" }))}
                  // Booking is future-only — the date picker itself can't even
                  // open on a day before today (backend also enforces this on
                  // the actual slotStart, so this is a UX convenience, not the
                  // only guard).
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: todayInput } }}
                />
              </Grid>

              <Grid size={12}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Available time slots{form.slotDate ? ` — ${new Date(`${form.slotDate}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "short" })}` : ""}
                </Typography>
                {doctorSchedule && (
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                    Consults {formatTime12h(doctorSchedule.startTime)}–{formatTime12h(doctorSchedule.endTime)}
                    {doctorSchedule.breakStartTime && ` · Break ${formatTime12h(doctorSchedule.breakStartTime)}–${formatTime12h(doctorSchedule.breakEndTime)}`}
                    {!doctorSchedule.isCustom && " (clinic default — this doctor hasn't set their own hours)"}
                  </Typography>
                )}
                {!form.doctorId ? (
                  <Typography variant="body2" color="text.secondary">Pick a doctor to see their free slots.</Typography>
                ) : isLoadingSlots ? (
                  <Box sx={{ display: "flex", py: 2 }}><CircularProgress size={24} /></Box>
                ) : availableSlots.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No slots configured for this day.</Typography>
                ) : (
                  <>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {availableSlots.map((slot) => {
                        const timeLabel = toTimeInput(slot.slotStart);
                        const isSelected = form.slotTime === timeLabel;
                        // A slot that's booked by THIS appointment (edit mode, excluded
                        // server-side) still shows as available so re-saving without
                        // changing the time works. Four visual states: light red for
                        // slots someone else already booked, light orange for the
                        // doctor's own break window, muted grey for slots that have
                        // simply already passed today, default/selected for everything
                        // actually bookable.
                        return (
                          <ToggleButton
                            key={timeLabel}
                            value={timeLabel}
                            selected={isSelected}
                            disabled={!slot.isAvailable}
                            onClick={() => setForm((f) => ({ ...f, slotTime: timeLabel }))}
                            size="small"
                            sx={{
                              minWidth: 92,
                              textTransform: "none",
                              ...(slot.isBooked && {
                                bgcolor: "#ffebee",
                                color: "#c62828",
                                "&.Mui-disabled": { bgcolor: "#ffebee", color: "#c62828" },
                              }),
                              ...(slot.isBreak && !slot.isBooked && {
                                bgcolor: "#fff3e0",
                                color: "#e65100",
                                "&.Mui-disabled": { bgcolor: "#fff3e0", color: "#e65100" },
                              }),
                              ...(slot.isPast && !slot.isBooked && !slot.isBreak && {
                                bgcolor: "action.disabledBackground",
                                color: "text.disabled",
                              }),
                            }}
                          >
                            {slot.isBreak && !slot.isBooked ? "Break" : formatTime12h(timeLabel)}
                          </ToggleButton>
                        );
                      })}
                    </Box>
                    <Stack direction="row" spacing={2.5} sx={{ mt: 1.5 }} flexWrap="wrap">
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: "#ffebee", border: "1px solid #c62828" }} />
                        <Typography variant="caption" color="text.secondary">Already booked</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: "#fff3e0", border: "1px solid #e65100" }} />
                        <Typography variant="caption" color="text.secondary">Doctor's break</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: "action.disabledBackground", border: "1px solid", borderColor: "divider" }} />
                        <Typography variant="caption" color="text.secondary">Already passed</Typography>
                      </Stack>
                    </Stack>
                  </>
                )}
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
                  select label="Payment collected by" fullWidth required value={form.receiverId}
                  onChange={(e) => {
                    const selected = staff.find((s) => String(s.id) === String(e.target.value));
                    setForm((f) => ({
                      ...f,
                      receiverId: e.target.value,
                      receiverName: selected?.full_name || "",
                    }));
                  }}
                  helperText={staff.length === 0 ? "No staff found." : ""}
                >
                  {/* Edit mode may point at a since-deactivated staff member who
                      no longer appears in the active-staff list — keep them
                      selectable (by name only) so saving the form doesn't
                      silently drop the original receiver. */}
                  {form.receiverId && !staff.some((s) => String(s.id) === String(form.receiverId)) && (
                    <MenuItem value={form.receiverId}>{form.receiverName || "Unknown staff member"}</MenuItem>
                  )}
                  {staff.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.full_name}</MenuItem>
                  ))}
                </TextField>
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
