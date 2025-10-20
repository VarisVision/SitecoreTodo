import {
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
} from "@chakra-ui/react";

export default function TodoNotConfigured() {
  return (
    <Stack gap="4">
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Page To Do Module Not Configured!</AlertTitle>
          <AlertDescription>
            The Page To Do module hasn&apos;t been set up for this site. Please click the settings icon (⚙️) above to install the module and ensure it is configured for this site.
          </AlertDescription>
        </Box>
      </Alert>
    </Stack>
  );
} 