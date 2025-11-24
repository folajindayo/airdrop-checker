import { useState, useCallback } from "react";

interface UseMultiSelectResult<T> {
  selected: T[];
  isSelected: (item: T) => boolean;
  toggle: (item: T) => void;
  select: (item: T) => void;
  deselect: (item: T) => void;
  selectAll: (items: T[]) => void;
  deselectAll: () => void;
  selectedCount: number;
  hasSelection: boolean;
}

export function useMultiSelect<T>(
  initialSelected: T[] = [],
  compareFn: (a: T, b: T) => boolean = (a, b) => a === b
): UseMultiSelectResult<T> {
  const [selected, setSelected] = useState<T[]>(initialSelected);

  const isSelected = useCallback(
    (item: T) => {
      return selected.some((s) => compareFn(s, item));
    },
    [selected, compareFn]
  );

  const select = useCallback(
    (item: T) => {
      setSelected((prev) => {
        if (prev.some((s) => compareFn(s, item))) {
          return prev;
        }
        return [...prev, item];
      });
    },
    [compareFn]
  );

  const deselect = useCallback(
    (item: T) => {
      setSelected((prev) => prev.filter((s) => !compareFn(s, item)));
    },
    [compareFn]
  );

  const toggle = useCallback(
    (item: T) => {
      if (isSelected(item)) {
        deselect(item);
      } else {
        select(item);
      }
    },
    [isSelected, select, deselect]
  );

  const selectAll = useCallback((items: T[]) => {
    setSelected(items);
  }, []);

  const deselectAll = useCallback(() => {
    setSelected([]);
  }, []);

  const selectedCount = selected.length;
  const hasSelection = selectedCount > 0;

  return {
    selected,
    isSelected,
    toggle,
    select,
    deselect,
    selectAll,
    deselectAll,
    selectedCount,
    hasSelection,
  };
}

