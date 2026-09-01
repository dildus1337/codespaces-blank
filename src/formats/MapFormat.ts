/**
 * Map format parser and serializer for Doom 2D map files.
 * Handles both JSON format (for now) and future compatibility with other formats.
 */

import {
  MapData,
  Entity,
  TileMap,
  TileType,
  parseTileKey,
} from '../entities/types';

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

/**
 * JSON representation of a map for serialization
 */
export interface MapJSON {
  version: number;
  name: string;
  width: number;
  height: number;
  tileSize: number;
  tiles: Array<[string, string]>; // [key, tileType]
  entities: Entity[];
  metadata?: {
    author?: string;
    description?: string;
    createdAt?: number;
    modifiedAt?: number;
  };
}

/**
 * Validation error for map data
 */
export class MapFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MapFormatError';
  }
}

/**
 * Validate that map data has required fields and correct types
 */
function validateMapData(data: unknown): data is MapJSON {
  if (typeof data !== 'object' || data === null) {
    throw new MapFormatError('Map data must be an object');
  }

  const map = data as Record<string, unknown>;

  if (typeof map.version !== 'number' || map.version < 1) {
    throw new MapFormatError('Invalid version number');
  }

  if (typeof map.name !== 'string' || map.name.length === 0) {
    throw new MapFormatError('Map name must be a non-empty string');
  }

  if (typeof map.width !== 'number' || map.width <= 0) {
    throw new MapFormatError('Map width must be a positive number');
  }

  if (typeof map.height !== 'number' || map.height <= 0) {
    throw new MapFormatError('Map height must be a positive number');
  }

  if (typeof map.tileSize !== 'number' || map.tileSize <= 0) {
    throw new MapFormatError('Tile size must be a positive number');
  }

  if (!Array.isArray(map.tiles)) {
    throw new MapFormatError('Tiles must be an array');
  }

  if (!Array.isArray(map.entities)) {
    throw new MapFormatError('Entities must be an array');
  }

  return true;
}

/**
 * Serialize a TileMap to array format for JSON
 */
function serializeTiles(tiles: TileMap): Array<[string, string]> {
  return Array.from(tiles.entries());
}

/**
 * Deserialize TileMap from array format
 */
function deserializeTiles(tilesArray: Array<[string, string]>): TileMap {
  const tiles = new Map<string, TileType>();

  for (const [key, tileType] of tilesArray) {
    // Validate tile type
    if (!Object.values(TileType).includes(tileType as TileType)) {
      throw new MapFormatError(`Invalid tile type: ${tileType}`);
    }

    // Validate key format
    const coords = parseTileKey(key);
    if (coords.x < 0 || coords.y < 0) {
      // Allow negative coordinates for now
    }

    tiles.set(key, tileType as TileType);
  }

  return tiles;
}

/**
 * Serialize MapData to JSON format
 */
export function serializeMap(map: MapData): MapJSON {
  return {
    version: map.version,
    name: map.name,
    width: map.width,
    height: map.height,
    tileSize: map.tileSize,
    tiles: serializeTiles(map.tiles),
    entities: map.entities,
    metadata: {
      ...map.metadata,
      modifiedAt: Date.now(),
    },
  };
}

/**
 * Deserialize MapData from JSON format
 */
export function deserializeMap(json: MapJSON): Result<MapData> {
  try {
    validateMapData(json);

    const tiles = deserializeTiles(json.tiles);

    // Validate entities
    if (!Array.isArray(json.entities)) {
      throw new MapFormatError('Entities must be an array');
    }

    const mapData: MapData = {
      version: json.version,
      name: json.name,
      width: json.width,
      height: json.height,
      tileSize: json.tileSize,
      tiles,
      entities: json.entities,
      metadata: json.metadata,
    };

    return { ok: true, value: mapData };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: new MapFormatError(message) };
  }
}

/**
 * Parse map from JSON string
 */
export function parseMapFromJSON(json: string): Result<MapData> {
  try {
    const parsed = JSON.parse(json);
    return deserializeMap(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, error: new MapFormatError(`Invalid JSON: ${error.message}`) };
    }
    return { ok: false, error: error instanceof Error ? error : new MapFormatError(String(error)) };
  }
}

/**
 * Convert map to JSON string
 */
export function mapToJSONString(map: MapData, pretty: boolean = true): Result<string> {
  try {
    const serialized = serializeMap(map);
    const json = pretty ? JSON.stringify(serialized, null, 2) : JSON.stringify(serialized);
    return { ok: true, value: json };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new MapFormatError(String(error)) };
  }
}

/**
 * Load map from file text content
 */
export function loadMapFromText(text: string): Result<MapData> {
  if (!text || text.trim().length === 0) {
    return { ok: false, error: new MapFormatError('File is empty') };
  }

  return parseMapFromJSON(text);
}
