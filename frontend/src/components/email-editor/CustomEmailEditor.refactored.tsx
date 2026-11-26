"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
} from "react-icons/fa";
import Mustache from "mustache";
import { CustomEmailEditorProps, EmailBlock, GeneralSettings, RightSidebarTab, DeviceView, BlockType } from "./types";
import { generateEmailHTML } from "./htmlGenerator";
import { useBlockManagement } from "./hooks/useBlockManagement";
import { DeviceViewToggle } from "./DeviceViewToggle";
import { Canvas } from "./Canvas";
import { RightSidebar } from "./RightSidebar";

const CustomEmailEditor: React.FC<CustomEmailEditorProps> = ({
  onDesignChange,
  onHtmlChange,
  initialDesign,
}) => {
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

  // Update blocks when initialDesign changes (for tab switching)
  useEffect(() => {
    if (initialDesign?.blocks && initialDesign.blocks.length > 0) {
      setBlocks(initialDesign.blocks);
    }
  }, [initialDesign, setBlocks]);

  // Wrapper for addBlock that handles columnCount parameter
  const addBlock = useCallback((type: string, insertIndex?: number, columnCount?: number, autoSelect: boolean = false) => {
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

      if (insertIndex !== undefined) {
        setBlocks((prev: EmailBlock[]) => {
          const newBlocks = [...prev];
          newBlocks.splice(insertIndex, 0, newBlock);
          return newBlocks;
        });
      } else {
        setBlocks((prev: EmailBlock[]) => [...prev, newBlock]);
      }

      // Auto-select if requested
      if (autoSelect) {
        setSelectedBlock(newBlock.id);
      }
      return;
    }
    
    // For columns type without columnCount, don't create block
    if (type === "columns") {
      console.error("ERROR: columns block created without columnCount! This should not happen.");
      return;
    }
    
    // For other block types, use the base addBlock function
    addBlockBase(type, insertIndex, autoSelect);
  }, [addBlockBase, setBlocks, setSelectedBlock]);

  const [htmlCode, setHtmlCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconImageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingIconImage, setUploadingIconImage] = useState(false);
  const [draggedBlockType, setDraggedBlockType] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [rightSidebarTab, setRightSidebarTab] = useState<RightSidebarTab>("content");
  const [deviceView, setDeviceView] = useState<DeviceView>("desktop");

  // General/Global settings
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    textColor: "#111827",
    backgroundColor: "#ffffff",
    contentWidth: "800",
    contentAlignment: "center",
    fontFamily: "Arial, sans-serif",
    padding: "40px",
    lineHeight: "1.6",
    fontSize: "16px",
    linkColor: "#007bff",
    borderRadius: "8px",
  });

  // Available block types with icons and labels
  const blockTypes: BlockType[] = [
    { type: "columns", label: "Columns", icon: FaColumns, color: "bg-blue-500" },
    { type: "button", label: "Button", icon: FaMousePointer, color: "bg-yellow-500" },
    { type: "divider", label: "Divider", icon: FaGripVertical, color: "bg-gray-500" },
    { type: "heading", label: "Heading", icon: FaHeading, color: "bg-purple-500" },
    { type: "text", label: "Paragraph", icon: FaParagraph, color: "bg-green-500" },
    { type: "image", label: "Image", icon: FaImage, color: "bg-pink-500" },
    { type: "icon", label: "Icon", icon: FaIcons, color: "bg-cyan-500" },
    { type: "social", label: "Social", icon: FaFacebook, color: "bg-indigo-500" },
    { type: "menu", label: "Menu", icon: FaGripVertical, color: "bg-teal-500" },
    { type: "html", label: "HTML", icon: FaCode, color: "bg-orange-500" },
  ];

  // Template variables
  const templateVariables = {
    name: "{{name}}",
    email: "{{email}}",
    company: "{{company}}",
    date: "{{date}}",
    year: "{{year}}",
  };

  // Generate HTML from blocks
  useEffect(() => {
    generateHTML();
  }, [blocks, generalSettings]);

  const generateHTML = () => {
    const emailHtml = generateEmailHTML(blocks, generalSettings);
    // Compile with Mustache
    const compiledHtml = Mustache.render(emailHtml, templateVariables);

    setHtmlCode(compiledHtml);
    onHtmlChange?.(compiledHtml);
    onDesignChange?.({
      blocks,
      templateVariables,
      generalSettings,
      editorType: "custom",
    });
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, blockType: string) => {
    setDraggedBlockType(blockType);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", blockType);
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "new", blockType }));
    (e.target as HTMLElement).style.opacity = "0.5";
  };

  const handleDragStartBlock = (e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", blockId);
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "move", blockId }));
    (e.target as HTMLElement).style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "1";
    setDraggedBlockType(null);
    setDraggedBlockId(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (index !== undefined) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex?: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));

      if (data.type === "new") {
        // Adding new block from sidebar
        const insertIndex = dropIndex !== undefined ? dropIndex : blocks.length;
        addBlock(data.blockType, insertIndex);
      } else if (data.type === "move" && draggedBlockId) {
        // Moving existing block
        const sourceIndex = blocks.findIndex((b) => b.id === draggedBlockId);
        const targetIndex = dropIndex !== undefined ? dropIndex : blocks.length;

        if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
          const newBlocks = [...blocks];
          const [movedBlock] = newBlocks.splice(sourceIndex, 1);
          const finalIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
          newBlocks.splice(finalIndex, 0, movedBlock);
          setBlocks(newBlocks);
        }
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }

    setDraggedBlockType(null);
    setDraggedBlockId(null);
  };

  // Image upload handlers
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const selectedBlockData = blocks.find((b) => b.id === selectedBlock);
        if (selectedBlockData && selectedBlockData.type === "image") {
          updateBlock(selectedBlockData.id, {
            props: {
              ...selectedBlockData.props,
              src: base64String,
            },
          });
        }
        setUploadingImage(false);
      };
      reader.onerror = () => {
        alert("Error reading image file");
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
      setUploadingImage(false);
    }
  };

  const handleIconImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploadingIconImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const selectedBlockData = blocks.find((b) => b.id === selectedBlock);
        if (selectedBlockData && selectedBlockData.type === "icon") {
          updateBlock(selectedBlockData.id, {
            props: {
              ...selectedBlockData.props,
              imageSrc: base64String,
              iconType: "custom",
            },
          });
        }
        setUploadingIconImage(false);
      };
      reader.onerror = () => {
        alert("Error reading image file");
        setUploadingIconImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading icon image:", error);
      alert("Error uploading icon image");
      setUploadingIconImage(false);
    }
  };

  const selectedBlockData = blocks.find((b) => b.id === selectedBlock);

  return (
    <>
      <div className="h-full w-full flex flex-col bg-white overflow-hidden relative">
        {/* Top Toolbar - Device Preview Toggle */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
          <DeviceViewToggle deviceView={deviceView} onDeviceViewChange={setDeviceView} />
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <Canvas
            blocks={blocks}
            selectedBlock={selectedBlock}
            draggedBlockType={draggedBlockType}
            draggedBlockId={draggedBlockId}
            dragOverIndex={dragOverIndex}
            deviceView={deviceView}
            generalSettings={generalSettings}
            onSelect={setSelectedBlock}
            onDelete={deleteBlock}
            onDragStartBlock={handleDragStartBlock}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />

          {/* Right Sidebar */}
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
          />

          {/* Properties Panel - General Settings (Always Visible) */}
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 z-10 flex items-center gap-2">
              <FaEye className="w-4 h-4 text-gray-600" />
              <FaGripVertical className="w-4 h-4 text-gray-600" />
              <h3 className="text-xs font-semibold text-gray-700 uppercase">General</h3>
            </div>
            <div className="p-4 space-y-4">
              {/* General settings controls - simplified for now */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={generalSettings.textColor}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, textColor: e.target.value })
                    }
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={generalSettings.textColor}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, textColor: e.target.value })
                    }
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
              {/* Add more general settings controls as needed */}
            </div>

            {/* Block Properties Panel (When Block Selected) */}
            {selectedBlockData && (
              <div className="border-t border-gray-200">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-3 z-10">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase">Block Properties</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {/* Block-specific properties - simplified for now */}
                    {(selectedBlockData.type === "text" ||
                      selectedBlockData.type === "heading") && (
                      <>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-700">Content</label>
                          <textarea
                            value={selectedBlockData?.content ?? ""}
                            onChange={(e) =>
                              updateBlock(selectedBlockData.id, {
                                content: e.target.value,
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                            rows={4}
                            placeholder="Enter text. Use {{name}}, {{email}}, etc. for variables"
                          />
                        </div>
                      </>
                    )}
                    {/* Add more block-specific property panels as needed */}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* "by Unlayer Editor" Attribution - Bottom Right */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-gray-400 z-10">
          <span>by</span>
          <span className="font-semibold text-gray-600">Unlayer Editor</span>
          <FaBolt className="w-3 h-3 text-yellow-500" />
        </div>
      </div>
    </>
  );
};

export default CustomEmailEditor;
