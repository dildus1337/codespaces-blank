/**
 * Properties panel for selected entity
 */

import React from 'react';
import { useMapStore } from '../state/mapStore';
import { Entity } from '../entities/types';

export const PropertiesPanel: React.FC = () => {
  const selectedEntity = useMapStore((state) => state.getSelectedEntity());
  const updateEntity = useMapStore((state) => state.updateEntity);
  const removeEntity = useMapStore((state) => state.removeEntity);

  if (!selectedEntity) {
    return (
      <div className="w-64 bg-gray-800 border-l border-gray-700 p-4 text-gray-400 text-sm">
        <p>No entity selected</p>
        <p className="text-xs mt-2">Click on an entity to view its properties</p>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-white font-bold text-sm mb-2">Entity Properties</h3>
      </div>

      {/* Entity ID */}
      <div className="mb-3">
        <label className="text-gray-400 text-xs font-semibold">ID</label>
        <div className="text-white text-xs font-mono mt-1 bg-gray-900 p-2 rounded break-all">
          {selectedEntity.id}
        </div>
      </div>

      {/* Entity Type */}
      <div className="mb-3">
        <label className="text-gray-400 text-xs font-semibold">Type</label>
        <div className="text-white text-xs mt-1 capitalize">{selectedEntity.type}</div>
      </div>

      {/* Position */}
      <div className="mb-3">
        <label className="text-gray-400 text-xs font-semibold">Position</label>
        <div className="flex gap-2 mt-1">
          <input
            type="number"
            value={Math.round(selectedEntity.position.x)}
            onChange={(e) =>
              updateEntity(selectedEntity.id, {
                position: { ...selectedEntity.position, x: parseFloat(e.target.value) },
              })
            }
            placeholder="X"
            className="flex-1 px-2 py-1 bg-gray-900 text-white text-xs border border-gray-700 rounded"
          />
          <input
            type="number"
            value={Math.round(selectedEntity.position.y)}
            onChange={(e) =>
              updateEntity(selectedEntity.id, {
                position: { ...selectedEntity.position, y: parseFloat(e.target.value) },
              })
            }
            placeholder="Y"
            className="flex-1 px-2 py-1 bg-gray-900 text-white text-xs border border-gray-700 rounded"
          />
        </div>
      </div>

      {/* Dimensions */}
      <div className="mb-3">
        <label className="text-gray-400 text-xs font-semibold">Size</label>
        <div className="flex gap-2 mt-1">
          <input
            type="number"
            value={selectedEntity.width}
            onChange={(e) => updateEntity(selectedEntity.id, { width: parseFloat(e.target.value) })}
            placeholder="W"
            className="flex-1 px-2 py-1 bg-gray-900 text-white text-xs border border-gray-700 rounded"
          />
          <input
            type="number"
            value={selectedEntity.height}
            onChange={(e) =>
              updateEntity(selectedEntity.id, { height: parseFloat(e.target.value) })
            }
            placeholder="H"
            className="flex-1 px-2 py-1 bg-gray-900 text-white text-xs border border-gray-700 rounded"
          />
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={() => removeEntity(selectedEntity.id)}
        className="w-full mt-6 px-3 py-2 bg-red-900 hover:bg-red-800 rounded text-sm text-white"
      >
        Delete Entity
      </button>
    </div>
  );
};

export default PropertiesPanel;
