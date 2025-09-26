import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { CreateItemResponse, ModuleInstallationStatus, QueryFieldResponse, QueryItemResponse, SitecoreTalkData, ChatMessage } from "@/types";

export const ModulesPath = `/sitecore/System/Modules/`
export const ModulesSitecoreTalkDataPath = `/sitecore/System/Modules/Todos/Data`;
export const SitecoreTalkTemplatesPath = `/sitecore/templates/Modules/Todos/TodoData`;
export const SitecoreTalkDataTemplateName = "TodoData";

export async function getContextId(client: ClientSDK | null): Promise<string | null> {
    try {
       
        const application = await client?.query("application.context");
        const sitecoreContextId = application?.data?.resources?.[0]?.context?.preview;
        
        if (!sitecoreContextId) {
            throw new Error("Failed to get sitecore context ID");
        }
        
        return sitecoreContextId;
    } catch (error) {
        console.error("Failed to get sitecore context ID:", error);
        return null;
    }
}
export async function getSitecoreItemState(client: ClientSDK| null, path: string): Promise<ModuleInstallationStatus> {    
    const invalidSiteInfo: ModuleInstallationStatus = { isInstalled: false};
    const contextId = await getContextId(client);
   
    if (!contextId) {
        return invalidSiteInfo;
    }
       const response = await client?.mutate(
        "xmc.authoring.graphql",
        {
            params: {
                query: {
                    sitecoreContextId: contextId,
                },
                body: {
                    query: `{
                        item(
                            where: {
                                database: "master",
                                path: "${path}"
                            }
                        )
                        {
                            itemId,
                            name,
                            path
                        }
                    }`
                }
            }
        }
    ) as unknown as QueryItemResponse;
    return response?.data?.data?.item?.path ? { isInstalled: true, itemId: response.data.data.item.itemId } : { isInstalled: false };
}

export async function createSitecoreTalkItemForPage(client: ClientSDK | null): Promise<boolean> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return false;
    }

    const templatesState = await getSitecoreItemState(client, SitecoreTalkTemplatesPath);
    if (!templatesState.isInstalled) {
        console.error("Failed to get Sitecore Talk templates folder");
        return false;
    }
    const dataFolderState = await getSitecoreItemState(client, ModulesSitecoreTalkDataPath);
    if (!dataFolderState.isInstalled) {
        console.error("Failed to get Sitecore Talk Data folder");
        return false;
    }

    try {
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
                                    name: "SitecoreTalkPage",
                                    templateId: "${templatesState.itemId}",
                                    parent: "${dataFolderState.itemId}"
                                }
                            ) {
                                item {
                                    itemId
                                }
                            }
                        }`
                    }
                }
            }
        )as unknown as CreateItemResponse;
        const itemId = response?.data?.data?.createItem?.item?.itemId;

        if (!itemId) {
            console.error("Failed to create Sitecore Talk item for page");
            return false;
        }

        return itemId ? true : false;
    } catch (error) {
        console.error("Failed to create Sitecore Talk item for page:", error);
        return false;
    }
}

export async function getSitecoreTalkDataTemplateId(client: ClientSDK | null): Promise<string | null> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return null;
    }

    try {
        const response = await client?.mutate(
            "xmc.authoring.graphql",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                    body: {
                        query: `{
                            item(
                                where: {
                                    database: "master",
                                    path: "${SitecoreTalkTemplatesPath}"
                                }
                            ) {
                                itemId,
                                name
                            }
                        }`
                    }
                }
            }
        ) as unknown as QueryItemResponse;

        return response?.data?.data?.item?.itemId ?? null;
    } catch (error) {
        console.error("Failed to get SitecoreTalkData template ID:", error);
        return null;
    }
}

export async function getSitecoreTalkDataForPage(client: ClientSDK | null, pageItemId: string): Promise<SitecoreTalkData | null> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return null;
    }
    try {
        const response = await client?.mutate(
            "xmc.preview.graphql",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                    body: {
                        query: `query  {
                                    {
                                        total
                                        results {
                                            id
                                            field(name: "TodoData") {
                                                jsonValue                                                
                                            }
                                        }
                                    }
                                }`
                    }
                }
            }
        ) as unknown as QueryFieldResponse;

        const talkField = response?.data?.data.search?.results ?? [];
        console.log("getSitecoreTalkDataForPage results for SitecoreTalk data items:", talkField);
        let talkdata;

        if (talkField?.[0]) {
            try {
                talkdata = JSON.parse(talkField?.[0]?.field.jsonValue?.value);
            } catch (e) {
                console.warn("Failed to parse Talk field JSON:", e);
            }
        }
        
        return {
            itemId: talkField?.[0]?.id ?? '',
            talk: talkdata
        };
    } catch (error) {
        console.error("Failed to fetch SitecoreTalk data for page:", error);
        return null;
    }
}

export async function createSitecoreTalkDataItem(
    client: ClientSDK | null, 
    pageItemId: string,
    pageName?: string
): Promise<string | null> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return null;
    }

    try {
        // First check if item already exists (by Link field = itemId)
        const existingData = await getSitecoreTalkDataForPage(client, pageItemId);
        if (existingData) {
            console.log('SitecoreTalk data item already exists for page:', pageItemId);
            return existingData.itemId;
        }

        // Use the pageName if provided, otherwise create from itemId
        const itemName = pageName ?? `Talk-${pageItemId.substring(1, 9)}`;
        const safeItemName = itemName.replace(/[^a-zA-Z0-9\s-_]/g, '').trim() || 'TalkData';
        console.log('Creating SitecoreTalk data item with name:', itemName, '->', safeItemName);
        
        // Get the template ID for SitecoreTalkData
        const templateId = await getSitecoreTalkDataTemplateId(client);
        if (!templateId) {
            console.error("Failed to get SitecoreTalkData template ID");
            return null;
        }

        // Get the Data folder's itemId (not path) for the parent
        const dataFolderState = await getSitecoreItemState(client, ModulesSitecoreTalkDataPath);
        if (!dataFolderState.isInstalled || !dataFolderState.itemId) {
            console.error("Failed to get Sitecore Talk Data folder itemId");
            return null;
        }

        // Create the SitecoreTalk data item
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
                                    name: "${safeItemName}",
                                    parent: "${dataFolderState.itemId}",
                                    templateId: "${templateId}", 
                                    language: "en",
                                    database: "master",
                                    fields: [
                                        {
                                            name: "TodoData",
                                            value: "[]"
                                        }
                                    ]
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
        ) as unknown as CreateItemResponse;

        const itemId = response?.data?.data?.createItem?.item?.itemId;
        
        if (itemId) {
            console.log('Successfully created SitecoreTalk data item:', {
                itemId,
                pageItemId,
                itemName: safeItemName
            });
            return itemId;
        } else {
            console.error("Failed to create SitecoreTalk data item - no itemId returned");
            return null;
        }

    } catch (error) {
        console.error("Failed to create SitecoreTalk data item:", error);
        return null;
    }
}

export async function updateSitecoreTalkDataForPage(
    client: ClientSDK | null, 
    pageItemId: string,
    talkData: ChatMessage[]
): Promise<boolean> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return false;
    }

    try {
        const existingData = await getSitecoreTalkDataForPage(client, pageItemId);
        if (!existingData?.itemId) {
            console.error("No existing SitecoreTalk data item found for page:", pageItemId);
            return false;
        }

        // Properly escape the JSON string for GraphQL
        const talkJsonValue = JSON.stringify(talkData)
            .replace(/\\/g, '\\\\')  // Escape backslashes first
            .replace(/"/g, '\\"');   // Then escape quotes

        console.log("Updating talk data for item:", pageItemId, ":", existingData, "with escaped data:", talkJsonValue);
        
        // Update the Talk field with new data
        const updateResponse = await client?.mutate(
            "xmc.authoring.graphql",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                    body: {
                        query: `mutation UpdateTalkData {
                            updateItem(
                                input: {
                                    itemId: "${existingData.itemId}",
                                        fields: [
                                        {
                                            name: "TodoData",
                                            value: "${talkJsonValue}"
                                        }
                                    ]
                                }
                            ) {
                                item {
                                    itemId
                                    name
                                }
                            }
                        }`
                    }
                }
            }
        );

        console.log("Updated SitecoreTalk data for page:", pageItemId, updateResponse);
        return true;
    } catch (error) {
        console.error("Failed to update SitecoreTalk data for page:", error);
        return false;
    }
}