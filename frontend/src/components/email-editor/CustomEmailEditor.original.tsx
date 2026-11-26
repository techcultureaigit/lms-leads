"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FaBold,
  FaItalic,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaImage,
  FaLink,
  FaCode,
  FaEye,
  FaUpload,
  FaTimes,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaSpinner,
  FaPlus,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaGripVertical,
  FaColumns,
  FaHeading,
  FaParagraph,
  FaMousePointer,
  FaDesktop,
  FaMobile,
  FaTh,
  FaBars,
  FaFileCode,
  FaBolt,
  FaIcons,
  FaStar,
  FaHeart,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";
import Mustache from "mustache";

// Helper function to format HTML
const formatHTML = (html: string): string => {
  let formatted = html;
  let indent = 0;
  const tab = '  ';
  
  formatted = formatted
    .replace(/></g, '>\n<')
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('</')) {
        indent--;
      }
      const indented = tab.repeat(Math.max(0, indent)) + trimmed;
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
        indent++;
      }
      return indented;
    })
    .join('\n');
  
  return formatted;
};

interface CustomEmailEditorProps {
  onDesignChange?: (design: any) => void;
  onHtmlChange?: (html: string) => void;
  initialDesign?: any;
}

interface EmailBlock {
  id: string;
  type: string;
  props: any;
  content?: string;
}

const CustomEmailEditor: React.FC<CustomEmailEditorProps> = ({
  onDesignChange,
  onHtmlChange,
  initialDesign,
}) => {
  const [blocks, setBlocks] = useState<EmailBlock[]>(
    initialDesign?.blocks || []
  );
  
  // Update blocks when initialDesign changes (for tab switching)
  useEffect(() => {
    if (initialDesign?.blocks && initialDesign.blocks.length > 0) {
      setBlocks(initialDesign.blocks);
    }
  }, [initialDesign]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [htmlCode, setHtmlCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconImageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingIconImage, setUploadingIconImage] = useState(false);
  const [draggedBlockType, setDraggedBlockType] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [rightSidebarTab, setRightSidebarTab] = useState<"content" | "blocks" | "body" | "dev">("content");
  const [devFullScreen, setDevFullScreen] = useState(false);
  
  // General/Global settings (like Advanced Template)
  const [generalSettings, setGeneralSettings] = useState({
    textColor: "#111827",
    backgroundColor: "#ffffff",
    contentWidth: "800",
    contentAlignment: "center" as "left" | "center" | "right",
    fontFamily: "Arial, sans-serif",
    padding: "40px",
    lineHeight: "1.6",
    fontSize: "16px",
    linkColor: "#007bff",
    borderRadius: "8px",
  });

  // Available block types with icons and labels (matching Advanced Template)
  const blockTypes = [
    { type: "columns", label: "Columns", icon: FaColumns, color: "bg-blue-500" },
    { type: "button", label: "Button", icon: FaMousePointer, color: "bg-yellow-500" },
    { type: "divider", label: "Divider", icon: FaLink, color: "bg-gray-500" },
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
    const emailHtml = generateEmailHTML(blocks);
    // Compile with Mustache
    const compiledHtml = Mustache.render(emailHtml, templateVariables);

    setHtmlCode(compiledHtml);
    onHtmlChange?.(compiledHtml);
    onDesignChange?.({ 
      blocks, 
      templateVariables,
      generalSettings,
      editorType: "custom"
    });
  };

  const generateEmailHTML = (blocksList: EmailBlock[]): string => {
    const contentWidth = generalSettings.contentWidth || "500";
    const backgroundColor = generalSettings.backgroundColor || "#ffffff";
    const textColor = generalSettings.textColor || "#111827";
    const fontFamily = generalSettings.fontFamily || "Arial, sans-serif";
    const contentAlignment = generalSettings.contentAlignment || "center";
    
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <style>
    /* Reset styles for email clients */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
    }
    
    /* Main styles */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .email-wrapper {
      background-color: ${backgroundColor};
      padding: 20px 0;
      font-family: ${fontFamily};
    }
    
    .email-container {
      max-width: ${contentWidth}px;
      margin: 0 auto;
      background-color: ${backgroundColor};
      border-radius: ${generalSettings.borderRadius || "8px"};
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .email-content {
      padding: ${generalSettings.padding || "40px 30px"};
      line-height: ${generalSettings.lineHeight || "1.6"};
      color: ${textColor};
      font-family: ${fontFamily};
      font-size: ${generalSettings.fontSize || "16px"};
      text-align: ${contentAlignment};
    }
    
    a {
      color: ${generalSettings.linkColor || "#007bff"};
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    /* Typography - No default text-align, each element sets its own */
    h1, h2, h3, h4, h5, h6 {
      margin: 0 0 20px 0;
      font-weight: bold;
      line-height: 1.3;
      color: ${textColor};
    }
    
    h1 { font-size: 28px; }
    h2 { font-size: 24px; }
    h3 { font-size: 20px; }
    
    p {
      margin: 0 0 16px 0;
      line-height: ${generalSettings.lineHeight || "1.6"};
      color: ${textColor};
      font-size: ${generalSettings.fontSize || "16px"};
    }
    
    p:last-child {
      margin-bottom: 0;
    }
    
    /* Button styles */
    .button-wrapper {
      margin: 24px 0;
    }
    
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #fbc40c;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: ${generalSettings.borderRadius || "6px"};
      font-weight: 600;
      font-size: ${generalSettings.fontSize || "16px"};
      line-height: 1.5;
      transition: background-color 0.3s ease;
    }
    
    .button:hover {
      background-color: #D68108 !important;
      color: #ffffff !important;
    }
    
    .button:active {
      background-color: #c47307 !important;
      color: #ffffff !important;
    }
    
    /* Image styles */
    .image-wrapper {
      text-align: center;
      margin: 24px 0;
    }
    
    .image-wrapper img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
      border-radius: 4px;
    }
    
    /* Social icons - styles are inline now for better control */
    
    /* Divider */
    .divider {
      border-top: 1px solid #e0e0e0;
      margin: 30px 0;
      width: 100%;
    }
    
    /* Columns */
    .columns-wrapper {
      display: table;
      width: 100%;
      margin: 20px 0;
      border-collapse: collapse;
    }
    
    .column {
      display: table-cell;
      padding: 15px;
      vertical-align: top;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-content {
        padding: 30px 20px;
      }
      
      .email-container {
        border-radius: 0;
      }
      
      h1 { font-size: 24px; }
      h2 { font-size: 20px; }
      h3 { font-size: 18px; }
      
      .button {
        padding: 12px 24px;
        font-size: 14px;
      }
      
      .columns-wrapper {
        display: block;
      }
      
      .column {
        display: block;
        width: 100% !important;
        padding: 10px 0;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
  <div class="email-container">
    <div class="email-content">`;

    blocksList.forEach((block) => {
      switch (block.type) {
        case "heading": {
          const headingAlign = (block.props.align !== undefined && block.props.align !== null) 
            ? block.props.align 
            : generalSettings.contentAlignment;
          const headingStyle = {
            fontSize: block.props.style?.fontSize || (block.props.level === 1 ? "28px" : block.props.level === 2 ? "24px" : "20px"),
            fontWeight: block.props.style?.fontWeight || "bold",
            color: block.props.style?.color || generalSettings.textColor || "#333333",
            marginBottom: block.props.style?.marginBottom || "20px",
            marginTop: block.props.style?.marginTop || "0",
            lineHeight: block.props.style?.lineHeight || "1.3",
            textAlign: headingAlign,
            width: "100%",
            ...(block.props.style || {}),
          };
          html += `<h${block.props.level || 1} style="${getStyleString(headingStyle)}">${block.content || "Heading"}</h${block.props.level || 1}>`;
          break;
        }
        case "text": {
          const textAlign = (block.props.align !== undefined && block.props.align !== null) 
            ? block.props.align 
            : generalSettings.contentAlignment;
          const textStyle = {
            fontSize: block.props.style?.fontSize || generalSettings.fontSize || "16px",
            color: block.props.style?.color || generalSettings.textColor || "#000000",
            lineHeight: block.props.style?.lineHeight || generalSettings.lineHeight || "1.6",
            marginBottom: block.props.style?.marginBottom || "16px",
            marginTop: block.props.style?.marginTop || "0",
            textAlign: textAlign,
            width: "100%",
            ...(block.props.style || {}),
          };
          const content = (block.content || "Text").replace(/\n/g, "<br>");
          html += `<p style="${getStyleString(textStyle)}">${content}</p>`;
          break;
        }
        case "button": {
          const buttonAlign = (block.props.align !== undefined && block.props.align !== null) 
            ? block.props.align 
            : generalSettings.contentAlignment;
          const buttonBgColor = block.props.style?.backgroundColor || "#fbc40c";
          const buttonTextColor = block.props.style?.color || "#ffffff";
          const buttonStyle = {
            backgroundColor: buttonBgColor,
            color: buttonTextColor,
            padding: block.props.style?.padding || "14px 32px",
            borderRadius: block.props.style?.borderRadius || generalSettings.borderRadius || "6px",
            fontSize: block.props.style?.fontSize || generalSettings.fontSize || "16px",
            fontWeight: block.props.style?.fontWeight || "600",
            textDecoration: "none",
            display: "inline-block",
            ...(block.props.style || {}),
          };
          html += `<div style="text-align: ${buttonAlign}; width: 100%; margin: 24px 0;">
            <a href="${block.props.href || "#"}" style="${getStyleString(buttonStyle)}">${block.content || "Click Here"}</a>
          </div>`;
          break;
        }
        case "image":
          if (block.props.src) {
            const imageAlign = (block.props.align !== undefined && block.props.align !== null) 
              ? block.props.align 
              : generalSettings.contentAlignment;
            const imageStyle = {
              maxWidth: block.props.width ? `${block.props.width}px` : "100%",
              width: "100%",
              height: "auto",
              display: "inline-block",
              borderRadius: generalSettings.borderRadius || "4px",
              imageRendering: "auto",
              WebkitBackfaceVisibility: "hidden",
              WebkitTransform: "translateZ(0)",
              backfaceVisibility: "hidden",
              transform: "translateZ(0)",
            };
            html += `<div style="text-align: ${imageAlign}; width: 100%; margin: 24px 0;">
              <img src="${block.props.src}" alt="${block.props.alt || ""}" style="${getStyleString(imageStyle)}" />
            </div>`;
          }
          break;
        case "social": {
          const socialIcons = block.props.icons || [
            { name: "facebook", href: "https://www.facebook.com", icon: "facebook" },
            { name: "twitter", href: "https://www.twitter.com", icon: "twitter" },
            { name: "instagram", href: "https://www.instagram.com", icon: "instagram" },
            { name: "linkedin", href: "https://www.linkedin.com", icon: "linkedin" },
          ];
          const iconSize = block.props.iconSize || 32;
          const iconSpacing = block.props.iconSpacing || 12;
          const socialAlign = (block.props.align !== undefined && block.props.align !== null) 
            ? block.props.align 
            : generalSettings.contentAlignment;
          const justifyContent = socialAlign === "left" ? "flex-start" : 
                                socialAlign === "right" ? "flex-end" : "center";
          html += `<div style="display: flex; justify-content: ${justifyContent}; align-items: center; gap: ${iconSpacing}px; padding: 20px 0; margin: 20px 0; width: 100%;">
            ${socialIcons.map((icon: any) => {
              const iconColor = getSocialIconColor(icon.name || icon.icon);
              // Support custom image icons
              const iconImage = icon.image || icon.src || icon.img;
              const iconContent = iconImage 
                ? `<img src="${iconImage}" alt="${icon.name || icon.icon || 'Social Icon'}" style="width: ${iconSize}px; height: ${iconSize}px; display: block; object-fit: contain;" />`
                : `<div style="width: ${iconSize}px; height: ${iconSize}px; display: flex; align-items: center; justify-content: center; color: ${iconColor}; flex-shrink: 0;">${getSocialIconSVG(icon.name || icon.icon)}</div>`;
              return `<a href="${icon.href || "#"}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; text-decoration: none; width: ${iconSize}px; height: ${iconSize}px; transition: opacity 0.2s;">
                ${iconContent}
              </a>`;
            }).join("")}
          </div>`;
          break;
        }
        case "divider": {
          const dividerStyle = {
            borderTop: block.props.style?.borderTop || "1px solid #e0e0e0",
            margin: block.props.style?.margin || "30px 0",
            width: "100%",
            ...(block.props.style || {}),
          };
          html += `<div class="divider" style="${getStyleString(dividerStyle)}"></div>`;
          break;
        }
        case "columns": {
          const columns = block.props.columns || [];
          const totalWidth = columns.reduce((sum: number, col: any) => sum + (col.width || 1), 0);
          html += `<div class="columns-wrapper">
            ${columns.map((col: any, idx: number) => {
              const colWidth = totalWidth > 0 ? `${(col.width || 1) / totalWidth * 100}%` : `${100 / columns.length}%`;
              return `<div class="column" style="width: ${colWidth}; padding: 15px; vertical-align: top;">
                ${col.content || `Column ${idx + 1}`}
              </div>`;
            }).join("")}
          </div>`;
          break;
        }
        case "menu": {
          const menuItems = (block.content || "").split("\n").filter(item => item.trim());
          html += `<div class="menu-wrapper" style="text-align: ${block.props.align || "left"}; padding: 20px 0;">
            ${menuItems.map((item: string) => {
              const parts = item.trim().split("|");
              const text = parts[0] || item.trim();
              const href = parts[1] || "#";
              return `<a href="${href}" style="display: inline-block; margin: 0 15px; color: ${generalSettings.textColor}; text-decoration: none; font-weight: 500;">${text}</a>`;
            }).join("")}
          </div>`;
          break;
        }
        case "icon": {
          const iconSize = block.props.size || 24;
          const iconColor = block.props.color || "#333333";
          const iconType = block.props.iconType || "star";
          const alignStyle = block.props.align === "left" ? "text-align: left;" : 
                            block.props.align === "right" ? "text-align: right;" : 
                            "text-align: center;";
          
           if (block.props.imageSrc) {
             // Custom image icon
             html += `<div style="${alignStyle} padding: 10px 0;">
               <img src="${block.props.imageSrc}" alt="Icon" style="width: ${iconSize}px; height: ${iconSize}px; display: inline-block; object-fit: contain; image-rendering: auto; -webkit-backface-visibility: hidden; -webkit-transform: translateZ(0); backface-visibility: hidden; transform: translateZ(0);" />
             </div>`;
           } else {
            // Emoji/Unicode icon
            let iconHtml = "";
            if (iconType === "star") iconHtml = "⭐";
            else if (iconType === "heart") iconHtml = "❤️";
            else if (iconType === "check") iconHtml = "✓";
            else if (iconType === "info") iconHtml = "ℹ️";
            else if (iconType === "warning") iconHtml = "⚠️";
            else iconHtml = "●";
            html += `<div style="${alignStyle} padding: 10px 0;">
              <span style="font-size: ${iconSize}px; color: ${iconColor}; display: inline-block;">${iconHtml}</span>
            </div>`;
          }
          break;
        }
        case "html": {
          html += block.content || "";
          break;
        }
      }
    });

    html += `
      </div>
    </div>
  </div>
</body>
</html>`;

    return html;
  };

  const getSocialIconColor = (iconName: string): string => {
    const colors: { [key: string]: string } = {
      facebook: "#4267B2",
      twitter: "#1DA1F2",
      instagram: "#E4405F",
      linkedin: "#0077B5",
    };
    return colors[iconName.toLowerCase()] || "#000000";
  };

  const getSocialIconSVG = (iconName: string): string => {
    const icons: { [key: string]: string } = {
      facebook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4267B2" width="100%" height="100%"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
      twitter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1DA1F2" width="100%" height="100%"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>`,
      instagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E4405F" width="100%" height="100%"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
      linkedin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0077B5" width="100%" height="100%"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    };
    return icons[iconName.toLowerCase()] || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000" width="100%" height="100%"><circle cx="12" cy="12" r="10"/></svg>`;
  };

  const getStyleString = (styles: any): string => {
    if (!styles || typeof styles !== 'object') return '';
    
    return Object.entries(styles)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        // Ensure values are properly formatted
        const cssValue = typeof value === 'string' ? value : String(value);
        return `${cssKey}: ${cssValue}`;
      })
      .join('; ');
  };

  const addBlock = (type: string, insertIndex?: number) => {
    const newBlock: EmailBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      props: getDefaultProps(type),
      content: getDefaultContent(type),
    };
    
    if (insertIndex !== undefined) {
      const newBlocks = [...blocks];
      newBlocks.splice(insertIndex, 0, newBlock);
      setBlocks(newBlocks);
    } else {
    setBlocks([...blocks, newBlock]);
    }
    setSelectedBlock(newBlock.id);
  };

  const getDefaultProps = (type: string): any => {
    switch (type) {
      case "heading":
        return {
          level: 1,
          style: {
            fontSize: "24px",
            fontWeight: "bold",
            color: "#333333",
            marginBottom: "16px",
          },
        };
      case "text":
        return {
          style: {
            fontSize: "16px",
            color: "#000000",
            lineHeight: "1.6",
            marginBottom: "16px",
          },
        };
      case "button":
        return {
          href: "#",
          align: "center",
          style: {
            backgroundColor: "#fbc40c",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "4px",
            textDecoration: "none",
            display: "inline-block",
          },
        };
      case "image":
        return {
          src: "",
          alt: "Image",
          width: 600,
          align: "center",
        };
      case "social":
        return {
          icons: [
            { name: "facebook", href: "https://www.facebook.com", icon: "facebook" },
            { name: "twitter", href: "https://www.twitter.com", icon: "twitter" },
            { name: "instagram", href: "https://www.instagram.com", icon: "instagram" },
            { name: "linkedin", href: "https://www.linkedin.com", icon: "linkedin" },
          ],
          align: "center",
          iconSize: 32,
          spacing: 8,
        };
      case "divider":
        return {
          style: {
            borderTop: "1px solid #e0e0e0",
            margin: "20px 0",
          },
        };
      case "columns":
        return {
          columns: [
            { width: 1, content: "Column 1" },
            { width: 1, content: "Column 2" },
          ],
        };
      case "menu":
        return {
          align: "left",
        };
      case "icon":
        return {
          iconType: "star",
          size: 24,
          color: "#fbc40c",
          align: "center",
        };
      case "html":
        return {};
      default:
        return {};
    }
  };

  const getDefaultContent = (type: string): string => {
    switch (type) {
      case "heading":
        return "Your Heading";
      case "text":
        return "Your text content here. Use {{name}} for dynamic content.";
      case "button":
        return "Click Here";
      case "menu":
        return "Home | #\nAbout | #\nContact | #";
      case "html":
        return "<div>Your HTML code here</div>";
      default:
        return "";
    }
  };

  const updateBlock = (id: string, updates: Partial<EmailBlock>) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id));
    if (selectedBlock === id) {
      setSelectedBlock(null);
    }
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = blocks.findIndex((b) => b.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [
      newBlocks[newIndex],
      newBlocks[index],
    ];
    setBlocks(newBlocks);
  };

  // Native HTML5 Drag and Drop handlers
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
        const sourceIndex = blocks.findIndex(b => b.id === draggedBlockId);
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

  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");

  return (
    <>
    <div className="h-full w-full flex flex-col bg-white overflow-hidden relative">
      {/* Top Toolbar - Device Preview Toggle and View Modes */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeviceView("desktop")}
            className={`p-2 rounded transition-colors ${
              deviceView === "desktop"
                ? "bg-gray-100 text-gray-700"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title="Desktop View"
          >
            <FaDesktop className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceView("mobile")}
            className={`p-2 rounded transition-colors ${
              deviceView === "mobile"
                ? "bg-gray-100 text-gray-700"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title="Mobile View"
          >
            <FaMobile className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
        <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-50">
              <div className="h-full flex items-start justify-center">
                <div
                  ref={canvasRef}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!draggedBlockId && draggedBlockType) {
                    handleDrop(e);
                  }
                }}
                className={`bg-white transition-all ${
                  draggedBlockType && !draggedBlockId
                    ? "border-blue-400 border-dashed bg-blue-50"
                    : ""
                }`}
                style={{
                  maxWidth: deviceView === "mobile" ? "375px" : `${generalSettings.contentWidth}px`,
                  width: deviceView === "mobile" ? "375px" : `${generalSettings.contentWidth}px`,
                  margin: "0 auto",
                  backgroundColor: generalSettings.backgroundColor,
                  color: generalSettings.textColor,
                  fontFamily: generalSettings.fontFamily,
                  padding: generalSettings.padding,
                  lineHeight: generalSettings.lineHeight,
                  fontSize: generalSettings.fontSize,
                  minHeight: "100%",
                  height: "100%",
                  borderRadius: generalSettings.borderRadius,
                }}
              >
                {blocks.length === 0 ? (
                    <div className="text-center py-32 text-gray-400">
                      <FaGripVertical className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p className="text-sm mb-1">No content here</p>
                      <p className="text-xs">Drag content from the right panel to start building your email</p>
                  </div>
                ) : (
                    <div>
                      {blocks.map((block, index) => (
                    <div
                      key={block.id}
                        draggable
                        onDragStart={(e) => handleDragStartBlock(e, block.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                      onClick={() => setSelectedBlock(block.id)}
                        className={`group relative border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        selectedBlock === block.id
                            ? "bg-yellow-50 border-l-4 border-l-[#fbc40c]"
                            : ""
                        } ${draggedBlockId === block.id ? "opacity-50" : ""} ${dragOverIndex === index ? "bg-blue-50" : ""}`}
                      >
                        <div className="flex items-start p-2" style={{ width: "100%", overflow: "hidden" }}>
                          <div 
                            className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mr-2 cursor-grab active:cursor-grabbing shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FaGripVertical className="w-4 h-4" />
                          </div>
                          <div 
                            className="flex-1 min-w-0"
                            style={{ 
                              textAlign: (block.props.align !== undefined && block.props.align !== null) 
                                        ? block.props.align 
                                        : generalSettings.contentAlignment,
                              width: "100%",
                              overflow: "hidden"
                            }}
                          >
                          {block.type === "heading" && (
                              <h1 style={{
                                ...(block.props.style || {}),
                                textAlign: (block.props.align !== undefined && block.props.align !== null) 
                                          ? block.props.align 
                                          : generalSettings.contentAlignment,
                                width: "100%",
                                margin: 0
                              }}>
                              {block.content || "Heading"}
                            </h1>
                          )}
                          {block.type === "text" && (
                              <p style={{
                                ...(block.props.style || {}),
                                textAlign: (block.props.align !== undefined && block.props.align !== null) 
                                          ? block.props.align 
                                          : generalSettings.contentAlignment,
                                width: "100%",
                                margin: 0
                              }}>
                              {(block.content || "Text").split("\n").map((line, i) => (
                                <React.Fragment key={i}>
                                  {line}
                                    {i < (block.content || "").split("\n").length - 1 && <br />}
                                </React.Fragment>
                              ))}
                            </p>
                          )}
                          {block.type === "button" && (
                              <div style={{ 
                                textAlign: (block.props.align !== undefined && block.props.align !== null) 
                                          ? block.props.align 
                                          : generalSettings.contentAlignment,
                                width: "100%",
                                margin: 0
                              }}>
                              <a
                                href={block.props.href || "#"}
                                style={{
                                  ...(block.props.style || {}),
                                  color: block.props.style?.color || "#ffffff",
                                  backgroundColor: block.props.style?.backgroundColor || "#fbc40c",
                                    display: "inline-block"
                                  }}
                                  className="px-6 py-3 rounded no-underline transition-opacity hover:opacity-90"
                              >
                                {block.content || "Click Here"}
                              </a>
                            </div>
                          )}
                          {block.type === "image" && block.props.src && (
                              <div style={{ 
                                textAlign: (block.props.align !== undefined && block.props.align !== null) 
                                          ? block.props.align 
                                          : generalSettings.contentAlignment,
                                width: "100%",
                                margin: 0
                              }}>
                              <img
                                src={block.props.src}
                                alt={block.props.alt || ""}
                                  style={{ 
                                    maxWidth: "100%", 
                                    height: "auto", 
                                    display: "inline-block",
                                    imageRendering: "auto" as any,
                                    WebkitBackfaceVisibility: "hidden",
                                    WebkitTransform: "translateZ(0)",
                                    backfaceVisibility: "hidden",
                                    transform: "translateZ(0)",
                                    willChange: "transform"
                                  } as React.CSSProperties}
                                  className="select-none"
                              />
                            </div>
                          )}
                            {block.type === "social" && (
                              <div 
                                className="flex items-center py-2"
                                style={{ 
                                  justifyContent: (block.props.align !== undefined && block.props.align !== null)
                                                 ? (block.props.align === "left" ? "flex-start" : 
                                                    block.props.align === "right" ? "flex-end" : "center")
                                                 : (generalSettings.contentAlignment === "left" ? "flex-start" :
                                                    generalSettings.contentAlignment === "right" ? "flex-end" : "center"),
                                  gap: `${block.props.iconSpacing || 12}px`,
                                  width: "100%",
                                  margin: 0
                                }}
                              >
                                {(block.props.icons || []).map((icon: any, idx: number) => {
                                  const IconComponent = icon.name === "facebook" ? FaFacebook :
                                                       icon.name === "twitter" ? FaTwitter :
                                                       icon.name === "instagram" ? FaInstagram :
                                                       icon.name === "linkedin" ? FaLinkedin : FaFacebook;
                                  const iconSize = block.props.iconSize || 32;
                                  return (
                                    <a
                                      key={idx}
                                      href={icon.href || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:opacity-80 transition-opacity"
                                      style={{ 
                                        color: getSocialIconColor(icon.name || icon.icon),
                                        fontSize: `${iconSize}px`,
                                        width: `${iconSize}px`,
                                        height: `${iconSize}px`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                      }}
                                    >
                                      <IconComponent />
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          {block.type === "divider" && (
                            <hr style={block.props.style || {}} />
                          )}
                            {block.type === "columns" && (
                              <div className="flex gap-2" style={{ width: "100%", margin: 0 }}>
                                {(block.props.columns || []).map((col: any, idx: number) => (
                                  <div 
                                    key={idx} 
                                    className="flex-1 p-2 border border-gray-200 rounded"
                                    style={{
                                      textAlign: generalSettings.contentAlignment,
                                      margin: 0
                                    }}
                                  >
                                    {col.content || `Column ${idx + 1}`}
                        </div>
                                ))}
                              </div>
                            )}
                            {block.type === "menu" && (
                              <div style={{ 
                                textAlign: (block.props.align !== undefined && block.props.align !== null) 
                                          ? block.props.align 
                                          : generalSettings.contentAlignment,
                                width: "100%",
                                margin: 0
                              }} className="py-2">
                                {(block.content || "").split("\n").filter(item => item.trim()).map((item: string, idx: number) => {
                                  const parts = item.trim().split("|");
                                  const text = parts[0] || item.trim();
                                  const href = parts[1] || "#";
                                  return (
                                    <a
                                      key={idx}
                                      href={href}
                                      className="inline-block mr-4 text-gray-700 hover:text-[#fbc40c] transition-colors"
                                    >
                                      {text}
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                            {block.type === "icon" && (
                              <div style={{ 
                                textAlign: (block.props.align !== undefined && block.props.align !== null) 
                                          ? block.props.align 
                                          : generalSettings.contentAlignment,
                                width: "100%",
                                margin: 0
                              }}>
                                {block.props.imageSrc ? (
                                  <img 
                                    src={block.props.imageSrc} 
                                    alt="Icon" 
                                    style={{ 
                                      width: `${block.props.size || 24}px`, 
                                      height: `${block.props.size || 24}px`,
                                      display: "inline-block",
                                      objectFit: "contain",
                                      imageRendering: "auto" as any,
                                      WebkitBackfaceVisibility: "hidden",
                                      WebkitTransform: "translateZ(0)",
                                      backfaceVisibility: "hidden",
                                      transform: "translateZ(0)"
                                    } as React.CSSProperties} 
                                    className="select-none"
                                  />
                                ) : (
                                  <>
                                    {block.props.iconType === "star" && <FaStar style={{ fontSize: `${block.props.size || 24}px`, color: block.props.color || "#fbc40c", display: "inline-block" }} />}
                                    {block.props.iconType === "heart" && <FaHeart style={{ fontSize: `${block.props.size || 24}px`, color: block.props.color || "#e74c3c", display: "inline-block" }} />}
                                    {block.props.iconType === "check" && <FaCheckCircle style={{ fontSize: `${block.props.size || 24}px`, color: block.props.color || "#27ae60", display: "inline-block" }} />}
                                    {block.props.iconType === "info" && <FaInfoCircle style={{ fontSize: `${block.props.size || 24}px`, color: block.props.color || "#3498db", display: "inline-block" }} />}
                                    {block.props.iconType === "warning" && <FaExclamationCircle style={{ fontSize: `${block.props.size || 24}px`, color: block.props.color || "#f39c12", display: "inline-block" }} />}
                                    {!block.props.iconType && <FaIcons style={{ fontSize: `${block.props.size || 24}px`, color: block.props.color || "#333333", display: "inline-block" }} />}
                                  </>
                                )}
                              </div>
                            )}
                            {block.type === "html" && (
                              <div
                                dangerouslySetInnerHTML={{ __html: block.content || "" }}
                                className="p-2 bg-gray-50 rounded border border-gray-200"
                              />
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBlock(block.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                            title="Delete"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Matching Advanced Template Layout */}
            <div className="w-64 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
              {/* Tab Navigation - Vertical Tabs on Right Edge */}
              <div className="flex flex-col border-r border-gray-200 bg-gray-50 shrink-0">
                          <button
                  onClick={() => setRightSidebarTab("content")}
                  className={`p-3 border-b border-gray-200 transition-colors ${
                    rightSidebarTab === "content"
                      ? "bg-white text-[#fbc40c] border-r-2 border-r-[#fbc40c]"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Content"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-current rounded"></div>
                    </div>
                    <span className="text-xs">Content</span>
                  </div>
                </button>
                <button
                  onClick={() => setRightSidebarTab("blocks")}
                  className={`p-3 border-b border-gray-200 transition-colors ${
                    rightSidebarTab === "blocks"
                      ? "bg-white text-[#fbc40c] border-r-2 border-r-[#fbc40c]"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Blocks"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                        <div className="bg-current"></div>
                        <div className="bg-current"></div>
                        <div className="bg-current"></div>
                        <div className="bg-current"></div>
                      </div>
                    </div>
                    <span className="text-xs">Blocks</span>
                  </div>
                </button>
                <button
                  onClick={() => setRightSidebarTab("body")}
                  className={`p-3 border-b border-gray-200 transition-colors ${
                    rightSidebarTab === "body"
                      ? "bg-white text-[#fbc40c] border-r-2 border-r-[#fbc40c]"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Body"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <FaParagraph className="w-4 h-4" />
                    </div>
                    <span className="text-xs">Body</span>
                  </div>
                </button>
                <button
                  onClick={() => setRightSidebarTab("dev")}
                  className={`p-3 transition-colors ${
                    rightSidebarTab === "dev"
                      ? "bg-white text-[#fbc40c] border-r-2 border-r-[#fbc40c]"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Dev"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <FaCode className="w-4 h-4" />
                    </div>
                    <span className="text-xs">Dev</span>
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {rightSidebarTab === "content" && (
                  <>
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-3 z-10">
                      <h3 className="text-xs font-semibold text-gray-700 uppercase">Content</h3>
                    </div>
                    {/* Icon Grid Layout - Matching Advanced Template */}
                    <div className="p-3 grid grid-cols-2 gap-2">
                      {blockTypes.map((blockType) => {
                        const IconComponent = blockType.icon;
                        return (
                          <div
                            key={blockType.type}
                            draggable
                            onDragStart={(e) => handleDragStart(e, blockType.type)}
                            onDragEnd={handleDragEnd}
                            onClick={() => addBlock(blockType.type)}
                            className={`group p-3 bg-white border border-gray-200 rounded cursor-pointer hover:border-[#fbc40c] hover:shadow-sm transition-all ${
                              draggedBlockType === blockType.type
                                ? "border-[#fbc40c] opacity-50"
                                : ""
                            }`}
                            title={blockType.label}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className={`${blockType.color} p-2 rounded text-white`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <span className="text-xs text-gray-600 text-center">{blockType.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Variables Info */}
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                      <p className="text-xs text-gray-600 mb-2">Variables:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.keys(templateVariables).map((key) => (
                          <span key={key} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-700">
                            {templateVariables[key as keyof typeof templateVariables]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {rightSidebarTab === "blocks" && (
                  <>
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-3 z-10">
                      <h3 className="text-xs font-semibold text-gray-700 uppercase">Blocks</h3>
                    </div>
                    <div className="p-3 space-y-3">
                      {/* Row Layouts - Like Unlayer */}
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">Row Layouts</p>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <button
                            onClick={() => {
                              addBlock("columns");
                              const lastBlock = blocks[blocks.length - 1];
                              if (lastBlock) {
                                updateBlock(lastBlock.id, {
                                  props: {
                                    columns: [
                                      { width: 1, content: "Column 1" }
                                    ]
                                  }
                                });
                              }
                            }}
                            className="p-2 border border-gray-200 rounded hover:bg-gray-50 hover:border-[#fbc40c] transition-all"
                            title="1 Column"
                          >
                            <div className="w-full h-8 bg-gray-100 rounded mb-1"></div>
                            <div className="text-xs text-gray-600 text-center">1 Column</div>
                          </button>
                          <button
                            onClick={() => {
                              addBlock("columns");
                              const lastBlock = blocks[blocks.length - 1];
                              if (lastBlock) {
                                updateBlock(lastBlock.id, {
                                  props: {
                                    columns: [
                                      { width: 1, content: "Column 1" },
                                      { width: 1, content: "Column 2" }
                                    ]
                                  }
                                });
                              }
                            }}
                            className="p-2 border border-gray-200 rounded hover:bg-gray-50 hover:border-[#fbc40c] transition-all"
                            title="2 Columns"
                          >
                            <div className="w-full h-8 flex gap-1 mb-1">
                              <div className="flex-1 bg-gray-100 rounded"></div>
                              <div className="flex-1 bg-gray-100 rounded"></div>
                            </div>
                            <div className="text-xs text-gray-600 text-center">2 Columns</div>
                          </button>
                          <button
                            onClick={() => {
                              addBlock("columns");
                              const lastBlock = blocks[blocks.length - 1];
                              if (lastBlock) {
                                updateBlock(lastBlock.id, {
                                  props: {
                                    columns: [
                                      { width: 1, content: "Column 1" },
                                      { width: 1, content: "Column 2" },
                                      { width: 1, content: "Column 3" }
                                    ]
                                  }
                                });
                              }
                            }}
                            className="p-2 border border-gray-200 rounded hover:bg-gray-50 hover:border-[#fbc40c] transition-all"
                            title="3 Columns"
                          >
                            <div className="w-full h-8 flex gap-1 mb-1">
                              <div className="flex-1 bg-gray-100 rounded"></div>
                              <div className="flex-1 bg-gray-100 rounded"></div>
                              <div className="flex-1 bg-gray-100 rounded"></div>
                        </div>
                            <div className="text-xs text-gray-600 text-center">3 Columns</div>
                          </button>
                          <button
                            onClick={() => {
                              addBlock("columns");
                              const lastBlock = blocks[blocks.length - 1];
                              if (lastBlock) {
                                updateBlock(lastBlock.id, {
                                  props: {
                                    columns: [
                                      { width: 1, content: "Column 1" },
                                      { width: 1, content: "Column 2" },
                                      { width: 1, content: "Column 3" },
                                      { width: 1, content: "Column 4" }
                                    ]
                                  }
                                });
                              }
                            }}
                            className="p-2 border border-gray-200 rounded hover:bg-gray-50 hover:border-[#fbc40c] transition-all"
                            title="4 Columns"
                          >
                            <div className="w-full h-8 flex gap-1 mb-1">
                              <div className="flex-1 bg-gray-100 rounded"></div>
                              <div className="flex-1 bg-gray-100 rounded"></div>
                              <div className="flex-1 bg-gray-100 rounded"></div>
                              <div className="flex-1 bg-gray-100 rounded"></div>
                      </div>
                            <div className="text-xs text-gray-600 text-center">4 Columns</div>
                          </button>
                    </div>
                      </div>
                      {/* Block Templates/Presets */}
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">Templates</p>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              addBlock("heading");
                              setTimeout(() => {
                                const lastBlock = blocks[blocks.length - 1];
                                if (lastBlock) {
                                  updateBlock(lastBlock.id, { content: "Welcome!", props: { level: 1 } });
                                }
                              }, 100);
                              setTimeout(() => {
                                addBlock("text");
                                const lastBlock = blocks[blocks.length - 1];
                                if (lastBlock) {
                                  updateBlock(lastBlock.id, { content: "Thank you for joining us!" });
                                }
                              }, 200);
                              setTimeout(() => {
                                addBlock("button");
                                const lastBlock = blocks[blocks.length - 1];
                                if (lastBlock) {
                                  updateBlock(lastBlock.id, { content: "Get Started", props: { href: "#" } });
                                }
                              }, 300);
                            }}
                            className="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 hover:border-[#fbc40c] transition-all"
                          >
                            <div className="text-sm font-medium text-gray-700">Welcome Email</div>
                            <div className="text-xs text-gray-500 mt-1">Heading + Text + Button</div>
                          </button>
                          <button
                            onClick={() => {
                              addBlock("heading");
                              setTimeout(() => {
                                const lastBlock = blocks[blocks.length - 1];
                                if (lastBlock) {
                                  updateBlock(lastBlock.id, { content: "Newsletter", props: { level: 1 } });
                                }
                              }, 100);
                              setTimeout(() => {
                                addBlock("columns");
                                const lastBlock = blocks[blocks.length - 1];
                                if (lastBlock) {
                                  updateBlock(lastBlock.id, {
                                    props: {
                                      columns: [
                                        { width: 1, content: "Column 1 content" },
                                        { width: 1, content: "Column 2 content" }
                                      ]
                                    }
                                  });
                                }
                              }, 200);
                            }}
                            className="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 hover:border-[#fbc40c] transition-all"
                          >
                            <div className="text-sm font-medium text-gray-700">Two Column Layout</div>
                            <div className="text-xs text-gray-500 mt-1">Heading + 2 Columns</div>
                          </button>
                          <button
                            onClick={() => {
                              addBlock("heading");
                              setTimeout(() => {
                                const lastBlock = blocks[blocks.length - 1];
                                if (lastBlock) {
                                  updateBlock(lastBlock.id, { content: "Promotion", props: { level: 1 } });
                                }
                              }, 100);
                              setTimeout(() => {
                                addBlock("text");
                                const lastBlock = blocks[blocks.length - 1];
                                if (lastBlock) {
                                  updateBlock(lastBlock.id, { content: "Check out our latest offers!" });
                                }
                              }, 200);
                              setTimeout(() => {
                                addBlock("image");
                              }, 300);
                              setTimeout(() => {
                                addBlock("button");
                                const lastBlock = blocks[blocks.length - 1];
                                if (lastBlock) {
                                  updateBlock(lastBlock.id, { content: "Shop Now", props: { href: "#" } });
                                }
                              }, 400);
                            }}
                            className="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 hover:border-[#fbc40c] transition-all"
                          >
                            <div className="text-sm font-medium text-gray-700">Promotional</div>
                            <div className="text-xs text-gray-500 mt-1">Heading + Text + Image + Button</div>
                          </button>
                          <button
                            onClick={() => {
                              addBlock("heading");
                              setTimeout(() => {
                                const lastBlock = blocks[blocks.length - 1];
                                if (lastBlock) {
                                  updateBlock(lastBlock.id, { content: "Newsletter", props: { level: 1 } });
                                }
                              }, 100);
                              setTimeout(() => {
                                addBlock("text");
                                const lastBlock = blocks[blocks.length - 1];
                                if (lastBlock) {
                                  updateBlock(lastBlock.id, { content: "Stay updated with our latest news and updates." });
                                }
                              }, 200);
                              setTimeout(() => {
                                addBlock("social");
                                const lastBlock = blocks[blocks.length - 1];
                                if (lastBlock) {
                                  updateBlock(lastBlock.id, {
                                    props: {
                                      ...lastBlock.props,
                                      icons: [
                                        { name: "facebook", href: "#" },
                                        { name: "twitter", href: "#" },
                                        { name: "instagram", href: "#" },
                                        { name: "linkedin", href: "#" }
                                      ]
                                    }
                                  });
                                }
                              }, 300);
                            }}
                            className="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 hover:border-[#fbc40c] transition-all"
                          >
                            <div className="text-sm font-medium text-gray-700">Newsletter</div>
                            <div className="text-xs text-gray-500 mt-1">Heading + Text + Social Icons</div>
                          </button>
                          <button
                            onClick={() => {
                              addBlock("menu");
                              setTimeout(() => {
                                const lastBlock = blocks[blocks.length - 1];
                                if (lastBlock) {
                                  updateBlock(lastBlock.id, { content: "Home|#\nAbout|#\nServices|#\nContact|#" });
                                }
                              }, 100);
                              setTimeout(() => {
                                addBlock("heading");
                                const lastBlock = blocks[blocks.length - 1];
                                if (lastBlock) {
                                  updateBlock(lastBlock.id, { content: "Welcome", props: { level: 1 } });
                                }
                              }, 200);
                              setTimeout(() => {
                                addBlock("text");
                                const lastBlock = blocks[blocks.length - 1];
                                if (lastBlock) {
                                  updateBlock(lastBlock.id, { content: "Thank you for visiting our website." });
                                }
                              }, 300);
                            }}
                            className="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 hover:border-[#fbc40c] transition-all"
                          >
                            <div className="text-sm font-medium text-gray-700">Header Layout</div>
                            <div className="text-xs text-gray-500 mt-1">Menu + Heading + Text</div>
                          </button>
                          <button
                            onClick={() => {
                              addBlock("heading");
                              setTimeout(() => {
                                const lastBlock = blocks[blocks.length - 1];
                                if (lastBlock) {
                                  updateBlock(lastBlock.id, { content: "Features", props: { level: 1 } });
                                }
                              }, 100);
                              setTimeout(() => {
                                addBlock("columns");
                                const lastBlock = blocks[blocks.length - 1];
                                if (lastBlock) {
                                  updateBlock(lastBlock.id, {
                                    props: {
                                      columns: [
                                        { width: 1, content: "Feature 1\nDescription here" },
                                        { width: 1, content: "Feature 2\nDescription here" },
                                        { width: 1, content: "Feature 3\nDescription here" }
                                      ]
                                    }
                                  });
                                }
                              }, 200);
                            }}
                            className="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 hover:border-[#fbc40c] transition-all"
                          >
                            <div className="text-sm font-medium text-gray-700">Three Column</div>
                            <div className="text-xs text-gray-500 mt-1">Heading + 3 Columns</div>
                          </button>
                        </div>
                      </div>
                      {/* Quick Actions */}
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">Quick Actions</p>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              const newBlocks = blocks.map(block => ({ ...block }));
                              setBlocks(newBlocks);
                            }}
                            className="w-full p-2 text-left border border-gray-200 rounded hover:bg-gray-50 hover:border-[#fbc40c] transition-all text-xs"
                          >
                            Duplicate All Blocks
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to clear all blocks?")) {
                                setBlocks([]);
                                setSelectedBlock(null);
                              }
                            }}
                            className="w-full p-2 text-left border border-red-200 rounded hover:bg-red-50 hover:border-red-400 transition-all text-xs text-red-600"
                          >
                            Clear All Blocks
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {rightSidebarTab === "body" && (
                  <>
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-3 z-10">
                      <h3 className="text-xs font-semibold text-gray-700 uppercase">Body Settings</h3>
              </div>
                    <div className="p-3 space-y-4">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Background Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={generalSettings.backgroundColor}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, backgroundColor: e.target.value })}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={generalSettings.backgroundColor}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, backgroundColor: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Text Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={generalSettings.textColor}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, textColor: e.target.value })}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={generalSettings.textColor}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, textColor: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Content Width</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setGeneralSettings({ ...generalSettings, contentWidth: String(Math.max(300, parseInt(generalSettings.contentWidth) - 50)) })}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={generalSettings.contentWidth}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, contentWidth: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded text-sm text-center"
                          />
                          <span className="text-xs text-gray-500">px</span>
                          <button
                            onClick={() => setGeneralSettings({ ...generalSettings, contentWidth: String(Math.min(2000, parseInt(generalSettings.contentWidth) + 50)) })}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Content Alignment</label>
                        <div className="flex gap-2">
                          {(["left", "center", "right"] as const).map((align) => (
                            <button
                              key={align}
                              onClick={() => setGeneralSettings({ ...generalSettings, contentAlignment: align })}
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
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Font Family</label>
                        <select
                          value={generalSettings.fontFamily}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, fontFamily: e.target.value })}
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
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Padding</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const currentPadding = parseInt(generalSettings.padding) || 40;
                              setGeneralSettings({ ...generalSettings, padding: String(Math.max(0, currentPadding - 10)) + "px" });
                            }}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={generalSettings.padding}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, padding: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded text-sm text-center"
                          />
                          <button
                            onClick={() => {
                              const currentPadding = parseInt(generalSettings.padding) || 40;
                              setGeneralSettings({ ...generalSettings, padding: String(currentPadding + 10) + "px" });
                            }}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Line Height</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const currentLineHeight = parseFloat(generalSettings.lineHeight) || 1.6;
                              setGeneralSettings({ ...generalSettings, lineHeight: String(Math.max(0.5, currentLineHeight - 0.1).toFixed(1)) });
                            }}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            step="0.1"
                            value={generalSettings.lineHeight}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, lineHeight: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded text-sm text-center"
                          />
                          <button
                            onClick={() => {
                              const currentLineHeight = parseFloat(generalSettings.lineHeight) || 1.6;
                              setGeneralSettings({ ...generalSettings, lineHeight: String((currentLineHeight + 0.1).toFixed(1)) });
                            }}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Font Size</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const currentSize = parseInt(generalSettings.fontSize) || 16;
                              setGeneralSettings({ ...generalSettings, fontSize: String(Math.max(10, currentSize - 2)) + "px" });
                            }}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={generalSettings.fontSize}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, fontSize: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded text-sm text-center"
                          />
                          <button
                            onClick={() => {
                              const currentSize = parseInt(generalSettings.fontSize) || 16;
                              setGeneralSettings({ ...generalSettings, fontSize: String(currentSize + 2) + "px" });
                            }}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Link Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={generalSettings.linkColor}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, linkColor: e.target.value })}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={generalSettings.linkColor}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, linkColor: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Border Radius</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const currentRadius = parseInt(generalSettings.borderRadius) || 8;
                              setGeneralSettings({ ...generalSettings, borderRadius: String(Math.max(0, currentRadius - 2)) + "px" });
                            }}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={generalSettings.borderRadius}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, borderRadius: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded text-sm text-center"
                          />
                          <button
                            onClick={() => {
                              const currentRadius = parseInt(generalSettings.borderRadius) || 8;
                              setGeneralSettings({ ...generalSettings, borderRadius: String(currentRadius + 2) + "px" });
                            }}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {rightSidebarTab === "dev" && (
                  <>
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-3 z-10 flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-gray-700 uppercase">Dev Tools</h3>
                      <button
                        onClick={() => setDevFullScreen(!devFullScreen)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title={devFullScreen ? "Exit Full Screen" : "Full Screen"}
                      >
                        {devFullScreen ? (
                          <FaTimes className="w-4 h-4 text-gray-600" />
                        ) : (
                          <FaDesktop className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                    {devFullScreen ? (
                      <div className="fixed inset-0 z-50 bg-white flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                          <h2 className="text-lg font-semibold text-gray-800">HTML Code Editor - Full Screen</h2>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                try {
                                  const formatted = formatHTML(htmlCode);
                                  setHtmlCode(formatted);
                                  onHtmlChange?.(formatted);
                                } catch (e) {
                                  alert("Error formatting HTML");
                                }
                              }}
                              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center gap-2"
                            >
                              <FaCode className="w-4 h-4" /> Format
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(htmlCode);
                                alert("HTML copied to clipboard!");
                              }}
                              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors flex items-center gap-2"
                            >
                              <FaFileCode className="w-4 h-4" /> Copy
                            </button>
                            <button
                              onClick={() => {
                                try {
                                  const minified = htmlCode
                                    .replace(/\s+/g, " ")
                                    .replace(/>\s+</g, "><")
                                    .trim();
                                  setHtmlCode(minified);
                                  onHtmlChange?.(minified);
                                } catch (e) {
                                  alert("Error minifying HTML");
                                }
                              }}
                              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
                            >
                              Minify
                            </button>
                            <button
                              onClick={() => setDevFullScreen(false)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors flex items-center gap-2"
                            >
                              <FaTimes className="w-4 h-4" /> Exit Full Screen
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 flex overflow-hidden">
                          <div className="flex-1 flex flex-col border-r border-gray-200">
                            <div className="p-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                              <label className="text-sm font-medium text-gray-700">HTML Code Editor</label>
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span>Lines: {htmlCode.split("\n").length}</span>
                                <span>Characters: {htmlCode.length}</span>
                                <span>Words: {htmlCode.split(/\s+/).filter(w => w.length > 0).length}</span>
                              </div>
                            </div>
                            <textarea
                              value={htmlCode}
                              onChange={(e) => {
                                setHtmlCode(e.target.value);
                                onHtmlChange?.(e.target.value);
                              }}
                              className="flex-1 w-full p-4 border-0 font-mono text-sm bg-gray-900 text-green-400 focus:outline-none resize-none"
                              style={{ 
                                fontFamily: "'Courier New', monospace",
                                lineHeight: "1.6",
                                tabSize: 2
                              }}
                              placeholder="Edit HTML code directly..."
                              spellCheck={false}
                            />
                          </div>
                          <div className="w-1/2 flex flex-col border-l border-gray-200">
                            <div className="p-2 bg-gray-100 border-b border-gray-200">
                              <label className="text-sm font-medium text-gray-700">Live Preview</label>
                            </div>
                            <div className="flex-1 overflow-auto p-4 bg-white">
                              <div
                                className="w-full"
                                dangerouslySetInnerHTML={{ __html: htmlCode }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">HTML Code</label>
                          <textarea
                            value={htmlCode}
                            onChange={(e) => {
                              setHtmlCode(e.target.value);
                              onHtmlChange?.(e.target.value);
                            }}
                            className="w-full p-3 border border-gray-300 rounded text-sm font-mono bg-gray-900 text-green-400 focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                            style={{ 
                              fontFamily: "'Courier New', monospace",
                              minHeight: "400px",
                              lineHeight: "1.6",
                              tabSize: 2
                            }}
                            rows={20}
                            placeholder="Edit HTML code directly..."
                            spellCheck={false}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              try {
                                const formatted = formatHTML(htmlCode);
                                setHtmlCode(formatted);
                                onHtmlChange?.(formatted);
                              } catch (e) {
                                alert("Error formatting HTML");
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors flex items-center justify-center gap-2"
                          >
                            <FaCode className="w-4 h-4" /> Format
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(htmlCode);
                              alert("HTML copied to clipboard!");
                            }}
                            className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors flex items-center justify-center gap-2"
                          >
                            <FaFileCode className="w-4 h-4" /> Copy
                          </button>
                          <button
                            onClick={() => {
                              try {
                                const minified = htmlCode
                                  .replace(/\s+/g, " ")
                                  .replace(/>\s+</g, "><")
                                  .trim();
                                setHtmlCode(minified);
                                onHtmlChange?.(minified);
                              } catch (e) {
                                alert("Error minifying HTML");
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm transition-colors"
                          >
                            Minify
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Live Preview</label>
                          <div className="border border-gray-300 rounded p-4 bg-white max-h-96 overflow-auto">
                            <div
                              className="w-full"
                              dangerouslySetInnerHTML={{ __html: htmlCode }}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">HTML Statistics</label>
                          <div className="border border-gray-300 rounded p-3 bg-gray-50 text-sm space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">Lines:</span>
                              <span className="text-gray-700">{htmlCode.split("\n").length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Characters:</span>
                              <span className="text-gray-700">{htmlCode.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Words:</span>
                              <span className="text-gray-700">{htmlCode.split(/\s+/).filter(w => w.length > 0).length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Size:</span>
                              <span className="text-gray-700">{(htmlCode.length / 1024).toFixed(2)} KB</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Import from HTML</label>
                          <textarea
                            placeholder="Paste HTML code here and it will replace the current code..."
                            className="w-full p-3 border border-gray-300 rounded text-sm font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                            rows={6}
                            onPaste={(e) => {
                              const pastedText = e.clipboardData.getData("text");
                              setHtmlCode(pastedText);
                              onHtmlChange?.(pastedText);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
          </div>

            {/* Properties Panel - General Settings (Always Visible) */}
            <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-3 z-10 flex items-center gap-2">
                <FaEye className="w-4 h-4 text-gray-600" />
                <FaGripVertical className="w-4 h-4 text-gray-600" />
                <h3 className="text-xs font-semibold text-gray-700 uppercase">General</h3>
              </div>
              <div className="p-4 space-y-4">
                {/* Text Color */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={generalSettings.textColor}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, textColor: e.target.value })}
                      className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={generalSettings.textColor}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, textColor: e.target.value })}
                      className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>

                {/* Background Color */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={generalSettings.backgroundColor}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, backgroundColor: e.target.value })}
                      className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={generalSettings.backgroundColor}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, backgroundColor: e.target.value })}
                      className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>

                {/* Content Width */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Content Width</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGeneralSettings({ ...generalSettings, contentWidth: String(Math.max(300, parseInt(generalSettings.contentWidth) - 50)) })}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={generalSettings.contentWidth}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, contentWidth: e.target.value })}
                      className="flex-1 p-2 border border-gray-300 rounded text-sm text-center"
                    />
                    <span className="text-xs text-gray-500">px</span>
                    <button
                      onClick={() => setGeneralSettings({ ...generalSettings, contentWidth: String(Math.min(2000, parseInt(generalSettings.contentWidth) + 50)) })}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
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
                        onClick={() => setGeneralSettings({ ...generalSettings, contentAlignment: align })}
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
                          onChange={(e) => setGeneralSettings({ ...generalSettings, fontFamily: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                        >
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="Helvetica, sans-serif">Helvetica</option>
                          <option value="Georgia, serif">Georgia</option>
                          <option value="Times New Roman, serif">Times New Roman</option>
                          <option value="Courier New, monospace">Courier New</option>
                          <option value="Verdana, sans-serif">Verdana</option>
                          <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                          <option value="Impact, sans-serif">Impact</option>
                        </select>
                      </div>

                      {/* Padding */}
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Padding</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={generalSettings.padding}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, padding: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                            placeholder="40px"
                          />
                        </div>
                      </div>

                      {/* Line Height */}
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Line Height</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={generalSettings.lineHeight}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, lineHeight: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                            placeholder="1.6"
                          />
                        </div>
                      </div>

                      {/* Font Size */}
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Font Size</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={generalSettings.fontSize}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, fontSize: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                            placeholder="16px"
                          />
                        </div>
                      </div>

                      {/* Link Color */}
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Link Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={generalSettings.linkColor}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, linkColor: e.target.value })}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={generalSettings.linkColor}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, linkColor: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                          />
                        </div>
                      </div>

                      {/* Border Radius */}
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Border Radius</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={generalSettings.borderRadius}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, borderRadius: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                            placeholder="8px"
                          />
                        </div>
                      </div>
                    </div>

              {/* Block Properties Panel (When Block Selected) */}
              {selectedBlockData && (
                <div className="border-t border-gray-200">
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-3 z-10">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase">Block Properties</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                  {selectedBlockData.type === "text" ||
                  selectedBlockData.type === "heading" ? (
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
                    {selectedBlockData.type === "heading" && (
                      <div>
                          <label className="block text-xs font-medium mb-1 text-gray-700">Heading Level</label>
                        <select
                            value={selectedBlockData?.props?.level ?? 1}
                          onChange={(e) =>
                            updateBlock(selectedBlockData.id, {
                              props: {
                                ...selectedBlockData.props,
                                level: parseInt(e.target.value),
                              },
                            })
                          }
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                        >
                          <option value={1}>H1</option>
                          <option value={2}>H2</option>
                          <option value={3}>H3</option>
                        </select>
                      </div>
                    )}
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Font Size</label>
                      <input
                        type="text"
                          value={selectedBlockData.props?.style?.fontSize ?? ""}
                        onChange={(e) =>
                          updateBlock(selectedBlockData.id, {
                            props: {
                              ...selectedBlockData.props,
                              style: {
                                ...selectedBlockData.props.style,
                                fontSize: e.target.value,
                              },
                            },
                          })
                        }
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                        placeholder="16px"
                      />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Color</label>
                      <input
                        type="color"
                          value={selectedBlockData?.props?.style?.color ?? "#333333"}
                        onChange={(e) =>
                          updateBlock(selectedBlockData.id, {
                            props: {
                              ...selectedBlockData.props,
                              style: {
                                ...selectedBlockData.props.style,
                                color: e.target.value,
                              },
                            },
                          })
                        }
                          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Alignment</label>
                        <div className="flex gap-2">
                          {["left", "center", "right"].map((align) => (
                            <button
                              key={align}
                              onClick={() =>
                                updateBlock(selectedBlockData.id, {
                                  props: {
                                    ...selectedBlockData.props,
                                    align,
                                  },
                                })
                              }
                              className={`flex-1 p-2 border rounded transition-colors ${
                                (selectedBlockData.props.align === align) || 
                                (selectedBlockData.props.align === undefined && generalSettings.contentAlignment === align)
                                  ? "bg-[#fbc40c] text-white border-[#fbc40c]"
                                  : "bg-white border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {align === "left" && <FaAlignLeft />}
                              {align === "center" && <FaAlignCenter />}
                              {align === "right" && <FaAlignRight />}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedBlockData.props.align !== undefined && selectedBlockData.props.align !== null 
                            ? "Individual alignment set" 
                            : "Using general alignment"}
                        </p>
                      </div>
                  </>
                ) : selectedBlockData.type === "button" ? (
                  <>
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Button Text</label>
                      <input
                        type="text"
                          value={selectedBlockData?.content ?? ""}
                        onChange={(e) =>
                          updateBlock(selectedBlockData.id, {
                            content: e.target.value,
                          })
                        }
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                          placeholder="Click Here"
                      />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Link URL</label>
                      <input
                        type="text"
                          value={selectedBlockData?.props?.href ?? ""}
                        onChange={(e) =>
                          updateBlock(selectedBlockData.id, {
                            props: {
                              ...selectedBlockData.props,
                              href: e.target.value,
                            },
                          })
                        }
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Alignment</label>
                      <div className="flex gap-2">
                        {["left", "center", "right"].map((align) => (
                          <button
                            key={align}
                            onClick={() =>
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  align,
                                },
                              })
                            }
                              className={`flex-1 p-2 border rounded transition-colors ${
                                (selectedBlockData.props.align === align) || 
                                (selectedBlockData.props.align === undefined && generalSettings.contentAlignment === align)
                                  ? "bg-[#fbc40c] text-white border-[#fbc40c]"
                                  : "bg-white border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {align === "left" && <FaAlignLeft />}
                            {align === "center" && <FaAlignCenter />}
                            {align === "right" && <FaAlignRight />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Background Color</label>
                      <input
                        type="color"
                        value={
                            selectedBlockData?.props?.style?.backgroundColor ??
                          "#fbc40c"
                        }
                        onChange={(e) =>
                          updateBlock(selectedBlockData.id, {
                            props: {
                              ...selectedBlockData.props,
                              style: {
                                ...selectedBlockData.props.style,
                                backgroundColor: e.target.value,
                                  color: "#ffffff",
                              },
                            },
                          })
                        }
                          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                  </>
                ) : selectedBlockData.type === "image" ? (
                  <>
                    <div>
                        <label className="block text-xs font-medium mb-2 text-gray-700">Upload Image</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                          className="w-full px-4 py-2 bg-[#fbc40c] hover:bg-[#D68108] text-white rounded font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {uploadingImage ? (
                          <>
                            <FaSpinner className="animate-spin" /> Uploading...
                          </>
                        ) : (
                          <>
                            <FaUpload /> Upload Image
                          </>
                        )}
                      </button>
                      {selectedBlockData.props.src && (
                        <div className="mt-2 relative">
                          <img
                            src={selectedBlockData.props.src}
                            alt="Preview"
                              className="w-full h-48 object-contain rounded border border-gray-300 bg-gray-50"
                              style={{
                                imageRendering: "auto" as any,
                                WebkitBackfaceVisibility: "hidden",
                                WebkitTransform: "translateZ(0)",
                                backfaceVisibility: "hidden",
                                transform: "translateZ(0)"
                              } as React.CSSProperties}
                          />
                          <button
                            onClick={() =>
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  src: "",
                                },
                              })
                            }
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Remove Image"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                        <label className="block text-xs font-medium mb-1 text-gray-700">Or Enter Image URL</label>
                      <input
                        type="text"
                          value={selectedBlockData?.props?.src ?? ""}
                        onChange={(e) =>
                          updateBlock(selectedBlockData.id, {
                            props: {
                              ...selectedBlockData.props,
                              src: e.target.value,
                            },
                          })
                        }
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                      <div className="mt-4">
                        <label className="block text-xs font-medium mb-1 text-gray-700">Alt Text</label>
                      <input
                        type="text"
                          value={selectedBlockData?.props?.alt ?? ""}
                        onChange={(e) =>
                          updateBlock(selectedBlockData.id, {
                            props: {
                              ...selectedBlockData.props,
                              alt: e.target.value,
                            },
                          })
                        }
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                          placeholder="Image description"
                      />
                    </div>
                      <div className="mt-4">
                        <label className="block text-xs font-medium mb-1 text-gray-700">Alignment</label>
                        <div className="flex gap-2">
                          {["left", "center", "right"].map((align) => (
                            <button
                              key={align}
                              onClick={() =>
                                updateBlock(selectedBlockData.id, {
                                  props: {
                                    ...selectedBlockData.props,
                                    align,
                                  },
                                })
                              }
                              className={`flex-1 p-2 border rounded transition-colors ${
                                (selectedBlockData.props.align === align) || 
                                (selectedBlockData.props.align === undefined && generalSettings.contentAlignment === align)
                                  ? "bg-[#fbc40c] text-white border-[#fbc40c]"
                                  : "bg-white border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {align === "left" && <FaAlignLeft />}
                              {align === "center" && <FaAlignCenter />}
                              {align === "right" && <FaAlignRight />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : selectedBlockData.type === "columns" ? (
                    <>
                    <div>
                        <label className="block text-xs font-medium mb-2 text-gray-700">Columns</label>
                        <div className="space-y-3">
                          {(selectedBlockData?.props?.columns ?? []).map((col: any, idx: number) => (
                            <div key={idx} className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-700">Column {idx + 1}</span>
                                <button
                                  onClick={() => {
                                    const newColumns = [...(selectedBlockData?.props?.columns ?? [])];
                                    newColumns.splice(idx, 1);
                                    updateBlock(selectedBlockData.id, {
                                      props: {
                                        ...selectedBlockData?.props,
                                        columns: newColumns,
                                      },
                                    });
                                  }}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                  title="Remove Column"
                                >
                                  <FaTimes className="w-3 h-3" />
                                </button>
                              </div>
                              <textarea
                                value={col?.content ?? ""}
                                onChange={(e) => {
                                  const newColumns = [...(selectedBlockData?.props?.columns ?? [])];
                                  newColumns[idx] = { ...col, content: e.target.value };
                                  updateBlock(selectedBlockData.id, {
                                    props: {
                                      ...selectedBlockData?.props,
                                      columns: newColumns,
                                    },
                                  });
                                }}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c] bg-white"
                                rows={3}
                                placeholder={`Column ${idx + 1} content`}
                              />
                              <div className="mt-2">
                                <label className="block text-xs text-gray-600 mb-1">Width Ratio</label>
                                <input
                                  type="number"
                                  value={col?.width ?? 1}
                                  onChange={(e) => {
                                    const newColumns = [...(selectedBlockData?.props?.columns ?? [])];
                                    newColumns[idx] = { ...col, width: parseInt(e.target.value) || 1 };
                                    updateBlock(selectedBlockData.id, {
                                      props: {
                                        ...selectedBlockData?.props,
                                        columns: newColumns,
                                      },
                                    });
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c] bg-white"
                                  min="1"
                                  max="10"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            const newColumns = [...(selectedBlockData?.props?.columns ?? []), { width: 1, content: "" }];
                            updateBlock(selectedBlockData.id, {
                              props: {
                                ...selectedBlockData.props,
                                columns: newColumns,
                              },
                            });
                          }}
                          className="mt-3 w-full px-4 py-2 bg-[#fbc40c] hover:bg-[#D68108] text-white rounded font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <FaPlus className="w-4 h-4" />
                          Add Column
                        </button>
                      </div>
                    </>
                  ) : selectedBlockData.type === "social" ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-2 text-gray-700">Social Icons</label>
                        <div className="space-y-2">
                          {(selectedBlockData?.props?.icons ?? []).map((icon: any, idx: number) => (
                            <div key={idx} className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {icon.name === "facebook" && <FaFacebook className="w-3 h-3 text-blue-600" />}
                                  {icon.name === "twitter" && <FaTwitter className="w-3 h-3 text-blue-400" />}
                                  {icon.name === "instagram" && <FaInstagram className="w-3 h-3 text-pink-600" />}
                                  {icon.name === "linkedin" && <FaLinkedin className="w-3 h-3 text-blue-700" />}
                                  <span className="text-xs font-medium text-gray-700 capitalize">
                                    {icon.name || icon.icon}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    const newIcons = [...(selectedBlockData?.props?.icons ?? [])];
                                    newIcons.splice(idx, 1);
                                    updateBlock(selectedBlockData.id, {
                                      props: {
                                        ...selectedBlockData?.props,
                                        icons: newIcons,
                                      },
                                    });
                                  }}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                  title="Remove Icon"
                                >
                                  <FaTimes className="w-3 h-3" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={icon?.href ?? ""}
                                onChange={(e) => {
                                  const newIcons = [...(selectedBlockData?.props?.icons ?? [])];
                                  newIcons[idx] = { ...icon, href: e.target.value };
                                  updateBlock(selectedBlockData.id, {
                                    props: {
                                      ...selectedBlockData?.props,
                                      icons: newIcons,
                                    },
                                  });
                                }}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c] bg-white"
                                placeholder="https://..."
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-2">
                          <label className="block text-xs font-medium mb-1 text-gray-700">Add Icon</label>
                          <div className="flex gap-1 flex-wrap">
                            <button
                              onClick={() => {
                                const newIcons = [...(selectedBlockData?.props?.icons ?? []), { name: "facebook", href: "", image: "" }];
                                updateBlock(selectedBlockData.id, {
                                  props: {
                                    ...selectedBlockData?.props,
                                    icons: newIcons,
                                  },
                                });
                              }}
                              className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              title="Add Facebook"
                            >
                              <FaFacebook className="w-3 h-3 text-blue-600" />
                            </button>
                            <button
                              onClick={() => {
                                const newIcons = [...(selectedBlockData.props.icons || []), { name: "twitter", href: "", image: "" }];
                                updateBlock(selectedBlockData.id, {
                                  props: {
                                    ...selectedBlockData.props,
                                    icons: newIcons,
                                  },
                                });
                              }}
                              className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              title="Add Twitter"
                            >
                              <FaTwitter className="w-3 h-3 text-blue-400" />
                            </button>
                            <button
                              onClick={() => {
                                const newIcons = [...(selectedBlockData.props.icons || []), { name: "instagram", href: "", image: "" }];
                                updateBlock(selectedBlockData.id, {
                                  props: {
                                    ...selectedBlockData.props,
                                    icons: newIcons,
                                  },
                                });
                              }}
                              className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              title="Add Instagram"
                            >
                              <FaInstagram className="w-3 h-3 text-pink-600" />
                            </button>
                            <button
                              onClick={() => {
                                const newIcons = [...(selectedBlockData.props.icons || []), { name: "linkedin", href: "", image: "" }];
                                updateBlock(selectedBlockData.id, {
                                  props: {
                                    ...selectedBlockData.props,
                                    icons: newIcons,
                                  },
                                });
                              }}
                              className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              title="Add LinkedIn"
                            >
                              <FaLinkedin className="w-3 h-3 text-blue-700" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Icon Size</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const currentSize = selectedBlockData.props.iconSize || 32;
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  iconSize: Math.max(16, currentSize - 4),
                                },
                              });
                            }}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={selectedBlockData?.props?.iconSize ?? 32}
                            onChange={(e) =>
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  iconSize: parseInt(e.target.value) || 32,
                                },
                              })
                            }
                            className="flex-1 p-2 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                            min="16"
                            max="80"
                          />
                          <span className="text-xs text-gray-500">px</span>
                          <button
                            onClick={() => {
                              const currentSize = selectedBlockData.props.iconSize || 32;
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  iconSize: Math.min(80, currentSize + 4),
                                },
                              });
                            }}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Icon Spacing</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const currentSpacing = selectedBlockData?.props?.iconSpacing ?? 12;
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  iconSpacing: Math.max(0, currentSpacing - 4),
                                },
                              });
                            }}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={selectedBlockData?.props?.iconSpacing ?? 12}
                            onChange={(e) =>
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  iconSpacing: parseInt(e.target.value) || 12,
                                },
                              })
                            }
                            className="flex-1 p-2 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                            min="0"
                            max="40"
                          />
                          <span className="text-xs text-gray-500">px</span>
                          <button
                            onClick={() => {
                              const currentSpacing = selectedBlockData?.props?.iconSpacing ?? 12;
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  iconSpacing: Math.min(40, currentSpacing + 4),
                                },
                              });
                            }}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Alignment</label>
                      <div className="flex gap-2">
                        {["left", "center", "right"].map((align) => (
                          <button
                            key={align}
                            onClick={() =>
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  align,
                                },
                              })
                            }
                              className={`flex-1 p-2 border rounded-lg transition-colors ${
                              selectedBlockData.props.align === align
                                  ? "bg-[#fbc40c] text-white border-[#fbc40c]"
                                  : "bg-white border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {align === "left" && <FaAlignLeft />}
                            {align === "center" && <FaAlignCenter />}
                            {align === "right" && <FaAlignRight />}
                          </button>
                        ))}
                      </div>
                    </div>
                    </>
                  ) : selectedBlockData.type === "menu" ? (
                    <>
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Menu Items</label>
                        <textarea
                          value={selectedBlockData?.content ?? ""}
                          onChange={(e) =>
                            updateBlock(selectedBlockData.id, {
                              content: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                          rows={4}
                          placeholder="Enter menu items, one per line"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Alignment</label>
                        <div className="flex gap-2">
                          {["left", "center", "right"].map((align) => (
                            <button
                              key={align}
                              onClick={() =>
                                updateBlock(selectedBlockData.id, {
                                  props: {
                                    ...selectedBlockData.props,
                                    align,
                                  },
                                })
                              }
                              className={`flex-1 p-2 border rounded transition-colors ${
                                (selectedBlockData.props.align === align) || 
                                (selectedBlockData.props.align === undefined && generalSettings.contentAlignment === align)
                                  ? "bg-[#fbc40c] text-white border-[#fbc40c]"
                                  : "bg-white border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {align === "left" && <FaAlignLeft />}
                              {align === "center" && <FaAlignCenter />}
                              {align === "right" && <FaAlignRight />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : selectedBlockData.type === "icon" ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Icon Type</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() =>
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  iconType: "star",
                                },
                              })
                            }
                            className={`p-3 border rounded transition-colors ${
                              selectedBlockData.props.iconType === "star"
                                ? "bg-[#fbc40c] text-white border-[#fbc40c]"
                                : "bg-white border-gray-300 hover:bg-gray-50"
                            }`}
                            title="Star"
                          >
                            <FaStar className="mx-auto w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  iconType: "heart",
                                },
                              })
                            }
                            className={`p-3 border rounded transition-colors ${
                              selectedBlockData.props.iconType === "heart"
                                ? "bg-[#fbc40c] text-white border-[#fbc40c]"
                                : "bg-white border-gray-300 hover:bg-gray-50"
                            }`}
                            title="Heart"
                          >
                            <FaHeart className="mx-auto w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  iconType: "check",
                                },
                              })
                            }
                            className={`p-3 border rounded transition-colors ${
                              selectedBlockData.props.iconType === "check"
                                ? "bg-[#fbc40c] text-white border-[#fbc40c]"
                                : "bg-white border-gray-300 hover:bg-gray-50"
                            }`}
                            title="Check"
                          >
                            <FaCheckCircle className="mx-auto w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  iconType: "info",
                                },
                              })
                            }
                            className={`p-3 border rounded transition-colors ${
                              selectedBlockData.props.iconType === "info"
                                ? "bg-[#fbc40c] text-white border-[#fbc40c]"
                                : "bg-white border-gray-300 hover:bg-gray-50"
                            }`}
                            title="Info"
                          >
                            <FaInfoCircle className="mx-auto w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  iconType: "warning",
                                },
                              })
                            }
                            className={`p-3 border rounded transition-colors ${
                              selectedBlockData.props.iconType === "warning"
                                ? "bg-[#fbc40c] text-white border-[#fbc40c]"
                                : "bg-white border-gray-300 hover:bg-gray-50"
                            }`}
                            title="Warning"
                          >
                            <FaExclamationCircle className="mx-auto w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-2 text-gray-700">Upload Custom Icon Image</label>
                        <input
                          ref={iconImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleIconImageUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => iconImageInputRef.current?.click()}
                          disabled={uploadingIconImage}
                          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm mb-3"
                        >
                          {uploadingIconImage ? (
                            <>
                              <FaSpinner className="animate-spin w-4 h-4" /> Uploading...
                            </>
                          ) : (
                            <>
                              <FaUpload className="w-4 h-4" /> Upload Icon Image
                            </>
                          )}
                        </button>
                         {selectedBlockData.props.imageSrc && (
                           <div className="mb-3 relative">
                             <img
                               src={selectedBlockData.props.imageSrc}
                               alt="Icon Preview"
                               className="w-full h-48 object-contain rounded border border-gray-300 bg-gray-50"
                               style={{
                                 imageRendering: "auto" as any,
                                 WebkitBackfaceVisibility: "hidden",
                                 WebkitTransform: "translateZ(0)",
                                 backfaceVisibility: "hidden",
                                 transform: "translateZ(0)"
                               } as React.CSSProperties}
                             />
                             <button
                               onClick={() =>
                                 updateBlock(selectedBlockData.id, {
                                   props: {
                                     ...selectedBlockData.props,
                                     imageSrc: "",
                                     iconType: "star",
                                   },
                                 })
                               }
                               className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                               title="Remove Image"
                             >
                               <FaTimes className="w-3 h-3" />
                             </button>
                           </div>
                         )}
                        <div className="mb-3">
                          <label className="block text-xs font-medium mb-1 text-gray-700">Or Enter Image URL</label>
                          <input
                            type="text"
                            value={selectedBlockData?.props?.imageSrc ?? ""}
                            onChange={(e) =>
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  imageSrc: e.target.value,
                                  iconType: e.target.value ? "custom" : (selectedBlockData?.props?.iconType ?? "star"),
                                },
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                            placeholder="https://example.com/icon.png"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Icon Size</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const currentSize = selectedBlockData?.props?.size ?? 24;
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  size: Math.max(12, currentSize - 4),
                                },
                              });
                            }}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                          >
                            -
                          </button>
                      <input
                        type="number"
                            value={selectedBlockData?.props?.size ?? 24}
                        onChange={(e) =>
                          updateBlock(selectedBlockData.id, {
                            props: {
                              ...selectedBlockData.props,
                                  size: parseInt(e.target.value) || 24,
                            },
                          })
                        }
                            className="flex-1 p-2 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                            min="12"
                            max="200"
                          />
                          <span className="text-xs text-gray-500">px</span>
                          <button
                            onClick={() => {
                              const currentSize = selectedBlockData?.props?.size ?? 24;
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  size: Math.min(200, currentSize + 4),
                                },
                              });
                            }}
                            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                          >
                            +
                          </button>
                        </div>
                        <div className="mt-2 flex gap-1">
                          <button
                            onClick={() => updateBlock(selectedBlockData.id, { props: { ...selectedBlockData.props, size: 16 } })}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Small (16px)
                          </button>
                          <button
                            onClick={() => updateBlock(selectedBlockData.id, { props: { ...selectedBlockData.props, size: 24 } })}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Medium (24px)
                          </button>
                          <button
                            onClick={() => updateBlock(selectedBlockData.id, { props: { ...selectedBlockData.props, size: 48 } })}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Large (48px)
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Icon Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={selectedBlockData?.props?.color ?? "#333333"}
                            onChange={(e) =>
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  color: e.target.value,
                                },
                              })
                            }
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={selectedBlockData?.props?.color ?? "#333333"}
                            onChange={(e) =>
                              updateBlock(selectedBlockData.id, {
                                props: {
                                  ...selectedBlockData.props,
                                  color: e.target.value,
                                },
                              })
                            }
                            className="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">Alignment</label>
                        <div className="flex gap-2">
                          {["left", "center", "right"].map((align) => (
                            <button
                              key={align}
                              onClick={() =>
                                updateBlock(selectedBlockData.id, {
                                  props: {
                                    ...selectedBlockData.props,
                                    align,
                                  },
                                })
                              }
                              className={`flex-1 p-2 border rounded transition-colors ${
                                (selectedBlockData.props.align === align) || 
                                (selectedBlockData.props.align === undefined && generalSettings.contentAlignment === align)
                                  ? "bg-[#fbc40c] text-white border-[#fbc40c]"
                                  : "bg-white border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {align === "left" && <FaAlignLeft />}
                              {align === "center" && <FaAlignCenter />}
                              {align === "right" && <FaAlignRight />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : selectedBlockData.type === "html" ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-700">HTML Code</label>
                        <textarea
                          value={selectedBlockData?.content ?? ""}
                          onChange={(e) =>
                            updateBlock(selectedBlockData.id, {
                              content: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#fbc40c]"
                          rows={8}
                          placeholder="Enter HTML code..."
                      />
                    </div>
                  </>
                ) : null}
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
      </div>

      {/* "by Unlayer Editor" Attribution - Bottom Right */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-gray-400 z-10">
        <span>by</span>
        <span className="font-semibold text-gray-600">Unlayer Editor</span>
        <FaBolt className="w-3 h-3 text-yellow-500" />
      </div>
    </>
  );
};

export default CustomEmailEditor;
