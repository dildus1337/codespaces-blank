import { MapEditor, Toolbar, PropertiesPanel, FileMenu } from './components';

/**
 * Main application component
 * Integrates editor, toolbar, file menu, and properties panel
 */
export default function App() {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* File operations */}
      <FileMenu />

      {/* Main toolbar */}
      <Toolbar />

      {/* Editor workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas editor */}
        <MapEditor />

        {/* Properties panel */}
        <PropertiesPanel />
      </div>
    </div>
  );
}
