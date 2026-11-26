import React from "react";
import { BlockType } from "./types";
import { FaTimes } from "react-icons/fa";

interface BlockSelectorModalProps {
  blockTypes: BlockType[];
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (blockType: string) => void;
}

export const BlockSelectorModal: React.FC<BlockSelectorModalProps> = ({
  blockTypes,
  isOpen,
  onClose,
  onSelectBlock,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Add Content Block</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Close"
          >
            <FaTimes className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 gap-3">
            {blockTypes.map((blockType) => {
              const IconComponent = blockType.icon;
              return (
                <button
                  key={blockType.type}
                  onClick={() => {
                    onSelectBlock(blockType.type);
                    onClose();
                  }}
                  className="group p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-[#fbc40c] hover:shadow-lg flex flex-col items-center gap-3"
                  title={blockType.label}
                >
                  <div className={`${blockType.color} p-3 rounded-lg text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-gray-700 text-center font-medium">{blockType.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
