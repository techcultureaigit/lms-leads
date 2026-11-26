"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaEye,
  FaTrash,
  FaCopy,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaImage,
  FaGripVertical,
  FaBars,
  FaTwitter,
  FaPinterest,
  FaYoutube,
  FaSnapchat,
  FaWhatsapp,
  FaReddit,
  FaSkype,
  FaGithub,
  FaDiscord,
  FaTelegram,
  FaEnvelope,
  FaRss,
  FaSpotify,
  FaTumblr,
  FaVimeo,
  FaFacebookMessenger,
  FaFacebook,
} from "react-icons/fa";
import {
  FaXTwitter,
  FaMedium,
  FaPaypal,
  FaSoundcloud,
  FaYelp,
  FaTiktok,
  FaInstagram,
} from "react-icons/fa6";
import { EmailBlock, GeneralSettings } from "./types";
import { RichTextEditor } from "./RichTextEditor";
import { SketchPicker } from "react-color";
import { VariableAutocomplete } from "./VariableAutocomplete";
import { uploadTemplateImage } from "@/services/emailTemplateService";

// Helper function to get social icon component
const getSocialIconComponent = (name: string) => {
  const iconMap: { [key: string]: any } = {
    facebook: FaFacebook,
    instagram: FaInstagram,
    youtube: FaYoutube,
    whatsapp: FaWhatsapp,
    twitter: FaTwitter,
    x: FaXTwitter,
    pinterest: FaPinterest,
    vimeo: FaVimeo,
    snapchat: FaSnapchat,
    reddit: FaReddit,
    messenger: FaFacebookMessenger,
    medium: FaMedium,
    paypal: FaPaypal,
    rss: FaRss,
    tumblr: FaTumblr,
    spotify: FaSpotify,
    soundcloud: FaSoundcloud,
    yelp: FaYelp,
    skype: FaSkype,
    github: FaGithub,
    discord: FaDiscord,
    telegram: FaTelegram,
    tiktok: FaTiktok,
    email: FaEnvelope,
    envelope: FaEnvelope,
    menu: FaBars,
    hamburger: FaBars,
  };
  return iconMap[name.toLowerCase()] || null;
};

// Helper function to render icon with fallback
const renderSocialIcon = (name: string, IconComponent: any, color: string) => {
  if (IconComponent) {
    return <IconComponent className="w-5 h-5" style={{ color: "white" }} />;
  }
  
  // Fallback for icons not in react-icons - use SVG or text
  const iconText = name.charAt(0).toUpperCase();
  return (
    <span className="text-white text-sm font-bold" style={{ fontSize: "14px" }}>
      {iconText}
    </span>
  );
};

interface BlockPropertiesPanelProps {
  block: EmailBlock;
  generalSettings: GeneralSettings;
  onUpdate: (id: string, updates: Partial<EmailBlock>) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onClose: () => void;
  onCollapse?: () => void;
}

export const BlockPropertiesPanel: React.FC<BlockPropertiesPanelProps> = ({
  block,
  generalSettings,
  onUpdate,
  onDelete,
  onDuplicate,
  onClose,
  onCollapse,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    text: true,
    styling: true,
    spacing: false,
    responsive: false,
    general: false,
    menuItems: true,
    styles: false,
  });
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const [showMorePaddingOptions, setShowMorePaddingOptions] = useState(false);
  const [showMoreBorderOptions, setShowMoreBorderOptions] = useState(false);
  const [showMoreRoundedBorderOptions, setShowMoreRoundedBorderOptions] = useState(false);
  const [showMoreContainerPaddingOptions, setShowMoreContainerPaddingOptions] = useState(false);
  const [showHtmlView, setShowHtmlView] = useState(false);
  const [showMoreMenuPaddingOptions, setShowMoreMenuPaddingOptions] = useState(false);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(null);
      }
    };

    if (showColorPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorPicker]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateBlockStyle = (styleUpdates: any) => {
    onUpdate(block.id, {
      props: {
        ...block.props,
        style: {
          ...block.props.style,
          ...styleUpdates,
        },
      },
    });
  };

  const renderBlockSpecificProperties = () => {
    switch (block.type) {
      case "html":
        return (
          <>
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">HTML Code</label>
              <textarea
                value={block.content || ""}
                onChange={e => onUpdate(block.id, { content: e.target.value })}
                placeholder="<div>Your HTML code here</div>"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-mono min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                style={{ fontFamily: 'monospace', minHeight: 120 }}
              />
            </div>
            <div className="mb-2 text-xs text-gray-500">You can type or paste any HTML code here. It will be rendered as-is in the email.</div>
          </>
        );
      case "divider":
        return (
          <>
            {/* Divider Color */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">Divider Color</label>
              <input
                type="color"
                value={block.props.style?.borderColor || "#e0e0e0"}
                onChange={e => updateBlockStyle({ borderColor: e.target.value })}
                className="w-12 h-8 p-0 border-2 border-gray-300 rounded-lg"
              />
            </div>
            {/* Divider Thickness */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">Thickness (px)</label>
              <input
                type="number"
                min={1}
                max={20}
                value={parseInt(block.props.style?.borderWidth || "2")}
                onChange={e => updateBlockStyle({ borderWidth: `${e.target.value}` })}
                className="w-20 px-2 py-1 border-2 border-gray-300 rounded-lg text-sm"
              />
            </div>
            {/* Divider Background Color */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">Background Color</label>
              <input
                type="color"
                value={block.props.style?.backgroundColor || "#ffffff"}
                onChange={e => updateBlockStyle({ backgroundColor: e.target.value })}
                className="w-12 h-8 p-0 border-2 border-gray-300 rounded-lg"
              />
            </div>
            {/* Divider Alignment */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">Alignment</label>
              <div className="flex gap-2">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => onUpdate(block.id, { props: { ...block.props, align } })}
                    className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                      (block.props.align || generalSettings.contentAlignment) === align
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </>
        );
      case "heading":
        return (
          <>
            {/* Font Family */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Font Family
              </label>
              <select
                value={block.props.style?.fontFamily || generalSettings.fontFamily || "Arial, sans-serif"}
                onChange={(e) => updateBlockStyle({ fontFamily: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="Helvetica, Arial, sans-serif">Helvetica</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="'Courier New', monospace">Courier New</option>
              </select>
            </div>

            {/* Font Weight */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Font Weight
              </label>
              <select
                value={block.props.style?.fontWeight || "bold"}
                onChange={(e) => {
                  updateBlockStyle({ fontWeight: e.target.value });
                }}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
              >
                <option value="normal">Regular</option>
                <option value="300">Light</option>
                <option value="400">Regular (400)</option>
                <option value="500">Medium</option>
                <option value="600">Semi Bold</option>
                <option value="bold">Bold</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extra Bold</option>
                <option value="900">Black</option>
              </select>
            </div>

            {/* Font Size */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Font Size
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const currentSize = parseInt(String(block.props.style?.fontSize || "22px").replace("px", "")) || 22;
                    updateBlockStyle({ fontSize: `${Math.max(10, currentSize - 2)}px` });
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                >
                  −
                </button>
                <input
                  type="text"
                  value={block.props.style?.fontSize || ((block.props.level || 1) === 1 ? "28px" : (block.props.level || 1) === 2 ? "24px" : (block.props.level || 1) === 3 ? "20px" : "18px")}
                  onChange={(e) => updateBlockStyle({ fontSize: e.target.value })}
                  className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                />
                <button
                  onClick={() => {
                    const currentSize = parseInt(String(block.props.style?.fontSize || "22px").replace("px", "")) || 22;
                    updateBlockStyle({ fontSize: `${Math.min(72, currentSize + 2)}px` });
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                >
                  +
                </button>
              </div>
            </div>

            {/* Text Color */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Color
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(showColorPicker === "textColor" ? null : "textColor")}
                  className="w-full flex items-center gap-2 px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-6 h-6 border-2 border-gray-300 rounded"
                    style={{
                      backgroundColor: block.props.style?.color || generalSettings.textColor || "#000000",
                    }}
                  />
                  <span className="text-sm text-gray-700">
                    {block.props.style?.color || generalSettings.textColor || "#000000"}
                  </span>
                </button>
                {showColorPicker === "textColor" && (
                  <div className="absolute top-full left-0 mt-2 z-50">
                    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl p-2">
                      <SketchPicker
                        color={block.props.style?.color || generalSettings.textColor || "#000000"}
                        onChangeComplete={(color) => {
                          updateBlockStyle({ color: color.hex });
                          setShowColorPicker(null);
                        }}
                        disableAlpha={true}
                        width="220px"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Text Align */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Text Align
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdate(block.id, { props: { ...block.props, align: "left" } })}
                  className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                    (block.props.align || generalSettings.contentAlignment) === "left"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FaAlignLeft className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => onUpdate(block.id, { props: { ...block.props, align: "center" } })}
                  className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                    (block.props.align || generalSettings.contentAlignment) === "center"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FaAlignCenter className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => onUpdate(block.id, { props: { ...block.props, align: "right" } })}
                  className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                    (block.props.align || generalSettings.contentAlignment) === "right"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FaAlignRight className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => onUpdate(block.id, { props: { ...block.props, align: "justify" } })}
                  className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                    block.props.align === "justify"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FaAlignJustify className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>

            {/* Line Height */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Line Height
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const current = parseFloat(String(block.props.style?.lineHeight || "1.3")) || 1.3;
                    updateBlockStyle({ lineHeight: (Math.max(0.5, current - 0.1)).toFixed(1) });
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                >
                  −
                </button>
                <input
                  type="text"
                  value={block.props.style?.lineHeight || "1.3"}
                  onChange={(e) => updateBlockStyle({ lineHeight: e.target.value })}
                  className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                />
                <button
                  onClick={() => {
                    const current = parseFloat(String(block.props.style?.lineHeight || "1.3")) || 1.3;
                    updateBlockStyle({ lineHeight: (Math.min(3, current + 0.1)).toFixed(1) });
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                >
                  +
                </button>
              </div>
            </div>

            {/* Letter Spacing */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Letter Spacing
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const current = parseInt(String(block.props.style?.letterSpacing || "0px").replace("px", "")) || 0;
                    updateBlockStyle({ letterSpacing: `${Math.max(-5, current - 1)}px` });
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                >
                  −
                </button>
                <input
                  type="text"
                  value={block.props.style?.letterSpacing || "0px"}
                  onChange={(e) => updateBlockStyle({ letterSpacing: e.target.value })}
                  className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                />
                <button
                  onClick={() => {
                    const current = parseInt(String(block.props.style?.letterSpacing || "0px").replace("px", "")) || 0;
                    updateBlockStyle({ letterSpacing: `${Math.min(20, current + 1)}px` });
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                >
                  +
                </button>
              </div>
            </div>
          </>
        );

      case "text":
        return (
          <>
            {/* Font Family */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Font Family
              </label>
              <select
                value={block.props.style?.fontFamily || generalSettings.fontFamily || "Arial, sans-serif"}
                onChange={(e) => updateBlockStyle({ fontFamily: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="Helvetica, Arial, sans-serif">Helvetica</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="'Courier New', monospace">Courier New</option>
              </select>
            </div>

            {/* Font Size */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Font Size
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const currentSize = parseInt(String(block.props.style?.fontSize || generalSettings.fontSize || "16px").replace("px", "")) || 16;
                    updateBlockStyle({ fontSize: `${Math.max(8, currentSize - 1)}px` });
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                >
                  −
                </button>
                <input
                  type="text"
                  value={block.props.style?.fontSize || generalSettings.fontSize || "16px"}
                  onChange={(e) => updateBlockStyle({ fontSize: e.target.value })}
                  className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                />
                <button
                  onClick={() => {
                    const currentSize = parseInt(String(block.props.style?.fontSize || generalSettings.fontSize || "16px").replace("px", "")) || 16;
                    updateBlockStyle({ fontSize: `${Math.min(72, currentSize + 1)}px` });
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                >
                  +
                </button>
              </div>
            </div>

            {/* Text Color */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Color
              </label>
              <div className="relative" ref={colorPickerRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(showColorPicker === "textColor" ? null : "textColor");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-6 h-6 border-2 border-gray-300 rounded shrink-0"
                    style={{
                      backgroundColor: block.props.style?.color || generalSettings.textColor || "#000000",
                    }}
                  />
                  <span className="text-sm text-gray-700 truncate">
                    {block.props.style?.color || generalSettings.textColor || "#000000"}
                  </span>
                </button>
                {showColorPicker === "textColor" && (
                  <div className="absolute top-full left-0 mt-2 z-[100]">
                    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl p-2" onClick={(e) => e.stopPropagation()}>
                      <SketchPicker
                        color={block.props.style?.color || generalSettings.textColor || "#000000"}
                        onChange={(color) => {
                          updateBlockStyle({ color: color.hex });
                        }}
                        onChangeComplete={(color) => {
                          updateBlockStyle({ color: color.hex });
                        }}
                        disableAlpha={true}
                        width="240px"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Text Align */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Text Align
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdate(block.id, { props: { ...block.props, align: "left" } })}
                  className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                    (block.props.align || generalSettings.contentAlignment) === "left"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FaAlignLeft className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => onUpdate(block.id, { props: { ...block.props, align: "center" } })}
                  className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                    (block.props.align || generalSettings.contentAlignment) === "center"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FaAlignCenter className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => onUpdate(block.id, { props: { ...block.props, align: "right" } })}
                  className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                    (block.props.align || generalSettings.contentAlignment) === "right"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FaAlignRight className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => onUpdate(block.id, { props: { ...block.props, align: "justify" } })}
                  className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                    block.props.align === "justify"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FaAlignJustify className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>

            {/* Line Height */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Line Height
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const current = parseFloat(String(block.props.style?.lineHeight || generalSettings.lineHeight || "1.6")) || 1.6;
                    updateBlockStyle({ lineHeight: (Math.max(0.5, current - 0.1)).toFixed(1) });
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                >
                  −
                </button>
                <input
                  type="text"
                  value={block.props.style?.lineHeight || generalSettings.lineHeight || "1.6"}
                  onChange={(e) => updateBlockStyle({ lineHeight: e.target.value })}
                  className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                />
                <button
                  onClick={() => {
                    const current = parseFloat(String(block.props.style?.lineHeight || generalSettings.lineHeight || "1.6")) || 1.6;
                    updateBlockStyle({ lineHeight: (Math.min(3, current + 0.1)).toFixed(1) });
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                >
                  +
                </button>
              </div>
            </div>
          </>
        );

      case "image":
        return (
          <>
            {/* Upload Image */}
            <div className="mb-4">
              <button
                onClick={async () => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*,.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.ico,.tiff,.tif";
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
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

                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        alert("Image size should be less than 5MB");
                        return;
                      }

                      try {
                        // Upload to Cloudinary instead of converting to base64
                        const imageUrl = await uploadTemplateImage(file);
                        onUpdate(block.id, {
                          props: {
                            ...block.props,
                            src: imageUrl,
                          },
                        });
                      } catch (error: any) {
                        console.error("Error uploading image:", error);
                        alert(error.message || "Error uploading image");
                      }
                    }
                  };
                  input.click();
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#fbc40c] to-[#D68108] text-white rounded-lg font-semibold hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaImage className="w-4 h-4" />
                Upload Image
              </button>
            </div>

            {/* Image URL */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Image URL
              </label>
              <input
                type="text"
                value={block.props.src || ""}
                onChange={(e) => {
                  onUpdate(block.id, {
                    props: {
                      ...block.props,
                      src: e.target.value,
                    },
                  });
                }}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
              />
            </div>

            {/* Alt Text */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Alt Text
              </label>
              <input
                type="text"
                value={block.props.alt || "Image"}
                onChange={(e) => {
                  onUpdate(block.id, {
                    props: {
                      ...block.props,
                      alt: e.target.value,
                    },
                  });
                }}
                placeholder="Image"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
              />
            </div>

            {/* Image Size */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                <span className="inline-block w-1 h-4 bg-gradient-to-b from-[#fbc40c] to-[#D68108] rounded-full"></span>
                Image Size
              </label>
              <div className="mb-2">
                <label className="block text-xs font-medium mb-1 text-gray-600">Width</label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const currentWidth = block.props.width || 600;
                      onUpdate(block.id, {
                        props: {
                          ...block.props,
                          width: Math.max(100, currentWidth - 50),
                        },
                      });
                    }}
                    className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    value={block.props.width || 600}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 600;
                      onUpdate(block.id, {
                        props: {
                          ...block.props,
                          width: Math.min(2000, Math.max(100, value)),
                        },
                      });
                    }}
                    className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                  />
                  <span className="text-xs text-gray-600 shrink-0">px</span>
                  <button
                    onClick={() => {
                      const currentWidth = block.props.width || 600;
                      onUpdate(block.id, {
                        props: {
                          ...block.props,
                          width: Math.min(2000, currentWidth + 50),
                        },
                      });
                    }}
                    className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                  >
                    +
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                  <span>💡</span>
                  Image will scale proportionally. Width range: 100px - 2000px
                </p>
              </div>
            </div>

            {/* Alignment */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                <span className="inline-block w-1 h-4 bg-gradient-to-b from-[#fbc40c] to-[#D68108] rounded-full"></span>
                Alignment (This Block Only)
              </label>
              <div className="flex gap-2">
                {(["left", "center", "right", "justify"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => {
                      onUpdate(block.id, {
                        props: {
                          ...block.props,
                          align,
                        },
                      });
                    }}
                    className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                      (block.props.align || generalSettings.contentAlignment) === align
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {align === "left" && <FaAlignLeft className="w-4 h-4 mx-auto" />}
                    {align === "center" && <FaAlignCenter className="w-4 h-4 mx-auto" />}
                    {align === "right" && <FaAlignRight className="w-4 h-4 mx-auto" />}
                    {align === "justify" && <FaAlignJustify className="w-4 h-4 mx-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </>
        );

      case "social":
        // Professional circular design with colored backgrounds
        const iconType = block.props.iconType || "circle";
        // Don't filter icons automatically - this prevents icons from being deleted when clicking Social tab
        // Allow all icons that are already in the block
        const filteredIcons = block.props.icons || [];
        
        // Only update iconType if it changed, don't filter or remove icons
        if (block.props.iconType !== iconType) {
          setTimeout(() => {
            onUpdate(block.id, {
              props: {
                ...block.props,
                iconType: iconType,
              },
            });
          }, 0);
        }
        
        return (
          <>
            {/* Social Links */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Social Links
              </label>
              <div className="space-y-2">
                {filteredIcons.map((icon: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                    <FaGripVertical className="text-gray-400 cursor-move" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700 mb-1 capitalize">
                        {icon.name || icon.icon || `Icon ${idx + 1}`}
                      </div>
                      <input
                        type="text"
                        value={icon.href || ""}
                        onChange={(e) => {
                          const updatedIcons = [...(block.props.icons || [])];
                          updatedIcons[idx] = { ...icon, href: e.target.value };
                          onUpdate(block.id, {
                            props: {
                              ...block.props,
                              icons: updatedIcons,
                            },
                          });
                        }}
                        placeholder="https://example.com"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#fbc40c]"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const updatedIcons = (block.props.icons || []).filter((_: any, i: number) => i !== idx);
                        onUpdate(block.id, {
                          props: {
                            ...block.props,
                            icons: updatedIcons,
                          },
                        });
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {/* Only show add button if less than 5 icons */}
                {filteredIcons.length < 5 && (
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { name: "facebook", href: "https://www.facebook.com", label: "Facebook" },
                      { name: "instagram", href: "https://www.instagram.com", label: "Instagram" },
                      { name: "youtube", href: "https://www.youtube.com", label: "YouTube" },
                      { name: "whatsapp", href: "https://wa.me/", label: "WhatsApp" },
                    ]
                      .filter((social) => !filteredIcons.some((icon: any) => (icon.name || icon.icon || "").toLowerCase() === social.name))
                      .map((social) => {
                        const IconComponent = getSocialIconComponent(social.name);
                        return (
                          <button
                            key={social.name}
                            onClick={() => {
                              const updatedIcons = [
                                ...filteredIcons,
                                { name: social.name, href: social.href, icon: social.name },
                              ];
                              onUpdate(block.id, {
                                props: {
                                  ...block.props,
                                  icons: updatedIcons,
                                  iconType: iconType,
                                },
                              });
                            }}
                            className="flex flex-col items-center gap-1 px-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs text-gray-600 hover:border-[#fbc40c] hover:text-[#fbc40c] transition-colors"
                            title={`Add ${social.label}`}
                          >
                            {IconComponent ? (
                              <IconComponent className="w-5 h-5" />
                            ) : (
                              <span className="text-xs font-bold">{social.name.charAt(0).toUpperCase()}</span>
                            )}
                            <span className="text-[10px]">{social.label}</span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Alignment */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Align
              </label>
              <div className="flex gap-2">
                {(["left", "center", "right", "justify"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => {
                      onUpdate(block.id, {
                        props: {
                          ...block.props,
                          align,
                        },
                      });
                    }}
                    className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                      (block.props.align || generalSettings.contentAlignment) === align
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {align === "left" && <FaAlignLeft className="w-4 h-4 mx-auto" />}
                    {align === "center" && <FaAlignCenter className="w-4 h-4 mx-auto" />}
                    {align === "right" && <FaAlignRight className="w-4 h-4 mx-auto" />}
                    {align === "justify" && <FaAlignJustify className="w-4 h-4 mx-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Size */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Icon Size
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const currentSize = block.props.iconSize || 32;
                    onUpdate(block.id, {
                      props: {
                        ...block.props,
                        iconSize: Math.max(16, currentSize - 4),
                      },
                    });
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                >
                  −
                </button>
                <input
                  type="text"
                  value={block.props.iconSize || 32}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 32;
                    onUpdate(block.id, {
                      props: {
                        ...block.props,
                        iconSize: Math.min(100, Math.max(16, value)),
                      },
                    });
                  }}
                  className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                />
                <span className="text-xs text-gray-600 shrink-0">px</span>
                <button
                  onClick={() => {
                    const currentSize = block.props.iconSize || 32;
                    onUpdate(block.id, {
                      props: {
                        ...block.props,
                        iconSize: Math.min(100, currentSize + 4),
                      },
                    });
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                >
                  +
                </button>
              </div>
            </div>

            {/* Icon Spacing */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Icon Spacing
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const currentSpacing = block.props.iconSpacing || block.props.spacing || 8;
                    onUpdate(block.id, {
                      props: {
                        ...block.props,
                        iconSpacing: Math.max(0, currentSpacing - 2),
                        spacing: Math.max(0, currentSpacing - 2),
                      },
                    });
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                >
                  −
                </button>
                <input
                  type="text"
                  value={block.props.iconSpacing || block.props.spacing || 8}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 8;
                    onUpdate(block.id, {
                      props: {
                        ...block.props,
                        iconSpacing: value,
                        spacing: value,
                      },
                    });
                  }}
                  className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                />
                <span className="text-xs text-gray-600 shrink-0">px</span>
                <button
                  onClick={() => {
                    const currentSpacing = block.props.iconSpacing || block.props.spacing || 8;
                    onUpdate(block.id, {
                      props: {
                        ...block.props,
                        iconSpacing: currentSpacing + 2,
                        spacing: currentSpacing + 2,
                      },
                    });
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                >
                  +
                </button>
              </div>
            </div>

          </>
        );

      case "logo":
        return (
          <>
            {/* Upload Logo */}
            <div className="mb-4">
              <button
                onClick={async () => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*,.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.ico,.tiff,.tif";
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
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

                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        alert("Image size should be less than 5MB");
                        return;
                      }

                      try {
                        // Upload to Cloudinary instead of converting to base64
                        const imageUrl = await uploadTemplateImage(file);
                        onUpdate(block.id, {
                          props: {
                            ...block.props,
                            src: imageUrl,
                            imageSrc: imageUrl,
                          },
                        });
                      } catch (error: any) {
                        console.error("Error uploading logo:", error);
                        alert(error.message || "Error uploading logo");
                      }
                    }
                  };
                  input.click();
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#fbc40c] to-[#D68108] text-white rounded-lg font-semibold hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaImage className="w-4 h-4" />
                Upload Logo
              </button>
            </div>

            {/* Logo Dimensions */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                <span className="inline-block w-1 h-4 bg-gradient-to-b from-[#fbc40c] to-[#D68108] rounded-full"></span>
                Logo Dimensions
              </label>
              <div className="space-y-3">
                {/* Width */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Width</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const currentWidth = block.props.width || block.props.logoWidth || 100;
                        onUpdate(block.id, {
                          props: {
                            ...block.props,
                            width: Math.max(50, currentWidth - 10),
                            logoWidth: Math.max(50, currentWidth - 10),
                          },
                        });
                      }}
                      className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                    >
                      −
                    </button>
                    <input
                      type="text"
                      value={block.props.width || block.props.logoWidth || 100}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 100;
                        onUpdate(block.id, {
                          props: {
                            ...block.props,
                            width: Math.min(500, Math.max(50, value)),
                            logoWidth: Math.min(500, Math.max(50, value)),
                          },
                        });
                      }}
                      className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                    />
                    <span className="text-xs text-gray-600 shrink-0">px</span>
                    <button
                      onClick={() => {
                        const currentWidth = block.props.width || block.props.logoWidth || 100;
                        onUpdate(block.id, {
                          props: {
                            ...block.props,
                            width: Math.min(500, currentWidth + 10),
                            logoWidth: Math.min(500, currentWidth + 10),
                          },
                        });
                      }}
                      className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                    >
                      +
                    </button>
                  </div>
                </div>
                {/* Height */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Height</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const currentHeight = block.props.height || block.props.logoHeight || 100;
                        onUpdate(block.id, {
                          props: {
                            ...block.props,
                            height: Math.max(50, currentHeight - 10),
                            logoHeight: Math.max(50, currentHeight - 10),
                          },
                        });
                      }}
                      className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                    >
                      −
                    </button>
                    <input
                      type="text"
                      value={block.props.height || block.props.logoHeight || 100}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 100;
                        onUpdate(block.id, {
                          props: {
                            ...block.props,
                            height: Math.min(500, Math.max(50, value)),
                            logoHeight: Math.min(500, Math.max(50, value)),
                          },
                        });
                      }}
                      className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                    />
                    <span className="text-xs text-gray-600 shrink-0">px</span>
                    <button
                      onClick={() => {
                        const currentHeight = block.props.height || block.props.logoHeight || 100;
                        onUpdate(block.id, {
                          props: {
                            ...block.props,
                            height: Math.min(500, currentHeight + 10),
                            logoHeight: Math.min(500, currentHeight + 10),
                          },
                        });
                      }}
                      className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-[10px] text-gray-700 flex items-start gap-1">
                    <span>💡</span>
                    <span>Tip: Maintain aspect ratio for best results. Default size is 100x100px. Logo will scale responsively to fit container.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Alignment */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                <span className="inline-block w-1 h-4 bg-gradient-to-b from-[#fbc40c] to-[#D68108] rounded-full"></span>
                Alignment (This Block Only)
              </label>
              <div className="flex gap-2">
                {(["left", "center", "right", "justify"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => {
                      onUpdate(block.id, {
                        props: {
                          ...block.props,
                          align,
                        },
                      });
                    }}
                    className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                      (block.props.align || generalSettings.contentAlignment) === align
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {align === "left" && <FaAlignLeft className="w-4 h-4 mx-auto" />}
                    {align === "center" && <FaAlignCenter className="w-4 h-4 mx-auto" />}
                    {align === "right" && <FaAlignRight className="w-4 h-4 mx-auto" />}
                    {align === "justify" && <FaAlignJustify className="w-4 h-4 mx-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </>
        );

      case "button":
        return (
          <>
            {/* Action Section */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Action
              </label>
              <div className="space-y-3">
                {/* Action Type */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Action Type</label>
                  <select
                    value={block.props.actionType || "openWebsite"}
                    onChange={(e) => {
                      onUpdate(block.id, {
                        props: {
                          ...block.props,
                          actionType: e.target.value,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                  >
                    <option value="openWebsite">Open Website</option>
                    <option value="sendEmail">Send Email</option>
                    <option value="callPhone">Call Phone</option>
                  </select>
                </div>

                {/* URL */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">URL</label>
                  <input
                    type="text"
                    value={block.props.href || block.props.url || ""}
                    onChange={(e) => {
                      onUpdate(block.id, {
                        props: {
                          ...block.props,
                          href: e.target.value,
                          url: e.target.value,
                        },
                      });
                    }}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                  />
                </div>

                {/* Target */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Target</label>
                  <select
                    value={block.props.target || "_blank"}
                    onChange={(e) => {
                      onUpdate(block.id, {
                        props: {
                          ...block.props,
                          target: e.target.value,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                  >
                    <option value="_blank">New Tab</option>
                    <option value="_self">Same Tab</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Button Text */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Button Text
              </label>
              <VariableAutocomplete
                type="input"
                value={block.content || "Button Text"}
                onChange={(value) => {
                  onUpdate(block.id, {
                    content: value,
                  });
                }}
                placeholder="Button Text"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
              />
            </div>

            {/* Padding Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Padding
                </label>
                <button
                  onClick={() => setShowMorePaddingOptions(!showMorePaddingOptions)}
                  className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  More Options {showMorePaddingOptions ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                </button>
              </div>
              {showMorePaddingOptions ? (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Top</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.paddingTop || block.props.paddingTop || "10px").replace("px", "")) || 10;
                          updateBlockStyle({ paddingTop: `${Math.max(0, current - 1)}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={block.props.style?.paddingTop || block.props.paddingTop || "10px"}
                        onChange={(e) => {
                          const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                          updateBlockStyle({ paddingTop: value });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                      />
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.paddingTop || block.props.paddingTop || "10px").replace("px", "")) || 10;
                          updateBlockStyle({ paddingTop: `${current + 1}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Right</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.paddingRight || block.props.paddingRight || "20px").replace("px", "")) || 20;
                          updateBlockStyle({ paddingRight: `${Math.max(0, current - 1)}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={block.props.style?.paddingRight || block.props.paddingRight || "20px"}
                        onChange={(e) => {
                          const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                          updateBlockStyle({ paddingRight: value });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                      />
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.paddingRight || block.props.paddingRight || "20px").replace("px", "")) || 20;
                          updateBlockStyle({ paddingRight: `${current + 1}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Bottom</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.paddingBottom || block.props.paddingBottom || "10px").replace("px", "")) || 10;
                          updateBlockStyle({ paddingBottom: `${Math.max(0, current - 1)}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={block.props.style?.paddingBottom || block.props.paddingBottom || "10px"}
                        onChange={(e) => {
                          const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                          updateBlockStyle({ paddingBottom: value });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                      />
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.paddingBottom || block.props.paddingBottom || "10px").replace("px", "")) || 10;
                          updateBlockStyle({ paddingBottom: `${current + 1}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Left</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.paddingLeft || block.props.paddingLeft || "20px").replace("px", "")) || 20;
                          updateBlockStyle({ paddingLeft: `${Math.max(0, current - 1)}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={block.props.style?.paddingLeft || block.props.paddingLeft || "20px"}
                        onChange={(e) => {
                          const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                          updateBlockStyle({ paddingLeft: value });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                      />
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.paddingLeft || block.props.paddingLeft || "20px").replace("px", "")) || 20;
                          updateBlockStyle({ paddingLeft: `${current + 1}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const current = parseInt(String(block.props.style?.padding || "10px").replace("px", "")) || 10;
                      updateBlockStyle({ padding: `${Math.max(0, current - 1)}px` });
                    }}
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    value={block.props.style?.padding || "10px"}
                    onChange={(e) => {
                      const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                      updateBlockStyle({ padding: value });
                    }}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                  />
                  <button
                    onClick={() => {
                      const current = parseInt(String(block.props.style?.padding || "10px").replace("px", "")) || 10;
                      updateBlockStyle({ padding: `${current + 1}px` });
                    }}
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Border Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Border
                </label>
                <button
                  onClick={() => setShowMoreBorderOptions(!showMoreBorderOptions)}
                  className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  More Options {showMoreBorderOptions ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                </button>
              </div>
              {showMoreBorderOptions ? (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">All Sides</label>
                    <select
                      value={block.props.style?.borderStyle || "solid"}
                      onChange={(e) => updateBlockStyle({ borderStyle: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Border Width</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.borderWidth || "0px").replace("px", "")) || 0;
                          updateBlockStyle({ borderWidth: `${Math.max(0, current - 1)}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={block.props.style?.borderWidth || "0px"}
                        onChange={(e) => {
                          const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                          updateBlockStyle({ borderWidth: value });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                      />
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.borderWidth || "0px").replace("px", "")) || 0;
                          updateBlockStyle({ borderWidth: `${current + 1}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Border Color</label>
                    <div className="relative">
                      <button
                        onClick={() => setShowColorPicker(showColorPicker === "borderColor" ? null : "borderColor")}
                        className="w-full flex items-center gap-2 px-2 py-1 border border-gray-300 rounded"
                      >
                        <div
                          className="w-6 h-6 border-2 border-gray-300 rounded"
                          style={{
                            backgroundColor: block.props.style?.borderColor || "#000000",
                          }}
                        />
                      </button>
                      {showColorPicker === "borderColor" && (
                        <div className="absolute top-full left-0 mt-2 z-50" ref={colorPickerRef}>
                          <SketchPicker
                            color={block.props.style?.borderColor || "#000000"}
                            onChangeComplete={(color) => {
                              updateBlockStyle({ borderColor: color.hex });
                              setShowColorPicker(null);
                            }}
                            disableAlpha={true}
                            width="220px"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    value={block.props.style?.borderStyle || "solid"}
                    onChange={(e) => updateBlockStyle({ borderStyle: e.target.value })}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="none">None</option>
                  </select>
                  <input
                    type="text"
                    value={block.props.style?.borderWidth || "0px"}
                    onChange={(e) => {
                      const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                      updateBlockStyle({ borderWidth: value });
                    }}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                  />
                </div>
              )}
            </div>

            {/* Rounded Border Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Rounded Border
                </label>
                <button
                  onClick={() => setShowMoreRoundedBorderOptions(!showMoreRoundedBorderOptions)}
                  className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  More Options {showMoreRoundedBorderOptions ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const current = parseInt(String(block.props.style?.borderRadius || generalSettings.borderRadius || "4px").replace("px", "")) || 4;
                    updateBlockStyle({ borderRadius: `${Math.max(0, current - 1)}px` });
                  }}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                >
                  −
                </button>
                <input
                  type="text"
                  value={block.props.style?.borderRadius || generalSettings.borderRadius || "4px"}
                  onChange={(e) => {
                    const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                    updateBlockStyle({ borderRadius: value });
                  }}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                />
                <button
                  onClick={() => {
                    const current = parseInt(String(block.props.style?.borderRadius || generalSettings.borderRadius || "4px").replace("px", "")) || 4;
                    updateBlockStyle({ borderRadius: `${current + 1}px` });
                  }}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* General Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <span>⚙️</span> General
                </label>
                <button
                  onClick={() => setExpandedSections({ ...expandedSections, general: !expandedSections.general })}
                  className="text-xs text-gray-600 hover:text-gray-900"
                >
                  {expandedSections.general ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                </button>
              </div>
              {expandedSections.general && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Container Padding</label>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">More Options</span>
                      <button
                        onClick={() => setShowMoreContainerPaddingOptions(!showMoreContainerPaddingOptions)}
                        className={`w-10 h-5 rounded-full transition-colors ${showMoreContainerPaddingOptions ? "bg-gray-900" : "bg-gray-300"}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showMoreContainerPaddingOptions ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                    {showMoreContainerPaddingOptions ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={block.props.containerPaddingTop || "10px"}
                            onChange={(e) => {
                              const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                              onUpdate(block.id, {
                                props: {
                                  ...block.props,
                                  containerPaddingTop: value,
                                },
                              });
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                            placeholder="Top"
                          />
                          <input
                            type="text"
                            value={block.props.containerPaddingRight || "10px"}
                            onChange={(e) => {
                              const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                              onUpdate(block.id, {
                                props: {
                                  ...block.props,
                                  containerPaddingRight: value,
                                },
                              });
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                            placeholder="Right"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={block.props.containerPaddingBottom || "10px"}
                            onChange={(e) => {
                              const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                              onUpdate(block.id, {
                                props: {
                                  ...block.props,
                                  containerPaddingBottom: value,
                                },
                              });
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                            placeholder="Bottom"
                          />
                          <input
                            type="text"
                            value={block.props.containerPaddingLeft || "10px"}
                            onChange={(e) => {
                              const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                              onUpdate(block.id, {
                                props: {
                                  ...block.props,
                                  containerPaddingLeft: value,
                                },
                              });
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                            placeholder="Left"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            const current = parseInt(String(block.props.containerPadding || "10px").replace("px", "")) || 10;
                            onUpdate(block.id, {
                              props: {
                                ...block.props,
                                containerPadding: `${Math.max(0, current - 1)}px`,
                              },
                            });
                          }}
                          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                        >
                          −
                        </button>
                        <input
                          type="text"
                          value={block.props.containerPadding || "10px"}
                          onChange={(e) => {
                            const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                            onUpdate(block.id, {
                              props: {
                                ...block.props,
                                containerPadding: value,
                              },
                            });
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                        />
                        <button
                          onClick={() => {
                            const current = parseInt(String(block.props.containerPadding || "10px").replace("px", "")) || 10;
                            onUpdate(block.id, {
                              props: {
                                ...block.props,
                                containerPadding: `${current + 1}px`,
                              },
                            });
                          }}
                          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Responsive Design Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <span>📱</span> Responsive Design
                </label>
                <button
                  onClick={() => setExpandedSections({ ...expandedSections, responsive: !expandedSections.responsive })}
                  className="text-xs text-gray-600 hover:text-gray-900"
                >
                  {expandedSections.responsive ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                </button>
              </div>
              {expandedSections.responsive && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-600">Hide on Desktop</label>
                    <button
                      onClick={() => {
                        onUpdate(block.id, {
                          props: {
                            ...block.props,
                            hideOnDesktop: !block.props.hideOnDesktop,
                          },
                        });
                      }}
                      className={`w-10 h-5 rounded-full transition-colors ${block.props.hideOnDesktop ? "bg-gray-900" : "bg-gray-300"}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${block.props.hideOnDesktop ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* HTML View */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <span>&lt;/&gt;</span> HTML
                </label>
                <button
                  onClick={() => setShowHtmlView(!showHtmlView)}
                  className="text-xs text-gray-600 hover:text-gray-900"
                >
                  {showHtmlView ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                </button>
              </div>
              {showHtmlView && (
                <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                  <pre>{`<a href="${block.props.href || "#"}" target="${block.props.target || "_blank"}" style="...">${block.content || "Button Text"}</a>`}</pre>
                </div>
              )}
            </div>

            {/* Alignment */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Alignment
              </label>
              <div className="flex gap-2">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => {
                      onUpdate(block.id, {
                        props: {
                          ...block.props,
                          align,
                        },
                      });
                    }}
                    className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                      (block.props.align || generalSettings.contentAlignment) === align
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {align === "left" && <FaAlignLeft className="w-4 h-4 mx-auto" />}
                    {align === "center" && <FaAlignCenter className="w-4 h-4 mx-auto" />}
                    {align === "right" && <FaAlignRight className="w-4 h-4 mx-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </>
        );

      case "menu":
        const menuItems = block.props.items || [];
        return (
          <>
            {/* Menu Items Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Menu Items
                </label>
                <button
                  onClick={() => setExpandedSections({ ...expandedSections, menuItems: !expandedSections.menuItems })}
                  className="text-xs text-gray-600 hover:text-gray-900"
                >
                  {expandedSections.menuItems ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                </button>
              </div>
              {expandedSections.menuItems && (
                <div className="space-y-2">
                  {menuItems.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                      <FaGripVertical className="text-gray-400 cursor-move" />
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-600">Action Type</label>
                          <select
                            value={item.actionType || "openWebsite"}
                            onChange={(e) => {
                              const updatedItems = [...menuItems];
                              updatedItems[idx] = { ...item, actionType: e.target.value };
                              onUpdate(block.id, {
                                props: {
                                  ...block.props,
                                  items: updatedItems,
                                },
                              });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          >
                            <option value="openWebsite">Open Website</option>
                            <option value="sendEmail">Send Email</option>
                            <option value="callPhone">Call Phone</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-600">Label</label>
                          <input
                            type="text"
                            value={item.label || ""}
                            onChange={(e) => {
                              const updatedItems = [...menuItems];
                              updatedItems[idx] = { ...item, label: e.target.value };
                              onUpdate(block.id, {
                                props: {
                                  ...block.props,
                                  items: updatedItems,
                                },
                              });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            placeholder="Page"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-600">URL</label>
                          <input
                            type="text"
                            value={item.url || item.href || ""}
                            onChange={(e) => {
                              const updatedItems = [...menuItems];
                              updatedItems[idx] = { ...item, url: e.target.value, href: e.target.value };
                              onUpdate(block.id, {
                                props: {
                                  ...block.props,
                                  items: updatedItems,
                                },
                              });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            placeholder="https://example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-600">Target</label>
                          <select
                            value={item.target || "_self"}
                            onChange={(e) => {
                              const updatedItems = [...menuItems];
                              updatedItems[idx] = { ...item, target: e.target.value };
                              onUpdate(block.id, {
                                props: {
                                  ...block.props,
                                  items: updatedItems,
                                },
                              });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          >
                            <option value="_self">Same Tab</option>
                            <option value="_blank">New Tab</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const updatedItems = menuItems.filter((_: any, i: number) => i !== idx);
                          onUpdate(block.id, {
                            props: {
                              ...block.props,
                              items: updatedItems,
                            },
                          });
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const updatedItems = [
                        ...menuItems,
                        {
                          actionType: "openWebsite",
                          label: "Page",
                          url: "",
                          href: "",
                          target: "_self",
                        },
                      ];
                      onUpdate(block.id, {
                        props: {
                          ...block.props,
                          items: updatedItems,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#fbc40c] hover:text-[#fbc40c] transition-colors flex items-center justify-center gap-2"
                  >
                    <span>+</span> Add New Item
                  </button>
                </div>
              )}
            </div>

            {/* Styles Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <span>✏️</span> Styles
                </label>
                <button
                  onClick={() => setExpandedSections({ ...expandedSections, styles: !expandedSections.styles })}
                  className="text-xs text-gray-600 hover:text-gray-900"
                >
                  {expandedSections.styles ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                </button>
              </div>
              {expandedSections.styles && (
                <div className="space-y-3">
                  {/* Font Family */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Font Family</label>
                    <select
                      value={block.props.style?.fontFamily || generalSettings.fontFamily || "Arial, sans-serif"}
                      onChange={(e) => updateBlockStyle({ fontFamily: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="Arial, sans-serif">Body Font</option>
                      <option value="Helvetica, Arial, sans-serif">Helvetica</option>
                      <option value="'Times New Roman', serif">Times New Roman</option>
                      <option value="Georgia, serif">Georgia</option>
                    </select>
                  </div>

                  {/* Font Weight */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Font Weight</label>
                    <select
                      value={block.props.style?.fontWeight || "regular"}
                      onChange={(e) => updateBlockStyle({ fontWeight: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="normal">Regular</option>
                      <option value="bold">Bold</option>
                      <option value="300">Light</option>
                      <option value="600">Semi Bold</option>
                    </select>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Font Size</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.fontSize || "14px").replace("px", "")) || 14;
                          updateBlockStyle({ fontSize: `${Math.max(8, current - 1)}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={block.props.style?.fontSize || "14px"}
                        onChange={(e) => {
                          const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                          updateBlockStyle({ fontSize: value });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                      />
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.fontSize || "14px").replace("px", "")) || 14;
                          updateBlockStyle({ fontSize: `${current + 1}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Letter Spacing */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Letter Spacing</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.letterSpacing || "0px").replace("px", "")) || 0;
                          updateBlockStyle({ letterSpacing: `${Math.max(-2, current - 1)}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={block.props.style?.letterSpacing || "0px"}
                        onChange={(e) => {
                          const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                          updateBlockStyle({ letterSpacing: value });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                      />
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.letterSpacing || "0px").replace("px", "")) || 0;
                          updateBlockStyle({ letterSpacing: `${current + 1}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Text Color</label>
                    <div className="relative">
                      <button
                        onClick={() => setShowColorPicker(showColorPicker === "menuTextColor" ? null : "menuTextColor")}
                        className="w-full flex items-center gap-2 px-2 py-1 border border-gray-300 rounded"
                      >
                        <div
                          className="w-6 h-6 border-2 border-gray-300 rounded"
                          style={{
                            backgroundColor: block.props.style?.color || generalSettings.textColor || "#000000",
                          }}
                        />
                        <span className="text-xs text-gray-600">
                          {block.props.style?.color || generalSettings.textColor || "#000000"}
                        </span>
                      </button>
                      {showColorPicker === "menuTextColor" && (
                        <div className="absolute top-full left-0 mt-2 z-50" ref={colorPickerRef}>
                          <SketchPicker
                            color={block.props.style?.color || generalSettings.textColor || "#000000"}
                            onChangeComplete={(color) => {
                              updateBlockStyle({ color: color.hex });
                              setShowColorPicker(null);
                            }}
                            disableAlpha={true}
                            width="220px"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Link Color */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Link Color</label>
                    <div className="relative">
                      <button
                        onClick={() => setShowColorPicker(showColorPicker === "menuLinkColor" ? null : "menuLinkColor")}
                        className="w-full flex items-center gap-2 px-2 py-1 border border-gray-300 rounded"
                      >
                        <div
                          className="w-6 h-6 border-2 border-gray-300 rounded"
                          style={{
                            backgroundColor: block.props.style?.linkColor || generalSettings.linkColor || "#0066cc",
                          }}
                        />
                        <span className="text-xs text-gray-600">
                          {block.props.style?.linkColor || generalSettings.linkColor || "#0066cc"}
                        </span>
                      </button>
                      {showColorPicker === "menuLinkColor" && (
                        <div className="absolute top-full left-0 mt-2 z-50" ref={colorPickerRef}>
                          <SketchPicker
                            color={block.props.style?.linkColor || generalSettings.linkColor || "#0066cc"}
                            onChangeComplete={(color) => {
                              updateBlockStyle({ linkColor: color.hex });
                              setShowColorPicker(null);
                            }}
                            disableAlpha={true}
                            width="220px"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Align Section */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Align
              </label>
              <div className="flex gap-2">
                {(["left", "center", "right", "justify"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => {
                      onUpdate(block.id, {
                        props: {
                          ...block.props,
                          align,
                        },
                      });
                    }}
                    className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                      (block.props.align || generalSettings.contentAlignment) === align
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {align === "left" && <FaAlignLeft className="w-4 h-4 mx-auto" />}
                    {align === "center" && <FaAlignCenter className="w-4 h-4 mx-auto" />}
                    {align === "right" && <FaAlignRight className="w-4 h-4 mx-auto" />}
                    {align === "justify" && <FaAlignJustify className="w-4 h-4 mx-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Section */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Layout
              </label>
              <select
                value={block.props.layout || "horizontal"}
                onChange={(e) => {
                  onUpdate(block.id, {
                    props: {
                      ...block.props,
                      layout: e.target.value,
                    },
                  });
                }}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>

            {/* Separator Section */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Separator
              </label>
              <input
                type="text"
                value={block.props.separator || ""}
                onChange={(e) => {
                  onUpdate(block.id, {
                    props: {
                      ...block.props,
                      separator: e.target.value,
                    },
                  });
                }}
                placeholder="e.g., | or -"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
              />
            </div>

            {/* Padding Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Padding
                </label>
                <button
                  onClick={() => setShowMoreMenuPaddingOptions(!showMoreMenuPaddingOptions)}
                  className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  More Options {showMoreMenuPaddingOptions ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                </button>
              </div>
              {showMoreMenuPaddingOptions ? (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Top</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.paddingTop || block.props.paddingTop || "5px").replace("px", "")) || 5;
                          updateBlockStyle({ paddingTop: `${Math.max(0, current - 1)}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={block.props.style?.paddingTop || block.props.paddingTop || "5px"}
                        onChange={(e) => {
                          const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                          updateBlockStyle({ paddingTop: value });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                      />
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.paddingTop || block.props.paddingTop || "5px").replace("px", "")) || 5;
                          updateBlockStyle({ paddingTop: `${current + 1}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Right</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.paddingRight || block.props.paddingRight || "15px").replace("px", "")) || 15;
                          updateBlockStyle({ paddingRight: `${Math.max(0, current - 1)}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={block.props.style?.paddingRight || block.props.paddingRight || "15px"}
                        onChange={(e) => {
                          const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                          updateBlockStyle({ paddingRight: value });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                      />
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.paddingRight || block.props.paddingRight || "15px").replace("px", "")) || 15;
                          updateBlockStyle({ paddingRight: `${current + 1}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Left</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.paddingLeft || block.props.paddingLeft || "15px").replace("px", "")) || 15;
                          updateBlockStyle({ paddingLeft: `${Math.max(0, current - 1)}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={block.props.style?.paddingLeft || block.props.paddingLeft || "15px"}
                        onChange={(e) => {
                          const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                          updateBlockStyle({ paddingLeft: value });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                      />
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.paddingLeft || block.props.paddingLeft || "15px").replace("px", "")) || 15;
                          updateBlockStyle({ paddingLeft: `${current + 1}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">Bottom</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.paddingBottom || block.props.paddingBottom || "5px").replace("px", "")) || 5;
                          updateBlockStyle({ paddingBottom: `${Math.max(0, current - 1)}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={block.props.style?.paddingBottom || block.props.paddingBottom || "5px"}
                        onChange={(e) => {
                          const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                          updateBlockStyle({ paddingBottom: value });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                      />
                      <button
                        onClick={() => {
                          const current = parseInt(String(block.props.style?.paddingBottom || block.props.paddingBottom || "5px").replace("px", "")) || 5;
                          updateBlockStyle({ paddingBottom: `${current + 1}px` });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const current = parseInt(String(block.props.style?.padding || "5px").replace("px", "")) || 5;
                      updateBlockStyle({ padding: `${Math.max(0, current - 1)}px` });
                    }}
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    value={block.props.style?.padding || "5px"}
                    onChange={(e) => {
                      const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                      updateBlockStyle({ padding: value });
                    }}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                  />
                  <button
                    onClick={() => {
                      const current = parseInt(String(block.props.style?.padding || "5px").replace("px", "")) || 5;
                      updateBlockStyle({ padding: `${current + 1}px` });
                    }}
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </>
        );

      case "columns":
        const columns = block.props.columns || [];
        return (
          <>
            {/* Column Layout */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Column Layout
              </label>
              <div className="space-y-2">
                {columns.map((col: any, idx: number) => {
                  const totalWidth = columns.reduce((sum: number, c: any) => sum + (c.width || 1), 0);
                  const colWidthPercent = totalWidth > 0 ? Math.round(((col.width || 1) / totalWidth) * 100) : Math.round(100 / columns.length);
                  
                  return (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium text-gray-700 w-16">Column {idx + 1}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="range"
                          min="1"
                          max="12"
                          value={col.width || 1}
                          onChange={(e) => {
                            const newColumns = [...columns];
                            newColumns[idx] = { ...newColumns[idx], width: parseInt(e.target.value) };
                            onUpdate(block.id, {
                              props: {
                                ...block.props,
                                columns: newColumns,
                              },
                            });
                          }}
                          className="flex-1"
                        />
                        <span className="text-xs text-gray-600 w-12 text-right">{colWidthPercent}%</span>
                      </div>
                      {columns.length > 1 && (
                        <button
                          onClick={() => {
                            const newColumns = columns.filter((_: any, i: number) => i !== idx);
                            const newColumnBlocks = { ...block.props.columnBlocks };
                            // Remove blocks from deleted column
                            delete newColumnBlocks[idx];
                            // Reindex remaining columns
                            const reindexedBlocks: any = {};
                            Object.keys(newColumnBlocks).forEach((key) => {
                              const keyNum = parseInt(key);
                              if (keyNum > idx) {
                                reindexedBlocks[keyNum - 1] = newColumnBlocks[keyNum];
                              } else if (keyNum < idx) {
                                reindexedBlocks[keyNum] = newColumnBlocks[keyNum];
                              }
                            });
                            onUpdate(block.id, {
                              props: {
                                ...block.props,
                                columns: newColumns,
                                columnBlocks: reindexedBlocks,
                              },
                            });
                          }}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Remove column"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {columns.length < 4 && (
                  <button
                    onClick={() => {
                      const newColumns = [...columns, { width: 1, content: "" }];
                      onUpdate(block.id, {
                        props: {
                          ...block.props,
                          columns: newColumns,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#fbc40c] hover:text-[#fbc40c] transition-colors"
                  >
                    + Add Column
                  </button>
                )}
              </div>
            </div>

            {/* Column Gap */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Column Gap
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const current = parseInt(String(block.props.style?.gap || "10px").replace("px", "")) || 10;
                    updateBlockStyle({ gap: `${Math.max(0, current - 2)}px` });
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                >
                  −
                </button>
                <input
                  type="text"
                  value={block.props.style?.gap || "10px"}
                  onChange={(e) => {
                    const value = e.target.value.includes("px") ? e.target.value : `${e.target.value}px`;
                    updateBlockStyle({ gap: value });
                  }}
                  className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                />
                <button
                  onClick={() => {
                    const current = parseInt(String(block.props.style?.gap || "10px").replace("px", "")) || 10;
                    updateBlockStyle({ gap: `${current + 2}px` });
                  }}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold shrink-0"
                >
                  +
                </button>
              </div>
            </div>
          </>
        );

      case "header":
        return (
          <>
            {/* Background Color */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={block.props.style?.backgroundColor || "#f8f9fa"}
                  onChange={(e) => updateBlockStyle({ backgroundColor: e.target.value })}
                  className="w-12 h-8 p-0 border-2 border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={block.props.style?.backgroundColor || "#f8f9fa"}
                  onChange={(e) => updateBlockStyle({ backgroundColor: e.target.value })}
                  className="flex-1 px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                  placeholder="#f8f9fa"
                />
              </div>
            </div>

            {/* Padding */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Padding
              </label>
              <input
                type="text"
                value={block.props.style?.padding || "20px"}
                onChange={(e) => updateBlockStyle({ padding: e.target.value })}
                className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                placeholder="20px"
              />
            </div>

            {/* Bottom Border */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Bottom Border
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={block.props.style?.borderBottom?.split(" ")[2]?.replace("#", "") || "#e0e0e0"}
                  onChange={(e) => {
                    const currentBorder = block.props.style?.borderBottom || "2px solid #e0e0e0";
                    const parts = currentBorder.split(" ");
                    updateBlockStyle({ borderBottom: `${parts[0] || "2px"} ${parts[1] || "solid"} ${e.target.value}` });
                  }}
                  className="w-12 h-8 p-0 border-2 border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={block.props.style?.borderBottom || "2px solid #e0e0e0"}
                  onChange={(e) => updateBlockStyle({ borderBottom: e.target.value })}
                  className="flex-1 px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                  placeholder="2px solid #e0e0e0"
                />
              </div>
            </div>

            {/* Alignment */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Alignment
              </label>
              <div className="flex gap-2">
                {(["left", "center", "right", "justify"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => onUpdate(block.id, { props: { ...block.props, align } })}
                    className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                      (block.props.align || generalSettings.contentAlignment) === align
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                Drag blocks from the sidebar into the header area to add content.
              </p>
            </div>
          </>
        );

      case "footer":
        return (
          <>
            <div className="mb-4 pb-3 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Advanced Footer Settings</h3>
            </div>

            {/* Background Color */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={block.props.style?.backgroundColor || "#ffffff"}
                  onChange={(e) => updateBlockStyle({ backgroundColor: e.target.value })}
                  className="w-12 h-8 p-0 border-2 border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={block.props.style?.backgroundColor || "#ffffff"}
                  onChange={(e) => updateBlockStyle({ backgroundColor: e.target.value })}
                  className="flex-1 px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Padding */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Padding
              </label>
              <input
                type="text"
                value={block.props.style?.padding || "30px 20px"}
                onChange={(e) => updateBlockStyle({ padding: e.target.value })}
                className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                placeholder="30px 20px"
              />
            </div>

            {/* Top Border */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Top Border
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={block.props.style?.borderTop?.split(" ")[2]?.replace("#", "") || "#e0e0e0"}
                    onChange={(e) => {
                      const currentBorder = block.props.style?.borderTop || "2px solid #e0e0e0";
                      const parts = currentBorder.split(" ");
                      updateBlockStyle({ borderTop: `${parts[0] || "2px"} ${parts[1] || "solid"} ${e.target.value}` });
                    }}
                    className="w-12 h-8 p-0 border-2 border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={block.props.style?.borderTop || "2px solid #e0e0e0"}
                    onChange={(e) => updateBlockStyle({ borderTop: e.target.value })}
                    className="flex-1 px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                    placeholder="2px solid #e0e0e0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Width</label>
                    <input
                      type="text"
                      value={block.props.style?.borderTop?.split(" ")[0] || "2px"}
                      onChange={(e) => {
                        const currentBorder = block.props.style?.borderTop || "2px solid #e0e0e0";
                        const parts = currentBorder.split(" ");
                        updateBlockStyle({ borderTop: `${e.target.value} ${parts[1] || "solid"} ${parts[2] || "#e0e0e0"}` });
                      }}
                      className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                      placeholder="2px"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Style</label>
                    <select
                      value={block.props.style?.borderTop?.split(" ")[1] || "solid"}
                      onChange={(e) => {
                        const currentBorder = block.props.style?.borderTop || "2px solid #e0e0e0";
                        const parts = currentBorder.split(" ");
                        updateBlockStyle({ borderTop: `${parts[0] || "2px"} ${e.target.value} ${parts[2] || "#e0e0e0"}` });
                      }}
                      className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                      <option value="double">Double</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Margin */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Margin
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Top</label>
                  <input
                    type="text"
                    value={block.props.style?.marginTop || "0px"}
                    onChange={(e) => updateBlockStyle({ marginTop: e.target.value })}
                    className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                    placeholder="0px"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Bottom</label>
                  <input
                    type="text"
                    value={block.props.style?.marginBottom || "0px"}
                    onChange={(e) => updateBlockStyle({ marginBottom: e.target.value })}
                    className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                    placeholder="0px"
                  />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Typography
              </label>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Font Family</label>
                  <input
                    type="text"
                    value={block.props.style?.fontFamily || "Arial, sans-serif"}
                    onChange={(e) => updateBlockStyle({ fontFamily: e.target.value })}
                    className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                    placeholder="Arial, sans-serif"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                    <input
                      type="text"
                      value={block.props.style?.fontSize || "12px"}
                      onChange={(e) => updateBlockStyle({ fontSize: e.target.value })}
                      className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                      placeholder="12px"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={block.props.style?.color || "#000000"}
                        onChange={(e) => updateBlockStyle({ color: e.target.value })}
                        className="w-8 h-8 p-0 border-2 border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={block.props.style?.color || "#000000"}
                        onChange={(e) => updateBlockStyle({ color: e.target.value })}
                        className="flex-1 px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alignment */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                Alignment
              </label>
              <div className="flex gap-2">
                {(["left", "center", "right", "justify"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => onUpdate(block.id, { props: { ...block.props, align } })}
                    className={`flex-1 px-3 py-2 border-2 rounded-lg transition-all ${
                      (block.props.align || generalSettings.contentAlignment) === align
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {align === "left" && <FaAlignLeft className="w-4 h-4 mx-auto" />}
                    {align === "center" && <FaAlignCenter className="w-4 h-4 mx-auto" />}
                    {align === "right" && <FaAlignRight className="w-4 h-4 mx-auto" />}
                    {align === "justify" && <FaAlignJustify className="w-4 h-4 mx-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                Drag blocks from the sidebar into the footer area to add content.
              </p>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-[320px] bg-white border-l-2 border-gray-200 flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-br from-white via-gray-50 to-white border-b-2 border-gray-300 p-4 z-20 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 capitalize">{block.type}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Preview functionality
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Preview"
            >
              <FaEye className="w-4 h-4 text-gray-600" />
            </button>
            {onDuplicate && (
              <button
                onClick={() => onDuplicate(block.id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Duplicate"
              >
                <FaCopy className="w-4 h-4 text-gray-600" />
              </button>
            )}
            <button
              onClick={() => onDelete(block.id)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <FaTrash className="w-4 h-4 text-red-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <FaTimes className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Text Editor Section */}
        {(block.type === "heading" || block.type === "text") && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Content
              </label>
              <button
                onClick={() => toggleSection("text")}
                className="text-gray-500 hover:text-gray-700"
              >
                {expandedSections.text ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
            {expandedSections.text && (
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <RichTextEditor
                  key={`${block.id}-${block.props.level || 1}-${block.props.style?.fontSize}-${block.props.style?.color}-${block.props.style?.fontFamily}-${block.props.align}`}
                  content={block.content || ""}
                  onChange={(html) => {
                    onUpdate(block.id, { content: html });
                  }}
                  placeholder={block.type === "heading" ? "Enter heading..." : "Enter text..."}
                  editable={true}
                  showToolbar={true}
                  fontSize={block.props.style?.fontSize || (block.type === "heading" ? ((block.props.level || 1) === 1 ? "28px" : (block.props.level || 1) === 2 ? "24px" : (block.props.level || 1) === 3 ? "20px" : "18px") : generalSettings.fontSize || "16px")}
                  fontFamily={block.props.style?.fontFamily || generalSettings.fontFamily || "Arial, sans-serif"}
                  textColor={block.props.style?.color || generalSettings.textColor || "#000000"}
                  backgroundColor={block.props.style?.backgroundColor || "transparent"}
                  textAlign={
                    (block.props.align || generalSettings.contentAlignment) as "left" | "center" | "right" | "justify"
                  }
                />
              </div>
            )}
          </div>
        )}

        {/* Styling Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Styling
            </label>
            <button
              onClick={() => toggleSection("styling")}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedSections.styling ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
          {expandedSections.styling && (
            <div className="space-y-4">
              {renderBlockSpecificProperties()}
            </div>
          )}
        </div>

        {/* Spacing Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Spacing & Padding
            </label>
            <button
              onClick={() => toggleSection("spacing")}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedSections.spacing ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
          {expandedSections.spacing && (
            <div className="space-y-4">
              {/* Margin */}
              <div>
                <label className="block text-xs font-medium mb-2 text-gray-600">Margin</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Top</label>
                    <input
                      type="text"
                      value={block.props.style?.marginTop || "0px"}
                      onChange={(e) => {
                        const value = e.target.value.includes("px") || e.target.value.includes("%") || e.target.value === "0" ? e.target.value : `${e.target.value}px`;
                        updateBlockStyle({ marginTop: value });
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#fbc40c]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Bottom</label>
                    <input
                      type="text"
                      value={block.props.style?.marginBottom || "0px"}
                      onChange={(e) => {
                        const value = e.target.value.includes("px") || e.target.value.includes("%") || e.target.value === "0" ? e.target.value : `${e.target.value}px`;
                        updateBlockStyle({ marginBottom: value });
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#fbc40c]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Left</label>
                    <input
                      type="text"
                      value={block.props.style?.marginLeft || "0px"}
                      onChange={(e) => {
                        const value = e.target.value.includes("px") || e.target.value.includes("%") || e.target.value === "0" ? e.target.value : `${e.target.value}px`;
                        updateBlockStyle({ marginLeft: value });
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#fbc40c]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Right</label>
                    <input
                      type="text"
                      value={block.props.style?.marginRight || "0px"}
                      onChange={(e) => {
                        const value = e.target.value.includes("px") || e.target.value.includes("%") || e.target.value === "0" ? e.target.value : `${e.target.value}px`;
                        updateBlockStyle({ marginRight: value });
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#fbc40c]"
                    />
                  </div>
                </div>
              </div>

              {/* Padding */}
              <div>
                <label className="block text-xs font-medium mb-2 text-gray-600">Padding</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Top</label>
                    <input
                      type="text"
                      value={block.props.style?.paddingTop || block.props.style?.padding || "10px"}
                      onChange={(e) => {
                        const value = e.target.value.includes("px") || e.target.value.includes("%") || e.target.value === "0" ? e.target.value : `${e.target.value}px`;
                        updateBlockStyle({ paddingTop: value });
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#fbc40c]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Bottom</label>
                    <input
                      type="text"
                      value={block.props.style?.paddingBottom || block.props.style?.padding || "10px"}
                      onChange={(e) => {
                        const value = e.target.value.includes("px") || e.target.value.includes("%") || e.target.value === "0" ? e.target.value : `${e.target.value}px`;
                        updateBlockStyle({ paddingBottom: value });
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#fbc40c]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Left</label>
                    <input
                      type="text"
                      value={block.props.style?.paddingLeft || block.props.style?.padding || "10px"}
                      onChange={(e) => {
                        const value = e.target.value.includes("px") || e.target.value.includes("%") || e.target.value === "0" ? e.target.value : `${e.target.value}px`;
                        updateBlockStyle({ paddingLeft: value });
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#fbc40c]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Right</label>
                    <input
                      type="text"
                      value={block.props.style?.paddingRight || block.props.style?.padding || "10px"}
                      onChange={(e) => {
                        const value = e.target.value.includes("px") || e.target.value.includes("%") || e.target.value === "0" ? e.target.value : `${e.target.value}px`;
                        updateBlockStyle({ paddingRight: value });
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#fbc40c]"
                    />
                  </div>
                </div>
                {/* All sides padding shortcut */}
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 mb-1">All Sides</label>
                  <input
                    type="text"
                    value={block.props.style?.padding || "10px"}
                    onChange={(e) => {
                      const value = e.target.value.includes("px") || e.target.value.includes("%") || e.target.value === "0" ? e.target.value : `${e.target.value}px`;
                      updateBlockStyle({ 
                        padding: value,
                        paddingTop: value,
                        paddingRight: value,
                        paddingBottom: value,
                        paddingLeft: value,
                      });
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#fbc40c]"
                    placeholder="All sides"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Responsive Design Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Responsive Design
            </label>
            <button
              onClick={() => toggleSection("responsive")}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedSections.responsive ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
          {expandedSections.responsive && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={block.props.hideOnMobile || false}
                  onChange={(e) => {
                    onUpdate(block.id, {
                      props: {
                        ...block.props,
                        hideOnMobile: e.target.checked,
                      },
                    });
                  }}
                  className="w-4 h-4 text-[#fbc40c] border-gray-300 rounded focus:ring-[#fbc40c]"
                />
                <span className="text-sm text-gray-700">Hide on Mobile</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={block.props.hideOnDesktop || false}
                  onChange={(e) => {
                    onUpdate(block.id, {
                      props: {
                        ...block.props,
                        hideOnDesktop: e.target.checked,
                      },
                    });
                  }}
                  className="w-4 h-4 text-[#fbc40c] border-gray-300 rounded focus:ring-[#fbc40c]"
                />
                <span className="text-sm text-gray-700">Hide on Desktop</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};