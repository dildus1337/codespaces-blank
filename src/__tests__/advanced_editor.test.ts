import { useMapStore } from '../state/mapStore';
import { TileType, MonsterType, createMonster } from '../entities/types';
import { createHangarMap, createCyberdemonLairMap } from '../data/presetMaps';
import { serializeMap, deserializeMap } from '../formats/MapFormat';

describe('Advanced Map Editor & Tools', () => {
  beforeEach(() => {
    useMapStore.getState().clearMap();
  });

  describe('Tool Modes and Settings', () => {
    it('should switch active tools', () => {
      const store = useMapStore.getState();
      expect(store.activeTool).toBe('select');

      store.setActiveTool('tile_pencil');
      expect(useMapStore.getState().activeTool).toBe('tile_pencil');

      store.setActiveTool('tile_rect');
      expect(useMapStore.getState().activeTool).toBe('tile_rect');

      store.setActiveTool('entity_place');
      expect(useMapStore.getState().activeTool).toBe('entity_place');
    });

    it('should manage brush sizes within bounds 1-5', () => {
      const store = useMapStore.getState();
      store.setBrushSize(3);
      expect(useMapStore.getState().brushSize).toBe(3);

      store.setBrushSize(10);
      expect(useMapStore.getState().brushSize).toBe(5);

      store.setBrushSize(0);
      expect(useMapStore.getState().brushSize).toBe(1);
    });

    it('should toggle grid snap and visibility', () => {
      const store = useMapStore.getState();
      expect(store.gridSnap).toBe(true);

      store.toggleGridSnap();
      expect(useMapStore.getState().gridSnap).toBe(false);

      store.toggleShowGrid();
      expect(useMapStore.getState().showGrid).toBe(false);
    });
  });

  describe('Batch Tile & Flood Fill Operations', () => {
    it('should set multiple tiles in a batch', () => {
      const store = useMapStore.getState();
      store.setTiles([
        { x: 1, y: 1, tileType: TileType.WALL },
        { x: 1, y: 2, tileType: TileType.WALL },
        { x: 2, y: 1, tileType: TileType.LAVA },
      ]);

      const map = useMapStore.getState().map;
      expect(map.tiles.get('1,1')).toBe(TileType.WALL);
      expect(map.tiles.get('1,2')).toBe(TileType.WALL);
      expect(map.tiles.get('2,1')).toBe(TileType.LAVA);
    });

    it('should flood fill connected tiles', () => {
      const store = useMapStore.getState();
      // Draw a small 3x3 block of WALL tiles
      store.setTiles([
        { x: 5, y: 5, tileType: TileType.WALL },
        { x: 6, y: 5, tileType: TileType.WALL },
        { x: 5, y: 6, tileType: TileType.WALL },
        { x: 6, y: 6, tileType: TileType.WALL },
      ]);

      // Flood fill that block with LAVA
      store.floodFill(5, 5, TileType.LAVA);

      const map = useMapStore.getState().map;
      expect(map.tiles.get('5,5')).toBe(TileType.LAVA);
      expect(map.tiles.get('6,5')).toBe(TileType.LAVA);
      expect(map.tiles.get('5,6')).toBe(TileType.LAVA);
      expect(map.tiles.get('6,6')).toBe(TileType.LAVA);
    });
  });

  describe('Entity Copy, Paste, Duplicate', () => {
    it('should duplicate an entity with offset', () => {
      const store = useMapStore.getState();
      const monster = createMonster({ x: 32, y: 64 }, MonsterType.DEMON);
      store.addEntity(monster);

      const dup = store.duplicateEntity(monster.id);
      expect(dup).toBeDefined();
      expect(dup?.id).not.toBe(monster.id);
      expect(dup?.position.x).toBe(32 + store.gridSize);
      expect(dup?.position.y).toBe(64 + store.gridSize);

      expect(useMapStore.getState().map.entities.length).toBe(2);
    });

    it('should copy and paste an entity', () => {
      const store = useMapStore.getState();
      const monster = createMonster({ x: 100, y: 200 }, MonsterType.CYBERDEMON);
      store.addEntity(monster);

      store.copyEntity(monster.id);
      expect(useMapStore.getState().copiedEntity?.id).toBe(monster.id);

      store.pasteEntity({ x: 300, y: 400 });
      const entities = useMapStore.getState().map.entities;
      expect(entities.length).toBe(2);
      const pasted = entities[1];
      expect(pasted.position).toEqual({ x: 300, y: 400 });
      expect((pasted as any).monsterType).toBe(MonsterType.CYBERDEMON);
    });
  });

  describe('Map Resize and Metadata', () => {
    it('should resize map dimensions', () => {
      const store = useMapStore.getState();
      store.resizeMap(64, 48);

      expect(useMapStore.getState().map.width).toBe(64);
      expect(useMapStore.getState().map.height).toBe(48);
    });

    it('should update map metadata', () => {
      const store = useMapStore.getState();
      store.updateMapMetadata({
        name: 'Updated Deathmatch Arena',
        author: 'Doom Guy',
        description: 'New fiery arena',
      });

      const map = useMapStore.getState().map;
      expect(map.name).toBe('Updated Deathmatch Arena');
      expect(map.metadata?.author).toBe('Doom Guy');
      expect(map.metadata?.description).toBe('New fiery arena');
    });
  });

  describe('Preset Maps', () => {
    it('should create and validate Hangar preset map', () => {
      const map = createHangarMap();
      expect(map.name).toBe('E1M1 - Hangar Arena');
      expect(map.width).toBe(40);
      expect(map.height).toBe(24);
      expect(map.tiles.size).toBeGreaterThan(50);
      expect(map.entities.length).toBeGreaterThan(5);

      // Verify serialization round-trip
      const serialized = serializeMap(map);
      const deserialized = deserializeMap(serialized);
      expect(deserialized.ok).toBe(true);
      if (deserialized.ok) {
        expect(deserialized.value.entities.length).toBe(map.entities.length);
      }
    });

    it('should create and validate Cyberdemon Lair preset map', () => {
      const map = createCyberdemonLairMap();
      expect(map.name).toBe("Cyberdemon's Lair");
      expect(map.tiles.size).toBeGreaterThan(80);
      expect(map.entities.some((e) => (e as any).monsterType === MonsterType.CYBERDEMON)).toBe(true);
    });
  });
});
