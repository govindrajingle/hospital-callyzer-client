import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Paper, TextField, Button, Grid, MenuItem, Alert, List, ListItem, ListItemText,
  Typography, Divider, Stack, FormControlLabel, Checkbox, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, FormHelperText,
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

const NAME_PATTERN = /^[a-zA-Z\s.'-]+$/;
const TEN_DIGIT_PATTERN = /^[0-9]{10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TERMS_CLAUSES = [
  "I have seen the type of plan and charges thereof, and agree to pay the same and I am fully aware that the charges paid by me are not refundable, adjustable or transferable.",
  "The Doctor or the clinic has given no guarantees to me about the results and duration of the treatment.",
  "I agree that neither the Doctor, nor the Clinic and its directors, employees shall have any liability towards me under any theory of liability or indemnity in connection with my treatment. I hereby release and forever waive any and all claims I may have against the Doctor, Clinic, its directors and employees in connection with my treatment.",
  "Purely to help and educate fellow sufferers, I have no objection to you observing, photographing the treatment performed including publishing before & after pictures depicting improvement in my health/condition in any media for medical, scientific or educational purpose provided my identity is not revealed by the pictures or by descriptive text accompanying them.",
  "I agree to inform the Doctor of my medical history and any allergy that I may have and also agree to co-operate fully with him/her and to follow to the best of my ability his/her instructions and recommendations about my treatment.",
  "I sign this Registration Form and a copy of the same is retained by me in token of having agreed to the terms herein contained applicable for the registration, extension and renewal thereof.",
];

const emptyForm = {
  firstName: "", middleName: "", lastName: "", mobile: "", dateOfBirth: "", gender: "", email: "",
  street: "", locality: "", landmark: "", city: "", state: "", pinCode: "", country: "India",
  telephoneResidence: "", telephoneOffice: "", faxNumber: "", preferredContactTime: "",
  bloodGroup: "", occupation: "", maritalStatus: "",
  planType: "", planExpiresDate: "", ailment: "",
  referralSource: "", referralPersonName: "", referralPatientMrn: "",
  emergencyContactName: "", emergencyContactNumber: "",
  consentTerms: false, consentMarketing: false,
};

export default function PatientFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [duplicates, setDuplicates] = useState(null);
  const [mrn, setMrn] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      patientApi.getPatientById(id).then((patient) => {
        setForm({
          firstName: patient.first_name || "",
          middleName: patient.middle_name || "",
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
          preferredContactTime: patient.preferred_contact_time || "",
          bloodGroup: patient.blood_group || "",
          occupation: patient.occupation || "",
          maritalStatus: patient.marital_status || "",
          planType: patient.plan_type || "",
          planExpiresDate: patient.plan_expires_date ? patient.plan_expires_date.substring(0, 10) : "",
          ailment: patient.ailment || "",
          referralSource: patient.referral_source || "",
          referralPersonName: patient.referral_person_name || "",
          referralPatientMrn: patient.referral_patient_mrn || "",
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
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Client-side checks mirror the backend's rules exactly, so the user sees
  // a mistake immediately instead of after a round trip — the backend
  // still re-validates everything regardless (never trust the client alone).
  const validateForm = () => {
    const errors = {};

    if (!form.firstName.trim()) errors.firstName = "First name is required";
    else if (!NAME_PATTERN.test(form.firstName)) errors.firstName = "Letters, spaces, apostrophes, or hyphens only";

    if (form.middleName && !NAME_PATTERN.test(form.middleName)) errors.middleName = "Letters, spaces, apostrophes, or hyphens only";
    if (form.lastName && !NAME_PATTERN.test(form.lastName)) errors.lastName = "Letters, spaces, apostrophes, or hyphens only";

    if (!form.mobile.trim()) errors.mobile = "Mobile number is required";
    else if (!TEN_DIGIT_PATTERN.test(form.mobile)) errors.mobile = "Must be exactly 10 digits";

    if (!form.street.trim()) errors.street = "Street is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.state.trim()) errors.state = "State is required";

    if (form.email && !EMAIL_PATTERN.test(form.email)) errors.email = "Enter a valid email address";

    if (form.emergencyContactNumber && !TEN_DIGIT_PATTERN.test(form.emergencyContactNumber)) {
      errors.emergencyContactNumber = "Must be exactly 10 digits";
    }

    if (!isEditMode && !form.consentTerms) {
      errors.consentTerms = "You must agree to the Terms & Conditions to register this patient";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setConfirmOpen(true);
  };

  const handleConfirmedSubmit = () => {
    setConfirmOpen(false);
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

        <Box component="form" onSubmit={handleFormSubmit} noValidate>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5 }}>Personal details</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="First name" fullWidth required value={form.firstName} onChange={handleChange("firstName")} error={Boolean(fieldErrors.firstName)} helperText={fieldErrors.firstName} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Middle name" fullWidth value={form.middleName} onChange={handleChange("middleName")} error={Boolean(fieldErrors.middleName)} helperText={fieldErrors.middleName} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Last name (surname)" fullWidth value={form.lastName} onChange={handleChange("lastName")} error={Boolean(fieldErrors.lastName)} helperText={fieldErrors.lastName} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Date of birth"
                type="date"
                fullWidth
                value={form.dateOfBirth}
                onChange={handleChange("dateOfBirth")}
                slotProps={{ inputLabel: { shrink: true } }}
              />
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
              <TextField
                label="Mobile" fullWidth required
                helperText={fieldErrors.mobile || "10 digits"}
                error={Boolean(fieldErrors.mobile)}
                value={form.mobile} onChange={handleChange("mobile")}
                disabled={duplicates !== null}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Email" type="email" fullWidth value={form.email} onChange={handleChange("email")} error={Boolean(fieldErrors.email)} helperText={fieldErrors.email} />
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
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select label="Preferred contact time" fullWidth value={form.preferredContactTime} onChange={handleChange("preferredContactTime")}>
                <MenuItem value=""><em>Not specified</em></MenuItem>
                <MenuItem value="AM">Morning (AM)</MenuItem>
                <MenuItem value="PM">Afternoon/Evening (PM)</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5 }}>Address</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Street" fullWidth required value={form.street} onChange={handleChange("street")} error={Boolean(fieldErrors.street)} helperText={fieldErrors.street} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Locality" fullWidth value={form.locality} onChange={handleChange("locality")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Landmark (if any)" fullWidth value={form.landmark} onChange={handleChange("landmark")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="City" fullWidth required value={form.city} onChange={handleChange("city")} error={Boolean(fieldErrors.city)} helperText={fieldErrors.city} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="State" fullWidth required value={form.state} onChange={handleChange("state")} error={Boolean(fieldErrors.state)} helperText={fieldErrors.state} />
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
              <TextField
                label="Plan expires"
                type="date"
                fullWidth
                value={form.planExpiresDate}
                onChange={handleChange("planExpiresDate")}
                helperText="Optional"
                slotProps={{ inputLabel: { shrink: true } }}
              />
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
              <TextField label="Contact number" fullWidth value={form.emergencyContactNumber} onChange={handleChange("emergencyContactNumber")} error={Boolean(fieldErrors.emergencyContactNumber)} helperText={fieldErrors.emergencyContactNumber} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5 }}>How did you come to know about us?</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Source" fullWidth value={form.referralSource} onChange={handleChange("referralSource")}>
                <MenuItem value=""><em>Not specified</em></MenuItem>
                {REFERRAL_SOURCES.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
              </TextField>
            </Grid>
            {form.referralSource === "PATIENT_REFERRAL" && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Referring patient's name" fullWidth value={form.referralPersonName} onChange={handleChange("referralPersonName")} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Referring patient's MRN/PRN" fullWidth value={form.referralPatientMrn} onChange={handleChange("referralPatientMrn")} helperText="Optional, if known" />
                </Grid>
              </>
            )}
          </Grid>

          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Terms & Conditions</Typography>

          {!isEditMode && (
            <Paper variant="outlined" sx={{ p: 2.5, mb: 2, maxHeight: 260, overflowY: "auto", bgcolor: "background.default" }}>
              <List dense disablePadding>
                {TERMS_CLAUSES.map((clause, index) => (
                  <ListItem key={index} alignItems="flex-start" sx={{ display: "list-item", listStyleType: "decimal", ml: 3, py: 1 }}>
                    <ListItemText primary={clause} slotProps={{ primary: { variant: "body2" } }} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          <Stack spacing={0.5}>
            {!isEditMode && (
              <>
                <FormControlLabel
                  control={<Checkbox checked={form.consentTerms} onChange={handleChange("consentTerms")} />}
                  label="I have read and agree to the Terms & Conditions above."
                />
                {fieldErrors.consentTerms && (
                  <FormHelperText error sx={{ ml: 4 }}>{fieldErrors.consentTerms}</FormHelperText>
                )}
              </>
            )}
            <FormControlLabel
              control={<Checkbox checked={form.consentMarketing} onChange={handleChange("consentMarketing")} />}
              label="I would like to receive promotional Email & SMS."
            />
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 5 }}>
            <Button onClick={() => navigate("/patients")}>Cancel</Button>
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? "Saving\u2026" : isEditMode ? "Save changes" : "Review & register"}
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm patient registration</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please confirm the details below are correct before registering.
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 2 }}>
            <Typography><strong>Name:</strong> {[form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ")}</Typography>
            <Typography><strong>Mobile:</strong> {form.mobile}</Typography>
            <Typography><strong>Address:</strong> {[form.street, form.city, form.state].filter(Boolean).join(", ")}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>Go back and edit</Button>
          <Button variant="contained" onClick={handleConfirmedSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Registering\u2026" : "Confirm & register"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
