import React from "react";
import { EmailBlock } from "../types";

interface BlocksTabProps {
  blocks: EmailBlock[];
  onAddBlock: (type: string, insertIndex?: number, columnCount?: number, autoSelect?: boolean) => void;
  onUpdateBlock: (id: string, updates: Partial<EmailBlock>) => void;
  // Drag handlers so these layout items can be dragged into the canvas
  onDragStart?: (e: React.DragEvent, blockType: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export const BlocksTab: React.FC<BlocksTabProps> = ({
  blocks,
  onAddBlock,
  onUpdateBlock,
  onDragStart,
  onDragEnd,
}) => {
  const addColumnLayout = (columnCount: number) => {
    // Pass columnCount directly to onAddBlock, auto-select when clicking
    onAddBlock("columns", undefined, columnCount, true);
  };

  const addBlankBlock = () => {
    // Auto-select when clicking to add
    onAddBlock("text", undefined, undefined, true);
  };

  return (
    <>
      <div className="sticky top-0 bg-white border-b border-gray-200 p-2 z-10">
        <h3 className="text-[10px] font-semibold text-gray-700 uppercase">Blocks</h3>
      </div>
      <div className="p-2 space-y-2">
        {/* Blank Block */}
        <div>
          <p className="text-[10px] font-semibold text-gray-700 mb-1.5 uppercase">Blank</p>
          <button
            draggable={true}
            onDragStart={(e) => {
              // Provide JSON payload so drop handler can detect new block type
              try {
                e.dataTransfer.setData("application/json", JSON.stringify({ type: "new", blockType: "text" }));
              } catch (err) {
                // ignore
              }
              onDragStart?.(e, "text");
            }}
            onDragEnd={(e) => onDragEnd?.(e)}
            onClick={addBlankBlock}
            className="w-full p-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#0b5cff] transition-all text-left"
            title="Blank Block"
          >
            <div className="w-full h-10 bg-gray-50 rounded border border-gray-200 flex items-center justify-center">
              <span className="text-[10px] text-gray-400">Blank</span>
            </div>
          </button>
        </div>

        {/* Layout Blocks */}
        <div>
          <p className="text-[10px] font-semibold text-gray-700 mb-1.5 uppercase">Layouts</p>
          <div className="space-y-1.5">
            {[1, 2, 3, 4].map((count) => (
              <button
                key={count}
                draggable={true}
                onDragStart={(e) => {
                  // When dragging a layout, include columnCount in the payload FIRST
                  // This ensures columnCount is preserved even if handleDragStart overwrites it
                  try {
                    e.dataTransfer.setData("application/json", JSON.stringify({ type: "new", blockType: "columns", columnCount: count }));
                    // Also set it in a custom format as backup
                    e.dataTransfer.setData("text/columnCount", count.toString());
                  } catch (err) {
                    // ignore
                  }
                  // Call onDragStart to set draggedBlockType state
                  onDragStart?.(e, "columns");
                }}
                onDragEnd={(e) => onDragEnd?.(e)}
                onClick={() => addColumnLayout(count)}
                className="w-full p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#0b5cff] transition-all text-left"
                title={`${count} Column${count > 1 ? "s" : ""}`}
              >
                <div className={`w-full h-8 flex gap-1 mb-1`}>
                  {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex-1 bg-gray-100 rounded border border-gray-200"></div>
                  ))}
                </div>
                <div className="text-[10px] text-gray-600 text-center">
                  {count} Column{count > 1 ? "s" : ""}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
