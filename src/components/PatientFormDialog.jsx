import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import * as patientApi from "../api/patientApi";

const GENDERS = ["Male", "Female", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const emptyForm = {
  firstName: "",
  lastName: "",
  mobile: "",
  dateOfBirth: "",
  gender: "",
  email: "",
  address: "",
  city: "",
  state: "",
  bloodGroup: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
};

export default function PatientFormDialog({ open, onClose, onSaved, editingPatient }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicates, setDuplicates] = useState(null); // null = no warning shown

  const isEditMode = Boolean(editingPatient);

  useEffect(() => {
    if (editingPatient) {
      setForm({
        firstName: editingPatient.first_name || "",
        lastName: editingPatient.last_name || "",
        mobile: editingPatient.mobile || "",
        dateOfBirth: editingPatient.date_of_birth
          ? editingPatient.date_of_birth.substring(0, 10)
          : "",
        gender: editingPatient.gender || "",
        email: editingPatient.email || "",
        address: editingPatient.address || "",
        city: editingPatient.city || "",
        state: editingPatient.state || "",
        bloodGroup: editingPatient.blood_group || "",
        emergencyContactName: editingPatient.emergency_contact_name || "",
        emergencyContactNumber: editingPatient.emergency_contact_number || "",
      });
    } else {
      setForm(emptyForm);
    }
    setDuplicates(null);
    setError("");
  }, [editingPatient, open]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const submit = async (confirmDuplicate = false) => {
    setError("");
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await patientApi.updatePatient(editingPatient.id, form);
        onSaved();
        return;
      }

      const result = await patientApi.createPatient({
        ...form,
        confirmDuplicate,
      });

      if (!result.success && result.duplicate) {
        setDuplicates(result.duplicates);
        return;
      }

      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(false);
  };

  const handleConfirmDuplicate = () => {
    submit(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? "Edit patient" : "Register new patient"}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {duplicates && (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
              action={
                <Button
                  color="warning"
                  size="small"
                  onClick={handleConfirmDuplicate}
                  disabled={isSubmitting}
                >
                  Register anyway
                </Button>
              }
            >
              <Typography variant="body2" fontWeight={600} gutterBottom>
                A patient with this mobile number and date of birth already exists:
              </Typography>
              <List dense disablePadding>
                {duplicates.map((d) => (
                  <ListItem key={d.id} disableGutters>
                    <ListItemText
                      primary={`${d.first_name} ${d.last_name || ""} \u2014 ${d.mrn}`}
                      secondary={`Mobile: ${d.mobile}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="First name"
                fullWidth
                required
                value={form.firstName}
                onChange={handleChange("firstName")}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Last name"
                fullWidth
                value={form.lastName}
                onChange={handleChange("lastName")}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Mobile"
                fullWidth
                required
                disabled={isEditMode === false && duplicates !== null}
                value={form.mobile}
                onChange={handleChange("mobile")}
                helperText="10 digits"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Date of birth"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.dateOfBirth}
                onChange={handleChange("dateOfBirth")}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                select
                label="Gender"
                fullWidth
                value={form.gender}
                onChange={handleChange("gender")}
              >
                {GENDERS.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Blood group"
                fullWidth
                value={form.bloodGroup}
                onChange={handleChange("bloodGroup")}
              >
                {BLOOD_GROUPS.map((bg) => (
                  <MenuItem key={bg} value={bg}>
                    {bg}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={form.email}
                onChange={handleChange("email")}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Address"
                fullWidth
                value={form.address}
                onChange={handleChange("address")}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="City"
                fullWidth
                value={form.city}
                onChange={handleChange("city")}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="State"
                fullWidth
                value={form.state}
                onChange={handleChange("state")}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Emergency contact
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Contact name"
                fullWidth
                value={form.emergencyContactName}
                onChange={handleChange("emergencyContactName")}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Contact number"
                fullWidth
                value={form.emergencyContactNumber}
                onChange={handleChange("emergencyContactNumber")}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditMode ? "Save changes" : "Register patient"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
