"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  X,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  createTemplate,
  type CreateTemplateData,
} from "@/services/emailTemplateService";
import CustomEmailEditor from "@/components/email-editor/CustomEmailEditor";
import { cn } from "@/lib/utils";

const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-[#0b5cff] focus:outline-none focus:ring-2 focus:ring-[#0b5cff]/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

export default function CreateTemplatePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [customDesign, setCustomDesign] = useState<any>(null);
  const [customHtml, setCustomHtml] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    description: "",
    category: "general",
  });

  // Block ALL Unlayer's analytics/event tracking API calls (both fetch and XMLHttpRequest)
  useEffect(() => {
    // Store original functions
    const originalFetch = window.fetch;
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    // List of Unlayer domains/endpoints to block
    const blockedPatterns = [
      "api.events.unlayer.com",
      "events.unlayer.com/save",
      "api.unlayer.com/v2/editor/save",
      "api.unlayer.com/v2/editor/usage",
      "api.unlayer.com/v2/editor/events",
    ];

    const isBlocked = (url: string) => {
      return blockedPatterns.some((pattern) => url.includes(pattern));
    };

    // Override fetch to block Unlayer event tracking
    window.fetch = async (...args) => {
      const url = args[0]?.toString() || "";

      if (isBlocked(url)) {
        console.log("🚫 Blocked Unlayer API call (fetch):", url);
        // Return a fake successful response to prevent errors
        return new Response(JSON.stringify({ success: true, blocked: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return originalFetch(...args);
    };

    // Override XMLHttpRequest to block Unlayer event tracking
    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null
    ) {
      const urlString = url.toString();
      if (isBlocked(urlString)) {
        console.log("🚫 Blocked Unlayer API call (XHR):", urlString);
        // Store blocked flag
        (this as any)._blocked = true;
        return;
      }
      // Call original with all arguments
      return (originalXHROpen as any).apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function (
      body?: Document | XMLHttpRequestBodyInit | null
    ) {
      if ((this as any)._blocked) {
        // Simulate successful response
        Object.defineProperty(this, "status", { value: 200, writable: false });
        Object.defineProperty(this, "statusText", {
          value: "OK",
          writable: false,
        });
        Object.defineProperty(this, "responseText", {
          value: JSON.stringify({ success: true, blocked: true }),
          writable: false,
        });
        Object.defineProperty(this, "readyState", {
          value: 4,
          writable: false,
        });

        // Trigger onload if exists
        const onloadHandler = this.onload;
        if (onloadHandler) {
          setTimeout(() => {
            const event = new ProgressEvent("load", {
              lengthComputable: true,
              loaded: 0,
              total: 0,
            });
            onloadHandler.call(this, event as any);
          }, 0);
        }
        return;
      }
      return originalXHRSend.call(this, body);
    };

    // Cleanup: restore original functions when component unmounts
    return () => {
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;
    };
  }, []);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.subject.trim()) {
      showToast("Name and subject are required", "error");
      return;
    }

    try {
      setIsSaving(true);

      if (!customDesign || !customHtml) {
        showToast("Please add some content to your template", "error");
        setIsSaving(false);
        return;
      }

      const templateData: CreateTemplateData = {
        name: formData.name.trim(),
        subject: formData.subject.trim(),
        design: { ...customDesign, editorType: "custom" },
        html: customHtml,
        text: "",
        description: formData.description.trim(),
        category: formData.category,
      };

      await createTemplate(templateData);
      showToast("Template created successfully", "success");
      setTimeout(() => {
        router.push("/email/templates");
      }, 1500);
    } catch (error: any) {
      console.error("Error saving template:", error);
      showToast(error.message || "Failed to save template", "error");
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {toast.show ? (
        <div
          className={cn(
            "fixed right-4 top-4 z-[90] flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg",
            toast.type === "success"
              ? "bg-emerald-600"
              : toast.type === "error"
                ? "bg-red-600"
                : "bg-[#0b5cff]"
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : toast.type === "error" ? (
            <X className="h-4 w-4 shrink-0" />
          ) : null}
          <span>{toast.message}</span>
        </div>
      ) : null}

      <PageHeader
        title="Create email template"
        description="Design your email template using the visual editor"
      >
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </PageHeader>

      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid grid-cols-1 gap-3 px-3 py-3 sm:px-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="template-name" className="mb-1 text-xs">
              Template name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="template-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Welcome Email"
              className="h-8"
              required
            />
          </div>
          <div>
            <Label htmlFor="template-subject" className="mb-1 text-xs">
              Email subject <span className="text-red-500">*</span>
            </Label>
            <Input
              id="template-subject"
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="e.g., Welcome to EZ Wealth!"
              className="h-8"
              required
            />
          </div>
          <div>
            <Label htmlFor="template-category" className="mb-1 text-xs">
              Category
            </Label>
            <select
              id="template-category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={SELECT_CLASS}
            >
              <option value="general">General</option>
              <option value="welcome">Welcome</option>
              <option value="notification">Notification</option>
              <option value="promotional">Promotional</option>
              <option value="transactional">Transactional</option>
            </select>
          </div>
          <div>
            <Label htmlFor="template-description" className="mb-1 text-xs">
              Description
            </Label>
            <Input
              id="template-description"
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description"
              className="h-8"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="h-[calc(100vh-12.5rem)] min-h-[640px]">
          <CustomEmailEditor
            key="basic-editor"
            onDesignChange={(design) => {
              setCustomDesign(design);
            }}
            onHtmlChange={(html) => {
              setCustomHtml(html);
            }}
            initialDesign={customDesign}
          />
        </div>
      </div>
    </div>
  );
}
