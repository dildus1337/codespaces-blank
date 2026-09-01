import { create } from 'zustand';

import {
  MapData,
  Entity,
  EntityId,
  createMap,
  getTileKey,
  TileType,
  generateEntityId,
} from '../entities/types';

export type ToolType =
  | 'select'
  | 'tile_pencil'
  | 'tile_rect'
  | 'tile_eraser'
  | 'tile_fill'
  | 'entity_place';

/**
 * Undo/redo history entry
 */
interface HistoryEntry {
  map: MapData;
  timestamp: number;
}

/**
 * Map editor store state
 */
export interface MapStore {
  // Map data
  map: MapData;
  selectedEntityId: EntityId | null;

  // Tools & Edit Mode
  activeTool: ToolType;
  selectedTileType: TileType;
  brushSize: number;
  selectedEntityTemplate: Partial<Entity> | null;

  // Grid & View Options
  gridSnap: boolean;
  gridSize: number;
  showGrid: boolean;
  showTiles: boolean;
  showEntities: boolean;
  cursorCoords: { worldX: number; worldY: number; tileX: number; tileY: number };

  // Clipboard
  copiedEntity: Entity | null;

  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;

  // Tool & Setting Actions
  setActiveTool: (tool: ToolType) => void;
  setSelectedTileType: (tileType: TileType) => void;
  setBrushSize: (size: number) => void;
  setSelectedEntityTemplate: (template: Partial<Entity> | null) => void;
  toggleGridSnap: () => void;
  setGridSize: (size: number) => void;
  toggleShowGrid: () => void;
  toggleShowTiles: () => void;
  toggleShowEntities: () => void;
  setCursorCoords: (coords: { worldX: number; worldY: number; tileX: number; tileY: number }) => void;

  // Map operations
  loadMap: (map: MapData) => void;
  clearMap: () => void;
  resizeMap: (newWidth: number, newHeight: number) => void;
  updateMapMetadata: (metadata: { name?: string; author?: string; description?: string }) => void;

  // Tile operations
  setTile: (x: number, y: number, tileType: TileType) => void;
  setTiles: (tiles: Array<{ x: number; y: number; tileType: TileType }>) => void;
  clearTile: (x: number, y: number) => void;
  getTile: (x: number, y: number) => TileType | undefined;
  floodFill: (startX: number, startY: number, fillType: TileType) => void;

  // Entity operations
  addEntity: (entity: Entity) => void;
  updateEntity: (id: EntityId, changes: Partial<Entity>) => void;
  removeEntity: (id: EntityId) => void;
  getEntity: (id: EntityId) => Entity | undefined;
  getAllEntities: () => Entity[];
  duplicateEntity: (id: EntityId) => Entity | undefined;
  copyEntity: (id: EntityId) => void;
  pasteEntity: (pos?: { x: number; y: number }) => void;

  // Selection
  selectEntity: (id: EntityId | null) => void;
  getSelectedEntity: () => Entity | undefined;

  // History operations
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Batch operations
  startBatch: () => void;
  endBatch: () => void;

  // Utility
  getMapSize: () => { width: number; height: number };
}

/**
 * Create a deep copy of map data for history
 */
function copyMapData(map: MapData): MapData {
  return {
    ...map,
    tiles: new Map(map.tiles),
    entities: map.entities.map((e) => ({ ...e })),
    metadata: { ...map.metadata },
  };
}

/**
 * Create the Zustand store
 */
export const useMapStore = create<MapStore>((set, get) => {
  let isBatching = false;

  const saveToHistory = () => {
    const state = get();
    const entry: HistoryEntry = {
      map: copyMapData(state.map),
      timestamp: Date.now(),
    };

    set((currentState) => {
      // Remove any redo entries
      const newHistory = currentState.history.slice(0, currentState.historyIndex + 1);
      newHistory.push(entry);

      // Limit history size to 100
      if (newHistory.length > 100) {
        newHistory.shift();
      }

      return {
        ...currentState,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  };

  const recordAction = () => {
    if (!isBatching) {
      saveToHistory();
    }
  };

  return {
    map: createMap('Untitled Map', 100, 100),
    selectedEntityId: null,

    // Tools
    activeTool: 'select',
    selectedTileType: TileType.WALL,
    brushSize: 1,
    selectedEntityTemplate: null,

    // Grid & View
    gridSnap: true,
    gridSize: 32,
    showGrid: true,
    showTiles: true,
    showEntities: true,
    cursorCoords: { worldX: 0, worldY: 0, tileX: 0, tileY: 0 },

    // Clipboard
    copiedEntity: null,

    // History
    history: [],
    historyIndex: -1,

    // Tool Actions
    setActiveTool: (tool: ToolType) => set({ activeTool: tool }),
    setSelectedTileType: (tileType: TileType) => set({ selectedTileType: tileType }),
    setBrushSize: (brushSize: number) => set({ brushSize: Math.max(1, Math.min(5, brushSize)) }),
    setSelectedEntityTemplate: (template) => set({ selectedEntityTemplate: template }),
    toggleGridSnap: () => set((state) => ({ gridSnap: !state.gridSnap })),
    setGridSize: (gridSize: number) => set({ gridSize }),
    toggleShowGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    toggleShowTiles: () => set((state) => ({ showTiles: !state.showTiles })),
    toggleShowEntities: () => set((state) => ({ showEntities: !state.showEntities })),
    setCursorCoords: (cursorCoords) => set({ cursorCoords }),

    // Map operations
    loadMap: (map: MapData) => {
      set({
        map: copyMapData(map),
        selectedEntityId: null,
        history: [],
        historyIndex: -1,
      });
      setTimeout(() => saveToHistory(), 0);
    },

    clearMap: () => {
      set({
        map: createMap('Untitled Map', 100, 100),
        selectedEntityId: null,
      });
      recordAction();
    },

    resizeMap: (newWidth: number, newHeight: number) => {
      set((state) => ({
        ...state,
        map: {
          ...state.map,
          width: Math.max(10, newWidth),
          height: Math.max(10, newHeight),
        },
      }));
      recordAction();
    },

    updateMapMetadata: (metadata) => {
      set((state) => ({
        ...state,
        map: {
          ...state.map,
          name: metadata.name !== undefined ? metadata.name : state.map.name,
          metadata: {
            ...state.map.metadata,
            author: metadata.author !== undefined ? metadata.author : state.map.metadata?.author,
            description: metadata.description !== undefined ? metadata.description : state.map.metadata?.description,
            modifiedAt: Date.now(),
          },
        },
      }));
      recordAction();
    },

    // Tile operations
    setTile: (x: number, y: number, tileType: TileType) => {
      set((state) => {
        const newTiles = new Map(state.map.tiles);
        newTiles.set(getTileKey(x, y), tileType);
        return {
          ...state,
          map: {
            ...state.map,
            tiles: newTiles,
          },
        };
      });
      recordAction();
    },

    setTiles: (tilesToSet) => {
      set((state) => {
        const newTiles = new Map(state.map.tiles);
        for (const item of tilesToSet) {
          if (item.tileType === TileType.EMPTY) {
            newTiles.delete(getTileKey(item.x, item.y));
          } else {
            newTiles.set(getTileKey(item.x, item.y), item.tileType);
          }
        }
        return {
          ...state,
          map: {
            ...state.map,
            tiles: newTiles,
          },
        };
      });
      recordAction();
    },

    clearTile: (x: number, y: number) => {
      set((state) => {
        const newTiles = new Map(state.map.tiles);
        newTiles.delete(getTileKey(x, y));
        return {
          ...state,
          map: {
            ...state.map,
            tiles: newTiles,
          },
        };
      });
      recordAction();
    },

    getTile: (x: number, y: number) => {
      const state = get();
      return state.map.tiles.get(getTileKey(x, y));
    },

    floodFill: (startX: number, startY: number, fillType: TileType) => {
      const state = get();
      const startKey = getTileKey(startX, startY);
      const targetType = state.map.tiles.get(startKey) || TileType.EMPTY;

      if (targetType === fillType) return;
      if (startX < 0 || startX >= state.map.width || startY < 0 || startY >= state.map.height) return;

      const newTiles = new Map(state.map.tiles);
      const visited = new Set<string>();
      const queue: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];

      while (queue.length > 0) {
        const { x, y } = queue.pop()!;
        const key = getTileKey(x, y);

        if (visited.has(key)) continue;
        visited.add(key);

        if (x < 0 || x >= state.map.width || y < 0 || y >= state.map.height) continue;

        const currentTile = newTiles.get(key) || TileType.EMPTY;
        if (currentTile !== targetType) continue;

        if (fillType === TileType.EMPTY) {
          newTiles.delete(key);
        } else {
          newTiles.set(key, fillType);
        }

        queue.push({ x: x + 1, y });
        queue.push({ x: x - 1, y });
        queue.push({ x, y: y + 1 });
        queue.push({ x, y: y - 1 });
      }

      set((curr) => ({
        ...curr,
        map: {
          ...curr.map,
          tiles: newTiles,
        },
      }));
      recordAction();
    },

    // Entity operations
    addEntity: (entity: Entity) => {
      set((state) => ({
        ...state,
        map: {
          ...state.map,
          entities: [...state.map.entities, entity],
        } as MapData,
        selectedEntityId: entity.id,
      }));
      recordAction();
    },

    updateEntity: (id: EntityId, changes: Partial<Entity>) => {
      set((state) => ({
        ...state,
        map: {
          ...state.map,
          entities: state.map.entities.map((e) =>
            e.id === id ? ({ ...e, ...changes } as Entity) : e
          ),
        } as MapData,
      }));
      recordAction();
    },

    removeEntity: (id: EntityId) => {
      set((state) => ({
        ...state,
        map: {
          ...state.map,
          entities: state.map.entities.filter((e) => e.id !== id),
        },
        selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
      }));
      recordAction();
    },

    duplicateEntity: (id: EntityId) => {
      const state = get();
      const entity = state.map.entities.find((e) => e.id === id);
      if (!entity) return undefined;

      const duplicated: Entity = {
        ...entity,
        id: generateEntityId(),
        position: {
          x: entity.position.x + state.gridSize,
          y: entity.position.y + state.gridSize,
        },
      };

      set((curr) => ({
        ...curr,
        map: {
          ...curr.map,
          entities: [...curr.map.entities, duplicated],
        } as MapData,
        selectedEntityId: duplicated.id,
      }));
      recordAction();
      return duplicated;
    },

    copyEntity: (id: EntityId) => {
      const state = get();
      const entity = state.map.entities.find((e) => e.id === id);
      if (entity) {
        set({ copiedEntity: { ...entity } });
      }
    },

    pasteEntity: (targetPos) => {
      const state = get();
      if (!state.copiedEntity) return;

      const pos = targetPos || {
        x: state.copiedEntity.position.x + state.gridSize,
        y: state.copiedEntity.position.y + state.gridSize,
      };

      const newEntity: Entity = {
        ...state.copiedEntity,
        id: generateEntityId(),
        position: pos,
      };

      set((curr) => ({
        ...curr,
        map: {
          ...curr.map,
          entities: [...curr.map.entities, newEntity],
        } as MapData,
        selectedEntityId: newEntity.id,
      }));
      recordAction();
    },

    getEntity: (id: EntityId) => {
      const state = get();
      return state.map.entities.find((e) => e.id === id);
    },

    getAllEntities: () => {
      return get().map.entities;
    },

    // Selection
    selectEntity: (id: EntityId | null) => {
      set({ selectedEntityId: id });
    },

    getSelectedEntity: () => {
      const state = get();
      return state.map.entities.find((e) => e.id === state.selectedEntityId);
    },

    // History operations
    undo: () => {
      const state = get();
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        const entry = state.history[newIndex];
        set({
          map: copyMapData(entry.map),
          historyIndex: newIndex,
          selectedEntityId: null,
        });
      }
    },

    redo: () => {
      const state = get();
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        const entry = state.history[newIndex];
        set({
          map: copyMapData(entry.map),
          historyIndex: newIndex,
          selectedEntityId: null,
        });
      }
    },

    canUndo: () => {
      const state = get();
      return state.historyIndex > 0;
    },

    canRedo: () => {
      const state = get();
      return state.historyIndex < state.history.length - 1;
    },

    // Batch operations
    startBatch: () => {
      isBatching = true;
    },

    endBatch: () => {
      isBatching = false;
      saveToHistory();
    },

    // Utility
    getMapSize: () => {
      const state = get();
      return {
        width: state.map.width,
        height: state.map.height,
      };
    },
  };
});
