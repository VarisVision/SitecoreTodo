

// Core Types
export interface SiteInfo {
  id: string;
  name: string;
  pageId: string;
  path: string;
}

export interface ModuleInstallationStatus {
    isInstalled: boolean;
    itemId? : string;
}

export interface Item {
    itemId: string;
    name: string;
    path: string;
}

export interface QueryItemData {
    item: Item;
}

export interface QueryItemResponse {
    data: {
        data: QueryItemData;
    };
}

export interface FieldResult {
  id: string;
  jsonValue : {value: string};
  name: string;
  value: string;
}

export interface FieldRecord {
  id: string;
  field: FieldResult;
}

export interface QueryFieldData {
  total: number;
  results: FieldRecord[];
};

export interface QueryFieldResponse {
  data: {
    data: {
      search: QueryFieldData;
    };    
  };
}

export interface CreateItemResponse {
    data: {
        data: {
            createItem: {
                item: Item;
            };
        };
    };
}

// SitecoreTodo Types
export interface SitecoreTodoItem {
  itemId: string;  
  fields: {
    TodoData: {
      value: string; // JSON string
    };
  };
}

// Todo Types
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoData {
  itemId: string;
  name?: string | null;
  todos: Todo[];
}