import { createTheme, alpha } from "@mui/material/styles";

// Brand colors sampled directly from the actual Sozo Wellness & Esthetics
// logo (pixel-sampled: teal #00C8D2, black background, white wordmark) —
// not an arbitrary palette. Typography/shadow feel adapted from the
// licensed Materialize template, rebuilt on plain createTheme() + alpha()
// for compatibility with our installed MUI v9 (see prior notes on why the
// original CSS-variables system wasn't ported as-is).

const TEAL = "#00C8D2";
const TEAL_DARK = "#00A0A8";
const TEAL_LIGHT = "#4DDCE2";
const INK = "#0B0E14"; // near-black, matches the logo's own background

const sozoTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: TEAL,
      dark: TEAL_DARK,
      light: TEAL_LIGHT,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: INK,
      contrastText: "#FFFFFF",
    },
    error: { main: "#FF4D49", light: "#FF716D", dark: "#E64542" },
    warning: { main: "#FDB528", light: "#FDC453", dark: "#E4A324" },
    info: { main: "#26C6F9", light: "#51D1FA", dark: "#22B3E1" },
    success: { main: "#28C76F", light: "#53D28C", dark: "#24B364" },
    background: {
      default: "#F5F7F8",
      paper: "#FFFFFF",
    },
    text: {
      primary: "rgba(11, 14, 20, 0.9)",
      secondary: "rgba(11, 14, 20, 0.65)",
      disabled: "rgba(11, 14, 20, 0.4)",
    },
    divider: "rgba(11, 14, 20, 0.1)",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    fontSize: 13.125,
    h1: { fontSize: "2.875rem", fontWeight: 600, lineHeight: 1.478261 },
    h2: { fontSize: "2.375rem", fontWeight: 600, lineHeight: 1.473684 },
    h3: { fontSize: "1.75rem", fontWeight: 600, lineHeight: 1.5 },
    h4: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.583333 },
    h5: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.5556 },
    h6: { fontSize: "0.9375rem", fontWeight: 600, lineHeight: 1.466667 },
    subtitle1: { fontSize: "0.9375rem", lineHeight: 1.466667 },
    subtitle2: { fontSize: "0.8125rem", fontWeight: 400, lineHeight: 1.538462 },
    body1: { fontSize: "0.9375rem", lineHeight: 1.466667 },
    body2: { fontSize: "0.8125rem", lineHeight: 1.538462 },
    button: { fontSize: "0.9375rem", lineHeight: 1.466667, textTransform: "none", fontWeight: 500 },
    caption: { fontSize: "0.8125rem", lineHeight: 1.384615, letterSpacing: "0.4px" },
    overline: { fontSize: "0.75rem", lineHeight: 1.166667, letterSpacing: "0.8px", fontWeight: 700 },
  },
  components: {
    MuiButtonBase: { defaultProps: { disableRipple: false } },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, boxShadow: "none" },
        contained: {
          boxShadow: `0px 2px 6px ${alpha(TEAL, 0.35)}`,
          "&:hover": { boxShadow: `0px 4px 12px ${alpha(TEAL, 0.45)}` },
        },
        sizeLarge: { paddingTop: 10, paddingBottom: 10, fontSize: "0.95rem" },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: "0px 2px 10px rgba(11, 14, 20, 0.08)",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 24, "&:last-child": { paddingBottom: 24 } } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          backgroundColor: "#FFFFFF",
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
        }),
        notchedOutline: { borderColor: "rgba(11, 14, 20, 0.2)" },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 500, borderRadius: 6 } } },
    MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 500, minHeight: 48 } } },
    MuiDialogTitle: { styleOverrides: { root: { fontWeight: 600, fontSize: "1.25rem" } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 8 } } },
  },
});

export const brandColors = { TEAL, TEAL_DARK, TEAL_LIGHT, INK };
export default sozoTheme;
