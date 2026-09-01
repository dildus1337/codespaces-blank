/**
 * Main map editor React component.
 * Integrates Canvas rendering with Zustand store.
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapCanvas, DEFAULT_THEME } from '../editors/MapCanvas';
import { useMapStore } from '../state/mapStore';

interface MapEditorProps {
  className?: string;
}

/**
 * MapEditor - Main editor component with Canvas integration
 */
export const MapEditor: React.FC<MapEditorProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapCanvasRef = useRef<MapCanvas | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Store state
  const map = useMapStore((state) => state.map);
  const selectedEntityId = useMapStore((state) => state.selectedEntityId);
  const selectEntity = useMapStore((state) => state.selectEntity);

  // Initialize canvas on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create canvas editor
    mapCanvasRef.current = new MapCanvas(canvasRef.current, map, DEFAULT_THEME);

    // Handle canvas resize
    const handleResize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          canvasRef.current.width = rect.width;
          canvasRef.current.height = rect.height;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      if (mapCanvasRef.current) {
        mapCanvasRef.current.render();
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      mapCanvasRef.current?.destroy();
    };
  }, []);

  // Update map in canvas when it changes
  useEffect(() => {
    if (mapCanvasRef.current) {
      mapCanvasRef.current.setMap(map);
    }
  }, [map]);

  // Handle canvas click for entity selection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mapCanvasRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const worldPos = mapCanvasRef.current.screenToWorld(screenX, screenY);
    const entity = mapCanvasRef.current.getEntityAtPosition(worldPos.x, worldPos.y);

    if (entity) {
      selectEntity(entity.id);
    } else {
      selectEntity(null);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useMapStore.getState().undo();
      }

      // Ctrl+Shift+Z or Ctrl+Y: Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        useMapStore.getState().redo();
      }

      // Delete: Remove selected entity
      if (e.key === 'Delete' && selectedEntityId) {
        e.preventDefault();
        useMapStore.getState().removeEntity(selectedEntityId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEntityId]);

  return (
    <div className={`flex-1 bg-gray-900 cursor-crosshair ${className}`}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full block"
      />
    </div>
  );
};

export default MapEditor;
