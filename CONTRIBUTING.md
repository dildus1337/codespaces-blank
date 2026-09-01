# CONTRIBUTING to Pedit

## Development Setup

```bash
npm install
npm run dev           # Start dev server
npm test              # Run tests
npm run lint          # Check code quality
npm run format        # Auto-format code
```

## Code Style & Standards

### TypeScript
- **Strict mode enabled** — no `any` types without good reason
- **Prefer interfaces over types** (except for unions/primitives)
- **100 line rule** — keep functions focused and short

### Comments & Documentation
- **JSDoc for public APIs** — all exports should have clear documentation
- **Inline comments** — explain "why", not "what"
- **Example usage** in JSDoc for complex functions

### Testing
- **TDD approach** — write test first, then implementation
- **Test names** — describe what should happen, not implementation
- **70%+ coverage** — minimum target per phase
- **E2E critical paths** — user workflows should be tested end-to-end

### Commit Messages
```bash
# Format: type(scope): description
git commit -m "feat(editor): add tile brush tool"
git commit -m "fix(canvas): prevent render lag on zoom"
git commit -m "test(store): add MapStore.undo() tests"
git commit -m "docs(api): update EditorAPI examples"
git commit -m "refactor(entities): improve Entity type hierarchy"

# Types: feat, fix, test, docs, refactor, perf, chore
```

## PR Workflow

1. **Create a branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make changes, write tests**
   - Test passes: `npm test` ✅
   - Linter passes: `npm run lint` ✅
   - TypeScript: `npm run build` ✅

3. **Commit with clear messages**
   ```bash
   git commit -m "feat(scope): brief description"
   ```

4. **Push & open PR**
   ```bash
   git push origin feat/your-feature-name
   ```

## PR Checklist

Before submitting PR, ensure:

- [ ] **Tests pass** — `npm test` runs successfully
- [ ] **Linter passes** — `npm run lint` shows no errors
- [ ] **Build succeeds** — `npm run build` completes
- [ ] **Code formatted** — `npm run format` applied
- [ ] **JSDoc added** — all public functions documented
- [ ] **No console.log()** — remove debug logging
- [ ] **No `any` types** — use proper TypeScript
- [ ] **Git history clean** — squash or rebase if needed

## Project Structure Guidelines

### New Components
Create in `src/components/` with:
- `.tsx` file for component
- `.test.tsx` for tests
- Export from `index.ts` if reusable

### New Utilities
Create in `src/utils/`:
- Focused, single-purpose functions
- Comprehensive JSDoc
- Unit tests

### New Entities/Types
Create in `src/entities/`:
- Immutable data structures
- Factory functions for creation
- Validation on construction

### State Management
Use Zustand in `src/state/`:
- Slices organized by domain
- Descriptive action names
- Tests for all state changes

## Questions?

Open an issue or start a discussion!
