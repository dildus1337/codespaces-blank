/**
 * Canvas-based map editor implementation for Doom 2D Forever.
 * Uses official Doom 2D Forever sprites, textures, and assets.
 */

import {
  MapData,
  Entity,
  TileType,
  Position,
  getTileKey,
  Monster,
  Item,
  Spawn,
  Trigger,
} from '../entities/types';
import {
  assetManager,
  MONSTER_SPRITES,
  ITEM_SPRITES,
  SPAWN_SPRITES,
  TILE_TEXTURES,
} from '../assets/assetRegistry';

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface RenderTheme {
  tileSize: number;
  gridColor: string;
  gridSubColor: string;
  tileColors: Record<TileType, string>;
  entityColor: string;
  selectedColor: string;
  hoverColor: string;
  backgroundColor: string;
}

export const DEFAULT_THEME: RenderTheme = {
  tileSize: 32,
  gridColor: 'rgba(255, 255, 255, 0.15)',
  gridSubColor: 'rgba(255, 255, 255, 0.05)',
  tileColors: {
    EMPTY: 'transparent',
    WALL: '#5a5a64',
    PLATFORM: '#3b82f6',
    LAVA: '#ef4444',
    WATER: '#06b6d4',
    SPIKE: '#eab308',
    TELEPORT: '#a855f7',
  },
  entityColor: '#22c55e',
  selectedColor: '#fbbf24',
  hoverColor: '#38bdf8',
  backgroundColor: '#121214',
};

export interface EditorPreviewState {
  tool: 'select' | 'tile_pencil' | 'tile_rect' | 'tile_eraser' | 'tile_fill' | 'entity_place';
  tileType: TileType;
  brushSize: number;
  rectStart: Position | null;
  rectCurrent: Position | null;
  selectedEntityId: string | null;
  showGrid: boolean;
  showTiles: boolean;
  showEntities: boolean;
  gridSize: number;
  entityTemplate: Partial<Entity> | null;
}

export class MapCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private map: MapData;
  private viewport: Viewport;
  private theme: RenderTheme;
  private hoveredEntityId: string | null = null;
  private mousePos: Position = { x: 0, y: 0 };
  private previewState: EditorPreviewState = {
    tool: 'select',
    tileType: TileType.WALL,
    brushSize: 1,
    rectStart: null,
    rectCurrent: null,
    selectedEntityId: null,
    showGrid: true,
    showTiles: true,
    showEntities: true,
    gridSize: 32,
    entityTemplate: null,
  };

  private boundMouseMove: (e: MouseEvent) => void;
  private boundWheel: (e: WheelEvent) => void;
  private boundMouseDown: (e: MouseEvent) => void;

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

    // Ensure crisp pixel art
    this.ctx.imageSmoothingEnabled = false;

    this.boundMouseMove = (e: MouseEvent) => this.onMouseMove(e);
    this.boundWheel = (e: WheelEvent) => this.onWheel(e);
    this.boundMouseDown = (e: MouseEvent) => this.onMouseDown(e);

    this.setupEventListeners();
    assetManager.preloadAll();
  }

  public setMap(map: MapData) {
    this.map = map;
  }

  public getMap(): MapData {
    return this.map;
  }

  public setPreviewState(preview: Partial<EditorPreviewState>) {
    this.previewState = { ...this.previewState, ...preview };
  }

  public setViewport(x: number, y: number, scale: number = this.viewport.scale) {
    this.viewport.x = x;
    this.viewport.y = y;
    this.viewport.scale = Math.max(0.1, Math.min(5.0, scale));
  }

  public getViewport(): Viewport {
    return { ...this.viewport };
  }

  public pan(dx: number, dy: number) {
    this.viewport.x += dx;
    this.viewport.y += dy;
  }

  public zoom(factor: number, mousePos?: Position) {
    const oldScale = this.viewport.scale;
    const newScale = oldScale * factor;
    const clampedScale = Math.max(0.1, Math.min(5.0, newScale));

    if (mousePos && oldScale !== clampedScale) {
      const worldX = mousePos.x / oldScale + this.viewport.x;
      const worldY = mousePos.y / oldScale + this.viewport.y;

      this.viewport.x = worldX - mousePos.x / clampedScale;
      this.viewport.y = worldY - mousePos.y / clampedScale;
    }

    this.viewport.scale = clampedScale;
  }

  public screenToWorld(screenX: number, screenY: number): Position {
    return {
      x: screenX / this.viewport.scale + this.viewport.x,
      y: screenY / this.viewport.scale + this.viewport.y,
    };
  }

  public worldToScreen(worldX: number, worldY: number): Position {
    return {
      x: (worldX - this.viewport.x) * this.viewport.scale,
      y: (worldY - this.viewport.y) * this.viewport.scale,
    };
  }

  public getEntityAtPosition(worldX: number, worldY: number): Entity | null {
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

  public render() {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.fillStyle = this.theme.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const mapTopLeft = this.worldToScreen(0, 0);
    const mapWidth = this.map.width * this.theme.tileSize * this.viewport.scale;
    const mapHeight = this.map.height * this.theme.tileSize * this.viewport.scale;

    this.ctx.fillStyle = '#18181c';
    this.ctx.fillRect(mapTopLeft.x, mapTopLeft.y, mapWidth, mapHeight);

    this.ctx.strokeStyle = '#3f3f46';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(mapTopLeft.x, mapTopLeft.y, mapWidth, mapHeight);

    if (this.previewState.showTiles) {
      this.renderTiles();
    }

    if (this.previewState.showEntities) {
      this.renderTriggerLines();
      this.renderEntities();
    }

    this.renderSelection();
    this.renderPreviews();

    if (this.previewState.showGrid) {
      this.renderGrid();
    }
  }

  private renderTiles() {
    const tileSize = this.theme.tileSize * this.viewport.scale;
    const startX = Math.max(0, Math.floor(this.viewport.x / this.theme.tileSize));
    const startY = Math.max(0, Math.floor(this.viewport.y / this.theme.tileSize));
    const endX = Math.min(
      this.map.width,
      Math.ceil((this.viewport.x + this.canvas.width / this.viewport.scale) / this.theme.tileSize)
    );
    const endY = Math.min(
      this.map.height,
      Math.ceil((this.viewport.y + this.canvas.height / this.viewport.scale) / this.theme.tileSize)
    );

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const key = getTileKey(x, y);
        const tileType = this.map.tiles.get(key);

        if (tileType && tileType !== TileType.EMPTY) {
          const screenPos = this.worldToScreen(x * this.theme.tileSize, y * this.theme.tileSize);
          this.drawTile(tileType, screenPos.x, screenPos.y, tileSize);
        }
      }
    }
  }

  private drawTile(type: TileType, x: number, y: number, size: number) {
    const texUrl = TILE_TEXTURES[type];
    const texImg = texUrl ? assetManager.getImage(texUrl) : null;

    if (texImg) {
      this.ctx.drawImage(texImg, x, y, size, size);
      if (type === TileType.PLATFORM) {
        this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, size, size);
      }
      return;
    }

    // Fallback stylized graphics
    const baseColor = this.theme.tileColors[type] || '#555';
    this.ctx.fillStyle = baseColor;
    this.ctx.fillRect(x, y, size, size);

    if (type === TileType.WALL) {
      this.ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
    } else if (type === TileType.PLATFORM) {
      this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
      this.ctx.fillRect(x, y, size, Math.max(2, size * 0.15));
    } else if (type === TileType.LAVA) {
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.fillRect(x + size * 0.1, y + size * 0.2, size * 0.3, size * 0.3);
    } else if (type === TileType.WATER) {
      this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
      this.ctx.fillRect(x, y + size * 0.2, size, Math.max(1, size * 0.1));
    } else if (type === TileType.SPIKE) {
      this.ctx.fillStyle = '#dc2626';
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + size);
      this.ctx.lineTo(x + size / 2, y);
      this.ctx.lineTo(x + size, y + size);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }

  private renderTriggerLines() {
    this.ctx.save();
    if (this.ctx.setLineDash) this.ctx.setLineDash([4, 4]);
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeStyle = '#f59e0b';

    for (const entity of this.map.entities) {
      if (entity.type === 'trigger' && (entity as Trigger).targetId) {
        const target = this.map.entities.find((e) => e.id === (entity as Trigger).targetId);
        if (target) {
          const from = this.worldToScreen(
            entity.position.x + entity.width / 2,
            entity.position.y + entity.height / 2
          );
          const to = this.worldToScreen(
            target.position.x + target.width / 2,
            target.position.y + target.height / 2
          );

          this.ctx.beginPath();
          this.ctx.moveTo(from.x, from.y);
          this.ctx.lineTo(to.x, to.y);
          this.ctx.stroke();
        }
      }
    }
    this.ctx.restore();
  }

  private renderEntities() {
    for (const entity of this.map.entities) {
      const screenPos = this.worldToScreen(entity.position.x, entity.position.y);
      const screenWidth = entity.width * this.viewport.scale;
      const screenHeight = entity.height * this.viewport.scale;

      const isSelected = this.previewState.selectedEntityId === entity.id;
      const isHovered = this.hoveredEntityId === entity.id;

      let spriteUrl: string | null = null;
      let label: string = entity.type;

      if (entity.type === 'monster') {
        const m = entity as Monster;
        spriteUrl = MONSTER_SPRITES[m.monsterType];
        label = m.monsterType;
      } else if (entity.type === 'item') {
        const it = entity as Item;
        spriteUrl = ITEM_SPRITES[it.itemType];
        label = it.itemType;
      } else if (entity.type === 'spawn') {
        const sp = entity as Spawn;
        spriteUrl = SPAWN_SPRITES[sp.spawnType];
        label = sp.spawnType;
      } else if (entity.type === 'trigger') {
        const tr = entity as Trigger;
        label = tr.action;
      }

      const img = spriteUrl ? assetManager.getImage(spriteUrl) : null;

      if (img) {
        // Draw real Doom 2D Forever sprite!
        this.ctx.drawImage(img, screenPos.x, screenPos.y, screenWidth, screenHeight);

        if (isHovered || isSelected) {
          this.ctx.strokeStyle = isSelected ? '#fbbf24' : this.theme.hoverColor;
          this.ctx.lineWidth = isSelected ? 2 : 1;
          this.ctx.strokeRect(screenPos.x, screenPos.y, screenWidth, screenHeight);
        }
      } else {
        // Fallback badge
        let bgColor = '#334155';
        let borderColor = '#64748b';

        if (entity.type === 'monster') {
          bgColor = '#7f1d1d';
          borderColor = '#ef4444';
        } else if (entity.type === 'item') {
          bgColor = '#1e3a8a';
          borderColor = '#3b82f6';
        } else if (entity.type === 'spawn') {
          bgColor = '#14532d';
          borderColor = '#22c55e';
        } else if (entity.type === 'trigger') {
          bgColor = 'rgba(180, 83, 9, 0.4)';
          borderColor = '#f59e0b';
        }

        if (isHovered && !isSelected) {
          borderColor = this.theme.hoverColor;
        }

        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(screenPos.x, screenPos.y, screenWidth, screenHeight);

        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = isSelected ? 2 : 1;
        this.ctx.strokeRect(screenPos.x, screenPos.y, screenWidth, screenHeight);
      }

      // Short label tag
      if (screenWidth >= 32 && this.viewport.scale >= 0.75) {
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = '9px monospace';
        this.ctx.textAlign = 'center';
        const shortLabel = label.replace(/^(WEAPON_|AMMO_|HEALTH_|ARMOR_|PLAYER_)/, '');
        this.ctx.fillText(shortLabel.slice(0, 12), screenPos.x + screenWidth / 2, screenPos.y + screenHeight + 9);
      }
    }
  }

  private renderSelection() {
    if (!this.previewState.selectedEntityId) return;
    const entity = this.map.entities.find((e) => e.id === this.previewState.selectedEntityId);
    if (!entity) return;

    const screenPos = this.worldToScreen(entity.position.x, entity.position.y);
    const screenWidth = entity.width * this.viewport.scale;
    const screenHeight = entity.height * this.viewport.scale;

    this.ctx.strokeStyle = '#facc15';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(screenPos.x - 2, screenPos.y - 2, screenWidth + 4, screenHeight + 4);

    const handleSize = 6;
    this.ctx.fillStyle = '#fbbf24';
    const corners = [
      { x: screenPos.x - 2 - handleSize / 2, y: screenPos.y - 2 - handleSize / 2 },
      { x: screenPos.x + screenWidth + 2 - handleSize / 2, y: screenPos.y - 2 - handleSize / 2 },
      { x: screenPos.x - 2 - handleSize / 2, y: screenPos.y + screenHeight + 2 - handleSize / 2 },
      { x: screenPos.x + screenWidth + 2 - handleSize / 2, y: screenPos.y + screenHeight + 2 - handleSize / 2 },
    ];
    for (const c of corners) {
      this.ctx.fillRect(c.x, c.y, handleSize, handleSize);
    }
  }

  private renderPreviews() {
    const { tool, brushSize, rectStart, rectCurrent, entityTemplate } = this.previewState;

    if (tool === 'tile_pencil' || tool === 'tile_eraser') {
      const worldPos = this.screenToWorld(this.mousePos.x, this.mousePos.y);
      const tileX = Math.floor(worldPos.x / this.theme.tileSize);
      const tileY = Math.floor(worldPos.y / this.theme.tileSize);

      const offset = Math.floor((brushSize - 1) / 2);
      const startX = tileX - offset;
      const startY = tileY - offset;

      for (let dy = 0; dy < brushSize; dy++) {
        for (let dx = 0; dx < brushSize; dx++) {
          const curX = startX + dx;
          const curY = startY + dy;
          if (curX >= 0 && curX < this.map.width && curY >= 0 && curY < this.map.height) {
            const screenPos = this.worldToScreen(curX * this.theme.tileSize, curY * this.theme.tileSize);
            const size = this.theme.tileSize * this.viewport.scale;

            if (tool === 'tile_pencil') {
              this.ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
              this.ctx.fillRect(screenPos.x, screenPos.y, size, size);
              this.ctx.strokeStyle = '#3b82f6';
              this.ctx.lineWidth = 1;
              this.ctx.strokeRect(screenPos.x, screenPos.y, size, size);
            } else {
              this.ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
              this.ctx.fillRect(screenPos.x, screenPos.y, size, size);
              this.ctx.strokeStyle = '#ef4444';
              this.ctx.lineWidth = 1;
              this.ctx.strokeRect(screenPos.x, screenPos.y, size, size);
            }
          }
        }
      }
    } else if (tool === 'tile_rect' && rectStart && rectCurrent) {
      const minTileX = Math.max(0, Math.min(rectStart.x, rectCurrent.x));
      const maxTileX = Math.min(this.map.width - 1, Math.max(rectStart.x, rectCurrent.x));
      const minTileY = Math.max(0, Math.min(rectStart.y, rectCurrent.y));
      const maxTileY = Math.min(this.map.height - 1, Math.max(rectStart.y, rectCurrent.y));

      const screenTopLeft = this.worldToScreen(
        minTileX * this.theme.tileSize,
        minTileY * this.theme.tileSize
      );
      const width = (maxTileX - minTileX + 1) * this.theme.tileSize * this.viewport.scale;
      const height = (maxTileY - minTileY + 1) * this.theme.tileSize * this.viewport.scale;

      this.ctx.fillStyle = 'rgba(59, 130, 246, 0.35)';
      this.ctx.fillRect(screenTopLeft.x, screenTopLeft.y, width, height);
      this.ctx.strokeStyle = '#60a5fa';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(screenTopLeft.x, screenTopLeft.y, width, height);
    } else if (tool === 'entity_place' && entityTemplate) {
      const worldPos = this.screenToWorld(this.mousePos.x, this.mousePos.y);
      const w = entityTemplate.width || 32;
      const h = entityTemplate.height || 32;
      const screenPos = this.worldToScreen(worldPos.x - w / 2, worldPos.y - h / 2);
      const sw = w * this.viewport.scale;
      const sh = h * this.viewport.scale;

      this.ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
      this.ctx.fillRect(screenPos.x, screenPos.y, sw, sh);
      this.ctx.strokeStyle = '#22c55e';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(screenPos.x, screenPos.y, sw, sh);
    }
  }

  private renderGrid() {
    const gridSize = this.previewState.gridSize || this.theme.tileSize;
    const startX = Math.max(0, Math.floor(this.viewport.x / gridSize));
    const startY = Math.max(0, Math.floor(this.viewport.y / gridSize));
    const endX = Math.min(
      this.map.width * (this.theme.tileSize / gridSize),
      Math.ceil((this.viewport.x + this.canvas.width / this.viewport.scale) / gridSize)
    );
    const endY = Math.min(
      this.map.height * (this.theme.tileSize / gridSize),
      Math.ceil((this.viewport.y + this.canvas.height / this.viewport.scale) / gridSize)
    );

    this.ctx.strokeStyle = this.theme.gridColor;
    this.ctx.lineWidth = 0.5;

    for (let x = startX; x <= endX; x++) {
      const screenX = this.worldToScreen(x * gridSize, 0).x;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, Math.max(0, this.worldToScreen(0, 0).y));
      this.ctx.lineTo(
        screenX,
        Math.min(this.canvas.height, this.worldToScreen(0, this.map.height * this.theme.tileSize).y)
      );
      this.ctx.stroke();
    }

    for (let y = startY; y <= endY; y++) {
      const screenY = this.worldToScreen(0, y * gridSize).y;
      this.ctx.beginPath();
      this.ctx.moveTo(Math.max(0, this.worldToScreen(0, 0).x), screenY);
      this.ctx.lineTo(
        Math.min(this.canvas.width, this.worldToScreen(this.map.width * this.theme.tileSize, 0).x),
        screenY
      );
      this.ctx.stroke();
    }
  }

  private setupEventListeners() {
    this.canvas.addEventListener('mousemove', this.boundMouseMove);
    this.canvas.addEventListener('wheel', this.boundWheel, { passive: false });
    this.canvas.addEventListener('mousedown', this.boundMouseDown);
  }

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

  private onMouseDown(e: MouseEvent) {
    if (e.button === 2 || (e.button === 0 && e.altKey)) {
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

  public destroy() {
    this.canvas.removeEventListener('mousemove', this.boundMouseMove);
    this.canvas.removeEventListener('wheel', this.boundWheel);
    this.canvas.removeEventListener('mousedown', this.boundMouseDown);
  }
}
