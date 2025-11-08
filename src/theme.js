import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#22577A' },
    secondary: { main: '#57cc99' },
    background: { default: '#c7f9cc' },
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body': {
          backgroundColor: '#c7f9cc',
          margin: 0,
          padding: 0,
          fontFamily: 'Inter, Arial, sans-serif',
        },
      },
    },
  },
});

export default theme;