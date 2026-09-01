import React, { useRef, useState, useEffect } from 'react';
import { useMapStore } from '../state/mapStore';
import { mapToJSONString, loadMapFromText } from '../formats/MapFormat';
import { createMap } from '../entities/types';
import { PRESET_MAPS } from '../data/presetMaps';

const AUTOSAVE_STORAGE_KEY = 'pedit_autosave_map';

export const FileMenu: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { map, loadMap } = useMapStore();
  const [isNewMapModalOpen, setIsNewMapModalOpen] = useState(false);
  const [newMapName, setNewMapName] = useState('New Map');
  const [newMapWidth, setNewMapWidth] = useState(48);
  const [newMapHeight, setNewMapHeight] = useState(28);
  const [saveStatus, setSaveStatus] = useState<string>('Ready');

  // Auto-save to localStorage whenever map changes
  useEffect(() => {
    try {
      const res = mapToJSONString(map, false);
      if (res.ok) {
        localStorage.setItem(AUTOSAVE_STORAGE_KEY, res.value);
        setSaveStatus('Auto-saved');
        const timer = setTimeout(() => setSaveStatus('Ready'), 2000);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage might fail in incognito or quota limits
    }
  }, [map]);

  // Try auto-loading from localStorage on initial mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
      if (saved) {
        const res = loadMapFromText(saved);
        if (res.ok && res.value) {
          loadMap(res.value);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = loadMapFromText(text);

      if (result.ok) {
        loadMap(result.value);
        setSaveStatus('Loaded file');
      } else {
        alert(`Failed to load map: ${result.error.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = () => {
    const result = mapToJSONString(map, true);

    if (!result.ok) {
      alert(`Failed to save map: ${result.error.message}`);
      return;
    }

    const blob = new Blob([result.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${map.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'map'}.dfm.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSaveStatus('Downloaded');
  };

  const handleCreateNewMap = () => {
    const freshMap = createMap(newMapName || 'Untitled Map', newMapWidth, newMapHeight);
    loadMap(freshMap);
    setIsNewMapModalOpen(false);
  };

  return (
    <>
      <div className="bg-gray-950 border-b border-gray-800 px-4 py-2 flex items-center justify-between text-xs select-none">
        {/* Brand & File Operations */}
        <div className="flex items-center gap-3">
          {/* Logo / Title */}
          <div className="flex items-center gap-2 pr-3 border-r border-gray-800">
            <span className="text-xl">🔥</span>
            <div>
              <span className="font-extrabold text-red-500 tracking-wider text-sm">PEDIT</span>
              <span className="text-[10px] text-gray-400 ml-1.5 font-semibold">DOOM 2D FOREVER</span>
            </div>
          </div>

          {/* New Map */}
          <button
            onClick={() => setIsNewMapModalOpen(true)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded font-medium transition flex items-center gap-1.5"
          >
            <span>📄</span> New Map
          </button>

          {/* Load Map */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-blue-800/80 hover:bg-blue-700 text-white rounded font-medium transition flex items-center gap-1.5"
          >
            <span>📂</span> Load File
          </button>

          {/* Save Map */}
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded font-medium transition flex items-center gap-1.5 shadow-sm"
          >
            <span>💾</span> Save Map
          </button>

          {/* Preset Maps Selector */}
          <div className="flex items-center gap-1.5 bg-gray-900 px-2 py-1 rounded border border-gray-800">
            <span className="text-gray-400 text-[11px]">Presets:</span>
            <select
              onChange={(e) => {
                const preset = PRESET_MAPS.find((p) => p.id === e.target.value);
                if (preset) {
                  loadMap(preset.factory());
                  setSaveStatus(`Loaded ${preset.name}`);
                }
              }}
              defaultValue=""
              className="bg-transparent text-gray-200 text-xs outline-none cursor-pointer"
            >
              <option value="" disabled className="bg-gray-900">
                -- Select Demo Map --
              </option>
              {PRESET_MAPS.map((p) => (
                <option key={p.id} value={p.id} className="bg-gray-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.map,.dfm"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Current Map Info & Save Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-900/60 border border-gray-800 text-[11px] text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>{saveStatus}</span>
          </div>

          <div className="text-gray-300 font-medium">
            <span className="font-semibold text-white">{map.name}</span>
            <span className="text-gray-500 ml-1.5 font-mono">
              ({map.width}x{map.height} tiles • {map.width * 32}x{map.height * 32}px)
            </span>
          </div>
        </div>
      </div>

      {/* New Map Modal */}
      {isNewMapModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800 flex justify-between items-center bg-gray-950">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>📄</span> Create New Doom 2D Forever Map
              </h3>
              <button
                onClick={() => setIsNewMapModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-gray-400 font-semibold mb-1 block">Map Name</label>
                <input
                  type="text"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-1.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 font-semibold mb-1 block">Dimensions (Tiles)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 text-[11px]">Width:</span>
                    <input
                      type="number"
                      value={newMapWidth}
                      onChange={(e) => setNewMapWidth(parseInt(e.target.value) || 10)}
                      className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px]">Height:</span>
                    <input
                      type="number"
                      value={newMapHeight}
                      onChange={(e) => setNewMapHeight(parseInt(e.target.value) || 10)}
                      className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div>
                <label className="text-gray-400 font-semibold mb-1.5 block">Size Presets</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => {
                      setNewMapWidth(32);
                      setNewMapHeight(20);
                    }}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-center border border-gray-700"
                  >
                    <div className="font-semibold text-white">Small Arena</div>
                    <div className="text-[10px] text-gray-400">32x20 tiles</div>
                  </button>
                  <button
                    onClick={() => {
                      setNewMapWidth(48);
                      setNewMapHeight(28);
                    }}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-center border border-gray-700"
                  >
                    <div className="font-semibold text-white">Standard</div>
                    <div className="text-[10px] text-gray-400">48x28 tiles</div>
                  </button>
                  <button
                    onClick={() => {
                      setNewMapWidth(80);
                      setNewMapHeight(40);
                    }}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-center border border-gray-700"
                  >
                    <div className="font-semibold text-white">Large Map</div>
                    <div className="text-[10px] text-gray-400">80x40 tiles</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-800 bg-gray-950 flex justify-end gap-2">
              <button
                onClick={() => setIsNewMapModalOpen(false)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewMap}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow-sm"
              >
                Create Map
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileMenu;
