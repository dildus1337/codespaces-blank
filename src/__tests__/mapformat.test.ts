import {
  serializeMap,
  deserializeMap,
  parseMapFromJSON,
  mapToJSONString,
  loadMapFromText,
  MapFormatError,
} from '../formats/MapFormat';
import {
  createMap,
  createMonster,
  createItem,
  MonsterType,
  ItemType,
  getTileKey,
  TileType,
} from '../entities/types';

describe('MapFormat Parser', () => {
  describe('serializeMap', () => {
    it('should serialize a map to JSON format', () => {
      const map = createMap('Test Map', 50, 50);
      const json = serializeMap(map);

      expect(json.version).toBe(1);
      expect(json.name).toBe('Test Map');
      expect(json.width).toBe(50);
      expect(json.height).toBe(50);
      expect(json.tileSize).toBe(32);
      expect(Array.isArray(json.tiles)).toBe(true);
      expect(Array.isArray(json.entities)).toBe(true);
    });

    it('should serialize map with entities and tiles', () => {
      const map = createMap('Complex Map', 100, 100);
      map.entities.push(createMonster({ x: 10, y: 20 }, MonsterType.DEMON));
      map.entities.push(createItem({ x: 30, y: 40 }, ItemType.HEALTH_SMALL));
      map.tiles.set(getTileKey(5, 5), TileType.WALL);

      const json = serializeMap(map);

      expect(json.entities.length).toBe(2);
      expect(json.tiles.length).toBe(1);
      expect(json.metadata?.modifiedAt).toBeDefined();
    });
  });

  describe('deserializeMap', () => {
    it('should deserialize valid map data', () => {
      const original = createMap('Test', 50, 50);
      const json = serializeMap(original);

      const result = deserializeMap(json);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('Test');
        expect(result.value.width).toBe(50);
        expect(result.value.height).toBe(50);
      }
    });

    it('should reject invalid version', () => {
      const json = {
        version: 0,
        name: 'Test',
        width: 50,
        height: 50,
        tileSize: 32,
        tiles: [],
        entities: [],
      };

      const result = deserializeMap(json as any);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(MapFormatError);
      }
    });

    it('should reject invalid dimensions', () => {
      const json = {
        version: 1,
        name: 'Test',
        width: -50,
        height: 50,
        tileSize: 32,
        tiles: [],
        entities: [],
      };

      const result = deserializeMap(json as any);

      expect(result.ok).toBe(false);
    });

    it('should reject empty map name', () => {
      const json = {
        version: 1,
        name: '',
        width: 50,
        height: 50,
        tileSize: 32,
        tiles: [],
        entities: [],
      };

      const result = deserializeMap(json as any);

      expect(result.ok).toBe(false);
    });

    it('should reject invalid tile types', () => {
      const json = {
        version: 1,
        name: 'Test',
        width: 50,
        height: 50,
        tileSize: 32,
        tiles: [['0,0', 'INVALID_TILE']],
        entities: [],
      };

      const result = deserializeMap(json as any);

      expect(result.ok).toBe(false);
    });
  });

  describe('parseMapFromJSON', () => {
    it('should parse valid JSON string', () => {
      const map = createMap('JSON Test', 60, 60);
      const json = serializeMap(map);
      const jsonString = JSON.stringify(json);

      const result = parseMapFromJSON(jsonString);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('JSON Test');
      }
    });

    it('should handle invalid JSON syntax', () => {
      const result = parseMapFromJSON('{ invalid json }');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Invalid JSON');
      }
    });

    it('should handle empty string', () => {
      const result = parseMapFromJSON('');

      expect(result.ok).toBe(false);
    });
  });

  describe('mapToJSONString', () => {
    it('should convert map to JSON string', () => {
      const map = createMap('Stringify Test', 70, 70);
      const result = mapToJSONString(map);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(typeof result.value).toBe('string');
        expect(result.value).toContain('Stringify Test');
      }
    });

    it('should format with pretty-print by default', () => {
      const map = createMap('Pretty', 40, 40);
      const result = mapToJSONString(map, true);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('\n');
      }
    });

    it('should format without pretty-print if requested', () => {
      const map = createMap('Compact', 40, 40);
      const result = mapToJSONString(map, false);

      expect(result.ok).toBe(true);
      if (result.ok) {
        // Check that newlines are not present (may not be completely true, but close enough)
        const lines = result.value.split('\n');
        expect(lines.length).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('loadMapFromText', () => {
    it('should load map from text file content', () => {
      const map = createMap('File Test', 50, 50);
      const json = serializeMap(map);
      const text = JSON.stringify(json);

      const result = loadMapFromText(text);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('File Test');
      }
    });

    it('should reject empty text', () => {
      const result = loadMapFromText('');

      expect(result.ok).toBe(false);
    });

    it('should reject whitespace-only text', () => {
      const result = loadMapFromText('   \n  \t  ');

      expect(result.ok).toBe(false);
    });
  });

  describe('Round-trip serialization', () => {
    it('should preserve map data through serialize/deserialize', () => {
      const original = createMap('Round-trip Test', 100, 100, 16);
      original.entities.push(createMonster({ x: 10, y: 20 }, MonsterType.DEMON));
      original.entities.push(createItem({ x: 50, y: 50 }, ItemType.AMMO_ROCKETS));
      original.tiles.set(getTileKey(0, 0), TileType.WALL);
      original.tiles.set(getTileKey(10, 10), TileType.PLATFORM);

      const json = serializeMap(original);
      const deserialized = deserializeMap(json);

      expect(deserialized.ok).toBe(true);
      if (deserialized.ok) {
        const restored = deserialized.value;
        expect(restored.name).toBe(original.name);
        expect(restored.width).toBe(original.width);
        expect(restored.height).toBe(original.height);
        expect(restored.tileSize).toBe(original.tileSize);
        expect(restored.entities.length).toBe(original.entities.length);
        expect(restored.tiles.size).toBe(original.tiles.size);
      }
    });

    it('should preserve map data through JSON string round-trip', () => {
      const original = createMap('JSON Round-trip', 80, 80);
      original.entities.push(createMonster({ x: 5, y: 15 }, MonsterType.CYBERDEMON));

      const jsonString = mapToJSONString(original);
      expect(jsonString.ok).toBe(true);

      if (jsonString.ok) {
        const loaded = parseMapFromJSON(jsonString.value);
        expect(loaded.ok).toBe(true);

        if (loaded.ok) {
          expect(loaded.value.name).toBe(original.name);
          expect(loaded.value.entities.length).toBe(original.entities.length);
        }
      }
    });
  });
});
