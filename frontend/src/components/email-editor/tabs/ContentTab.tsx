import React from "react";
import { BlockType } from "../types";

interface ContentTabProps {
  blockTypes: BlockType[];
  draggedBlockType: string | null;
  templateVariables: Record<string, string>;
  onAddBlock: (type: string, insertIndex?: number, columnCount?: number, autoSelect?: boolean) => void;
  onDragStart: (e: React.DragEvent, blockType: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export const ContentTab: React.FC<ContentTabProps> = ({
  blockTypes,
  draggedBlockType,
  templateVariables,
  onAddBlock,
  onDragStart,
  onDragEnd,
}) => {
  const dragRef = React.useRef<{ [key: string]: boolean }>({});

  return (
    <>
      <div className="sticky top-0 bg-white border-b border-gray-200 p-2 z-10">
        <h3 className="text-[10px] font-semibold text-gray-700 uppercase">Content Blocks</h3>
      </div>
      {/* Icon Grid Layout - Clean and Simple */}
      <div className="p-2 grid grid-cols-2 gap-1.5">
        {blockTypes.map((blockType) => {
          const IconComponent = blockType.icon;
          return (
            <button
              key={blockType.type}
              draggable={true}
              onDragStart={(e) => {
                dragRef.current[blockType.type] = true;
                e.dataTransfer.effectAllowed = "copy";
                e.dataTransfer.setData("text/plain", blockType.type);
                e.dataTransfer.setData("blockType", blockType.type);
                
                // For columns blocks, include default columnCount (2 columns)
                const payload: any = { type: "new", blockType: blockType.type };
                if (blockType.type === "columns") {
                  payload.columnCount = 2; // Default to 2 columns
                  e.dataTransfer.setData("text/columnCount", "2");
                }
                e.dataTransfer.setData("application/json", JSON.stringify(payload));
                
                onDragStart(e, blockType.type);
              }}
              onDragEnd={(e) => {
                // Small delay to prevent click from firing after drag
                setTimeout(() => {
                  dragRef.current[blockType.type] = false;
                }, 100);
                onDragEnd(e);
              }}
              onClick={(e) => {
                // Only add block if not dragging
                if (!dragRef.current[blockType.type]) {
                  // When clicking (not dragging), auto-select the new block
                  onAddBlock(blockType.type, undefined, undefined, true);
                }
                dragRef.current[blockType.type] = false;
              }}
              className={`group rounded-lg border border-slate-200 bg-white p-2 transition-all duration-200 hover:border-[#0b5cff] hover:shadow-sm cursor-grab active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900 ${
                draggedBlockType === blockType.type
                  ? "border-[#0b5cff] opacity-50 shadow-sm"
                  : ""
              }`}
              title={blockType.label}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div className={`${blockType.color} p-2.5 rounded-lg text-white flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-gray-700 text-center font-medium leading-tight">{blockType.label}</span>
              </div>
            </button>
          );
        })}
      </div>
      {/* Variables Info */}
      {Object.keys(templateVariables).length > 0 && (
        <div className="p-2 border-t border-gray-200 bg-gray-50">
          <p className="text-[10px] text-gray-600 mb-1.5 font-medium">Variables:</p>
          <div className="flex flex-wrap gap-1">
            {Object.keys(templateVariables).map((key) => (
              <span
                key={key}
                className="text-[10px] px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-700"
              >
                {templateVariables[key]}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
