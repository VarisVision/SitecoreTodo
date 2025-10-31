"use client";
import { useState, useEffect, useCallback } from "react";
import { Container, Flex } from "@chakra-ui/react";
import { PagesContext } from "@sitecore-marketplace-sdk/client";
import { useMarketplaceClient } from "@/utils/hooks/useMarketplaceClient";
import { bindToPageContext, processPageContext } from "@/utils/marketplace";
import { getModuleInstallationStatus } from "@/utils/moduleInstallation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import SetupView from "@/components/SetupView";
import ToDoView from "@/components/ToDoView";
import { SiteInfo } from "@/types";
import FloatingMenu from "@/components/FloatingMenu";

export default function Home() {
  const { client, error, isInitialized } = useMarketplaceClient();
  const [loading, setLoading] = useState(true);
  const [SiteInfo, setSiteInfo] = useState<SiteInfo>();
  const [moduleInstalled, setModuleInstalled] = useState<boolean | null>(null);

  const loadMarketplaceData = useCallback(async () => {
    async function handlePageContextChange(res: PagesContext) {
      const SiteInfo = await processPageContext(res);
      setSiteInfo(SiteInfo);
    }  
    
    if (!error && isInitialized && client) {
      setLoading(true);
      
      const installationStatus = await getModuleInstallationStatus(client);
      setModuleInstalled(installationStatus.isInstalled);

      if (installationStatus.isInstalled) {
        await bindToPageContext(client, handlePageContextChange);
      }
      setLoading(false);
    } else if (error) {
      console.error("Error initializing Marketplace client:", error);
    }
  }, [isInitialized, client, error]);

  useEffect(() => {
    loadMarketplaceData();
  }, [loadMarketplaceData]);



  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <FloatingMenu />
      <Container maxW={{ base: "container.sm", md: "container.md", lg: "container.lg" }} py={8} px={{ base: 4, md: 6 }}>
      {moduleInstalled === false && (
        <Flex 
          alignItems="center" 
          justifyContent="space-between" 
          py={4}
          flexWrap={{ base: "wrap", sm: "nowrap" }}
          gap={{ base: 2, sm: 0 }}
        >
        </Flex>
      )}

      {!moduleInstalled ? (
        <SetupView client={client} onInstallationComplete={loadMarketplaceData} />
      ) : (
        <ToDoView SiteInfo={SiteInfo} client={client} />
      )}
    </Container>
    </>
  );
}
