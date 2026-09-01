/**
 * Canvas-based map editor implementation.
 * Handles rendering (tiles, entities, layers) and viewport management.
 * Decoupled from React - can be used standalone or with any UI framework.
 */

import { MapData, Entity, TileType, Position, getTileKey } from '../entities/types';

/**
 * Viewport configuration (camera position and zoom)
 */
export interface Viewport {
  x: number;
  y: number;
  scale: number; // zoom level (1.0 = 100%)
}

/**
 * Layer rendering order
 */
enum RenderLayer {
  TILES = 0,
  ENTITIES = 1,
  SELECTION = 2,
  GRID = 3,
}

/**
 * Color theme for rendering
 */
export interface RenderTheme {
  tileSize: number;
  gridColor: string;
  tileColors: Record<TileType, string>;
  entityColor: string;
  selectedColor: string;
  hoverColor: string;
  backgroundColor: string;
}

/**
 * Default render theme
 */
export const DEFAULT_THEME: RenderTheme = {
  tileSize: 32,
  gridColor: '#333333',
  tileColors: {
    EMPTY: '#1a1a1a',
    WALL: '#444444',
    PLATFORM: '#666666',
    LAVA: '#ff4500',
    WATER: '#0066ff',
    SPIKE: '#ff0000',
    TELEPORT: '#ff00ff',
  },
  entityColor: '#00ff00',
  selectedColor: '#ffff00',
  hoverColor: '#ffaa00',
  backgroundColor: '#000000',
};

/**
 * Canvas editor - non-React rendering engine
 */
export class MapCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private map: MapData;
  private viewport: Viewport;
  private theme: RenderTheme;
  private hoveredEntityId: string | null = null;
  private mousePos: Position = { x: 0, y: 0 };

  constructor(
    canvas: HTMLCanvasElement,
    map: MapData,
    theme: RenderTheme = DEFAULT_THEME
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;
    this.map = map;
    this.theme = theme;

    this.viewport = {
      x: 0,
      y: 0,
      scale: 1.0,
    };

    this.setupEventListeners();
  }

  /**
   * Update map data
   */
  public setMap(map: MapData) {
    this.map = map;
  }

  /**
   * Get current map
   */
  public getMap(): MapData {
    return this.map;
  }

  /**
   * Set viewport position
   */
  public setViewport(x: number, y: number, scale: number = this.viewport.scale) {
    this.viewport.x = x;
    this.viewport.y = y;
    this.viewport.scale = Math.max(0.1, Math.min(5.0, scale)); // Clamp zoom
  }

  /**
   * Get viewport
   */
  public getViewport(): Viewport {
    return { ...this.viewport };
  }

  /**
   * Pan viewport
   */
  public pan(dx: number, dy: number) {
    this.viewport.x += dx;
    this.viewport.y += dy;
  }

  /**
   * Zoom viewport (at mouse position if provided)
   */
  public zoom(factor: number, mousePos?: Position) {
    const oldScale = this.viewport.scale;
    const newScale = oldScale * factor;
    const clampedScale = Math.max(0.1, Math.min(5.0, newScale));

    if (mousePos && oldScale !== clampedScale) {
      // Zoom towards mouse position
      const worldX = (mousePos.x / this.canvas.width) * this.canvas.width + this.viewport.x;
      const worldY = (mousePos.y / this.canvas.height) * this.canvas.height + this.viewport.y;

      this.viewport.x = worldX - (mousePos.x / this.canvas.width) * this.canvas.width;
      this.viewport.y = worldY - (mousePos.y / this.canvas.height) * this.canvas.height;
    }

    this.viewport.scale = clampedScale;
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  public screenToWorld(screenX: number, screenY: number): Position {
    return {
      x: screenX / this.viewport.scale + this.viewport.x,
      y: screenY / this.viewport.scale + this.viewport.y,
    };
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  public worldToScreen(worldX: number, worldY: number): Position {
    return {
      x: (worldX - this.viewport.x) * this.viewport.scale,
      y: (worldY - this.viewport.y) * this.viewport.scale,
    };
  }

  /**
   * Get entity at world position
   */
  public getEntityAtPosition(worldX: number, worldY: number): Entity | null {
    // Check in reverse order (top layer first)
    for (let i = this.map.entities.length - 1; i >= 0; i--) {
      const entity = this.map.entities[i];
      if (
        worldX >= entity.position.x &&
        worldX < entity.position.x + entity.width &&
        worldY >= entity.position.y &&
        worldY < entity.position.y + entity.height
      ) {
        return entity;
      }
    }
    return null;
  }

  /**
   * Main render method - draws all layers
   */
  public render() {
    // Clear canvas
    this.ctx.fillStyle = this.theme.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render layers in order
    this.renderTiles();
    this.renderEntities();
    this.renderSelection();
    this.renderGrid();
  }

  /**
   * Render tile layer
   */
  private renderTiles() {
    const tileSize = this.theme.tileSize * this.viewport.scale;
    const startX = Math.floor(this.viewport.x / this.theme.tileSize);
    const startY = Math.floor(this.viewport.y / this.theme.tileSize);
    const endX = Math.ceil(
      (this.viewport.x + this.canvas.width / this.viewport.scale) / this.theme.tileSize
    );
    const endY = Math.ceil(
      (this.viewport.y + this.canvas.height / this.viewport.scale) / this.theme.tileSize
    );

    // Render filled tiles
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const key = getTileKey(x, y);
        const tileType = this.map.tiles.get(key);

        if (tileType) {
          const screenPos = this.worldToScreen(x * this.theme.tileSize, y * this.theme.tileSize);
          this.ctx.fillStyle = this.theme.tileColors[tileType];
          this.ctx.fillRect(screenPos.x, screenPos.y, tileSize, tileSize);
        }
      }
    }
  }

  /**
   * Render entity layer
   */
  private renderEntities() {
    for (const entity of this.map.entities) {
      const screenPos = this.worldToScreen(entity.position.x, entity.position.y);
      const screenWidth = entity.width * this.viewport.scale;
      const screenHeight = entity.height * this.viewport.scale;

      // Determine color
      let color = this.theme.entityColor;
      if (this.hoveredEntityId === entity.id) {
        color = this.theme.hoverColor;
      }

      // Draw entity rectangle
      this.ctx.fillStyle = color;
      this.ctx.fillRect(screenPos.x, screenPos.y, screenWidth, screenHeight);

      // Draw border
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(screenPos.x, screenPos.y, screenWidth, screenHeight);

      // Draw entity type indicator
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '10px monospace';
      this.ctx.fillText(entity.type.toUpperCase()[0], screenPos.x + 2, screenPos.y + 10);
    }
  }

  /**
   * Render selection overlay
   */
  private renderSelection() {
    // Selection can be implemented by tracking selected entity from store
    // For now, this is a placeholder
  }

  /**
   * Render grid
   */
  private renderGrid() {
    const tileSize = this.theme.tileSize * this.viewport.scale;
    const startX = Math.floor(this.viewport.x / this.theme.tileSize);
    const startY = Math.floor(this.viewport.y / this.theme.tileSize);
    const endX = Math.ceil(
      (this.viewport.x + this.canvas.width / this.viewport.scale) / this.theme.tileSize
    );
    const endY = Math.ceil(
      (this.viewport.y + this.canvas.height / this.viewport.scale) / this.theme.tileSize
    );

    this.ctx.strokeStyle = this.theme.gridColor;
    this.ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = startX; x <= endX; x++) {
      const screenX = this.worldToScreen(x * this.theme.tileSize, 0).x;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, 0);
      this.ctx.lineTo(screenX, this.canvas.height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y++) {
      const screenY = this.worldToScreen(0, y * this.theme.tileSize).y;
      this.ctx.beginPath();
      this.ctx.moveTo(0, screenY);
      this.ctx.lineTo(this.canvas.width, screenY);
      this.ctx.stroke();
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
  }

  /**
   * Mouse move handler - update hover state
   */
  private onMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const worldPos = this.screenToWorld(this.mousePos.x, this.mousePos.y);
    const entity = this.getEntityAtPosition(worldPos.x, worldPos.y);
    this.hoveredEntityId = entity?.id ?? null;
  }

  /**
   * Wheel handler - zoom
   */
  private onWheel(e: WheelEvent) {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const rect = this.canvas.getBoundingClientRect();
    const mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    this.zoom(factor, mousePos);
  }

  /**
   * Mouse down handler - pan or select
   */
  private onMouseDown(e: MouseEvent) {
    if (e.button === 2) {
      // Right click - pan (handled by dragging)
      let lastX = e.clientX;
      let lastY = e.clientY;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const dx = (moveEvent.clientX - lastX) / this.viewport.scale;
        const dy = (moveEvent.clientY - lastY) / this.viewport.scale;
        this.pan(-dx, -dy);
        lastX = moveEvent.clientX;
        lastY = moveEvent.clientY;
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  }

  /**
   * Cleanup event listeners
   */
  public destroy() {
    // Event listeners will be garbage collected with canvas
  }
}
