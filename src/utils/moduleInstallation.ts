import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { CreateItemResponse, ModuleInstallationStatus } from "@/types";
import { getContextId, getSitecoreItemState, ModulesPath, ModulesSitecoreTalkDataPath, SitecoreTalkTemplatesPath } from "./client";



interface CreateTemplateFolderResponse {
    data: {
        data: {
            createItemTemplateFolder: {
                item: {
                    name: string;
                    itemId: string;
                };
            };
        };
    };
}

export interface SiteInfo {
    id: string;
    name: string;
    path: string;
}

interface SiteData {
    id?: string | null;
    name?: string | null;
    properties?: {
        rootPath?: string;
    };
}


async function getModuleFolderState(client: ClientSDK | null): Promise<ModuleInstallationStatus> {
   return await getSitecoreItemState(client, ModulesSitecoreTalkDataPath);
}
async function getTemplateFolderState(client: ClientSDK | null): Promise<ModuleInstallationStatus> {
    return await getSitecoreItemState(client, SitecoreTalkTemplatesPath);
}

export async function getModuleInstallationStatus(client: ClientSDK | null): Promise<ModuleInstallationStatus> {
    const invalidSiteInfo: ModuleInstallationStatus = { isInstalled: false };

    const contextId = await getContextId(client);
    if (!contextId) {
        return invalidSiteInfo;
    }

    const response = await getTemplateFolderState(client)

    const datafolder = await getModuleFolderState(client)
    return {
        isInstalled: (response?.isInstalled )  &&  (datafolder?.isInstalled),        
    };
}

export async function createSitecoreTalkTemplates(client: ClientSDK | null): Promise<boolean> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return false;
    }

    try {
        const templates = await getTemplateFolderState(client)
        if(templates.isInstalled === false)
        {
        // Create Sitecore Talk templates folder
            const stFolderResponse = await client?.mutate(
                "xmc.authoring.graphql",
                {
                    params: {
                        query: {
                            sitecoreContextId: contextId,
                        },
                        body: {
                            query: `mutation {
                                createItemTemplateFolder(
                                    input: {
                                        name: "Todos",
                                        parent: "{E6904C9A-3ACE-4B53-B465-4C05C6B1F1CC}"
                                    }
                                ) {
                                    item {
                                        name,
                                        itemId
                                    }
                                }
                            }`
                        }
                    }
                }
            ) as unknown as CreateTemplateFolderResponse;

            templates.itemId = stFolderResponse?.data?.data?.createItemTemplateFolder?.item?.itemId;
        }
        if (!templates.itemId) {
            console.error("Failed to create Sitecore Talk templates folder");
            return false;
        }
         
            // Create Talk Data template
            const scTalkResponse = await client?.mutate(
                "xmc.authoring.graphql",
                {
                    params: {
                        query: {
                            sitecoreContextId: contextId,
                        },
                        body: {
                            query: `mutation {
                                createItemTemplate(
                                    input: {
                                        name: "TodoData",
                                        parent: "${templates.itemId}",
                                        icon: "Applications/32x32/check2.png",
                                        sections: {
                                            name: "Data",
                                            fields: [
                                                {
                                                    name: "TodoData",
                                                    type: "Multi-Line Text",
                                                }                                                  
                                            ]
                                        }
                                    }
                                ) {
                                    itemTemplate  {
                                        name,
                                        templateId
                                    }
                                }
                            }`
                        }
                    }
                }
            );

            console.log("Created Sitecore Talk templates folder:", templates.itemId, scTalkResponse);          
        
    } catch (error) {
        console.error("Failed to create Sitecore Talk templates:", error);
        return false;
    }
    return await configureSite(client);      
}

export async function getSitesInformation(client: ClientSDK | null): Promise<SiteInfo[]> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return [];
    }

    try {
        const sites = await client?.query(
            "xmc.xmapp.listSites",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                },
            }
        );

        const siteInfos = await Promise.all(
            sites?.data?.data?.map(async (site: unknown) => {
                const siteData = site as SiteData;
                return {
                    name: siteData.name ?? '',                    
                    path: siteData.properties?.rootPath ?? '',
                    id: siteData.id ?? '',
                };
            }) ?? []
        );
        return siteInfos;

    } catch (error) {
        console.error("Failed to retrieve Sites information:", error);
        return [];
    }  
}

export async function configureSite(client: ClientSDK | null): Promise<boolean> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return false;
    }

    try {
        // Get System Modules folder
        const systemModulesFolderState = await getSitecoreItemState(client, ModulesPath);        
        if (!systemModulesFolderState.isInstalled) {
            console.error("Failed to get system modules folder");
            return false;
        }
        console.log("Retrieved system modules folder:", systemModulesFolderState.itemId);

         // Get Sitecore Talk Modules folder
         const sitecoreTalkModulesFolderState = await getSitecoreItemState(client, ModulesSitecoreTalkDataPath);
     
        if (!sitecoreTalkModulesFolderState.isInstalled) {
            console.log(`Creating Sitecore Talk modules folder ${contextId}`);
            sitecoreTalkModulesFolderState.itemId = await createSitecoreTalkModulesFolder(client, contextId);
        }
        console.log("Retrieved System Modules SitecoreTalk folder:", sitecoreTalkModulesFolderState.itemId);
        
        const sitecoreTalkDataState = await getSitecoreItemState(client, ModulesSitecoreTalkDataPath);

        if (!sitecoreTalkDataState.isInstalled) {
            console.error("Failed to get Sitecore Talk template");
            return false;
        }
        console.log("Sitecore Talk template:", sitecoreTalkDataState.itemId);
        
        return true;
    } catch (error) {
        console.error("Failed to configure site:", error);
        return false;
    }
}
async function createSitecoreTalkModulesFolder(client: ClientSDK | null, contextId: string): Promise<string> {
    try {        
        const modulesTodosFolderState = await getSitecoreItemState(client, `/sitecore/system/Modules/TodoData`);
        if(!modulesTodosFolderState.isInstalled){
            const modulesFolderState = await getSitecoreItemState(client, `/sitecore/system/Modules`);
            const response = await client?.mutate(
                "xmc.authoring.graphql",
                {
                    params: {
                        query: {
                            sitecoreContextId: contextId,
                        },
                        body: {
                            query: `mutation {
                                createItem(
                                    input: {
                                        name: "Todos",
                                        parent: "${modulesFolderState.itemId}",
                                        templateId: "{A87A00B1-E6DB-45AB-8B54-636FEC3B5523}", 
                                        language: "en",
                                        database: "master"
                                    }
                                ) {
                                    item {
                                        itemId,
                                        name,
                                        path
                                    }
                                }
                            }`
                        }
                    }
                }
            )as unknown as CreateItemResponse;
            modulesTodosFolderState.itemId = response?.data?.data?.createItem?.item?.itemId;
            if(!modulesTodosFolderState.itemId){
                console.error("Failed to create SitecoreTalk Module folder")
                return "";
            }
        }
         const dataFolder = await client?.mutate(
            "xmc.authoring.graphql",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                    body: {
                        query: `mutation {
                            createItem(
                                input: {
                                    name: "Data",
                                    parent: "${modulesTodosFolderState.itemId}",
                                    templateId: "{ADB6CA4F-03EF-4F47-B9AC-9CE2BA53FF97}", 
                                    language: "en",
                                    database: "master"
                                }
                            ) {
                                item {
                                    itemId,
                                    name,
                                    path
                                }
                            }
                        }`
                    }
                }
            }
        )as unknown as CreateItemResponse;
        return dataFolder?.data?.data?.createItem?.item?.itemId ?? null;

    } catch (error) {
        console.error("Failed to create SitecoreTalk modules folders:", error);
        return "";
    }
}