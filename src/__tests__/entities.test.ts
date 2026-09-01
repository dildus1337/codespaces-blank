import {
  createMap,
  createMonster,
  createItem,
  createSpawn,
  createTrigger,
  generateEntityId,
  MonsterType,
  ItemType,
  SpawnType,
  getTileKey,
  parseTileKey,
  isWithinBounds,
} from '../entities/types';

describe('Entity Types', () => {
  describe('createMap', () => {
    it('should create an empty map with correct properties', () => {
      const map = createMap('Test Map', 100, 100, 32);

      expect(map.name).toBe('Test Map');
      expect(map.width).toBe(100);
      expect(map.height).toBe(100);
      expect(map.tileSize).toBe(32);
      expect(map.tiles.size).toBe(0);
      expect(map.entities.length).toBe(0);
      expect(map.metadata?.createdAt).toBeDefined();
    });

    it('should use default tile size if not specified', () => {
      const map = createMap('Test', 50, 50);
      expect(map.tileSize).toBe(32);
    });
  });

  describe('createMonster', () => {
    it('should create a monster with default dimensions', () => {
      const monster = createMonster({ x: 10, y: 20 }, MonsterType.DEMON);

      expect(monster.type).toBe('monster');
      expect(monster.position).toEqual({ x: 10, y: 20 });
      expect(monster.monsterType).toBe(MonsterType.DEMON);
      expect(monster.width).toBe(32);
      expect(monster.height).toBe(32);
      expect(monster.id).toBeDefined();
    });

    it('should create a monster with custom options', () => {
      const monster = createMonster(
        { x: 5, y: 15 },
        MonsterType.CYBERDEMON,
        {
          width: 64,
          height: 64,
          difficulty: 'hard',
          rotation: 90,
        }
      );

      expect(monster.width).toBe(64);
      expect(monster.height).toBe(64);
      expect(monster.difficulty).toBe('hard');
      expect(monster.rotation).toBe(90);
    });

    it('should generate unique IDs for each monster', () => {
      const monster1 = createMonster({ x: 0, y: 0 }, MonsterType.DEMON);
      const monster2 = createMonster({ x: 0, y: 0 }, MonsterType.DEMON);

      expect(monster1.id).not.toBe(monster2.id);
    });
  });

  describe('createItem', () => {
    it('should create an item with default dimensions', () => {
      const item = createItem({ x: 30, y: 40 }, ItemType.HEALTH_SMALL);

      expect(item.type).toBe('item');
      expect(item.position).toEqual({ x: 30, y: 40 });
      expect(item.itemType).toBe(ItemType.HEALTH_SMALL);
      expect(item.width).toBe(16);
      expect(item.height).toBe(16);
    });

    it('should create an item with custom options', () => {
      const item = createItem(
        { x: 20, y: 25 },
        ItemType.WEAPON_ROCKET,
        { width: 24, height: 24, rotation: 45 }
      );

      expect(item.width).toBe(24);
      expect(item.height).toBe(24);
      expect(item.rotation).toBe(45);
    });
  });

  describe('createSpawn', () => {
    it('should create a spawn point', () => {
      const spawn = createSpawn({ x: 50, y: 50 }, SpawnType.PLAYER_1);

      expect(spawn.type).toBe('spawn');
      expect(spawn.position).toEqual({ x: 50, y: 50 });
      expect(spawn.spawnType).toBe(SpawnType.PLAYER_1);
      expect(spawn.width).toBe(32);
      expect(spawn.height).toBe(32);
      expect(spawn.rotation).toBe(0);
    });

    it('should create a spawn with custom rotation', () => {
      const spawn = createSpawn({ x: 10, y: 10 }, SpawnType.DEATHMATCH, { rotation: 180 });
      expect(spawn.rotation).toBe(180);
    });
  });

  describe('createTrigger', () => {
    it('should create a trigger with action', () => {
      const trigger = createTrigger({ x: 60, y: 70 }, 'open_door');

      expect(trigger.type).toBe('trigger');
      expect(trigger.position).toEqual({ x: 60, y: 70 });
      expect(trigger.action).toBe('open_door');
      expect(trigger.width).toBe(64);
      expect(trigger.height).toBe(64);
    });

    it('should create a trigger with target reference', () => {
      const targetId = generateEntityId();
      const trigger = createTrigger({ x: 0, y: 0 }, 'activate', {
        width: 32,
        height: 32,
        targetId,
      });

      expect(trigger.targetId).toBe(targetId);
    });
  });

  describe('getTileKey and parseTileKey', () => {
    it('should convert coordinates to key and back', () => {
      const key = getTileKey(5, 10);
      const coords = parseTileKey(key);

      expect(coords).toEqual({ x: 5, y: 10 });
    });

    it('should handle negative coordinates', () => {
      const key = getTileKey(-3, -7);
      const coords = parseTileKey(key);

      expect(coords).toEqual({ x: -3, y: -7 });
    });

    it('should floor float coordinates', () => {
      const key = getTileKey(5.8, 10.2);
      const coords = parseTileKey(key);

      expect(coords).toEqual({ x: 5, y: 10 });
    });
  });

  describe('isWithinBounds', () => {
    const map = createMap('Test', 100, 50);

    it('should return true for positions within bounds', () => {
      expect(isWithinBounds({ x: 0, y: 0 }, map)).toBe(true);
      expect(isWithinBounds({ x: 50, y: 25 }, map)).toBe(true);
      expect(isWithinBounds({ x: 99, y: 49 }, map)).toBe(true);
    });

    it('should return false for positions outside bounds', () => {
      expect(isWithinBounds({ x: -1, y: 0 }, map)).toBe(false);
      expect(isWithinBounds({ x: 100, y: 0 }, map)).toBe(false);
      expect(isWithinBounds({ x: 0, y: -1 }, map)).toBe(false);
      expect(isWithinBounds({ x: 0, y: 50 }, map)).toBe(false);
    });
  });

  describe('generateEntityId', () => {
    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateEntityId());
      }
      expect(ids.size).toBe(100);
    });

    it('should generate IDs with entity_ prefix', () => {
      const id = generateEntityId();
      expect(id.startsWith('entity_')).toBe(true);
    });
  });
});
