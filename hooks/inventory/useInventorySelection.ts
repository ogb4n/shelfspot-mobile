import { useState } from 'react';

export const useInventorySelection = () => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const handleItemSelection = (itemId: number) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSelectAll = (allItemIds: number[]) => {
    if (selectedItems.length === allItemIds.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allItemIds);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems([]);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedItems([]);
  };

  const isItemSelected = (itemId: number) => selectedItems.includes(itemId);

  const hasSelectedItems = selectedItems.length > 0;

  const selectedItemsCount = selectedItems.length;

  return {
    isSelectionMode,
    selectedItems,
    selectedItemsCount,
    hasSelectedItems,
    handleItemSelection,
    handleSelectAll,
    toggleSelectionMode,
    exitSelectionMode,
    isItemSelected,
  };
};
