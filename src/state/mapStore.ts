import { create } from 'zustand';
import type { StoreApi, UseBoundStore } from 'zustand';

// Manual immer-like immutability management since we're not importing immer separately
import {
  MapData,
  Entity,
  EntityId,
  generateEntityId,
  createMap,
  getTileKey,
  TileType,
} from '../entities/types';

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

  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;

  // Map operations
  loadMap: (map: MapData) => void;
  clearMap: () => void;

  // Tile operations
  setTile: (x: number, y: number, tileType: TileType) => void;
  clearTile: (x: number, y: number) => void;
  getTile: (x: number, y: number) => TileType | undefined;

  // Entity operations
  addEntity: (entity: Entity) => void;
  updateEntity: (id: EntityId, changes: Partial<Entity>) => void;
  removeEntity: (id: EntityId) => void;
  getEntity: (id: EntityId) => Entity | undefined;
  getAllEntities: () => Entity[];

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
    history: [],
    historyIndex: -1,

    // Map operations
    loadMap: (map: MapData) => {
      set({
        map: copyMapData(map),
        selectedEntityId: null,
        history: [],
        historyIndex: -1,
      });
      // Save initial state to history
      setTimeout(() => saveToHistory(), 0);
    },

    clearMap: () => {
      set({
        map: createMap('Untitled Map', 100, 100),
        selectedEntityId: null,
      });
      recordAction();
    },

    // Tile operations
    setTile: (x: number, y: number, tileType: TileType) => {
      set((state) => ({
        ...state,
        map: {
          ...state.map,
          tiles: new Map([...state.map.tiles, [getTileKey(x, y), tileType]]),
        },
      }));
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

    // Entity operations
    addEntity: (entity: Entity) => {
      set((state) => ({
        ...state,
        map: {
          ...state.map,
          entities: [...state.map.entities, entity],
        },
      }));
      recordAction();
    },

    updateEntity: (id: EntityId, changes: Partial<Entity>) => {
      set((state) => ({
        ...state,
        map: {
          ...state.map,
          entities: state.map.entities.map((e) =>
            e.id === id ? { ...e, ...changes } : e
          ),
        },
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

    getEntity: (id: EntityId) => {
      const state = get();
      return state.map.entities.find((e) => e.id === id);
    },

    getAllEntities: () => {
      return get().map.entities;
    },

    // Selection
    selectEntity: (id: EntityId | null) => {
      set((state) => ({
        ...state,
        selectedEntityId: id,
      }));
    },

    getSelectedEntity: () => {
      const state = get();
      if (!state.selectedEntityId) return undefined;
      return state.map.entities.find((e) => e.id === state.selectedEntityId);
    },

    // History operations
    undo: () => {
      set((state) => {
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          return {
            ...state,
            historyIndex: newIndex,
            map: copyMapData(state.history[newIndex].map),
            selectedEntityId: null,
          };
        }
        return state;
      });
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1;
          return {
            ...state,
            historyIndex: newIndex,
            map: copyMapData(state.history[newIndex].map),
            selectedEntityId: null,
          };
        }
        return state;
      });
    },

    canUndo: () => {
      return get().historyIndex > 0;
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
