import { getToken, resolveApiUrl } from "@/lib/api";

// Browser calls go through Next.js `/api/...` proxy to the backend
const BASE_API_URL = resolveApiUrl();
const API_URL = BASE_API_URL
  ? BASE_API_URL.endsWith("/api")
    ? BASE_API_URL
    : `${BASE_API_URL}/api`
  : "/api";

export interface BlockTemplate {
  _id: string;
  name: string;
  description?: string;
  templateType: string;
  blocks: any[];
  html?: string;
  category?: string;
  previewImage?: string;
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlockTemplateData {
  name: string;
  description?: string;
  templateType?: string;
  blocks: any[];
  html?: string;
  category?: string;
  previewImage?: string;
}

export interface UpdateBlockTemplateData extends Partial<CreateBlockTemplateData> {
  isActive?: boolean;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface BlockTemplatesResponse {
  data: BlockTemplate[];
  pagination: PaginationInfo;
  count: number;
}

/**
 * Get all block templates with pagination and search
 */
export const getAllBlockTemplates = async (params?: {
  templateType?: string;
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<BlockTemplatesResponse> => {
  const token = getToken();
  
  const queryParams = new URLSearchParams();
  if (params?.templateType) queryParams.append("templateType", params.templateType);
  if (params?.category) queryParams.append("category", params.category);
  if (params?.isActive !== undefined) queryParams.append("isActive", params.isActive.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  
  const response = await fetch(`${API_URL}/block-templates?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch block templates");
    } else {
      throw new Error(`API returned error: ${response.status} ${response.statusText}`);
    }
  }
  
  const data = await response.json();
  return {
    data: data.data || [],
    pagination: data.pagination || {
      total: data.count || 0,
      page: params?.page || 1,
      limit: params?.limit || 100,
      pages: Math.ceil((data.count || 0) / (params?.limit || 100)),
    },
    count: data.count || 0,
  };
};

/**
 * Get a single block template by ID
 */
export const getBlockTemplateById = async (id: string): Promise<BlockTemplate> => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}/block-templates/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch block template");
  }
  
  const data = await response.json();
  return data.data;
};

/**
 * Create a new block template
 */
export const createBlockTemplate = async (templateData: CreateBlockTemplateData): Promise<BlockTemplate> => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}/block-templates`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(templateData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create block template");
  }
  
  const data = await response.json();
  return data.data;
};

/**
 * Update an existing block template
 */
export const updateBlockTemplate = async (
  id: string,
  templateData: UpdateBlockTemplateData
): Promise<BlockTemplate> => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}/block-templates/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(templateData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update block template");
  }
  
  const data = await response.json();
  return data.data;
};

/**
 * Delete a block template
 */
export const deleteBlockTemplate = async (id: string): Promise<void> => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}/block-templates/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete block template");
  }
};

/**
 * Track template usage
 */
export const useBlockTemplate = async (id: string): Promise<void> => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}/block-templates/${id}/use`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    // Don't throw error for usage tracking failures - it's not critical
    console.warn("Failed to track template usage");
  }
};
