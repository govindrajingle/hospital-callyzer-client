import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'

// Actually loads the Inter font files locally — without this, the
// "Inter" name in theme.js's fontFamily silently falls back to a generic
// system font, which is why everything looked plain/default before.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'

import sozoTheme from './theme/theme'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={sozoTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
