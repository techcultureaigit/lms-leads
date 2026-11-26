"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  FaColumns,
  FaHeading,
  FaParagraph,
  FaMousePointer,
  FaImage,
  FaIcons,
  FaFacebook,
  FaGripVertical,
  FaCode,
  FaBolt,
  FaEye,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaUpload,
  FaBold,
  FaUnderline,
  FaItalic,
  FaTrash,
  FaBars,
  FaWindowRestore,
} from "react-icons/fa";
import Mustache from "mustache";
import { CustomEmailEditorProps, EmailBlock, GeneralSettings, RightSidebarTab, DeviceView, BlockType } from "./types";
import { generateEmailHTML } from "./htmlGenerator";
import { buildEmailPreviewSrcDoc } from "./previewSrcDoc";
import { useBlockManagement } from "./hooks/useBlockManagement";
import { DeviceViewToggle } from "./DeviceViewToggle";
import { Canvas } from "./Canvas";
import { RightSidebar } from "./RightSidebar";
import { VariableAutocomplete } from "./VariableAutocomplete";
import { BlockPropertiesPanel } from "./BlockPropertiesPanel";
import { uploadTemplateImage } from "@/services/emailTemplateService";
import { SaveTemplateModal } from "./SaveTemplateModal";
import ConfirmModal from "@/components/ConfirmModal";

// Component for Select All checkbox with indeterminate state
const SelectAllCheckbox: React.FC<{
  blocks: EmailBlock[];
  selectedBlocks: Set<string>;
  onSelectAll: () => void;
  onUnselectAll: () => void;
}> = ({ blocks, selectedBlocks, onSelectAll, onUnselectAll }) => {
  const checkboxRef = React.useRef<HTMLInputElement>(null);
  const allSelected = blocks.length > 0 && selectedBlocks.size === blocks.length;
  const someSelected = blocks.length > 0 && selectedBlocks.size > 0 && selectedBlocks.size < blocks.length;

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <div className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 dark:border-slate-700 dark:bg-slate-900">
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={allSelected}
        onChange={(e) => {
          if (e.target.checked) {
            onSelectAll();
          } else {
            onUnselectAll();
          }
        }}
        className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 text-[#0b5cff] focus:ring-[#0b5cff]/30"
      />
      <label
        className="cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-200"
        onClick={(e) => {
          e.preventDefault();
          const checkbox = checkboxRef.current;
          if (checkbox) {
            checkbox.click();
          }
        }}
      >
        {allSelected ? "Unselect all" : "Select all"}
      </label>
    </div>
  );
};

const CustomEmailEditor: React.FC<CustomEmailEditorProps> = ({
  onDesignChange,
  onHtmlChange,
  initialDesign,
  initialHtml,
}) => {
  // Store callbacks in refs to prevent infinite loops
  const onDesignChangeRef = useRef(onDesignChange);
  const onHtmlChangeRef = useRef(onHtmlChange);
  const isInternalUpdateRef = useRef(false);

  // Update refs when callbacks change
  useEffect(() => {
    onDesignChangeRef.current = onDesignChange;
    onHtmlChangeRef.current = onHtmlChange;
  }, [onDesignChange, onHtmlChange]);

  // Block management hook
  const {
    blocks,
    setBlocks,
    selectedBlock,
    setSelectedBlock,
    addBlock: addBlockBase,
    updateBlock,
    deleteBlock,
    moveBlock,
    clearBlocks,
  } = useBlockManagement(initialDesign?.blocks || []);

  // Track previous initialDesign to prevent infinite loops
  const prevInitialDesignRef = useRef<string | null>(null);
  const isInitialMountRef = useRef(true);
  
  // Update blocks when initialDesign changes (for tab switching)
  useEffect(() => {
    // Skip on initial mount - let hook handle initial blocks
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      if (initialDesign?.blocks && initialDesign.blocks.length > 0) {
        prevInitialDesignRef.current = JSON.stringify(initialDesign.blocks);
      }
      return;
    }

    // Don't update if this is an internal update (from our own callbacks)
    if (isInternalUpdateRef.current) {
      return;
    }

    if (initialDesign?.blocks && initialDesign.blocks.length > 0) {
      // Create a stable key from blocks to compare
      const currentKey = JSON.stringify(initialDesign.blocks);
      
      // Only update if blocks are actually different
      if (prevInitialDesignRef.current !== currentKey) {
        prevInitialDesignRef.current = currentKey;
        // Normalize blocks to ensure all have props
        const normalizedBlocks = initialDesign.blocks.map((block: EmailBlock) => ({
          ...block,
          props: block.props || {},
          // Normalize nested blocks
          ...(block.type === "columns" && block.props?.columnBlocks ? {
            props: {
              ...block.props,
              columnBlocks: Object.keys(block.props.columnBlocks).reduce((acc: any, colIdx) => {
                const colBlocks = block.props.columnBlocks[colIdx] || [];
                acc[colIdx] = colBlocks.map((nb: EmailBlock) => ({ ...nb, props: nb.props || {} }));
                return acc;
              }, {}),
            },
          } : {}),
          ...(block.type === "header" && block.props?.headerBlocks ? {
            props: {
              ...block.props,
              headerBlocks: block.props.headerBlocks.map((nb: EmailBlock) => ({ ...nb, props: nb.props || {} })),
            },
          } : {}),
          ...(block.type === "footer" && block.props?.footerBlocks ? {
            props: {
              ...block.props,
              footerBlocks: block.props.footerBlocks.map((nb: EmailBlock) => ({ ...nb, props: nb.props || {} })),
            },
          } : {}),
        }));
        setBlocks(normalizedBlocks);
      }
    } else if (!initialDesign?.blocks || initialDesign.blocks.length === 0) {
      // Reset if initialDesign becomes empty (only if we had blocks before)
      if (prevInitialDesignRef.current !== null && prevInitialDesignRef.current !== "") {
        prevInitialDesignRef.current = "";
        setBlocks([]);
      }
    }
  }, [initialDesign?.blocks, setBlocks]);

  const [htmlCode, setHtmlCode] = useState(initialHtml || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconImageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingIconImage, setUploadingIconImage] = useState(false);
  const initialHtmlLoadedRef = useRef(false);

  // Initialize htmlCode from initialHtml when provided (for Dev Tool templates)
  useEffect(() => {
    if (initialHtml && !initialHtmlLoadedRef.current && initialHtml.trim() !== "") {
      initialHtmlLoadedRef.current = true;
      setHtmlCode(initialHtml);
      onHtmlChangeRef.current?.(initialHtml);
    }
  }, [initialHtml]);

  // Listen for updates from fullscreen dev tools page
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "htmlUpdate") {
        setHtmlCode(event.data.html);
        onHtmlChangeRef.current?.(event.data.html);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "devToolsHtmlCode" && e.newValue) {
        setHtmlCode(e.newValue);
        onHtmlChangeRef.current?.(e.newValue);
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  const [draggedBlockType, setDraggedBlockType] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [draggedColumnCount, setDraggedColumnCount] = useState<number | undefined>(undefined);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [rightSidebarTab, setRightSidebarTab] = useState<RightSidebarTab>("content");
  const [isPropertiesPanelCollapsed, setIsPropertiesPanelCollapsed] = useState(false);
  const [deviceView, setDeviceView] = useState<DeviceView>("desktop");
  
  // Force app download buttons to stack vertically on mobile (JavaScript fallback)
  useEffect(() => {
    if (deviceView === "mobile") {
      const forceMobileButtonStyles = () => {
        // Find all app download button containers and cells - ULTRA AGGRESSIVE SELECTORS
        const buttonContainers = document.querySelectorAll('table.app-buttons-container, table[class*="app-buttons-container"], table.app-download-buttons table, table[style*="margin-top: 20px"] table');
        const buttonCells = document.querySelectorAll('td.app-button-cell, td[style*="padding-right: 12px"], td[style*="padding-left: 12px"], td[style*="padding-right"], td[style*="padding-left"], td[style*="vertical-align"], table.app-buttons-container td, table[style*="margin-top: 20px"] table td');
        const appButtons = document.querySelectorAll('a.app-download-button, a[class*="app-download-button"], a[style*="width: 170px"], a[style*="display: inline-block"], a[style*="background-color: #000000"], a[style*="background-color: #181a22"]');

        // Force container tables to display block
        buttonContainers.forEach((container) => {
          if (container instanceof HTMLElement) {
            container.style.setProperty('display', 'block', 'important');
            container.style.setProperty('width', '100%', 'important');
            container.style.setProperty('max-width', '100%', 'important');
            container.style.setProperty('table-layout', 'fixed', 'important');
            container.style.setProperty('margin', '0 auto', 'important');
          }
        });

        // Force table rows to display block
        buttonContainers.forEach((container) => {
          const rows = container.querySelectorAll('tr');
          rows.forEach((row) => {
            if (row instanceof HTMLElement) {
              row.style.setProperty('display', 'block', 'important');
              row.style.setProperty('width', '100%', 'important');
              row.style.setProperty('float', 'none', 'important');
              row.style.setProperty('clear', 'both', 'important');
              row.style.setProperty('margin', '0', 'important');
            }
          });
        });

        // Force button cells to display block and full width - ULTRA AGGRESSIVE
        buttonCells.forEach((cell) => {
          if (cell instanceof HTMLElement) {
            cell.style.setProperty('display', 'block', 'important');
            cell.style.setProperty('width', '100%', 'important');
            cell.style.setProperty('max-width', '100%', 'important');
            cell.style.setProperty('min-width', '100%', 'important');
            cell.style.setProperty('padding', '8px 15px', 'important');
            cell.style.setProperty('padding-left', '15px', 'important');
            cell.style.setProperty('padding-right', '15px', 'important');
            cell.style.setProperty('padding-top', '8px', 'important');
            cell.style.setProperty('padding-bottom', '8px', 'important');
            cell.style.setProperty('text-align', 'center', 'important');
            cell.style.setProperty('box-sizing', 'border-box', 'important');
            cell.style.setProperty('float', 'none', 'important');
            cell.style.setProperty('clear', 'both', 'important');
            cell.style.setProperty('position', 'relative', 'important');
            cell.style.setProperty('margin', '0', 'important');
            cell.style.setProperty('margin-left', '0', 'important');
            cell.style.setProperty('margin-right', '0', 'important');
          }
        });

        // Force app download buttons to full width - ULTRA AGGRESSIVE
        appButtons.forEach((button) => {
          if (button instanceof HTMLElement) {
            button.style.setProperty('display', 'block', 'important');
            button.style.setProperty('width', '100%', 'important');
            button.style.setProperty('max-width', '100%', 'important');
            button.style.setProperty('min-width', '100%', 'important');
            button.style.setProperty('margin', '8px auto', 'important');
            button.style.setProperty('margin-left', 'auto', 'important');
            button.style.setProperty('margin-right', 'auto', 'important');
            button.style.setProperty('float', 'none', 'important');
            button.style.setProperty('clear', 'both', 'important');
            button.style.setProperty('position', 'relative', 'important');
            button.style.setProperty('box-sizing', 'border-box', 'important');
          }
        });
      };

      // Run immediately and after a short delay to catch dynamically rendered content
      forceMobileButtonStyles();
      const timeoutId = setTimeout(forceMobileButtonStyles, 100);
      const timeoutId2 = setTimeout(forceMobileButtonStyles, 500);

      // Also run when content changes
      const observer = new MutationObserver(() => {
        forceMobileButtonStyles();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(timeoutId2);
        observer.disconnect();
      };
    }
  }, [deviceView, blocks, htmlCode]);
  
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [templateBlocksToSave, setTemplateBlocksToSave] = useState<EmailBlock[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: "danger" | "warning" | "info";
    confirmText?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger",
  });
  const [templateRefreshTrigger, setTemplateRefreshTrigger] = useState(0);

  // General/Global settings
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    textColor: "#111827",
    backgroundColor: "#ffffff",
    contentWidth: "1200",
    contentAlignment: "center",
    fontFamily: "Arial, sans-serif",
    padding: "40px",
    lineHeight: "1.6",
    fontSize: "16px",
    linkColor: "#007bff",
    borderRadius: "8px",
    letterSpacing: "0px",
    fontWeight: "normal",
  });

  // Wrapper for addBlock that sets explicit alignment from general settings
  const addBlock = useCallback((type: string, insertIndex?: number, columnCount?: number, autoSelect: boolean = false) => {
    // Ensure blocks are added at the end when clicking (not dragging)
    const finalInsertIndex = insertIndex !== undefined ? insertIndex : undefined;
    
    // If columnCount is provided, create columns block with the specified count
    if (type === "columns" && columnCount !== undefined) {
      const columns = Array.from({ length: columnCount }, (_, i) => ({
        width: 1,
        content: `Column ${i + 1}`,
      }));
      
      // Create the block with empty columnBlocks (no default content)
      const newBlock: EmailBlock = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "columns",
        props: { 
          columns,
          columnBlocks: {}, // Empty - user will add content as needed
        },
        content: "",
      };

      if (finalInsertIndex !== undefined) {
        setBlocks((prev: EmailBlock[]) => {
          const newBlocks = [...prev];
          newBlocks.splice(finalInsertIndex, 0, newBlock);
          return newBlocks;
        });
      } else {
        setBlocks((prev: EmailBlock[]) => [...prev, newBlock]);
      }

      // Do NOT auto-select the nested heading after drop; selection will happen on hover/click only
      if (!autoSelect) {
        setSelectedBlock(null);
      }
      return;
    }
    
    // For columns type, columnCount MUST be provided - don't fall back to default
    if (type === "columns") {
      console.error("ERROR: columns block created without columnCount! This should not happen.");
      // Don't create block without columnCount - it would default to 2 columns incorrectly
      return;
    }
    
    // For other block types, use the base addBlock function (pass autoSelect parameter)
    addBlockBase(type, finalInsertIndex, autoSelect);
    // After adding, update the block with explicit alignment, but do NOT auto-select any block after drag-and-drop
    setTimeout(() => {
      setBlocks((prev: EmailBlock[]) => {
        const targetIndex = finalInsertIndex !== undefined ? finalInsertIndex : prev.length - 1;
        const lastBlock = prev[targetIndex];
        if (lastBlock && (type === "text" || type === "heading" || type === "button" || 
            type === "image" || type === "social" || type === "menu" || type === "logo" ||
            type === "header" || type === "footer")) {
          return prev.map((block: EmailBlock, idx: number) => {
            if (idx === targetIndex) {
              return {
                ...block,
                props: {
                  ...block.props,
                  align: generalSettings.contentAlignment,
                },
              };
            }
            return block;
          });
        }
        return prev;
      });
      // Clear selection after drag-and-drop (selection will happen on hover/click only)
      if (!autoSelect) {
        setSelectedBlock(null);
      }
    }, 0);
  }, [addBlockBase, generalSettings.contentAlignment, setBlocks, setSelectedBlock]);

  // Duplicate block function
  const duplicateBlock = useCallback((blockId: string) => {
    const blockToDuplicate = blocks.find((b) => b.id === blockId);
    if (!blockToDuplicate) return;

    const newBlock: EmailBlock = {
      ...blockToDuplicate,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      props: {
        ...blockToDuplicate.props,
      },
    };

    const blockIndex = blocks.findIndex((b) => b.id === blockId);
    const newBlocks = [...blocks];
    newBlocks.splice(blockIndex + 1, 0, newBlock);
    setBlocks(newBlocks);
    setSelectedBlock(newBlock.id);
  }, [blocks, setBlocks, setSelectedBlock]);

  // Available block types with icons and labels
  const blockTypes: BlockType[] = [
    { type: "header", label: "Header", icon: FaBars, color: "bg-red-500" },
    { type: "footer", label: "Footer", icon: FaWindowRestore, color: "bg-slate-500" },
    { type: "columns", label: "Columns", icon: FaColumns, color: "bg-blue-500" },
    { type: "button", label: "Button", icon: FaMousePointer, color: "bg-yellow-500" },
    { type: "divider", label: "Divider", icon: FaGripVertical, color: "bg-gray-500" },
    { type: "heading", label: "Heading", icon: FaHeading, color: "bg-purple-500" },
    { type: "text", label: "Paragraph", icon: FaParagraph, color: "bg-green-500" },
    { type: "image", label: "Image", icon: FaImage, color: "bg-pink-500" },
    { type: "logo", label: "Logo", icon: FaIcons, color: "bg-cyan-500" },
    { type: "social", label: "Social", icon: FaFacebook, color: "bg-indigo-500" },
    { type: "menu", label: "Menu", icon: FaGripVertical, color: "bg-teal-500" },
    { type: "html", label: "HTML", icon: FaCode, color: "bg-orange-500" },
  ];

  // Template variables - use useMemo to prevent recreation on every render
  const templateVariables = useMemo(() => ({
    name: "{{name}}",
    email: "{{email}}",
    company: "{{company}}",
    date: "{{date}}",
    year: "{{year}}",
  }), []);

  // Track previous values to prevent unnecessary callbacks
  const prevBlocksRef = useRef<string>("");
  const prevGeneralSettingsRef = useRef<string>("");
  const prevHtmlRef = useRef<string>("");

  // Sanitize incomplete Mustache tags to prevent parsing errors
  const sanitizeMustacheTags = (html: string): string => {
    // Find all {{...}} patterns and check if they're complete
    // If incomplete (no closing }}), escape them so Mustache doesn't try to parse
    return html.replace(/\{\{([^}]*?)(\}\})?/g, (match, content, closing) => {
      // If there's a closing }}, it's a valid tag - keep it
      if (closing === '}}') {
        return match;
      }
      // If no closing }}, escape the opening braces to prevent Mustache parsing
      return `&lt;&lt;${content}`;
    });
  };

  // Generate HTML from blocks
  useEffect(() => {
    // Skip HTML generation if we have initialHtml but no blocks (Dev Tool template)
    // This prevents overwriting the Dev Tool HTML with empty block HTML
    if (initialHtml && initialHtml.trim() !== "" && (!blocks || blocks.length === 0)) {
      return;
    }
    
    try {
      // Generate HTML for preview (flexbox) - matches desktop exactly
      const emailHtml = generateEmailHTML(blocks, generalSettings, false);
      // Compile with Mustache - wrap in try-catch to handle parsing errors
      let compiledHtml: string;
      try {
        // Sanitize incomplete tags before rendering
        const sanitizedHtml = sanitizeMustacheTags(emailHtml);
        compiledHtml = Mustache.render(sanitizedHtml, templateVariables);
        // Restore escaped incomplete tags back to {{ format for display
        // Handle &lt;&lt;name}} -> {{name}}
        compiledHtml = compiledHtml.replace(/&lt;&lt;([^&}]*?)}}/g, '{{$1}}');
        // Handle <<name}} -> {{name}} (if not HTML encoded)
        compiledHtml = compiledHtml.replace(/<<([^}]*?)}}/g, '{{$1}}');
      } catch (mustacheError) {
        console.error("Mustache rendering error:", mustacheError);
        // If Mustache fails, try to render with sanitized HTML
        try {
          const sanitizedHtml = sanitizeMustacheTags(emailHtml);
          compiledHtml = Mustache.render(sanitizedHtml, templateVariables);
          // Restore escaped incomplete tags back to {{ format for display
          compiledHtml = compiledHtml.replace(/&lt;&lt;([^&}]*?)}}/g, '{{$1}}');
          compiledHtml = compiledHtml.replace(/<<([^}]*?)}}/g, '{{$1}}');
        } catch (secondError) {
          console.error("Mustache rendering error after sanitization:", secondError);
          compiledHtml = emailHtml; // Fallback to raw HTML if Mustache fails
        }
      }

      // Create stable keys for comparison
      const blocksKey = JSON.stringify(blocks);
      const settingsKey = JSON.stringify(generalSettings);

      // Always update HTML code if it changed
      if (prevHtmlRef.current !== compiledHtml) {
        prevHtmlRef.current = compiledHtml;
        setHtmlCode(compiledHtml);
      }

      // Only call callbacks if blocks or settings changed (not on every render)
      const blocksChanged = prevBlocksRef.current !== blocksKey;
      const settingsChanged = prevGeneralSettingsRef.current !== settingsKey;

      if (blocksChanged || settingsChanged) {
        prevBlocksRef.current = blocksKey;
        prevGeneralSettingsRef.current = settingsKey;

        // Mark as internal update to prevent loop
        isInternalUpdateRef.current = true;
        
        // Call callbacks
        onHtmlChangeRef.current?.(compiledHtml);
        onDesignChangeRef.current?.({
          blocks,
          templateVariables,
          generalSettings,
          editorType: "custom",
        });

        // Reset flag after callbacks complete
        setTimeout(() => {
          isInternalUpdateRef.current = false;
        }, 50);
      }
    } catch (error) {
      console.error("Error generating HTML:", error);
      setHtmlCode("");
      onHtmlChangeRef.current?.("");
    }
  }, [blocks, generalSettings, templateVariables]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, blockType: string, columnCount?: number) => {
    // Prevent any accidental clicks or drops during drag
    e.stopPropagation();
    
    console.log("handleDragStart called - blockType:", blockType);
    
    // Clear any previous drag state to prevent conflicts
    setDraggedBlockId(null);
    setDraggedBlockType(blockType);
    console.log("handleDragStart - draggedBlockType set to:", blockType);
    
    // For columns block type, try to extract columnCount from backup format
    // BlocksTab sets text/columnCount BEFORE calling onDragStart
    let finalColumnCount = columnCount;
    if (blockType === "columns" && columnCount === undefined) {
      // Try to get columnCount from text/columnCount backup format (set by BlocksTab)
      // Note: We can't read application/json during dragStart, but we can read text formats
      try {
        // Use a small delay to ensure BlocksTab's setData has completed
        // Actually, we can't use delay in dragStart - need to read synchronously
        // BlocksTab sets text/columnCount, so try to read it
        const countStr = (e.dataTransfer as any).getData?.("text/columnCount");
        if (countStr) {
          finalColumnCount = parseInt(countStr, 10);
          console.log("handleDragStart: Extracted columnCount from text/columnCount:", finalColumnCount);
        }
      } catch (err) {
        // Can't read during dragStart - that's okay, we'll get it in handleDrop
        console.log("handleDragStart: Could not read columnCount (expected during dragStart)");
      }
    }
    
    // Store columnCount in state so we can use it in handleDrop
    if (finalColumnCount !== undefined) {
      setDraggedColumnCount(finalColumnCount);
      console.log("handleDragStart: Stored columnCount in state:", finalColumnCount);
    } else {
      setDraggedColumnCount(undefined);
    }
    
    e.dataTransfer.effectAllowed = "copy"; // Use "copy" for new blocks from sidebar
    e.dataTransfer.setData("text/plain", blockType);
    e.dataTransfer.setData("blockType", blockType); // Add this for column drop compatibility
    
    // CRITICAL: For columns, preserve BlocksTab's JSON payload if we don't have columnCount
    // BlocksTab sets application/json with columnCount BEFORE calling onDragStart
    // We CANNOT read it during dragStart, so we must NOT overwrite it
    if (finalColumnCount !== undefined) {
      // We have columnCount, so set JSON payload with it
      const payload: any = { type: "new", blockType, columnCount: finalColumnCount };
      e.dataTransfer.setData("application/json", JSON.stringify(payload));
      console.log("handleDragStart: Set JSON payload with columnCount:", finalColumnCount);
    } else if (blockType !== "columns") {
      // For non-columns blocks, set basic payload
      const payload: any = { type: "new", blockType };
      e.dataTransfer.setData("application/json", JSON.stringify(payload));
    }
    // IMPORTANT: If blockType is "columns" and finalColumnCount is undefined,
    // DO NOT call setData for application/json - this preserves BlocksTab's payload
    // BlocksTab already set it with the correct columnCount (3 or 4)
    
    // Set opacity on the dragged element
    const target = e.target as HTMLElement;
    if (target) {
      target.style.opacity = "0.5";
    }
  };

  const handleDragStartBlock = (e: React.DragEvent, blockId: string) => {
    // Prevent any accidental clicks or drops during drag
    e.stopPropagation();
    
    setDraggedBlockId(blockId);
    // Clear draggedBlockType to ensure we're moving, not creating
    setDraggedBlockType(null);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", blockId);
    
    // Find the block being dragged to extract columnCount if it's a columns block
    const draggedBlock = blocks.find((b) => b.id === blockId);
    const columnCount = draggedBlock?.type === "columns" && draggedBlock?.props?.columns
      ? draggedBlock.props.columns.length
      : undefined;
    
    const payload: any = { type: "move", blockId };
    if (columnCount !== undefined) {
      payload.columnCount = columnCount;
      e.dataTransfer.setData("text/columnCount", columnCount.toString());
    }
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    
    // Set opacity on the dragged element
    const target = e.target as HTMLElement;
    if (target) {
      target.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset opacity
    const target = e.target as HTMLElement;
    if (target) {
      target.style.opacity = "1";
    }
    
    // Clear all drag state immediately
    setDraggedBlockType(null);
    setDraggedBlockId(null);
    setDraggedColumnCount(undefined);
    setDragOverIndex(null);
  };

  // Template handlers
  const handleLoadTemplate = useCallback((templateBlocks: EmailBlock[]) => {
    // Add template blocks to the end of current blocks
    setBlocks((prev: EmailBlock[]) => [...prev, ...templateBlocks]);
    // Clear selection
    setSelectedBlock(null);
  }, [setBlocks, setSelectedBlock]);

  const handleSaveTemplate = useCallback((blocksToSave: EmailBlock[]) => {
    setTemplateBlocksToSave(blocksToSave);
    setShowSaveTemplateModal(true);
  }, []);

  const handleDragOver = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    e.stopPropagation();
    // Set correct drop effect based on what's being dragged
    if (draggedBlockId) {
      e.dataTransfer.dropEffect = "move";
    } else if (draggedBlockType === "template" || draggedBlockType) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "move";
    }
    if (index !== undefined) {
      // Update immediately for responsive feedback
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    // Use a longer delay to prevent flickering when moving between drop zones
    // This allows smooth transitions between adjacent drop zones
    setTimeout(() => {
      setDragOverIndex(null);
    }, 150);
  };

  const handleDrop = (e: React.DragEvent, dropIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear drag over index immediately to prevent visual glitches
    setDragOverIndex(null);

    // Priority 1: Moving existing block (check state first)
    if (draggedBlockId) {
      const sourceIndex = blocks.findIndex((b) => b.id === draggedBlockId);
      const targetIndex = dropIndex !== undefined ? dropIndex : blocks.length;

      if (sourceIndex !== -1) {
        // Don't do anything if dropping at the same position or immediately after
        // Allow dropping before (targetIndex === sourceIndex) or after (targetIndex === sourceIndex + 1)
        if (targetIndex === sourceIndex || targetIndex === sourceIndex + 1) {
          // Clear drag state and return early - no block creation
          setDraggedBlockType(null);
          setDraggedBlockId(null);
          setDraggedColumnCount(undefined);
          return;
        }

        // Move the block
        const newBlocks = [...blocks];
        const [movedBlock] = newBlocks.splice(sourceIndex, 1);
        
        // Calculate correct insertion index
        // If moving forward (source < target), we need to account for the removed element
        let finalIndex = targetIndex;
        if (sourceIndex < targetIndex) {
          finalIndex = targetIndex - 1;
        }
        
        newBlocks.splice(finalIndex, 0, movedBlock);
        setBlocks(newBlocks);
      }
      
      // Clear all drag state after moving
      setDraggedBlockType(null);
      setDraggedBlockId(null);
      setDraggedColumnCount(undefined);
      return;
    }

    // Priority 2: Adding new block from sidebar (check state first)
    // Skip if it's a template (already handled in Priority 0)
    if (draggedBlockType && !draggedBlockId && draggedBlockType !== "template") {
      const insertIndex = dropIndex !== undefined ? dropIndex : blocks.length;
      console.log("Adding new block from drag:", draggedBlockType, "at index:", insertIndex);
      
      // CRITICAL: Always read columnCount from JSON payload FIRST (most reliable)
      // BlocksTab sets it in the JSON payload, and it's the source of truth
      let columnCount: number | undefined = undefined;
      try {
        const jsonData = e.dataTransfer.getData("application/json");
        if (jsonData) {
          const data = JSON.parse(jsonData);
          if (data.columnCount !== undefined) {
            columnCount = data.columnCount;
            console.log("Priority 2: Extracted columnCount from JSON payload:", columnCount);
          }
        }
      } catch (err) {
        console.error("Priority 2: Error reading JSON:", err);
      }
      
      // Fallback to state if JSON didn't have it
      if (columnCount === undefined && draggedColumnCount !== undefined) {
        columnCount = draggedColumnCount;
        console.log("Priority 2: Using columnCount from state:", columnCount);
      }
      
      // Final fallback: Try text/columnCount format
      if (columnCount === undefined && draggedBlockType === "columns") {
        try {
          const countStr = e.dataTransfer.getData("text/columnCount");
          if (countStr) {
            columnCount = parseInt(countStr, 10);
            console.log("Priority 2: Extracted columnCount from text/columnCount:", columnCount);
          }
        } catch (err) {
          // Ignore
        }
      }
      
      console.log("Priority 2: Final column count for new block:", columnCount, "blockType:", draggedBlockType);
      
      // CRITICAL: For columns, columnCount MUST be defined
      if (draggedBlockType === "columns" && columnCount === undefined) {
        console.error("ERROR: columns block without columnCount in Priority 2! This should not happen.");
        console.log("Available dataTransfer types:", Array.from(e.dataTransfer.types));
        // Try one more time with all possible formats
        try {
          // Try application/json
          const jsonData = e.dataTransfer.getData("application/json");
          console.log("JSON data:", jsonData);
          if (jsonData) {
            const data = JSON.parse(jsonData);
            console.log("Parsed JSON data:", data);
            if (data.columnCount !== undefined) {
              columnCount = data.columnCount;
              console.log("Found columnCount in final attempt:", columnCount);
            }
          }
          // Try text/columnCount
          if (columnCount === undefined) {
            const countStr = e.dataTransfer.getData("text/columnCount");
            console.log("text/columnCount:", countStr);
            if (countStr) {
              columnCount = parseInt(countStr, 10);
              console.log("Found columnCount from text/columnCount:", columnCount);
            }
          }
        } catch (err) {
          console.error("Error in final columnCount extraction:", err);
        }
        
        // If still undefined, use default of 2 columns (matches blockUtils default)
        if (columnCount === undefined) {
          console.warn("WARNING: columns block without columnCount, using default of 2");
          columnCount = 2;
        }
      }
      
      // Only create block if we have a valid block type
      if (draggedBlockType && draggedBlockType !== "template") {
        addBlock(draggedBlockType, insertIndex, columnCount);
      }
      
      // Clear all drag state after creating
      setDraggedBlockType(null);
      setDraggedBlockId(null);
      setDraggedColumnCount(undefined);
      return;
    }

    // Fallback: Try dataTransfer (for compatibility)
    // This handles cases where draggedBlockType state wasn't set (e.g., BlocksTab layouts)
    try {
      let blockType: string | null = null;
      let blockId: string | null = null;
      
      // Try application/json first (most reliable) - this is where BlocksTab stores columnCount
      let columnCount: number | undefined = undefined;
      try {
        const jsonData = e.dataTransfer.getData("application/json");
        if (jsonData) {
          const data = JSON.parse(jsonData);
          if (data.type === "move" && data.blockId) {
            blockId = data.blockId;
          } else if (data.type === "new" && data.blockType) {
            blockType = data.blockType;
            // CRITICAL: Extract columnCount from JSON payload (set by BlocksTab)
            if (data.columnCount !== undefined) {
              columnCount = data.columnCount;
              console.log("Extracted columnCount from JSON:", columnCount);
            }
          }
        }
      } catch (err) {
        // Ignore
      }
      
      // Backup: Try text/columnCount format
      if (columnCount === undefined && blockType === "columns") {
        try {
          const countStr = e.dataTransfer.getData("text/columnCount");
          if (countStr) {
            columnCount = parseInt(countStr, 10);
            console.log("Extracted columnCount from text/columnCount:", columnCount);
          }
        } catch (err) {
          // Ignore
        }
      }
      
      // If we found a blockId, move the block
      if (blockId) {
        const sourceIndex = blocks.findIndex((b) => b.id === blockId);
        const targetIndex = dropIndex !== undefined ? dropIndex : blocks.length;

        if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
          const newBlocks = [...blocks];
          const [movedBlock] = newBlocks.splice(sourceIndex, 1);
          const finalIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
          newBlocks.splice(finalIndex, 0, movedBlock);
          setBlocks(newBlocks);
        }
        setDraggedBlockType(null);
        setDraggedBlockId(null);
        return;
      }
      
      // If we found a blockType, add new block
      if (!blockType) {
        // Try blockType
        try {
          blockType = e.dataTransfer.getData("blockType");
        } catch (err) {
          // Ignore
        }
      }
      
      if (!blockType) {
        // Try text/plain
        try {
          blockType = e.dataTransfer.getData("text/plain");
        } catch (err) {
          // Ignore
        }
      }
      
      if (blockType) {
        // Adding new block from sidebar
        const insertIndex = dropIndex !== undefined ? dropIndex : blocks.length;
        console.log("Adding new block from dataTransfer fallback:", blockType, "at index:", insertIndex, "columnCount:", columnCount);
        
        // CRITICAL: For columns, ensure we have columnCount from JSON payload
        if (blockType === "columns" && columnCount === undefined) {
          console.warn("WARNING: columns block without columnCount in fallback - checking JSON again");
          // Try one more time to get columnCount from JSON
          try {
            const jsonData = e.dataTransfer.getData("application/json");
            if (jsonData) {
              const data = JSON.parse(jsonData);
              if (data.columnCount !== undefined) {
                columnCount = data.columnCount;
                console.log("Fallback: Found columnCount in JSON:", columnCount);
              }
            }
          } catch (err) {
            console.error("Fallback: Error reading JSON:", err);
          }
        }
        
        // Only create block if we have a valid block type
        if (blockType && blockType !== "template") {
          addBlock(blockType, insertIndex, columnCount);
        }
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }

    // Always clear drag state at the end
    setDraggedBlockType(null);
    setDraggedBlockId(null);
    setDraggedColumnCount(undefined);
  };

  // Image upload handlers
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - accept all image types (jpg, jpeg, png, gif, webp, svg, etc.)
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/x-icon', 'image/tiff', 'image/vnd.microsoft.icon'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff', '.tif'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    const hasValidType = file.type.startsWith("image/") || validImageTypes.includes(file.type);
    
    if (!hasValidType && !hasValidExtension) {
      alert("Please select a valid image file (jpg, jpeg, png, gif, webp, svg, bmp, ico, tiff, tif)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      // Upload to Cloudinary instead of converting to base64
      const imageUrl = await uploadTemplateImage(file);
      const selectedBlockData = blocks.find((b) => b.id === selectedBlock);
      if (selectedBlockData && selectedBlockData.type === "image") {
        updateBlock(selectedBlockData.id, {
          props: {
            ...selectedBlockData.props,
            src: imageUrl,
          },
        });
      }
      setUploadingImage(false);
    } catch (error: any) {
      console.error("Error uploading image:", error);
      alert(error.message || "Error uploading image");
      setUploadingImage(false);
    }
  };

  const handleLogoImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - accept all image types (jpg, jpeg, png, gif, webp, svg, etc.)
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/x-icon', 'image/tiff', 'image/vnd.microsoft.icon'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff', '.tif'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    const hasValidType = file.type.startsWith("image/") || validImageTypes.includes(file.type);
    
    if (!hasValidType && !hasValidExtension) {
      alert("Please select a valid image file (jpg, jpeg, png, gif, webp, svg, bmp, ico, tiff, tif)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploadingIconImage(true);
    try {
      // Upload to Cloudinary instead of converting to base64
      const imageUrl = await uploadTemplateImage(file);
      const selectedBlockData = blocks.find((b) => b.id === selectedBlock);
      if (selectedBlockData && selectedBlockData.type === "logo") {
        updateBlock(selectedBlockData.id, {
          props: {
            ...selectedBlockData.props,
            imageSrc: imageUrl,
          },
        });
      }
      setUploadingIconImage(false);
    } catch (error: any) {
      console.error("Error uploading logo image:", error);
      alert(error.message || "Error uploading logo image");
      setUploadingIconImage(false);
    }
  };

  const selectedBlockData = blocks.find((b) => b.id === selectedBlock);

  return (
    <>
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Top Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900 sm:px-4">
          <DeviceViewToggle
            deviceView={deviceView}
            onDeviceViewChange={setDeviceView}
            onPreviewClick={() => {
              setShowPreview(!showPreview);
            }}
            isPreviewActive={showPreview}
            onResetClick={() => {
              setConfirmModal({
                isOpen: true,
                title: "Clear All Content",
                message: "Are you sure you want to clear all content? This action cannot be undone.",
                type: "warning",
                confirmText: "Clear All",
                onConfirm: () => {
                  clearBlocks();
                  setSelectedBlock(null);
                },
              });
            }}
          />
          {!showPreview && (
            <div className="flex flex-wrap items-center gap-2">
              {isMultiSelectMode ? (
                <>
                  <SelectAllCheckbox
                    blocks={blocks}
                    selectedBlocks={selectedBlocks}
                    onSelectAll={() => {
                      const allBlockIds = new Set(blocks.map(block => block.id));
                      setSelectedBlocks(allBlockIds);
                    }}
                    onUnselectAll={() => {
                      setSelectedBlocks(new Set());
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedBlocks.size > 0) {
                        setConfirmModal({
                          isOpen: true,
                          title: "Delete Selected Blocks",
                          message: `Are you sure you want to delete ${selectedBlocks.size} selected block${selectedBlocks.size > 1 ? 's' : ''}? This action cannot be undone.`,
                          type: "danger",
                          confirmText: "Delete",
                          onConfirm: () => {
                            selectedBlocks.forEach(blockId => deleteBlock(blockId));
                            setSelectedBlocks(new Set());
                            setIsMultiSelectMode(false);
                          },
                        });
                      }
                    }}
                    className={`inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-semibold transition ${
                      selectedBlocks.size > 0
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                    disabled={selectedBlocks.size === 0}
                  >
                    Delete ({selectedBlocks.size})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMultiSelectMode(false);
                      setSelectedBlocks(new Set());
                    }}
                    className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsMultiSelectMode(true)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#0b5cff] px-2.5 text-xs font-semibold text-white transition hover:bg-[#0947d6]"
                >
                  Select multiple
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preview Mode */}
          {showPreview ? (
            <div className="flex-1 overflow-auto bg-slate-100 p-3 dark:bg-slate-950/80 sm:p-5">
              <div
                className="mx-auto overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700"
                style={{
                  maxWidth: deviceView === "mobile" ? 375 : "100%",
                  width: deviceView === "mobile" ? 375 : "100%",
                }}
              >
                <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-800 px-3 py-2.5 dark:border-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-semibold text-white">
                    Email preview
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className="ml-auto rounded-md bg-slate-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-slate-500"
                  >
                    Close
                  </button>
                </div>
                <iframe
                  title="Email designer preview"
                  sandbox=""
                  srcDoc={buildEmailPreviewSrcDoc(htmlCode, {
                    mobile: deviceView === "mobile",
                  })}
                  className="w-full border-0 bg-white"
                  style={{
                    minHeight: deviceView === "mobile" ? 480 : 560,
                    height:
                      deviceView === "mobile"
                        ? "calc(100vh - 12rem)"
                        : "calc(100vh - 13rem)",
                  }}
                />
              </div>
            </div>
          ) : (
            /* Canvas Area - Show editable blocks in desktop/mobile view, only preview button shows HTML preview */
            <Canvas
              onMove={moveBlock}
              blocks={blocks}
              selectedBlock={selectedBlock}
              draggedBlockType={draggedBlockType}
              draggedBlockId={draggedBlockId}
              dragOverIndex={dragOverIndex}
              deviceView={deviceView}
              generalSettings={generalSettings}
              blockTypes={blockTypes}
              onSelect={setSelectedBlock}
              onDelete={deleteBlock}
              onUpdate={updateBlock}
              onDragStartBlock={handleDragStartBlock}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              htmlCode={htmlCode}
              showPreviewMode={false}
              selectedBlocks={selectedBlocks}
              isMultiSelectMode={isMultiSelectMode}
              onToggleBlockSelect={(blockId) => {
                setSelectedBlocks(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(blockId)) {
                    newSet.delete(blockId);
                  } else {
                    newSet.add(blockId);
                  }
                  return newSet;
                });
              }}
              onDeleteMultiple={() => {
                selectedBlocks.forEach(blockId => {
                  deleteBlock(blockId);
                });
                setSelectedBlocks(new Set());
                setIsMultiSelectMode(false);
              }}
              onDeleteRequest={(blockId, onConfirm) => {
                setConfirmModal({
                  isOpen: true,
                  title: "Delete Block",
                  message: "Are you sure you want to delete this block? This action cannot be undone.",
                  type: "danger",
                  confirmText: "Delete",
                  onConfirm: onConfirm,
                });
              }}
            />
          )}

          {/* Right Sidebar - Hide in preview mode, show only when no block is selected */}
          {!showPreview && !selectedBlock && (
            <RightSidebar
              rightSidebarTab={rightSidebarTab}
              onTabChange={setRightSidebarTab}
              blockTypes={blockTypes}
              draggedBlockType={draggedBlockType}
              templateVariables={templateVariables}
              blocks={blocks}
              generalSettings={generalSettings}
              htmlCode={htmlCode}
              onAddBlock={addBlock}
              onUpdateBlock={updateBlock}
              onSettingsChange={setGeneralSettings}
              onHtmlChange={(html) => {
                setHtmlCode(html);
                onHtmlChange?.(html);
              }}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onBlocksChange={setBlocks}
              onClearBlocks={clearBlocks}
              hideContentBlocks={false}
              onLoadTemplate={handleLoadTemplate}
              onSaveTemplate={handleSaveTemplate}
              templateRefreshTrigger={templateRefreshTrigger}
            />
          )}

          {/* Properties Panel - Block Properties - Hide in preview mode, show only when block is selected */}
          {!showPreview && selectedBlock && (() => {
            // Helper function to find block (including nested blocks in columns, headers, and footers)
            const findBlock = (blocksList: EmailBlock[], blockId: string): EmailBlock | null => {
              for (const block of blocksList) {
                if (block.id === blockId) return block;
                // Check nested blocks in columns
                if (block.type === "columns" && block.props.columnBlocks) {
                  const columnBlocks = block.props.columnBlocks;
                  for (const colIdx in columnBlocks) {
                    const nestedBlocks = columnBlocks[colIdx] || [];
                    const found = nestedBlocks.find((nb: EmailBlock) => nb.id === blockId);
                    if (found) return found;
                  }
                }
                // Check nested blocks in header
                if (block.type === "header" && block.props.headerBlocks) {
                  const found = block.props.headerBlocks.find((nb: EmailBlock) => nb.id === blockId);
                  if (found) return found;
                }
                // Check nested blocks in footer
                if (block.type === "footer" && block.props.footerBlocks) {
                  const found = block.props.footerBlocks.find((nb: EmailBlock) => nb.id === blockId);
                  if (found) return found;
                }
              }
              return null;
            };
            
            const foundBlock = findBlock(blocks, selectedBlock);
            return foundBlock ? (
              <BlockPropertiesPanel
                key={`panel-${selectedBlock}-${foundBlock.props?.level || 1}`}
                block={foundBlock}
                generalSettings={generalSettings}
                onUpdate={(id, updates) => {
                  // Check if it's a nested block (in columns, header, or footer)
                  const isNested = blocks.some((b) => {
                    // Check columns
                    if (b.type === "columns" && b.props.columnBlocks) {
                      return Object.values(b.props.columnBlocks).some((colBlocks: any) =>
                        Array.isArray(colBlocks) && colBlocks.some((nb: EmailBlock) => nb.id === id)
                      );
                    }
                    // Check header
                    if (b.type === "header" && b.props.headerBlocks) {
                      return Array.isArray(b.props.headerBlocks) && b.props.headerBlocks.some((nb: EmailBlock) => nb.id === id);
                    }
                    // Check footer
                    if (b.type === "footer" && b.props.footerBlocks) {
                      return Array.isArray(b.props.footerBlocks) && b.props.footerBlocks.some((nb: EmailBlock) => nb.id === id);
                    }
                    return false;
                  });
                  
                  if (isNested) {
                    // Update nested block
                    setBlocks((prev: EmailBlock[]) =>
                      prev.map((block: EmailBlock) => {
                        // Handle columns
                        if (block.type === "columns" && block.props.columnBlocks) {
                          const updatedColumnBlocks = { ...block.props.columnBlocks };
                          let updated = false;
                          for (const colIdx in updatedColumnBlocks) {
                            const colBlocks = updatedColumnBlocks[colIdx] || [];
                            const blockIndex = colBlocks.findIndex((nb: EmailBlock) => nb.id === id);
                            if (blockIndex !== -1) {
                              updatedColumnBlocks[colIdx] = colBlocks.map((nb: EmailBlock) => {
                                if (nb.id === id) {
                                  // Properly merge props if updates contain props
                                  if (updates.props && nb.props) {
                                    return {
                                      ...nb,
                                      ...updates,
                                      props: {
                                        ...nb.props,
                                        ...updates.props,
                                        // Deep merge style if both exist
                                        style: updates.props.style || nb.props.style
                                          ? {
                                              ...(nb.props.style || {}),
                                              ...(updates.props.style || {}),
                                            }
                                          : undefined,
                                      },
                                    };
                                  }
                                  return { ...nb, ...updates };
                                }
                                return nb;
                              });
                              updated = true;
                              break;
                            }
                          }
                          if (updated) {
                            return {
                              ...block,
                              props: {
                                ...block.props,
                                columnBlocks: updatedColumnBlocks,
                              },
                            };
                          }
                        }
                        // Handle header
                        if (block.type === "header" && block.props.headerBlocks) {
                          const blockIndex = block.props.headerBlocks.findIndex((nb: EmailBlock) => nb.id === id);
                          if (blockIndex !== -1) {
                            return {
                              ...block,
                              props: {
                                ...block.props,
                                headerBlocks: block.props.headerBlocks.map((nb: EmailBlock) => {
                                  if (nb.id === id) {
                                    // Properly merge props if updates contain props
                                    if (updates.props && nb.props) {
                                      return {
                                        ...nb,
                                        ...updates,
                                        props: {
                                          ...nb.props,
                                          ...updates.props,
                                          // Deep merge style if both exist
                                          style: updates.props.style || nb.props.style
                                            ? {
                                                ...(nb.props.style || {}),
                                                ...(updates.props.style || {}),
                                              }
                                            : undefined,
                                        },
                                      };
                                    }
                                    return { ...nb, ...updates };
                                  }
                                  return nb;
                                }),
                              },
                            };
                          }
                        }
                        // Handle footer
                        if (block.type === "footer" && block.props.footerBlocks) {
                          const blockIndex = block.props.footerBlocks.findIndex((nb: EmailBlock) => nb.id === id);
                          if (blockIndex !== -1) {
                            return {
                              ...block,
                              props: {
                                ...block.props,
                                footerBlocks: block.props.footerBlocks.map((nb: EmailBlock) => {
                                  if (nb.id === id) {
                                    // Properly merge props if updates contain props
                                    if (updates.props && nb.props) {
                                      return {
                                        ...nb,
                                        ...updates,
                                        props: {
                                          ...nb.props,
                                          ...updates.props,
                                          // Deep merge style if both exist
                                          style: updates.props.style || nb.props.style
                                            ? {
                                                ...(nb.props.style || {}),
                                                ...(updates.props.style || {}),
                                              }
                                            : undefined,
                                        },
                                      };
                                    }
                                    return { ...nb, ...updates };
                                  }
                                  return nb;
                                }),
                              },
                            };
                          }
                        }
                        return block;
                      })
                    );
                  } else {
                    updateBlock(id, updates);
                  }
                }}
                onDelete={(id) => {
                  // Check if it's a nested block (in columns, header, or footer)
                  const isNested = blocks.some((b) => {
                    // Check columns
                    if (b.type === "columns" && b.props.columnBlocks) {
                      return Object.values(b.props.columnBlocks).some((colBlocks: any) =>
                        Array.isArray(colBlocks) && colBlocks.some((nb: EmailBlock) => nb.id === id)
                      );
                    }
                    // Check header
                    if (b.type === "header" && b.props.headerBlocks) {
                      return Array.isArray(b.props.headerBlocks) && b.props.headerBlocks.some((nb: EmailBlock) => nb.id === id);
                    }
                    // Check footer
                    if (b.type === "footer" && b.props.footerBlocks) {
                      return Array.isArray(b.props.footerBlocks) && b.props.footerBlocks.some((nb: EmailBlock) => nb.id === id);
                    }
                    return false;
                  });
                  
                  if (isNested) {
                    // Delete nested block
                    setBlocks((prev: EmailBlock[]) =>
                      prev.map((block: EmailBlock) => {
                        // Handle columns
                        if (block.type === "columns" && block.props.columnBlocks) {
                          const updatedColumnBlocks = { ...block.props.columnBlocks };
                          for (const colIdx in updatedColumnBlocks) {
                            updatedColumnBlocks[colIdx] = (updatedColumnBlocks[colIdx] || []).filter(
                              (nb: EmailBlock) => nb.id !== id
                            );
                          }
                          return {
                            ...block,
                            props: {
                              ...block.props,
                              columnBlocks: updatedColumnBlocks,
                            },
                          };
                        }
                        // Handle header
                        if (block.type === "header" && block.props.headerBlocks) {
                          return {
                            ...block,
                            props: {
                              ...block.props,
                              headerBlocks: block.props.headerBlocks.filter((nb: EmailBlock) => nb.id !== id),
                            },
                          };
                        }
                        // Handle footer
                        if (block.type === "footer" && block.props.footerBlocks) {
                          return {
                            ...block,
                            props: {
                              ...block.props,
                              footerBlocks: block.props.footerBlocks.filter((nb: EmailBlock) => nb.id !== id),
                            },
                          };
                        }
                        return block;
                      })
                    );
                  } else {
                    deleteBlock(id);
                  }
                  setSelectedBlock(null);
                }}
                onDuplicate={duplicateBlock}
                onClose={() => setSelectedBlock(null)}
                onCollapse={() => setIsPropertiesPanelCollapsed(!isPropertiesPanelCollapsed)}
              />
            ) : null;
          })()}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
      />

      {/* Save Template Modal */}
      <SaveTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => {
          setShowSaveTemplateModal(false);
          setTemplateBlocksToSave([]);
        }}
        blocks={templateBlocksToSave}
        generalSettings={generalSettings}
        onSuccess={() => {
          // Close modal first
          setShowSaveTemplateModal(false);
          setTemplateBlocksToSave([]);
          // Refresh templates list by incrementing trigger after a small delay
          // This ensures the modal is closed and TemplatesTab is ready to refresh
          setTimeout(() => {
            setTemplateRefreshTrigger((prev) => prev + 1);
          }, 100);
        }}
      />
    </>
  );
};


export default CustomEmailEditor;