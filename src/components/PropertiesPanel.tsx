import React, { useState } from 'react';
import { useMapStore } from '../state/mapStore';
import {
  MonsterType,
  ItemType,
  SpawnType,
  Monster,
  Item,
  Spawn,
  Trigger,
} from '../entities/types';

export const PropertiesPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'entity' | 'map'>('entity');
  const {
    map,
    updateEntity,
    removeEntity,
    duplicateEntity,
    copyEntity,
    selectEntity,
    getSelectedEntity,
    gridSize,
    resizeMap,
    updateMapMetadata,
  } = useMapStore();

  const selectedEntity = getSelectedEntity();

  // Map resize state
  const [newWidth, setNewWidth] = useState(map.width);
  const [newHeight, setNewHeight] = useState(map.height);

  return (
    <div className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col h-full select-none text-xs">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-800 bg-gray-950">
        <button
          onClick={() => setActiveTab('entity')}
          className={`flex-1 py-2 text-center font-medium transition ${
            activeTab === 'entity'
              ? 'text-blue-400 border-b-2 border-blue-500 bg-gray-900 font-semibold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Entity {selectedEntity ? '•' : ''}
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-2 text-center font-medium transition ${
            activeTab === 'map'
              ? 'text-blue-400 border-b-2 border-blue-500 bg-gray-900 font-semibold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Map Settings
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'entity' ? (
          selectedEntity ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {selectedEntity.type === 'monster' && '👹'}
                    {selectedEntity.type === 'item' && '🔫'}
                    {selectedEntity.type === 'spawn' && '🚩'}
                    {selectedEntity.type === 'trigger' && '⚡'}
                  </span>
                  <div>
                    <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
                      {selectedEntity.type}
                    </h3>
                    <div className="text-[10px] text-gray-500 font-mono truncate max-w-[150px]">
                      {selectedEntity.id}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => selectEntity(null)}
                  className="text-gray-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-gray-800"
                  title="Deselect"
                >
                  ✕
                </button>
              </div>

              {/* Position */}
              <div>
                <label className="text-gray-400 font-semibold mb-1 block">Position (px)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center bg-gray-950 border border-gray-800 rounded px-2 py-1">
                    <span className="text-gray-500 mr-1 font-mono">X:</span>
                    <input
                      type="number"
                      value={Math.round(selectedEntity.position.x)}
                      onChange={(e) =>
                        updateEntity(selectedEntity.id, {
                          position: { ...selectedEntity.position, x: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="bg-transparent text-white w-full outline-none font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center bg-gray-950 border border-gray-800 rounded px-2 py-1">
                    <span className="text-gray-500 mr-1 font-mono">Y:</span>
                    <input
                      type="number"
                      value={Math.round(selectedEntity.position.y)}
                      onChange={(e) =>
                        updateEntity(selectedEntity.id, {
                          position: { ...selectedEntity.position, y: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="bg-transparent text-white w-full outline-none font-mono text-xs"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    const snapX = Math.round(selectedEntity.position.x / gridSize) * gridSize;
                    const snapY = Math.round(selectedEntity.position.y / gridSize) * gridSize;
                    updateEntity(selectedEntity.id, { position: { x: snapX, y: snapY } });
                  }}
                  className="mt-1.5 w-full py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-[11px] font-medium"
                >
                  🧲 Snap to {gridSize}px Grid
                </button>
              </div>

              {/* Dimensions */}
              <div>
                <label className="text-gray-400 font-semibold mb-1 block">Dimensions (W x H)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center bg-gray-950 border border-gray-800 rounded px-2 py-1">
                    <span className="text-gray-500 mr-1 font-mono">W:</span>
                    <input
                      type="number"
                      value={selectedEntity.width}
                      onChange={(e) =>
                        updateEntity(selectedEntity.id, { width: Math.max(8, parseFloat(e.target.value) || 8) })
                      }
                      className="bg-transparent text-white w-full outline-none font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center bg-gray-950 border border-gray-800 rounded px-2 py-1">
                    <span className="text-gray-500 mr-1 font-mono">H:</span>
                    <input
                      type="number"
                      value={selectedEntity.height}
                      onChange={(e) =>
                        updateEntity(selectedEntity.id, { height: Math.max(8, parseFloat(e.target.value) || 8) })
                      }
                      className="bg-transparent text-white w-full outline-none font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Monster Specific */}
              {selectedEntity.type === 'monster' && (
                <div className="space-y-2.5 bg-gray-950/60 p-2.5 rounded border border-gray-800">
                  <div>
                    <label className="text-gray-400 block font-semibold mb-1">Monster Type</label>
                    <select
                      value={(selectedEntity as Monster).monsterType}
                      onChange={(e) =>
                        updateEntity(selectedEntity.id, { monsterType: e.target.value as MonsterType })
                      }
                      className="w-full bg-gray-900 text-white border border-gray-700 rounded px-2 py-1 outline-none text-xs"
                    >
                      {Object.values(MonsterType).map((mt) => (
                        <option key={mt} value={mt}>
                          {mt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 block font-semibold mb-1">Difficulty Spawn</label>
                    <select
                      value={(selectedEntity as Monster).difficulty || 'normal'}
                      onChange={(e) =>
                        updateEntity(selectedEntity.id, {
                          difficulty: e.target.value as 'easy' | 'normal' | 'hard',
                        })
                      }
                      className="w-full bg-gray-900 text-white border border-gray-700 rounded px-2 py-1 outline-none text-xs"
                    >
                      <option value="easy">Easy (Skill 1-2)</option>
                      <option value="normal">Normal (Skill 3)</option>
                      <option value="hard">Hard (Skill 4-5)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Item Specific */}
              {selectedEntity.type === 'item' && (
                <div className="space-y-2.5 bg-gray-950/60 p-2.5 rounded border border-gray-800">
                  <div>
                    <label className="text-gray-400 block font-semibold mb-1">Item Type</label>
                    <select
                      value={(selectedEntity as Item).itemType}
                      onChange={(e) =>
                        updateEntity(selectedEntity.id, { itemType: e.target.value as ItemType })
                      }
                      className="w-full bg-gray-900 text-white border border-gray-700 rounded px-2 py-1 outline-none text-xs"
                    >
                      {Object.values(ItemType).map((it) => (
                        <option key={it} value={it}>
                          {it}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Spawn Specific */}
              {selectedEntity.type === 'spawn' && (
                <div className="space-y-2.5 bg-gray-950/60 p-2.5 rounded border border-gray-800">
                  <div>
                    <label className="text-gray-400 block font-semibold mb-1">Spawn Type</label>
                    <select
                      value={(selectedEntity as Spawn).spawnType}
                      onChange={(e) =>
                        updateEntity(selectedEntity.id, { spawnType: e.target.value as SpawnType })
                      }
                      className="w-full bg-gray-900 text-white border border-gray-700 rounded px-2 py-1 outline-none text-xs"
                    >
                      {Object.values(SpawnType).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 block font-semibold mb-1">Facing Angle</label>
                    <div className="flex gap-1.5">
                      {[0, 90, 180, 270].map((deg) => (
                        <button
                          key={deg}
                          onClick={() => updateEntity(selectedEntity.id, { rotation: deg })}
                          className={`flex-1 py-1 rounded text-xs font-mono ${
                            (selectedEntity.rotation || 0) === deg
                              ? 'bg-blue-600 text-white font-bold'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Trigger Specific */}
              {selectedEntity.type === 'trigger' && (
                <div className="space-y-2.5 bg-gray-950/60 p-2.5 rounded border border-gray-800">
                  <div>
                    <label className="text-gray-400 block font-semibold mb-1">Action Event</label>
                    <input
                      type="text"
                      value={(selectedEntity as Trigger).action}
                      onChange={(e) =>
                        updateEntity(selectedEntity.id, { action: e.target.value })
                      }
                      className="w-full bg-gray-900 text-white border border-gray-700 rounded px-2 py-1 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block font-semibold mb-1">Target Entity (ID)</label>
                    <select
                      value={(selectedEntity as Trigger).targetId || ''}
                      onChange={(e) =>
                        updateEntity(selectedEntity.id, {
                          targetId: (e.target.value as any) || undefined,
                        })
                      }
                      className="w-full bg-gray-900 text-white border border-gray-700 rounded px-2 py-1 outline-none text-xs font-mono"
                    >
                      <option value="">-- None / Self --</option>
                      {map.entities
                        .filter((e) => e.id !== selectedEntity.id)
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.type.toUpperCase()}: {e.id.slice(0, 16)}...
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => duplicateEntity(selectedEntity.id)}
                    className="py-1.5 px-2 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/50 rounded font-medium transition"
                  >
                    Duplicate (Ctrl+D)
                  </button>
                  <button
                    onClick={() => copyEntity(selectedEntity.id)}
                    className="py-1.5 px-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded font-medium transition"
                  >
                    Copy (Ctrl+C)
                  </button>
                </div>
                <button
                  onClick={() => removeEntity(selectedEntity.id)}
                  className="w-full py-1.5 bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800/60 rounded font-medium transition"
                >
                  Delete Entity (Del)
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 space-y-2">
              <span className="text-3xl block">🖱️</span>
              <p className="font-medium text-gray-400">No entity selected</p>
              <p className="text-[11px]">Click an entity on the canvas with the Select tool to view and edit its properties.</p>
            </div>
          )
        ) : (
          /* MAP SETTINGS TAB */
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 font-semibold mb-1 block">Map Name</label>
              <input
                type="text"
                value={map.name}
                onChange={(e) => updateMapMetadata({ name: e.target.value })}
                className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1.5 text-white outline-none font-medium"
              />
            </div>

            <div>
              <label className="text-gray-400 font-semibold mb-1 block">Author</label>
              <input
                type="text"
                value={map.metadata?.author || ''}
                onChange={(e) => updateMapMetadata({ author: e.target.value })}
                placeholder="Author name"
                className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-gray-400 font-semibold mb-1 block">Description</label>
              <textarea
                value={map.metadata?.description || ''}
                onChange={(e) => updateMapMetadata({ description: e.target.value })}
                placeholder="Map description..."
                rows={2}
                className="w-full bg-gray-950 border border-gray-800 rounded px-2.5 py-1.5 text-white outline-none resize-none"
              />
            </div>

            {/* Resize Map */}
            <div className="bg-gray-950/60 p-3 rounded border border-gray-800 space-y-2">
              <label className="text-gray-300 font-semibold block">Map Size (Tiles)</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500 text-[10px]">Width:</span>
                  <input
                    type="number"
                    value={newWidth}
                    onChange={(e) => setNewWidth(parseInt(e.target.value) || 10)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-gray-500 text-[10px]">Height:</span>
                  <input
                    type="number"
                    value={newHeight}
                    onChange={(e) => setNewHeight(parseInt(e.target.value) || 10)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
              </div>
              <button
                onClick={() => resizeMap(newWidth, newHeight)}
                className="w-full py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded font-medium transition"
              >
                Apply New Size ({newWidth * 32}x{newHeight * 32}px)
              </button>
            </div>

            {/* Statistics */}
            <div className="border-t border-gray-800 pt-3 space-y-1.5 text-[11px] text-gray-400">
              <div className="font-semibold text-gray-300 mb-1">Map Breakdown:</div>
              <div className="flex justify-between">
                <span>Total Entities:</span>
                <span className="text-white font-mono">{map.entities.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Painted Tiles:</span>
                <span className="text-white font-mono">{map.tiles.size}</span>
              </div>
              <div className="flex justify-between">
                <span>Tile Grid Size:</span>
                <span className="text-white font-mono">{map.tileSize}px</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
