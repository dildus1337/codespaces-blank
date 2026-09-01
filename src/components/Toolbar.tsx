import React, { useState } from 'react';
import { useMapStore, ToolType } from '../state/mapStore';
import { ShortcutsModal } from './ShortcutsModal';

export const Toolbar: React.FC = () => {
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const {
    activeTool,
    setActiveTool,
    brushSize,
    setBrushSize,
    gridSnap,
    toggleGridSnap,
    gridSize,
    setGridSize,
    showGrid,
    toggleShowGrid,
    showTiles,
    toggleShowTiles,
    showEntities,
    toggleShowEntities,
    undo,
    redo,
    canUndo,
    canRedo,
    clearMap,
  } = useMapStore();

  const tools: Array<{ id: ToolType; label: string; icon: string; key: string }> = [
    { id: 'select', label: 'Select & Move', icon: '↖', key: 'V' },
    { id: 'tile_pencil', label: 'Tile Pencil', icon: '✏️', key: 'B' },
    { id: 'tile_rect', label: 'Tile Box', icon: '▱', key: 'R' },
    { id: 'tile_fill', label: 'Flood Fill', icon: '🪣', key: 'G' },
    { id: 'tile_eraser', label: 'Tile Eraser', icon: '⌫', key: 'E' },
    { id: 'entity_place', label: 'Place Entity', icon: '➕', key: 'P' },
  ];

  return (
    <>
      <div className="bg-gray-900 border-b border-gray-800 px-3 py-1.5 flex items-center justify-between gap-3 text-xs select-none">
        {/* Left: Tools selection */}
        <div className="flex items-center gap-1">
          <div className="flex bg-gray-950 p-0.5 rounded-lg border border-gray-800">
            {tools.map((t) => {
              const isActive = activeTool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTool(t.id)}
                  title={`${t.label} (${t.key})`}
                  className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  <span className="text-sm">{t.icon}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Brush size (when tile tool) */}
          {(activeTool === 'tile_pencil' || activeTool === 'tile_eraser') && (
            <div className="flex items-center gap-1 ml-2 bg-gray-950 px-2 py-1 rounded border border-gray-800">
              <span className="text-gray-400 text-[11px]">Size:</span>
              {[1, 2, 3, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setBrushSize(s)}
                  className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[11px] ${
                    brushSize === s
                      ? 'bg-blue-500 text-white font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center: Grid & Layer Toggles */}
        <div className="flex items-center gap-2">
          {/* Grid Snap & Size */}
          <div className="flex items-center bg-gray-950 p-0.5 rounded-lg border border-gray-800">
            <button
              onClick={toggleGridSnap}
              title="Toggle Grid Snap (S)"
              className={`px-2 py-1 rounded flex items-center gap-1 font-medium ${
                gridSnap ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span>🧲</span>
              <span className="hidden md:inline">Snap</span>
            </button>

            <select
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="bg-transparent text-gray-300 px-1 py-1 text-xs outline-none cursor-pointer border-l border-gray-800"
            >
              <option value={8} className="bg-gray-900">8px</option>
              <option value={16} className="bg-gray-900">16px</option>
              <option value={32} className="bg-gray-900">32px</option>
              <option value={64} className="bg-gray-900">64px</option>
            </select>

            <button
              onClick={toggleShowGrid}
              title="Toggle Grid Lines"
              className={`px-2 py-1 rounded ${
                showGrid ? 'text-blue-400' : 'text-gray-500 hover:bg-gray-800'
              }`}
            >
              <span>#</span>
            </button>
          </div>

          {/* Layer visibility toggles */}
          <div className="hidden lg:flex items-center bg-gray-950 p-0.5 rounded-lg border border-gray-800">
            <button
              onClick={toggleShowTiles}
              title="Toggle Tiles Layer"
              className={`px-2 py-1 rounded text-[11px] ${
                showTiles ? 'text-gray-200' : 'text-gray-600 line-through'
              }`}
            >
              🧱 Tiles
            </button>
            <button
              onClick={toggleShowEntities}
              title="Toggle Entities Layer"
              className={`px-2 py-1 rounded text-[11px] border-l border-gray-800 ${
                showEntities ? 'text-gray-200' : 'text-gray-600 line-through'
              }`}
            >
              👹 Entities
            </button>
          </div>
        </div>

        {/* Right: History & Help */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={undo}
            disabled={!canUndo()}
            title="Undo (Ctrl+Z)"
            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded text-gray-200 font-medium transition flex items-center gap-1"
          >
            <span>↩️</span>
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            onClick={redo}
            disabled={!canRedo()}
            title="Redo (Ctrl+Y)"
            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded text-gray-200 font-medium transition flex items-center gap-1"
          >
            <span>↪️</span>
            <span className="hidden sm:inline">Redo</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Clear the entire map? All unsaved changes will be lost.')) {
                clearMap();
              }
            }}
            title="Clear entire map"
            className="px-2.5 py-1 bg-gray-800 hover:bg-red-900/60 hover:text-red-300 text-gray-400 rounded transition"
          >
            Clear
          </button>

          <button
            onClick={() => setIsShortcutsOpen(true)}
            title="Keyboard Shortcuts"
            className="p-1.5 bg-gray-800 hover:bg-gray-700 text-yellow-400 rounded transition ml-1"
          >
            ⌨️
          </button>
        </div>
      </div>

      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </>
  );
};

export default Toolbar;
