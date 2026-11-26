import React, { useState, useEffect, useCallback, useRef } from "react";
import { FolderOpen, Search, Trash2, Plus } from "lucide-react";
import { getAllBlockTemplates, deleteBlockTemplate, BlockTemplate } from "@/services/blockTemplateService";
import { EmailBlock } from "../types";
import ConfirmModal from "@/components/ConfirmModal";
import { Skeleton } from "@/components/ui/skeleton";

interface TemplatesTabProps {
  blocks: EmailBlock[];
  onLoadTemplate: (blocks: EmailBlock[]) => void;
  onSaveTemplate?: (blocks: EmailBlock[]) => void;
  refreshTrigger?: number; // When this changes, refresh the templates list
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  blocks,
  onLoadTemplate,
  onSaveTemplate,
  refreshTrigger,
}) => {
  const [templates, setTemplates] = useState<BlockTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    templateId: string | null;
  }>({ isOpen: false, templateId: null });
  
  // Use ref to prevent duplicate calls during the same render cycle
  const isLoadingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize loadTemplates function
  const loadTemplates = useCallback(async () => {
    // Prevent duplicate calls
    if (isLoadingRef.current) {
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      const response = await getAllBlockTemplates({
        templateType: filterType !== "all" ? filterType : undefined,
        isActive: true,
        search: searchQuery || undefined,
        limit: 100,
      });
      setTemplates(response.data);
    } catch (error: any) {
      console.error("Failed to load templates:", error);
      setTemplates([]);
      // Show user-friendly error message
      if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
        setError("Unable to connect to server. Please ensure the backend server is running and restart it to load the new template routes.");
      } else if (error.message?.includes("404")) {
        setError(null); // 404 means no templates yet, which is fine
      } else {
        setError(error.message || "Failed to load templates");
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [filterType, searchQuery]);

  // Refresh when refreshTrigger changes (e.g., after template creation)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Force reload templates when refresh trigger changes
      // Use a direct API call to ensure fresh data
      const refreshTemplates = async () => {
        if (isLoadingRef.current) {
          return;
        }
        try {
          isLoadingRef.current = true;
          setLoading(true);
          setError(null);
          const response = await getAllBlockTemplates({
            templateType: filterType !== "all" ? filterType : undefined,
            isActive: true,
            search: searchQuery || undefined,
            limit: 100,
          });
          setTemplates(response.data);
        } catch (error: any) {
          console.error("Failed to refresh templates:", error);
          setTemplates([]);
          if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
            setError("Unable to connect to server. Please ensure the backend server is running and restart it to load the new template routes.");
          } else if (error.message?.includes("404")) {
            setError(null);
          } else {
            setError(error.message || "Failed to load templates");
          }
        } finally {
          setLoading(false);
          isLoadingRef.current = false;
        }
      };
      refreshTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  // Single useEffect that handles both filterType and searchQuery changes
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Skip if already loading
    if (isLoadingRef.current) {
      return;
    }

    // Debounce search query changes, but load immediately for filter type changes
    if (searchQuery !== "") {
      // Debounce search queries
      timeoutRef.current = setTimeout(() => {
        loadTemplates();
      }, 300);
    } else {
      // Load immediately for filter changes or initial load
      loadTemplates();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [filterType, searchQuery, loadTemplates]);

  // Helper function to clone and regenerate block IDs
  const cloneTemplateBlocks = (templateBlocks: EmailBlock[]): EmailBlock[] => {
    // Validate input
    if (!templateBlocks || !Array.isArray(templateBlocks) || templateBlocks.length === 0) {
      console.error("cloneTemplateBlocks: Invalid templateBlocks:", templateBlocks);
      return [];
    }
    
    // Normalize blocks first - ensure they have props
    const normalizedBlocks = templateBlocks.map((block: any) => {
      if (!block || typeof block !== 'object') {
        return null;
      }
      return {
        ...block,
        props: block.props || {},
      };
    }).filter((b: any) => b !== null);
    
    return normalizedBlocks.map((block: any) => {
      // Validate block structure - blocks must have type, but id can be generated
      if (!block || typeof block !== 'object') {
        console.warn("cloneTemplateBlocks: Invalid block (not an object):", block);
        return null;
      }
      
      // Ensure block has a type (required)
      if (!block.type || typeof block.type !== 'string') {
        console.warn("cloneTemplateBlocks: Block missing type:", block);
        return null;
      }
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      
      // Deep clone props to ensure all properties are preserved (especially for logo blocks)
      const clonedProps = block.props ? JSON.parse(JSON.stringify(block.props)) : {};
      
      const clonedBlock: any = {
        ...block,
        id: `block-${timestamp}-${random}`,
        props: clonedProps,
      };
      
      // Log logo blocks specifically to debug
      if (block.type === "logo") {
        console.log("Cloning logo block - original:", {
          imageSrc: block.props?.imageSrc,
          width: block.props?.width,
          height: block.props?.height,
          align: block.props?.align,
        });
        console.log("Cloning logo block - cloned:", {
          imageSrc: clonedProps.imageSrc,
          width: clonedProps.width,
          height: clonedProps.height,
          align: clonedProps.align,
        });
      }
      
      // Also regenerate IDs for nested blocks in columns (deep clone props)
      if (block.type === "columns" && block.props?.columnBlocks) {
        clonedBlock.props.columnBlocks = Object.keys(block.props.columnBlocks).reduce(
          (acc: any, colIdx: string) => {
            acc[colIdx] = (block.props.columnBlocks[colIdx] || []).map((nestedBlock: any) => {
              const nestedProps = nestedBlock.props ? JSON.parse(JSON.stringify(nestedBlock.props)) : {};
              // Log logo blocks in columns
              if (nestedBlock.type === "logo") {
                console.log("Cloning logo block in column", colIdx, "- original:", {
                  imageSrc: nestedBlock.props?.imageSrc,
                  width: nestedBlock.props?.width,
                  height: nestedBlock.props?.height,
                });
                console.log("Cloning logo block in column", colIdx, "- cloned:", {
                  imageSrc: nestedProps.imageSrc,
                  width: nestedProps.width,
                  height: nestedProps.height,
                });
              }
              return {
                ...nestedBlock,
                id: `block-${timestamp}-${random}-col${colIdx}-${Math.random().toString(36).substr(2, 9)}`,
                props: nestedProps,
              };
            });
            return acc;
          },
          {}
        );
      }
      
      // Also regenerate IDs for nested blocks in header (deep clone props)
      if (block.type === "header" && block.props?.headerBlocks) {
        clonedBlock.props.headerBlocks = (block.props.headerBlocks || []).map((nestedBlock: any) => {
          const nestedProps = nestedBlock.props ? JSON.parse(JSON.stringify(nestedBlock.props)) : {};
          // Log logo blocks in header
          if (nestedBlock.type === "logo") {
            console.log("Cloning logo block in header - original:", {
              imageSrc: nestedBlock.props?.imageSrc,
              width: nestedBlock.props?.width,
              height: nestedBlock.props?.height,
            });
            console.log("Cloning logo block in header - cloned:", {
              imageSrc: nestedProps.imageSrc,
              width: nestedProps.width,
              height: nestedProps.height,
            });
          }
          return {
            ...nestedBlock,
            id: `block-${timestamp}-${random}-header-${Math.random().toString(36).substr(2, 9)}`,
            props: nestedProps,
          };
        });
      }
      
      // Also regenerate IDs for nested blocks in footer (deep clone props)
      if (block.type === "footer" && block.props?.footerBlocks) {
        clonedBlock.props.footerBlocks = (block.props.footerBlocks || []).map((nestedBlock: any) => {
          const nestedProps = nestedBlock.props ? JSON.parse(JSON.stringify(nestedBlock.props)) : {};
          // Log logo blocks in footer
          if (nestedBlock.type === "logo") {
            console.log("Cloning logo block in footer - original:", {
              imageSrc: nestedBlock.props?.imageSrc,
              width: nestedBlock.props?.width,
              height: nestedBlock.props?.height,
            });
            console.log("Cloning logo block in footer - cloned:", {
              imageSrc: nestedProps.imageSrc,
              width: nestedProps.width,
              height: nestedProps.height,
            });
          }
          return {
            ...nestedBlock,
            id: `block-${timestamp}-${random}-footer-${Math.random().toString(36).substr(2, 9)}`,
            props: nestedProps,
          };
        });
      }
      
      return clonedBlock;
    }).filter((block: any) => block !== null); // Filter out any null blocks
  };

  const handleLoadTemplate = async (template: BlockTemplate) => {
    try {
      // Track usage
      try {
        await import("@/services/blockTemplateService").then((module) =>
          module.useBlockTemplate(template._id)
        );
      } catch (err) {
        // Ignore usage tracking errors
      }

      // Clone blocks and regenerate IDs to avoid conflicts
      const clonedBlocks = cloneTemplateBlocks(template.blocks);
      onLoadTemplate(clonedBlocks);
    } catch (error) {
      console.error("Failed to load template:", error);
      alert("Failed to load template. Please try again.");
    }
  };
  

  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, templateId: id });
  };

  const confirmDeleteTemplate = async () => {
    if (!deleteConfirm.templateId) return;
    const templateId = deleteConfirm.templateId;

    try {
      await deleteBlockTemplate(templateId);
      // Remove from current list immediately
      setTemplates(templates.filter((t) => t._id !== templateId));
      // Reload templates from server to ensure sync
      await loadTemplates();
      setDeleteConfirm({ isOpen: false, templateId: null });
    } catch (error) {
      console.error("Failed to delete template:", error);
      alert("Failed to delete template. Please try again.");
      setDeleteConfirm({ isOpen: false, templateId: null });
    }
  };

  const filteredTemplates = templates.filter((template) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        template.name.toLowerCase().includes(query) ||
        (template.description && template.description.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const getTemplateTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      header: "Header",
      footer: "Footer",
      content: "Content",
      full: "Full Layout",
      custom: "Custom",
    };
    return labels[type] || type;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Templates</h3>
          {onSaveTemplate && (
            <button
              onClick={() => onSaveTemplate(blocks)}
              className="text-xs px-2 py-1 bg-[#0b5cff] text-white rounded hover:bg-[#0947d6] transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Save
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded focus:outline-none focus:ring-1 focus:ring-[#0b5cff] focus:border-[#0b5cff]"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-1 flex-wrap">
          {["all", "header", "footer", "content", "full", "custom"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`text-[10px] px-2 py-0.5 rounded ${
                filterType === type
                  ? "bg-[#0b5cff] text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              } transition-colors`}
            >
              {type === "all" ? "All" : getTemplateTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Templates List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-200 p-2 dark:border-slate-700"
              >
                <div className="flex items-start gap-2">
                  <Skeleton className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3.5 w-12 rounded" />
                    </div>
                    <Skeleton className="h-2.5 w-full max-w-[12rem]" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 px-4">
            <div className="text-red-600 text-xs mb-2 font-semibold">Error Loading Templates</div>
            <div className="text-slate-600 dark:text-slate-400 text-[10px]">{error}</div>
            <button
              onClick={loadTemplates}
              className="mt-4 px-3 py-1.5 bg-[#0b5cff] text-white rounded text-xs hover:bg-[#0947d6] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            {searchQuery ? "No templates found" : "No templates available"}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTemplates.map((template) => (
              <div
                key={template._id}
                onClick={(e) => {
                  // Only load if not clicking delete button
                  if (!(e.target as HTMLElement).closest('button')) {
                    handleLoadTemplate(template);
                  }
                }}
                className={`group p-2 border rounded-lg cursor-pointer transition-all ${
                  selectedTemplate === template._id
                    ? "border-[#0b5cff] bg-[#0b5cff]/5"
                    : "border-slate-200 dark:border-slate-600 hover:border-[#0b5cff] hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
                onMouseEnter={() => setSelectedTemplate(template._id)}
                onMouseLeave={() => setSelectedTemplate(null)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <FolderOpen className="w-3 h-3 text-slate-400 shrink-0" />
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {template.name}
                      </h4>
                      <span className="text-[9px] px-1 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded">
                        {getTemplateTypeLabel(template.templateType)}
                      </span>
                    </div>
                    {template.description && (
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 mb-1">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[9px] text-slate-500">
                      <span>{template.blocks.length} block{template.blocks.length !== 1 ? "s" : ""}</span>
                      {template.usageCount > 0 && (
                        <span>• Used {template.usageCount} time{template.usageCount !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Delete Button - Only visible on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template._id, e);
                    }}
                    className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-all shrink-0"
                    title="Delete template from database"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, templateId: null })}
        onConfirm={confirmDeleteTemplate}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        type="danger"
        confirmText="Delete"
      />
    </div>
  );
};
