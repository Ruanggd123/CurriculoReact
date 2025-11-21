
import { useState, useCallback, useRef } from 'react';

// A custom hook to manage state with an undo/redo history.
export const useHistoryState = <T>(initialState: T) => {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // This ref is used to prevent the initial load from localStorage from creating a history entry.
  const isInitialSet = useRef(true);

  const setState = useCallback((value: T | ((prevState: T) => T), skipHistory = false) => {
    const newValue = typeof value === 'function' 
      ? (value as (prevState: T) => T)(history[currentIndex]) 
      : value;

    if (JSON.stringify(newValue) === JSON.stringify(history[currentIndex])) {
      return; // No change, no need to update history
    }

    if (skipHistory) {
      // Used for minor UI changes that shouldn't be in history, like collapsing a form item.
      const newHistory = [...history];
      newHistory[currentIndex] = newValue;
      setHistory(newHistory);
      return;
    }

    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newValue);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Resets the entire history with a new initial state. Used for loading from localStorage or resetting to default.
  const resetState = (newState: T) => {
    setHistory([newState]);
    setCurrentIndex(0);
  };

  return [history[currentIndex], setState, undo, redo, canUndo, canRedo, resetState] as const;
};
