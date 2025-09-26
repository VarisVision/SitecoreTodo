'use client'
import { ChakraProvider } from '@chakra-ui/react';
import sitecoreTheme, { toastOptions } from '@sitecore/blok-theme'

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ChakraProvider theme={sitecoreTheme} toastOptions={toastOptions}>
      {children}
    </ChakraProvider>
  );
} 