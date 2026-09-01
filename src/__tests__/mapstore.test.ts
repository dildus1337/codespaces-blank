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
    const state = useMapStore.getState();
    state.clearMap();
    // Save initial state to history so we have a base to undo/redo to
    const initialMap = state.map;
    useMapStore.setState({
      history: [
        {
          map: {
            version: initialMap.version,
            name: initialMap.name,
            width: initialMap.width,
            height: initialMap.height,
            tileSize: initialMap.tileSize,
            tiles: new Map(initialMap.tiles),
            entities: initialMap.entities.map((e) => ({ ...e })),
            metadata: { ...initialMap.metadata },
          },
          timestamp: Date.now(),
        },
      ],
      historyIndex: 0,
    });
  });

  describe('Map Operations', () => {
    it('should load a map', () => {
      const map = createMap('Test Map', 75, 75);
      useMapStore.getState().loadMap(map);

      const state = useMapStore.getState();
      expect(state.map.name).toBe('Test Map');
      expect(state.map.width).toBe(75);
      expect(state.map.height).toBe(75);
    });

    it('should clear the map', () => {
      const map = createMap('Test', 50, 50);
      useMapStore.getState().loadMap(map);
      useMapStore.getState().clearMap();

      const state = useMapStore.getState();
      expect(state.map.entities.length).toBe(0);
      expect(state.map.tiles.size).toBe(0);
    });

    it('should return map size', () => {
      const map = createMap('Size Test', 120, 80);
      useMapStore.getState().loadMap(map);

      const size = useMapStore.getState().getMapSize();
      expect(size.width).toBe(120);
      expect(size.height).toBe(80);
    });
  });

  describe('Tile Operations', () => {
    it('should set a tile', () => {
      useMapStore.getState().setTile(5, 10, TileType.WALL);
      expect(useMapStore.getState().getTile(5, 10)).toBe(TileType.WALL);
    });

    it('should clear a tile', () => {
      useMapStore.getState().setTile(5, 10, TileType.PLATFORM);
      useMapStore.getState().clearTile(5, 10);
      expect(useMapStore.getState().getTile(5, 10)).toBeUndefined();
    });

    it('should return undefined for non-existent tiles', () => {
      expect(useMapStore.getState().getTile(100, 100)).toBeUndefined();
    });
  });

  describe('Entity Operations', () => {
    it('should add an entity', () => {
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);
      useMapStore.getState().addEntity(monster);

      expect(useMapStore.getState().getAllEntities().length).toBe(1);
      expect(useMapStore.getState().getEntity(monster.id)).toEqual(monster);
    });

    it('should update an entity', () => {
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);
      useMapStore.getState().addEntity(monster);
      useMapStore.getState().updateEntity(monster.id, {
        position: { x: 30, y: 40 },
      });

      const updated = useMapStore.getState().getEntity(monster.id);
      expect(updated?.position).toEqual({ x: 30, y: 40 });
    });

    it('should remove an entity', () => {
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);
      useMapStore.getState().addEntity(monster);
      useMapStore.getState().removeEntity(monster.id);

      expect(useMapStore.getState().getAllEntities().length).toBe(0);
      expect(useMapStore.getState().getEntity(monster.id)).toBeUndefined();
    });

    it('should return all entities', () => {
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);
      const item = createItem({ x: 30, y: 40 }, ItemType.HEALTH_SMALL);
      useMapStore.getState().addEntity(monster);
      useMapStore.getState().addEntity(item);

      expect(useMapStore.getState().getAllEntities().length).toBe(2);
    });
  });

  describe('Selection Operations', () => {
    it('should select an entity', () => {
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);
      useMapStore.getState().addEntity(monster);
      useMapStore.getState().selectEntity(monster.id);

      expect(useMapStore.getState().selectedEntityId).toBe(monster.id);
    });

    it('should get selected entity', () => {
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);
      useMapStore.getState().addEntity(monster);
      useMapStore.getState().selectEntity(monster.id);

      expect(useMapStore.getState().getSelectedEntity()).toEqual(monster);
    });

    it('should deselect entity', () => {
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);
      useMapStore.getState().addEntity(monster);
      useMapStore.getState().selectEntity(monster.id);
      useMapStore.getState().selectEntity(null);

      expect(useMapStore.getState().selectedEntityId).toBeNull();
      expect(useMapStore.getState().getSelectedEntity()).toBeUndefined();
    });

    it('should clear selection when removing entity', () => {
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);
      useMapStore.getState().addEntity(monster);
      useMapStore.getState().selectEntity(monster.id);
      useMapStore.getState().removeEntity(monster.id);

      expect(useMapStore.getState().selectedEntityId).toBeNull();
    });
  });

  describe('Undo/Redo', () => {
    it('should undo an action', () => {
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);
      useMapStore.getState().addEntity(monster);
      useMapStore.getState().undo();

      expect(useMapStore.getState().getAllEntities().length).toBe(0);
    });

    it('should redo an action', () => {
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);
      useMapStore.getState().addEntity(monster);
      useMapStore.getState().undo();
      useMapStore.getState().redo();

      expect(useMapStore.getState().getAllEntities().length).toBe(1);
    });

    it('should report undo/redo availability', () => {
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);

      expect(useMapStore.getState().canUndo()).toBe(false);
      useMapStore.getState().addEntity(monster);

      expect(useMapStore.getState().canUndo()).toBe(true);
      expect(useMapStore.getState().canRedo()).toBe(false);

      useMapStore.getState().undo();

      expect(useMapStore.getState().canUndo()).toBe(false);
      expect(useMapStore.getState().canRedo()).toBe(true);
    });

    it('should limit history size', () => {
      // Add 150 actions
      for (let i = 0; i < 150; i++) {
        useMapStore.getState().setTile(i % 100, i % 100, TileType.WALL);
      }

      // History should be limited to ~100 entries
      expect(useMapStore.getState().history.length).toBeLessThanOrEqual(101);
    });
  });

  describe('Batch Operations', () => {
    it('should batch multiple operations into one undo', () => {
      const monster1 = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);
      const monster2 = createMonster({ x: 30, y: 40 }, MonsterType.CYBERDEMON);

      useMapStore.getState().startBatch();
      useMapStore.getState().addEntity(monster1);
      useMapStore.getState().addEntity(monster2);
      useMapStore.getState().endBatch();

      expect(useMapStore.getState().getAllEntities().length).toBe(2);

      useMapStore.getState().undo();

      // Both should be undone
      expect(useMapStore.getState().getAllEntities().length).toBe(0);
    });
  });

  describe('Integration', () => {
    it('should handle complex edit sequences', () => {
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);
      const item = createItem({ x: 50, y: 50 }, ItemType.AMMO_ROCKETS);

      // Add entities and tiles - complex sequence of operations
      useMapStore.getState().addEntity(monster);
      useMapStore.getState().addEntity(item);
      useMapStore.getState().setTile(10, 10, TileType.WALL);
      useMapStore.getState().setTile(20, 20, TileType.PLATFORM);
      useMapStore.getState().selectEntity(monster.id);

      // Verify state
      expect(useMapStore.getState().getAllEntities().length).toBe(2);
      expect(useMapStore.getState().map.tiles.size).toBe(2);
      expect(useMapStore.getState().selectedEntityId).toBe(monster.id);
      expect(useMapStore.getState().canUndo()).toBe(true);
      expect(useMapStore.getState().canRedo()).toBe(false);

      // Undo one action (deselect)
      useMapStore.getState().undo();
      expect(useMapStore.getState().selectedEntityId).toBeNull();

      // Should be able to redo the selection
      expect(useMapStore.getState().canRedo()).toBe(true);
    });
  });
});
