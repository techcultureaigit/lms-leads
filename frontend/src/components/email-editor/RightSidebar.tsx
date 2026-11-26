"use client";

import { useState } from "react";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Code2,
  FolderOpen,
  Settings2,
  Square,
} from "lucide-react";
import { RightSidebarTab } from "./types";
import { ContentTab } from "./tabs/ContentTab";
import { BlocksTab } from "./tabs/BlocksTab";
import { TemplatesTab } from "./tabs/TemplatesTab";
import { DevTab } from "./tabs/DevTab";
import { GeneralSettingsTab } from "./tabs/GeneralSettingsTab";
import { BlockType, EmailBlock, GeneralSettings } from "./types";
import { cn } from "@/lib/utils";

interface RightSidebarProps {
  rightSidebarTab: RightSidebarTab;
  onTabChange: (tab: RightSidebarTab) => void;
  blockTypes: BlockType[];
  draggedBlockType: string | null;
  templateVariables: Record<string, string>;
  blocks: EmailBlock[];
  generalSettings?: GeneralSettings;
  htmlCode: string;
  onAddBlock: (
    type: string,
    insertIndex?: number,
    columnCount?: number,
    autoSelect?: boolean
  ) => void;
  onUpdateBlock: (id: string, updates: Partial<EmailBlock>) => void;
  onSettingsChange?: (settings: GeneralSettings) => void;
  onHtmlChange: (html: string) => void;
  onDragStart: (e: React.DragEvent, blockType: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onBlocksChange?: (blocks: EmailBlock[]) => void;
  onClearBlocks?: () => void;
  hideContentBlocks?: boolean;
  onLoadTemplate?: (blocks: EmailBlock[]) => void;
  onSaveTemplate?: (blocks: EmailBlock[]) => void;
  templateRefreshTrigger?: number;
}

const TAB_BTN =
  "flex w-full flex-col items-center gap-1 border-b border-slate-200 px-1 py-2.5 text-[9px] font-semibold transition dark:border-slate-800";

export const RightSidebar: React.FC<RightSidebarProps> = ({
  rightSidebarTab,
  onTabChange,
  blockTypes,
  draggedBlockType,
  templateVariables,
  blocks,
  generalSettings,
  htmlCode,
  onAddBlock,
  onUpdateBlock,
  onSettingsChange,
  onHtmlChange,
  onDragStart,
  onDragEnd,
  onBlocksChange,
  onClearBlocks,
  hideContentBlocks = false,
  onLoadTemplate,
  onSaveTemplate,
  templateRefreshTrigger,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const selectTab = (tab: RightSidebarTab) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setTimeout(() => onTabChange(tab), 100);
    } else {
      onTabChange(tab);
    }
  };

  const tabClass = (active: boolean) =>
    cn(
      TAB_BTN,
      active
        ? "bg-white text-[#0b5cff] shadow-[inset_3px_0_0_0_#0b5cff] dark:bg-slate-900 dark:text-[#6b9fff]"
        : "text-slate-500 hover:bg-white hover:text-slate-800 dark:hover:bg-slate-900 dark:hover:text-slate-200",
      isCollapsed && "opacity-70 hover:opacity-100"
    );

  return (
    <div
      className={cn(
        "relative flex h-full border-l border-slate-200 bg-white shadow-sm transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900",
        isCollapsed ? "w-12" : "w-80"
      )}
    >
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute left-0 top-1/2 z-30 flex h-9 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-l-md border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {!isCollapsed ? (
        <div className="min-h-0 w-[272px] flex-1 overflow-y-auto bg-white dark:bg-slate-900">
          {rightSidebarTab === "content" && !hideContentBlocks ? (
            <ContentTab
              blockTypes={blockTypes}
              draggedBlockType={draggedBlockType}
              templateVariables={templateVariables}
              onAddBlock={onAddBlock}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ) : null}

          {rightSidebarTab === "blocks" && !hideContentBlocks ? (
            <BlocksTab
              blocks={blocks}
              onAddBlock={onAddBlock}
              onUpdateBlock={onUpdateBlock}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ) : null}

          {(rightSidebarTab === "body" || rightSidebarTab === "settings") &&
          generalSettings &&
          onSettingsChange &&
          onBlocksChange &&
          onClearBlocks ? (
            <GeneralSettingsTab
              generalSettings={generalSettings}
              onSettingsChange={onSettingsChange}
              blocks={blocks}
              onBlocksChange={onBlocksChange}
              onClearBlocks={onClearBlocks}
            />
          ) : null}

          {rightSidebarTab === "dev" ? (
            <DevTab htmlCode={htmlCode} onHtmlChange={onHtmlChange} />
          ) : null}

          {rightSidebarTab === "templates" && onLoadTemplate ? (
            <TemplatesTab
              blocks={blocks}
              onLoadTemplate={onLoadTemplate}
              onSaveTemplate={onSaveTemplate}
              refreshTrigger={templateRefreshTrigger}
            />
          ) : null}
        </div>
      ) : null}

      <div className="flex w-12 shrink-0 flex-col border-l border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60">
        {!hideContentBlocks ? (
          <>
            <button
              type="button"
              onClick={() => selectTab("content")}
              className={tabClass(rightSidebarTab === "content")}
              title="Content"
            >
              <Square className="h-4 w-4" />
              Content
            </button>
            <button
              type="button"
              onClick={() => selectTab("blocks")}
              className={tabClass(rightSidebarTab === "blocks")}
              title="Blocks"
            >
              <Boxes className="h-4 w-4" />
              Blocks
            </button>
            <button
              type="button"
              onClick={() => selectTab("templates")}
              className={tabClass(rightSidebarTab === "templates")}
              title="Templates"
            >
              <FolderOpen className="h-4 w-4" />
              Templates
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => selectTab("body")}
          className={tabClass(
            rightSidebarTab === "body" || rightSidebarTab === "settings"
          )}
          title="Body settings"
        >
          <Settings2 className="h-4 w-4" />
          Body
        </button>
        <button
          type="button"
          onClick={() => selectTab("dev")}
          className={tabClass(rightSidebarTab === "dev")}
          title="Dev tools"
        >
          <Code2 className="h-4 w-4" />
          Dev
        </button>
      </div>
    </div>
  );
};
