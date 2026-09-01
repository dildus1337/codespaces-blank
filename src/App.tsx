import { useState } from 'react';
import {
  FileMenu,
  Toolbar,
  EntityPalette,
  MapEditor,
  PropertiesPanel,
  StatusBar,
} from './components';

export default function App() {
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 text-white overflow-hidden select-none font-sans">
      {/* Top File Menu */}
      <FileMenu />

      {/* Main Editing Toolbar */}
      <Toolbar />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Entity & Tile Palette */}
        <EntityPalette />

        {/* Center Interactive Map Canvas */}
        <MapEditor onZoomChange={setZoomLevel} />

        {/* Right Entity & Map Properties Panel */}
        <PropertiesPanel />
      </div>

      {/* Bottom Status Bar */}
      <StatusBar zoomLevel={zoomLevel} />
    </div>
  );
}
