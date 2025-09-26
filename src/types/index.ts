import { ClientSDK } from "@sitecore-marketplace-sdk/client";

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    url?: string;
    days?: number;
    property?: string;
    recordCount?: number;
  };
}

export interface ApiError {
  error: string;
  details?: string;
}

// Analytics Types
export interface PageViewsData {
  date: Date;
  pageViews: number;
}

export interface SiteInfo {
  id: string;
  name: string;
  pageId: string;
  path: string;
}

// Component Props Types
export interface AnalyticsChartProps {
  propertyId: string;
  route: string;
  initialDays?: string;
}

// Google Analytics API Types
export type MetricType = 'screenPageViews' | 'activeUsers';

// Marketplace SDK Types
export interface PropertyField {
  name: string;
  value: string;
}

export interface ChildrenResults {
  results: {
    id: string;
    name: string;
    field: PropertyField;
  }[];
}

export interface GqlItem {
  itemId: string;
  name: string;
  children: ChildrenResults;
}

export interface GqlData {
  item: GqlItem;
}

export interface GqlResponse {
  data: {
    data: GqlData;
  };
}

// Client Context Types
export interface ClientContext {
  client: ClientSDK;
  sitecoreContextId: string;
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

export interface QueryMeResponse {
    data: {
        data: {
            me: {
                id: string;
                name: string;
                email: string;
            };
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

// SitecoreTalk Types
export interface ChatMessage {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  avatar?: string;
}

export interface SitecoreTalkData {
  itemId: string;
  name?: string | null;
  todoData: ChatMessage[];
}

export interface SitecoreTalkItem {
  itemId: string;  
  fields: {
    TodoData: {
      value: string; // JSON string
    };
  };
}