import React, { useState } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Trash2,
  Eye,
} from "lucide-react";
import { GeneralSettings, EmailBlock } from "../types";
import ConfirmModal from "@/components/ConfirmModal";

interface GeneralSettingsTabProps {
  generalSettings: GeneralSettings;
  onSettingsChange: (settings: GeneralSettings) => void;
  blocks: EmailBlock[];
  onBlocksChange: (blocks: EmailBlock[]) => void;
  onClearBlocks: () => void;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
  generalSettings,
  onSettingsChange,
  blocks,
  onBlocksChange,
  onClearBlocks,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const setGeneralSettings = (settings: GeneralSettings) => {
    onSettingsChange(settings);
  };

  const setBlocks = (newBlocks: EmailBlock[]) => {
    if (onBlocksChange) {
      onBlocksChange(newBlocks);
    }
  };

  const inputFocus =
    "focus:outline-none focus:border-[#0b5cff] focus:ring-1 focus:ring-[#0b5cff]/15 transition-all";

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden max-w-full">
      <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 border-l-4 border-l-[#0b5cff] p-3 z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-[#0b5cff] rounded-lg">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">General Settings</h3>
        </div>
        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 pl-8 leading-tight">Default values for new blocks. Use &quot;Apply to All&quot; to update existing blocks.</p>
      </div>
      <div className="p-3 space-y-4">
        {/* Layout & Structure Section */}
        <div className="border-b border-slate-200 dark:border-slate-700 pb-3 rounded-lg p-3 -mx-1">
          <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-3 tracking-wider flex items-center gap-1.5">
            <span className="inline-block w-1 h-4 bg-[#0b5cff] rounded-full"></span>
            Layout & Structure
          </h4>
          
          {/* Background Color */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Background Color
              <span className="ml-1 text-slate-500 font-normal text-[9px]">(Email Container)</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={generalSettings.backgroundColor}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, backgroundColor: e.target.value })
                  }
                  className="w-10 h-10 border-2 border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                />
              </div>
              <input
                type="text"
                value={generalSettings.backgroundColor}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, backgroundColor: e.target.value })
                }
                className={`flex-1 min-w-0 p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-xs font-mono ${inputFocus}`}
                placeholder="#ffffff"
              />
            </div>
          </div>

          {/* Content Width */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Content Width
              <span className="ml-1 text-slate-500 font-normal text-[9px]">(Email Container)</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  setGeneralSettings({
                    ...generalSettings,
                    contentWidth: String(
                      Math.max(300, parseInt(generalSettings.contentWidth) - 50)
                    ),
                  })
                }
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all duration-200 shrink-0"
              >
                −
              </button>
              <input
                type="text"
                value={generalSettings.contentWidth}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, contentWidth: e.target.value })
                }
                className={`flex-1 min-w-0 p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-xs text-center font-semibold ${inputFocus}`}
              />
              <span className="text-[10px] text-slate-600 font-semibold px-1 shrink-0">px</span>
              <button
                onClick={() =>
                  setGeneralSettings({
                    ...generalSettings,
                    contentWidth: String(
                      Math.min(2000, parseInt(generalSettings.contentWidth) + 50)
                    ),
                  })
                }
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all duration-200 shrink-0"
              >
                +
              </button>
            </div>
          </div>

          {/* Padding */}
          <div>
            <label className="block text-[10px] font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Padding
              <span className="ml-1 text-slate-500 font-normal text-[9px]">(Email Container)</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const currentPadding = parseInt(generalSettings.padding) || 40;
                  setGeneralSettings({
                    ...generalSettings,
                    padding: String(Math.max(0, currentPadding - 10)) + "px",
                  });
                }}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all duration-200 shrink-0"
              >
                −
              </button>
              <input
                type="text"
                value={generalSettings.padding}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, padding: e.target.value })
                }
                className={`flex-1 min-w-0 p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-xs text-center font-semibold ${inputFocus}`}
              />
              <button
                onClick={() => {
                  const currentPadding = parseInt(generalSettings.padding) || 40;
                  setGeneralSettings({
                    ...generalSettings,
                    padding: String(currentPadding + 10) + "px",
                  });
                }}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all duration-200 shrink-0"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Typography Section */}
        <div className="border-b border-slate-200 dark:border-slate-700 pb-3 rounded-lg p-3 -mx-1">
          <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-3 tracking-wider flex items-center gap-1.5">
            <span className="inline-block w-1 h-4 bg-[#0b5cff] rounded-full"></span>
            Typography
          </h4>
          
          {/* Font Family */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Font Family
              <span className="ml-1 text-slate-500 font-normal text-[9px]">(All Text)</span>
            </label>
            <select
              value={generalSettings.fontFamily}
              onChange={(e) =>
                setGeneralSettings({ ...generalSettings, fontFamily: e.target.value })
              }
              className={`w-full p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-xs font-medium bg-white ${inputFocus}`}
            >
              <option value="Arial, sans-serif">Arial</option>
              <option value="Helvetica, sans-serif">Helvetica</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Times New Roman, serif">Times New Roman</option>
              <option value="Courier New, monospace">Courier New</option>
              <option value="Verdana, sans-serif">Verdana</option>
              <option value="Roboto, sans-serif">Roboto</option>
              <option value="Open Sans, sans-serif">Open Sans</option>
              <option value="Lato, sans-serif">Lato</option>
              <option value="Montserrat, sans-serif">Montserrat</option>
            </select>
          </div>

          {/* Text Color */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Text Color
              <span className="ml-1 text-slate-500 font-normal text-[9px]">(Default for new blocks)</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={generalSettings.textColor}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, textColor: e.target.value })
                  }
                  className="w-10 h-10 border-2 border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                />
              </div>
              <input
                type="text"
                value={generalSettings.textColor}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, textColor: e.target.value })
                }
                className={`flex-1 min-w-0 p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-xs font-mono ${inputFocus}`}
                placeholder="#111827"
              />
            </div>
            <button
              onClick={() => {
                const updatedBlocks = blocks.map((block) => {
                  if (block.type === "text" || block.type === "heading") {
                    return {
                      ...block,
                      props: {
                        ...block.props,
                        style: {
                          ...block.props.style,
                          color: generalSettings.textColor,
                        },
                      },
                    };
                  }
                  return block;
                });
                setBlocks(updatedBlocks);
              }}
              className="w-full px-3 py-2 text-[10px] font-bold bg-[#0b5cff] text-white rounded-lg hover:bg-[#0947d6] transition-all duration-200"
            >
              ✓ Apply to All Text Blocks
            </button>
          </div>

          {/* Font Size */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Font Size
              <span className="ml-1 text-slate-500 font-normal text-[9px]">(Default for new blocks)</span>
            </label>
            <div className="flex items-center gap-1.5 mb-2">
              <button
                onClick={() => {
                  const currentSize = parseInt(generalSettings.fontSize) || 16;
                  setGeneralSettings({
                    ...generalSettings,
                    fontSize: String(Math.max(10, currentSize - 2)) + "px",
                  });
                }}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all duration-200 shrink-0"
              >
                −
              </button>
              <input
                type="text"
                value={generalSettings.fontSize}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, fontSize: e.target.value })
                }
                className={`flex-1 min-w-0 p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-xs text-center font-semibold ${inputFocus}`}
              />
              <button
                onClick={() => {
                  const currentSize = parseInt(generalSettings.fontSize) || 16;
                  setGeneralSettings({
                    ...generalSettings,
                    fontSize: String(currentSize + 2) + "px",
                  });
                }}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all duration-200 shrink-0"
              >
                +
              </button>
            </div>
            <button
              onClick={() => {
                const updatedBlocks = blocks.map((block) => {
                  if (block.type === "text" || block.type === "heading" || block.type === "button") {
                    return {
                      ...block,
                      props: {
                        ...block.props,
                        style: {
                          ...block.props.style,
                          fontSize: generalSettings.fontSize,
                        },
                      },
                    };
                  }
                  return block;
                });
                setBlocks(updatedBlocks);
              }}
              className="w-full px-3 py-2 text-[10px] font-bold bg-[#0b5cff] text-white rounded-lg hover:bg-[#0947d6] transition-all duration-200"
            >
              ✓ Apply to All Text Blocks
            </button>
          </div>

          {/* Line Height */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Line Height
              <span className="ml-1 text-slate-500 font-normal text-[9px]">(All Text)</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const currentLineHeight = parseFloat(generalSettings.lineHeight) || 1.6;
                  setGeneralSettings({
                    ...generalSettings,
                    lineHeight: String(Math.max(0.5, currentLineHeight - 0.1).toFixed(1)),
                  });
                }}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all duration-200 shrink-0"
              >
                −
              </button>
              <input
                type="number"
                step="0.1"
                value={generalSettings.lineHeight}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, lineHeight: e.target.value })
                }
                className={`flex-1 min-w-0 p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-xs text-center font-semibold ${inputFocus}`}
              />
              <button
                onClick={() => {
                  const currentLineHeight = parseFloat(generalSettings.lineHeight) || 1.6;
                  setGeneralSettings({
                    ...generalSettings,
                    lineHeight: String((currentLineHeight + 0.1).toFixed(1)),
                  });
                }}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all duration-200 shrink-0"
              >
                +
              </button>
            </div>
          </div>

          {/* Letter Spacing */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Letter Spacing
              <span className="ml-1 text-slate-500 font-normal text-[9px]">(All Text)</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const current = parseInt(generalSettings.letterSpacing || "0px") || 0;
                  setGeneralSettings({
                    ...generalSettings,
                    letterSpacing: `${Math.max(-5, current - 1)}px`,
                  });
                }}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all duration-200 shrink-0"
              >
                −
              </button>
              <input
                type="text"
                value={generalSettings.letterSpacing || "0px"}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, letterSpacing: e.target.value })
                }
                className={`flex-1 min-w-0 p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-xs text-center font-semibold ${inputFocus}`}
              />
              <button
                onClick={() => {
                  const current = parseInt(generalSettings.letterSpacing || "0px") || 0;
                  setGeneralSettings({
                    ...generalSettings,
                    letterSpacing: `${Math.min(20, current + 1)}px`,
                  });
                }}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all duration-200 shrink-0"
              >
                +
              </button>
            </div>
          </div>

          {/* Font Weight */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Font Weight
              <span className="ml-1 text-slate-500 font-normal text-[9px]">(Default for new blocks)</span>
            </label>
            <select
              value={generalSettings.fontWeight || "normal"}
              onChange={(e) =>
                setGeneralSettings({ ...generalSettings, fontWeight: e.target.value })
              }
              className={`w-full p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-xs font-medium bg-white ${inputFocus}`}
            >
              <option value="normal">Regular (400)</option>
              <option value="300">Light (300)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semi Bold (600)</option>
              <option value="bold">Bold (700)</option>
              <option value="800">Extra Bold (800)</option>
              <option value="900">Black (900)</option>
            </select>
          </div>
        </div>

        {/* Alignment & Spacing Section */}
        <div className="border-b border-slate-200 dark:border-slate-700 pb-3 rounded-lg p-3 -mx-1">
          <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-3 tracking-wider flex items-center gap-1.5">
            <span className="inline-block w-1 h-4 bg-[#0b5cff] rounded-full"></span>
            Alignment & Spacing
          </h4>
          
          {/* Content Alignment */}
          <div>
            <label className="block text-[10px] font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Content Alignment
              <span className="ml-1 text-slate-500 font-normal text-[9px]">(Default for new blocks)</span>
            </label>
            <div className="flex gap-1.5 mb-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
              {(["left", "center", "right", "justify"] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => {
                    setGeneralSettings({ ...generalSettings, contentAlignment: align as "left" | "center" | "right" | "justify" });
                  }}
                  className={`flex-1 p-2 border rounded-lg transition-all duration-200 ${
                    generalSettings.contentAlignment === align
                      ? "bg-[#0b5cff] text-white border-[#0b5cff] shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300"
                  }`}
                  title={`Set default alignment to ${align}`}
                >
                  {align === "left" && <AlignLeft className="mx-auto w-4 h-4" />}
                  {align === "center" && <AlignCenter className="mx-auto w-4 h-4" />}
                  {align === "right" && <AlignRight className="mx-auto w-4 h-4" />}
                  {align === "justify" && <AlignJustify className="mx-auto w-4 h-4" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                if (!onBlocksChange) {
                  console.error("onBlocksChange is not available");
                  return;
                }
                
                // Create a completely new array with new block objects
                const updatedBlocks = blocks.map((block) => {
                  // Apply alignment to all block types that support it
                  if (block.type === "text" || block.type === "heading" || block.type === "button" || 
                      block.type === "image" || block.type === "social" || block.type === "menu" || block.type === "logo") {
                    // Create a completely new props object with explicit alignment
                    const newProps: any = {
                      ...block.props,
                      align: generalSettings.contentAlignment, // Explicitly set alignment
                    };
                    // Preserve style object if it exists - create a new copy
                    if (block.props.style) {
                      newProps.style = { ...block.props.style };
                    }
                    // Create a completely new block object with all properties explicitly set
                    const newBlock: EmailBlock = {
                      id: block.id,
                      type: block.type,
                      content: block.content,
                      props: newProps,
                    };
                    return newBlock;
                  }
                  // Return unchanged block - but still create a new object reference
                  return { ...block };
                });
                
                // Ensure we pass a completely new array reference
                onBlocksChange(updatedBlocks);
              }}
              className="w-full px-3 py-2 text-[10px] font-bold bg-[#0b5cff] text-white rounded-lg hover:bg-[#0947d6] transition-all duration-200"
            >
              ✓ Apply to All Blocks
            </button>
          </div>
        </div>

        {/* Colors & Effects Section */}
        <div className="rounded-lg p-3 -mx-1">
          <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-3 tracking-wider flex items-center gap-1.5">
            <span className="inline-block w-1 h-4 bg-[#0b5cff] rounded-full"></span>
            Colors & Effects
          </h4>
          
          {/* Link Color */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Link Color
              <span className="ml-1 text-slate-500 font-normal text-[9px]">(All Links)</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={generalSettings.linkColor}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, linkColor: e.target.value })
                  }
                  className="w-10 h-10 border-2 border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                />
              </div>
              <input
                type="text"
                value={generalSettings.linkColor}
                onChange={(e) =>
                  setGeneralSettings({ ...generalSettings, linkColor: e.target.value })
                }
                className={`flex-1 min-w-0 p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-xs font-mono ${inputFocus}`}
                placeholder="#007bff"
              />
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
              <p className="text-[10px] text-slate-700 dark:text-slate-300 font-medium leading-tight">
                This color applies to all links in text content, menu items, and buttons.
              </p>
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <label className="block text-[10px] font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Border Radius
              <span className="ml-1 text-slate-500 font-normal text-[9px]">(Buttons & Images)</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const radiusValue = generalSettings.borderRadius.replace(/px|PX/g, "").trim();
                  const currentRadius = parseInt(radiusValue) || 8;
                  const newRadius = Math.max(0, currentRadius - 2);
                  setGeneralSettings({
                    ...generalSettings,
                    borderRadius: String(newRadius) + "px",
                  });
                }}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all duration-200 shrink-0"
              >
                −
              </button>
              <input
                type="text"
                value={generalSettings.borderRadius}
                onChange={(e) => {
                  const value = e.target.value;
                  setGeneralSettings({ ...generalSettings, borderRadius: value });
                }}
                className={`flex-1 min-w-0 p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-xs text-center font-semibold ${inputFocus}`}
              />
              <button
                onClick={() => {
                  const radiusValue = generalSettings.borderRadius.replace(/px|PX/g, "").trim();
                  const currentRadius = parseInt(radiusValue) || 8;
                  const newRadius = currentRadius + 2;
                  setGeneralSettings({
                    ...generalSettings,
                    borderRadius: String(newRadius) + "px",
                  });
                }}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all duration-200 shrink-0"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Clear All Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-4">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 border border-red-100 dark:border-red-900/40">
            <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 tracking-wider flex items-center gap-1.5">
              <span className="inline-block w-1 h-4 bg-red-500 rounded-full"></span>
              Template Actions
            </h4>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-3 leading-tight">
              Clear all blocks to start fresh with a new template.
            </p>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full px-3 py-2 text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3 h-3" />
              Clear All Blocks
            </button>
          </div>
        </div>
      </div>

      {/* Clear All Blocks Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          onClearBlocks();
          setShowClearConfirm(false);
        }}
        title="Clear All Blocks"
        message="Are you sure you want to clear all blocks? This action cannot be undone."
        type="warning"
        confirmText="Clear All"
      />
    </div>
  );
};
