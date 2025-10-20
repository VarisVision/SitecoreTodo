import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { CreateItemResponse, ModuleInstallationStatus, QueryFieldResponse, QueryItemResponse, Todo, TodoData } from "@/types";

export const ModulesPath = `/sitecore/System/Modules/`
export const ModulesSitecoreTodoDataPath = `/sitecore/System/Modules/Todos/Data`;
export const SitecoreTodoTemplatesPath = `/sitecore/templates/Modules/Todos/TodoData`;
export const SitecoreTodoDataTemplateName = "TodoData";

export async function getContextId(client: ClientSDK | null): Promise<string | null> {
    try {
        const application = await client?.query("application.context");
        console.log("application: " + application);
        const sitecoreContextId = application?.data?.resources?.[0]?.context?.preview;
        console.log("sitecore context id:" + sitecoreContextId);
        
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


export async function getSitecoreTodoDataTemplateId(client: ClientSDK | null): Promise<string | null> {
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
                                    path: "${SitecoreTodoTemplatesPath}"
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

        const templateId = response?.data?.data?.item?.itemId;
        return templateId ?? null;
    } catch (error) {
        console.error("Failed to get SitecoreTodoData template ID:", error);
        return null;
    }
}

export async function getTodoDataTitle(client: ClientSDK | null): Promise<string | null> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return null;
    }
    
    try {
        const dataFolderState = await getSitecoreItemState(client, ModulesSitecoreTodoDataPath);
        if (!dataFolderState.isInstalled || !dataFolderState.itemId) {
            return null;
        }

        const response = await client?.mutate(
            "xmc.preview.graphql",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                    body: {
                        query: `query {
                            search(
                                where: {
                                    AND: [
                                        {
                                            name: "_path"
                                            value: "${dataFolderState.itemId}"
                                        }
                                    ]
                                }
                                first: 1
                            ) {
                                total
                                results {
                                    id
                                    field(name: "Title") {
                                        value
                                    }
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

        const todoField = response?.data?.data?.search?.results ?? [];
        
        if (todoField?.[0]) {
            const titleField = todoField[0]?.field;
            
            if (titleField?.value && titleField.value.trim()) {
                return titleField.value;
            }
        }
        
        return null;
    } catch (error) {
        console.error("Failed to fetch todo data title:", error);
        return null;
    }
}

export async function getSitecoreTodoDataForPage(client: ClientSDK | null, _pageItemId: string): Promise<TodoData | null> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return null;
    }
    try {
        const dataFolderState = await getSitecoreItemState(client, ModulesSitecoreTodoDataPath);
        if (!dataFolderState.isInstalled || !dataFolderState.itemId) {
            return { itemId: '', todos: [] };
        }

        const response = await client?.mutate(
            "xmc.preview.graphql",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                    body: {
                        query: `query {
                            search(
                                where: {
                                    AND: [
                                        {
                                            name: "_path"
                                            value: "${dataFolderState.itemId}"
                                        }
                                    ]
                                }
                                first: 1
                            ) {
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

        const todoField = response?.data?.data?.search?.results ?? [];
        let todoData = [];

        if (todoField?.[0]) {
            try {
                const jsonValue = todoField[0]?.field?.jsonValue?.value;
                if (jsonValue) {
                    todoData = JSON.parse(jsonValue);
                }
            } catch (e) {
                console.warn("Failed to parse Todo field JSON:", e);
            }
        }
        
        return {
            itemId: todoField?.[0]?.id ?? '',
            todos: todoData || []
        };
    } catch (error) {
        console.error("Failed to fetch Todo data for page:", error);
        return null;
    }
}

export async function createSitecoreTodoDataItem(
    client: ClientSDK | null, 
    pageItemId: string,
    pageName?: string
): Promise<TodoData | null> {
    const contextId = await getContextId(client);
    if (!contextId) {
        console.error("No context ID available");
        return null;
    }

    try {
        const existingData = await getSitecoreTodoDataForPage(client, pageItemId);
        if (existingData && existingData.itemId) {
            return existingData;
        }

        const itemName = pageName ?? `Todo-${pageItemId.substring(1, 9)}`;
        const safeItemName = itemName.replace(/[^a-zA-Z0-9\s-_]/g, '').trim() || 'TodoData';
        
        const templateId = await getSitecoreTodoDataTemplateId(client);
        if (!templateId) {
            console.error("Failed to get SitecoreTodoData template ID");
            return null;
        }

        const dataFolderState = await getSitecoreItemState(client, ModulesSitecoreTodoDataPath);
        if (!dataFolderState.isInstalled || !dataFolderState.itemId) {
            console.error("Failed to get Sitecore Todo Data folder itemId");
            return null;
        }

        const mutationQuery = `mutation {
            createItem(
                input: {
                    name: "${safeItemName}",
                    parent: "${dataFolderState.itemId}",
                    templateId: "${templateId}", 
                    language: "en",
                    database: "master",
                    fields: [
                        {
                            name: "Title",
                            value: "${("My today's to do").replace(/"/g, '\\"')}"
                        },
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
        }`;

        const response = await client?.mutate(
            "xmc.authoring.graphql",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                    body: {
                        query: mutationQuery
                    }
                }
            }
        ) as unknown as CreateItemResponse;

        const itemId = response?.data?.data?.createItem?.item?.itemId;
        
        if (itemId) {
            return {
                itemId: itemId,
                todos: []
            };
        } else {
            console.error("Failed to create SitecoreTodo data item - no itemId returned");
            return null;
        }

    } catch (error) {
        console.error("Failed to create SitecoreTodo data item:", error);
        return null;
    }
}

export async function updateSitecoreTodoDataForPage(
    client: ClientSDK | null, 
    pageItemId: string,
    todoData: Todo[]
): Promise<boolean> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return false;
    }

    try {
        const existingData = await getSitecoreTodoDataForPage(client, pageItemId);
        if (!existingData?.itemId) {
            console.error("No existing SitecoreTodo data item found for page:", pageItemId);
            return false;
        }

        const todoJsonValue = JSON.stringify(todoData)
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"');

        await client?.mutate(
            "xmc.authoring.graphql",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                    body: {
                        query: `mutation UpdateTodoData {
                            updateItem(
                                input: {
                                    itemId: "${existingData.itemId}",
                                        fields: [
                                        {
                                            name: "TodoData",
                                            value: "${todoJsonValue}"
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

        return true;
    } catch (error) {
        console.error("Failed to update SitecoreTodo data for page:", error);
        return false;
    }
}

export async function updateTodoDataTitle(
    client: ClientSDK | null,
    pageItemId: string,
    title: string
): Promise<boolean> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return false;
    }

    try {
        const existingData = await getSitecoreTodoDataForPage(client, pageItemId);
        if (!existingData?.itemId) {
            console.error("No existing SitecoreTodo data item found for page:", pageItemId);
            return false;
        }

        const escapedTitle = title.replace(/"/g, '\\"');

        await client?.mutate(
            "xmc.authoring.graphql",
            {
                params: {
                    query: {
                        sitecoreContextId: contextId,
                    },
                    body: {
                        query: `mutation UpdateTitle {
                            updateItem(
                                input: {
                                    itemId: "${existingData.itemId}",
                                    fields: [
                                        {
                                            name: "Title",
                                            value: "${escapedTitle}"
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

        return true;
    } catch (error) {
        console.error("Failed to update todo data title:", error);
        return false;
    }
}