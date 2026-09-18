import { useState, useEffect } from "react";
import {
  Box, Paper, TextField, Button, Grid, Typography, Alert, CircularProgress,
  FormControlLabel, Checkbox, Stack,
} from "@mui/material";
import Layout from "../components/Layout";
import * as doctorScheduleApi from "../api/doctorScheduleApi";

// A doctor's own master form for their consultation hours — the
// appointment slot picker (used by Admin/Receptionist when booking) builds
// its grid directly from whatever is saved here. Until a doctor saves
// their own hours, the clinic default applies (9 AM-9 PM, 1-3 PM break) —
// this form always shows that default pre-filled so it reads as "here's
// what's in effect", not as an empty form.
export default function MySchedulePage() {
  const [form, setForm] = useState({
    startTime: "09:00", endTime: "21:00", hasBreak: true, breakStartTime: "13:00", breakEndTime: "15:00",
  });
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    doctorScheduleApi.getMySchedule().then((schedule) => {
      setForm({
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        hasBreak: Boolean(schedule.breakStartTime && schedule.breakEndTime),
        breakStartTime: schedule.breakStartTime || "13:00",
        breakEndTime: schedule.breakEndTime || "15:00",
      });
      setIsCustom(schedule.isCustom);
      setIsLoading(false);
    });
  }, []);

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const schedule = await doctorScheduleApi.updateMySchedule({
        startTime: form.startTime,
        endTime: form.endTime,
        breakStartTime: form.hasBreak ? form.breakStartTime : "",
        breakEndTime: form.hasBreak ? form.breakEndTime : "",
      });
      setIsCustom(schedule.isCustom);
      setSaved(true);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError((errors && errors.join(", ")) || err.response?.data?.message || "Failed to save your consultation hours.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout title="My Consultation Hours" subtitle="Scheduling">
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="My Consultation Hours" subtitle="Scheduling">
      <Box sx={{ maxWidth: 640 }}>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Set the hours you're available for appointments, and an optional lunch break. The receptionist's
          booking screen only ever offers slots inside this window.
        </Typography>

        {!isCustom && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You haven't set custom hours yet — the clinic default (9 AM–9 PM, 1–3 PM break) is shown below and
            currently applies. Save to make these your own.
          </Alert>
        )}
        {saved && <Alert severity="success" sx={{ mb: 3 }}>Consultation hours updated.</Alert>}
        {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

        <Paper sx={{ p: { xs: 2.5, sm: 4 }, border: "1px solid", borderColor: "divider" }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Available from" type="time" fullWidth required
                  value={form.startTime} onChange={handleChange("startTime")}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Available until" type="time" fullWidth required
                  value={form.endTime} onChange={handleChange("endTime")}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={<Checkbox checked={form.hasBreak} onChange={handleChange("hasBreak")} />}
                  label="I take a break during the day (e.g. lunch)"
                />
              </Grid>

              {form.hasBreak && (
                <>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Break from" type="time" fullWidth required
                      value={form.breakStartTime} onChange={handleChange("breakStartTime")}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Break until" type="time" fullWidth required
                      value={form.breakEndTime} onChange={handleChange("breakEndTime")}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                </>
              )}

              <Grid size={12}>
                <Stack direction="row" justifyContent="flex-end">
                  <Button type="submit" variant="contained" disabled={isSaving}>
                    {isSaving ? "Saving…" : "Save consultation hours"}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Layout>
  );
}
