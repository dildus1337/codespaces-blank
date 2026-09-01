/**
 * Core type definitions for map entities and data structures.
 * All entities are immutable - use factory functions to create modifications.
 */

/**
 * Unique identifier for map entities
 */
export type EntityId = string & { readonly __brand: 'EntityId' };

/**
 * Creates a branded EntityId from a string
 */
export function createEntityId(id: string): EntityId {
  return id as EntityId;
}

/**
 * Generate a new unique entity ID
 */
export function generateEntityId(): EntityId {
  return createEntityId(`entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
}

/**
 * Tile types available in the map
 */
export enum TileType {
  EMPTY = 'EMPTY',
  WALL = 'WALL',
  PLATFORM = 'PLATFORM',
  LAVA = 'LAVA',
  WATER = 'WATER',
  SPIKE = 'SPIKE',
  TELEPORT = 'TELEPORT',
}

/**
 * Monster types that can spawn in the map
 */
export enum MonsterType {
  DEMON = 'DEMON',
  CYBERDEMON = 'CYBERDEMON',
  BARON = 'BARON',
  CACODEMON = 'CACODEMON',
  REVENANT = 'REVENANT',
  MANCUBUS = 'MANCUBUS',
  ARCHVILE = 'ARCHVILE',
}

/**
 * Item types that can be placed in the map
 */
export enum ItemType {
  HEALTH_SMALL = 'HEALTH_SMALL',
  HEALTH_LARGE = 'HEALTH_LARGE',
  ARMOR_SMALL = 'ARMOR_SMALL',
  ARMOR_LARGE = 'ARMOR_LARGE',
  AMMO_BULLETS = 'AMMO_BULLETS',
  AMMO_SHELLS = 'AMMO_SHELLS',
  AMMO_ROCKETS = 'AMMO_ROCKETS',
  AMMO_CELLS = 'AMMO_CELLS',
  WEAPON_PISTOL = 'WEAPON_PISTOL',
  WEAPON_SHOTGUN = 'WEAPON_SHOTGUN',
  WEAPON_PLASMA = 'WEAPON_PLASMA',
  WEAPON_ROCKET = 'WEAPON_ROCKET',
}

/**
 * Spawn point type for player start positions
 */
export enum SpawnType {
  PLAYER_1 = 'PLAYER_1',
  PLAYER_2 = 'PLAYER_2',
  PLAYER_3 = 'PLAYER_3',
  PLAYER_4 = 'PLAYER_4',
  DEATHMATCH = 'DEATHMATCH',
}

/**
 * Base position interface
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Base entity interface for all objects on the map
 */
export interface BaseEntity {
  id: EntityId;
  position: Position;
  width: number;
  height: number;
  rotation?: number;
}

/**
 * Monster entity - enemy spawn point
 */
export interface Monster extends BaseEntity {
  type: 'monster';
  monsterType: MonsterType;
  difficulty?: 'easy' | 'normal' | 'hard';
}

/**
 * Item entity - collectible or weapon
 */
export interface Item extends BaseEntity {
  type: 'item';
  itemType: ItemType;
}

/**
 * Spawn entity - player starting position
 */
export interface Spawn extends BaseEntity {
  type: 'spawn';
  spawnType: SpawnType;
}

/**
 * Trigger entity - activates actions when touched
 */
export interface Trigger extends BaseEntity {
  type: 'trigger';
  action: string; // e.g., 'open_door', 'activate_platform'
  targetId?: EntityId; // Reference to what this trigger affects
}

/**
 * Union type of all entities
 */
export type Entity = Monster | Item | Spawn | Trigger;

/**
 * Tile map - 2D grid of tile types
 */
export type TileMap = Map<string, TileType>; // key format: "x,y"

/**
 * Map data structure containing all content
 */
export interface MapData {
  version: number;
  name: string;
  width: number;
  height: number;
  tileSize: number; // pixels per tile
  tiles: TileMap;
  entities: Entity[];
  metadata?: {
    author?: string;
    description?: string;
    createdAt?: number;
    modifiedAt?: number;
  };
}

/**
 * Create initial empty map
 */
export function createMap(
  name: string,
  width: number,
  height: number,
  tileSize: number = 32
): MapData {
  return {
    version: 1,
    name,
    width,
    height,
    tileSize,
    tiles: new Map(),
    entities: [],
    metadata: {
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    },
  };
}

/**
 * Factory function to create a monster entity
 */
export function createMonster(
  position: Position,
  monsterType: MonsterType,
  options?: { width?: number; height?: number; rotation?: number; difficulty?: 'easy' | 'normal' | 'hard' }
): Monster {
  return {
    id: generateEntityId(),
    type: 'monster',
    position,
    monsterType,
    width: options?.width ?? 32,
    height: options?.height ?? 32,
    rotation: options?.rotation,
    difficulty: options?.difficulty,
  };
}

/**
 * Factory function to create an item entity
 */
export function createItem(
  position: Position,
  itemType: ItemType,
  options?: { width?: number; height?: number; rotation?: number }
): Item {
  return {
    id: generateEntityId(),
    type: 'item',
    position,
    itemType,
    width: options?.width ?? 16,
    height: options?.height ?? 16,
    rotation: options?.rotation,
  };
}

/**
 * Factory function to create a spawn point
 */
export function createSpawn(
  position: Position,
  spawnType: SpawnType,
  options?: { rotation?: number }
): Spawn {
  return {
    id: generateEntityId(),
    type: 'spawn',
    position,
    spawnType,
    width: 32,
    height: 32,
    rotation: options?.rotation ?? 0,
  };
}

/**
 * Factory function to create a trigger
 */
export function createTrigger(
  position: Position,
  action: string,
  options?: { width?: number; height?: number; targetId?: EntityId }
): Trigger {
  return {
    id: generateEntityId(),
    type: 'trigger',
    position,
    action,
    width: options?.width ?? 64,
    height: options?.height ?? 64,
    targetId: options?.targetId,
  };
}

/**
 * Get tile key for map coordinates
 */
export function getTileKey(x: number, y: number): string {
  return `${Math.floor(x)},${Math.floor(y)}`;
}

/**
 * Parse tile key back to coordinates
 */
export function parseTileKey(key: string): Position {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

/**
 * Check if a position is within map bounds
 */
export function isWithinBounds(pos: Position, map: MapData): boolean {
  return pos.x >= 0 && pos.x < map.width && pos.y >= 0 && pos.y < map.height;
}

/**
 * Check if entity is within map bounds
 */
export function isEntityWithinBounds(entity: Entity, map: MapData): boolean {
  return isWithinBounds(entity.position, map);
}
