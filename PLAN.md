# Pedit - Implementation Plan

## Overview

Building a web-based map editor for Doom 2D Forever in 4 phases, from MVP to full-featured collaborative platform with scripting.

## Phase 1: MVP - Basic Functional Editor (3 weeks)

**Goal**: Single-user editor for drawing maps, placing entities, and saving/loading.

### Week 1: Foundation & Editor Setup
- Project configuration (Vite, TypeScript, testing)
- Canvas component with viewport management
- Basic toolbar and UI components
- Map state store (Zustand) with undo/redo
- Entity types (Monster, Item, Tile)

### Week 2: Entity System & Rendering
- Canvas renderer (tiles, entities, selection)
- Entity selection and manipulation
- Property editor for selected entities
- Grid snapping and alignment tools
- Zoom and pan controls

### Week 3: File Format & Polish
- Map format parser (JSON-based)
- File import/export (load/save)
- Auto-save to localStorage
- Copy/paste entities
- E2E testing and bug fixes

**Deliverable**: Functional editor that can load, edit, and save maps.

---

## Phase 2: Collaborative Editing + PWA (3 weeks)

**Goal**: Multi-user real-time editing with offline support.

### Week 4: Real-time Sync Foundation
- WebRTC peer connections (peerjs or simple-peer)
- Signaling server (Node.js + Socket.io or Firebase)
- Operational Transform or CRDT for conflict resolution
- User sessions and participant management

### Week 5: PWA & Offline Support
- Service Worker for offline access
- IndexedDB for local persistence
- Offline change queue and sync on reconnect
- Manifest.json for installability

### Week 6: Permissions & Features
- Admin-controlled permission zones (optional)
- Region-based view/edit restrictions
- Real-time cursor positions
- User presence indicators
- Activity log

**Deliverable**: Multiple users can edit same map in real-time, with offline support.

---

## Phase 3: Scripting API + Macros (2 weeks)

**Goal**: Automation and extensibility through scripting.

### Week 7: Scripting Foundation
- Public TypeScript API (EditorAPI)
- JavaScript runtime in Web Worker
- Script editor (Monaco or CodeMirror)
- API documentation and examples

### Week 8: Macros & Advanced
- Record/playback system for macros
- Script storage (localStorage/IndexedDB)
- Sandbox restrictions for scripts
- Plugin system foundation

**Deliverable**: Users can write scripts to automate tasks (e.g., replace all monsters).

---

## Phase 4: Extensions & Polish (2 weeks)

**Goal**: Production-ready with optimization and full documentation.

### Week 9: Themes & Customization
- Dark/light mode toggle
- Custom color schemes
- Configurable keyboard shortcuts
- UI layout customization

### Week 10: Final Polish & Docs
- Performance profiling and optimization
- Memory leak fixes
- Comprehensive user guide
- API documentation (TypeDoc)
- Release v1.0

**Deliverable**: Production-ready editor with full documentation.

---

## Architecture Overview

### Core Components

| Component | Purpose | Complexity |
|-----------|---------|-----------|
| `MapCanvas` | HTML5 Canvas rendering engine | High |
| `MapStore` | Zustand state management | Medium |
| `MapFormat` | Parser/serializer for maps | Medium |
| `EntitySystem` | Types & behavior for game objects | Medium |
| `UIComponents` | React UI (toolbar, panels, dialogs) | Low |

### Data Flow

```
User Action (click, drag, key)
    ↓
React Component
    ↓
MapStore (Zustand)
    ↓
MapCanvas Renderer
    ↓
HTML5 Canvas (visual output)
```

### Testing Strategy

- **Unit Tests** (Jest): Entities, formats, state logic
- **Component Tests** (RTL): UI components render and respond
- **E2E Tests**: Critical user workflows (load → edit → save)
- **Target**: 70%+ coverage by end of Phase 1

### Best Practices

1. **TDD** — Write tests before implementation
2. **Modularity** — Loose coupling, high cohesion
3. **Documentation** — JSDoc + inline comments
4. **Error Handling** — Graceful degradation
5. **Performance** — Profile and optimize critical paths
6. **Code Review** — PR reviews before merge

---

## Critical Decisions

- **Canvas vs WebGL**: Canvas for Phase 1 (simpler), WebGL fallback in Phase 4 if needed
- **State Management**: Zustand for simplicity and performance
- **File Format**: JSON initially, with versioning for migration support
- **Sync Algorithm**: CRDT (Yjs) for Phase 2 (handles offline + conflicts well)
- **Scripting**: JavaScript (Web Worker sandbox) for accessibility

---

## Known Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Canvas performance with large maps | Viewport culling, layer optimization |
| WebRTC connectivity issues | Fallback to polling, clear error messages |
| State conflicts in real-time sync | Use CRDT algorithm, comprehensive tests |
| Script sandbox escape | Use Web Worker + CSP, audit API surface |

---

## Timeline

- **Start Date**: 2026-09-01
- **Phase 1 End**: ~2026-09-21 (3 weeks)
- **Phase 2 End**: ~2026-10-12 (3 weeks)
- **Phase 3 End**: ~2026-10-26 (2 weeks)
- **Phase 4 End**: ~2026-11-09 (2 weeks)
- **v1.0 Release**: 2026-11-09

---

## Resources & Links

- [Doom 2D GitHub](https://github.com/Doom2D/Doom2D.org)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
