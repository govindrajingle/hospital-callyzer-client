import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Paper, TextField, Button, Grid, MenuItem, Alert, List, ListItem, ListItemText,
  Typography, Divider, Stack, FormControlLabel, Checkbox, CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import Layout from "../components/Layout";
import * as patientApi from "../api/patientApi";

const GENDERS = ["Male", "Female", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MARITAL_STATUSES = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "OTHER"];
const REFERRAL_SOURCES = [
  { value: "PATIENT_REFERRAL", label: "Another patient" },
  { value: "WEBSITE", label: "Website" },
  { value: "NEWSPAPER", label: "Newspaper" },
  { value: "MAGAZINE", label: "Magazine" },
  { value: "RADIO", label: "Radio" },
  { value: "TELEVISION", label: "Television" },
  { value: "HOARDING", label: "Hoarding" },
  { value: "SOCIAL_MEDIA", label: "Social media" },
  { value: "OTHER", label: "Other" },
];

const emptyForm = {
  firstName: "", lastName: "", mobile: "", dateOfBirth: "", gender: "", email: "",
  street: "", locality: "", landmark: "", city: "", state: "", pinCode: "", country: "India",
  telephoneResidence: "", telephoneOffice: "", faxNumber: "",
  bloodGroup: "", occupation: "", maritalStatus: "",
  planType: "", planExpiresDate: "", ailment: "",
  referralSource: "", referralPersonName: "",
  emergencyContactName: "", emergencyContactNumber: "",
  consentTerms: false, consentMarketing: false,
};

// Field labels/groupings mirror Sozo\'s actual paper registration form
// (Patient Code No, Name, Address block, Tel No Res/Off, Mobile, Fax,
// Email, DOB, Occupation, Marital Status, Sex, Type of Plan, Plan expires,
// Ailment, referral source, and the consent/marketing sign-off).
export default function PatientFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [duplicates, setDuplicates] = useState(null);
  const [mrn, setMrn] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      patientApi.getPatientById(id).then((patient) => {
        setForm({
          firstName: patient.first_name || "",
          lastName: patient.last_name || "",
          mobile: patient.mobile || "",
          dateOfBirth: patient.date_of_birth ? patient.date_of_birth.substring(0, 10) : "",
          gender: patient.gender || "",
          email: patient.email || "",
          street: patient.street || "",
          locality: patient.locality || "",
          landmark: patient.landmark || "",
          city: patient.city || "",
          state: patient.state || "",
          pinCode: patient.pin_code || "",
          country: patient.country || "India",
          telephoneResidence: patient.telephone_residence || "",
          telephoneOffice: patient.telephone_office || "",
          faxNumber: patient.fax_number || "",
          bloodGroup: patient.blood_group || "",
          occupation: patient.occupation || "",
          maritalStatus: patient.marital_status || "",
          planType: patient.plan_type || "",
          planExpiresDate: patient.plan_expires_date ? patient.plan_expires_date.substring(0, 10) : "",
          ailment: patient.ailment || "",
          referralSource: patient.referral_source || "",
          referralPersonName: patient.referral_person_name || "",
          emergencyContactName: patient.emergency_contact_name || "",
          emergencyContactNumber: patient.emergency_contact_number || "",
          consentTerms: patient.consent_terms || false,
          consentMarketing: patient.consent_marketing || false,
        });
        setMrn(patient.mrn);
        setIsLoading(false);
      });
    }
  }, [id, isEditMode]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (confirmDuplicate = false) => {
    setError("");
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await patientApi.updatePatient(id, form);
        navigate("/patients");
        return;
      }

      const result = await patientApi.createPatient({ ...form, confirmDuplicate });

      if (!result.success && result.duplicate) {
        setDuplicates(result.duplicates);
        return;
      }

      navigate("/patients");
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError((errors && errors.join(", ")) || err.response?.data?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(false);
  };

  if (isLoading) {
    return (
      <Layout title="Patients" subtitle="Patient Management">
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title={isEditMode ? "Edit patient" : "Register patient"} subtitle="Patient Management">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/patients")} sx={{ mb: 3 }}>
        Back to patients
      </Button>

      <Paper sx={{ p: { xs: 3, sm: 5 }, maxWidth: 960, mx: "auto" }}>
        {mrn && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="overline" color="text.secondary">Patient code</Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">{mrn}</Typography>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

        {duplicates && (
          <Alert
            severity="warning"
            sx={{ mb: 4 }}
            action={
              <Button color="warning" size="small" onClick={() => submit(true)} disabled={isSubmitting}>
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
                  <ListItemText primary={`${d.first_name} ${d.last_name || ""} — ${d.mrn}`} secondary={`Mobile: ${d.mobile}`} />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5 }}>Personal details</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="First name" fullWidth required value={form.firstName} onChange={handleChange("firstName")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Last name (surname)" fullWidth value={form.lastName} onChange={handleChange("lastName")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Date of birth" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.dateOfBirth} onChange={handleChange("dateOfBirth")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select label="Sex" fullWidth value={form.gender} onChange={handleChange("gender")}>
                {GENDERS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select label="Marital status" fullWidth value={form.maritalStatus} onChange={handleChange("maritalStatus")}>
                {MARITAL_STATUSES.map((m) => <MenuItem key={m} value={m}>{m.charAt(0) + m.slice(1).toLowerCase()}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Occupation" fullWidth value={form.occupation} onChange={handleChange("occupation")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Blood group" fullWidth value={form.bloodGroup} onChange={handleChange("bloodGroup")}>
                {BLOOD_GROUPS.map((bg) => <MenuItem key={bg} value={bg}>{bg}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5 }}>Contact details</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Mobile" fullWidth required helperText="10 digits" value={form.mobile} onChange={handleChange("mobile")} disabled={duplicates !== null} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Email" type="email" fullWidth value={form.email} onChange={handleChange("email")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Telephone (residence)" fullWidth value={form.telephoneResidence} onChange={handleChange("telephoneResidence")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Telephone (office)" fullWidth value={form.telephoneOffice} onChange={handleChange("telephoneOffice")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Fax number" fullWidth value={form.faxNumber} onChange={handleChange("faxNumber")} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5 }}>Address</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Street" fullWidth value={form.street} onChange={handleChange("street")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Locality" fullWidth value={form.locality} onChange={handleChange("locality")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Landmark (if any)" fullWidth value={form.landmark} onChange={handleChange("landmark")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="City" fullWidth value={form.city} onChange={handleChange("city")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="State" fullWidth value={form.state} onChange={handleChange("state")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="PIN code" fullWidth value={form.pinCode} onChange={handleChange("pinCode")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Country" fullWidth value={form.country} onChange={handleChange("country")} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5 }}>Treatment plan</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Type of plan" fullWidth value={form.planType} onChange={handleChange("planType")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Plan expires" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.planExpiresDate} onChange={handleChange("planExpiresDate")} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Ailment" fullWidth multiline rows={2} value={form.ailment} onChange={handleChange("ailment")} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5 }}>Emergency contact</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Contact name" fullWidth value={form.emergencyContactName} onChange={handleChange("emergencyContactName")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Contact number" fullWidth value={form.emergencyContactNumber} onChange={handleChange("emergencyContactNumber")} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5 }}>How did you come to know about us?</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Source" fullWidth value={form.referralSource} onChange={handleChange("referralSource")}>
                {REFERRAL_SOURCES.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
              </TextField>
            </Grid>
            {form.referralSource === "PATIENT_REFERRAL" && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Referring patient's name" fullWidth value={form.referralPersonName} onChange={handleChange("referralPersonName")} />
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 4 }} />
          <Stack spacing={1.5}>
            <FormControlLabel
              control={<Checkbox checked={form.consentTerms} onChange={handleChange("consentTerms")} />}
              label="Patient has seen and agreed to Sozo's terms, charges, and consent for treatment photography/records as per the registration form."
            />
            <FormControlLabel
              control={<Checkbox checked={form.consentMarketing} onChange={handleChange("consentMarketing")} />}
              label="Patient would like to receive promotional email & SMS updates."
            />
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 5 }}>
            <Button onClick={() => navigate("/patients")}>Cancel</Button>
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? "Saving\u2026" : isEditMode ? "Save changes" : "Register patient"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Layout>
  );
}
