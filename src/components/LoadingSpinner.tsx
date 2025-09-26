import { Spinner, Center, SpinnerProps } from "@chakra-ui/react";

interface LoadingSpinnerProps extends SpinnerProps {
  containerHeight?: string | number;
}

export const LoadingSpinner = ({ 
  containerHeight = "200px",
  size = "xl",
  color = "blue.500",
  ...props 
}: LoadingSpinnerProps) => {
  return (
    <Center height={containerHeight}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        size={size}
        color={color}
        {...props}
      />
    </Center>
  );
}; 