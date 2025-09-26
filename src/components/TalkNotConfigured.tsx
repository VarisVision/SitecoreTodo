import {
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
} from "@chakra-ui/react";

export default function TalkNotConfigured() {
  return (
    <Stack gap="4">
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Talk Module Not Configured!</AlertTitle>
          <AlertDescription>
            The Talk module hasn&apos;t been set up for this site. Please click the settings icon (⚙️) above to install the module and ensure it is configured for this site.
          </AlertDescription>
        </Box>
      </Alert>
    </Stack>
  );
} 