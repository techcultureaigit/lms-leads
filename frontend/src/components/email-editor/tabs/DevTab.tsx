import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Code2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Monitor,
  X,
} from "lucide-react";
import { formatHTML } from "../utils";
import { buildEmailPreviewSrcDoc } from "../previewSrcDoc";

interface DevTabProps {
  htmlCode: string;
  onHtmlChange: (html: string) => void;
}

export const DevTab: React.FC<DevTabProps> = ({
  htmlCode,
  onHtmlChange,
}) => {
  const [devFullScreen, setDevFullScreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (devFullScreen) {
      // Prevent body scroll when fullscreen is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [devFullScreen]);

  const handleFormat = () => {
    try {
      const formatted = formatHTML(htmlCode);
      onHtmlChange(formatted);
    } catch (e) {
      alert("Error formatting HTML");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = htmlCode;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        alert("Failed to copy HTML. Please select and copy manually.");
      }
      document.body.removeChild(textArea);
    }
  };

  const handleMinify = () => {
    try {
      const minified = htmlCode
        .replace(/\s+/g, " ")
        .replace(/>\s+</g, "><")
        .trim();
      onHtmlChange(minified);
    } catch (e) {
      alert("Error minifying HTML");
    }
  };

  const [viewMode, setViewMode] = useState<"split" | "code" | "preview">("split");

  const fullscreenContent = devFullScreen && mounted ? (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-4 border-b-2 border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 gap-2">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#0b5cff]" />
          <span className="hidden sm:inline">HTML Code Editor - Full Screen</span>
          <span className="sm:hidden">HTML Editor</span>
        </h2>
        <div className="flex items-center gap-1 sm:gap-3 flex-wrap">
          {/* View Mode Toggle - Mobile */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode("code")}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                viewMode === "code" ? "bg-[#0b5cff] text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                viewMode === "split" ? "bg-[#0b5cff] text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                viewMode === "preview" ? "bg-[#0b5cff] text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              Preview
            </button>
          </div>
          <button
            onClick={handleFormat}
            className="px-2 sm:px-5 py-1.5 sm:py-2.5 bg-[#0b5cff] hover:bg-[#0947d6] text-white rounded-lg transition-all duration-200 flex items-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm"
          >
            <Code2 className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Format</span>
          </button>
          <button
            onClick={handleCopy}
            className={`px-2 sm:px-5 py-1.5 sm:py-2.5 rounded-lg transition-all duration-200 flex items-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm border ${
              copySuccess
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-transparent border-slate-400 text-slate-200 hover:bg-slate-700 hover:border-slate-300"
            }`}
          >
            {copySuccess ? (
              <>
                <Check className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleMinify}
            className="px-2 sm:px-5 py-1.5 sm:py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-all duration-200 font-semibold text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Minify</span>
            <span className="sm:hidden">Min</span>
          </button>
          <button
            onClick={() => setDevFullScreen(false)}
            className="px-2 sm:px-5 py-1.5 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      {/* Mobile View Mode Toggle */}
      <div className="sm:hidden flex items-center justify-center gap-2 p-2 bg-gray-800 border-b border-gray-700">
        <button
          onClick={() => setViewMode("code")}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            viewMode === "code" ? "bg-[#0b5cff] text-white" : "bg-gray-700 text-gray-300"
          }`}
        >
          Code
        </button>
        <button
          onClick={() => setViewMode("split")}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            viewMode === "split" ? "bg-[#0b5cff] text-white" : "bg-gray-700 text-gray-300"
          }`}
        >
          Split
        </button>
        <button
          onClick={() => setViewMode("preview")}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            viewMode === "preview" ? "bg-[#0b5cff] text-white" : "bg-gray-700 text-gray-300"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Content Area - Responsive */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden" style={{ height: viewMode === "split" ? "calc(100vh - 120px)" : "calc(100vh - 73px)" }}>
        {/* Code Editor */}
        <div className={`${viewMode === "preview" ? "hidden" : viewMode === "split" ? "flex-1" : "w-full"} flex flex-col border-r-0 sm:border-r-2 border-gray-700`}>
          <div className="p-2 sm:p-3 bg-gradient-to-r from-gray-800 to-gray-900 border-b-2 border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <label className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Code2 className="w-3 h-3 sm:w-4 sm:h-4 text-[#0b5cff]" />
              HTML Code Editor
            </label>
            <div className="flex items-center gap-2 sm:gap-6 text-xs text-gray-300 font-semibold flex-wrap">
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-700 rounded text-xs">
                Lines: {htmlCode.split("\n").length}
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-700 rounded text-xs">
                Chars: {htmlCode.length.toLocaleString()}
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-700 rounded text-xs">
                Words: {htmlCode.split(/\s+/).filter((w) => w.length > 0).length.toLocaleString()}
              </span>
            </div>
          </div>
          <textarea
            value={htmlCode}
            onChange={(e) => onHtmlChange(e.target.value)}
            className="flex-1 w-full p-3 sm:p-6 border-0 font-mono text-xs sm:text-sm bg-gray-900 text-green-400 focus:outline-none resize-none"
            style={{
              fontFamily: "'Courier New', monospace",
              lineHeight: "1.8",
              tabSize: 2,
            }}
            placeholder="Edit HTML code directly..."
            spellCheck={false}
          />
        </div>

        {/* Preview Panel */}
        <div className={`${viewMode === "code" ? "hidden" : viewMode === "split" ? "w-full sm:w-1/2" : "w-full"} flex flex-col border-l-0 sm:border-l-2 border-gray-700 bg-white`}>
          <div className="p-2 sm:p-3 bg-slate-50 border-b border-slate-200">
            <label className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide flex items-center gap-2">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-[#0b5cff]" />
              Live Preview
            </label>
          </div>
          <div className="flex-1 overflow-hidden bg-white">
            <iframe
              title="Email HTML Preview"
              srcDoc={buildEmailPreviewSrcDoc(htmlCode)}
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  ) : null;

  const handleFullScreen = () => {
    setDevFullScreen(true);
  };

  if (isHidden) {
    return (
      <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-3 z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#0b5cff]" />
            Dev Tools (Hidden)
          </h3>
          <button
            onClick={() => setIsHidden(false)}
            className="px-3 py-1.5 bg-[#0b5cff] hover:bg-[#0947d6] text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-xs font-semibold"
            title="Show Dev Tools"
          >
            <Eye className="w-3 h-3" /> Show
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {mounted && createPortal(fullscreenContent, document.body)}
      <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 border-l-4 border-l-[#0b5cff] p-2 z-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-[#0b5cff]" />
            Dev Tools
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? (
                <Maximize2 className="w-3 h-3" />
              ) : (
                <Minimize2 className="w-3 h-3" />
              )}
            </button>
            <button
              onClick={handleFullScreen}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              title="Open in New Window"
            >
              <Monitor className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsHidden(true)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              title="Hide Dev Tools"
            >
              <EyeOff className="w-3 h-3" />
            </button>
          </div>
        </div>
        {!isMinimized && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleFormat}
              className="px-2 py-1 bg-[#0b5cff] hover:bg-[#0947d6] text-white rounded transition-all duration-200 flex items-center gap-1 text-[10px] font-semibold"
            >
              <Code2 className="w-2.5 h-2.5" /> Format
            </button>
            <button
              onClick={handleCopy}
              className={`px-2 py-1 rounded transition-all duration-200 flex items-center gap-1 text-[10px] font-semibold border ${
                copySuccess
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {copySuccess ? (
                <>
                  <Check className="w-2.5 h-2.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-2.5 h-2.5" /> Copy
                </>
              )}
            </button>
            <button
              onClick={handleMinify}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded transition-all duration-200 text-[10px] font-semibold"
            >
              Minify
            </button>
          </div>
        )}
      </div>
      {!isMinimized && (
        <div className="p-2 space-y-3 overflow-x-hidden">
          <div>
            <label className="block text-[10px] font-semibold mb-1.5 text-slate-700 dark:text-slate-300">HTML Code</label>
            <textarea
              value={htmlCode}
              onChange={(e) => onHtmlChange(e.target.value)}
              className="w-full min-w-0 p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-[10px] font-mono bg-gray-900 text-green-400 focus:outline-none focus:ring-1 focus:ring-[#0b5cff] focus:border-[#0b5cff] transition-all"
              style={{
                fontFamily: "'Courier New', monospace",
                minHeight: "200px",
                lineHeight: "1.5",
                tabSize: 2,
              }}
              rows={12}
              placeholder="Edit HTML code directly..."
              spellCheck={false}
            />
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
            <label className="block text-[10px] font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Live Preview</label>
            <div className="border border-slate-200 dark:border-slate-600 rounded-lg bg-white overflow-hidden" style={{ height: "12rem" }}>
              <iframe
                title="Email HTML Preview"
                srcDoc={buildEmailPreviewSrcDoc(htmlCode)}
                className="w-full h-full border-0"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
            <label className="block text-[10px] font-semibold mb-1.5 text-slate-700 dark:text-slate-300">HTML Statistics</label>
            <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span className="font-medium text-slate-700 dark:text-slate-300">Lines:</span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold">{htmlCode.split("\n").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-700 dark:text-slate-300">Chars:</span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold">{htmlCode.length.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-700 dark:text-slate-300">Words:</span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold">
                  {htmlCode.split(/\s+/).filter((w) => w.length > 0).length.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-700 dark:text-slate-300">Size:</span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold">{(htmlCode.length / 1024).toFixed(2)} KB</span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
            <label className="block text-[10px] font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Import from HTML</label>
            <textarea
              placeholder="Paste HTML code here..."
              className="w-full min-w-0 p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-[10px] font-mono bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#0b5cff] focus:border-[#0b5cff] transition-all"
              rows={3}
              onPaste={(e) => {
                const pastedText = e.clipboardData.getData("text");
                onHtmlChange(pastedText);
              }}
            />
            <p className="mt-1 text-[9px] text-slate-500">
              Paste HTML code above to replace current template
            </p>
          </div>
        </div>
      )}
    </>
  );
};
