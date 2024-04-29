import { red } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: '#98FB98',
    },
    secondary: {
      main: '#000000',
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;
