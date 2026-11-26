import { EmailBlock, GeneralSettings } from "./types";
import { getStyleString, getSocialIconColor, getSocialIconSVG, escapeHtmlAttribute } from "./utils";

// Helper function to get social icon PNG image URL
// Uses Cloudinary CDN for optimized social media icons for email compatibility
// These icons will be displayed on colored circle backgrounds to match the editor
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

// Helper function to create social icon HTML with email compatibility
// IMPORTANT: Gmail strips SVG entirely (both inline and data URIs)
// Solution: Use reliable CDN that provides PNG images
// Helper to create social icon image tag - perfectly centered to match desktop
const createSocialIconContent = (iconName: string, iconSize: number): string => {
  const imageUrl = getSocialIconImageUrl(iconName);
  const escapedUrl = escapeHtmlAttribute(imageUrl);
  const escapedAlt = escapeHtmlAttribute(iconName);

  // Cloudinary images are complete professional icons - ensure all icons are exactly the same size
  // Use contain to fit all icons within same bounds, ensuring equal visual size for all icons
  return `<img src="${escapedUrl}" alt="${escapedAlt}" width="${iconSize}" height="${iconSize}" border="0" style="width: ${iconSize}px !important; height: ${iconSize}px !important; min-width: ${iconSize}px !important; min-height: ${iconSize}px !important; max-width: ${iconSize}px !important; max-height: ${iconSize}px !important; display: block !important; border: 0 !important; outline: none !important; text-decoration: none !important; margin: 0 auto !important; padding: 0 !important; vertical-align: middle !important; object-fit: contain !important; object-position: center center !important; pointer-events: none !important; border-radius: 50% !important; box-sizing: border-box !important;" />`;
};

// Helper function to convert relative paths to absolute URLs for emails
const getAbsoluteImageUrl = (imageSrc: string): string => {
  if (!imageSrc) return "";
  // If already an absolute URL, return as is
  if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
    return imageSrc;
  }
  // Convert relative paths to absolute URLs
  // For production, use the actual domain; for development, use localhost or configured domain
  const baseUrl = "https://cms.ezwealth.in";
  if (imageSrc.startsWith("/")) {
    return `${baseUrl}${imageSrc}`;
  }
  return imageSrc;
};

export const generateEmailHTML = (
  blocksList: EmailBlock[],
  generalSettings: GeneralSettings,
  forEmail: boolean = true // true = email-compatible (table-based), false = preview (flexbox)
): string => {
  const contentWidth = generalSettings.contentWidth || "500";
  const backgroundColor = generalSettings.backgroundColor || "#ffffff";
  const textColor = generalSettings.textColor || "#111827";
  const fontFamily = generalSettings.fontFamily || "Arial, sans-serif";
  const contentAlignment = generalSettings.contentAlignment || "center";

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
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
      max-width: 100%;
      height: auto;
    }
    
    /* Mobile-first: Ensure all content is responsive by default */
    * {
      box-sizing: border-box;
    }
    
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
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
    
    .email-container {
      max-width: ${contentWidth}px;
      margin: 0 auto;
      background-color: ${backgroundColor};
      border-radius: ${generalSettings.borderRadius || "8px"};
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 0;
      margin-bottom: 0;
    }
    
    .email-content {
      padding: ${generalSettings.padding || "40px 30px 0 30px"};
      line-height: ${generalSettings.lineHeight || "1.6"};
      color: ${textColor};
      font-family: ${fontFamily};
      font-size: ${generalSettings.fontSize || "16px"};
      /* Don't set text-align here - each block handles its own alignment */
    }
    
    a {
      color: ${generalSettings.linkColor || "#007bff"};
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    /* Ensure link color applies to all links including buttons */
    .button {
      color: inherit !important;
    }
    
    /* Links in text content */
    p a, h1 a, h2 a, h3 a, h4 a, h5 a, h6 a {
      color: ${generalSettings.linkColor || "#007bff"};
      text-decoration: underline;
    }
    
    p a:hover, h1 a:hover, h2 a:hover, h3 a:hover, h4 a:hover, h5 a:hover, h6 a:hover {
      color: ${generalSettings.linkColor || "#007bff"};
      text-decoration: none;
    }
    
    /* Social Icons Styling - Ensure shadows and layout match desktop exactly */
    .social-icons-container {
      display: flex !important;
      align-items: center !important;
      overflow: visible !important;
    }
    
    /* Force shadows on all social icon links - critical for preview */
    .social-icons-container a {
      -webkit-box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15) !important;
      -moz-box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15) !important;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      text-decoration: none !important;
      border: none !important;
      outline: none !important;
      position: relative !important;
    }
    
    .social-icons-container img {
      display: block !important;
      border: 0 !important;
      outline: none !important;
      text-decoration: none !important;
      object-fit: contain !important;
      object-position: center center !important;
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
    
    /* Columns - Use table layout for email compatibility */
    .columns-wrapper {
      display: table;
      width: 100%;
      margin: 20px 0;
      border-collapse: collapse;
      table-layout: fixed;
    }
    
    .column {
      display: table-cell;
      padding: 15px;
      vertical-align: top;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-content {
        padding: 20px 15px 0 15px !important;
      }
      
      .email-container {
        border-radius: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
        padding: 0 !important;
        margin-bottom: 0 !important;
      }
      
      /* Typography */
      h1 { font-size: 24px !important; line-height: 1.3 !important; }
      h2 { font-size: 20px !important; line-height: 1.3 !important; }
      h3 { font-size: 18px !important; line-height: 1.3 !important; }
      h4 { font-size: 16px !important; line-height: 1.3 !important; }
      h5 { font-size: 14px !important; line-height: 1.3 !important; }
      h6 { font-size: 12px !important; line-height: 1.3 !important; }
      p, div, span, td {
        font-size: 14px !important;
        line-height: 1.5 !important;
      }
      
      /* Buttons */
      .button, a[style*="button"], a[style*="background-color"] {
        padding: 12px 20px !important;
        font-size: 14px !important;
        display: block !important;
        width: 100% !important;
        text-align: center !important;
        box-sizing: border-box !important;
        margin: 8px 0 !important;
      }
      
      /* Images */
      img {
        max-width: 100% !important;
        height: auto !important;
        width: auto !important;
      }
      
      /* Tables */
      table {
        width: 100% !important;
        max-width: 100% !important;
      }
      
      table[width] {
        width: 100% !important;
        max-width: 100% !important;
      }
      
      /* Social icons - keep inline on mobile, don't break layout - HIGH SPECIFICITY - prevent overflow */
      table.social-icons-table,
      table[style*="display: inline-table"] {
        width: auto !important;
        max-width: 100% !important;
        display: inline-table !important;
        table-layout: auto !important;
        margin: 0 auto !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
        border-collapse: separate !important;
        word-wrap: break-word !important;
        /* border-spacing set inline per table */
      }
      
      /* Parent container for social icons table - prevent overflow */
      table.social-icons-table,
      table[style*="display: inline-table"] {
        max-width: calc(100% - 40px) !important;
      }
      
      table.social-icons-table td,
      table.social-icons-table tr td,
      table[style*="display: inline-table"] td,
      table[style*="display: inline-table"] tr td {
        display: table-cell !important;
        vertical-align: middle !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
        max-width: none !important;
      }
      
      /* Ensure social icon links stay inline and properly sized */
      table.social-icons-table td a,
      table[style*="display: inline-table"] td a {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
        flex-shrink: 0 !important;
      }
      
      /* Ensure SVG icons don't overflow */
      table.social-icons-table td a svg,
      table[style*="display: inline-table"] td a svg {
        max-width: 100% !important;
        max-height: 100% !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }
      
      /* Ensure images don't overflow */
      table.social-icons-table td a img,
      table[style*="display: inline-table"] td a img {
        max-width: 100% !important;
        max-height: 100% !important;
        box-sizing: border-box !important;
      }
      
      /* App download buttons - FORCE stack vertically ONLY on mobile */
      /* Target all possible table structures for app buttons */
      table.app-download-buttons,
      table[class*="app-download-buttons"],
      table[style*="margin-top: 20px"] {
        width: 100% !important;
        max-width: 100% !important;
        table-layout: fixed !important;
      }
      
      table.app-download-buttons tr,
      table[class*="app-download-buttons"] tr,
      table[style*="margin-top: 20px"] tr {
        display: block !important;
        width: 100% !important;
      }
      
      table.app-download-buttons td,
      table[class*="app-download-buttons"] td,
      table[style*="margin-top: 20px"] td {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        padding: 8px 0 !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        text-align: center !important;
        box-sizing: border-box !important;
      }
      
      /* Force inner container table to stack */
      table.app-buttons-container,
      table[class*="app-buttons-container"],
      table.app-download-buttons table,
      table[style*="margin-top: 20px"] table {
        width: 100% !important;
        max-width: 100% !important;
        display: block !important;
        table-layout: fixed !important;
        margin: 0 auto !important;
      }
      
      table.app-buttons-container tr,
      table[class*="app-buttons-container"] tr,
      table.app-download-buttons table tr,
      table[style*="margin-top: 20px"] table tr {
        display: block !important;
        width: 100% !important;
      }
      
      /* Force all button cells to stack vertically - ULTRA AGGRESSIVE */
      table.app-buttons-container td,
      table[class*="app-buttons-container"] td,
      table.app-buttons-container td.app-button-cell,
      table.app-buttons-container td[style*="padding-right: 12px"],
      table.app-buttons-container td[style*="padding-left: 12px"],
      table.app-buttons-container td[style*="padding-right"],
      table.app-buttons-container td[style*="padding-left"],
      table.app-buttons-container td[style*="vertical-align"],
      table.app-download-buttons table td,
      table[style*="margin-top: 20px"] table td,
      table[style*="margin-top:20px"] table td {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 100% !important;
        padding: 8px 15px !important;
        padding-left: 15px !important;
        padding-right: 15px !important;
        padding-top: 8px !important;
        padding-bottom: 8px !important;
        text-align: center !important;
        box-sizing: border-box !important;
        float: none !important;
        clear: both !important;
        position: relative !important;
        margin: 0 !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
      }
      
      /* Remove any horizontal spacing between cells */
      table.app-buttons-container td[style*="padding-right: 12px"],
      table.app-buttons-container td[style*="padding-left: 12px"] {
        padding-left: 15px !important;
        padding-right: 15px !important;
        padding-top: 8px !important;
        padding-bottom: 8px !important;
      }
      
      /* Force all app download button links to full width - ULTRA AGGRESSIVE */
      a.app-download-button,
      a[class*="app-download-button"],
      a[style*="width: 170px"],
      a[style*="display: inline-block"],
      a[style*="background-color: #000000"],
      a[style*="background-color: #181a22"],
      table.app-download-buttons a,
      table.app-buttons-container a,
      td.app-button-cell a,
      table[style*="margin-top: 20px"] a,
      table[style*="margin-top: 20px"] table td a,
      table.app-buttons-container td a,
      table[class*="app-buttons-container"] td a {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 100% !important;
        text-align: center !important;
        margin: 8px auto !important;
        margin-left: auto !important;
        margin-right: auto !important;
        box-sizing: border-box !important;
        float: none !important;
        clear: both !important;
        position: relative !important;
      }
      
      /* Override ALL inline width styles - force full width */
      a[style*="width: 170px"],
      a[style*="width: 170px"][style*="display: inline-block"],
      a[style*="background-color: #000000"],
      a[style*="background-color: #181a22"] {
        width: 100% !important;
        max-width: 100% !important;
        display: block !important;
        margin: 8px 0 !important;
        float: none !important;
      }
      
      /* Center button content */
      a.app-download-button table,
      a[class*="app-download-button"] table,
      a[style*="background-color: #181a22"] table,
      a[style*="background-color: #000000"] table {
        margin: 0 auto !important;
        width: 100% !important;
        text-align: center !important;
        display: table !important;
      }
      
      /* Ensure app download buttons are full width and centered */
      a[style*="background-color: #000000"][style*="border: 1px solid #333333"],
      a[style*="background-color: #181a22"] {
        width: 100% !important;
        max-width: 100% !important;
        display: block !important;
        margin: 8px auto !important;
        padding: 12px !important;
        float: none !important;
      }
      
      /* General table cells - only apply block display to specific cases */
      .email-content td:not(table[style*="display: inline-table"] td):not(table[style*="margin-top: 20px"] td) {
        padding: 8px 4px !important;
      }
      
      /* Columns - Stack on mobile */
      .columns-wrapper {
        display: block !important;
        width: 100% !important;
        table-layout: auto !important;
      }
      
      .column {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        padding: 15px 10px !important;
        box-sizing: border-box !important;
      }
      
      /* Ensure column content doesn't overflow */
      .column * {
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      
      .column img {
        max-width: 100% !important;
        height: auto !important;
        width: auto !important;
      }
      
      .column table {
        width: 100% !important;
        max-width: 100% !important;
      }
      
      /* Menu items - stack on mobile */
      div[style*="display: flex"] {
        flex-direction: column !important;
      }
      
      /* Menu table - stack on mobile */
      table.menu-table,
      table[width="100%"][style*="margin"] {
        width: 100% !important;
        display: block !important;
      }
      
      table.menu-table tr,
      table[width="100%"][style*="margin"] tr {
        display: block !important;
        width: 100% !important;
      }
      
      table.menu-table td,
      table.menu-table td.menu-item-cell,
      table[width="100%"][style*="margin"] td {
        display: block !important;
        width: 100% !important;
        padding: 8px 0 !important;
        text-align: center !important;
        box-sizing: border-box !important;
      }
      
      /* Header and Footer - responsive padding */
      div[style*="background-color"][style*="padding"] {
        padding: 15px 10px !important;
      }
      
      /* Header/Footer nested blocks - ensure responsive */
      div[style*="background-color"][style*="padding"] table {
        width: 100% !important;
        max-width: 100% !important;
      }
      
      div[style*="background-color"][style*="padding"] img {
        max-width: 100% !important;
        height: auto !important;
        width: auto !important;
      }
      
      /* Logo */
      div[style*="text-align"] img {
        max-width: 100% !important;
        width: auto !important;
        height: auto !important;
      }
      
      /* Ensure all divs with width don't overflow */
      div[style*="width"] {
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      
      /* Text blocks - ensure responsive */
      div[style*="font-size"] {
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        max-width: 100% !important;
      }
      
      /* Paragraphs and text content - ensure responsive */
      p, div, span {
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      
      /* Headings - ensure responsive */
      h1, h2, h3, h4, h5, h6 {
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      
      /* Footer content - ensure responsive */
      div[style*="background-color: #ffffff"][style*="padding: 30px 20px"] {
        padding: 20px 15px !important;
      }
      
      /* Footer tables - ensure responsive */
      div[style*="background-color: #ffffff"] table {
        width: 100% !important;
        max-width: 100% !important;
      }
      
      div[style*="background-color: #ffffff"] td {
        padding: 8px 10px !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        font-size: 11px !important;
      }
      
      /* All links - ensure responsive */
      a {
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        max-width: 100% !important;
      }
      
      /* Override any fixed widths in inline styles */
      [style*="width"] {
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      
      /* Social icon containers - ensure they don't overflow */
      td[style*="width"][style*="containerSize"] {
        max-width: 50px !important;
        width: auto !important;
      }
      
      /* Social icon spacing - reduce on mobile */
      td[style*="iconSpacing"] {
        width: 8px !important;
        min-width: 8px !important;
        max-width: 8px !important;
      }
      
      /* Logo images - ensure responsive */
      img[style*="logoWidth"],
      img[alt="Logo"] {
        max-width: 100% !important;
        width: auto !important;
        height: auto !important;
      }
      
      /* Image blocks - ensure responsive */
      img[style*="imageWidth"] {
        max-width: 100% !important;
        width: auto !important;
        height: auto !important;
      }
      
      /* Button containers - full width on mobile */
      div[style*="text-align"][style*="button"] {
        width: 100% !important;
        padding: 0 10px !important;
        box-sizing: border-box !important;
      }
      
      /* Header/Footer tables - responsive */
      div[style*="background-color"][style*="padding"] table[width="100%"] {
        width: 100% !important;
        max-width: 100% !important;
      }
      
      div[style*="background-color"][style*="padding"] table[width="100%"] td {
        padding: 8px 10px !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-content">`;

  blocksList.forEach((block) => {
    switch (block.type) {
      case "heading": {
        const headingAlign = (block.props.align !== undefined && block.props.align !== null)
          ? block.props.align
          : generalSettings.contentAlignment;
        const headingStyle = {
          fontSize: block.props.style?.fontSize || (block.props.level === 1 ? "28px" : block.props.level === 2 ? "24px" : block.props.level === 3 ? "20px" : "18px"),
          fontWeight: block.props.style?.fontWeight || "bold",
          color: block.props.style?.color || generalSettings.textColor || "#333333",
          backgroundColor: block.props.style?.backgroundColor || "transparent",
          textDecoration: block.props.style?.textDecoration || "none",
          fontStyle: block.props.style?.fontStyle || "normal",
          marginBottom: block.props.style?.marginBottom || "20px",
          marginTop: block.props.style?.marginTop || "0px",
          lineHeight: block.props.style?.lineHeight || generalSettings.lineHeight || "1.3",
          letterSpacing: block.props.style?.letterSpacing || generalSettings.letterSpacing || "0px",
          textAlign: headingAlign,
          width: "100%",
          padding: block.props.style?.padding || (block.props.style?.backgroundColor && block.props.style?.backgroundColor !== "transparent" ? "8px 12px" : "0px"),
          fontFamily: block.props.style?.fontFamily || generalSettings.fontFamily || "Arial, sans-serif",
          ...(block.props.style || {}),
        };
        // Check if content is HTML (from rich text editor)
        const isHTML = block.content && (block.content.includes("<") || block.content.includes("&lt;"));
        const content = isHTML ? block.content : (block.content || "Heading");
        html += `<h${block.props.level || 1} style="${getStyleString(headingStyle)}">${content}</h${block.props.level || 1}>`;
        break;
      }
      case "text": {
        const textAlign = (block.props.align !== undefined && block.props.align !== null)
          ? block.props.align
          : generalSettings.contentAlignment;
        const textStyle = {
          fontSize: block.props.style?.fontSize || generalSettings.fontSize || "16px",
          color: block.props.style?.color || generalSettings.textColor || "#000000",
          backgroundColor: block.props.style?.backgroundColor || "transparent",
          fontWeight: block.props.style?.fontWeight || "normal",
          textDecoration: block.props.style?.textDecoration || "none",
          fontStyle: block.props.style?.fontStyle || "normal",
          lineHeight: block.props.style?.lineHeight || generalSettings.lineHeight || "1.6",
          marginBottom: block.props.style?.marginBottom || "16px",
          marginTop: block.props.style?.marginTop || "0",
          textAlign: textAlign,
          width: "100%",
          padding: block.props.style?.backgroundColor && block.props.style?.backgroundColor !== "transparent" ? "8px 12px" : "0",
          fontFamily: block.props.style?.fontFamily || generalSettings.fontFamily || "Arial, sans-serif",
          ...(block.props.style || {}),
        };
        // Check if content is HTML (from rich text editor)
        const isHTML = block.content && (block.content.includes("<") || block.content.includes("&lt;"));
        const content = isHTML ? block.content : ((block.content || "Text").replace(/\n/g, "<br>"));
        html += `<div style="${getStyleString(textStyle)}">${content}</div>`;
        break;
      }
      case "button": {
        const buttonAlign = (block.props.align !== undefined && block.props.align !== null)
          ? block.props.align
          : generalSettings.contentAlignment;
        const buttonBgColor = block.props.style?.backgroundColor || "#fbc40c";
        const buttonTextColor = block.props.style?.color || "#ffffff";

        // Handle padding - support both single value and individual sides
        let paddingValue = block.props.style?.padding || "14px 32px";
        if (block.props.style?.paddingTop || block.props.style?.paddingRight || block.props.style?.paddingBottom || block.props.style?.paddingLeft) {
          paddingValue = `${block.props.style?.paddingTop || "14px"} ${block.props.style?.paddingRight || "32px"} ${block.props.style?.paddingBottom || "14px"} ${block.props.style?.paddingLeft || "32px"}`;
        }

        // Handle border
        const borderStyle = block.props.style?.borderStyle || "none";
        const borderWidth = block.props.style?.borderWidth || "0px";
        const borderColor = block.props.style?.borderColor || "#000000";

        const buttonStyle = {
          backgroundColor: buttonBgColor,
          color: buttonTextColor,
          padding: paddingValue,
          borderRadius: block.props.style?.borderRadius || generalSettings.borderRadius || "6px",
          fontSize: block.props.style?.fontSize || generalSettings.fontSize || "16px",
          fontWeight: block.props.style?.fontWeight || "600",
          textDecoration: "none",
          display: "inline-block",
          borderStyle: borderStyle !== "none" ? borderStyle : undefined,
          borderWidth: borderStyle !== "none" ? borderWidth : undefined,
          borderColor: borderStyle !== "none" ? borderColor : undefined,
          ...(block.props.style || {}),
        };

        const target = block.props.target || "_blank";
        const href = block.props.href || block.props.url || "#";

        html += `<div style="text-align: ${buttonAlign}; width: 100%; margin: 24px 0; padding: ${block.props.containerPadding || "0px"};">
          <a href="${href}" target="${target}" style="${getStyleString(buttonStyle)}" class="button">${block.content || "Click Here"}</a>
        </div>`;
        break;
      }
      case "image":
        if (block.props.src) {
          const imageAlign = (block.props.align !== undefined && block.props.align !== null)
            ? block.props.align
            : generalSettings.contentAlignment;
          const imageWidth = block.props.width ? Math.min(block.props.width, parseInt(generalSettings.contentWidth) || 800) : null;
          const imageStyle = {
            maxWidth: imageWidth ? `${imageWidth}px` : "100%",
            width: imageWidth ? `${imageWidth}px` : "100%",
            height: "auto",
            display: imageAlign === "center" ? "block" : "inline-block",
            borderRadius: generalSettings.borderRadius || "4px",
            imageRendering: "auto",
            WebkitBackfaceVisibility: "hidden",
            WebkitTransform: "translateZ(0)",
            backfaceVisibility: "hidden",
            transform: "translateZ(0)",
            margin: imageAlign === "center" ? "0 auto" : imageAlign === "right" ? "0 0 0 auto" : "0 auto 0 0",
          };
          // Properly escape image src and alt attributes
          const imageSrc = escapeHtmlAttribute(block.props.src);
          const imageAlt = escapeHtmlAttribute(block.props.alt || "");
          html += `<div style="text-align: ${imageAlign}; width: 100%; margin: 24px 0;">
            <img src="${imageSrc}" alt="${imageAlt}" style="${getStyleString(imageStyle)}" />
          </div>`;
        }
        break;
      case "social": {
        const socialIcons = block.props.icons || [
          { name: "facebook", href: "https://www.facebook.com", icon: "facebook" },
          { name: "x", href: "https://x.com", icon: "x" },
          { name: "youtube", href: "https://www.youtube.com", icon: "youtube" },
          { name: "instagram", href: "https://www.instagram.com", icon: "instagram" },
          { name: "whatsapp", href: "https://wa.me/", icon: "whatsapp" },
        ];
        // Professional default sizing: larger icons with better spacing for equal size display
        const iconSize = block.props.iconSize || 50; // Increased to 50px for bigger, more prominent icons
        const iconSpacing = block.props.iconSpacing || 20; // Increased spacing for better visual separation
        const iconType = block.props.iconType || "circle"; // Professional circular design with colored backgrounds
        const socialAlign = (block.props.align !== undefined && block.props.align !== null)
          ? block.props.align
          : generalSettings.contentAlignment;

        // Use flexbox for preview (browser), table-based for emails (email client compatibility)
        if (!forEmail) {
          // PREVIEW MODE: Use flexbox to match desktop exactly
          const justifyContent = socialAlign === "left" ? "flex-start" : socialAlign === "right" ? "flex-end" : "center";
          html += `<div style="display: flex !important; align-items: center !important; justify-content: ${justifyContent} !important; padding: 20px 0 !important; margin: 0 !important; box-sizing: border-box !important; width: 100% !important; max-width: 100% !important; min-width: 0 !important; overflow: visible !important; flex-wrap: wrap !important; gap: ${iconSpacing}px !important; row-gap: ${iconSpacing}px !important; column-gap: ${iconSpacing}px !important;" class="social-icons-container">`;
        } else {
          // EMAIL MODE: Use table-based layout for email client compatibility
          const alignStyle = socialAlign === "left" ? "left" : socialAlign === "right" ? "right" : "center";
          html += `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 20px 0; margin: 0; box-sizing: border-box; width: 100%; max-width: 100%; border-collapse: collapse;">
            <tr>
              <td align="${alignStyle}" style="text-align: ${alignStyle}; width: 100%; max-width: 100%; overflow: visible !important; box-sizing: border-box; padding: 0;">
                <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; border-collapse: separate; border-spacing: ${iconSpacing}px 0; display: inline-table;" class="social-icons-table">
                  <tr>`;
        }

        socialIcons.forEach((icon: any, index: number) => {
          const iconName = (icon.name || icon.icon || "facebook").toLowerCase();
          const iconColor = getSocialIconColor(iconName);
          const containerSize = iconSize;

          // Build icon style - different for preview vs email
          let iconStyle = forEmail
            ? `width: ${containerSize}px !important; height: ${containerSize}px !important; min-width: ${containerSize}px !important; min-height: ${containerSize}px !important; max-width: ${containerSize}px !important; max-height: ${containerSize}px !important; display: block !important; text-decoration: none !important; box-sizing: border-box !important; overflow: hidden !important; position: relative !important;`
            : `width: ${containerSize}px !important; height: ${containerSize}px !important; min-width: ${containerSize}px !important; min-height: ${containerSize}px !important; max-width: ${containerSize}px !important; max-height: ${containerSize}px !important; display: flex !important; align-items: center !important; justify-content: center !important; text-decoration: none !important; box-sizing: border-box !important; overflow: hidden !important; position: relative !important; flex-shrink: 0 !important; flex-grow: 0 !important; aspect-ratio: 1 / 1 !important; transition: all 0.2s ease !important;`;

          // Check if using Cloudinary images (complete icons with backgrounds)
          const iconImage = icon.image || icon.src || icon.img;
          const isCloudinaryIcon = !iconImage && ['facebook', 'instagram', 'linkedin', 'twitter', 'x', 'whatsapp', 'youtube'].includes(iconName.toLowerCase());

          // Apply icon type specific styles - Cloudinary images are complete, so use transparent background
          if (iconType.includes("circle") || isCloudinaryIcon) {
            // Cloudinary images are already complete circular icons with backgrounds and shadows
            // So we use transparent background and let the image show through
            iconStyle += ` border-radius: 50% !important; background-color: transparent !important;`;
          } else if (iconType.includes("round")) {
            iconStyle += ` border-radius: 8px !important;`;
            if (iconType === "round-black") {
              iconStyle += ` background-color: #000000 !important;`;
            } else {
              iconStyle += ` background-color: ${iconColor} !important;`;
            }
            iconStyle += ` -webkit-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important; -moz-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important;`;
          } else if (iconType.includes("square")) {
            iconStyle += ` border-radius: 0px !important;`;
            if (iconType === "square-black") {
              iconStyle += ` background-color: #000000 !important;`;
            } else if (iconType === "square-white") {
              iconStyle += ` background-color: #FFFFFF !important; border: 2px solid ${iconColor} !important;`;
            } else {
              iconStyle += ` background-color: ${iconColor} !important;`;
            }
            iconStyle += ` -webkit-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important; -moz-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important;`;
          } else {
            // Default: Professional circular design - transparent for Cloudinary images
            iconStyle += ` border-radius: 50% !important; background-color: transparent !important;`;
          }

          let iconContent = "";

          // All icons use the same size for consistent appearance in emails
          const imgSize = iconSize; // Standard size (50px) for all icons

          if (iconImage) {
            // Custom image provided - same size as Cloudinary icons
            const escapedIconSrc = escapeHtmlAttribute(iconImage);
            const escapedIconAlt = escapeHtmlAttribute(icon.name || icon.icon || 'Social Icon');
            iconContent = `<img src="${escapedIconSrc}" alt="${escapedIconAlt}" width="${imgSize}" height="${imgSize}" border="0" style="width: ${imgSize}px !important; height: ${imgSize}px !important; min-width: ${imgSize}px !important; min-height: ${imgSize}px !important; max-width: ${imgSize}px !important; max-height: ${imgSize}px !important; display: block !important; border: 0 !important; outline: none !important; text-decoration: none !important; object-fit: contain !important; object-position: center center !important; pointer-events: none !important; border-radius: 50% !important; box-sizing: border-box !important;" />`;
          } else {
            // Use Cloudinary PNG images - All icons at exact same size (50px) for equal appearance
            iconContent = createSocialIconContent(iconName, imgSize);
          }

          // Render icon - different structure for preview vs email
          if (!forEmail) {
            // PREVIEW: Simple anchor tag with flexbox
            html += `<a href="${escapeHtmlAttribute(icon.href || "#")}" target="_blank" rel="noopener noreferrer" style="${iconStyle} cursor: pointer !important;" title="${escapeHtmlAttribute(icon.name || icon.icon || 'Social Icon')}">
                      ${iconContent}
                    </a>`;
          } else {
            // EMAIL: Table-based structure for email compatibility
            html += `<td align="center" valign="middle" style="padding: 0 !important; width: ${containerSize}px !important; height: ${containerSize}px !important; vertical-align: middle !important; text-align: center !important; line-height: ${containerSize}px !important;">
                      <a href="${escapeHtmlAttribute(icon.href || "#")}" target="_blank" rel="noopener noreferrer" style="${iconStyle} text-decoration: none !important; border: none !important; outline: none !important; cursor: pointer !important;" title="${escapeHtmlAttribute(icon.name || icon.icon || 'Social Icon')}">
                        ${iconContent}
                      </a>
                    </td>`;
          }
        });

        // Close container - different for preview vs email
        if (!forEmail) {
          html += `</div>`;
        } else {
          html += `</tr>
                </table>
              </td>
            </tr>
          </table>`;
        }
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
        const columnBlocks = block.props.columnBlocks || {};
        const totalWidth = columns.reduce((sum: number, col: any) => sum + (col.width || 1), 0);
        html += `<div class="columns-wrapper">`;
        columns.forEach((col: any, colIdx: number) => {
          const colWidth = totalWidth > 0 ? `${(col.width || 1) / totalWidth * 100}%` : `${100 / columns.length}%`;
          const nestedBlocks = columnBlocks[colIdx] || [];
          html += `<div class="column" style="width: ${colWidth}; padding: 15px; vertical-align: top;">`;
          if (nestedBlocks.length > 0) {
            // Generate HTML for nested blocks
            nestedBlocks.forEach((nestedBlock: EmailBlock) => {
              // Generate HTML for each nested block type
              switch (nestedBlock.type) {
                case "heading": {
                  const headingAlign = (nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                    ? nestedBlock.props.align
                    : generalSettings.contentAlignment;
                  const headingStyle = {
                    fontSize: nestedBlock.props.style?.fontSize || "24px",
                    fontWeight: nestedBlock.props.style?.fontWeight || "bold",
                    color: nestedBlock.props.style?.color || generalSettings.textColor || "#333333",
                    textAlign: headingAlign,
                    marginBottom: nestedBlock.props.style?.marginBottom || "16px",
                  };
                  html += `<h${nestedBlock.props.level || 1} style="${getStyleString(headingStyle)}">${nestedBlock.content || "Heading"}</h${nestedBlock.props.level || 1}>`;
                  break;
                }
                case "text": {
                  const textAlign = (nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                    ? nestedBlock.props.align
                    : generalSettings.contentAlignment;
                  const textStyle = {
                    fontSize: nestedBlock.props.style?.fontSize || generalSettings.fontSize || "16px",
                    color: nestedBlock.props.style?.color || generalSettings.textColor || "#000000",
                    textAlign: textAlign,
                    marginBottom: nestedBlock.props.style?.marginBottom || "16px",
                  };
                  html += `<div style="${getStyleString(textStyle)}">${nestedBlock.content || "Text"}</div>`;
                  break;
                }
                case "button": {
                  const buttonAlign = (nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                    ? nestedBlock.props.align
                    : generalSettings.contentAlignment;
                  const buttonStyle = {
                    backgroundColor: nestedBlock.props.style?.backgroundColor || "#fbc40c",
                    color: nestedBlock.props.style?.color || "#ffffff",
                    padding: nestedBlock.props.style?.padding || "14px 32px",
                    borderRadius: nestedBlock.props.style?.borderRadius || generalSettings.borderRadius || "6px",
                    textDecoration: "none",
                    display: "inline-block",
                  };
                  html += `<div style="text-align: ${buttonAlign}; margin: 16px 0;"><a href="${nestedBlock.props.href || "#"}" style="${getStyleString(buttonStyle)}">${nestedBlock.content || "Click Here"}</a></div>`;
                  break;
                }
                case "image": {
                  if (nestedBlock.props.src) {
                    const nestedImageSrc = escapeHtmlAttribute(nestedBlock.props.src);
                    const nestedImageAlt = escapeHtmlAttribute(nestedBlock.props.alt || "");
                    html += `<img src="${nestedImageSrc}" alt="${nestedImageAlt}" style="max-width: 100%; height: auto; margin: 16px 0;" />`;
                  }
                  break;
                }
                default:
                  html += nestedBlock.content || "";
              }
            });
          } else {
            html += col.content || `Column ${colIdx + 1}`;
          }
          html += `</div>`;
        });
        html += `</div>`;
        break;
      }
      case "menu": {
        const menuAlign = (block.props.align !== undefined && block.props.align !== null)
          ? block.props.align
          : generalSettings.contentAlignment;
        const menuItems = block.props.items || [];
        const separator = block.props.separator || "";
        const layout = block.props.layout || "horizontal";

        // Menu styles
        const menuStyle = {
          fontFamily: block.props.style?.fontFamily || generalSettings.fontFamily || "Arial, sans-serif",
          fontSize: block.props.style?.fontSize || "14px",
          fontWeight: block.props.style?.fontWeight || "normal",
          letterSpacing: block.props.style?.letterSpacing || "0px",
          color: block.props.style?.color || generalSettings.textColor || "#000000",
          textAlign: menuAlign,
          width: "100%",
          padding: block.props.style?.padding || "5px 15px",
          ...(block.props.style || {}),
        };

        // Link color
        const linkColor = block.props.style?.linkColor || generalSettings.linkColor || "#0066cc";

        if (menuItems.length === 0) {
          html += `<div style="${getStyleString(menuStyle)}">No menu items</div>`;
        } else {
          const flexDirection = layout === "horizontal" ? "row" : "column";
          if (menuAlign === "justify" && layout === "horizontal") {
            // For justify alignment, use table-based layout for email compatibility
            html += `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="${getStyleString(menuStyle)}">
              <tr>`;
            menuItems.forEach((item: any, idx: number) => {
              const itemHref = item.url || item.href || "#";
              const itemTarget = item.target || "_self";
              const itemLabel = item.label || "Menu Item";
              const widthPercent = `${100 / menuItems.length}%`;

              html += `<td style="text-align: center; padding: 0 4px;">
                <a href="${itemHref}" target="${itemTarget}" style="color: ${linkColor}; text-decoration: none;">${itemLabel}</a>
              </td>`;
            });
            html += `</tr>
            </table>`;
          } else {
            const justifyContent = menuAlign === "left" ? "flex-start" : menuAlign === "right" ? "flex-end" : "center";
            html += `<div style="${getStyleString(menuStyle)} display: ${layout === "horizontal" ? "flex" : "block"}; flex-direction: ${flexDirection}; justify-content: ${justifyContent}; align-items: center; gap: 8px;">`;
            menuItems.forEach((item: any, idx: number) => {
              const itemHref = item.url || item.href || "#";
              const itemTarget = item.target || "_self";
              const itemLabel = item.label || "Menu Item";

              html += `<a href="${itemHref}" target="${itemTarget}" style="color: ${linkColor}; text-decoration: none; margin: 0;">${itemLabel}</a>`;

              if (idx < menuItems.length - 1 && separator) {
                html += `<span style="margin: 0 4px; color: ${menuStyle.color};">${separator}</span>`;
              }
            });
            html += `</div>`;
          }
        }
        break;
      }
      case "logo": {
        const logoWidth = typeof block.props.width === 'number'
          ? block.props.width
          : (typeof block.props.width === 'string' ? parseInt(block.props.width) || 100 : 100);
        const logoHeight = typeof block.props.height === 'number'
          ? block.props.height
          : (typeof block.props.height === 'string' ? parseInt(block.props.height) || 100 : 100);
        const logoAlign = (block.props.align !== undefined && block.props.align !== null)
          ? block.props.align
          : generalSettings.contentAlignment;
        const alignStyle = logoAlign === "left" ? "text-align: left;" :
          logoAlign === "right" ? "text-align: right;" :
            logoAlign === "justify" ? "text-align: justify;" :
              "text-align: center;";
        const contentWidth = parseInt(generalSettings.contentWidth) || 800;
        const padding = parseInt(generalSettings.padding) || 40;
        const maxLogoWidth = Math.min(logoWidth, contentWidth - (padding * 2) - 20);
        const marginStyle = logoAlign === "left" ? "margin: 0;" :
          logoAlign === "right" ? "margin: 0 0 0 auto;" :
            logoAlign === "justify" ? "margin: 0;" :
              "margin: 0 auto;";

        if (block.props.imageSrc) {
          // Logo image - fully responsive
          const logoImageSrc = escapeHtmlAttribute(getAbsoluteImageUrl(block.props.imageSrc));
          html += `<div style="${alignStyle} padding: 10px 0; width: 100%; box-sizing: border-box; overflow: hidden;">
            <img src="${logoImageSrc}" alt="Logo" style="width: ${logoWidth}px; max-width: 100%; height: auto; aspect-ratio: ${logoWidth} / ${logoHeight}; display: block; object-fit: contain; image-rendering: auto; -webkit-backface-visibility: hidden; -webkit-transform: translateZ(0); backface-visibility: hidden; transform: translateZ(0); box-sizing: border-box; ${marginStyle}" />
          </div>`;
        } else {
          // Placeholder for logo - fully responsive
          html += `<div style="${alignStyle} padding: 10px 0; width: 100%; box-sizing: border-box; overflow: hidden;">
            <div style="width: ${logoWidth}px; max-width: 100%; height: auto; aspect-ratio: ${logoWidth} / ${logoHeight}; min-height: ${Math.min(logoHeight, 50)}px; display: flex; align-items: center; justify-content: center; border: 2px dashed #d1d5db; border-radius: 8px; background-color: #f9fafb; box-sizing: border-box; ${marginStyle}"></div>
          </div>`;
        }
        break;
      }
      case "html": {
        html += block.content || "";
        break;
      }
      case "header": {
        const headerBlocks = block.props.headerBlocks || [];
        const headerStyle = block.props.style || {};
        const headerAlign = (block.props.align !== undefined && block.props.align !== null)
          ? block.props.align
          : generalSettings.contentAlignment;

        html += `<div style="width: 100%; background-color: ${headerStyle.backgroundColor || "#f8f9fa"}; padding: ${headerStyle.padding || "20px"}; border-bottom: ${headerStyle.borderBottom || "2px solid #e0e0e0"}; text-align: ${headerAlign}; box-sizing: border-box;">`;

        if (headerBlocks.length > 0) {
          headerBlocks.forEach((nestedBlock: EmailBlock) => {
            // Generate HTML for nested blocks (similar to columns logic)
            switch (nestedBlock.type) {
              case "heading": {
                const headingAlign = (nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                  ? nestedBlock.props.align
                  : headerAlign;
                const headingStyle = {
                  fontSize: nestedBlock.props.style?.fontSize || "24px",
                  fontWeight: nestedBlock.props.style?.fontWeight || "bold",
                  color: nestedBlock.props.style?.color || generalSettings.textColor || "#333333",
                  textAlign: headingAlign,
                  marginBottom: nestedBlock.props.style?.marginBottom || "16px",
                };
                html += `<h${nestedBlock.props.level || 1} style="${getStyleString(headingStyle)}">${nestedBlock.content || "Heading"}</h${nestedBlock.props.level || 1}>`;
                break;
              }
              case "text": {
                const textAlign = (nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                  ? nestedBlock.props.align
                  : headerAlign;
                const textStyle = {
                  fontSize: nestedBlock.props.style?.fontSize || generalSettings.fontSize || "16px",
                  color: nestedBlock.props.style?.color || generalSettings.textColor || "#000000",
                  textAlign: textAlign,
                  marginBottom: nestedBlock.props.style?.marginBottom || "16px",
                  lineHeight: nestedBlock.props.style?.lineHeight || "1.5",
                  fontFamily: nestedBlock.props.style?.fontFamily || generalSettings.fontFamily || "Arial, sans-serif",
                };
                const isHTML = nestedBlock.content && (nestedBlock.content.includes("<") || nestedBlock.content.includes("&lt;"));
                const content = isHTML ? nestedBlock.content : ((nestedBlock.content || "Text").replace(/\n/g, "<br>"));
                // Use table-based layout for better email client compatibility
                html += `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: ${nestedBlock.props.style?.marginBottom || "16px"};">
                  <tr>
                    <td style="font-size: ${nestedBlock.props.style?.fontSize || generalSettings.fontSize || "16px"}; color: ${nestedBlock.props.style?.color || generalSettings.textColor || "#000000"}; text-align: ${textAlign}; line-height: ${nestedBlock.props.style?.lineHeight || "1.5"}; font-family: ${nestedBlock.props.style?.fontFamily || generalSettings.fontFamily || "Arial, sans-serif"};">
                      ${content}
                    </td>
                  </tr>
                </table>`;
                break;
              }
              case "button": {
                const buttonAlign = (nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                  ? nestedBlock.props.align
                  : headerAlign;
                const buttonStyle = {
                  backgroundColor: nestedBlock.props.style?.backgroundColor || "#fbc40c",
                  color: nestedBlock.props.style?.color || "#ffffff",
                  padding: nestedBlock.props.style?.padding || "14px 32px",
                  borderRadius: nestedBlock.props.style?.borderRadius || generalSettings.borderRadius || "6px",
                  textDecoration: "none",
                  display: "inline-block",
                };
                html += `<div style="text-align: ${buttonAlign}; margin: 16px 0;"><a href="${nestedBlock.props.href || "#"}" style="${getStyleString(buttonStyle)}">${nestedBlock.content || "Click Here"}</a></div>`;
                break;
              }
              case "image": {
                if (nestedBlock.props.src) {
                  const nestedImageSrc = escapeHtmlAttribute(nestedBlock.props.src);
                  const nestedImageAlt = escapeHtmlAttribute(nestedBlock.props.alt || "");
                  html += `<img src="${nestedImageSrc}" alt="${nestedImageAlt}" style="max-width: 100%; height: auto; margin: 16px 0;" />`;
                }
                break;
              }
              case "logo": {
                if (nestedBlock.props.imageSrc) {
                  const logoImageSrc = escapeHtmlAttribute(getAbsoluteImageUrl(nestedBlock.props.imageSrc));
                  const logoWidth = typeof nestedBlock.props.width === 'number'
                    ? nestedBlock.props.width
                    : (typeof nestedBlock.props.width === 'string' ? parseInt(nestedBlock.props.width) || 100 : 100);
                  // Use nested block's alignment if set, otherwise use header alignment
                  const logoAlign = (nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                    ? nestedBlock.props.align
                    : headerAlign;
                  const alignStyle = logoAlign === "left" ? "left" : logoAlign === "right" ? "right" : logoAlign === "justify" ? "justify" : "center";
                  const marginStyle = logoAlign === "left" ? "margin: 16px 0 16px 0;" :
                    logoAlign === "right" ? "margin: 16px 0 16px auto;" :
                      logoAlign === "justify" ? "margin: 16px 0;" :
                        "margin: 16px auto;";
                  html += `<div style="text-align: ${alignStyle};">
                    <img src="${logoImageSrc}" alt="Logo" style="width: ${logoWidth}px; max-width: 100%; height: auto; ${marginStyle}; display: ${logoAlign === "left" || logoAlign === "right" ? "block" : "inline-block"};" />
                  </div>`;
                }
                break;
              }
              case "menu": {
                const menuItems = nestedBlock.props.items || [];
                const linkColor = nestedBlock.props.style?.linkColor || generalSettings.linkColor || "#0066cc";
                const menuLayout = nestedBlock.props.layout || "horizontal";
                const menuSeparator = nestedBlock.props.separator || "";
                // Use nested block's alignment if set, otherwise use header alignment
                const menuAlign = (nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                  ? nestedBlock.props.align
                  : headerAlign;

                if (menuItems.length > 0) {
                  if (menuAlign === "justify" && menuLayout === "horizontal") {
                    // For justify alignment, use table-based layout for email compatibility
                    html += `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0;" class="menu-table">
                      <tr>`;
                    menuItems.forEach((item: any, idx: number) => {
                      const itemHref = item.url || item.href || "#";
                      const itemLabel = item.label || "Menu Item";
                      const widthPercent = `${100 / menuItems.length}%`;

                      html += `<td style="text-align: center; padding: 0 4px; width: ${widthPercent};" class="menu-item-cell">
                        <a href="${itemHref}" style="color: ${linkColor}; text-decoration: none;">${itemLabel}</a>
                      </td>`;
                    });
                    html += `</tr>
                    </table>`;
                  } else {
                    const alignStyle = menuAlign === "left" ? "left" : menuAlign === "right" ? "right" : "center";
                    html += `<div style="margin: 16px 0; text-align: ${alignStyle};">`;
                    menuItems.forEach((item: any, idx: number) => {
                      const itemHref = item.url || item.href || "#";
                      html += `<a href="${itemHref}" style="color: ${linkColor}; text-decoration: none; margin: 0 8px;">${item.label || "Menu Item"}</a>`;
                      if (idx < menuItems.length - 1 && menuSeparator) {
                        html += `<span style="margin: 0 4px;">${menuSeparator}</span>`;
                      }
                    });
                    html += `</div>`;
                  }
                }
                break;
              }
              case "social": {
                const socialIcons = nestedBlock.props.icons || [];
                // Professional default sizing: larger icons with better spacing for equal size display
                const iconSize = nestedBlock.props.iconSize || 50; // Increased to 50px for bigger, more prominent icons
                const iconType = nestedBlock.props.iconType || "circle"; // Professional circular design with colored backgrounds
                const iconSpacing = nestedBlock.props.iconSpacing || 16; // Increased from 12 to 16 for better spacing
                // Use nested block's alignment if set, otherwise use header alignment
                const socialAlign = (nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                  ? nestedBlock.props.align
                  : headerAlign;
                if (socialIcons.length > 0) {
                  // Use flexbox for preview, table-based for emails
                  if (!forEmail) {
                    // PREVIEW MODE: Use flexbox to match desktop
                    const justifyContent = socialAlign === "left" ? "flex-start" : socialAlign === "right" ? "flex-end" : "center";
                    html += `<div style="display: flex !important; align-items: center !important; justify-content: ${justifyContent} !important; padding: 20px 0 !important; margin: 0 !important; box-sizing: border-box !important; width: 100% !important; max-width: 100% !important; min-width: 0 !important; overflow: visible !important; flex-wrap: wrap !important; gap: ${iconSpacing}px !important; row-gap: ${iconSpacing}px !important; column-gap: ${iconSpacing}px !important;" class="social-icons-container">`;
                  } else {
                    // EMAIL MODE: Use table-based layout
                    const alignStyle = socialAlign === "left" ? "left" : socialAlign === "right" ? "right" : "center";
                    html += `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 20px 0; margin: 0; box-sizing: border-box; width: 100%; max-width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="${alignStyle}" style="text-align: ${alignStyle}; width: 100%; max-width: 100%; overflow: visible !important; box-sizing: border-box; padding: 0;">
                          <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; border-collapse: separate; border-spacing: ${iconSpacing}px 0; display: inline-table;" class="social-icons-table">
                            <tr>`;
                  }

                  socialIcons.forEach((icon: any, index: number) => {
                    const iconName = (icon.name || icon.icon || "facebook").toLowerCase();
                    const iconColor = getSocialIconColor(iconName);
                    const containerSize = iconSize;

                    // Build icon style - different for preview vs email
                    let iconStyle = forEmail
                      ? `width: ${containerSize}px !important; height: ${containerSize}px !important; min-width: ${containerSize}px !important; min-height: ${containerSize}px !important; max-width: ${containerSize}px !important; max-height: ${containerSize}px !important; display: block !important; text-decoration: none !important; box-sizing: border-box !important; overflow: hidden !important; position: relative !important;`
                      : `width: ${containerSize}px !important; height: ${containerSize}px !important; min-width: ${containerSize}px !important; min-height: ${containerSize}px !important; max-width: ${containerSize}px !important; max-height: ${containerSize}px !important; display: flex !important; align-items: center !important; justify-content: center !important; text-decoration: none !important; box-sizing: border-box !important; overflow: hidden !important; position: relative !important; flex-shrink: 0 !important; flex-grow: 0 !important; aspect-ratio: 1 / 1 !important; transition: all 0.2s ease !important;`;

                    if (iconType.includes("circle")) {
                      iconStyle += ` border-radius: 50% !important;`;
                      if (iconType === "circle-black") {
                        iconStyle += ` background-color: #000000 !important;`;
                      } else if (iconType === "circle-white") {
                        iconStyle += ` background-color: #FFFFFF !important; border: 2px solid ${iconColor} !important;`;
                      } else {
                        // Circle (colored) - Professional colored background with white icons
                        if (iconName === "instagram") {
                          iconStyle += ` background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%) !important; background-color: transparent !important;`;
                        } else {
                          iconStyle += ` background-color: ${iconColor} !important;`;
                        }
                        // Enhanced professional shadow for better depth and visual appeal (matching main block)
                        iconStyle += ` -webkit-box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15) !important; -moz-box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15) !important; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15) !important;`;
                      }
                    } else if (iconType.includes("round")) {
                      iconStyle += ` border-radius: 8px !important;`;
                      if (iconType === "round-black") {
                        iconStyle += ` background-color: #000000 !important;`;
                      } else {
                        iconStyle += ` background-color: ${iconColor} !important;`;
                      }
                      // Professional shadow matching Image 2 style
                      iconStyle += ` -webkit-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important; -moz-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important;`;
                    } else if (iconType.includes("round")) {
                      iconStyle += ` border-radius: 8px !important;`;
                      if (iconType === "round-black") {
                        iconStyle += ` background-color: #000000 !important;`;
                      } else {
                        iconStyle += ` background-color: ${iconColor} !important;`;
                      }
                      iconStyle += ` -webkit-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important; -moz-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important;`;
                    } else if (iconType.includes("square")) {
                      iconStyle += ` border-radius: 0px !important;`;
                      if (iconType === "square-black") {
                        iconStyle += ` background-color: #000000 !important;`;
                      } else if (iconType === "square-white") {
                        iconStyle += ` background-color: #FFFFFF !important; border: 2px solid ${iconColor} !important;`;
                      } else {
                        iconStyle += ` background-color: ${iconColor} !important;`;
                      }
                      iconStyle += ` -webkit-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important; -moz-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important;`;
                    } else {
                      // Default: Professional circular design with colored background
                      iconStyle += ` border-radius: 50% !important; background-color: ${iconColor} !important;`;
                      if (iconName === "instagram") {
                        iconStyle += ` background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%) !important; background-color: transparent !important;`;
                      }
                      iconStyle += ` -webkit-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important; -moz-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important;`;
                    }

                    // All icons use the same size for consistent appearance in emails
                    const svgSize = iconSize; // Standard size (50px) for all icons

                    // Use helper function to create icon content
                    const iconContent = createSocialIconContent(iconName, svgSize);

                    // Render icon - different structure for preview vs email
                    if (!forEmail) {
                      // PREVIEW: Simple anchor tag
                      html += `<a href="${escapeHtmlAttribute(icon.href || "#")}" target="_blank" rel="noopener noreferrer" style="${iconStyle} cursor: pointer !important;" title="${escapeHtmlAttribute(icon.name || icon.icon || 'Social Icon')}">
                                ${iconContent}
                              </a>`;
                    } else {
                      // EMAIL: Table-based structure
                      html += `<td align="center" valign="middle" style="padding: 0 !important; width: ${containerSize}px !important; height: ${containerSize}px !important; vertical-align: middle !important; text-align: center !important; line-height: ${containerSize}px !important;">
                                <a href="${escapeHtmlAttribute(icon.href || "#")}" target="_blank" rel="noopener noreferrer" style="${iconStyle} text-decoration: none !important; border: none !important; outline: none !important; cursor: pointer !important;" title="${escapeHtmlAttribute(icon.name || icon.icon || 'Social Icon')}">
                                  ${iconContent}
                                </a>
                              </td>`;
                    }
                  });

                  // Close container - different for preview vs email
                  if (!forEmail) {
                    html += `</div>`;
                  } else {
                    html += `</tr>
                          </table>
                        </td>
                      </tr>
                    </table>`;
                  }
                }
                break;
              }
              case "html": {
                html += nestedBlock.content || "";
                break;
              }
              default:
                html += nestedBlock.content || "";
            }
          });
        }

        html += `</div>`;
        break;
      }
      case "footer": {
        const footerBlocks = block.props.footerBlocks || [];
        const footerStyle = block.props.style || {};
        const footerAlign = (block.props.align !== undefined && block.props.align !== null)
          ? block.props.align
          : generalSettings.contentAlignment;

        html += `<div style="width: 100%; background-color: ${footerStyle.backgroundColor || "#f8f9fa"}; padding: ${footerStyle.padding || "20px"}; border-top: ${footerStyle.borderTop || "2px solid #e0e0e0"}; text-align: ${footerAlign}; box-sizing: border-box;">`;

        if (footerBlocks.length > 0) {
          footerBlocks.forEach((nestedBlock: EmailBlock) => {
            // Generate HTML for nested blocks (similar to header logic)
            switch (nestedBlock.type) {
              case "heading": {
                const headingAlign = (nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                  ? nestedBlock.props.align
                  : footerAlign;
                const headingStyle = {
                  fontSize: nestedBlock.props.style?.fontSize || "20px",
                  fontWeight: nestedBlock.props.style?.fontWeight || "bold",
                  color: nestedBlock.props.style?.color || generalSettings.textColor || "#333333",
                  textAlign: headingAlign,
                  marginBottom: nestedBlock.props.style?.marginBottom || "12px",
                };
                html += `<h${nestedBlock.props.level || 2} style="${getStyleString(headingStyle)}">${nestedBlock.content || "Heading"}</h${nestedBlock.props.level || 2}>`;
                break;
              }
              case "text": {
                const textAlign = (nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                  ? nestedBlock.props.align
                  : footerAlign;
                const textStyle = {
                  fontSize: nestedBlock.props.style?.fontSize || "12px",
                  color: nestedBlock.props.style?.color || generalSettings.textColor || "#000000",
                  textAlign: textAlign,
                  marginBottom: nestedBlock.props.style?.marginBottom || "12px",
                  lineHeight: nestedBlock.props.style?.lineHeight || "1.5",
                  fontFamily: nestedBlock.props.style?.fontFamily || generalSettings.fontFamily || "Arial, sans-serif",
                };
                const isHTML = nestedBlock.content && (nestedBlock.content.includes("<") || nestedBlock.content.includes("&lt;"));
                const content = isHTML ? nestedBlock.content : ((nestedBlock.content || "Text").replace(/\n/g, "<br>"));
                // Use table-based layout for better email client compatibility
                html += `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: ${nestedBlock.props.style?.marginBottom || "12px"};">
                  <tr>
                    <td style="font-size: ${nestedBlock.props.style?.fontSize || "12px"}; color: ${nestedBlock.props.style?.color || generalSettings.textColor || "#000000"}; text-align: ${textAlign}; line-height: ${nestedBlock.props.style?.lineHeight || "1.5"}; font-family: ${nestedBlock.props.style?.fontFamily || generalSettings.fontFamily || "Arial, sans-serif"};">
                      ${content}
                    </td>
                  </tr>
                </table>`;
                break;
              }
              case "button": {
                const buttonAlign = (nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                  ? nestedBlock.props.align
                  : footerAlign;
                const buttonStyle = {
                  backgroundColor: nestedBlock.props.style?.backgroundColor || "#fbc40c",
                  color: nestedBlock.props.style?.color || "#ffffff",
                  padding: nestedBlock.props.style?.padding || "12px 24px",
                  borderRadius: nestedBlock.props.style?.borderRadius || generalSettings.borderRadius || "6px",
                  textDecoration: "none",
                  display: "inline-block",
                };
                html += `<div style="text-align: ${buttonAlign}; margin: 12px 0;"><a href="${nestedBlock.props.href || "#"}" style="${getStyleString(buttonStyle)}">${nestedBlock.content || "Click Here"}</a></div>`;
                break;
              }
              case "image": {
                if (nestedBlock.props.src) {
                  const nestedImageSrc = escapeHtmlAttribute(nestedBlock.props.src);
                  const nestedImageAlt = escapeHtmlAttribute(nestedBlock.props.alt || "");
                  html += `<img src="${nestedImageSrc}" alt="${nestedImageAlt}" style="max-width: 100%; height: auto; margin: 12px 0;" />`;
                }
                break;
              }
              case "logo": {
                if (nestedBlock.props.imageSrc) {
                  const logoImageSrc = escapeHtmlAttribute(getAbsoluteImageUrl(nestedBlock.props.imageSrc));
                  const logoWidth = typeof nestedBlock.props.width === 'number'
                    ? nestedBlock.props.width
                    : (typeof nestedBlock.props.width === 'string' ? parseInt(nestedBlock.props.width) || 100 : 100);
                  // Use nested block's alignment if set, otherwise use footer alignment
                  const logoAlign = (nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                    ? nestedBlock.props.align
                    : footerAlign;
                  const alignStyle = logoAlign === "left" ? "left" : logoAlign === "right" ? "right" : logoAlign === "justify" ? "justify" : "center";
                  const marginStyle = logoAlign === "left" ? "margin: 12px 0 12px 0;" :
                    logoAlign === "right" ? "margin: 12px 0 12px auto;" :
                      logoAlign === "justify" ? "margin: 12px 0;" :
                        "margin: 12px auto;";
                  html += `<div style="text-align: ${alignStyle};">
                    <img src="${logoImageSrc}" alt="Logo" style="width: ${logoWidth}px; max-width: 100%; height: auto; ${marginStyle}; display: ${logoAlign === "left" || logoAlign === "right" ? "block" : "inline-block"};" />
                  </div>`;
                }
                break;
              }
              case "menu": {
                const menuItems = nestedBlock.props.items || [];
                const linkColor = nestedBlock.props.style?.linkColor || generalSettings.linkColor || "#0066cc";
                const menuLayout = nestedBlock.props.layout || "horizontal";
                const menuSeparator = nestedBlock.props.separator || "";
                // Use nested block's alignment if set, otherwise use footer alignment
                const menuAlign = (nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                  ? nestedBlock.props.align
                  : footerAlign;

                if (menuItems.length > 0) {
                  if (menuAlign === "justify" && menuLayout === "horizontal") {
                    // For justify alignment, use table-based layout for email compatibility
                    html += `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 12px 0;">
                      <tr>`;
                    menuItems.forEach((item: any, idx: number) => {
                      const itemHref = item.url || item.href || "#";
                      const itemLabel = item.label || "Menu Item";
                      const widthPercent = `${100 / menuItems.length}%`;

                      html += `<td style="text-align: center; padding: 0 4px; width: ${widthPercent};">
                        <a href="${itemHref}" style="color: ${linkColor}; text-decoration: none; font-size: 12px;">${itemLabel}</a>
                      </td>`;
                    });
                    html += `</tr>
                    </table>`;
                  } else {
                    const alignStyle = menuAlign === "left" ? "left" : menuAlign === "right" ? "right" : "center";
                    html += `<div style="margin: 12px 0; text-align: ${alignStyle};">`;
                    menuItems.forEach((item: any, idx: number) => {
                      const itemHref = item.url || item.href || "#";
                      html += `<a href="${itemHref}" style="color: ${linkColor}; text-decoration: none; margin: 0 8px; font-size: 12px;">${item.label || "Menu Item"}</a>`;
                      if (idx < menuItems.length - 1 && menuSeparator) {
                        html += `<span style="margin: 0 4px; font-size: 12px;">${menuSeparator}</span>`;
                      }
                    });
                    html += `</div>`;
                  }
                }
                break;
              }
              case "social": {
                const socialIcons = nestedBlock.props.icons || [];
                const iconSize = nestedBlock.props.iconSize || 50; // Increased to 50px for bigger, more prominent icons
                const iconType = nestedBlock.props.iconType || "circle";
                const iconSpacing = nestedBlock.props.iconSpacing || 20; // Increased spacing for better visual separation
                // Use nested block's alignment if set, otherwise use footer alignment
                const socialAlign = (nestedBlock.props.align !== undefined && nestedBlock.props.align !== null)
                  ? nestedBlock.props.align
                  : footerAlign;

                if (socialIcons.length > 0) {
                  // Use table-based layout for email compatibility
                  const alignStyle = socialAlign === "left" ? "left" : socialAlign === "right" ? "right" : "center";
                  // Match BlockRenderer exactly - use iconSize directly (no extra padding)
                  const containerSize = iconSize;
                  // Professional padding: more vertical space for better visual separation (matching main block)
                  html += `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 20px 0; margin: 0; box-sizing: border-box; width: 100%; max-width: 100%;">
                    <tr>
                      <td align="${alignStyle}" style="text-align: ${alignStyle}; width: 100%; max-width: 100%; overflow: hidden; box-sizing: border-box; padding: 0;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; border-collapse: separate; border-spacing: 0;" class="social-icons-table">
                          <tr>`;

                  socialIcons.forEach((icon: any, index: number) => {
                    const iconName = (icon.name || icon.icon || "facebook").toLowerCase();
                    const iconColor = getSocialIconColor(iconName);

                    // Check if using Cloudinary images (complete icons with backgrounds)
                    const iconImage = icon.image || icon.src || icon.img;
                    const isCloudinaryIcon = !iconImage && ['facebook', 'instagram', 'linkedin', 'twitter', 'x', 'whatsapp', 'youtube'].includes(iconName.toLowerCase());

                    // Build icon style - match desktop BlockRenderer exactly (same as main block)
                    let iconStyle = `width: ${containerSize}px !important; height: ${containerSize}px !important; max-width: ${containerSize}px !important; max-height: ${containerSize}px !important; display: block !important; text-decoration: none !important; box-sizing: border-box !important; overflow: hidden !important; position: relative !important;`;

                    // Apply icon type specific styles - Cloudinary images are complete, so use transparent background
                    if (iconType.includes("circle") || isCloudinaryIcon) {
                      // Cloudinary images are already complete circular icons with backgrounds and shadows
                      iconStyle += ` border-radius: 50% !important; background-color: transparent !important;`;
                    } else if (iconType.includes("round")) {
                      iconStyle += ` border-radius: 8px !important;`;
                      if (iconType === "round-black") {
                        iconStyle += ` background-color: #000000 !important;`;
                      } else {
                        iconStyle += ` background-color: ${iconColor} !important;`;
                      }
                      iconStyle += ` box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important;`;
                    } else if (iconType.includes("square")) {
                      iconStyle += ` border-radius: 0px !important;`;
                      if (iconType === "square-black") {
                        iconStyle += ` background-color: #000000 !important;`;
                      } else if (iconType === "square-white") {
                        iconStyle += ` background-color: #FFFFFF !important; border: 2px solid ${iconColor} !important;`;
                      } else {
                        iconStyle += ` background-color: ${iconColor} !important;`;
                      }
                      iconStyle += ` box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important;`;
                    } else {
                      // Default: Professional circular design - transparent for Cloudinary images
                      iconStyle += ` border-radius: 50% !important; background-color: transparent !important;`;
                    }

                    // All icons use the same size for consistent appearance in emails
                    const svgSize = iconSize; // Standard size (50px) for all icons

                    // Use helper function to create icon content
                    const iconContent = createSocialIconContent(iconName, svgSize);

                    // EXACT COPY from desktop BlockRenderer structure (same as main block)
                    html += `<td align="center" valign="middle" style="padding: 0 !important; width: ${containerSize}px !important; height: ${containerSize}px !important; vertical-align: middle !important; text-align: center !important;">
                      <table cellpadding="0" cellspacing="0" border="0" style="width: ${containerSize}px; height: ${containerSize}px; border-collapse: collapse;">
                        <tr>
                          <td align="center" valign="middle" style="padding: 0; width: ${containerSize}px; height: ${containerSize}px; vertical-align: middle; text-align: center;">
                            <a href="${escapeHtmlAttribute(icon.href || "#")}" target="_blank" rel="noopener noreferrer" style="${iconStyle} text-decoration: none !important; border: none !important; outline: none !important;" title="${escapeHtmlAttribute(icon.name || icon.icon || 'Social Icon')}">
                              ${iconContent}
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>`;

                    // Add professional spacer cell between icons (except after last icon) (matching main block)
                    if (index < socialIcons.length - 1) {
                      html += `<td style="padding: 0 !important; width: ${iconSpacing}px !important; min-width: ${iconSpacing}px !important; max-width: ${iconSpacing}px !important; vertical-align: middle !important; white-space: nowrap !important; box-sizing: border-box !important; overflow: hidden !important; font-size: 0 !important; line-height: 0 !important;">&nbsp;</td>`;
                    }
                  });

                  html += `</tr>
                        </table>
                      </td>
                    </tr>
                  </table>`;
                }
                break;
              }
              case "html": {
                html += nestedBlock.content || "";
                break;
              }
              default:
                html += nestedBlock.content || "";
            }
          });
        }

        html += `</div>`;
        break;
      }
    }
  });

  html += `
    </div>
  </div>
</body>
</html>`;

  return html;
};