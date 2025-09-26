"use client";
import { useState, useEffect } from "react";
import {
  VStack,
  Heading,
  Text,
  Box,
  Button,
  Spinner,
  Divider,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { mdiCommentMultipleOutline } from "@mdi/js";
import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { createSitecoreTalkTemplates, getModuleInstallationStatus } from "@/utils/moduleInstallation";

interface SetupViewProps {
  client: ClientSDK | null;
}

export default function SetupView({ client }: SetupViewProps) {
  const [isModuleInstalled, setIsModuleInstalled] = useState<boolean | null>(null);
  const [isInstallingModule, setIsInstallingModule] = useState<boolean>(false);
  
  useEffect(() => {
    const checkModuleStatus = async () => {
      try {
        const status = await getModuleInstallationStatus(client);
        setIsModuleInstalled(status.isInstalled);
      } catch (error) {
        console.error('Error checking module status:', error);
        setIsModuleInstalled(false);
      }
    };
    checkModuleStatus();
  }, [client]);

  const handleInstallModule = async () => {
    setIsInstallingModule(true);
    try {
      console.log('Installing module...');
      const status = await createSitecoreTalkTemplates(client);           
      setIsModuleInstalled(status);
    } catch (error) {
      console.error('Error installing module:', error);
      alert('Failed to install module. Please try again.');
    } finally {
      setIsInstallingModule(false);
    }
  };

   
  return (
    <VStack spacing={8} align="stretch">
      <Flex 
        gap="4" 
        alignItems="center" 
        direction={{ base: "column", sm: "row" }}
        textAlign={{ base: "center", sm: "left" }}
      >
        <Icon 
        layerStyle="icon.subtle"
        boxSize="icon.lg"
        color="teal"
        height="50px"
        width="50px"
        >
          <path d={mdiCommentMultipleOutline} />          
        </Icon>                    
        <Heading size={{ base: "md", md: "lg" }}>Sitecore Talk - Setup</Heading>            
      </Flex>

      {/* Module Installation Section */}
      <Box>
        <Heading size={{ base: "sm", md: "md" }} mb={4}>Module Installation</Heading>
        <Text mb={4} fontSize={{ base: "sm", md: "md" }}>
          Install the templates for the Sitecore Talk module so it&apos;s ready to use.
        </Text>
        
        {isModuleInstalled === null ? (
          <Box mb={4} display="flex" alignItems="center">
            <Spinner size="sm" mr={2} />
            <Text fontSize={{ base: "sm", md: "md" }}>Checking module status...</Text>
          </Box>
        ) : isModuleInstalled ? (
          <Text color="green.500" fontWeight="bold" mb={4} fontSize={{ base: "sm", md: "md" }}>
            ✓ Module is installed
          </Text>
        ) : (
          <Button 
            colorScheme="blue" 
            onClick={handleInstallModule} 
            mb={4}
            size={{ base: "sm", md: "md" }}
            isLoading={isInstallingModule}
            loadingText="Installing"
            isDisabled={isInstallingModule}
          >
            Install Module
          </Button>
        )}       
        <Divider mb={4} />
      </Box>                  
      
    </VStack>
  );
} 