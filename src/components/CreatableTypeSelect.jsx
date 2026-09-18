import { useState } from "react";
import { Autocomplete, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

// Typeable + selectable dropdown for the appointment "type" field. If the
// user types a value that isn't already in `options`, they're asked to
// confirm before it's treated as a new category — onChange is only called
// with confirmNewType=true after they say yes, which is what stops a stray
// typo from silently becoming a permanent category (per the client's
// explicit ask: "asked before finally added as new category").
export default function CreatableTypeSelect({ options, value, onChange, label = "Appointment type" }) {
  const [pendingValue, setPendingValue] = useState(null);
  const names = options.map((option) => option.type_name);

  const handleChange = (event, newValue) => {
    if (!newValue) {
      onChange("", false);
      return;
    }
    const isExisting = names.some((name) => name.toLowerCase() === newValue.toLowerCase());
    if (isExisting) {
      onChange(newValue, false);
    } else {
      setPendingValue(newValue);
    }
  };

  return (
    <>
      <Autocomplete
        freeSolo
        options={names}
        value={value || null}
        onChange={handleChange}
        onInputChange={(event, newInputValue, reason) => {
          if (reason === "input") onChange(newInputValue, false);
        }}
        renderInput={(params) => <TextField {...params} label={label} required />}
      />
      <Dialog open={Boolean(pendingValue)} onClose={() => setPendingValue(null)}>
        <DialogTitle>Add new appointment category?</DialogTitle>
        <DialogContent>
          <Typography>
            "{pendingValue}" isn't an existing category yet. Add it to the list for future use?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { onChange("", false); setPendingValue(null); }}>Cancel</Button>
          <Button variant="contained" onClick={() => { onChange(pendingValue, true); setPendingValue(null); }}>
            Yes, add it
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
