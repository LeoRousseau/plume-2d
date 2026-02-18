<p align="center">
  <img src="assets/icon.svg" alt="Plume 2D" width="120" />
</p>

<h1 align="center">Plume 2D</h1>

<p align="center">
  A lightweight, renderer-agnostic 2D engine.
</p>

---

## Features

- **Scene graph** — Node-based hierarchy with parent/child transforms
- **Vector & Matrix math** — Immutable `Vector2` and `Matrix` classes
- **Shapes** — Polyline with stroke, fill, and closed path support
- **View system** — Camera with zoom and pan
- **Renderer-agnostic** — Implement the `IRenderer` interface to plug in Canvas 2D, WebGL, SVG, or any custom backend

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm test` | Run unit tests (Vitest) |
| `npm run cy:open` | Open Cypress |

## Project structure

```
src/
  package/          # Library core
    math/           # Vector2, Matrix
    core/           # Node, Transform, Scene, View
    shapes/         # Shape, Polyline
    rendering/      # IRenderer, Canvas2DRenderer
  InputHandler.ts   # App-level input (zoom, pan, click)
  main.ts           # Demo app
```

## License

MIT
