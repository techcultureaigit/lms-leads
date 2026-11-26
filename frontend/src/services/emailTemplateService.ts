import { getToken, resolveApiUrl } from "@/lib/api";
import { prepareEmailImage } from "@/lib/prepareEmailImage";

// Browser calls go through Next.js `/api/...` proxy to the backend
const BASE_API_URL = resolveApiUrl();
const API_URL = BASE_API_URL
  ? BASE_API_URL.endsWith("/api")
    ? BASE_API_URL
    : `${BASE_API_URL}/api`
  : "/api";

export interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  design: any;
  html: string;
  text?: string;
  description?: string;
  category?: string;
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

export interface CreateTemplateData {
  name: string;
  subject: string;
  design: any;
  html: string;
  text?: string;
  description?: string;
  category?: string;
}

export interface UpdateTemplateData extends Partial<CreateTemplateData> {
  isActive?: boolean;
}

export interface SendEmailData {
  templateId: string;
  clientIds: string[];
  customSubject?: string;
  customBody?: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface TemplatesResponse {
  data: EmailTemplate[];
  pagination: PaginationInfo;
  count: number;
}

/**
 * Get all email templates with pagination and search
 */
export const getAllTemplates = async (params?: {
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  lightweight?: boolean;
}): Promise<TemplatesResponse> => {
  const token = getToken();
  
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append("category", params.category);
  if (params?.isActive !== undefined) queryParams.append("isActive", params.isActive.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.lightweight) queryParams.append("lightweight", "true");
  
  const response = await fetch(`${API_URL}/email-templates?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch templates");
    } else {
      // If HTML error page is returned, throw a more helpful error
      throw new Error(`API returned error: ${response.status} ${response.statusText}. Please check your API URL: ${API_URL}`);
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
 * Get a single template by ID
 */
export const getTemplateById = async (id: string): Promise<EmailTemplate> => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}/email-templates/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch template");
  }
  
  const data = await response.json();
  return data.data;
};

/**
 * Create a new template
 */
export const createTemplate = async (templateData: CreateTemplateData): Promise<EmailTemplate> => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}/email-templates`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(templateData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create template");
  }
  
  const data = await response.json();
  return data.data;
};

/**
 * Update an existing template
 */
export const updateTemplate = async (
  id: string,
  templateData: UpdateTemplateData
): Promise<EmailTemplate> => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}/email-templates/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(templateData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update template");
  }
  
  const data = await response.json();
  return data.data;
};

/**
 * Delete a template
 */
export const deleteTemplate = async (id: string): Promise<void> => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}/email-templates/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete template");
  }
};

/** Progress payload for bulk client send (used by TemplateSelectionModal). */
export interface EmailSendProgress {
  jobId?: string;
  sendBatchId?: string;
  status?: "processing" | "completed" | "failed" | "cancelled";
  cancelRequested?: boolean;
  total: number;
  successful: number; // emails accepted by SMTP so far
  failed: number; // real SMTP failures (not HTTP timeout)
  processed?: number; // successful + failed
  remaining?: number; // total - processed
  unsent?: number;
  percent?: number;
  recentSent?: Array<{ email: string; name?: string }>;
  recentFailures?: Array<{ email: string; name?: string; error: string }>;
  error?: string | null;
  sentAt?: string;
  template?: { id: string; name: string; subject: string };
  results?: { successful: any[]; failed: any[] };
  recipients?: Array<{ email: string; name: string }>;
}

export type EmailSendBatchStatus =
  | "processing"
  | "completed"
  | "failed"
  | "interrupted"
  | "cancelled";

export interface EmailSendBatchSummary {
  sendBatchId: string;
  jobId?: string;
  templateId: string;
  templateName: string;
  emailSubject: string;
  performedBy?: { _id: string; name?: string; email?: string } | string;
  status: EmailSendBatchStatus;
  total: number;
  successful: number;
  failed: number;
  unsent: number;
  skippedNoEmail?: number;
  error?: string | null;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
}

export interface EmailSendBatchRecipient {
  clientId: string;
  email: string;
  name?: string;
  tradingCode?: string;
  status: "pending" | "sent" | "failed" | "skipped" | "resent";
  errorMessage?: string;
  processedAt?: string;
}

export interface EmailSendBatchDetail extends EmailSendBatchSummary {
  recipients?: EmailSendBatchRecipient[];
  recipientTotal?: number;
  recipientPage?: number;
  recipientLimit?: number;
  recipientPages?: number;
}

/**
 * Send template emails to selected clients.
 *
 * Steps:
 *  1) POST /email-templates/send → server starts job, returns jobId + counts (fast)
 *  2) Poll /email-templates/send/status/:jobId every 1.5s
 *  3) Call onProgress on each tick so UI can show Sent / Remaining / Failed live
 *
 * This avoids "failed fetch" on large batches (server keeps sending in background).
 */
export const sendEmailToClients = async (
  emailData: SendEmailData,
  onProgress?: (p: EmailSendProgress) => void
): Promise<EmailSendProgress> => {
  const token = getToken();

  if (
    !emailData.templateId ||
    !emailData.clientIds ||
    !Array.isArray(emailData.clientIds) ||
    emailData.clientIds.length === 0
  ) {
    throw new Error("Template ID and at least one client ID are required");
  }

  // 1) Start the send job (HTTP returns quickly)
  const response = await fetch(`${API_URL}/email-templates/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send emails");
    }
    throw new Error(
      `API returned error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  let progress = data.data as EmailSendProgress;
  onProgress?.(progress);

  // No jobId = legacy/sync-style response — nothing to poll
  if (!progress?.jobId) return progress;

  // 2) Poll until status is completed, failed, or cancelled (retry transient network blips)
  let consecutivePollErrors = 0;
  while (progress.status === "processing") {
    await new Promise((r) => setTimeout(r, 1500)); // ~1.5s between status checks
    try {
      const statusRes = await fetch(
        `${API_URL}/email-templates/send/status/${progress.jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!statusRes.ok) {
        consecutivePollErrors += 1;
        // Keep last known progress; after a few misses treat as interrupted
        if (consecutivePollErrors >= 5) {
          return {
            ...progress,
            status: "failed",
            error:
              progress.sendBatchId
                ? `Lost connection while sending. Open Send Reports to see Unsent and resend. Batch: ${progress.sendBatchId}`
                : "Lost connection while sending. Check Send Reports for this batch.",
            remaining: progress.remaining ?? Math.max(progress.total - (progress.processed ?? progress.successful + progress.failed), 0),
            unsent:
              progress.unsent ??
              progress.remaining ??
              Math.max(
                progress.total -
                  (progress.processed ??
                    progress.successful + progress.failed),
                0
              ),
          };
        }
        continue;
      }
      consecutivePollErrors = 0;
      const statusData = await statusRes.json();
      progress = statusData.data;
      onProgress?.(progress); // update Sent / Remaining / Failed in the modal
    } catch {
      consecutivePollErrors += 1;
      if (consecutivePollErrors >= 5) {
        return {
          ...progress,
          status: "failed",
          error:
            progress.sendBatchId
              ? `Network error while polling. Emails may still be sending — check Send Reports. Batch: ${progress.sendBatchId}`
              : "Network error while polling send status. Check Send Reports.",
        };
      }
    }
  }

  return progress;
};

/** List durable send batches (date / template / sent-unsent filters). */
export const getEmailSendBatches = async (params?: {
  page?: number;
  limit?: number;
  templateId?: string;
  status?: string;
  from?: string;
  to?: string;
  hasUnsent?: boolean;
  hasFailed?: boolean;
  search?: string;
}): Promise<{
  data: EmailSendBatchSummary[];
  pagination: PaginationInfo;
}> => {
  const token = getToken();
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));
  if (params?.templateId) queryParams.append("templateId", params.templateId);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.from) queryParams.append("from", params.from);
  if (params?.to) queryParams.append("to", params.to);
  if (params?.hasUnsent) queryParams.append("hasUnsent", "true");
  if (params?.hasFailed) queryParams.append("hasFailed", "true");
  if (params?.search) queryParams.append("search", params.search);

  const response = await fetch(
    `${API_URL}/email-templates/send/batches?${queryParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch send batches");
  }

  const data = await response.json();
  return {
    data: data.data || [],
    pagination: data.pagination || {
      total: 0,
      page: 1,
      limit: 20,
      pages: 1,
    },
  };
};

/** Get one batch with recipients (optional filter: sent | failed | unsent | failed_and_unsent). */
export const getEmailSendBatch = async (
  sendBatchId: string,
  recipientStatus?: "sent" | "failed" | "unsent" | "failed_and_unsent",
  search?: string,
  options?: {
    countsOnly?: boolean;
    page?: number;
    limit?: number;
  }
): Promise<EmailSendBatchDetail> => {
  const token = getToken();
  const queryParams = new URLSearchParams();
  if (recipientStatus) queryParams.append("recipientStatus", recipientStatus);
  if (search?.trim()) queryParams.append("search", search.trim());
  if (options?.countsOnly) queryParams.append("countsOnly", "true");
  if (options?.page) queryParams.append("page", String(options.page));
  if (options?.limit) queryParams.append("limit", String(options.limit));
  const qs = queryParams.toString() ? `?${queryParams}` : "";
  const response = await fetch(
    `${API_URL}/email-templates/send/batches/${sendBatchId}${qs}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch send batch");
  }

  const data = await response.json();
  return data.data;
};

export type EmailSendBatchResendMode =
  | "failed"
  | "unsent"
  | "failed_and_unsent"
  | "sent"
  | "all";

/** Resend same template to failed / unsent / sent / specific clients. */
export const resendEmailSendBatch = async (
  sendBatchId: string,
  options:
    | EmailSendBatchResendMode
    | {
        mode?: EmailSendBatchResendMode;
        clientIds?: string[];
      } = "failed_and_unsent",
  onProgress?: (p: EmailSendProgress) => void
): Promise<EmailSendProgress> => {
  const token = getToken();
  const body =
    typeof options === "string"
      ? { mode: options }
      : {
          mode: options.mode || "failed_and_unsent",
          clientIds: options.clientIds,
        };

  const response = await fetch(
    `${API_URL}/email-templates/send/batches/${sendBatchId}/resend`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to resend batch");
  }

  const data = await response.json();
  let progress = data.data as EmailSendProgress;
  onProgress?.(progress);

  if (!progress?.jobId) return progress;

  let consecutivePollErrors = 0;
  while (progress.status === "processing") {
    await new Promise((r) => setTimeout(r, 1500));
    try {
      const statusRes = await fetch(
        `${API_URL}/email-templates/send/status/${progress.jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!statusRes.ok) {
        consecutivePollErrors += 1;
        if (consecutivePollErrors >= 5) {
          return {
            ...progress,
            status: "failed",
            error: "Lost connection while resending — check Send Reports",
          };
        }
        continue;
      }
      consecutivePollErrors = 0;
      const statusData = await statusRes.json();
      progress = statusData.data;
      onProgress?.(progress);
    } catch {
      consecutivePollErrors += 1;
      if (consecutivePollErrors >= 5) {
        return {
          ...progress,
          status: "failed",
          error: "Network error while resending — check Send Reports",
        };
      }
    }
  }

  return progress;
};

/** Stop an in-progress bulk send / resend for a batch. */
export const stopEmailSendBatch = async (
  sendBatchId: string
): Promise<{ message?: string; data?: EmailSendProgress | EmailSendBatchSummary }> => {
  const token = getToken();
  const response = await fetch(
    `${API_URL}/email-templates/send/batches/${sendBatchId}/stop`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to stop send");
  }

  const data = await response.json();
  return { message: data.message, data: data.data };
};

/**
 * Upload image for email template
 * Uploads an image file to Cloudinary and returns the URL
 */
export const uploadTemplateImage = async (file: File): Promise<string> => {
  const token = getToken();
  
  if (!token) {
    throw new Error("Authentication required");
  }

  // Shrink camera photos before upload (keeps them under the server limit and email-friendly)
  const prepared = await prepareEmailImage(file);

  // Create FormData
  const formData = new FormData();
  formData.append("image", prepared);

  const response = await fetch(`${API_URL}/email-templates/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type header - browser will set it with boundary for FormData
    },
    body: formData,
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload image");
    } else {
      throw new Error(`API returned error: ${response.status} ${response.statusText}`);
    }
  }

  const data = await response.json();
  return data.data.secureUrl || data.data.url;
};

export interface Client {
  _id: string;
  name: string;
  emailId: string;
  tradingCode: string;
  mobileNo: string;
}

export interface ClientsListResponse {
  data: Client[];
  count: number;
}

/**
 * Get list of clients for dropdown
 */
export const getClientsList = async (params?: {
  search?: string;
  limit?: number;
}): Promise<ClientsListResponse> => {
  const token = getToken();
  
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append("search", params.search);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  
  const response = await fetch(`${API_URL}/email-templates/clients/list?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch clients list");
  }
  
  const data = await response.json();
  return {
    data: data.data || [],
    count: data.count || 0,
  };
};

export interface SendExternalEmailData {
  templateId: string;
  emails: string[];
  customSubject?: string;
  customBody?: string;
  recipientType?: "csv_upload" | "manual_entry";
}

/**
 * Send email to external recipients (CSV/manual emails - not saved to DB)
 */
export const sendEmailToExternalRecipients = async (
  emailData: SendExternalEmailData
): Promise<{
  total: number;
  successful: number;
  failed: number;
  sentAt?: string;
  template?: {
    id: string;
    name: string;
    subject: string;
  };
  results?: {
    successful: Array<{ email: string; messageId?: string }>;
    failed: Array<{ email: string; error: string }>;
  };
}> => {
  const token = getToken();
  
  // Validate input
  if (!emailData.templateId || !emailData.emails || !Array.isArray(emailData.emails) || emailData.emails.length === 0) {
    throw new Error("Template ID and at least one email address are required");
  }
  
  const response = await fetch(`${API_URL}/email-templates/send-external`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  });
  
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send emails");
    } else {
      throw new Error(`API returned error: ${response.status} ${response.statusText}`);
    }
  }
  
  const data = await response.json();
  return data.data;
};