import React from "react";
import {
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
} from "react-icons/fa";
import { GeneralSettings } from "../types";

interface BodyTabProps {
  generalSettings: GeneralSettings;
  onSettingsChange: (settings: GeneralSettings) => void;
}

export const BodyTab: React.FC<BodyTabProps> = ({
  generalSettings,
  onSettingsChange,
}) => {
  const updateSetting = (key: keyof GeneralSettings, value: any) => {
    onSettingsChange({ ...generalSettings, [key]: value });
  };

  return (
    <>
      <div className="sticky top-0 bg-white border-b border-gray-200 p-3 z-10">
        <h3 className="text-xs font-semibold text-gray-700 uppercase">Body Settings</h3>
      </div>
      <div className="p-3 space-y-4">
        {/* Background Color */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Background Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={generalSettings.backgroundColor}
              onChange={(e) => updateSetting("backgroundColor", e.target.value)}
              className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={generalSettings.backgroundColor}
              onChange={(e) => updateSetting("backgroundColor", e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Text Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={generalSettings.textColor}
              onChange={(e) => updateSetting("textColor", e.target.value)}
              className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={generalSettings.textColor}
              onChange={(e) => updateSetting("textColor", e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        {/* Content Width */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Content Width</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                updateSetting(
                  "contentWidth",
                  String(Math.max(300, parseInt(generalSettings.contentWidth) - 50))
                )
              }
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              -
            </button>
            <input
              type="text"
              value={generalSettings.contentWidth}
              onChange={(e) => updateSetting("contentWidth", e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded text-sm text-center"
            />
            <span className="text-xs text-gray-500">px</span>
            <button
              onClick={() =>
                updateSetting(
                  "contentWidth",
                  String(Math.min(2000, parseInt(generalSettings.contentWidth) + 50))
                )
              }
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>

        {/* Content Alignment */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Content Alignment</label>
          <div className="flex gap-2">
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                onClick={() => updateSetting("contentAlignment", align)}
                className={`flex-1 p-2 border rounded transition-colors ${
                  generalSettings.contentAlignment === align
                    ? "bg-black text-white border-black"
                    : "bg-white border-gray-300 hover:bg-gray-50"
                }`}
              >
                {align === "left" && <FaAlignLeft className="mx-auto" />}
                {align === "center" && <FaAlignCenter className="mx-auto" />}
                {align === "right" && <FaAlignRight className="mx-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Font Family</label>
          <select
            value={generalSettings.fontFamily}
            onChange={(e) => updateSetting("fontFamily", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
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

        {/* Padding */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Padding</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const currentPadding = parseInt(generalSettings.padding) || 40;
                updateSetting("padding", String(Math.max(0, currentPadding - 10)) + "px");
              }}
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              -
            </button>
            <input
              type="text"
              value={generalSettings.padding}
              onChange={(e) => updateSetting("padding", e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded text-sm text-center"
            />
            <button
              onClick={() => {
                const currentPadding = parseInt(generalSettings.padding) || 40;
                updateSetting("padding", String(currentPadding + 10) + "px");
              }}
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>

        {/* Line Height */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Line Height</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const currentLineHeight = parseFloat(generalSettings.lineHeight) || 1.6;
                updateSetting(
                  "lineHeight",
                  String(Math.max(0.5, currentLineHeight - 0.1).toFixed(1))
                );
              }}
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              -
            </button>
            <input
              type="number"
              step="0.1"
              value={generalSettings.lineHeight}
              onChange={(e) => updateSetting("lineHeight", e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded text-sm text-center"
            />
            <button
              onClick={() => {
                const currentLineHeight = parseFloat(generalSettings.lineHeight) || 1.6;
                updateSetting("lineHeight", String((currentLineHeight + 0.1).toFixed(1)));
              }}
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Font Size</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const currentSize = parseInt(generalSettings.fontSize) || 16;
                updateSetting("fontSize", String(Math.max(10, currentSize - 2)) + "px");
              }}
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              -
            </button>
            <input
              type="text"
              value={generalSettings.fontSize}
              onChange={(e) => updateSetting("fontSize", e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded text-sm text-center"
            />
            <button
              onClick={() => {
                const currentSize = parseInt(generalSettings.fontSize) || 16;
                updateSetting("fontSize", String(currentSize + 2) + "px");
              }}
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>

        {/* Link Color */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Link Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={generalSettings.linkColor}
              onChange={(e) => updateSetting("linkColor", e.target.value)}
              className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={generalSettings.linkColor}
              onChange={(e) => updateSetting("linkColor", e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        {/* Border Radius */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Border Radius</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const currentRadius = parseInt(generalSettings.borderRadius) || 8;
                updateSetting("borderRadius", String(Math.max(0, currentRadius - 2)) + "px");
              }}
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              -
            </button>
            <input
              type="text"
              value={generalSettings.borderRadius}
              onChange={(e) => updateSetting("borderRadius", e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded text-sm text-center"
            />
            <button
              onClick={() => {
                const currentRadius = parseInt(generalSettings.borderRadius) || 8;
                updateSetting("borderRadius", String(currentRadius + 2) + "px");
              }}
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
