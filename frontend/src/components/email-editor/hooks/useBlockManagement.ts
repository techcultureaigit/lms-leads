import { useState, useCallback } from "react";
import { EmailBlock } from "../types";
import { createBlock } from "../blockUtils";

// Helper function to normalize blocks and ensure they have props
const normalizeBlocks = (blocks: EmailBlock[]): EmailBlock[] => {
  return blocks.map((block) => {
    // Ensure block has props
    const normalizedBlock = {
      ...block,
      props: block.props || {},
    };
    
    // Normalize nested blocks in columns
    if (normalizedBlock.type === "columns" && normalizedBlock.props.columnBlocks) {
      const normalizedColumnBlocks: any = {};
      Object.keys(normalizedBlock.props.columnBlocks).forEach((colIdx) => {
        const colBlocks = normalizedBlock.props.columnBlocks[colIdx] || [];
        normalizedColumnBlocks[colIdx] = colBlocks.map((nb: EmailBlock) => ({
          ...nb,
          props: nb.props || {},
        }));
      });
      normalizedBlock.props.columnBlocks = normalizedColumnBlocks;
    }
    
    // Normalize nested blocks in header
    if (normalizedBlock.type === "header" && normalizedBlock.props.headerBlocks) {
      normalizedBlock.props.headerBlocks = normalizedBlock.props.headerBlocks.map((nb: EmailBlock) => ({
        ...nb,
        props: nb.props || {},
      }));
    }
    
    // Normalize nested blocks in footer
    if (normalizedBlock.type === "footer" && normalizedBlock.props.footerBlocks) {
      normalizedBlock.props.footerBlocks = normalizedBlock.props.footerBlocks.map((nb: EmailBlock) => ({
        ...nb,
        props: nb.props || {},
      }));
    }
    
    return normalizedBlock;
  });
};

export const useBlockManagement = (initialBlocks: EmailBlock[] = []) => {
  const [blocks, setBlocks] = useState<EmailBlock[]>(normalizeBlocks(initialBlocks));
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const addBlock = useCallback((type: string, insertIndex?: number, autoSelect: boolean = false) => {
    const newBlock = createBlock(type);
    
    if (insertIndex !== undefined) {
      setBlocks((prev) => {
        const newBlocks = [...prev];
        newBlocks.splice(insertIndex, 0, newBlock);
        return newBlocks;
      });
    } else {
      setBlocks((prev) => [...prev, newBlock]);
    }
    // Only auto-select if explicitly requested (e.g., when clicking to add, not drag-and-drop)
    if (autoSelect) {
      setSelectedBlock(newBlock.id);
    }
  }, []);

  const updateBlock = useCallback((id: string, updates: Partial<EmailBlock>) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id === id) {
          // Deep merge props if updates contain props
          if (updates.props && block.props) {
            // Deep merge style object if it exists
            const mergedProps = {
              ...block.props,
              ...updates.props,
              // Preserve style object if both exist
              style: updates.props.style || block.props.style
                ? {
                    ...(block.props.style || {}),
                    ...(updates.props.style || {}),
                  }
                : undefined,
            };
            return {
              ...block,
              ...updates,
              props: mergedProps,
            };
          }
          return { ...block, ...updates };
        }
        return block;
      })
    );
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
    setSelectedBlock((prev) => (prev === id ? null : prev));
  }, []);

  const moveBlock = useCallback((id: string, direction: "up" | "down") => {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === id);
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === prev.length - 1)
      ) {
        return prev;
      }

      const newBlocks = [...prev];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      [newBlocks[index], newBlocks[newIndex]] = [
        newBlocks[newIndex],
        newBlocks[index],
      ];
      return newBlocks;
    });
  }, []);

  const clearBlocks = useCallback(() => {
    setBlocks([]);
    setSelectedBlock(null);
  }, []);
  
  // Override setBlocks to normalize blocks
  const setBlocksNormalized = useCallback((newBlocks: EmailBlock[] | ((prev: EmailBlock[]) => EmailBlock[])) => {
    if (typeof newBlocks === 'function') {
      setBlocks((prev) => normalizeBlocks(newBlocks(prev)));
    } else {
      setBlocks(normalizeBlocks(newBlocks));
    }
  }, []);

  return {
    blocks,
    setBlocks: setBlocksNormalized,
    selectedBlock,
    setSelectedBlock,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    clearBlocks,
  };
};
