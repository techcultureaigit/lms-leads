import { EmailBlock } from "./types";

export const getDefaultProps = (type: string): any => {
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
          { name: "x", href: "https://x.com", icon: "x" },
          { name: "youtube", href: "https://www.youtube.com", icon: "youtube" },
          { name: "instagram", href: "https://www.instagram.com", icon: "instagram" },
          { name: "whatsapp", href: "https://wa.me/", icon: "whatsapp" },
        ],
        align: "center",
        iconSize: 40,
        iconSpacing: 16,
        iconType: "circle",
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
        columnBlocks: {}, // Object mapping column index to array of blocks
      };
    case "menu":
      return {
        align: "left",
        layout: "horizontal",
        separator: "",
        items: [
          {
            actionType: "openWebsite",
            label: "Home",
            url: "#",
            href: "#",
            target: "_self",
          },
        ],
        style: {
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          fontWeight: "normal",
          letterSpacing: "0px",
          color: "#000000",
          linkColor: "#0066cc",
          padding: "5px 15px",
        },
      };
    case "logo":
      return {
        width: 100,
        height: 100,
        align: "center",
      };
    case "html":
      return {};
    case "header":
      return {
        align: "center",
        style: {
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderBottom: "2px solid #e0e0e0",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          color: "#333333",
        },
        headerBlocks: [], // Array of blocks inside header
      };
    case "footer":
      return {
        align: "center",
        style: {
          backgroundColor: "#ffffff",
          padding: "30px 20px",
          borderTop: "2px solid #e0e0e0",
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          color: "#000000",
        },
        footerBlocks: [], // Will be populated in createBlock function
      };
    default:
      return {};
  }
};

export const getDefaultContent = (type: string): string => {
  switch (type) {
    case "heading":
      return "";
    case "text":
      return "";
    case "button":
      return "Click Here";
    case "menu":
      return "Home | #\nAbout | #\nContact | #";
    case "html":
      return "<div>Your HTML code here</div>";
    case "header":
      return "";
    case "footer":
      return "";
    default:
      return "";
  }
};

// Helper function to create default header blocks
const createDefaultHeaderBlocks = (): EmailBlock[] => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  
  return [
    // Logo
    {
      id: `block-${timestamp}-${random}-header1`,
      type: "logo",
      props: {
        width: 120,
        height: 60,
        align: "left",
        imageSrc: typeof window !== "undefined" ? `https://res.cloudinary.com/dunw7w1ye/image/upload/v1793622947/ezwealth-assets/emailtemplates/email-templates/logo-cc42c0c5-6841-448e-86fa-36297851edec.png` : "https://res.cloudinary.com/dunw7w1ye/image/upload/v1793622947/ezwealth-assets/emailtemplates/email-templates/logo-cc42c0c5-6841-448e-86fa-36297851edec.png", // Default logo from public folder
      },
      content: "",
    },
    // Menu
    {
      id: `block-${timestamp}-${random}-header2`,
      type: "menu",
      props: {
        align: "right",
        layout: "horizontal",
        separator: " | ",
        items: [
          {
            actionType: "openWebsite",
            label: "Home",
            url: "#",
            href: "#",
            target: "_self",
          },
          {
            actionType: "openWebsite",
            label: "About",
            url: "#",
            href: "#",
            target: "_self",
          },
          {
            actionType: "openWebsite",
            label: "Contact",
            url: "#",
            href: "#",
            target: "_self",
          },
        ],
        style: {
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          fontWeight: "normal",
          letterSpacing: "0px",
          color: "#333333",
          linkColor: "#0066cc",
          padding: "5px 15px",
        },
      },
      content: "Home | #\nAbout | #\nContact | #",
    },
  ];
};

// Helper function to create default footer blocks
const createDefaultFooterBlocks = (): EmailBlock[] => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  
  return [
    // Company Information
    {
      id: `block-${timestamp}-${random}-footer1`,
      type: "text",
      props: {
        align: "center",
        style: {
          fontSize: "24px",
          color: "#000000",
          marginBottom: "12px",
          lineHeight: "1.6",
          fontWeight: "bold",
        },
      },
      content: "Wealth Discovery Securities Pvt. Ltd.",
    },
    // Registration Details
    {
      id: `block-${timestamp}-${random}-footer2`,
      type: "text",
      props: {
        align: "center",
        style: {
          fontSize: "11px",
          color: "#000000",
          marginBottom: "8px",
          lineHeight: "1.6",
        },
      },
      content: "SEBI Registration No. INZ000199032 | NSE TM Code: 14357 | BSE TM Code: 6435 | MCX TM Code: 46510 | CDSL Reg No.: DP-IN-DP-CDSL-679-2013 | CIN: U74999DL2010PTC211626",
    },

    // Registered Address
    {
      id: `block-${timestamp}-${random}-footer2c`,
      type: "text",
      props: {
        align: "center",
        style: {
          fontSize: "11px",
          color: "#000000",
          marginBottom: "8px",
          lineHeight: "1.6",
        },
      },
      content: "Registered Address: 1206 Kailash Building, 26 KG Marg, Connaught Place, New Delhi 110001",
    },
    // Complaints Email
    {
      id: `block-${timestamp}-${random}-footer2d`,
      type: "text",
      props: {
        align: "center",
        style: {
          fontSize: "11px",
          color: "#000000",
          marginBottom: "12px",
          lineHeight: "1.6",
        },
      },
      content: "For any complaints related to Wealth Discovery Securities Pvt. Ltd.",
    },
    // Contact info
    {
      id: `block-${timestamp}-${random}-footer3`,
      type: "text",
      props: {
        align: "center",
        style: {
          fontSize: "12px",
          color: "#000000",
          marginBottom: "16px",
          lineHeight: "1.5",
        },
      },
      content: "📞 919289944900 | ✉️ help@ezwealth.in",
    },
    // Social media icons
    {
      id: `block-${timestamp}-${random}-footer4`,
      type: "social",
      props: {
        icons: [
          { name: "facebook", href: "https://www.facebook.com", icon: "facebook" },
          { name: "x", href: "https://x.com", icon: "x" },
          { name: "youtube", href: "https://www.youtube.com", icon: "youtube" },
          { name: "instagram", href: "https://www.instagram.com", icon: "instagram" },
          { name: "whatsapp", href: "https://wa.me/", icon: "whatsapp" },
        ],
        align: "center",
        iconSize: 40,
        iconSpacing: 16,
        iconType: "circle",
      },
      content: "",
    },
    // App download buttons
    {
      id: `block-${timestamp}-${random}-footer5`,
      type: "html",
      props: {},
      content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;" class="app-download-buttons">
  <tr>
    <td align="center" style="text-align: center;">
      <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;" class="app-buttons-container">
        <tr>
          <td style="padding-right: 12px; vertical-align: top;" class="app-button-cell">
            <a href="/" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 12px; border-radius: 10px; text-decoration: none; width: 170px; max-width: 100%; box-sizing: border-box; border: 1px solid #333333;" class="app-download-button">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding-right: 8px; vertical-align: middle; width: 22px;">
                    <img src="https://www.ezwealth.in/assets/images/playstore.png" alt="Google Play" style="display: block; width: 22px; height: 22px; object-fit: contain;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <div style="font-size: 10px; line-height: 1.2; color: #d1d5db; margin-bottom: 4px;">GET IT ON</div>
                    <div style="font-size: 12px; line-height: 1.2; color: #ffffff; font-weight: normal;">Google Play</div>
                  </td>
                </tr>
              </table>
            </a>
          </td>
          <td style="padding-left: 12px; vertical-align: top;" class="app-button-cell">
            <a href="/" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 12px; border-radius: 10px; text-decoration: none; width: 170px; max-width: 100%; box-sizing: border-box; border: 1px solid #333333;" class="app-download-button">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding-right: 8px; vertical-align: middle; width: 30px;">
                    <img src="https://www.ezwealth.in/assets/images/apple.png" alt="App Store" style="display: block; width: 22px; height: 22px; object-fit: contain;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <div style="font-size: 10px; line-height: 1.2; color: #d1d5db; margin-bottom: 4px;">DOWNLOAD ON</div>
                    <div style="font-size: 12px; line-height: 1.2; color: #ffffff; font-weight: normal;">App Store</div>
                  </td>
                </tr>
              </table>
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`,
    },
  ];
};

export const createBlock = (type: string): EmailBlock => {
  const props = getDefaultProps(type);
  
  // For header, add default header blocks
  if (type === "header") {
    return {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      props: {
        ...props,
        headerBlocks: createDefaultHeaderBlocks(),
      },
      content: getDefaultContent(type),
    };
  }
  
  // For footer, add default footer blocks
  if (type === "footer") {
    return {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      props: {
        ...props,
        footerBlocks: createDefaultFooterBlocks(),
      },
      content: getDefaultContent(type),
    };
  }
  
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    props,
    content: getDefaultContent(type),
  };
};