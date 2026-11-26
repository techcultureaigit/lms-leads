import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { createBlockTemplate } from "@/services/blockTemplateService";
import { EmailBlock } from "./types";
import { generateEmailHTML } from "./htmlGenerator";

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: EmailBlock[];
  generalSettings: any;
  onSuccess?: () => void;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onClose,
  blocks,
  generalSettings,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templateType, setTemplateType] = useState<string>("custom");
  const [category, setCategory] = useState("general");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Template name is required");
      return;
    }

    if (blocks.length === 0) {
      setError("No blocks to save");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Generate HTML preview
      let html = "";
      try {
        // Generate HTML for email (table-based) - email client compatible
        html = generateEmailHTML(blocks, generalSettings, true);
      } catch (htmlError) {
        console.warn("Failed to generate HTML preview:", htmlError);
      }

      await createBlockTemplate({
        name: name.trim(),
        description: description.trim() || undefined,
        templateType,
        blocks,
        html,
        category: category || "general",
      });

      // Reset form
      setName("");
      setDescription("");
      setTemplateType("custom");
      setCategory("general");
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 border border-gray-200 transform transition-all duration-200 scale-100"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClose();
          }
        }}
        tabIndex={-1}
        autoFocus
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Save as Template</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Template Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Company Header"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this template..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
            />
          </div>

          {/* Template Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Template Type
            </label>
            <input
              type="text"
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              placeholder="e.g., header, footer, content, custom, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
            />
            <p className="text-xs text-gray-500 mt-1">Enter any name for this template type</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., general, marketing, newsletter"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#fbc40c] focus:border-[#fbc40c]"
            />
          </div>

          {/* Info */}
          <div className="p-3 bg-gray-50 rounded text-sm text-gray-600">
            <p>This will save <strong>{blocks.length}</strong> block{blocks.length !== 1 ? "s" : ""} as a reusable template.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="px-4 py-2 bg-[#fbc40c] text-gray-900 rounded hover:bg-[#e6b00c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
};