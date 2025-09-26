import { ClientSDK, PagesContext } from "@sitecore-marketplace-sdk/client";
import { SiteInfo } from "@/types";
import { getContextId } from "./client";

export async function bindToPageContext(client: ClientSDK | null, handlePageContextChange: (res: PagesContext) => void): Promise<SiteInfo> {
    const invalidSiteInfo: SiteInfo = { id: "-1", name: "", pageId: "", path: "" };

    try {
        const contextId = await getContextId(client);
        if (!contextId) {
            return invalidSiteInfo;
        }
        
        await client?.query(
            "pages.context", {
                subscribe: true,
                onSuccess: (res: PagesContext) => {
                    handlePageContextChange(res);
                },
            }
        );
        
        return invalidSiteInfo;
    } catch (error) {
        console.error("Client initialization failed:", error);
        return invalidSiteInfo;
    }
}

export async function processPageContext(pageContext: PagesContext): Promise<SiteInfo> {
    const invalidSiteInfo: SiteInfo = { id: "-1", name: "", pageId: "", path: "" };
    
    try {       
        return {
            id: pageContext?.siteInfo?.id ?? "",
            name: pageContext?.siteInfo?.name ?? "",
            pageId: pageContext?.pageInfo?.id ?? "",
            path: pageContext?.pageInfo?.route ?? ""
        };
    } catch (error) {
        console.error("Client initialization failed:", error);
        return invalidSiteInfo;
    }
}

export async function getActivePageDetails(client: ClientSDK | null): Promise<string[]> {

    try {       
        const collections = await client?.query(
            "pages.context"
        );
        console.log(collections);

        const siteInfo = collections?.data?.siteInfo;
        const pageInfo = collections?.data?.pageInfo;
        return siteInfo?.id && siteInfo?.name && pageInfo?.id && pageInfo?.path ? [siteInfo.id, siteInfo.name, pageInfo.id, pageInfo.path] : [];
    } catch (error) {
        console.error("Client initialization failed:", error);
        return [];
    }
}
