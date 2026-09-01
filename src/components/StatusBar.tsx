import React from 'react';
import { useMapStore } from '../state/mapStore';

interface StatusBarProps {
  zoomLevel: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ zoomLevel }) => {
  const { map, cursorCoords, activeTool, gridSnap, gridSize } = useMapStore();

  const toolLabels: Record<string, string> = {
    select: 'Select & Move (V)',
    tile_pencil: 'Tile Pencil (B)',
    tile_rect: 'Tile Rect (R)',
    tile_fill: 'Tile Fill (G)',
    tile_eraser: 'Tile Eraser (E)',
    entity_place: 'Place Entity (P)',
  };

  const monsterCount = map.entities.filter((e) => e.type === 'monster').length;
  const itemCount = map.entities.filter((e) => e.type === 'item').length;
  const spawnCount = map.entities.filter((e) => e.type === 'spawn').length;
  const triggerCount = map.entities.filter((e) => e.type === 'trigger').length;

  return (
    <div className="bg-gray-900 border-t border-gray-800 px-4 py-1.5 flex items-center justify-between text-xs text-gray-400 select-none">
      {/* Left side: Coordinates & active tool */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 font-semibold">TOOL:</span>
          <span className="text-blue-400 font-medium">{toolLabels[activeTool] || activeTool}</span>
        </div>

        <div className="w-px h-3.5 bg-gray-800" />

        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 font-semibold">POS:</span>
          <span className="text-gray-300 font-mono">
            X:{Math.round(cursorCoords.worldX)} Y:{Math.round(cursorCoords.worldY)}
          </span>
          <span className="text-gray-500 text-[11px] font-mono">
            [Col:{cursorCoords.tileX}, Row:{cursorCoords.tileY}]
          </span>
        </div>

        <div className="w-px h-3.5 bg-gray-800" />

        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 font-semibold">GRID:</span>
          <span className="text-gray-300 font-mono">
            {gridSize}px ({gridSnap ? 'Snap ON' : 'Snap OFF'})
          </span>
        </div>
      </div>

      {/* Right side: Map statistics and zoom */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-[11px]">
          <span title="Monsters">👹 {monsterCount}</span>
          <span title="Items">🔫 {itemCount}</span>
          <span title="Spawns">🚩 {spawnCount}</span>
          <span title="Triggers">⚡ {triggerCount}</span>
          <span title="Tiles" className="text-gray-500">🧱 {map.tiles.size} tiles</span>
        </div>

        <div className="w-px h-3.5 bg-gray-800" />

        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 font-semibold">ZOOM:</span>
          <span className="text-yellow-400 font-mono font-medium">{Math.round(zoomLevel * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
