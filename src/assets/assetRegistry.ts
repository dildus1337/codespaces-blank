import { MonsterType, ItemType, SpawnType, TileType } from '../entities/types';

/**
 * Registry of official Doom 2D Forever game assets (converted to PNG)
 */

export interface AssetMeta {
  src: string;
  name: string;
  category: 'monsters' | 'items' | 'spawns' | 'textures' | 'editor';
}

export const MONSTER_SPRITES: Record<MonsterType, string> = {
  [MonsterType.DEMON]: '/assets/d2d/icons/MONSTER_DEMON.png',
  [MonsterType.CYBERDEMON]: '/assets/d2d/icons/MONSTER_CYBER.png',
  [MonsterType.BARON]: '/assets/d2d/icons/MONSTER_BARON.png',
  [MonsterType.CACODEMON]: '/assets/d2d/icons/MONSTER_CACO.png',
  [MonsterType.REVENANT]: '/assets/d2d/icons/MONSTER_SKEL.png',
  [MonsterType.MANCUBUS]: '/assets/d2d/icons/MONSTER_MANCUB.png',
  [MonsterType.ARCHVILE]: '/assets/d2d/icons/MONSTER_VILE.png',
};

export const ITEM_SPRITES: Record<ItemType, string> = {
  [ItemType.WEAPON_PISTOL]: '/assets/d2d/icons/ITEM_PISTOL.png',
  [ItemType.WEAPON_SHOTGUN]: '/assets/d2d/icons/ITEM_SHOTGUN.png',
  [ItemType.WEAPON_PLASMA]: '/assets/d2d/icons/ITEM_PLASMA_GUN.png',
  [ItemType.WEAPON_ROCKET]: '/assets/d2d/icons/ITEM_ROCKET_LAUNCHER.png',
  [ItemType.HEALTH_SMALL]: '/assets/d2d/icons/ITEM_HEALTH_SMALL.png',
  [ItemType.HEALTH_LARGE]: '/assets/d2d/icons/ITEM_HEALTH_MEDIKIT.png',
  [ItemType.ARMOR_SMALL]: '/assets/d2d/icons/ITEM_ARMOR_GREEN.png',
  [ItemType.ARMOR_LARGE]: '/assets/d2d/icons/ITEM_ARMOR_BLUE.png',
  [ItemType.AMMO_BULLETS]: '/assets/d2d/icons/ITEM_AMMO_BULLETS.png',
  [ItemType.AMMO_SHELLS]: '/assets/d2d/icons/ITEM_AMMO_SHELLS.png',
  [ItemType.AMMO_ROCKETS]: '/assets/d2d/icons/ITEM_AMMO_ROCKETS.png',
  [ItemType.AMMO_CELLS]: '/assets/d2d/icons/ITEM_AMMO_CELLS.png',
};

export const SPAWN_SPRITES: Record<SpawnType, string> = {
  [SpawnType.PLAYER_1]: '/assets/d2d/icons/SPAWN_PLAYER_1.png',
  [SpawnType.PLAYER_2]: '/assets/d2d/icons/SPAWN_PLAYER_2.png',
  [SpawnType.PLAYER_3]: '/assets/d2d/icons/SPAWN_PLAYER_1.png',
  [SpawnType.PLAYER_4]: '/assets/d2d/icons/SPAWN_PLAYER_2.png',
  [SpawnType.DEATHMATCH]: '/assets/d2d/icons/SPAWN_DEATHMATCH.png',
};

export const TILE_TEXTURES: Record<TileType, string> = {
  [TileType.WALL]: '/assets/d2d/textures/G_STENA2.png',
  [TileType.PLATFORM]: '/assets/d2d/textures/RELS01G.png',
  [TileType.LAVA]: '/assets/d2d/textures/PANEL01.png',
  [TileType.WATER]: '/assets/d2d/textures/KAFEL01.png',
  [TileType.SPIKE]: '/assets/d2d/textures/HTRAP01.png',
  [TileType.TELEPORT]: '/assets/d2d/icons/ITEM_FLAG_BLUE.png',
  [TileType.EMPTY]: '',
};

class AssetManager {
  private cache = new Map<string, HTMLImageElement>();
  private loading = new Map<string, Promise<HTMLImageElement>>();

  public getImage(src: string): HTMLImageElement | null {
    if (!src) return null;
    const cached = this.cache.get(src);
    if (cached) return cached;

    if (!this.loading.has(src)) {
      const promise = new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          this.cache.set(src, img);
          resolve(img);
        };
        img.onerror = (e) => {
          reject(e);
        };
      });
      this.loading.set(src, promise);
    }
    return null;
  }

  public preloadAll(): Promise<void[]> {
    const urls = [
      ...Object.values(MONSTER_SPRITES),
      ...Object.values(ITEM_SPRITES),
      ...Object.values(SPAWN_SPRITES),
      ...Object.values(TILE_TEXTURES).filter(Boolean),
    ];

    return Promise.all(
      urls.map((url) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () => {
            this.cache.set(url, img);
            resolve();
          };
          img.onerror = () => {
            resolve();
          };
        });
      })
    );
  }
}

export const assetManager = new AssetManager();
