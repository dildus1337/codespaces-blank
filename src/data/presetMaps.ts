import { MapData, TileType, MonsterType, ItemType, SpawnType, createEntityId, getTileKey } from '../entities/types';

/**
 * Creates preset Doom 2D Forever maps for quick start and demonstration
 */

export function createHangarMap(): MapData {
  const width = 40;
  const height = 24;
  const tileSize = 32;
  const tiles = new Map<string, TileType>();

  // Floor & Ceiling
  for (let x = 0; x < width; x++) {
    tiles.set(getTileKey(x, height - 1), TileType.WALL);
    tiles.set(getTileKey(x, height - 2), TileType.WALL);
    tiles.set(getTileKey(x, 0), TileType.WALL);
  }

  // Left & Right Walls
  for (let y = 0; y < height; y++) {
    tiles.set(getTileKey(0, y), TileType.WALL);
    tiles.set(getTileKey(width - 1, y), TileType.WALL);
  }

  // Toxic Acid Pit in middle floor (x: 14 to 26)
  for (let x = 14; x <= 26; x++) {
    tiles.set(getTileKey(x, height - 2), TileType.LAVA);
  }

  // Platforms
  for (let x = 4; x <= 10; x++) {
    tiles.set(getTileKey(x, 16), TileType.PLATFORM);
  }
  for (let x = 15; x <= 25; x++) {
    tiles.set(getTileKey(x, 13), TileType.PLATFORM);
  }
  for (let x = 30; x <= 36; x++) {
    tiles.set(getTileKey(x, 16), TileType.PLATFORM);
  }
  for (let x = 8; x <= 16; x++) {
    tiles.set(getTileKey(x, 8), TileType.PLATFORM);
  }
  for (let x = 24; x <= 32; x++) {
    tiles.set(getTileKey(x, 8), TileType.PLATFORM);
  }

  // Elevators/Steps
  for (let y = 14; y <= 21; y++) {
    tiles.set(getTileKey(12, y), TileType.WALL);
    tiles.set(getTileKey(28, y), TileType.WALL);
  }

  return {
    version: 1,
    name: 'E1M1 - Hangar Arena',
    width,
    height,
    tileSize,
    tiles,
    entities: [
      {
        id: createEntityId('spawn_p1'),
        type: 'spawn',
        position: { x: 64, y: (height - 3) * tileSize },
        width: 32,
        height: 48,
        spawnType: SpawnType.PLAYER_1,
        rotation: 0,
      },
      {
        id: createEntityId('spawn_p2'),
        type: 'spawn',
        position: { x: (width - 4) * tileSize, y: (height - 3) * tileSize },
        width: 32,
        height: 48,
        spawnType: SpawnType.PLAYER_2,
        rotation: 180,
      },
      {
        id: createEntityId('item_shotgun'),
        type: 'item',
        position: { x: 20 * tileSize, y: 12 * tileSize },
        width: 24,
        height: 24,
        itemType: ItemType.WEAPON_SHOTGUN,
      },
      {
        id: createEntityId('item_armor'),
        type: 'item',
        position: { x: 12 * tileSize, y: 7 * tileSize },
        width: 24,
        height: 24,
        itemType: ItemType.ARMOR_LARGE,
      },
      {
        id: createEntityId('item_health_1'),
        type: 'item',
        position: { x: 7 * tileSize, y: 15 * tileSize },
        width: 16,
        height: 16,
        itemType: ItemType.HEALTH_LARGE,
      },
      {
        id: createEntityId('item_ammo_1'),
        type: 'item',
        position: { x: 33 * tileSize, y: 15 * tileSize },
        width: 16,
        height: 16,
        itemType: ItemType.AMMO_SHELLS,
      },
      {
        id: createEntityId('monster_imp_1'),
        type: 'monster',
        position: { x: 17 * tileSize, y: 12 * tileSize },
        width: 32,
        height: 48,
        monsterType: MonsterType.DEMON,
        difficulty: 'normal',
      },
      {
        id: createEntityId('monster_imp_2'),
        type: 'monster',
        position: { x: 23 * tileSize, y: 12 * tileSize },
        width: 32,
        height: 48,
        monsterType: MonsterType.DEMON,
        difficulty: 'normal',
      },
      {
        id: createEntityId('monster_caco'),
        type: 'monster',
        position: { x: 20 * tileSize, y: 4 * tileSize },
        width: 48,
        height: 48,
        monsterType: MonsterType.CACODEMON,
        difficulty: 'hard',
      },
      {
        id: createEntityId('trigger_exit'),
        type: 'trigger',
        position: { x: 37 * tileSize, y: (height - 4) * tileSize },
        width: 48,
        height: 64,
        action: 'level_exit',
      },
    ],
    metadata: {
      author: 'id Software / Doom 2D Forever Team',
      description: 'Classic E1M1 Hangar tribute arena with toxic pit and vertical platforms',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    },
  };
}

export function createCyberdemonLairMap(): MapData {
  const width = 48;
  const height = 28;
  const tileSize = 32;
  const tiles = new Map<string, TileType>();

  // Outer border
  for (let x = 0; x < width; x++) {
    tiles.set(getTileKey(x, height - 1), TileType.WALL);
    tiles.set(getTileKey(x, height - 2), TileType.WALL);
    tiles.set(getTileKey(x, 0), TileType.WALL);
  }
  for (let y = 0; y < height; y++) {
    tiles.set(getTileKey(0, y), TileType.WALL);
    tiles.set(getTileKey(width - 1, y), TileType.WALL);
  }

  // Lava floor in middle
  for (let x = 8; x <= 40; x++) {
    tiles.set(getTileKey(x, height - 2), TileType.LAVA);
  }

  // Stone pillars & high battle platforms
  for (let x = 12; x <= 18; x++) tiles.set(getTileKey(x, 18), TileType.PLATFORM);
  for (let x = 30; x <= 36; x++) tiles.set(getTileKey(x, 18), TileType.PLATFORM);
  for (let x = 20; x <= 28; x++) tiles.set(getTileKey(x, 12), TileType.PLATFORM);
  for (let x = 4; x <= 10; x++) tiles.set(getTileKey(x, 10), TileType.PLATFORM);
  for (let x = 38; x <= 44; x++) tiles.set(getTileKey(x, 10), TileType.PLATFORM);

  // Teleporters
  tiles.set(getTileKey(2, height - 3), TileType.TELEPORT);
  tiles.set(getTileKey(width - 3, height - 3), TileType.TELEPORT);

  return {
    version: 1,
    name: "Cyberdemon's Lair",
    width,
    height,
    tileSize,
    tiles,
    entities: [
      {
        id: createEntityId('spawn_p1'),
        type: 'spawn',
        position: { x: 5 * tileSize, y: 8 * tileSize },
        width: 32,
        height: 48,
        spawnType: SpawnType.PLAYER_1,
      },
      {
        id: createEntityId('boss_cyberdemon'),
        type: 'monster',
        position: { x: 22 * tileSize, y: 10 * tileSize },
        width: 64,
        height: 80,
        monsterType: MonsterType.CYBERDEMON,
        difficulty: 'hard',
      },
      {
        id: createEntityId('monster_baron_1'),
        type: 'monster',
        position: { x: 14 * tileSize, y: 16 * tileSize },
        width: 40,
        height: 56,
        monsterType: MonsterType.BARON,
        difficulty: 'normal',
      },
      {
        id: createEntityId('monster_baron_2'),
        type: 'monster',
        position: { x: 32 * tileSize, y: 16 * tileSize },
        width: 40,
        height: 56,
        monsterType: MonsterType.BARON,
        difficulty: 'normal',
      },
      {
        id: createEntityId('item_bfg'),
        type: 'item',
        position: { x: 24 * tileSize, y: 10 * tileSize },
        width: 32,
        height: 32,
        itemType: ItemType.WEAPON_PLASMA,
      },
      {
        id: createEntityId('item_rocket'),
        type: 'item',
        position: { x: 41 * tileSize, y: 8 * tileSize },
        width: 32,
        height: 32,
        itemType: ItemType.WEAPON_ROCKET,
      },
      {
        id: createEntityId('item_ammo_cells'),
        type: 'item',
        position: { x: 15 * tileSize, y: 17 * tileSize },
        width: 20,
        height: 20,
        itemType: ItemType.AMMO_CELLS,
      },
      {
        id: createEntityId('item_ammo_rockets'),
        type: 'item',
        position: { x: 33 * tileSize, y: 17 * tileSize },
        width: 20,
        height: 20,
        itemType: ItemType.AMMO_ROCKETS,
      },
      {
        id: createEntityId('item_megasphere'),
        type: 'item',
        position: { x: 24 * tileSize, y: 4 * tileSize },
        width: 28,
        height: 28,
        itemType: ItemType.ARMOR_LARGE,
      },
    ],
    metadata: {
      author: 'Doom 2D Forever Masters',
      description: 'Epic Hell boss arena with deadly Cyberdemon and power weapons',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    },
  };
}

export const PRESET_MAPS = [
  { id: 'hangar', name: 'E1M1 - Hangar Arena', factory: createHangarMap },
  { id: 'cyberdemon', name: "Cyberdemon's Lair", factory: createCyberdemonLairMap },
];
