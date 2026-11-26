export interface CustomEmailEditorProps {
  onDesignChange?: (design: any) => void;
  onHtmlChange?: (html: string) => void;
  initialDesign?: any;
  initialHtml?: string;
}

export interface EmailBlock {
  id: string;
  type: string;
  props: any;
  content?: string;
}

export interface GeneralSettings {
  textColor: string;
  backgroundColor: string;
  contentWidth: string;
  contentAlignment: "left" | "center" | "right" | "justify";
  fontFamily: string;
  padding: string;
  lineHeight: string;
  fontSize: string;
  linkColor: string;
  borderRadius: string;
  letterSpacing?: string;
  fontWeight?: string;
}

export interface BlockType {
  type: string;
  label: string;
  icon: any;
  color: string;
}

export type RightSidebarTab = "content" | "blocks" | "dev" | "settings" | "body" | "templates";
export type DeviceView = "desktop" | "mobile";
