/**
 * Editor toolbar with tools and actions
 */

import React from 'react';
import { useMapStore } from '../state/mapStore';

export const Toolbar: React.FC = () => {
  const { canUndo, canRedo, undo, redo, clearMap } = useMapStore();

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-2">
      {/* File operations */}
      <button
        onClick={clearMap}
        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
      >
        Clear
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-700 mx-1" />

      {/* Undo/Redo */}
      <button
        onClick={undo}
        disabled={!canUndo()}
        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-sm text-white"
      >
        Undo
      </button>
      <button
        onClick={redo}
        disabled={!canRedo()}
        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-sm text-white"
      >
        Redo
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-700 mx-1" />

      {/* Help text */}
      <div className="text-xs text-gray-400 ml-auto">
        Right-click to pan • Scroll to zoom • Click to select
      </div>
    </div>
  );
};

export default Toolbar;
