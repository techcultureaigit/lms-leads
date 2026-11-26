"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import { SketchPicker } from "react-color";
import "./RichTextEditor.css";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Placeholder } from "@tiptap/extensions";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Code from "@tiptap/extension-code";
import FontFamily from "@tiptap/extension-font-family";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaListUl,
  FaListOl,
  FaLink,
  FaUndo,
  FaRedo,
  FaParagraph,
  FaIndent,
  FaOutdent,
  FaEraser,
  FaSubscript,
  FaSuperscript,
  FaCode,
} from "react-icons/fa";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onFocus?: () => void;
  onBlur?: () => void;
  showToolbar?: boolean;
  fontSize?: string;
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center" | "right" | "justify";
}

const FONT_FAMILIES = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
];

const FONT_SIZES = [
  "8px", "9px", "10px", "11px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px", "72px"
];

const TEXT_COLORS = [
  "#000000", "#333333", "#999999", "#CCCCCC", "#FFFFFF",
  "#FF0000", "#FF6600", "#FFCC00", "#00FF00", "#0066FF", 
  "#0000FF", "#6600FF", "#FF00FF", "#FF0066", "#FF1493", "#FF69B4",
  "#8B0000", "#DC143C", "#FF4500", "#FF8C00", "#FFD700", "#ADFF2F",
  "#32CD32", "#00CED1", "#1E90FF", "#0000CD", "#8A2BE2", "#9370DB",
];

const HIGHLIGHT_COLORS = [
  "#FFFF00", "#FFCC00", "#FF9900", "#FF6600", "#FF0000",
  "#FF99CC", "#FF66CC", "#FF00CC", "#CC00FF", "#9900FF",
  "#66CCFF", "#00CCFF", "#00FFCC", "#00FF99", "#00FF66",
  "#CCFF99", "#CCFF66", "#CCFF00", "#99FF00", "#66FF00",
  "#FFE4B5", "#FFB6C1", "#E0E0E0", "#D3D3D3", "#C0C0C0",
];

const AVAILABLE_VARIABLES = [
  { key: "name", label: "Name", value: "{{name}}" },
  { key: "email", label: "Email", value: "{{email}}" },
  { key: "company", label: "Company", value: "{{company}}" },
  { key: "date", label: "Date", value: "{{date}}" },
  { key: "year", label: "Year", value: "{{year}}" },
];

// Function to clean HTML content and remove block IDs - Optimized version
const cleanContentFromBlockIds = (html: string): string => {
  if (!html) return html;
  
  // Quick check first - return early if no block IDs detected (optimization)
  if (!/block-\d+-[a-z0-9]+/i.test(html)) {
    return html; // No block IDs, return original without processing
  }
  
  // First, do aggressive string replacement to catch all patterns
  let cleanedHtml = html;
  
  // Remove block ID patterns from text content (multiple patterns)
  cleanedHtml = cleanedHtml.replace(/block-\d+-[a-z0-9]+/gi, '');
  cleanedHtml = cleanedHtml.replace(/\*\*block-\d+-[a-z0-9]+\*\*/gi, '');
  cleanedHtml = cleanedHtml.replace(/\.block-\d+-[a-z0-9]+/gi, '');
  
  // Remove from HTML attributes
  cleanedHtml = cleanedHtml.replace(/id="block-\d+-[a-z0-9]+"/gi, '');
  cleanedHtml = cleanedHtml.replace(/id='block-\d+-[a-z0-9]+'/gi, '');
  cleanedHtml = cleanedHtml.replace(/class="[^"]*block-\d+-[a-z0-9]+[^"]*"/gi, '');
  cleanedHtml = cleanedHtml.replace(/class='[^']*block-\d+-[a-z0-9]+[^']*'/gi, '');
  cleanedHtml = cleanedHtml.replace(/data-block-id="[^"]*"/gi, '');
  cleanedHtml = cleanedHtml.replace(/data-block-id='[^']*'/gi, '');
  
  // Now parse DOM to clean text nodes more thoroughly
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanedHtml;
    
    // Remove block IDs from HTML attributes
    tempDiv.querySelectorAll('*').forEach(el => {
      const element = el as HTMLElement;
      if (element.id && element.id.includes('block-')) {
        element.removeAttribute('id');
      }
      if (element.className) {
        if (typeof element.className === 'string') {
          element.className = element.className.split(' ').filter((c: string) => !c.includes('block-')).join(' ');
        } else {
          // Handle DOMTokenList
          const classList = element.classList;
          if (classList) {
            const classes = Array.from(classList).filter((c: string) => !c.includes('block-'));
            element.className = classes.join(' ');
          }
        }
      }
      element.removeAttribute('data-block-id');
    });
    
    // Clean text nodes - remove block ID patterns from text content
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent) {
        const originalText = node.textContent;
        // Only process if block IDs are present (optimization)
        if (!/block-\d+-[a-z0-9]+/i.test(originalText)) {
          continue; // Skip if no block IDs
        }
        
        // Remove block ID patterns from text (multiple passes)
        let text = originalText;
        text = text.replace(/block-\d+-[a-z0-9]+/gi, '');
        text = text.replace(/\*\*block-\d+-[a-z0-9]+\*\*/gi, '');
        text = text.replace(/\.block-\d+-[a-z0-9]+/gi, '');
        // Clean up extra whitespace but preserve structure
        text = text.replace(/\s{2,}/g, ' ');
        
        // Only update if text changed and is not empty (ProseMirror doesn't allow empty text nodes)
        if (text !== originalText) {
          if (text.trim().length > 0) {
            node.textContent = text;
          } else if (originalText.trim().length > 0) {
            // If text becomes empty after cleaning, keep at least a space to avoid empty nodes
            node.textContent = ' ';
          }
          // If original was empty, leave it as is
        }
      }
    }
    
    cleanedHtml = tempDiv.innerHTML;
  } catch (e) {
    // If DOM parsing fails, use string replacement only
    console.warn('Failed to parse HTML for cleaning:', e);
  }
  
  // Final pass - remove any remaining patterns
  cleanedHtml = cleanedHtml.replace(/block-\d+-[a-z0-9]+/gi, '');
  
  return cleanedHtml;
};

// TipTap Extension to prevent block IDs from being inserted at transaction level
// Simplified version that doesn't create empty text nodes
const BlockIdPreventionExtension = Extension.create({
  name: 'blockIdPrevention',
  
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('blockIdPrevention'),
        filterTransaction(transaction) {
          // Prevent transactions that contain block IDs from being applied during selection
          // This prevents block IDs from being inserted when selecting text
          const doc = transaction.doc;
          const text = doc.textContent;
          
          if (text && /block-\d+-[a-z0-9]+/i.test(text)) {
            // Block ID detected - check if this is a selection-only transaction
            // If it's just a selection change (no content change), allow it
            if (transaction.steps.length === 0) {
              return true; // Allow read-only/selection transactions
            }
            
            // For content-changing transactions with block IDs, we'll clean them in onUpdate
            // But we still allow the transaction to proceed so cleaning can happen
            return true;
          }
          
          return true;
        },
      }),
    ];
  },
});

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Start typing...",
  editable = true,
  className = "",
  style = {},
  onFocus,
  onBlur,
  showToolbar = true,
  fontSize,
  fontFamily,
  textColor,
  backgroundColor,
  textAlign,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightColorPicker, setShowHighlightColorPicker] = useState(false);
  const [showVariableSuggestions, setShowVariableSuggestions] = useState(false);
  const [variableSuggestions, setVariableSuggestions] = useState<typeof AVAILABLE_VARIABLES>([]);
  const [selectedVariableIndex, setSelectedVariableIndex] = useState(0);
  const [variablePopupPosition, setVariablePopupPosition] = useState({ top: 0, left: 0 });
  const [isFocused, setIsFocused] = useState(false);
  const textColorPickerRef = useRef<HTMLDivElement>(null);
  const highlightColorPickerRef = useRef<HTMLDivElement>(null);
  const variableSuggestionsRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const isPastingRef = useRef(false);
  const isUpdatingFromPropsRef = useRef(false);
  const isSelectingRef = useRef(false);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editorRefForPaste = useRef<any>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        link: false,
        underline: false,
      }),
      TextStyle,
      FontSize,
      FontFamily,
      Color,
      Underline,
      Subscript,
      Superscript,
      Code.configure({
        HTMLAttributes: {
          class: "code",
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      BlockIdPreventionExtension, // Add our custom extension to prevent block IDs
    ],
    content: cleanContentFromBlockIds(content),
    editable,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor, transaction }) => {
      // Don't trigger onChange during paste operations, when updating from props, or during text selection
      // Also check if this is just a selection change (no content change)
      const isSelectionOnly = transaction.steps.length === 0 || 
        (transaction.steps.length === 1 && transaction.steps[0] && 'slice' in transaction.steps[0] && (transaction.steps[0] as any).slice && (transaction.steps[0] as any).slice.size === 0);
      
      // CRITICAL: Never process updates during text selection to prevent block ID creation
      if (isSelectingRef.current) {
        return; // Completely skip all processing during selection
      }
      
      if (!isPastingRef.current && !isUpdatingFromPropsRef.current && !isSelectingRef.current && !isSelectionOnly) {
        const html = editor.getHTML();
        
        // Only check for block IDs if they're actually present (optimization)
        const doc = transaction.doc;
        const text = doc.textContent;
        const hasBlockId = text && /block-\d+-[a-z0-9]+/i.test(text);
        
        if (hasBlockId) {
          // Block ID detected, clean it immediately
          const cleanedHtml = cleanContentFromBlockIds(html);
          if (cleanedHtml !== html) {
            // Immediately clean and update - but don't trigger during selection
            if (!isSelectingRef.current) {
              setTimeout(() => {
                if (!isUpdatingFromPropsRef.current && !isSelectingRef.current) {
                  isUpdatingFromPropsRef.current = true;
                  const currentSelection = editor.state.selection;
                  editor.commands.setContent(cleanedHtml, { emitUpdate: false });
                  try {
                    const docSize = editor.state.doc.content.size;
                    const newPos = Math.min(currentSelection.anchor, docSize);
                    if (newPos >= 0) {
                      editor.commands.setTextSelection(newPos);
                    }
                  } catch (e) {
                    // Ignore
                  }
                  setTimeout(() => {
                    isUpdatingFromPropsRef.current = false;
                  }, 0);
                }
              }, 0);
              onChange(cleanedHtml);
            }
          } else {
            // No change needed, just call onChange normally
            onChange(html);
          }
        } else {
          // No block IDs detected, normal update - call onChange directly without cleaning
          onChange(html);
        }
      }
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[60px] px-2 py-1",
        style: `
          font-family: ${fontFamily || "Arial, sans-serif"};
          font-size: ${fontSize || "16px"};
          color: ${textColor || "#000000"};
          background-color: ${backgroundColor || "transparent"};
          text-align: ${textAlign || "left"};
        `,
      },
      handleDrop: (view, event, slice, moved) => {
        // Prevent block IDs from being created during drag & drop
        isPastingRef.current = true;
        setTimeout(() => {
          isPastingRef.current = false;
          // Clean any block IDs that might have been inserted
          const html = editorRefForPaste.current?.getHTML();
          if (html && /block-\d+-[a-z0-9]+/i.test(html)) {
            const cleanedHtml = cleanContentFromBlockIds(html);
            if (cleanedHtml !== html && editorRefForPaste.current) {
              editorRefForPaste.current.commands.setContent(cleanedHtml, { emitUpdate: false });
            }
          }
        }, 100);
        return false; // Allow default drop behavior
      },
      handlePaste: (view, event) => {
        isPastingRef.current = true;
        
        // Temporarily hide variable suggestions during paste
        setShowVariableSuggestions(false);
        
        // Get clipboard data
        const clipboardData = event.clipboardData;
        if (!clipboardData) {
          setTimeout(() => {
            isPastingRef.current = false;
          }, 100);
          return false;
        }

        // Try to get HTML first to preserve formatting
        let html = clipboardData.getData('text/html');
        let text = clipboardData.getData('text/plain');
        
        // If we have HTML, clean it but preserve formatting including spacing
        if (html && html.trim() !== '') {
          event.preventDefault();
          
          // Create a temporary DOM element to clean the HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          
          // Remove unwanted elements and attributes (block IDs, Google Docs metadata)
          tempDiv.querySelectorAll('[id*="block-"], [class*="block-"], [data-block-id]').forEach(el => el.remove());
          
          // Process all elements to clean but preserve formatting
          tempDiv.querySelectorAll('*').forEach(el => {
            // Remove Google Docs specific attributes
            if (el.id && el.id.includes('block-')) {
              el.removeAttribute('id');
            }
            
            // Remove all data-sheets-* attributes (Google Docs metadata)
            Array.from(el.attributes).forEach(attr => {
              if (attr.name.startsWith('data-sheets-')) {
                el.removeAttribute(attr.name);
              }
            });
            
            // Remove Google Docs specific classes but keep formatting classes
            const classList = Array.from(el.classList);
            classList.forEach(className => {
              if (className.startsWith('c') && /^\d+$/.test(className.substring(1))) {
                // Google Docs color classes like c1, c2, etc. - remove them
                el.classList.remove(className);
              }
              if (className.includes('kix-') || className.includes('docs-')) {
                // Google Docs specific classes - remove them
                el.classList.remove(className);
              }
            });
            
            // Clean style attributes but preserve ALL important formatting including spacing
            if (el.hasAttribute('style')) {
              const style = el.getAttribute('style') || '';
              // Keep all formatting styles including spacing: margin, padding, line-height, letter-spacing
              const allowedStyles = [
                'color', 'background-color', 'font-weight', 'font-style', 'text-decoration', 
                'font-size', 'font-family', 'text-align', 'line-height', 'letter-spacing',
                'margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
                'padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
                'text-indent', 'white-space'
              ];
              const styleObj: { [key: string]: string } = {};
              allowedStyles.forEach(prop => {
                const match = style.match(new RegExp(`${prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*([^;]+)`, 'i'));
                if (match) {
                  styleObj[prop] = match[1].trim();
                }
              });
              if (Object.keys(styleObj).length > 0) {
                el.setAttribute('style', Object.entries(styleObj).map(([k, v]) => `${k}: ${v}`).join('; '));
              } else {
                el.removeAttribute('style');
              }
            }
            
            // Preserve paragraph structure - ensure <p> tags maintain spacing
            if (el.tagName === 'P' || el.tagName === 'DIV') {
              // Ensure paragraphs have proper spacing
              const currentStyle = el.getAttribute('style') || '';
              if (!currentStyle.includes('margin') && !currentStyle.includes('padding')) {
                // Add default paragraph spacing if none exists
                const existingStyles = currentStyle ? currentStyle + '; ' : '';
                el.setAttribute('style', existingStyles + 'margin: 0 0 1em 0;');
              }
            }
          });
          
          // Preserve line breaks - ensure <br> tags are kept
          tempDiv.querySelectorAll('br').forEach(br => {
            // Keep all <br> tags for line breaks
          });
          
          // Better handle Google Docs structure - preserve paragraph spacing
          // Google Docs often uses divs with specific styling for paragraphs
          tempDiv.querySelectorAll('div, p').forEach(el => {
            const tagName = el.tagName.toLowerCase();
            // If it's a div that should be a paragraph, convert it
            if (tagName === 'div' && el.children.length === 0 && el.textContent && el.textContent.trim()) {
              // Convert div to paragraph if it contains text
              const p = document.createElement('p');
              p.innerHTML = el.innerHTML;
              // Copy styles
              if (el.hasAttribute('style')) {
                p.setAttribute('style', el.getAttribute('style') || '');
              }
              el.parentNode?.replaceChild(p, el);
            }
            
            // Ensure paragraphs have proper spacing
            if (tagName === 'p') {
              const currentStyle = el.getAttribute('style') || '';
              // Check if margin or padding exists
              const hasSpacing = currentStyle.includes('margin') || currentStyle.includes('padding');
              if (!hasSpacing) {
                // Add default paragraph spacing to match Google Docs
                const existingStyles = currentStyle ? currentStyle + '; ' : '';
                el.setAttribute('style', existingStyles + 'margin: 0 0 1em 0;');
              }
            }
          });
          
          // Preserve text formatting spans - Google Docs uses many nested spans
          // Don't remove spans unnecessarily, they contain formatting
          
          // Get cleaned HTML
          const cleanedHtml = tempDiv.innerHTML;
          
          // Insert HTML content preserving formatting
          const editorInstance = editorRefForPaste.current;
          if (editorInstance && !editorInstance.isDestroyed) {
            const { state, dispatch } = view;
            const { selection } = state;
            const { from, to } = selection;
            
            // Use TipTap's insertContent to insert HTML with formatting
            // This preserves all formatting including spacing, colors, fonts, etc.
            editorInstance.chain().focus().deleteRange({ from, to }).insertContent(cleanedHtml).run();
            
            // Reset paste flag after a short delay
            setTimeout(() => {
              isPastingRef.current = false;
              const newHtml = editorInstance.getHTML();
              const finalCleanedHtml = cleanContentFromBlockIds(newHtml);
              onChange(finalCleanedHtml);
            }, 0);
            
            return true;
          }
        }
        
        // Fallback: if no HTML, use plain text
        if (text && text.trim() !== '') {
          event.preventDefault();
          
          // Insert text at current selection
          const { state, dispatch } = view;
          const { selection } = state;
          const { from, to } = selection;
          
          // Replace selection with text
          const tr = state.tr.insertText(text, from, to);
          dispatch(tr);
          
          // Reset paste flag after a short delay
          setTimeout(() => {
            isPastingRef.current = false;
            const editorInstance = editorRefForPaste.current;
            if (editorInstance && !editorInstance.isDestroyed) {
              const newHtml = editorInstance.getHTML();
              const cleanedHtml = cleanContentFromBlockIds(newHtml);
              onChange(cleanedHtml);
            }
          }, 0);
          
          return true;
        }
        
        // Final fallback: allow default paste but clean it up
        setTimeout(() => {
          isPastingRef.current = false;
          const editorInstance = editorRefForPaste.current;
          if (editorInstance && !editorInstance.isDestroyed) {
            let html = editorInstance.getHTML();
            const cleanedHtml = cleanContentFromBlockIds(html);
            
            if (cleanedHtml !== html) {
              editorInstance.commands.setContent(cleanedHtml);
            }
            onChange(cleanedHtml);
          }
        }, 100);
        
        return false;
      },
    },
  });

  // Store editor reference for paste handler
  useEffect(() => {
    if (editor) {
      editorRefForPaste.current = editor;
    }
  }, [editor]);

  // Real-time content cleaning - remove block IDs as they appear (only when detected)
  useEffect(() => {
    if (!editor) return;

    const cleanContentPeriodically = () => {
      // Skip if user is actively editing (pasting, selecting, or updating from props)
      // IMPORTANT: Never clean during text selection to prevent block ID creation
      if (isPastingRef.current || isSelectingRef.current || isUpdatingFromPropsRef.current) {
        return;
      }

      // Quick check first - only process if block IDs are likely present
      const currentHtml = editor.getHTML();
      if (!currentHtml || !/block-\d+-[a-z0-9]+/i.test(currentHtml)) {
        return; // No block IDs detected, skip expensive cleaning
      }

      // Double check - ensure we're not in selection mode
      if (isSelectingRef.current) {
        return; // Still selecting, don't clean
      }

      const cleanedHtml = cleanContentFromBlockIds(currentHtml);
      
      if (cleanedHtml !== currentHtml) {
        // Block IDs detected, clean them - but only if not selecting
        if (!isSelectingRef.current) {
          isUpdatingFromPropsRef.current = true;
          const currentSelection = editor.state.selection;
          editor.commands.setContent(cleanedHtml, { emitUpdate: false });
          
          // Restore selection
          try {
            const docSize = editor.state.doc.content.size;
            const newPos = Math.min(currentSelection.anchor, docSize);
            if (newPos >= 0) {
              editor.commands.setTextSelection(newPos);
            }
          } catch (e) {
            // Ignore selection errors
          }
          
          setTimeout(() => {
            isUpdatingFromPropsRef.current = false;
            onChange(cleanedHtml);
          }, 0);
        }
      }
    };

    // Check periodically for block IDs (less frequent to avoid performance issues)
    // Only runs if block IDs are detected
    const intervalId = setInterval(cleanContentPeriodically, 200);

    return () => {
      clearInterval(intervalId);
    };
  }, [editor, onChange]);

  // Add copy event handler to intercept copy operations and clean content
  useEffect(() => {
    if (!editor) return;

    const handleCopy = (event: ClipboardEvent) => {
      // Only handle if editor is focused
      const editorDom = editor.view.dom;
      if (!editorDom.contains(document.activeElement) && document.activeElement !== editorDom) {
        return;
      }

      const { state } = editor;
      const { selection } = state;
      const { from, to } = selection;

      // Only process if there's a selection
      if (from === to) {
        return;
      }

      // Get selected text content
      const selectedText = state.doc.textBetween(from, to);

      // Clean the text - remove block IDs and unwanted patterns
      let cleanText = selectedText;
      if (cleanText) {
        // Remove block ID patterns
        cleanText = cleanText.replace(/block-\d+-[a-z0-9]+/gi, '');
        cleanText = cleanText.replace(/\*\*block-\d+-[a-z0-9]+\*\*/gi, '');
        // Clean up extra whitespace but preserve line breaks
        cleanText = cleanText.replace(/[ \t]+/g, ' '); // Multiple spaces/tabs to single space
        cleanText = cleanText.replace(/\n\s*\n\s*\n/g, '\n\n'); // Multiple newlines to double
        cleanText = cleanText.trim();
      }

      // Set clean content to clipboard
      if (event.clipboardData && cleanText) {
        event.preventDefault();
        event.clipboardData.setData('text/plain', cleanText);
        // Set simple HTML version
        event.clipboardData.setData('text/html', `<p>${cleanText.replace(/\n/g, '<br>')}</p>`);
      }
    };

    const editorDom = editor.view.dom;
    editorDom.addEventListener('copy', handleCopy);

    return () => {
      editorDom.removeEventListener('copy', handleCopy);
    };
  }, [editor]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Only update if content is actually different and we're not pasting or selecting
      if (!isPastingRef.current && !isSelectingRef.current) {
        isUpdatingFromPropsRef.current = true;
        const currentSelection = editor.state.selection;
        // Clean content before setting it
        const cleanedContent = cleanContentFromBlockIds(content);
        editor.commands.setContent(cleanedContent, { emitUpdate: false });
        // Restore cursor position if possible
        try {
          const docSize = editor.state.doc.content.size;
          const newPos = Math.min(currentSelection.anchor, docSize);
          if (newPos >= 0) {
            editor.commands.setTextSelection(newPos);
          }
        } catch (e) {
          // Ignore selection errors
        }
        setTimeout(() => {
          isUpdatingFromPropsRef.current = false;
        }, 0);
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor && fontSize) {
      editor.chain().focus().setFontSize(fontSize).run();
    }
  }, [fontSize, editor]);

  useEffect(() => {
    if (editor && fontFamily) {
      editor.chain().focus().setFontFamily(fontFamily).run();
    }
  }, [fontFamily, editor]);

  useEffect(() => {
    if (editor && textColor) {
      editor.chain().focus().setColor(textColor).run();
    }
  }, [textColor, editor]);

  useEffect(() => {
    // Only apply textAlign if explicitly set - don't force center alignment by default
    // This prevents cursor from moving to center automatically
    if (editor && textAlign) {
      // Only update DOM style, don't force alignment on all content
      // This preserves existing alignment in the content
      if (editor.view && editor.view.dom) {
        editor.view.dom.style.textAlign = textAlign;
      }
      // Don't apply alignment to all content - let users set alignment per paragraph
      // This prevents default center behavior
    } else if (editor) {
      // If no textAlign prop, ensure default is left (not center)
      if (editor.view && editor.view.dom) {
        editor.view.dom.style.textAlign = "left";
      }
    }
  }, [textAlign, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const insertVariable = useCallback((variable: typeof AVAILABLE_VARIABLES[0]) => {
    if (!editor || !variable || !variable.key) return;
    
    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;
    const textBeforeCursor = state.doc.textBetween(0, $from.pos);
    const lastOpenBrace = textBeforeCursor.lastIndexOf("{{");

    if (lastOpenBrace !== -1) {
      // Calculate the position where we need to delete from (after {{)
      const deleteFrom = lastOpenBrace + 2;
      const currentPos = $from.pos;
      
      // Delete everything from {{ to current cursor position
      if (currentPos > deleteFrom) {
        editor.chain()
          .focus()
          .deleteRange({ from: deleteFrom, to: currentPos })
          .insertContent(variable.value)
          .run();
      } else {
        // Just insert the variable if cursor is right after {{
        editor.chain()
          .focus()
          .insertContent(variable.value)
          .run();
      }
      
      setShowVariableSuggestions(false);
    }
  }, [editor]);

  // Monitor editor content for {{ pattern with optimized performance
  useEffect(() => {
    if (!editor) return;

    let updateTimeout: NodeJS.Timeout | null = null;
    let positionTimeout: NodeJS.Timeout | null = null;

    const updatePopupPosition = (filtered: typeof AVAILABLE_VARIABLES) => {
      if (!editor || !isFocused) return;
      
      requestAnimationFrame(() => {
        try {
          const selection = editor.state.selection;
          const { view } = editor;
          const { $from } = selection;
          const coords = view.coordsAtPos($from.pos);
          
          if (coords && filtered.length > 0) {
            const popupWidth = 220;
            const popupHeight = Math.min(filtered.length * 36, 180);
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            let top = coords.bottom + 4;
            let left = coords.left;
            
            // Adjust if popup would go off right edge
            if (left + popupWidth > viewportWidth) {
              left = viewportWidth - popupWidth - 10;
            }
            
            // Adjust if popup would go off bottom edge (show above cursor instead)
            if (top + popupHeight > viewportHeight) {
              top = coords.top - popupHeight - 4;
              if (top < 10) {
                top = 10;
              }
            }
            
            // Ensure it doesn't go off left edge
            if (left < 10) {
              left = 10;
            }
            
            setVariablePopupPosition({
              top: Math.max(10, top),
              left: Math.max(10, left),
            });
          }
        } catch (error) {
          // Silently handle errors
        }
      });
    };

    const handleUpdate = () => {
      // Don't process variable suggestions during paste operations
      if (isPastingRef.current) {
        return;
      }

      // Clear any pending updates
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      if (positionTimeout) {
        clearTimeout(positionTimeout);
      }

      // Use requestAnimationFrame for immediate, smooth response
      updateTimeout = setTimeout(() => {
        // Don't process during paste operations or text selection
        if (isPastingRef.current || isSelectingRef.current) {
          return;
        }

        // Check if editor is actually focused (check both state and DOM)
        const editorDom = editor.view.dom;
        const isEditorFocused = document.activeElement === editorDom || editorDom.contains(document.activeElement);
        
        // Only process if editor is focused
        if (!isEditorFocused && !isFocused) {
          setShowVariableSuggestions(false);
          return;
        }

        const selection = editor.state.selection;
        const textBeforeCursor = editor.state.doc.textBetween(0, selection.$from.pos);
        const lastOpenBrace = textBeforeCursor.lastIndexOf("{{");
        const lastCloseBrace = textBeforeCursor.lastIndexOf("}}");

        if (
          lastOpenBrace !== -1 &&
          (lastCloseBrace === -1 || lastCloseBrace < lastOpenBrace) &&
          selection.$from.pos >= lastOpenBrace
        ) {
          const searchText = textBeforeCursor.substring(lastOpenBrace + 2).toLowerCase();
          // If no search text after {{, show all variables. Otherwise filter.
          const filtered = searchText.length === 0 
            ? AVAILABLE_VARIABLES 
            : AVAILABLE_VARIABLES.filter((v) =>
                v && v.key && v.key.toLowerCase().startsWith(searchText)
              );

          if (filtered.length > 0) {
            setVariableSuggestions(filtered);
            setShowVariableSuggestions(true);
            setSelectedVariableIndex(0);

            // Update position asynchronously for better performance
            positionTimeout = setTimeout(() => updatePopupPosition(filtered), 0);
          } else {
            setShowVariableSuggestions(false);
          }
        } else {
          setShowVariableSuggestions(false);
        }
      }, 0); // Immediate execution, but batched
    };

    // Track mouse down/up for selection detection - prevent block ID creation during selection
    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      // Only set selecting flag if it's a text selection (not a click)
      const target = e.target as HTMLElement;
      // Check if user is starting a text selection (not just clicking)
      if (target && (target.tagName === 'P' || target.closest('p') || target.closest('[contenteditable="true"]'))) {
        isSelectingRef.current = true;
      }
      // Clear any existing timeout
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };

    const handleMouseUp = () => {
      // Wait longer before allowing updates again to ensure selection is complete
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      selectionTimeoutRef.current = setTimeout(() => {
        isSelectingRef.current = false;
      }, 300); // Increased delay to ensure selection is fully complete
    };
    
    // Also track mouse move during selection
    const handleMouseMove = () => {
      // If mouse is moving while button is down, user is selecting
      if (isSelectingRef.current) {
        // Keep selecting flag true during mouse move
      }
    };

    const editorDom = editor.view.dom;
    editorDom.addEventListener('mousedown', handleMouseDown);
    editorDom.addEventListener('mouseup', handleMouseUp);
    editorDom.addEventListener('mousemove', handleMouseMove);
    // Also handle touch events for mobile
    editorDom.addEventListener('touchstart', handleMouseDown);
    editorDom.addEventListener('touchend', handleMouseUp);
    editorDom.addEventListener('touchmove', handleMouseMove);

    editor.on("update", handleUpdate);
    editor.on("selectionUpdate", (props) => {
      // During selection, don't trigger variable suggestions or content updates
      // This prevents block IDs from being created during text selection
      if (isSelectingRef.current) {
        return; // Completely skip all updates during selection
      }
      // Only handle update if not selecting
      if (!isSelectingRef.current) {
        handleUpdate();
      }
    });
    editor.on("focus", () => {
      setIsFocused(true);
    });
    editor.on("blur", () => {
      setTimeout(() => {
        // Check if focus moved to variable suggestions popup or editor container
        const activeElement = document.activeElement;
        const isInPopup = variableSuggestionsRef.current?.contains(activeElement);
        const isInEditor = editorRef.current?.contains(activeElement);
        
        if (!isInPopup && !isInEditor) {
          setIsFocused(false);
          setShowVariableSuggestions(false);
        }
        // Reset selecting flag on blur
        isSelectingRef.current = false;
      }, 200);
    });

    return () => {
      if (updateTimeout) clearTimeout(updateTimeout);
      if (positionTimeout) clearTimeout(positionTimeout);
      if (selectionTimeoutRef.current) clearTimeout(selectionTimeoutRef.current);
      editorDom.removeEventListener('mousedown', handleMouseDown);
      editorDom.removeEventListener('mouseup', handleMouseUp);
      editorDom.removeEventListener('mousemove', handleMouseMove);
      editorDom.removeEventListener('touchstart', handleMouseDown);
      editorDom.removeEventListener('touchend', handleMouseUp);
      editorDom.removeEventListener('touchmove', handleMouseMove);
      editor.off("update", handleUpdate);
      editor.off("selectionUpdate");
      editor.off("focus");
      editor.off("blur");
    };
  }, [editor, isFocused]);

  // Close color pickers and variable suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        textColorPickerRef.current &&
        !textColorPickerRef.current.contains(event.target as Node)
      ) {
        setShowTextColorPicker(false);
      }
      if (
        highlightColorPickerRef.current &&
        !highlightColorPickerRef.current.contains(event.target as Node)
      ) {
        setShowHighlightColorPicker(false);
      }
      if (
        variableSuggestionsRef.current &&
        !variableSuggestionsRef.current.contains(event.target as Node) &&
        editorRef.current &&
        !editorRef.current.contains(event.target as Node)
      ) {
        setShowVariableSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update popup position when cursor moves (for smooth tracking)
  useEffect(() => {
    if (!editor || !showVariableSuggestions || variableSuggestions.length === 0 || !isFocused) return;

    let positionRaf: number | null = null;

    const updatePosition = () => {
      positionRaf = requestAnimationFrame(() => {
        try {
          const selection = editor.state.selection;
          const { view } = editor;
          const { $from } = selection;
          const coords = view.coordsAtPos($from.pos);
          
          if (coords) {
            const popupWidth = 220;
            const popupHeight = Math.min(variableSuggestions.length * 36, 180);
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            let top = coords.bottom + 4;
            let left = coords.left;
            
            // Adjust if popup would go off right edge
            if (left + popupWidth > viewportWidth) {
              left = viewportWidth - popupWidth - 10;
            }
            
            // Adjust if popup would go off bottom edge (show above cursor instead)
            if (top + popupHeight > viewportHeight) {
              top = coords.top - popupHeight - 4;
              if (top < 10) {
                top = 10;
              }
            }
            
            // Ensure it doesn't go off left edge
            if (left < 10) {
              left = 10;
            }
            
            setVariablePopupPosition({
              top: Math.max(10, top),
              left: Math.max(10, left),
            });
          }
        } catch (error) {
          // Silently handle errors
        }
      });
    };

    const handleSelectionUpdate = () => {
      updatePosition();
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    
    // Initial position update
    updatePosition();

    return () => {
      if (positionRaf !== null) {
        cancelAnimationFrame(positionRaf);
      }
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, showVariableSuggestions, variableSuggestions.length, isFocused]);

  // Handle keyboard navigation for variable suggestions
  useEffect(() => {
    if (!editor || !showVariableSuggestions || variableSuggestions.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showVariableSuggestions || variableSuggestions.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedVariableIndex((prev) => {
          const newIndex = (prev + 1) % variableSuggestions.length;
          return newIndex;
        });
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedVariableIndex((prev) => {
          const newIndex = (prev - 1 + variableSuggestions.length) % variableSuggestions.length;
          return newIndex;
        });
      } else if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        if (variableSuggestions.length > 0 && selectedVariableIndex >= 0 && selectedVariableIndex < variableSuggestions.length) {
          const selectedVar = variableSuggestions[selectedVariableIndex];
          if (selectedVar && selectedVar.key) {
            insertVariable(selectedVar);
          }
        }
      } else if (event.key === "Escape") {
        setShowVariableSuggestions(false);
      }
    };

    const editorDom = editor.view.dom;
    editorDom.addEventListener("keydown", handleKeyDown);
    return () => {
      editorDom.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, showVariableSuggestions, variableSuggestions, selectedVariableIndex, insertVariable]);


  // Early return after all hooks are declared
  if (!isMounted || !editor) {
    return (
      <div className={`rich-text-editor ${className}`} style={style}>
        <div className="border border-gray-200 rounded-lg bg-white min-h-[60px] p-2">
          <div className="text-gray-400 text-sm">{placeholder}</div>
        </div>
      </div>
    );
  }

  // Get current formatting attributes - check both textStyle mark and default
  const textStyleAttrs = editor.getAttributes("textStyle") || {};
  const currentFontSize = textStyleAttrs.fontSize || fontSize || "16px";
  const currentFontFamily = textStyleAttrs.fontFamily || fontFamily || "Arial, sans-serif";
  // Get color from textStyle mark, fallback to default
  const currentColor = textStyleAttrs.color || textColor || "#000000";
  const currentHighlight = editor.getAttributes("highlight")?.color || backgroundColor || "transparent";

  return (
    <div className={`rich-text-editor ${className}`} style={style}>
      {showToolbar && editable && (
        <div className="flex flex-wrap items-center gap-1 p-2.5 border-b-2 border-gray-300 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-t-lg sticky top-0 z-10 shadow-md">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 hover:bg-[#fbc40c]/20 hover:border-[#fbc40c] border border-transparent rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <FaUndo className="w-4 h-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 hover:bg-[#fbc40c]/20 hover:border-[#fbc40c] border border-transparent rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <FaRedo className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Text Style */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
            <select
              onChange={(e) => {
                const value = e.target.value;
                if (value.startsWith("h")) {
                  const level = parseInt(value.replace("h", "")) as 1 | 2 | 3 | 4 | 5 | 6;
                  editor.chain().focus().toggleHeading({ level }).run();
                } else {
                  editor.chain().focus().setParagraph().run();
                }
              }}
              value={
                editor.isActive("heading", { level: 1 })
                  ? "h1"
                  : editor.isActive("heading", { level: 2 })
                  ? "h2"
                  : editor.isActive("heading", { level: 3 })
                  ? "h3"
                  : editor.isActive("heading", { level: 4 })
                  ? "h4"
                  : editor.isActive("heading", { level: 5 })
                  ? "h5"
                  : editor.isActive("heading", { level: 6 })
                  ? "h6"
                  : "p"
              }
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
            >
              <option value="p">Normal text</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
              <option value="h6">Heading 6</option>
            </select>
          </div>

          {/* Font Family */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
            <select
              onChange={(e) => {
                editor.chain().focus().setFontFamily(e.target.value).run();
              }}
              value={currentFontFamily}
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#fbc40c] min-w-[120px]"
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
            <button
              type="button"
              onClick={() => {
                const currentSize = parseInt(currentFontSize) || 16;
                const newSize = Math.max(8, currentSize - 1);
                editor.chain().focus().setFontSize(`${newSize}px`).run();
              }}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Decrease font size"
            >
              <span className="text-xs font-bold text-gray-700">−</span>
            </button>
            <input
              type="text"
              value={currentFontSize}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d+px$/.test(value) || /^\d+$/.test(value)) {
                  editor.chain().focus().setFontSize(value.endsWith("px") ? value : `${value}px`).run();
                }
              }}
              className="w-12 px-1 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
            />
            <button
              type="button"
              onClick={() => {
                const currentSize = parseInt(currentFontSize) || 16;
                const newSize = Math.min(72, currentSize + 1);
                editor.chain().focus().setFontSize(`${newSize}px`).run();
              }}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Increase font size"
            >
              <span className="text-xs font-bold text-gray-700">+</span>
            </button>
          </div>

          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 hover:bg-[#fbc40c]/20 hover:border-[#fbc40c] border border-transparent rounded-md transition-all ${
                editor.isActive("bold") ? "bg-gray-200" : ""
              }`}
              title="Bold"
            >
              <FaBold className="w-4 h-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 hover:bg-[#fbc40c]/20 hover:border-[#fbc40c] border border-transparent rounded-md transition-all ${
                editor.isActive("italic") ? "bg-gray-200" : ""
              }`}
              title="Italic"
            >
              <FaItalic className="w-4 h-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 hover:bg-[#fbc40c]/20 hover:border-[#fbc40c] border border-transparent rounded-md transition-all ${
                editor.isActive("underline") ? "bg-gray-200" : ""
              }`}
              title="Underline"
            >
              <FaUnderline className="w-4 h-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 hover:bg-[#fbc40c]/20 hover:border-[#fbc40c] border border-transparent rounded-md transition-all ${
                editor.isActive("strike") ? "bg-gray-200" : ""
              }`}
              title="Strikethrough"
            >
              <FaStrikethrough className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Text Color */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
            <div className="relative" ref={textColorPickerRef}>
              <button
                type="button"
                onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
                title="Text color"
              >
                <span className="text-sm font-bold" style={{ color: currentColor }}>
                  A
                </span>
                <div
                  className="w-4 h-4 border border-gray-300 rounded"
                  style={{ backgroundColor: currentColor }}
                />
              </button>
              {showTextColorPicker && (
                <div className="absolute top-full left-0 mt-1 z-50">
                  <div className="bg-white border border-gray-300 rounded shadow-xl p-2">
                    <SketchPicker
                      color={currentColor}
                      onChange={(color) => {
                        if (editor && !editor.isDestroyed) {
                          try {
                            // Always apply color - works for selection or next typing
                            editor.commands.focus();
                            editor.chain().focus().setColor(color.hex).run();
                          } catch (error) {
                            console.error("Error applying color:", error);
                          }
                        }
                      }}
                      onChangeComplete={(color) => {
                        if (editor && !editor.isDestroyed) {
                          try {
                            editor.commands.focus();
                            editor.chain().focus().setColor(color.hex).run();
                          } catch (error) {
                            console.error("Error applying color:", error);
                          }
                        }
                        setShowTextColorPicker(false);
                      }}
                      presetColors={[...new Set(TEXT_COLORS.filter(c => c !== "#FFFF00"))]}
                      disableAlpha={true}
                      width="220px"
                    />
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="mb-2 text-xs font-semibold text-gray-600">Quick Colors:</div>
                      <div className="grid grid-cols-8 gap-1.5">
                        {TEXT_COLORS.filter(c => c !== "#FFFF00").map((color, index) => (
                          <button
                            key={`text-color-${index}-${color}`}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (editor && !editor.isDestroyed) {
                                try {
                                  // Focus editor first
                                  editor.commands.focus();
                                  // Apply color with proper timing
                                  setTimeout(() => {
                                    if (editor && !editor.isDestroyed) {
                                      // Ensure editor is still focused
                                      editor.commands.focus();
                                      editor.chain().focus().setColor(color).run();
                                    }
                                  }, 100);
                                } catch (error) {
                                  console.error("Error applying preset color:", error);
                                }
                              }
                              setShowTextColorPicker(false);
                            }}
                            className="w-7 h-7 border-2 border-gray-300 rounded-md hover:scale-125 hover:border-[#fbc40c] transition-all shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        Click any color to apply instantly
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Highlight Color */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
            <div className="relative" ref={highlightColorPickerRef}>
              <button
                type="button"
                onClick={() => setShowHighlightColorPicker(!showHighlightColorPicker)}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Highlight color"
              >
                <div
                  className="w-5 h-5 border border-gray-300 rounded"
                  style={{ backgroundColor: currentHighlight === "transparent" ? "#FFFF00" : currentHighlight }}
                />
              </button>
              {showHighlightColorPicker && (
                <div className="absolute top-full left-0 mt-1 z-50">
                  <div className="bg-white border border-gray-300 rounded shadow-xl p-2">
                    <SketchPicker
                      color={currentHighlight === "transparent" ? "#FFFF00" : currentHighlight}
                      onChange={(color) => {
                        if (editor && !editor.isDestroyed) {
                          editor.chain().focus().toggleHighlight({ color: color.hex }).run();
                        }
                      }}
                      onChangeComplete={(color) => {
                        if (editor && !editor.isDestroyed) {
                          editor.chain().focus().toggleHighlight({ color: color.hex }).run();
                        }
                        setShowHighlightColorPicker(false);
                      }}
                      presetColors={HIGHLIGHT_COLORS}
                      disableAlpha={true}
                      width="220px"
                    />
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => {
                            editor.chain().focus().unsetHighlight().run();
                            setShowHighlightColorPicker(false);
                          }}
                          className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        >
                          Remove Highlight
                        </button>
                      </div>
                      <div className="grid grid-cols-8 gap-1">
                        {HIGHLIGHT_COLORS.map((color, index) => (
                          <button
                            key={`highlight-color-${index}-${color}`}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (editor && !editor.isDestroyed) {
                                editor.commands.focus();
                                setTimeout(() => {
                                  editor.chain().focus().toggleHighlight({ color }).run();
                                }, 10);
                              }
                              setShowHighlightColorPicker(false);
                            }}
                            className="w-6 h-6 border border-gray-300 rounded hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Link */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
            <button
              type="button"
              onClick={setLink}
              className={`p-2 hover:bg-[#fbc40c]/20 hover:border-[#fbc40c] border border-transparent rounded-md transition-all ${
                editor.isActive("link") ? "bg-gray-200" : ""
              }`}
              title="Insert link"
            >
              <FaLink className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`p-2 hover:bg-[#fbc40c]/20 hover:border-[#fbc40c] border border-transparent rounded-md transition-all ${
                editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""
              }`}
              title="Align left"
            >
              <FaAlignLeft className="w-4 h-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`p-2 hover:bg-[#fbc40c]/20 hover:border-[#fbc40c] border border-transparent rounded-md transition-all ${
                editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""
              }`}
              title="Align center"
            >
              <FaAlignCenter className="w-4 h-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`p-2 hover:bg-[#fbc40c]/20 hover:border-[#fbc40c] border border-transparent rounded-md transition-all ${
                editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""
              }`}
              title="Align right"
            >
              <FaAlignRight className="w-4 h-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              className={`p-2 hover:bg-[#fbc40c]/20 hover:border-[#fbc40c] border border-transparent rounded-md transition-all ${
                editor.isActive({ textAlign: "justify" }) ? "bg-gray-200" : ""
              }`}
              title="Justify"
            >
              <FaAlignJustify className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 hover:bg-[#fbc40c]/20 hover:border-[#fbc40c] border border-transparent rounded-md transition-all ${
                editor.isActive("bulletList") ? "bg-gray-200" : ""
              }`}
              title="Bullet list"
            >
              <FaListUl className="w-4 h-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 hover:bg-[#fbc40c]/20 hover:border-[#fbc40c] border border-transparent rounded-md transition-all ${
                editor.isActive("orderedList") ? "bg-gray-200" : ""
              }`}
              title="Numbered list"
            >
              <FaListOl className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Indent/Outdent */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
            <button
              type="button"
              onClick={() => {
                if (!editor) return;
                // For list items, use the list commands
                if (editor.isActive("listItem")) {
                  editor.chain().focus().liftListItem("listItem").run();
                } else {
                  // For regular text, wrap selection in div with margin-left
                  const { from, to } = editor.state.selection;
                  const selectedHTML = editor.getHTML();
                  
                  // Check if selection is wrapped in a div with margin-left
                  const divMatch = selectedHTML.match(/<div[^>]*style="[^"]*margin-left:\s*(\d+)px[^"]*"[^>]*>([\s\S]*?)<\/div>/);
                  
                  if (divMatch) {
                    // Already wrapped, decrease margin
                    const currentMargin = parseInt(divMatch[1]) || 0;
                    const newMargin = Math.max(0, currentMargin - 40);
                    const content = divMatch[2];
                    
                    if (newMargin === 0) {
                      // Remove wrapper div
                      editor.chain().focus().insertContent(content).run();
                    } else {
                      // Update margin
                      editor.chain().focus().insertContent(`<div style="margin-left: ${newMargin}px;">${content}</div>`).run();
                    }
                  } else {
                    // Not wrapped, wrap current selection
                    const selectedText = editor.state.doc.textBetween(from, to);
                    if (selectedText.trim()) {
                      editor.chain().focus().insertContent(`<div style="margin-left: 0px;">${selectedText}</div>`).run();
                    }
                  }
                }
              }}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Decrease indent"
            >
              <FaOutdent className="w-4 h-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (!editor) return;
                // For list items, use the list commands
                if (editor.isActive("listItem")) {
                  editor.chain().focus().sinkListItem("listItem").run();
                } else {
                  // For regular text, wrap selection in div with margin-left
                  const { from, to } = editor.state.selection;
                  const selectedHTML = editor.getHTML();
                  
                  // Check if selection is wrapped in a div with margin-left
                  const divMatch = selectedHTML.match(/<div[^>]*style="[^"]*margin-left:\s*(\d+)px[^"]*"[^>]*>([\s\S]*?)<\/div>/);
                  
                  if (divMatch) {
                    // Already wrapped, increase margin
                    const currentMargin = parseInt(divMatch[1]) || 0;
                    const newMargin = currentMargin + 40;
                    const content = divMatch[2];
                    editor.chain().focus().insertContent(`<div style="margin-left: ${newMargin}px;">${content}</div>`).run();
                  } else {
                    // Not wrapped, wrap current selection
                    const selectedText = editor.state.doc.textBetween(from, to);
                    if (selectedText.trim()) {
                      editor.chain().focus().insertContent(`<div style="margin-left: 40px;">${selectedText}</div>`).run();
                    } else {
                      // If nothing selected, wrap the current paragraph
                      const $pos = editor.state.doc.resolve(from);
                      const node = $pos.parent;
                      if (node.type.name === "paragraph" || node.type.name === "heading") {
                        const nodeContent = node.textContent || "";
                        const tagName = node.type.name === "heading" ? `h${(node as any).attrs.level || 1}` : "p";
                        editor.chain().focus().insertContent(`<div style="margin-left: 40px;"><${tagName}>${nodeContent}</${tagName}></div>`).run();
                      }
                    }
                  }
                }
              }}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Increase indent"
            >
              <FaIndent className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Subscript/Superscript/Code */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
            <button
              type="button"
              onClick={() => {
                if (editor && !editor.isDestroyed) {
                  try {
                    // Use setSubscript/unsetSubscript directly
                    if (editor.isActive("subscript")) {
                      editor.chain().focus().unsetSubscript().run();
                    } else {
                      // Unset superscript first if active (they're mutually exclusive)
                      if (editor.isActive("superscript")) {
                        editor.chain().focus().unsetSuperscript().run();
                      }
                      editor.chain().focus().setSubscript().run();
                    }
                  } catch (error) {
                    console.error("Error toggling subscript:", error);
                  }
                }
              }}
              className={`p-2 hover:bg-[#fbc40c]/20 hover:border-[#fbc40c] border border-transparent rounded-md transition-all ${
                editor.isActive("subscript") ? "bg-[#fbc40c]/30 border-[#fbc40c]" : ""
              }`}
              title="Subscript (X₁)"
            >
              <FaSubscript className="w-4 h-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (editor && !editor.isDestroyed) {
                  try {
                    // Use setSuperscript/unsetSuperscript directly
                    if (editor.isActive("superscript")) {
                      editor.chain().focus().unsetSuperscript().run();
                    } else {
                      // Unset subscript first if active (they're mutually exclusive)
                      if (editor.isActive("subscript")) {
                        editor.chain().focus().unsetSubscript().run();
                      }
                      editor.chain().focus().setSuperscript().run();
                    }
                  } catch (error) {
                    console.error("Error toggling superscript:", error);
                  }
                }
              }}
              className={`p-2 hover:bg-[#fbc40c]/20 hover:border-[#fbc40c] border border-transparent rounded-md transition-all ${
                editor.isActive("superscript") ? "bg-[#fbc40c]/30 border-[#fbc40c]" : ""
              }`}
              title="Superscript (X²)"
            >
              <FaSuperscript className="w-4 h-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-2 hover:bg-[#fbc40c]/20 hover:border-[#fbc40c] border border-transparent rounded-md transition-all ${
                editor.isActive("code") ? "bg-gray-200" : ""
              }`}
              title="Code"
            >
              <FaCode className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Clear Formatting */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().clearNodes().unsetAllMarks().run();
              }}
              className="p-1.5 hover:bg-red-50 rounded transition-colors"
              title="Clear formatting"
            >
              <FaEraser className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      )}
      <div
        ref={editorRef}
        className="relative border border-gray-200 rounded-b-lg bg-white min-h-[60px]"
        onFocus={(e) => {
          setIsFocused(true);
          if (onFocus) onFocus();
        }}
        onBlur={(e) => {
          // Delay blur to allow clicking on popup
          setTimeout(() => {
            // Check if focus moved to variable suggestions popup or editor content
            const activeElement = document.activeElement;
            const isInPopup = variableSuggestionsRef.current?.contains(activeElement);
            const isInEditor = editorRef.current?.contains(activeElement);
            
            if (!isInPopup && !isInEditor) {
              setIsFocused(false);
              setShowVariableSuggestions(false);
              if (onBlur) onBlur();
            }
          }, 200);
        }}
      >
        <EditorContent editor={editor} />
        
        {/* Variable Suggestions Popup - Only show when editor is focused */}
        {showVariableSuggestions && variableSuggestions.length > 0 && isFocused && (
          <div
            ref={variableSuggestionsRef}
            className="fixed z-[99999] bg-white border-2 border-yellow-400 rounded-lg shadow-2xl max-h-48 overflow-y-auto"
            style={{
              top: `${variablePopupPosition.top}px`,
              left: `${variablePopupPosition.left}px`,
              minWidth: "200px",
              maxWidth: "250px",
              width: "auto",
              position: "fixed",
            }}
          >
            {variableSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.key}
                type="button"
                onClick={() => insertVariable(suggestion)}
                className={`w-full text-left px-2.5 py-1.5 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
                  index === selectedVariableIndex ? "bg-[#fbc40c] text-white" : "bg-white"
                }`}
              >
                <div className={`text-xs font-semibold leading-tight ${index === selectedVariableIndex ? "text-white" : "text-gray-900"}`}>
                  {suggestion.value}
                </div>
                <div className={`text-[10px] leading-tight mt-0.5 ${index === selectedVariableIndex ? "text-yellow-100" : "text-gray-500"}`}>
                  {suggestion.label}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};