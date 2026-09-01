# Pedit - Web-based Map Editor for Doom 2D Forever

A modern, collaborative web-based map editor for **Doom 2D Forever**. Built with React, TypeScript, and cutting-edge web technologies.

## 🎯 Goals

✅ **MVP Editor** (Phase 1) — Core editing + file I/O  
🔄 **Collaborative** (Phase 2) — Real-time sync + WebRTC + PWA  
⚙️ **Scripting** (Phase 3) — JavaScript API + Macros  
✨ **Polish** (Phase 4) — Themes + Performance  

## 🚀 Quick Start

```bash
npm install
npm run dev           # Start dev server (http://localhost:3000)
npm test             # Run tests
npm run build        # Production build
```

## 📁 Project Structure

```
src/
├── components/       # React UI components
├── editors/         # Canvas editor implementation
├── entities/        # Map object types (Monster, Item, Tile, etc.)
├── formats/         # File format parsers/serializers
├── hooks/           # Custom React hooks
├── state/           # Zustand store & state management
├── api/             # Public API (Phase 3)
├── utils/           # Helper functions
└── __tests__/       # Unit & integration tests
```

## 🛠️ Tech Stack

- **React 18** + **TypeScript** — Modern UI with type safety
- **Vite** — Fast build & dev server
- **Zustand** — Simple state management
- **Canvas API** — Rendering & visualization
- **Jest + RTL** — Testing framework
- **Tailwind CSS** — Styling

## 📅 Development Phases

| Phase | Duration | Focus |
|-------|----------|-------|
| **1** | 3 weeks | MVP: editing, entities, file I/O |
| **2** | 3 weeks | Collab: WebRTC, PWA, offline sync |
| **3** | 2 weeks | Scripting: JS API, macros |
| **4** | 2 weeks | Polish: themes, optimization |

## 🔧 Development Commands

```bash
# Code quality
npm run lint          # Check lint issues
npm run lint:fix      # Auto-fix lint issues
npm format            # Format code with Prettier

# Testing
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📜 License

MIT

---

**Status**: 🔨 In Development (Phase 1)  
**Last Updated**: 2026-09-01
