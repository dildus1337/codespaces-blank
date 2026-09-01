import { MapCanvas, DEFAULT_THEME } from '../editors/MapCanvas';
import { createMap, createMonster, MonsterType, TileType } from '../entities/types';

describe('MapCanvas', () => {
  let canvas: HTMLCanvasElement;
  let mapCanvas: MapCanvas;
  let map: ReturnType<typeof createMap>;

  beforeEach(() => {
    // Create a mock canvas
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    // Mock getContext to return a 2D context
    const mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      setLineDash: jest.fn(),
      clearRect: jest.fn(),
      fillText: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
    } as any;

    canvas.getContext = jest.fn(() => mockContext);

    map = createMap('Test Map', 100, 100);
    mapCanvas = new MapCanvas(canvas, map);
  });

  afterEach(() => {
    mapCanvas.destroy();
  });

  describe('Initialization', () => {
    it('should create a MapCanvas instance', () => {
      expect(mapCanvas).toBeDefined();
    });

    it('should initialize with default viewport', () => {
      const viewport = mapCanvas.getViewport();
      expect(viewport.x).toBe(0);
      expect(viewport.y).toBe(0);
      expect(viewport.scale).toBe(1.0);
    });

    it('should store the map', () => {
      expect(mapCanvas.getMap()).toBe(map);
    });
  });

  describe('Map Operations', () => {
    it('should set map', () => {
      const newMap = createMap('New Map', 50, 50);
      mapCanvas.setMap(newMap);
      expect(mapCanvas.getMap()).toBe(newMap);
    });
  });

  describe('Viewport Management', () => {
    it('should set viewport position', () => {
      mapCanvas.setViewport(100, 200, 1.5);
      const viewport = mapCanvas.getViewport();
      expect(viewport.x).toBe(100);
      expect(viewport.y).toBe(200);
      expect(viewport.scale).toBe(1.5);
    });

    it('should clamp zoom level', () => {
      mapCanvas.setViewport(0, 0, 10); // Too high
      expect(mapCanvas.getViewport().scale).toBeLessThanOrEqual(5.0);

      mapCanvas.setViewport(0, 0, 0.01); // Too low
      expect(mapCanvas.getViewport().scale).toBeGreaterThanOrEqual(0.1);
    });

    it('should pan viewport', () => {
      mapCanvas.setViewport(0, 0);
      mapCanvas.pan(50, 100);
      const viewport = mapCanvas.getViewport();
      expect(viewport.x).toBe(50);
      expect(viewport.y).toBe(100);
    });

    it('should zoom viewport', () => {
      mapCanvas.setViewport(0, 0, 1.0);
      mapCanvas.zoom(2); // Zoom in 2x
      expect(mapCanvas.getViewport().scale).toBe(2.0);

      mapCanvas.zoom(0.5); // Zoom out
      expect(mapCanvas.getViewport().scale).toBe(1.0);
    });

    it('should clamp zoom in zoom method', () => {
      mapCanvas.setViewport(0, 0, 1.0);
      mapCanvas.zoom(10); // Way too much
      expect(mapCanvas.getViewport().scale).toBeLessThanOrEqual(5.0);
    });
  });

  describe('Coordinate Conversion', () => {
    it('should convert screen coordinates to world coordinates', () => {
      mapCanvas.setViewport(10, 20, 1.0);
      const world = mapCanvas.screenToWorld(100, 200);
      expect(world.x).toBe(110);
      expect(world.y).toBe(220);
    });

    it('should convert world coordinates to screen coordinates', () => {
      mapCanvas.setViewport(10, 20, 1.0);
      const screen = mapCanvas.worldToScreen(110, 220);
      expect(screen.x).toBe(100);
      expect(screen.y).toBe(200);
    });

    it('should handle zoom in coordinate conversion', () => {
      mapCanvas.setViewport(0, 0, 2.0);
      const world = mapCanvas.screenToWorld(100, 200);
      expect(world.x).toBe(50); // 100 / 2.0
      expect(world.y).toBe(100); // 200 / 2.0
    });

    it('should convert back and forth correctly', () => {
      mapCanvas.setViewport(50, 75, 1.5);
      const original = { x: 500, y: 600 };
      const screen = mapCanvas.worldToScreen(original.x, original.y);
      const back = mapCanvas.screenToWorld(screen.x, screen.y);
      expect(back.x).toBeCloseTo(original.x, 5);
      expect(back.y).toBeCloseTo(original.y, 5);
    });
  });

  describe('Entity Detection', () => {
    it('should find entity at position', () => {
      const monster = createMonster({ x: 100, y: 100 }, MonsterType.DEMON, {
        width: 32,
        height: 32,
      });
      map.entities.push(monster);
      mapCanvas.setMap(map);

      const found = mapCanvas.getEntityAtPosition(110, 110);
      expect(found).toBe(monster);
    });

    it('should return null for empty position', () => {
      const found = mapCanvas.getEntityAtPosition(50, 50);
      expect(found).toBeNull();
    });

    it('should detect entity at boundaries', () => {
      const monster = createMonster({ x: 100, y: 100 }, MonsterType.DEMON, {
        width: 32,
        height: 32,
      });
      map.entities.push(monster);
      mapCanvas.setMap(map);

      expect(mapCanvas.getEntityAtPosition(100, 100)).toBe(monster); // Top-left
      expect(mapCanvas.getEntityAtPosition(131, 131)).toBe(monster); // Inside
      expect(mapCanvas.getEntityAtPosition(131.9, 131.9)).toBe(monster); // Still inside
      expect(mapCanvas.getEntityAtPosition(132, 132)).toBeNull(); // Just outside
    });

    it('should detect topmost entity when overlapping', () => {
      const monster1 = createMonster({ x: 100, y: 100 }, MonsterType.DEMON);
      const monster2 = createMonster({ x: 100, y: 100 }, MonsterType.CYBERDEMON);
      map.entities.push(monster1, monster2);
      mapCanvas.setMap(map);

      const found = mapCanvas.getEntityAtPosition(110, 110);
      expect(found).toBe(monster2); // Last added (top layer)
    });
  });

  describe('Rendering', () => {
    it('should render without errors', () => {
      expect(() => {
        mapCanvas.render();
      }).not.toThrow();
    });

    it('should render with tiles', () => {
      map.tiles.set('0,0', TileType.WALL);
      mapCanvas.setMap(map);
      expect(() => {
        mapCanvas.render();
      }).not.toThrow();
    });

    it('should render with entities', () => {
      const monster = createMonster({ x: 50, y: 50 }, MonsterType.DEMON);
      map.entities.push(monster);
      mapCanvas.setMap(map);
      expect(() => {
        mapCanvas.render();
      }).not.toThrow();
    });

    it('should render at different zoom levels', () => {
      mapCanvas.setViewport(0, 0, 0.5);
      expect(() => {
        mapCanvas.render();
      }).not.toThrow();

      mapCanvas.setViewport(0, 0, 3.0);
      expect(() => {
        mapCanvas.render();
      }).not.toThrow();
    });
  });

  describe('Theme', () => {
    it('should use custom theme', () => {
      const customTheme = {
        ...DEFAULT_THEME,
        backgroundColor: '#ff0000',
      };
      const customCanvas = new MapCanvas(canvas, map, customTheme);
      expect(() => {
        customCanvas.render();
      }).not.toThrow();
      customCanvas.destroy();
    });

    it('should have default tile colors', () => {
      const colors = DEFAULT_THEME.tileColors;
      expect(colors[TileType.WALL]).toBeDefined();
      expect(colors[TileType.PLATFORM]).toBeDefined();
      expect(colors[TileType.LAVA]).toBeDefined();
    });
  });
});
