<p align="center">
  <img src="assets/icon.svg" alt="Plume 2D" width="120" />
</p>

<h1 align="center">Plume 2D</h1>

<p align="center">
  A lightweight, renderer-agnostic 2D geometry engine.
</p>

---

## Features

- **Scene graph** -- Node-based hierarchy with parent/child transforms (position, rotation, scale)
- **Shapes** -- Circle, Ellipse, Arc, Rectangle, Polyline, Path (Bezier), Text
- **Uniform shape interface** -- Every shape exposes `containsPoint`, `area`, `perimeter`, `distanceToEdge`, `getBoundingBox`
- **Vector & Matrix math** -- `Vector2`, `Matrix` (affine 2D), `BoundingBox`
- **Geometric operations** -- Line/circle/circle-circle intersections, distance queries, closest-point calculations
- **Hit testing** -- Recursive scene-graph picking with tolerance, fill-aware
- **Snapping** -- Grid, point, edge, center snap targets
- **View system** -- Camera with zoom and pan
- **Renderer-agnostic** -- `IRenderer` interface with Canvas 2D and SVG implementations included
- **Zero dependencies** -- Pure TypeScript, no runtime deps

## Coordinate system

Plume 2D uses a **screen-space** coordinate system:

```
  (0,0) -----> +X
    |
    |
    v
   +Y
```

- **Origin** is at the top-left
- **X** increases to the right
- **Y** increases downward
- **Angles** are in radians, measured counter-clockwise from the positive X axis
- **Units** are scene units (mapped to pixels at zoom = 1)

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (demo) |
| `npm run build` | Type-check and build for production |
| `npm test` | Run unit tests (Vitest) |
| `npm run cy:open` | Open Cypress (e2e) |

## Project structure

```
src/package/            # Library core
  math/                 # Vector2, Matrix, BoundingBox, constants
  core/                 # Node, Transform, Scene
  entity/               # AShape, Circle, Ellipse, Arc, Rectangle,
                        # Polyline, Path, Text, StrokeStyle, FillStyle
  hitTest/              # hitTest(), pick()
  snapping/             # snap()
  geometry/             # distance, intersect
  rendering/            # IRenderer, View
  renderer/             # Canvas2DRenderer, SVGRenderer
  index.ts              # Public API barrel export

demo/                   # Interactive demo app
  main.ts               # Demo entry point
  InputHandler.ts       # Zoom, pan, click handling
  index.html            # UI with sidebar controls
```

## Quick example

```ts
import { Scene, View, Circle, Polyline, Vector2, Canvas2DRenderer, pick } from 'plume-2d'

// Setup
const scene = new Scene()
const view = new View(800, 600)
const renderer = new Canvas2DRenderer(document.querySelector('canvas')!)

// Add shapes
const circle = new Circle(new Vector2(200, 150), 50)
circle.stroke = { color: '#0ff', width: 2 }
circle.fill = { color: 'rgba(0,255,255,0.2)' }
scene.root.addChild(circle)

const poly = new Polyline([
  new Vector2(100, 300),
  new Vector2(300, 250),
  new Vector2(250, 400),
], true)
poly.stroke = { color: '#f0f', width: 2 }
poly.fill = { color: 'rgba(255,0,255,0.1)' }
scene.root.addChild(poly)

// Render
renderer.render(scene, view)

// Hit test
const hit = pick(scene, new Vector2(200, 150))
console.log(hit?.shape) // Circle
```

## License

MIT
