import React, { useEffect, useRef, useState } from 'react';
import { MapCanvas, DEFAULT_THEME } from '../editors/MapCanvas';
import { useMapStore } from '../state/mapStore';
import {
  Position,
  TileType,
  createMonster,
  createItem,
  createSpawn,
  createTrigger,
  MonsterType,
  ItemType,
  SpawnType,
  Entity,
} from '../entities/types';

interface MapEditorProps {
  className?: string;
  onZoomChange?: (zoom: number) => void;
}

export const MapEditor: React.FC<MapEditorProps> = ({ className = '', onZoomChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapCanvasRef = useRef<MapCanvas | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Store state
  const {
    map,
    activeTool,
    setActiveTool,
    selectedTileType,
    brushSize,
    selectedEntityTemplate,
    selectedEntityId,
    selectEntity,
    setTiles,
    floodFill,
    addEntity,
    updateEntity,
    removeEntity,
    duplicateEntity,
    copyEntity,
    pasteEntity,
    gridSnap,
    gridSize,
    showGrid,
    showTiles,
    showEntities,
    setCursorCoords,
    undo,
    redo,
    toggleGridSnap,
    toggleShowGrid,
  } = useMapStore();

  // Interaction local state
  const [isDrawing, setIsDrawing] = useState(false);
  const [draggedEntityId, setDraggedEntityId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [rectStart, setRectStart] = useState<Position | null>(null);
  const [rectCurrent, setRectCurrent] = useState<Position | null>(null);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    mapCanvasRef.current = new MapCanvas(canvasRef.current, map, DEFAULT_THEME);

    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const rect = canvasRef.current.parentElement.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const animate = () => {
      if (mapCanvasRef.current) {
        mapCanvasRef.current.render();
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      mapCanvasRef.current?.destroy();
    };
  }, []);

  // Update map in canvas
  useEffect(() => {
    if (mapCanvasRef.current) {
      mapCanvasRef.current.setMap(map);
    }
  }, [map]);

  // Update preview state in canvas
  useEffect(() => {
    if (mapCanvasRef.current) {
      mapCanvasRef.current.setPreviewState({
        tool: activeTool,
        tileType: selectedTileType,
        brushSize,
        rectStart,
        rectCurrent,
        selectedEntityId,
        showGrid,
        showTiles,
        showEntities,
        gridSize,
        entityTemplate: selectedEntityTemplate,
      });
      if (onZoomChange) {
        onZoomChange(mapCanvasRef.current.getViewport().scale);
      }
    }
  }, [
    activeTool,
    selectedTileType,
    brushSize,
    rectStart,
    rectCurrent,
    selectedEntityId,
    showGrid,
    showTiles,
    showEntities,
    gridSize,
    selectedEntityTemplate,
    onZoomChange,
  ]);

  // Helper to paint brush
  const paintBrushAt = (worldPos: Position, type: TileType) => {
    const tileX = Math.floor(worldPos.x / DEFAULT_THEME.tileSize);
    const tileY = Math.floor(worldPos.y / DEFAULT_THEME.tileSize);
    const offset = Math.floor((brushSize - 1) / 2);

    const tilesToUpdate: Array<{ x: number; y: number; tileType: TileType }> = [];
    for (let dy = 0; dy < brushSize; dy++) {
      for (let dx = 0; dx < brushSize; dx++) {
        const curX = tileX - offset + dx;
        const curY = tileY - offset + dy;
        if (curX >= 0 && curX < map.width && curY >= 0 && curY < map.height) {
          tilesToUpdate.push({ x: curX, y: curY, tileType: type });
        }
      }
    }
    if (tilesToUpdate.length > 0) {
      setTiles(tilesToUpdate);
    }
  };

  // Mouse Down handler
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mapCanvasRef.current || !canvasRef.current) return;
    if (e.button === 2 || e.button === 1 || e.altKey) return; // Pan handles this

    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = mapCanvasRef.current.screenToWorld(screenX, screenY);
    const tileX = Math.floor(worldPos.x / DEFAULT_THEME.tileSize);
    const tileY = Math.floor(worldPos.y / DEFAULT_THEME.tileSize);

    if (activeTool === 'select') {
      const entity = mapCanvasRef.current.getEntityAtPosition(worldPos.x, worldPos.y);
      if (entity) {
        selectEntity(entity.id);
        setDraggedEntityId(entity.id);
        setDragOffset({
          x: worldPos.x - entity.position.x,
          y: worldPos.y - entity.position.y,
        });
      } else {
        selectEntity(null);
      }
    } else if (activeTool === 'tile_pencil') {
      setIsDrawing(true);
      paintBrushAt(worldPos, selectedTileType);
    } else if (activeTool === 'tile_eraser') {
      setIsDrawing(true);
      paintBrushAt(worldPos, TileType.EMPTY);
    } else if (activeTool === 'tile_rect') {
      setIsDrawing(true);
      setRectStart({ x: tileX, y: tileY });
      setRectCurrent({ x: tileX, y: tileY });
    } else if (activeTool === 'tile_fill') {
      floodFill(tileX, tileY, selectedTileType);
    } else if (activeTool === 'entity_place' && selectedEntityTemplate) {
      const w = selectedEntityTemplate.width || 32;
      const h = selectedEntityTemplate.height || 32;
      let placeX = worldPos.x - w / 2;
      let placeY = worldPos.y - h / 2;

      if (gridSnap) {
        placeX = Math.round(placeX / gridSize) * gridSize;
        placeY = Math.round(placeY / gridSize) * gridSize;
      }

      let newEntity: Entity;
      if (selectedEntityTemplate.type === 'monster') {
        newEntity = createMonster(
          { x: placeX, y: placeY },
          (selectedEntityTemplate as any).monsterType || MonsterType.DEMON,
          {
            width: w,
            height: h,
            difficulty: (selectedEntityTemplate as any).difficulty,
          }
        );
      } else if (selectedEntityTemplate.type === 'item') {
        newEntity = createItem(
          { x: placeX, y: placeY },
          (selectedEntityTemplate as any).itemType || ItemType.WEAPON_SHOTGUN,
          { width: w, height: h }
        );
      } else if (selectedEntityTemplate.type === 'spawn') {
        newEntity = createSpawn(
          { x: placeX, y: placeY },
          (selectedEntityTemplate as any).spawnType || SpawnType.PLAYER_1
        );
      } else {
        newEntity = createTrigger(
          { x: placeX, y: placeY },
          (selectedEntityTemplate as any).action || 'open_door',
          { width: w, height: h }
        );
      }

      addEntity(newEntity);
    }
  };

  // Mouse Move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mapCanvasRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = mapCanvasRef.current.screenToWorld(screenX, screenY);
    const tileX = Math.floor(worldPos.x / DEFAULT_THEME.tileSize);
    const tileY = Math.floor(worldPos.y / DEFAULT_THEME.tileSize);

    setCursorCoords({
      worldX: worldPos.x,
      worldY: worldPos.y,
      tileX,
      tileY,
    });

    if (draggedEntityId && activeTool === 'select') {
      let newX = worldPos.x - dragOffset.x;
      let newY = worldPos.y - dragOffset.y;

      if (gridSnap) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      updateEntity(draggedEntityId as any, { position: { x: newX, y: newY } });
    } else if (isDrawing) {
      if (activeTool === 'tile_pencil') {
        paintBrushAt(worldPos, selectedTileType);
      } else if (activeTool === 'tile_eraser') {
        paintBrushAt(worldPos, TileType.EMPTY);
      } else if (activeTool === 'tile_rect') {
        setRectCurrent({ x: tileX, y: tileY });
      }
    }

    if (onZoomChange) {
      onZoomChange(mapCanvasRef.current.getViewport().scale);
    }
  };

  // Mouse Up handler
  const handleMouseUp = () => {
    if (draggedEntityId) {
      setDraggedEntityId(null);
    }

    if (isDrawing && activeTool === 'tile_rect' && rectStart && rectCurrent) {
      const minX = Math.max(0, Math.min(rectStart.x, rectCurrent.x));
      const maxX = Math.min(map.width - 1, Math.max(rectStart.x, rectCurrent.x));
      const minY = Math.max(0, Math.min(rectStart.y, rectCurrent.y));
      const maxY = Math.min(map.height - 1, Math.max(rectStart.y, rectCurrent.y));

      const tilesToSet: Array<{ x: number; y: number; tileType: TileType }> = [];
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          tilesToSet.push({ x, y, tileType: selectedTileType });
        }
      }
      setTiles(tilesToSet);
      setRectStart(null);
      setRectCurrent(null);
    }

    setIsDrawing(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Copy: Ctrl+C
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && selectedEntityId) {
        e.preventDefault();
        copyEntity(selectedEntityId);
        return;
      }

      // Paste: Ctrl+V
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteEntity();
        return;
      }

      // Duplicate: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedEntityId) {
        e.preventDefault();
        duplicateEntity(selectedEntityId);
        return;
      }

      // Delete / Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEntityId) {
        e.preventDefault();
        removeEntity(selectedEntityId);
        return;
      }

      // Arrow keys to nudge selected entity
      if (selectedEntityId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? gridSize * 2 : gridSize;
        const current = useMapStore.getState().getSelectedEntity();
        if (current) {
          let dx = 0;
          let dy = 0;
          if (e.key === 'ArrowLeft') dx = -step;
          if (e.key === 'ArrowRight') dx = step;
          if (e.key === 'ArrowUp') dy = -step;
          if (e.key === 'ArrowDown') dy = step;
          updateEntity(selectedEntityId, {
            position: { x: current.position.x + dx, y: current.position.y + dy },
          });
        }
        return;
      }

      // Tool switching keys
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('select');
            break;
          case 'b':
            setActiveTool('tile_pencil');
            break;
          case 'r':
            setActiveTool('tile_rect');
            break;
          case 'g':
            setActiveTool('tile_fill');
            break;
          case 'e':
            setActiveTool('tile_eraser');
            break;
          case 'p':
            setActiveTool('entity_place');
            break;
          case 's':
            toggleGridSnap();
            break;
          case '#':
            toggleShowGrid();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEntityId, gridSize]);

  return (
    <div
      className={`flex-1 relative bg-gray-950 overflow-hidden ${
        activeTool === 'select'
          ? 'cursor-default'
          : activeTool === 'entity_place'
          ? 'cursor-crosshair'
          : 'cursor-cell'
      } ${className}`}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full block"
      />
    </div>
  );
};

export default MapEditor;
