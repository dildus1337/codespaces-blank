import { renderHook, act } from '@testing-library/react';
import { useMapStore } from '../state/mapStore';
import {
  createMap,
  createMonster,
  createItem,
  MonsterType,
  ItemType,
  TileType,
} from '../entities/types';

describe('MapStore (Zustand)', () => {
  // Reset store before each test
  beforeEach(() => {
    const { result } = renderHook(() => useMapStore());
    act(() => {
      result.current.clearMap();
    });
  });

  describe('Map Operations', () => {
    it('should load a map', () => {
      const { result } = renderHook(() => useMapStore());
      const map = createMap('Test Map', 75, 75);

      act(() => {
        result.current.loadMap(map);
      });

      expect(result.current.map.name).toBe('Test Map');
      expect(result.current.map.width).toBe(75);
      expect(result.current.map.height).toBe(75);
    });

    it('should clear the map', () => {
      const { result } = renderHook(() => useMapStore());
      const map = createMap('Test', 50, 50);

      act(() => {
        result.current.loadMap(map);
        result.current.clearMap();
      });

      expect(result.current.map.entities.length).toBe(0);
      expect(result.current.map.tiles.size).toBe(0);
    });

    it('should return map size', () => {
      const { result } = renderHook(() => useMapStore());
      const map = createMap('Size Test', 120, 80);

      act(() => {
        result.current.loadMap(map);
      });

      const size = result.current.getMapSize();
      expect(size.width).toBe(120);
      expect(size.height).toBe(80);
    });
  });

  describe('Tile Operations', () => {
    it('should set a tile', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setTile(5, 10, TileType.WALL);
      });

      expect(result.current.getTile(5, 10)).toBe(TileType.WALL);
    });

    it('should clear a tile', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setTile(5, 10, TileType.PLATFORM);
        result.current.clearTile(5, 10);
      });

      expect(result.current.getTile(5, 10)).toBeUndefined();
    });

    it('should return undefined for non-existent tiles', () => {
      const { result } = renderHook(() => useMapStore());
      expect(result.current.getTile(100, 100)).toBeUndefined();
    });
  });

  describe('Entity Operations', () => {
    it('should add an entity', () => {
      const { result } = renderHook(() => useMapStore());
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);

      act(() => {
        result.current.addEntity(monster);
      });

      expect(result.current.getAllEntities().length).toBe(1);
      expect(result.current.getEntity(monster.id)).toEqual(monster);
    });

    it('should update an entity', () => {
      const { result } = renderHook(() => useMapStore());
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);

      act(() => {
        result.current.addEntity(monster);
        result.current.updateEntity(monster.id, { position: { x: 30, y: 40 } });
      });

      const updated = result.current.getEntity(monster.id);
      expect(updated?.position).toEqual({ x: 30, y: 40 });
    });

    it('should remove an entity', () => {
      const { result } = renderHook(() => useMapStore());
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);

      act(() => {
        result.current.addEntity(monster);
        result.current.removeEntity(monster.id);
      });

      expect(result.current.getAllEntities().length).toBe(0);
      expect(result.current.getEntity(monster.id)).toBeUndefined();
    });

    it('should return all entities', () => {
      const { result } = renderHook(() => useMapStore());
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);
      const item = createItem({ x: 30, y: 40 }, ItemType.HEALTH_SMALL);

      act(() => {
        result.current.addEntity(monster);
        result.current.addEntity(item);
      });

      expect(result.current.getAllEntities().length).toBe(2);
    });
  });

  describe('Selection Operations', () => {
    it('should select an entity', () => {
      const { result } = renderHook(() => useMapStore());
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);

      act(() => {
        result.current.addEntity(monster);
        result.current.selectEntity(monster.id);
      });

      expect(result.current.selectedEntityId).toBe(monster.id);
    });

    it('should get selected entity', () => {
      const { result } = renderHook(() => useMapStore());
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);

      act(() => {
        result.current.addEntity(monster);
        result.current.selectEntity(monster.id);
      });

      expect(result.current.getSelectedEntity()).toEqual(monster);
    });

    it('should deselect entity', () => {
      const { result } = renderHook(() => useMapStore());
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);

      act(() => {
        result.current.addEntity(monster);
        result.current.selectEntity(monster.id);
        result.current.selectEntity(null);
      });

      expect(result.current.selectedEntityId).toBeNull();
      expect(result.current.getSelectedEntity()).toBeUndefined();
    });

    it('should clear selection when removing entity', () => {
      const { result } = renderHook(() => useMapStore());
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);

      act(() => {
        result.current.addEntity(monster);
        result.current.selectEntity(monster.id);
        result.current.removeEntity(monster.id);
      });

      expect(result.current.selectedEntityId).toBeNull();
    });
  });

  describe('Undo/Redo', () => {
    it('should undo an action', () => {
      const { result } = renderHook(() => useMapStore());
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);

      act(() => {
        result.current.addEntity(monster);
        result.current.undo();
      });

      expect(result.current.getAllEntities().length).toBe(0);
    });

    it('should redo an action', () => {
      const { result } = renderHook(() => useMapStore());
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);

      act(() => {
        result.current.addEntity(monster);
        result.current.undo();
        result.current.redo();
      });

      expect(result.current.getAllEntities().length).toBe(1);
    });

    it('should report undo/redo availability', () => {
      const { result } = renderHook(() => useMapStore());
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);

      act(() => {
        expect(result.current.canUndo()).toBe(false);
        result.current.addEntity(monster);
      });

      expect(result.current.canUndo()).toBe(true);
      expect(result.current.canRedo()).toBe(false);

      act(() => {
        result.current.undo();
      });

      expect(result.current.canUndo()).toBe(false);
      expect(result.current.canRedo()).toBe(true);
    });

    it('should limit history size', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        // Add 150 actions
        for (let i = 0; i < 150; i++) {
          result.current.setTile(i % 100, i % 100, TileType.WALL);
        }
      });

      // History should be limited to ~100 entries
      expect(result.current.history.length).toBeLessThanOrEqual(101);
    });
  });

  describe('Batch Operations', () => {
    it('should batch multiple operations into one undo', () => {
      const { result } = renderHook(() => useMapStore());
      const monster1 = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);
      const monster2 = createMonster({ x: 30, y: 40 }, MonsterType.CYBERDEMON);

      act(() => {
        result.current.startBatch();
        result.current.addEntity(monster1);
        result.current.addEntity(monster2);
        result.current.endBatch();
      });

      expect(result.current.getAllEntities().length).toBe(2);

      act(() => {
        result.current.undo();
      });

      // Both should be undone
      expect(result.current.getAllEntities().length).toBe(0);
    });
  });

  describe('Integration', () => {
    it('should handle complex edit sequences', () => {
      const { result } = renderHook(() => useMapStore());
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);
      const item = createItem({ x: 50, y: 50 }, ItemType.AMMO_ROCKETS);

      act(() => {
        // Load map
        const map = createMap('Complex', 100, 100);
        result.current.loadMap(map);

        // Add entities
        result.current.addEntity(monster);
        result.current.addEntity(item);

        // Set tiles
        result.current.setTile(10, 10, TileType.WALL);
        result.current.setTile(20, 20, TileType.PLATFORM);

        // Select entity
        result.current.selectEntity(monster.id);
      });

      expect(result.current.getAllEntities().length).toBe(2);
      expect(result.current.map.tiles.size).toBe(2);
      expect(result.current.selectedEntityId).toBe(monster.id);

      // Undo several steps
      act(() => {
        result.current.undo();
        result.current.undo();
      });

      expect(result.current.map.tiles.size).toBe(0);
      expect(result.current.getAllEntities().length).toBe(2);
    });
  });
});
