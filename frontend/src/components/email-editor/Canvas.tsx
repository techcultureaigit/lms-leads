import React, { useRef } from "react";
import { FaGripVertical } from "react-icons/fa";
import { EmailBlock, GeneralSettings, DeviceView, BlockType } from "./types";
import { BlockRenderer } from "./BlockRenderer";
import { buildEmailPreviewSrcDoc } from "./previewSrcDoc";

interface CanvasProps {
  blocks: EmailBlock[];
  selectedBlock: string | null;
  draggedBlockType: string | null;
  draggedBlockId: string | null;
  dragOverIndex: number | null;
  deviceView: DeviceView;
  generalSettings: GeneralSettings;
  blockTypes?: BlockType[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<EmailBlock>) => void;
  onMove?: (id: string, direction: "up" | "down") => void;
  onDragStartBlock: (e: React.DragEvent, blockId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, index?: number) => void;
  htmlCode?: string; // HTML code for preview mode
  showPreviewMode?: boolean; // If true, show HTML preview instead of editable blocks
  selectedBlocks?: Set<string>; // Multi-select selected blocks
  isMultiSelectMode?: boolean; // Whether multi-select mode is active
  onToggleBlockSelect?: (blockId: string) => void; // Toggle block selection
  onDeleteMultiple?: () => void; // Delete multiple selected blocks
  onDeleteRequest?: (id: string, onConfirm: () => void) => void; // Request delete with confirmation
}

export const Canvas: React.FC<CanvasProps> = ({
  blocks,
  selectedBlock,
  draggedBlockType,
  draggedBlockId,
  dragOverIndex,
  deviceView,
  generalSettings,
  blockTypes = [],
  onSelect,
  onDelete,
  onUpdate,
  onMove,
  onDragStartBlock,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  htmlCode,
  showPreviewMode = false,
  selectedBlocks = new Set(),
  isMultiSelectMode = false,
  onToggleBlockSelect,
  onDeleteMultiple,
  onDeleteRequest,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Use contentWidth but ensure it fits within container (responsive)
  const containerWidth = deviceView === "mobile" 
    ? "100%" 
    : parseInt(generalSettings.contentWidth || "1200");

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100" style={{ overflowX: "hidden", width: "100%", minWidth: 0, minHeight: "100%", height: "auto", display: "flex", flexDirection: "column" }}>
      <div className="flex-1 flex items-start justify-center" style={{ 
        maxWidth: "100%", 
        overflowX: "hidden", 
        width: "100%", 
        minWidth: 0, 
        minHeight: "100%",
        height: "auto",
        padding: deviceView === "mobile" ? "0" : "1.5rem",
        paddingBottom: deviceView === "mobile" ? "0" : "1.5rem"
      }}>
        <div
          ref={canvasRef}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Check if dragging a template (use draggedBlockType since dataTransfer can't be read here)
            if (draggedBlockType === "template") {
              e.dataTransfer.dropEffect = "copy";
              return;
            }
            // Use "copy" for new blocks from sidebar, "move" for existing blocks
            if (draggedBlockType && !draggedBlockId) {
              e.dataTransfer.dropEffect = "copy";
            } else {
              e.dataTransfer.dropEffect = "move";
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Canvas onDrop - draggedBlockType:", draggedBlockType, "draggedBlockId:", draggedBlockId, "blocks.length:", blocks.length);
            // Handle drop on canvas - check for templates first (use draggedBlockType as primary check)
            if (draggedBlockType === "template") {
              console.log("Canvas onDrop - Template detected via draggedBlockType");
              // If empty canvas, insert at index 0, otherwise insert at the end
              if (blocks.length === 0) {
                onDrop(e, 0);
              } else {
                onDrop(e, blocks.length);
              }
              return;
            }
            // Also check dataTransfer as fallback
            try {
              const jsonData = e.dataTransfer.getData("application/json");
              if (jsonData) {
                const data = JSON.parse(jsonData);
                if (data.type === "template") {
                  console.log("Canvas onDrop - Template detected via dataTransfer fallback");
                  // If empty canvas, insert at index 0, otherwise insert at the end
                  if (blocks.length === 0) {
                    onDrop(e, 0);
                  } else {
                    onDrop(e, blocks.length);
                  }
                  return;
                }
              }
            } catch (err) {
              console.error("Canvas onDrop - Error checking template:", err);
            }
            // Handle drop on canvas - either empty canvas or as fallback
            if (!draggedBlockId && draggedBlockType) {
              // If empty canvas, insert at index 0, otherwise let drop zones handle it
              // But if drop reached here, insert at the end as fallback
              if (blocks.length === 0) {
                onDrop(e, 0);
              } else {
                // Fallback: insert at end if drop zones didn't catch it
                onDrop(e, blocks.length);
              }
            }
          }}
          className={`bg-white transition-all duration-300 shadow-2xl ${
            (draggedBlockType && !draggedBlockId) || draggedBlockType === "template"
              ? "border-4 border-blue-400 border-dashed bg-gradient-to-br from-blue-50 to-indigo-50 ring-4 ring-blue-200/50"
              : "border-2 border-gray-200"
          }`}
          style={{
            maxWidth: deviceView === "mobile" ? "100%" : typeof containerWidth === "number" ? `${containerWidth}px` : "100%",
            width: deviceView === "mobile" ? "100%" : typeof containerWidth === "number" ? `${containerWidth}px` : "100%",
            margin: deviceView === "mobile" ? "0" : "0 auto",
            backgroundColor: generalSettings.backgroundColor,
            color: generalSettings.textColor,
            fontFamily: generalSettings.fontFamily,
            padding: deviceView === "mobile" ? "20px 15px" : generalSettings.padding,
            lineHeight: generalSettings.lineHeight,
            fontSize: deviceView === "mobile" ? "14px" : generalSettings.fontSize,
            minHeight: "auto",
            height: "auto",
            borderRadius: deviceView === "mobile" ? "0" : generalSettings.borderRadius,
            overflowX: "hidden",
            overflowY: "visible",
            boxSizing: "border-box",
            transition: "width 0.3s ease, max-width 0.3s ease, padding 0.3s ease, border-radius 0.3s ease",
            wordWrap: "break-word",
            wordBreak: "break-word",
            position: "relative",
            display: "block",
            paddingBottom: deviceView === "mobile" ? "20px" : generalSettings.padding,
          }}
        >
          {showPreviewMode && htmlCode ? (
            <iframe
              title="Email canvas preview"
              sandbox=""
              srcDoc={buildEmailPreviewSrcDoc(htmlCode, {
                mobile: deviceView === "mobile",
              })}
              className="w-full border-0 bg-white"
              style={{ minHeight: 480, height: "70vh" }}
            />
          ) : blocks.length === 0 ? (
            <div className="text-center py-32 text-gray-400">
              <div className="mb-6 transform transition-transform hover:scale-110">
                <FaGripVertical className="w-16 h-16 mx-auto mb-4 opacity-30 animate-pulse" />
              </div>
              <p className="text-base mb-2 font-semibold text-gray-500">No content here</p>
              <p className="text-sm text-gray-400">
                Drag content from the right panel to start building your email
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-[#0b5cff]" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-[#0b5cff]" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-[#0b5cff]" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          ) : (
            <>
              <div style={{ 
                width: "100%", 
                maxWidth: "100%",
                minWidth: 0,
                overflowX: "hidden", 
                overflowY: "visible", 
                boxSizing: "border-box",
                wordWrap: "break-word",
                wordBreak: "break-word",
                position: "relative",
                display: "block",
                paddingBottom: 0,
                marginBottom: 0,
              }}>
              {blocks.map((block, index) => (
                <React.Fragment key={block.id}>
                  {/* Drop zone before each block - Enhanced for smooth drag and drop */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Check if dragging a template (use draggedBlockType since dataTransfer can't be read here)
                      if (draggedBlockType === "template") {
                        e.dataTransfer.dropEffect = "copy";
                        onDragOver(e, index);
                        return;
                      }
                      if (draggedBlockId) {
                        e.dataTransfer.dropEffect = "move";
                      } else if (draggedBlockType) {
                        e.dataTransfer.dropEffect = "copy";
                      }
                      onDragOver(e, index);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Drop zone onDrop - index:", index, "draggedBlockType:", draggedBlockType);
                      // Check if dropping a template (use draggedBlockType as primary check)
                      if (draggedBlockType === "template") {
                        console.log("Drop zone - Template detected via draggedBlockType, calling onDrop with index:", index);
                        onDrop(e, index);
                        return;
                      }
                      // Also check dataTransfer as fallback
                      try {
                        const jsonData = e.dataTransfer.getData("application/json");
                        if (jsonData) {
                          const data = JSON.parse(jsonData);
                          if (data.type === "template") {
                            console.log("Drop zone - Template detected via dataTransfer fallback, calling onDrop with index:", index);
                            onDrop(e, index);
                            return;
                          }
                        }
                      } catch (err) {
                        console.error("Drop zone - Error checking template:", err);
                      }
                      console.log("Drop zone - Not a template, calling onDrop with index:", index);
                      onDrop(e, index);
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Check if dragging a template (use draggedBlockType since dataTransfer can't be read here)
                      if (draggedBlockType === "template") {
                        onDragOver(e, index);
                        return;
                      }
                      // Always trigger dragOver when entering drop zone
                      if (draggedBlockId || draggedBlockType) {
                        onDragOver(e, index);
                      }
                    }}
                    onDragLeave={(e) => {
                      // Prevent false triggers when moving between child elements
                      const relatedTarget = e.relatedTarget as HTMLElement;
                      const currentTarget = e.currentTarget as HTMLElement;
                      
                      // If moving to a child element, don't clear
                      if (relatedTarget && currentTarget.contains(relatedTarget)) {
                        return;
                      }
                      
                      // If moving to another drop zone or block, don't clear immediately
                      if (relatedTarget) {
                        const isMovingToDropZone = relatedTarget.closest('[class*="drop"]') || 
                                                   relatedTarget.closest('[draggable="true"]');
                        if (isMovingToDropZone) {
                          return;
                        }
                      }
                    }}
                    className={`transition-all duration-200 ease-out ${
                      dragOverIndex === index && draggedBlockId !== block.id
                        ? "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 border-t-2 border-b-2 border-blue-600 shadow-2xl"
                        : draggedBlockType || draggedBlockId || draggedBlockType === "template"
                        ? "bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-t border-b border-blue-300 shadow-lg"
                        : "bg-transparent"
                    }`}
                    style={{ 
                      minHeight: dragOverIndex === index && draggedBlockId !== block.id ? "48px" : (draggedBlockType || draggedBlockId || draggedBlockType === "template" ? "24px" : "12px"),
                      height: dragOverIndex === index && draggedBlockId !== block.id ? "48px" : (draggedBlockType || draggedBlockId || draggedBlockType === "template" ? "24px" : "12px"),
                      cursor: (draggedBlockType || draggedBlockId || draggedBlockType === "template") ? "copy" : "default",
                      width: "100%",
                      position: "relative",
                      zIndex: (draggedBlockType || draggedBlockId || draggedBlockType === "template") ? 20 : (dragOverIndex === index ? 15 : 1),
                      pointerEvents: "auto",
                      flexShrink: 0,
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      opacity: (draggedBlockType || draggedBlockId || draggedBlockType === "template") ? 1 : 0,
                      marginTop: dragOverIndex === index && draggedBlockId !== block.id ? "4px" : "0px",
                      marginBottom: dragOverIndex === index && draggedBlockId !== block.id ? "4px" : "0px",
                    }}
                  >
                    {/* Visual indicator line when actively dropping */}
                    {dragOverIndex === index && draggedBlockId !== block.id && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          pointerEvents: "none",
                        }}
                      >
                        <div 
                          className="w-full h-0.5 bg-blue-600"
                          style={{
                            boxShadow: "0 0 8px rgba(37, 99, 235, 0.6)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <BlockRenderer
                    block={block}
                    index={index}
                    selectedBlock={selectedBlock}
                    draggedBlockId={draggedBlockId}
                    draggedBlockType={draggedBlockType}
                    dragOverIndex={dragOverIndex}
                    generalSettings={generalSettings}
                    blockTypes={blockTypes}
                    onSelect={onSelect}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    onMove={onMove}
                    onDragStart={onDragStartBlock}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    totalBlocks={blocks.length}
                    isMultiSelectMode={isMultiSelectMode}
                    isSelected={selectedBlocks.has(block.id)}
                    onToggleSelect={onToggleBlockSelect}
                    onDeleteRequest={onDeleteRequest}
                  />
                </React.Fragment>
              ))}
              {/* Drop zone after last block */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedBlockId) {
                    e.dataTransfer.dropEffect = "move";
                  } else if (draggedBlockType) {
                    e.dataTransfer.dropEffect = "copy";
                  }
                  onDragOver(e, blocks.length);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDrop(e, blocks.length);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedBlockId || draggedBlockType) {
                    onDragOver(e, blocks.length);
                  }
                }}
                onDragLeave={(e) => {
                  // Don't clear if moving to child elements
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  if (relatedTarget && e.currentTarget.contains(relatedTarget)) {
                    return;
                  }
                }}
                className={`transition-all duration-200 ease-out ${
                  dragOverIndex === blocks.length
                    ? "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 border-t-2 border-b-2 border-blue-600 shadow-2xl"
                    : draggedBlockType || draggedBlockId
                    ? "bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-t border-b border-blue-300 shadow-lg"
                    : "bg-transparent"
                }`}
                style={{ 
                  minHeight: dragOverIndex === blocks.length ? "48px" : (draggedBlockType || draggedBlockId ? "24px" : "0px"),
                  height: dragOverIndex === blocks.length ? "48px" : (draggedBlockType || draggedBlockId ? "24px" : "0px"),
                  cursor: (draggedBlockType || draggedBlockId) ? "copy" : "default",
                  width: "100%",
                  position: "relative",
                  zIndex: dragOverIndex === blocks.length ? 20 : 1,
                  pointerEvents: "auto",
                  flexShrink: 0,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  opacity: (draggedBlockType || draggedBlockId) ? 1 : 0,
                  marginTop: dragOverIndex === blocks.length ? "4px" : "0px",
                  marginBottom: 0,
                  paddingBottom: 0,
                }}
              >
                {/* Visual indicator line when actively dropping */}
                {dragOverIndex === blocks.length && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      pointerEvents: "none",
                    }}
                  >
                    <div 
                      className="w-full h-0.5 bg-blue-600"
                      style={{
                        boxShadow: "0 0 8px rgba(37, 99, 235, 0.6)",
                      }}
                    />
                  </div>
                )}
              </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};