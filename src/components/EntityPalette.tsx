import React, { useState } from 'react';
import { useMapStore } from '../state/mapStore';
import {
  TileType,
  MonsterType,
  ItemType,
  SpawnType,
  Entity,
} from '../entities/types';

type PaletteTab = 'tiles' | 'monsters' | 'items' | 'spawns' | 'triggers';

export const EntityPalette: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PaletteTab>('tiles');
  const {
    activeTool,
    selectedTileType,
    setActiveTool,
    setSelectedTileType,
    setSelectedEntityTemplate,
    selectedEntityTemplate,
  } = useMapStore();

  const handleTileSelect = (type: TileType) => {
    setSelectedTileType(type);
    if (activeTool !== 'tile_pencil' && activeTool !== 'tile_rect' && activeTool !== 'tile_fill') {
      setActiveTool('tile_pencil');
    }
  };

  const handleEntitySelect = (template: Partial<Entity>) => {
    setSelectedEntityTemplate(template);
    setActiveTool('entity_place');
  };

  const tilesList: Array<{ type: TileType; label: string; color: string; desc: string }> = [
    { type: TileType.WALL, label: 'Solid Wall', color: '#5a5a64', desc: 'Blocks movement and bullets' },
    { type: TileType.PLATFORM, label: 'Platform', color: '#3b82f6', desc: 'Can jump through from below' },
    { type: TileType.LAVA, label: 'Lava / Slime', color: '#ef4444', desc: 'Deadly hazard on contact' },
    { type: TileType.WATER, label: 'Water', color: '#06b6d4', desc: 'Liquid physics' },
    { type: TileType.SPIKE, label: 'Spikes', color: '#eab308', desc: 'Instant damage hazard' },
    { type: TileType.TELEPORT, label: 'Teleport Pad', color: '#a855f7', desc: 'Teleportation zone' },
    { type: TileType.EMPTY, label: 'Empty (Erase)', color: '#1f2937', desc: 'Clear tile to empty void' },
  ];

  const monstersList: Array<{ type: MonsterType; label: string; icon: string; w: number; h: number; diff: 'easy' | 'normal' | 'hard' }> = [
    { type: MonsterType.DEMON, label: 'Demon (Pinky)', icon: '👹', w: 32, h: 32, diff: 'normal' },
    { type: MonsterType.CACODEMON, label: 'Cacodemon', icon: '👁️', w: 48, h: 48, diff: 'normal' },
    { type: MonsterType.BARON, label: 'Baron of Hell', icon: '🐐', w: 40, h: 56, diff: 'hard' },
    { type: MonsterType.CYBERDEMON, label: 'Cyberdemon (Boss)', icon: '🤖', w: 64, h: 80, diff: 'hard' },
    { type: MonsterType.REVENANT, label: 'Revenant', icon: '💀', w: 36, h: 56, diff: 'hard' },
    { type: MonsterType.MANCUBUS, label: 'Mancubus', icon: '🐘', w: 56, h: 64, diff: 'hard' },
    { type: MonsterType.ARCHVILE, label: 'Arch-Vile', icon: '🔥', w: 36, h: 56, diff: 'hard' },
  ];

  const itemsList: Array<{ type: ItemType; label: string; icon: string; category: string }> = [
    { type: ItemType.WEAPON_SHOTGUN, label: 'Shotgun', icon: '💥', category: 'Weapons' },
    { type: ItemType.WEAPON_ROCKET, label: 'Rocket Launcher', icon: '🚀', category: 'Weapons' },
    { type: ItemType.WEAPON_PLASMA, label: 'Plasma Rifle', icon: '⚡', category: 'Weapons' },
    { type: ItemType.WEAPON_PISTOL, label: 'Pistol', icon: '🔫', category: 'Weapons' },
    { type: ItemType.HEALTH_SMALL, label: 'Small Health (+10)', icon: '🧪', category: 'Pickups' },
    { type: ItemType.HEALTH_LARGE, label: 'Medikit (+25)', icon: '🩹', category: 'Pickups' },
    { type: ItemType.ARMOR_SMALL, label: 'Green Armor (+100)', icon: '🛡️', category: 'Pickups' },
    { type: ItemType.ARMOR_LARGE, label: 'MegaArmor (+200)', icon: '💎', category: 'Pickups' },
    { type: ItemType.AMMO_SHELLS, label: 'Shotgun Shells', icon: '📦', category: 'Ammo' },
    { type: ItemType.AMMO_ROCKETS, label: 'Rockets Box', icon: '📦', category: 'Ammo' },
    { type: ItemType.AMMO_CELLS, label: 'Plasma Cells', icon: '🔋', category: 'Ammo' },
    { type: ItemType.AMMO_BULLETS, label: 'Bullets Clip', icon: '📦', category: 'Ammo' },
  ];

  const spawnsList: Array<{ type: SpawnType; label: string; icon: string; color: string }> = [
    { type: SpawnType.PLAYER_1, label: 'Player 1 Start', icon: '1️⃣', color: '#22c55e' },
    { type: SpawnType.PLAYER_2, label: 'Player 2 Start', icon: '2️⃣', color: '#3b82f6' },
    { type: SpawnType.PLAYER_3, label: 'Player 3 Start', icon: '3️⃣', color: '#eab308' },
    { type: SpawnType.PLAYER_4, label: 'Player 4 Start', icon: '4️⃣', color: '#ef4444' },
    { type: SpawnType.DEATHMATCH, label: 'Deathmatch Spawn', icon: '⚔️', color: '#a855f7' },
  ];

  const triggersList: Array<{ action: string; label: string; icon: string; desc: string }> = [
    { action: 'open_door', label: 'Door Open Switch', icon: '🚪', desc: 'Opens targeted door entity' },
    { action: 'level_exit', label: 'Level Exit', icon: '🏁', desc: 'Ends level and triggers victory' },
    { action: 'teleport', label: 'Teleport Trigger', icon: '🌀', desc: 'Warps player to destination' },
    { action: 'secret_zone', label: 'Secret Room', icon: '⭐', desc: 'Triggers secret credit discovery' },
    { action: 'damage_field', label: 'Damage Zone', icon: '☣️', desc: 'Inflicts environmental damage' },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full select-none text-xs">
      {/* Palette Tab Headers */}
      <div className="flex border-b border-gray-800 bg-gray-950">
        {(
          [
            { id: 'tiles', label: 'Tiles', icon: '🧱' },
            { id: 'monsters', label: 'Monsters', icon: '👹' },
            { id: 'items', label: 'Items', icon: '🔫' },
            { id: 'spawns', label: 'Spawns', icon: '🚩' },
            { id: 'triggers', label: 'Triggers', icon: '⚡' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-[11px] font-medium flex flex-col items-center gap-0.5 transition ${
              activeTab === tab.id
                ? 'text-blue-400 bg-gray-900 border-b-2 border-blue-500 font-semibold'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Palette Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* TILES TAB */}
        {activeTab === 'tiles' && (
          <div className="space-y-1.5">
            <div className="text-gray-400 font-semibold mb-2">Select Tile to Draw:</div>
            {tilesList.map((t) => {
              const isSelected = selectedTileType === t.type && activeTool.startsWith('tile_');
              return (
                <button
                  key={t.type}
                  onClick={() => handleTileSelect(t.type)}
                  className={`w-full flex items-center gap-2.5 p-2 rounded border transition text-left ${
                    isSelected
                      ? 'bg-blue-950/60 border-blue-500 text-white shadow-sm'
                      : 'bg-gray-800/60 border-gray-700/60 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded border border-gray-600 shadow-inner flex-shrink-0"
                    style={{ backgroundColor: t.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs truncate">{t.label}</div>
                    <div className="text-[10px] text-gray-400 truncate">{t.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* MONSTERS TAB */}
        {activeTab === 'monsters' && (
          <div className="space-y-1.5">
            <div className="text-gray-400 font-semibold mb-2">Place Monster:</div>
            {monstersList.map((m) => {
              const isSelected =
                activeTool === 'entity_place' &&
                selectedEntityTemplate?.type === 'monster' &&
                (selectedEntityTemplate as any).monsterType === m.type;

              return (
                <button
                  key={m.type}
                  onClick={() =>
                    handleEntitySelect({
                      type: 'monster',
                      monsterType: m.type,
                      width: m.w,
                      height: m.h,
                      difficulty: m.diff,
                    } as any)
                  }
                  className={`w-full flex items-center gap-2.5 p-2 rounded border transition text-left ${
                    isSelected
                      ? 'bg-red-950/70 border-red-500 text-white shadow-sm'
                      : 'bg-gray-800/60 border-gray-700/60 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs truncate">{m.label}</div>
                    <div className="text-[10px] text-gray-400">
                      {m.w}x{m.h}px • <span className="capitalize">{m.diff}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ITEMS TAB */}
        {activeTab === 'items' && (
          <div className="space-y-1.5">
            <div className="text-gray-400 font-semibold mb-2">Place Item / Weapon:</div>
            {itemsList.map((it) => {
              const isSelected =
                activeTool === 'entity_place' &&
                selectedEntityTemplate?.type === 'item' &&
                (selectedEntityTemplate as any).itemType === it.type;

              return (
                <button
                  key={it.type}
                  onClick={() =>
                    handleEntitySelect({
                      type: 'item',
                      itemType: it.type,
                      width: 24,
                      height: 24,
                    } as any)
                  }
                  className={`w-full flex items-center gap-2.5 p-2 rounded border transition text-left ${
                    isSelected
                      ? 'bg-blue-950/70 border-blue-500 text-white shadow-sm'
                      : 'bg-gray-800/60 border-gray-700/60 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{it.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs truncate">{it.label}</div>
                    <div className="text-[10px] text-gray-400">{it.category}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* SPAWNS TAB */}
        {activeTab === 'spawns' && (
          <div className="space-y-1.5">
            <div className="text-gray-400 font-semibold mb-2">Place Spawn Point:</div>
            {spawnsList.map((sp) => {
              const isSelected =
                activeTool === 'entity_place' &&
                selectedEntityTemplate?.type === 'spawn' &&
                (selectedEntityTemplate as any).spawnType === sp.type;

              return (
                <button
                  key={sp.type}
                  onClick={() =>
                    handleEntitySelect({
                      type: 'spawn',
                      spawnType: sp.type,
                      width: 32,
                      height: 48,
                    } as any)
                  }
                  className={`w-full flex items-center gap-2.5 p-2 rounded border transition text-left ${
                    isSelected
                      ? 'bg-green-950/70 border-green-500 text-white shadow-sm'
                      : 'bg-gray-800/60 border-gray-700/60 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{sp.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs truncate">{sp.label}</div>
                    <div className="text-[10px] text-gray-400">32x48px</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* TRIGGERS TAB */}
        {activeTab === 'triggers' && (
          <div className="space-y-1.5">
            <div className="text-gray-400 font-semibold mb-2">Place Trigger / Zone:</div>
            {triggersList.map((tr) => {
              const isSelected =
                activeTool === 'entity_place' &&
                selectedEntityTemplate?.type === 'trigger' &&
                (selectedEntityTemplate as any).action === tr.action;

              return (
                <button
                  key={tr.action}
                  onClick={() =>
                    handleEntitySelect({
                      type: 'trigger',
                      action: tr.action,
                      width: 64,
                      height: 64,
                    } as any)
                  }
                  className={`w-full flex items-center gap-2.5 p-2 rounded border transition text-left ${
                    isSelected
                      ? 'bg-amber-950/70 border-amber-500 text-white shadow-sm'
                      : 'bg-gray-800/60 border-gray-700/60 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{tr.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs truncate">{tr.label}</div>
                    <div className="text-[10px] text-gray-400 truncate">{tr.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityPalette;
