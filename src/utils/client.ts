import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { CreateItemResponse, ModuleInstallationStatus, QueryFieldResponse, QueryItemResponse, Todo, TodoData } from "@/types";

export const ModulesPath = `/sitecore/System/Modules/`
export const ModulesSitecoreTodoDataPath = `/sitecore/System/Modules/Todos/Data`;
export const SitecoreTodoTemplatesPath = `/sitecore/templates/Modules/Todos/TodoData`;
export const SitecoreTodoDataTemplateName = "TodoData";

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


export async function getSitecoreTodoDataTemplateId(client: ClientSDK | null): Promise<string | null> {
    const contextId = await getContextId(client);
    if (!contextId) {
        return null;
    }

    try {
        // Query for the TodoData template using the correct path
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
        console.log("Found TodoData template ID:", templateId);
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
        // Get the Data folder to search for todo items
        const dataFolderState = await getSitecoreItemState(client, ModulesSitecoreTodoDataPath);
        if (!dataFolderState.isInstalled || !dataFolderState.itemId) {
            return null;
        }

        // Search for todo items in the data folder
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
        // Get the Data folder to search for todo items
        const dataFolderState = await getSitecoreItemState(client, ModulesSitecoreTodoDataPath);
        if (!dataFolderState.isInstalled || !dataFolderState.itemId) {
            console.log("Data folder not found, returning empty todos");
            return { itemId: '', todos: [] };
        }

        // Search for todo items in the data folder
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
        console.log("getSitecoreTodoDataForPage results for Todo data items:", todoField);
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
        return null;
    }

    try {
        // First check if item already exists (by Link field = itemId)
        const existingData = await getSitecoreTodoDataForPage(client, pageItemId);
        if (existingData && existingData.itemId) {
            console.log('SitecoreTodo data item already exists for page:', pageItemId);
            return existingData;
        }

        // Use the pageName if provided, otherwise create from itemId
        const itemName = pageName ?? `Todo-${pageItemId.substring(1, 9)}`;
        const safeItemName = itemName.replace(/[^a-zA-Z0-9\s-_]/g, '').trim() || 'TodoData';
        console.log('Creating SitecoreTodo data item with name:', itemName, '->', safeItemName);
        
        // Get the template ID for SitecoreTodoData
        const templateId = await getSitecoreTodoDataTemplateId(client);
        if (!templateId) {
            console.error("Failed to get SitecoreTodoData template ID");
            return null;
        }

        // Get the Data folder's itemId (not path) for the parent
        const dataFolderState = await getSitecoreItemState(client, ModulesSitecoreTodoDataPath);
        if (!dataFolderState.isInstalled || !dataFolderState.itemId) {
            console.error("Failed to get Sitecore Todo Data folder itemId");
            return null;
        }

        // Create the SitecoreTodo data item
        console.log("Creating todo item with:", {
            name: safeItemName,
            parent: dataFolderState.itemId,
            templateId: templateId
        });

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
                            value: "${(pageName || "My Todo List").replace(/"/g, '\\"')}"
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

        console.log("GraphQL mutation query:", mutationQuery);

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

        console.log("Create item response:", response);
        console.log("Response structure:", {
            hasData: !!response?.data,
            hasDataData: !!response?.data?.data,
            hasCreateItem: !!response?.data?.data?.createItem,
            hasItem: !!response?.data?.data?.createItem?.item,
            hasItemId: !!response?.data?.data?.createItem?.item?.itemId
        });

        const itemId = response?.data?.data?.createItem?.item?.itemId;
        
        if (itemId) {
            console.log('Successfully created SitecoreTodo data item:', {
                itemId,
                pageItemId,
                itemName: safeItemName
            });
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

        // Properly escape the JSON string for GraphQL
        const todoJsonValue = JSON.stringify(todoData)
            .replace(/\\/g, '\\\\')  // Escape backslashes first
            .replace(/"/g, '\\"');   // Then escape quotes

        console.log("Updating todo data for item:", pageItemId, ":", existingData, "with escaped data:", todoJsonValue);
        
        // Update the Todo field with new data
        const updateResponse = await client?.mutate(
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

        console.log("Updated Todo data for page:", pageItemId, updateResponse);
        return true;
    } catch (error) {
        console.error("Failed to update SitecoreTodo data for page:", error);
        return false;
    }
}