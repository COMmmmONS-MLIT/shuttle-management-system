import { useState, useCallback } from "react";

type UseBulkSelectionOptions<T> = {
  items: T[];
  isSelectable?: (item: T) => boolean;
};

export const useBulkSelection = <T,>({
  items,
  isSelectable,
}: UseBulkSelectionOptions<T>) => {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        if (isSelectable) {
          const selectableIndexes = items
            .map((item, index) => {
              if (!isSelectable(item)) {
                return -1;
              }
              return index;
            })
            .filter((index) => index !== -1);
          setSelectedItems(new Set(selectableIndexes));
        } else {
          setSelectedItems(new Set(items.map((_, index) => index)));
        }
      } else {
        setSelectedItems(new Set());
      }
    },
    [items, isSelectable]
  );

  const handleIndividualCheckbox = useCallback((index: number, checked: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  return {
    selectedItems,
    handleSelectAll,
    handleIndividualCheckbox,
    clearSelection,
  };
};

