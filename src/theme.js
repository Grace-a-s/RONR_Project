import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#22577A' },
    secondary: { main: '#57CC99' },
    background: { default: '#dbf6ebff' },
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `linear-gradient(to bottom, rgba(87, 204, 153, 0.68) 0%, rgba(34,87,122,0.06) 100%)`,
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },
  },
});

export default theme;