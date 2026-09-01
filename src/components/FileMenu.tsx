/**
 * File menu and load/save functionality
 */

import React, { useRef } from 'react';
import { useMapStore } from '../state/mapStore';
import { mapToJSONString, loadMapFromText } from '../formats/MapFormat';
import { MapData } from '../entities/types';

export const FileMenu: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { map, loadMap } = useMapStore();

  const handleLoad = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = loadMapFromText(text);

      if (result.ok) {
        loadMap(result.value);
        alert('Map loaded successfully!');
      } else {
        alert(`Failed to load map: ${result.error.message}`);
      }
    };
    reader.readAsText(file);

    // Reset input
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
    a.download = `${map.name || 'map'}.map.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-2">
      <button
        onClick={handleLoad}
        className="px-4 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-sm text-white font-medium"
      >
        Load Map
      </button>

      <button
        onClick={handleSave}
        className="px-4 py-1.5 bg-green-700 hover:bg-green-600 rounded text-sm text-white font-medium"
      >
        Save Map
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.map"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="ml-auto text-gray-400 text-sm">
        <span className="font-mono">{map.name}</span>
        <span className="ml-2 text-xs">({map.width}x{map.height})</span>
      </div>
    </div>
  );
};

export default FileMenu;
