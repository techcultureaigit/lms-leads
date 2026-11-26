import React from "react";

// Debounce hover selection after drop
let lastDropTime = 0;
// Track which block the mouse is currently over to prevent re-selection on hover
let currentHoveredBlockId: string | null = null;
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaStar,
  FaHeart,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationCircle,
  FaIcons,
  FaTrash,
  FaGripVertical,
  FaImage,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { EmailBlock, GeneralSettings, BlockType } from "./types";
import { getSocialIconColor, getSocialIconSVG } from "./utils";
import { RichTextEditor } from "./RichTextEditor";
import { getDefaultProps, getDefaultContent } from "./blockUtils";

// Helper function to get social icon PNG image URL (same as htmlGenerator)
// Uses Cloudinary CDN for optimized social media icons for email compatibility
const getSocialIconImageUrl = (iconName: string): string => {
  // Cloudinary URLs for social media icons - optimized for email delivery
  const iconMap: { [key: string]: string } = {
    facebook: "http://res.cloudinary.com/dunw7w1ye/image/upload/v1793622486/ezwealth-assets/emailtemplates/email-templates/facebook-544d7a54-57fa-45a0-9bb5-a5083c5f123e.png",
    instagram: "http://res.cloudinary.com/dunw7w1ye/image/upload/v1793622489/ezwealth-assets/emailtemplates/email-templates/insta1-6f506b4b-13d8-43a8-9c65-788e2ed20ce5.png",
    linkedin: "http://res.cloudinary.com/dunw7w1ye/image/upload/v1793702759/ezwealth-assets/emailtemplates/email-templates/linkedin1-712b4b2d-d464-4059-a5a3-6f2ebfd89f3a.png",
    twitter: "http://res.cloudinary.com/dunw7w1ye/image/upload/v1793622487/ezwealth-assets/emailtemplates/email-templates/twitter-0e6ca0d3-7993-4003-9414-36868ed38a26.png",
    x: "http://res.cloudinary.com/dunw7w1ye/image/upload/v1793622487/ezwealth-assets/emailtemplates/email-templates/twitter-0e6ca0d3-7993-4003-9414-36868ed38a26.png", // Use Twitter icon for X
    whatsapp: "http://res.cloudinary.com/dunw7w1ye/image/upload/v1793622490/ezwealth-assets/emailtemplates/email-templates/whatsapp1-cd48dbb1-8250-4e84-bc66-d6fcab661143.png",
    youtube: "http://res.cloudinary.com/dunw7w1ye/image/upload/v1793622488/ezwealth-assets/emailtemplates/email-templates/youtube-5d19adc3-493e-41ad-a2f4-36ad7ef725f4.jpg",
    // Fallback to Simple Icons CDN for other icons not yet uploaded to Cloudinary
    telegram: "https://cdn.simpleicons.org/telegram/FFFFFF",
    pinterest: "https://cdn.simpleicons.org/pinterest/FFFFFF",
    snapchat: "https://cdn.simpleicons.org/snapchat/FFFFFF",
    tiktok: "https://cdn.simpleicons.org/tiktok/FFFFFF",
    discord: "https://cdn.simpleicons.org/discord/FFFFFF",
    github: "https://cdn.simpleicons.org/github/FFFFFF",
    medium: "https://cdn.simpleicons.org/medium/FFFFFF",
    reddit: "https://cdn.simpleicons.org/reddit/FFFFFF",
    skype: "https://cdn.simpleicons.org/skype/FFFFFF",
    spotify: "https://cdn.simpleicons.org/spotify/FFFFFF",
    vimeo: "https://cdn.simpleicons.org/vimeo/FFFFFF",
  };
  
  const normalizedIconName = iconName.toLowerCase();
  
  // Return Cloudinary URL if available, otherwise fallback to Simple Icons CDN
  return iconMap[normalizedIconName] || `https://cdn.simpleicons.org/${normalizedIconName}/FFFFFF`;
};

interface BlockRendererProps {
  block: EmailBlock;
  index: number;
  selectedBlock: string | null;
  draggedBlockId: string | null;
  draggedBlockType: string | null;
  dragOverIndex: number | null;
  generalSettings: GeneralSettings;
  blockTypes?: BlockType[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<EmailBlock>) => void;
  onMove?: (id: string, direction: "up" | "down") => void;
  onDragStart: (e: React.DragEvent, blockId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isNested?: boolean; // Indicates if this block is nested inside a column
  totalBlocks?: number; // Total number of blocks (for up/down button visibility)
  isMultiSelectMode?: boolean; // Whether multi-select mode is active
  isSelected?: boolean; // Whether this block is selected in multi-select mode
  onToggleSelect?: (blockId: string) => void; // Toggle block selection
  onDeleteRequest?: (id: string, onConfirm: () => void) => void; // Request delete with confirmation
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  index,
  selectedBlock,
  draggedBlockId,
  draggedBlockType,
  dragOverIndex,
  generalSettings,
  blockTypes = [],
  onSelect,
  onDelete,
  onUpdate,
  onMove,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isNested = false,
  totalBlocks = 0,
  isMultiSelectMode = false,
  isSelected = false,
  onToggleSelect,
  onDeleteRequest,
}) => {
  // Safety check: ensure block and block.props exist
  if (!block) {
    return null;
  }
  
  // Ensure block.props exists
  if (!block.props) {
    block.props = {};
  }
  
  const isBlockSelected = selectedBlock === block.id;
  const isEditable = isBlockSelected && (block.type === "text" || block.type === "heading");
  const isMultiSelected = isMultiSelectMode && isSelected;

  // Debounced hover select - only select if mouse actually moves over the block (not if already there)
  // const handleHoverSelect = (id: string) => {
  //   // Don't select if we just dropped (within 500ms)
  //   if (Date.now() - lastDropTime < 500) return;
  //   // Don't select if mouse is already over this block
  //   if (currentHoveredBlockId === id) return;
  //   // Update current hovered block and select it
  //   currentHoveredBlockId = id;
  //   onSelect(id);
  // };

  // Handle mouse leave to reset hover state
  const handleMouseLeave = () => {
    // Don't clear hover state immediately - allow a small delay
    // This prevents flickering when moving between child elements
    setTimeout(() => {
      if (currentHoveredBlockId === block.id) {
        currentHoveredBlockId = null;
      }
    }, 100);
  };

  const renderBlockContent = (): React.ReactNode => {
    switch (block.type) {
      case "heading": {
        if (isEditable && onUpdate) {
          const currentLevel = block.props.level || 1;
          return (
            <RichTextEditor
              key={`heading-${block.id}-${currentLevel}-${block.props.align || generalSettings.contentAlignment}`}
              content={block.content || "Heading"}
              onChange={(html) => {
                onUpdate(block.id, { content: html });
              }}
              placeholder="Enter heading text..."
              editable={true}
              showToolbar={true}
              fontSize={block.props.style?.fontSize || (currentLevel === 1 ? "28px" : currentLevel === 2 ? "24px" : currentLevel === 3 ? "20px" : "18px")}
              fontFamily={block.props.style?.fontFamily || generalSettings.fontFamily || "Arial, sans-serif"}
              textColor={block.props.style?.color || generalSettings.textColor || "#333333"}
              backgroundColor={block.props.style?.backgroundColor || "transparent"}
              textAlign={
                block.props.align !== undefined && block.props.align !== null
                  ? block.props.align
                  : generalSettings.contentAlignment
              }
              className="w-full"
              style={{
                width: "100%",
                marginTop: block.props.style?.marginTop || "0px",
                marginBottom: block.props.style?.marginBottom || "0px",
                padding: block.props.style?.padding || "0px",
                lineHeight: block.props.style?.lineHeight || generalSettings.lineHeight || "1.3",
                letterSpacing: block.props.style?.letterSpacing || generalSettings.letterSpacing || "0px",
                fontWeight: block.props.style?.fontWeight || "bold",
                textAlign: block.props.align !== undefined && block.props.align !== null
                  ? block.props.align
                  : generalSettings.contentAlignment,
              }}
            />
          );
        }
        const currentLevel = block.props.level || 1;
        const HeadingTag = `h${currentLevel}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
        const defaultPadding = block.props.style?.padding || "0px";
        const marginTop = block.props.style?.marginTop || "0px";
        const marginBottom = block.props.style?.marginBottom || "0px";
        const lineHeight = block.props.style?.lineHeight || generalSettings.lineHeight || "1.3";
        const letterSpacing = block.props.style?.letterSpacing || generalSettings.letterSpacing || "0px";
        
        return (
          <HeadingTag
            dangerouslySetInnerHTML={{ __html: block.content || "Heading" }}
            style={{
              fontWeight: block.props.style?.fontWeight || "bold",
              color: block.props.style?.color || generalSettings.textColor || "#333333",
              backgroundColor: block.props.style?.backgroundColor || "transparent",
              textDecoration: block.props.style?.textDecoration || "none",
              fontStyle: block.props.style?.fontStyle || "normal",
              padding: defaultPadding,
              marginTop: marginTop,
              marginBottom: marginBottom,
              lineHeight: lineHeight,
              letterSpacing: letterSpacing,
              fontSize: block.props.style?.fontSize || ((block.props.level || 1) === 1 ? "28px" : (block.props.level || 1) === 2 ? "24px" : (block.props.level || 1) === 3 ? "20px" : "18px"),
              fontFamily: block.props.style?.fontFamily || generalSettings.fontFamily || "Arial, sans-serif",
              textAlign:
                block.props.align !== undefined && block.props.align !== null
                  ? block.props.align
                  : generalSettings.contentAlignment,
              width: "100%",
              maxWidth: "100%",
              marginLeft: 0,
              marginRight: 0,
              boxSizing: "border-box",
              wordWrap: "break-word",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
            tabIndex={0}
            // onMouseEnter={() => handleHoverSelect(block.id)}
            onMouseLeave={handleMouseLeave}
          />
        );
      }

      case "text":
        if (isEditable && onUpdate) {
          return (
            <RichTextEditor
              key={`text-${block.id}-${block.props.align || generalSettings.contentAlignment}`}
              content={block.content || "Paragraph"}
              onChange={(html) => {
                onUpdate(block.id, { content: html });
              }}
              placeholder="Start typing..."
              editable={true}
              showToolbar={true}
              fontSize={block.props.style?.fontSize || generalSettings.fontSize || "16px"}
              fontFamily={block.props.style?.fontFamily || generalSettings.fontFamily || "Arial, sans-serif"}
              textColor={block.props.style?.color || generalSettings.textColor || "#000000"}
              backgroundColor={block.props.style?.backgroundColor || "transparent"}
              textAlign={
                block.props.align !== undefined && block.props.align !== null
                  ? block.props.align
                  : generalSettings.contentAlignment
              }
              className="w-full"
              style={{
                width: "100%",
                margin: 0,
                textAlign: block.props.align !== undefined && block.props.align !== null
                  ? block.props.align
                  : generalSettings.contentAlignment,
              }}
            />
          );
        }
        return (
          <div
            dangerouslySetInnerHTML={{ __html: block.content || "Text" }}
            style={{
              fontWeight: block.props.style?.fontWeight || "normal",
              color: block.props.style?.color || generalSettings.textColor || "#000000",
              backgroundColor: block.props.style?.backgroundColor || "transparent",
              textDecoration: block.props.style?.textDecoration || "none",
              fontStyle: block.props.style?.fontStyle || "normal",
              fontSize: block.props.style?.fontSize || generalSettings.fontSize || "16px",
              fontFamily: block.props.style?.fontFamily || generalSettings.fontFamily || "Arial, sans-serif",
              padding: block.props.style?.backgroundColor && block.props.style?.backgroundColor !== "transparent" ? "8px 12px" : "0",
              ...(block.props.style || {}),
              textAlign:
                block.props.align !== undefined && block.props.align !== null
                  ? block.props.align
                  : generalSettings.contentAlignment,
              width: "100%",
              maxWidth: "100%",
              margin: 0,
              boxSizing: "border-box",
              wordWrap: "break-word",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
            tabIndex={0}
            // onMouseEnter={() => handleHoverSelect(block.id)}
            onMouseLeave={handleMouseLeave}
          />
        );

      case "button":
        return (
          <div
            style={{
              textAlign:
                block.props.align !== undefined && block.props.align !== null
                  ? block.props.align
                  : generalSettings.contentAlignment,
              width: "100%",
              maxWidth: "100%",
              margin: 0,
              boxSizing: "border-box",
              wordWrap: "break-word",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
            tabIndex={0}
            // onMouseEnter={() => handleHoverSelect(block.id)}
            onMouseLeave={handleMouseLeave}
          >
            <a
              href={block.props.href || "#"}
              style={{
                ...(block.props.style || {}),
                color: block.props.style?.color || "#ffffff",
                backgroundColor:
                  block.props.style?.backgroundColor || "#fbc40c",
                display: "inline-block",
              }}
              className="px-6 py-3 rounded no-underline transition-opacity hover:opacity-90"
            >
              {block.content || "Click Here"}
            </a>
          </div>
        );

      case "image":
        if (!block.props.src) {
          return (
            <div
              style={{
                textAlign:
                  block.props.align !== undefined && block.props.align !== null
                    ? block.props.align
                    : generalSettings.contentAlignment,
                width: "100%",
                margin: "20px 0",
                padding: "40px 20px",
                border: "2px dashed #d1d5db",
                borderRadius: "8px",
                backgroundColor: "#f9fafb",
                boxSizing: "border-box",
              }}
            >
              <div className="text-center text-gray-400">
                <FaImage className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No image selected</p>
                <p className="text-xs mt-1">Upload an image or enter an image URL</p>
              </div>
            </div>
          );
        }
        const imageAlign = block.props.align !== undefined && block.props.align !== null
          ? block.props.align
          : generalSettings.contentAlignment;
        
        return (
          <div
            style={{
              textAlign: imageAlign,
              width: "100%",
              maxWidth: "100%",
              margin: "20px 0",
              padding: 0,
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            <img
              src={block.props.src}
              alt={block.props.alt || "Image"}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div style="padding: 40px 20px; border: 2px dashed #d1d5db; border-radius: 8px; background-color: #f9fafb; text-align: ${imageAlign};">
                      <p style="color: #9ca3af; font-size: 14px; margin: 0;">Image failed to load</p>
                      <p style="color: #9ca3af; font-size: 12px; margin-top: 4px;">Please check the image URL</p>
                    </div>
                  `;
                }
              }}
              style={{
                maxWidth: "100%",
                width: block.props.width ? `${Math.min(block.props.width, parseInt(generalSettings.contentWidth) || 800)}px` : "100%",
                height: "auto",
                display: imageAlign === "center" ? "block" : "inline-block",
                objectFit: "contain",
                imageRendering: "auto" as any,
                WebkitBackfaceVisibility: "hidden",
                WebkitTransform: "translateZ(0)",
                backfaceVisibility: "hidden",
                transform: "translateZ(0)",
                willChange: "transform",
                boxSizing: "border-box",
                margin: imageAlign === "center" ? "0 auto" : imageAlign === "right" ? "0 0 0 auto" : "0 auto 0 0",
                borderRadius: generalSettings.borderRadius || "4px",
              } as React.CSSProperties}
              className="select-none"
            />
          </div>
        );

      case "social":
        const socialIcons = block.props.icons || [];
        // Professional default sizing: larger icons with better spacing for equal size display
        const iconSize = block.props.iconSize || 50; // Increased to 50px for bigger, more prominent icons
        const iconType = block.props.iconType || "circle"; // Professional circular design with colored backgrounds
        const iconSpacing = block.props.iconSpacing || 20; // Increased spacing for better visual separation
        const socialAlign = block.props.align !== undefined && block.props.align !== null
          ? block.props.align
          : generalSettings.contentAlignment;
        
        // Calculate if icons need to wrap - ensure they don't overlap
        const totalIconsWidth = socialIcons.length * iconSize;
        const totalSpacingWidth = (socialIcons.length - 1) * iconSpacing;
        const totalRequiredWidth = totalIconsWidth + totalSpacingWidth;
        
        return (
          <div
            className="flex items-center justify-center py-2 flex-wrap"
            style={{
              justifyContent:
                socialAlign === "left"
                  ? "flex-start"
                  : socialAlign === "right"
                  ? "flex-end"
                  : "center",
              gap: `${iconSpacing}px`,
              width: "100%",
              maxWidth: "100%",
              minWidth: 0,
              margin: 0,
              padding: "20px 0", // Increased padding for better visual separation
              boxSizing: "border-box",
              overflow: "hidden",
              overflowX: "hidden",
              overflowY: "visible",
              wordWrap: "break-word",
              wordBreak: "break-word",
              display: "flex",
              flexWrap: "wrap",
              rowGap: `${iconSpacing}px`,
              columnGap: `${iconSpacing}px`,
            }}
          >
            {socialIcons.map((icon: any, idx: number) => {
              const iconName = (icon.name || icon.icon || "facebook").toLowerCase();
              const iconColor = getSocialIconColor(iconName);
              
              // Apply icon type styles - prevent overlap by ensuring proper sizing
              let iconStyle: React.CSSProperties = {
                width: `${iconSize}px`,
                height: `${iconSize}px`,
                minWidth: `${iconSize}px`,
                minHeight: `${iconSize}px`,
                maxWidth: `${iconSize}px`,
                maxHeight: `${iconSize}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                textDecoration: "none",
                flexShrink: 0,
                flexGrow: 0,
                boxSizing: "border-box",
                overflow: "hidden",
                position: "relative",
                aspectRatio: "1 / 1", // Ensure perfect square for circular shape
              };

              // Check if using Cloudinary images (complete icons with backgrounds)
              const iconImage = icon.image || icon.src || icon.img;
              const isCloudinaryIcon = !iconImage && ['facebook', 'instagram', 'linkedin', 'twitter', 'x', 'whatsapp', 'youtube'].includes(iconName.toLowerCase());
              
              // Apply icon type specific styles - Cloudinary images are complete, so use transparent background
              if (iconType.includes("circle") || isCloudinaryIcon) {
                // Cloudinary images are already complete circular icons with backgrounds and shadows
                // So we use transparent background and let the image show through beautifully
                iconStyle.borderRadius = "50%";
                iconStyle.backgroundColor = "transparent";
                iconStyle.transition = "all 0.2s ease";
              } else if (iconType.includes("round")) {
                iconStyle.borderRadius = "8px";
                if (iconType === "round-black") {
                  iconStyle.backgroundColor = "#000000";
                } else {
                  iconStyle.backgroundColor = iconColor;
                }
                iconStyle.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)";
              } else if (iconType.includes("square")) {
                iconStyle.borderRadius = "0px";
                if (iconType === "square-black") {
                  iconStyle.backgroundColor = "#000000";
                } else if (iconType === "square-white") {
                  iconStyle.backgroundColor = "#FFFFFF";
                  iconStyle.border = `2px solid ${iconColor}`;
                } else {
                  iconStyle.backgroundColor = iconColor;
                }
                iconStyle.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)";
              } else {
                // Default: Professional circular design - transparent for Cloudinary images
                iconStyle.borderRadius = "50%";
                iconStyle.backgroundColor = "transparent";
              }

              // All icons use the same size for consistent appearance
              const imgSize = iconSize; // Standard size (50px) for all icons
              
              // Get PNG image URL from CDN (same as htmlGenerator)
              const imageUrl = getSocialIconImageUrl(iconName);

              return (
                <a
                  key={idx}
                  href={icon.href || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-90 hover:scale-105 transition-all"
                  style={{
                    ...iconStyle,
                    cursor: 'pointer',
                  }}
                  title={icon.name || icon.icon || "Social Icon"}
                >
                  <img
                    src={imageUrl}
                    alt={iconName}
                    width={imgSize}
                    height={imgSize}
                    style={{
                      width: `${imgSize}px`,
                      height: `${imgSize}px`,
                      minWidth: `${imgSize}px`,
                      minHeight: `${imgSize}px`,
                      maxWidth: `${imgSize}px`,
                      maxHeight: `${imgSize}px`,
                      display: 'block',
                      border: 0,
                      outline: 'none',
                      textDecoration: 'none',
                      verticalAlign: 'middle',
                      objectFit: 'contain', // Use contain to fit all icons within same bounds for equal visual size
                      objectPosition: 'center center',
                      margin: '0 auto',
                      padding: 0,
                      pointerEvents: 'none', // Prevent image from blocking clicks
                      borderRadius: isCloudinaryIcon ? '50%' : '0', // Circular for Cloudinary icons
                      boxSizing: 'border-box',
                    }}
                  />
                </a>
              );
            })}
          </div>
        );

      case "divider": {
        // Only one divider line, customizable
        const borderColor = block.props.style?.borderColor || "#e0e0e0";
        const borderWidth = block.props.style?.borderWidth || "2";
        const backgroundColor = block.props.style?.backgroundColor || "#ffffff";
        const align = block.props.align || generalSettings.contentAlignment || "center";
        let margin = block.props.style?.margin || "20px 0";
        let width = block.props.style?.width || "100%";
        let alignStyle = {};
        if (align === "left") alignStyle = { marginLeft: 0, marginRight: "auto" };
        else if (align === "right") alignStyle = { marginLeft: "auto", marginRight: 0 };
        else alignStyle = { marginLeft: "auto", marginRight: "auto" };
        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect(block.id);
            }}
            style={{
              width: "100%",
              padding: "10px 0",
              cursor: "pointer",
              backgroundColor,
              ...alignStyle,
            }}
          >
            <hr
              style={{
                border: "none",
                borderTop: `${borderWidth}px solid ${borderColor}`,
                margin,
                width,
                ...alignStyle,
              }}
            />
          </div>
        );
      }

      case "columns": {
        const columns = block.props.columns || [];
        const columnBlocks = block.props.columnBlocks || {}; // Object mapping column index to array of blocks
        const columnsEditable = onUpdate !== undefined;
        
        const columnGap = block.props.style?.gap || "10px";
        const marginTop = block.props.style?.marginTop || "0px";
        const marginBottom = block.props.style?.marginBottom || "0px";
        const padding = block.props.style?.padding || "10px";
        const paddingTop = block.props.style?.paddingTop || block.props.style?.padding || "10px";
        const paddingRight = block.props.style?.paddingRight || block.props.style?.padding || "10px";
        const paddingBottom = block.props.style?.paddingBottom || block.props.style?.padding || "10px";
        const paddingLeft = block.props.style?.paddingLeft || block.props.style?.padding || "10px";
        
        return (
          <div 
            className="flex relative" 
            style={{ 
              width: "100%", 
              marginTop: marginTop,
              marginBottom: marginBottom,
              marginLeft: block.props.style?.marginLeft || "0px",
              marginRight: block.props.style?.marginRight || "0px",
              paddingTop: paddingTop,
              paddingRight: paddingRight,
              paddingBottom: paddingBottom,
              paddingLeft: paddingLeft,
              gap: columnGap,
              minHeight: "100px",
              border: selectedBlock === block.id ? "2px solid #fbc40c" : "1px dashed #d1d5db",
              borderRadius: "8px",
              backgroundColor: selectedBlock === block.id ? "#fef9e7" : "transparent",
              boxSizing: "border-box",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(block.id);
            }}
          >
            {columns.map((col: any, colIdx: number) => {
              const colBlocks = columnBlocks[colIdx] || [];
              const totalWidth = columns.reduce((sum: number, c: any) => sum + (c.width || 1), 0);
              const colWidth = totalWidth > 0 ? `${(col.width || 1) / totalWidth * 100}%` : `${100 / columns.length}%`;
              
              return (
                <div
                  key={colIdx}
                  className="relative"
                  style={{
                    width: colWidth,
                    minHeight: "80px",
                    padding: "10px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                    backgroundColor: "#fafafa",
                    position: "relative",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (!columnsEditable) {
                      e.dataTransfer.dropEffect = "none";
                      return;
                    }
                    
                    // Allow drop if it's a new block from sidebar (not moving existing block)
                    // Check effectAllowed to determine if it's a copy operation (new block)
                    const effectAllowed = e.dataTransfer.effectAllowed;
                    const types = e.dataTransfer.types;
                    const typesArray = types ? Array.from(types) : [];
                    
                    // Check if this is a new block (copy operation) vs moving existing block (move operation)
                    const isNewBlock = effectAllowed === "copy" || effectAllowed === "all" || 
                                      typesArray.includes("text/plain") || 
                                      typesArray.includes("blockType") || 
                                      typesArray.includes("application/json");
                    
                    // Always allow drop in columns if editable, we'll validate in onDrop
                    if (isNewBlock || effectAllowed !== "move") {
                      e.dataTransfer.dropEffect = "copy";
                      // Use smooth transitions for better UX
                      const target = e.currentTarget as HTMLElement;
                      target.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
                      target.style.backgroundColor = "#dbeafe";
                      target.style.borderColor = "#3b82f6";
                      target.style.borderWidth = "2px";
                      target.style.borderStyle = "dashed";
                      target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                    } else {
                      e.dataTransfer.dropEffect = "none";
                    }
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (columnsEditable) {
                      const target = e.currentTarget as HTMLElement;
                      // Use smooth transitions for better UX
                      target.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
                      target.style.backgroundColor = "#fafafa";
                      target.style.borderColor = "#e5e7eb";
                      target.style.borderWidth = "1px";
                      target.style.borderStyle = "solid";
                      target.style.boxShadow = "none";
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Reset visual styles with smooth transition
                    const target = e.currentTarget as HTMLElement;
                    target.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
                    target.style.backgroundColor = "#fafafa";
                    target.style.borderColor = "#e5e7eb";
                    target.style.borderWidth = "1px";
                    target.style.borderStyle = "solid";
                    target.style.boxShadow = "none";
                    
                    // Clear hover state after drop to prevent immediate selection
                    lastDropTime = Date.now();
                    currentHoveredBlockId = null;
                    
                    if (!columnsEditable || !onUpdate) {
                      console.log("Drop rejected: columnsEditable=", columnsEditable, "onUpdate=", !!onUpdate);
                      return;
                    }
                    
                    // Try multiple ways to get the block type
                    let blockTypeToAdd: string | null = null;
                    
                    // First try using the draggedBlockType prop (most reliable)
                    if (draggedBlockType) {
                      blockTypeToAdd = draggedBlockType;
                      console.log("Got blockType from prop:", blockTypeToAdd);
                    }
                    
                    // Then try blockType from dataTransfer
                    if (!blockTypeToAdd) {
                      try {
                        blockTypeToAdd = e.dataTransfer.getData("blockType");
                        if (blockTypeToAdd) {
                          console.log("Got blockType from dataTransfer.blockType:", blockTypeToAdd);
                        }
                      } catch (err) {
                        console.log("Error getting blockType:", err);
                      }
                    }
                    
                    // Then try text/plain
                    if (!blockTypeToAdd) {
                      try {
                        blockTypeToAdd = e.dataTransfer.getData("text/plain");
                        if (blockTypeToAdd) {
                          console.log("Got blockType from text/plain:", blockTypeToAdd);
                        }
                      } catch (err) {
                        console.log("Error getting text/plain:", err);
                      }
                    }
                    
                    // Finally try application/json
                    if (!blockTypeToAdd) {
                      try {
                        const jsonData = e.dataTransfer.getData("application/json");
                        if (jsonData) {
                          const parsed = JSON.parse(jsonData);
                          if (parsed.type === "new" && parsed.blockType) {
                            blockTypeToAdd = parsed.blockType;
                            console.log("Got blockType from application/json:", blockTypeToAdd);
                          }
                        }
                      } catch (err) {
                        console.log("Error getting application/json:", err);
                      }
                    }
                    
                    // Log all available data types for debugging
                    console.log("Available dataTransfer types:", Array.from(e.dataTransfer.types));
                    console.log("effectAllowed:", e.dataTransfer.effectAllowed);
                    console.log("draggedBlockType prop:", draggedBlockType);
                    console.log("blockTypeToAdd:", blockTypeToAdd);
                    
                    // Validate block type (exclude header/footer from being nested in columns)
                    const validBlockTypes = ["heading", "text", "button", "image", "logo", "social", "html", "menu", "divider"];
                    if (!blockTypeToAdd || !validBlockTypes.includes(blockTypeToAdd)) {
                      console.log("Invalid or missing block type:", blockTypeToAdd);
                      return;
                    }
                    
                    // Create block with proper defaults
                    const defaultProps = getDefaultProps(blockTypeToAdd);
                    const defaultContent = getDefaultContent(blockTypeToAdd);
                    
                    const newBlock: EmailBlock = {
                      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                      type: blockTypeToAdd,
                      props: {
                        ...defaultProps,
                        align: generalSettings.contentAlignment,
                        style: {
                          ...(defaultProps.style || {}),
                          fontFamily: generalSettings.fontFamily,
                          fontSize: generalSettings.fontSize,
                          color: generalSettings.textColor,
                          lineHeight: generalSettings.lineHeight,
                        },
                      },
                      content: defaultContent,
                    };
                    
                    const updatedColumnBlocks = {
                      ...columnBlocks,
                      [colIdx]: [...(columnBlocks[colIdx] || []), newBlock],
                    };
                    
                    console.log("Adding block to column:", colIdx, newBlock);
                    
                    onUpdate(block.id, {
                      props: {
                        ...block.props,
                        columnBlocks: updatedColumnBlocks,
                      },
                    });
                  }}
                >
                  {/* Column Content */}
                  {colBlocks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      <p className="mb-2">No content here.</p>
                      <p className="mb-3 text-xs">Drag blocks from right sidebar to add content.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {colBlocks.map((nestedBlock: EmailBlock, nestedIdx: number) => {
                        // Safety check: ensure nestedBlock has props
                        const safeNestedBlock = nestedBlock && nestedBlock.props 
                          ? nestedBlock 
                          : { ...nestedBlock, props: nestedBlock?.props || {} };
                        
                        return (
                        <div
                          key={safeNestedBlock.id}
                          className="relative group"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(safeNestedBlock.id);
                          }}
                        >
                          {columnsEditable && (
                            <div className="absolute top-0 right-0 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updatedColBlocks = [...colBlocks];
                                  updatedColBlocks.splice(nestedIdx, 1);
                                  const updatedColumnBlocks = {
                                    ...columnBlocks,
                                    [colIdx]: updatedColBlocks,
                                  };
                                  onUpdate(block.id, {
                                    props: {
                                      ...block.props,
                                      columnBlocks: updatedColumnBlocks,
                                    },
                                  });
                                }}
                                className="p-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                title="Delete"
                              >
                                <FaTrash className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          {/* Render nested block */}
                          <BlockRenderer
                            block={safeNestedBlock}
                            index={nestedIdx}
                            selectedBlock={selectedBlock}
                            draggedBlockId={draggedBlockId}
                            draggedBlockType={draggedBlockType}
                            dragOverIndex={dragOverIndex}
                            generalSettings={generalSettings}
                            onSelect={onSelect}
                            onDelete={(id) => {
                              const updatedColBlocks = colBlocks.filter((b: EmailBlock) => b.id !== id);
                              const updatedColumnBlocks = {
                                ...columnBlocks,
                                [colIdx]: updatedColBlocks,
                              };
                              if (onUpdate) {
                                onUpdate(block.id, {
                                  props: {
                                    ...block.props,
                                    columnBlocks: updatedColumnBlocks,
                                  },
                                });
                              }
                            }}
                            onUpdate={onUpdate ? (id, updates) => {
                              const updatedColBlocks = colBlocks.map((b: EmailBlock) => 
                                b.id === id ? { ...b, ...updates, props: { ...(b.props || {}), ...(updates.props || {}) } } : b
                              );
                              const updatedColumnBlocks = {
                                ...columnBlocks,
                                [colIdx]: updatedColBlocks,
                              };
                              onUpdate(block.id, {
                                props: {
                                  ...block.props,
                                  columnBlocks: updatedColumnBlocks,
                                },
                              });
                            } : undefined}
                            onMove={onUpdate ? (id, direction) => {
                              const currentIndex = colBlocks.findIndex((b: EmailBlock) => b.id === id);
                              if (
                                (direction === "up" && currentIndex === 0) ||
                                (direction === "down" && currentIndex === colBlocks.length - 1)
                              ) {
                                return; // Can't move further
                              }
                              
                              const newColBlocks = [...colBlocks];
                              const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
                              // Swap blocks
                              [newColBlocks[currentIndex], newColBlocks[newIndex]] = [
                                newColBlocks[newIndex],
                                newColBlocks[currentIndex],
                              ];
                              
                              const updatedColumnBlocks = {
                                ...columnBlocks,
                                [colIdx]: newColBlocks,
                              };
                              onUpdate(block.id, {
                                props: {
                                  ...block.props,
                                  columnBlocks: updatedColumnBlocks,
                                },
                              });
                            } : undefined}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            isNested={true}
                            totalBlocks={colBlocks.length}
                          />
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      case "menu":
        const menuItems = block.props.items || [];
        const menuAlign = block.props.align !== undefined && block.props.align !== null
          ? block.props.align
          : generalSettings.contentAlignment;
        const separator = block.props.separator || "";
        const layout = block.props.layout || "horizontal";
        const linkColor = block.props.style?.linkColor || generalSettings.linkColor || "#0066cc";
        
        const menuStyle = {
          fontFamily: block.props.style?.fontFamily || generalSettings.fontFamily || "Arial, sans-serif",
          fontSize: block.props.style?.fontSize || "14px",
          fontWeight: block.props.style?.fontWeight || "normal",
          letterSpacing: block.props.style?.letterSpacing || "0px",
          color: block.props.style?.color || generalSettings.textColor || "#000000",
          textAlign: menuAlign === "justify" ? "justify" : menuAlign,
          width: "100%",
          padding: block.props.style?.padding || "5px 15px",
          display: layout === "horizontal" && menuAlign === "justify" ? "block" : (layout === "horizontal" ? "flex" : "block"),
          flexDirection: layout === "horizontal" ? "row" : "column",
          alignItems: layout === "horizontal" ? "center" : "flex-start",
          justifyContent: menuAlign === "left" ? "flex-start" : menuAlign === "right" ? "flex-end" : (menuAlign === "justify" ? "space-between" : "center"),
          gap: layout === "horizontal" ? "8px" : "4px",
          ...(block.props.style || {}),
        };
        
        return (
          <div style={menuStyle}>
            {menuItems.length === 0 ? (
              <span className="text-gray-400 text-sm">No menu items. Add items in the properties panel.</span>
            ) : (
              menuItems.map((item: any, idx: number) => {
                const itemHref = item.url || item.href || "#";
                const itemTarget = item.target || "_self";
                const itemLabel = item.label || "Menu Item";
                
                return (
                  <React.Fragment key={idx}>
                    <a
                      href={itemHref}
                      target={itemTarget}
                      className="hover:opacity-80 transition-opacity"
                      style={{
                        color: linkColor,
                        textDecoration: "none",
                        margin: 0,
                      }}
                    >
                      {itemLabel}
                    </a>
                    {idx < menuItems.length - 1 && separator && (
                      <span style={{ color: menuStyle.color, margin: "0 4px" }}>{separator}</span>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </div>
        );

      case "logo":
        const logoWidth = typeof block.props.width === 'number' 
          ? block.props.width 
          : (typeof block.props.width === 'string' ? parseInt(String(block.props.width)) || 100 : 100);
        const logoHeight = typeof block.props.height === 'number' 
          ? block.props.height 
          : (typeof block.props.height === 'string' ? parseInt(String(block.props.height)) || 100 : 100);
        const alignStyle = block.props.align !== undefined && block.props.align !== null
          ? block.props.align
          : generalSettings.contentAlignment;
        
        // Calculate responsive max width based on content width to prevent layout breaks
        const contentWidth = parseInt(generalSettings.contentWidth) || 800;
        const padding = parseInt(generalSettings.padding) || 40;
        const maxLogoWidth = Math.min(logoWidth, contentWidth - (padding * 2) - 20); // Account for padding on both sides
        
        return (
          <div
            style={{
              width: "100%",
              margin: 0,
              padding: "10px 0",
              overflow: "hidden",
              boxSizing: "border-box",
              display: "flex",
              justifyContent: alignStyle === "left" ? "flex-start" : alignStyle === "right" ? "flex-end" : "center",
              alignItems: "center",
              textAlign: alignStyle,
            }}
          >
            {block.props.imageSrc ? (
              <img
                src={block.props.imageSrc}
                alt="Logo"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div style="width: ${logoWidth}px; max-width: 100%; height: auto; aspect-ratio: ${logoWidth} / ${logoHeight}; min-height: ${Math.min(logoHeight, 50)}px; display: flex; align-items: center; justify-content: center; border: 2px dashed #d1d5db; border-radius: 8px; background-color: #f9fafb; box-sizing: border-box; margin: ${alignStyle === "left" ? "0" : alignStyle === "right" ? "0 0 0 auto" : "0 auto"};">
                        <span style="color: #9ca3af; font-size: 12px;">Logo</span>
                      </div>
                    `;
                  }
                }}
                onLoad={(e) => {
                  // Image loaded successfully
                  const target = e.target as HTMLImageElement;
                  target.style.display = "block";
                }}
                style={{
                  width: `${logoWidth}px`,
                  maxWidth: "100%",
                  height: "auto",
                  aspectRatio: `${logoWidth} / ${logoHeight}`,
                  display: "block",
                  objectFit: "contain",
                  imageRendering: "auto" as any,
                  WebkitBackfaceVisibility: "hidden",
                  WebkitTransform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                  transform: "translateZ(0)",
                  boxSizing: "border-box",
                  margin: alignStyle === "left" ? "0" : alignStyle === "right" ? "0 0 0 auto" : "0 auto",
                } as React.CSSProperties}
                className="select-none"
              />
            ) : (
              <div
                style={{
                  width: `${logoWidth}px`,
                  maxWidth: "100%",
                  height: "auto",
                  aspectRatio: `${logoWidth} / ${logoHeight}`,
                  minHeight: `${Math.min(logoHeight, 50)}px`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed #d1d5db",
                  borderRadius: "8px",
                  backgroundColor: "#f9fafb",
                  boxSizing: "border-box",
                  margin: alignStyle === "left" ? "0" : alignStyle === "right" ? "0 0 0 auto" : "0 auto",
                }}
              >
                <FaIcons
                  style={{
                    fontSize: "24px",
                    color: "#9ca3af",
                  }}
                />
              </div>
            )}
          </div>
        );

      case "html":
        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect(block.id);
            }}
            dangerouslySetInnerHTML={{ __html: block.content || "<!-- Your HTML code here -->" }}
            className="p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer min-h-[50px]"
            style={{
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              overflow: "hidden",
              wordWrap: "break-word",
              wordBreak: "break-word",
              ...(block.props.style || {}),
            }}
          />
        );

      case "header": {
        const headerBlocks = block.props.headerBlocks || [];
        const headerEditable = onUpdate !== undefined;
        const headerStyle = block.props.style || {};
        
        const headerAlign = (block.props.align !== undefined && block.props.align !== null)
          ? block.props.align
          : generalSettings.contentAlignment;
        
        return (
          <div
            className="relative"
            style={{
              width: "100%",
              backgroundColor: headerStyle.backgroundColor || "#f8f9fa",
              padding: headerStyle.padding || "20px",
              borderBottom: headerStyle.borderBottom || "2px solid #e0e0e0",
              borderTop: headerStyle.borderTop || "none",
              borderLeft: selectedBlock === block.id ? "2px solid #fbc40c" : "1px solid #d1d5db",
              borderRight: selectedBlock === block.id ? "2px solid #fbc40c" : "1px solid #d1d5db",
              marginTop: headerStyle.marginTop || "0px",
              marginBottom: headerStyle.marginBottom || "0px",
              minHeight: "80px",
              borderRadius: "8px 8px 0 0",
              boxSizing: "border-box",
              textAlign: headerAlign as any,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(block.id);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (headerEditable) {
                const effectAllowed = e.dataTransfer.effectAllowed;
                const types = e.dataTransfer.types;
                const typesArray = types ? Array.from(types) : [];
                const isNewBlock = effectAllowed === "copy" || effectAllowed === "all" || 
                                  typesArray.includes("text/plain") || 
                                  typesArray.includes("blockType") || 
                                  typesArray.includes("application/json");
                if (isNewBlock || effectAllowed !== "move") {
                  e.dataTransfer.dropEffect = "copy";
                  e.currentTarget.style.backgroundColor = "#dbeafe";
                }
              }
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (headerEditable) {
                e.currentTarget.style.backgroundColor = headerStyle.backgroundColor || "#f8f9fa";
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              lastDropTime = Date.now();
              currentHoveredBlockId = null;
              
              if (!headerEditable || !onUpdate) return;
              
              let blockTypeToAdd: string | null = null;
              if (draggedBlockType) {
                blockTypeToAdd = draggedBlockType;
              } else {
                try {
                  blockTypeToAdd = e.dataTransfer.getData("blockType") || 
                                  e.dataTransfer.getData("text/plain");
                  if (!blockTypeToAdd) {
                    const jsonData = e.dataTransfer.getData("application/json");
                    if (jsonData) {
                      const parsed = JSON.parse(jsonData);
                      if (parsed.type === "new" && parsed.blockType) {
                        blockTypeToAdd = parsed.blockType;
                      }
                    }
                  }
                } catch (err) {
                  console.log("Error getting block type:", err);
                }
              }
              
              const validBlockTypes = ["heading", "text", "button", "image", "logo", "social", "menu", "divider"];
              if (!blockTypeToAdd || !validBlockTypes.includes(blockTypeToAdd)) {
                return;
              }
              
              const defaultProps = getDefaultProps(blockTypeToAdd);
              const defaultContent = getDefaultContent(blockTypeToAdd);
              
              const newBlock: EmailBlock = {
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: blockTypeToAdd,
                props: {
                  ...defaultProps,
                  align: generalSettings.contentAlignment,
                  style: {
                    ...(defaultProps.style || {}),
                    fontFamily: generalSettings.fontFamily,
                    fontSize: generalSettings.fontSize,
                    color: generalSettings.textColor,
                    lineHeight: generalSettings.lineHeight,
                  },
                },
                content: defaultContent,
              };
              
              const updatedHeaderBlocks = [...headerBlocks, newBlock];
              
              onUpdate(block.id, {
                props: {
                  ...block.props,
                  headerBlocks: updatedHeaderBlocks,
                },
              });
              
              e.currentTarget.style.backgroundColor = headerStyle.backgroundColor || "#f8f9fa";
            }}
          >
            {headerBlocks.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <p className="mb-2">Header area</p>
                <p className="mb-3 text-xs">Drag blocks here to add header content.</p>
              </div>
            ) : (
              <div className="space-y-2" style={{ textAlign: headerAlign as any }}>
                {headerBlocks.map((nestedBlock: EmailBlock, nestedIdx: number) => {
                  // Use nested block's alignment if set, otherwise use header alignment
                  const nestedAlign = (nestedBlock.props && nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                    ? nestedBlock.props.align
                    : headerAlign;
                  
                  // Check if this nested block is being dragged
                  const isDraggedNestedBlock = draggedBlockId === nestedBlock.id;
                  
                  return (
                    <React.Fragment key={nestedBlock.id}>
                      {/* Drop zone before each nested block */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (draggedBlockId && headerBlocks.some((b: EmailBlock) => b.id === draggedBlockId)) {
                            e.dataTransfer.dropEffect = "move";
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (draggedBlockId && onUpdate) {
                            const sourceIndex = headerBlocks.findIndex((b: EmailBlock) => b.id === draggedBlockId);
                            if (sourceIndex !== -1 && sourceIndex !== nestedIdx) {
                              const newHeaderBlocks = [...headerBlocks];
                              const [movedBlock] = newHeaderBlocks.splice(sourceIndex, 1);
                              const finalIndex = sourceIndex < nestedIdx ? nestedIdx - 1 : nestedIdx;
                              newHeaderBlocks.splice(finalIndex, 0, movedBlock);
                              onUpdate(block.id, {
                                props: {
                                  ...block.props,
                                  headerBlocks: newHeaderBlocks,
                                },
                              });
                            }
                          }
                        }}
                        className={`transition-all duration-200 ${
                          draggedBlockId && headerBlocks.some((b: EmailBlock) => b.id === draggedBlockId) && !isDraggedNestedBlock
                            ? "h-4 bg-blue-200 border-t-2 border-blue-400"
                            : "h-1 bg-transparent"
                        }`}
                        style={{ width: "100%" }}
                      />
                  <div
                    className="relative group"
                    style={{ textAlign: nestedAlign as any }}
                  >
                    <BlockRenderer
                      block={{ ...nestedBlock, props: nestedBlock.props || {} }}
                      index={nestedIdx}
                      selectedBlock={selectedBlock}
                      draggedBlockId={draggedBlockId}
                      draggedBlockType={draggedBlockType}
                      dragOverIndex={dragOverIndex}
                      generalSettings={generalSettings}
                      onSelect={onSelect}
                      onDelete={(id) => {
                        const updatedHeaderBlocks = headerBlocks.filter((b: EmailBlock) => b.id !== id);
                        if (onUpdate) {
                          onUpdate(block.id, {
                            props: {
                              ...block.props,
                              headerBlocks: updatedHeaderBlocks,
                            },
                          });
                        }
                      }}
                      onUpdate={onUpdate ? (id, updates) => {
                        const updatedHeaderBlocks = headerBlocks.map((b: EmailBlock) => {
                          if (b.id === id) {
                            // Properly merge props if updates contain props
                            if (updates.props && b.props) {
                              return {
                                ...b,
                                ...updates,
                                props: {
                                  ...b.props,
                                  ...updates.props,
                                  // Deep merge style if both exist
                                  style: updates.props.style || b.props.style
                                    ? {
                                        ...(b.props.style || {}),
                                        ...(updates.props.style || {}),
                                      }
                                    : undefined,
                                },
                              };
                            }
                            return { ...b, ...updates };
                          }
                          return b;
                        });
                        onUpdate(block.id, {
                          props: {
                            ...block.props,
                            headerBlocks: updatedHeaderBlocks,
                          },
                        });
                      } : undefined}
                      onMove={onUpdate ? (id, direction) => {
                        const currentIndex = headerBlocks.findIndex((b: EmailBlock) => b.id === id);
                        if (
                          (direction === "up" && currentIndex === 0) ||
                          (direction === "down" && currentIndex === headerBlocks.length - 1)
                        ) {
                          return; // Can't move further
                        }
                        
                        const newHeaderBlocks = [...headerBlocks];
                        const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
                        // Swap blocks
                        [newHeaderBlocks[currentIndex], newHeaderBlocks[newIndex]] = [
                          newHeaderBlocks[newIndex],
                          newHeaderBlocks[currentIndex],
                        ];
                        
                        onUpdate(block.id, {
                          props: {
                            ...block.props,
                            headerBlocks: newHeaderBlocks,
                          },
                        });
                      } : undefined}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      isNested={true}
                      totalBlocks={headerBlocks.length}
                    />
                  </div>
                  </React.Fragment>
                  );
                })}
                {/* Drop zone after last nested block */}
                {headerBlocks.length > 0 && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedBlockId && headerBlocks.some((b: EmailBlock) => b.id === draggedBlockId)) {
                        e.dataTransfer.dropEffect = "move";
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedBlockId && onUpdate) {
                        const sourceIndex = headerBlocks.findIndex((b: EmailBlock) => b.id === draggedBlockId);
                        if (sourceIndex !== -1 && sourceIndex !== headerBlocks.length - 1) {
                          const newHeaderBlocks = [...headerBlocks];
                          const [movedBlock] = newHeaderBlocks.splice(sourceIndex, 1);
                          newHeaderBlocks.push(movedBlock);
                          onUpdate(block.id, {
                            props: {
                              ...block.props,
                              headerBlocks: newHeaderBlocks,
                            },
                          });
                        }
                      }
                    }}
                    className={`transition-all duration-200 ${
                      draggedBlockId && headerBlocks.some((b: EmailBlock) => b.id === draggedBlockId)
                        ? "h-4 bg-blue-200 border-t-2 border-blue-400"
                        : "h-1 bg-transparent"
                    }`}
                    style={{ width: "100%" }}
                  />
                )}
              </div>
            )}
          </div>
        );
      }

      case "footer": {
        const footerBlocks = block.props.footerBlocks || [];
        const footerEditable = onUpdate !== undefined;
        const footerStyle = block.props.style || {};
        
        const footerAlign = (block.props.align !== undefined && block.props.align !== null)
          ? block.props.align
          : generalSettings.contentAlignment;
        
        return (
          <div
            className="relative"
            style={{
              width: "100%",
              backgroundColor: footerStyle.backgroundColor || "#f8f9fa",
              padding: footerStyle.padding || "20px",
              borderTop: footerStyle.borderTop || "2px solid #e0e0e0",
              borderBottom: footerStyle.borderBottom || "none",
              borderLeft: selectedBlock === block.id ? "2px solid #fbc40c" : "1px solid #d1d5db",
              borderRight: selectedBlock === block.id ? "2px solid #fbc40c" : "1px solid #d1d5db",
              marginTop: footerStyle.marginTop || "0px",
              marginBottom: footerStyle.marginBottom || "0px",
              minHeight: "80px",
              borderRadius: "0 0 8px 8px",
              boxSizing: "border-box",
              textAlign: footerAlign as any,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(block.id);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (footerEditable) {
                const effectAllowed = e.dataTransfer.effectAllowed;
                const types = e.dataTransfer.types;
                const typesArray = types ? Array.from(types) : [];
                const isNewBlock = effectAllowed === "copy" || effectAllowed === "all" || 
                                  typesArray.includes("text/plain") || 
                                  typesArray.includes("blockType") || 
                                  typesArray.includes("application/json");
                if (isNewBlock || effectAllowed !== "move") {
                  e.dataTransfer.dropEffect = "copy";
                  e.currentTarget.style.backgroundColor = "#dbeafe";
                }
              }
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (footerEditable) {
                e.currentTarget.style.backgroundColor = footerStyle.backgroundColor || "#f8f9fa";
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              lastDropTime = Date.now();
              currentHoveredBlockId = null;
              
              if (!footerEditable || !onUpdate) return;
              
              let blockTypeToAdd: string | null = null;
              if (draggedBlockType) {
                blockTypeToAdd = draggedBlockType;
              } else {
                try {
                  blockTypeToAdd = e.dataTransfer.getData("blockType") || 
                                  e.dataTransfer.getData("text/plain");
                  if (!blockTypeToAdd) {
                    const jsonData = e.dataTransfer.getData("application/json");
                    if (jsonData) {
                      const parsed = JSON.parse(jsonData);
                      if (parsed.type === "new" && parsed.blockType) {
                        blockTypeToAdd = parsed.blockType;
                      }
                    }
                  }
                } catch (err) {
                  console.log("Error getting block type:", err);
                }
              }
              
              const validBlockTypes = ["heading", "text", "button", "image", "logo", "social", "menu", "divider"];
              if (!blockTypeToAdd || !validBlockTypes.includes(blockTypeToAdd)) {
                return;
              }
              
              const defaultProps = getDefaultProps(blockTypeToAdd);
              const defaultContent = getDefaultContent(blockTypeToAdd);
              
              const newBlock: EmailBlock = {
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: blockTypeToAdd,
                props: {
                  ...defaultProps,
                  align: footerAlign, // Use footer alignment for new blocks
                  style: {
                    ...(defaultProps.style || {}),
                    fontFamily: generalSettings.fontFamily,
                    fontSize: generalSettings.fontSize,
                    color: generalSettings.textColor,
                    lineHeight: generalSettings.lineHeight,
                  },
                },
                content: defaultContent,
              };
              
              const updatedFooterBlocks = [...footerBlocks, newBlock];
              
              onUpdate(block.id, {
                props: {
                  ...block.props,
                  footerBlocks: updatedFooterBlocks,
                },
              });
              
              e.currentTarget.style.backgroundColor = footerStyle.backgroundColor || "#f8f9fa";
            }}
          >
            {footerBlocks.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <p className="mb-2">Footer area</p>
                <p className="mb-3 text-xs">Drag blocks here to add footer content.</p>
              </div>
            ) : (
              <div className="space-y-2" style={{ textAlign: footerAlign as any }}>
                {footerBlocks.map((nestedBlock: EmailBlock, nestedIdx: number) => {
                  // Use nested block's alignment if set, otherwise use footer alignment
                  const nestedAlign = (nestedBlock.props && nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                    ? nestedBlock.props.align
                    : footerAlign;
                  
                  // Check if this nested block is being dragged
                  const isDraggedNestedBlock = draggedBlockId === nestedBlock.id;
                  
                  return (
                    <React.Fragment key={nestedBlock.id}>
                      {/* Drop zone before each nested block */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Only handle if dragging a footer block
                          if (draggedBlockId && footerBlocks.some((b: EmailBlock) => b.id === draggedBlockId)) {
                            e.dataTransfer.dropEffect = "move";
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Handle reordering within footer
                          if (draggedBlockId && onUpdate) {
                            const sourceIndex = footerBlocks.findIndex((b: EmailBlock) => b.id === draggedBlockId);
                            if (sourceIndex !== -1 && sourceIndex !== nestedIdx) {
                              const newFooterBlocks = [...footerBlocks];
                              const [movedBlock] = newFooterBlocks.splice(sourceIndex, 1);
                              const finalIndex = sourceIndex < nestedIdx ? nestedIdx - 1 : nestedIdx;
                              newFooterBlocks.splice(finalIndex, 0, movedBlock);
                              onUpdate(block.id, {
                                props: {
                                  ...block.props,
                                  footerBlocks: newFooterBlocks,
                                },
                              });
                            }
                          }
                        }}
                        className={`transition-all duration-200 ${
                          draggedBlockId && footerBlocks.some((b: EmailBlock) => b.id === draggedBlockId) && !isDraggedNestedBlock
                            ? "h-4 bg-blue-200 border-t-2 border-blue-400"
                            : "h-1 bg-transparent"
                        }`}
                        style={{ width: "100%" }}
                      />
                      <div
                        className="relative"
                        style={{ textAlign: nestedAlign as any }}
                      >
                        <BlockRenderer
                        block={{ ...nestedBlock, props: nestedBlock.props || {} }}
                        index={nestedIdx}
                        selectedBlock={selectedBlock}
                        draggedBlockId={draggedBlockId}
                        draggedBlockType={draggedBlockType}
                        dragOverIndex={dragOverIndex}
                        generalSettings={generalSettings}
                        onSelect={onSelect}
                        onDelete={(id) => {
                          const updatedFooterBlocks = footerBlocks.filter((b: EmailBlock) => b.id !== id);
                          if (onUpdate) {
                            onUpdate(block.id, {
                              props: {
                                ...block.props,
                                footerBlocks: updatedFooterBlocks,
                              },
                            });
                          }
                        }}
                        onUpdate={onUpdate ? (id, updates) => {
                          const updatedFooterBlocks = footerBlocks.map((b: EmailBlock) => {
                            if (b.id === id) {
                              // Properly merge props if updates contain props
                              if (updates.props && b.props) {
                                return {
                                  ...b,
                                  ...updates,
                                  props: {
                                    ...b.props,
                                    ...updates.props,
                                    // Deep merge style if both exist
                                    style: updates.props.style || b.props.style
                                      ? {
                                          ...(b.props.style || {}),
                                          ...(updates.props.style || {}),
                                        }
                                      : undefined,
                                  },
                                };
                              }
                              return { ...b, ...updates };
                            }
                            return b;
                          });
                          onUpdate(block.id, {
                            props: {
                              ...block.props,
                              footerBlocks: updatedFooterBlocks,
                            },
                          });
                        } : undefined}
                        onMove={onUpdate ? (id, direction) => {
                          const currentIndex = footerBlocks.findIndex((b: EmailBlock) => b.id === id);
                          if (
                            (direction === "up" && currentIndex === 0) ||
                            (direction === "down" && currentIndex === footerBlocks.length - 1)
                          ) {
                            return; // Can't move further
                          }
                          
                          const newFooterBlocks = [...footerBlocks];
                          const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
                          // Swap blocks
                          [newFooterBlocks[currentIndex], newFooterBlocks[newIndex]] = [
                            newFooterBlocks[newIndex],
                            newFooterBlocks[currentIndex],
                          ];
                          
                          onUpdate(block.id, {
                            props: {
                              ...block.props,
                              footerBlocks: newFooterBlocks,
                            },
                          });
                        } : undefined}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        isNested={true}
                        totalBlocks={footerBlocks.length}
                      />
                      </div>
                    </React.Fragment>
                  );
                })}
                {/* Drop zone after last nested block */}
                {footerBlocks.length > 0 && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedBlockId && footerBlocks.some((b: EmailBlock) => b.id === draggedBlockId)) {
                        e.dataTransfer.dropEffect = "move";
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedBlockId && onUpdate) {
                        const sourceIndex = footerBlocks.findIndex((b: EmailBlock) => b.id === draggedBlockId);
                        if (sourceIndex !== -1 && sourceIndex !== footerBlocks.length - 1) {
                          const newFooterBlocks = [...footerBlocks];
                          const [movedBlock] = newFooterBlocks.splice(sourceIndex, 1);
                          newFooterBlocks.push(movedBlock);
                          onUpdate(block.id, {
                            props: {
                              ...block.props,
                              footerBlocks: newFooterBlocks,
                            },
                          });
                        }
                      }
                    }}
                    className={`transition-all duration-200 ${
                      draggedBlockId && footerBlocks.some((b: EmailBlock) => b.id === draggedBlockId)
                        ? "h-4 bg-blue-200 border-t-2 border-blue-400"
                        : "h-1 bg-transparent"
                    }`}
                    style={{ width: "100%" }}
                  />
                )}
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  // For nested blocks (inside columns), render without wrapper and delete button
  if (isNested) {
    return (
      <div
        key={`${block.id}-nested-${block.props.align || generalSettings.contentAlignment}`}
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          onDragStart(e, block.id);
        }}
        onDragEnd={(e) => {
          e.stopPropagation();
          onDragEnd(e);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(block.id);
        }}
        className={`group relative flex items-start ${
          selectedBlock === block.id
            ? "bg-yellow-50 border-2 border-[#fbc40c] rounded"
            : "border border-transparent hover:border-gray-200 rounded"
        } ${draggedBlockId === block.id ? "opacity-50" : ""}`}
        style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
      >
        <div className="flex items-start gap-2 shrink-0 mr-2">
          <div
            className="flex items-center gap-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing shrink-0"
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder"
          >
            <FaGripVertical className="w-3 h-3" />
          </div>
          {onMove && (
            <div className="flex flex-col gap-1 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onMove(block.id, "up");
                }}
                disabled={index === 0}
                className={`p-1 text-gray-500 hover:text-[#fbc40c] hover:bg-yellow-50 rounded transition-all ${
                  index === 0 ? "opacity-30 cursor-not-allowed" : "opacity-70 hover:opacity-100"
                }`}
                title="Move up"
                type="button"
              >
                <FaArrowUp className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onMove(block.id, "down");
                }}
                disabled={totalBlocks > 0 && index === totalBlocks - 1}
                className={`p-1 text-gray-500 hover:text-[#fbc40c] hover:bg-yellow-50 rounded transition-all ${
                  totalBlocks > 0 && index === totalBlocks - 1 ? "opacity-30 cursor-not-allowed" : "opacity-70 hover:opacity-100"
                }`}
                title="Move down"
                type="button"
              >
                <FaArrowDown className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0" style={{ width: "100%", overflowX: "hidden", overflowY: "visible", boxSizing: "border-box" }}>
          {renderBlockContent()}
        </div>
        {isMultiSelectMode ? null : onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (onDeleteRequest) {
                onDeleteRequest(block.id, () => {
                  onDelete(block.id);
                });
              } else {
                // Fallback to direct delete if no confirmation handler
                onDelete(block.id);
              }
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all shrink-0 ml-2"
            title="Delete block"
            type="button"
          >
            <FaTrash className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  // For top-level blocks, render with full wrapper and controls
  return (
    <div
        key={`${block.id}-${block.props.align || generalSettings.contentAlignment}`}
        draggable={true}
        onDragStart={(e) => {
          e.stopPropagation();
          onDragStart(e, block.id);
        }}
        onDragEnd={(e) => {
          e.stopPropagation();
          onDragEnd(e);
        }}
      onDragOver={(e) => {
        // Only handle dragOver for existing blocks being moved
        // For new blocks from sidebar, let drop zones handle it
        if (draggedBlockId) {
          e.preventDefault();
          e.stopPropagation();
          onDragOver(e, index);
        } else if (!draggedBlockType) {
          // Only prevent default if not dragging a new block
          e.preventDefault();
          e.stopPropagation();
        }
        // If dragging new block (draggedBlockType), don't prevent default
        // This allows drop zones to receive the event
      }}
      onDragLeave={(e) => {
        // Don't clear drag over when moving to child elements
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (relatedTarget && (e.currentTarget as HTMLElement).contains(relatedTarget)) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        onDragLeave();
      }}
      onDrop={(e) => {
        // Only handle drop on block if it's an existing block being moved
        // For new blocks from sidebar, don't handle here - let drop zones handle it
        // This prevents conflicts and ensures blocks insert at the exact drop position
        if (draggedBlockId && draggedBlockId !== block.id) {
          e.preventDefault();
          e.stopPropagation();
          // Moving existing block - insert after current block (index + 1)
          lastDropTime = Date.now();
          currentHoveredBlockId = null;
          onDrop(e, index + 1);
        }
        // For new blocks (draggedBlockType), don't handle here
        // The drop zones before/after blocks will handle insertion at correct position
        // Also don't handle if dropping on the same block (no-op)
      }}
      onClick={(e) => {
        // Don't select if clicking inside RichTextEditor (to prevent popup when typing)
        const target = e.target as HTMLElement;
        if (target.closest('.tiptap') || target.closest('[contenteditable="true"]') || target.closest('.rich-text-editor')) {
          return;
        }
        onSelect(block.id);
      }}
      className={`group relative border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-move ${
        isBlockSelected
          ? "bg-yellow-50 border-l-4 border-l-[#fbc40c]"
          : ""
      } ${isMultiSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""} ${draggedBlockId === block.id ? "opacity-50" : ""} ${
        dragOverIndex === index ? "bg-blue-50 border-blue-300" : ""
      }`}
      style={{ width: "100%", overflowX: "hidden", overflowY: "visible", boxSizing: "border-box" }}
    >
      <div className="flex items-start p-2" style={{ width: "100%", overflowX: "hidden", overflowY: "visible", boxSizing: "border-box" }}>
        {isMultiSelectMode && onToggleSelect && (
          <div className="mr-2 shrink-0 flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect(block.id);
              }}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        <div
          className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mr-2 cursor-grab active:cursor-grabbing shrink-0"
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder"
        >
          <FaGripVertical className="w-4 h-4" />
        </div>
        {onMove && (
          <div className="flex flex-col gap-1 mr-2 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onMove(block.id, "up");
              }}
              disabled={index === 0}
              className={`p-1.5 text-gray-500 hover:text-[#fbc40c] hover:bg-yellow-50 rounded transition-all ${
                index === 0 ? "opacity-30 cursor-not-allowed" : "opacity-70 hover:opacity-100"
              }`}
              title="Move up"
              type="button"
            >
              <FaArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onMove(block.id, "down");
              }}
              disabled={totalBlocks > 0 && index === totalBlocks - 1}
              className={`p-1.5 text-gray-500 hover:text-[#fbc40c] hover:bg-yellow-50 rounded transition-all ${
                totalBlocks > 0 && index === totalBlocks - 1 ? "opacity-30 cursor-not-allowed" : "opacity-70 hover:opacity-100"
              }`}
              title="Move down"
              type="button"
            >
              <FaArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div
          className="flex-1 min-w-0"
          onClick={(e) => {
            // For divider and HTML blocks, ensure click propagates to select
            if (block.type === "divider" || block.type === "html") {
              e.stopPropagation();
              onSelect(block.id);
            }
          }}
          style={{
            textAlign:
              block.props.align !== undefined && block.props.align !== null
                ? block.props.align
                : generalSettings.contentAlignment,
            width: "100%",
            overflowX: "hidden",
            overflowY: "visible",
            boxSizing: "border-box",
            maxWidth: "100%",
          }}
        >
          {renderBlockContent()}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onDeleteRequest) {
              onDeleteRequest(block.id, () => {
                onDelete(block.id);
              });
            } else {
              // Fallback to direct delete if no confirmation handler
              onDelete(block.id);
            }
          }}
          className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all shrink-0"
          title="Delete block"
          type="button"
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};