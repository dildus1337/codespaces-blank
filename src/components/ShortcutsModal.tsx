import React from 'react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'V', desc: 'Select & Move Tool' },
    { key: 'B', desc: 'Tile Pencil Tool' },
    { key: 'R', desc: 'Tile Rectangle Tool' },
    { key: 'G', desc: 'Tile Flood Fill Tool' },
    { key: 'E', desc: 'Tile Eraser Tool' },
    { key: 'P', desc: 'Place Entity Tool' },
    { key: 'S', desc: 'Toggle Grid Snap' },
    { key: 'Ctrl + Z', desc: 'Undo' },
    { key: 'Ctrl + Y / Ctrl+Shift+Z', desc: 'Redo' },
    { key: 'Ctrl + C', desc: 'Copy selected entity' },
    { key: 'Ctrl + V', desc: 'Paste entity' },
    { key: 'Ctrl + D', desc: 'Duplicate selected entity' },
    { key: 'Delete / Backspace', desc: 'Delete selected entity' },
    { key: 'Arrow Keys', desc: 'Nudge selected entity by grid size' },
    { key: 'Right Click + Drag', desc: 'Pan canvas' },
    { key: 'Mouse Wheel', desc: 'Zoom in / out' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700 bg-gray-900/50">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <span>⌨️</span> Keyboard & Mouse Controls
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg font-bold w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-2">
            {shortcuts.map((sc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-1.5 px-2.5 rounded bg-gray-900/40 border border-gray-700/40 text-xs"
              >
                <span className="text-gray-300">{sc.desc}</span>
                <kbd className="px-2 py-0.5 bg-gray-700 text-yellow-400 font-mono font-semibold rounded border border-gray-600 shadow-sm">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-700 bg-gray-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
