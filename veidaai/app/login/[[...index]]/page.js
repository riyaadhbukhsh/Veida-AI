import { Box } from "@mui/material";
import SignInComponent from './SignInComponent';

export default function SignInPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SignInComponent />
    </Box>
  );
}