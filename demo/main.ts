import {
  Vector2, Scene, View, Polyline, Circle, Rectangle, Ellipse, Arc, Path, Text,
  Canvas2DRenderer, SVGRenderer, BoundingBox, hitTest,
  intersectLineLine, intersectLineCircle, intersectCircleCircle,
  distancePointToPolyline, distancePointToCircle, closestPointOnPolyline,
  snap,
} from '@plume/index'
import type { AShape, HitTestResult } from '@plume/index'
import { InputHandler } from './InputHandler'

// --- Setup ---
const canvasEl = document.querySelector<HTMLCanvasElement>('#plume-canvas')!
canvasEl.width = 900
canvasEl.height = 650

const renderer = new Canvas2DRenderer(canvasEl)
const scene = new Scene()
const view = new View(900, 650)
const info = document.querySelector<HTMLDivElement>('#info')!

const input = new InputHandler(canvasEl, view, render)

// Overlay layer for debug visuals (bboxes, centroids, intersections...)
let overlays: (() => void)[] = []

// --- State ---
let drawMode: 'polyline' | null = null
let currentPoints: Vector2[] = []
let snapEnabled = false
let hitTestEnabled = false
let snapVisualEnabled = false

// Live state for mouse-move overlays
let hitTestOverlay: (() => void) | null = null
let snapOverlay: (() => void) | null = null

// --- Helpers ---
function addShape(s: AShape) {
  scene.root.addChild(s)
  render()
}

function randomX() { return 150 + Math.random() * 600 }
function randomY() { return 100 + Math.random() * 450 }
function randomColor() {
  const colors = ['#e94560', '#0ff', '#0f0', '#ff0', '#f0f', '#fa0', '#58f', '#fff']
  return colors[Math.floor(Math.random() * colors.length)]
}

function showInfo(text: string) { info.textContent = text }

// --- Render ---
function render() {
  renderer.render(scene, view)

  // Draw overlays on top
  const ctx = canvasEl.getContext('2d')!
  ctx.save()
  const offsetX = canvasEl.width / 2 - view.center.x * view.zoom
  const offsetY = canvasEl.height / 2 - view.center.y * view.zoom
  ctx.translate(offsetX, offsetY)
  ctx.scale(view.zoom, view.zoom)
  for (const fn of overlays) fn()
  if (hitTestOverlay) hitTestOverlay()
  if (snapOverlay) snapOverlay()
  ctx.restore()
}

function getCtx() { return canvasEl.getContext('2d')! }

// --- Mouse move: HitTest + Snap visual feedback ---
input.onMouseMove = (scenePos) => {
  hitTestOverlay = null
  snapOverlay = null

  if (hitTestEnabled) {
    const result = hitTest(scene.root, scenePos, 4 / view.zoom)
    if (result) {
      const bb = result.shape.getBoundingBox()
      const shapeName = result.shape.constructor.name
      hitTestOverlay = () => {
        const ctx = getCtx()
        // Highlight bounding box
        ctx.strokeStyle = '#0f0'
        ctx.lineWidth = 2 / view.zoom
        ctx.setLineDash([6 / view.zoom, 3 / view.zoom])
        ctx.strokeRect(bb.min.x, bb.min.y, bb.width, bb.height)
        ctx.setLineDash([])

        // Crosshair at hit point
        const hp = result.point
        const s = 8 / view.zoom
        ctx.strokeStyle = '#0f0'
        ctx.lineWidth = 1 / view.zoom
        ctx.beginPath()
        ctx.moveTo(hp.x - s, hp.y); ctx.lineTo(hp.x + s, hp.y)
        ctx.moveTo(hp.x, hp.y - s); ctx.lineTo(hp.x, hp.y + s)
        ctx.stroke()

        // Label
        ctx.fillStyle = '#0f0'
        ctx.font = `${11 / view.zoom}px monospace`
        ctx.fillText(
          `${shapeName} (${hp.x.toFixed(0)}, ${hp.y.toFixed(0)})`,
          bb.min.x,
          bb.min.y - 5 / view.zoom,
        )
      }
      showInfo(`HitTest: ${shapeName} at (${result.point.x.toFixed(1)}, ${result.point.y.toFixed(1)})`)
    } else {
      showInfo('HitTest: no shape under cursor')
    }
  }

  if (snapVisualEnabled || (snapEnabled && drawMode === 'polyline')) {
    const shapes = scene.root.children.filter((c): c is AShape =>
      c instanceof Polyline || c instanceof Circle || c instanceof Rectangle || c instanceof Ellipse
    )
    const result = snap(scenePos, shapes, { gridSize: 20, tolerance: 15 / view.zoom })
    if (result) {
      const sp = result.point
      const type = result.type
      snapOverlay = () => {
        const ctx = getCtx()
        const r = 6 / view.zoom

        // Snap marker
        if (type === 'grid') {
          // Diamond for grid
          ctx.strokeStyle = '#fa0'
          ctx.lineWidth = 1.5 / view.zoom
          ctx.beginPath()
          ctx.moveTo(sp.x, sp.y - r)
          ctx.lineTo(sp.x + r, sp.y)
          ctx.lineTo(sp.x, sp.y + r)
          ctx.lineTo(sp.x - r, sp.y)
          ctx.closePath()
          ctx.stroke()
        } else if (type === 'point') {
          // Square for point
          ctx.strokeStyle = '#0ff'
          ctx.lineWidth = 1.5 / view.zoom
          ctx.strokeRect(sp.x - r, sp.y - r, r * 2, r * 2)
        } else if (type === 'center') {
          // Circle + cross for center
          ctx.strokeStyle = '#f0f'
          ctx.lineWidth = 1.5 / view.zoom
          ctx.beginPath()
          ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(sp.x - r, sp.y); ctx.lineTo(sp.x + r, sp.y)
          ctx.moveTo(sp.x, sp.y - r); ctx.lineTo(sp.x, sp.y + r)
          ctx.stroke()
        } else if (type === 'edge') {
          // X for edge
          ctx.strokeStyle = '#0f0'
          ctx.lineWidth = 1.5 / view.zoom
          ctx.beginPath()
          ctx.moveTo(sp.x - r, sp.y - r); ctx.lineTo(sp.x + r, sp.y + r)
          ctx.moveTo(sp.x + r, sp.y - r); ctx.lineTo(sp.x - r, sp.y + r)
          ctx.stroke()
        } else {
          // Circle for intersection / other
          ctx.fillStyle = '#f00'
          ctx.beginPath()
          ctx.arc(sp.x, sp.y, r * 0.7, 0, Math.PI * 2)
          ctx.fill()
        }

        // Dashed line from cursor to snap point
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        ctx.lineWidth = 1 / view.zoom
        ctx.setLineDash([3 / view.zoom, 2 / view.zoom])
        ctx.beginPath()
        ctx.moveTo(scenePos.x, scenePos.y)
        ctx.lineTo(sp.x, sp.y)
        ctx.stroke()
        ctx.setLineDash([])

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.font = `${10 / view.zoom}px monospace`
        ctx.fillText(`${type} (${sp.x.toFixed(0)}, ${sp.y.toFixed(0)})`, sp.x + 10 / view.zoom, sp.y - 6 / view.zoom)
      }

      if (!hitTestEnabled) {
        showInfo(`Snap: ${type} at (${sp.x.toFixed(1)}, ${sp.y.toFixed(1)}) d=${result.distance.toFixed(1)}`)
      }
    }
  }

  render()
}

// --- Buttons: Primitives ---

document.querySelector('#btn-circle')!.addEventListener('click', () => {
  const c = new Circle(new Vector2(randomX(), randomY()), 30 + Math.random() * 60)
  c.stroke = { color: randomColor(), width: 2 }
  c.fill = { type: 'solid', color: 'rgba(255,255,255,0.05)' }
  addShape(c)
  showInfo(`Circle r=${c.radius.toFixed(0)} area=${c.area().toFixed(1)} perim=${c.perimeter().toFixed(1)}`)
})

document.querySelector('#btn-rect')!.addEventListener('click', () => {
  const w = 40 + Math.random() * 120
  const h = 30 + Math.random() * 100
  const r = new Rectangle(new Vector2(randomX() - w/2, randomY() - h/2), w, h)
  r.stroke = { color: randomColor(), width: 2 }
  r.fill = { type: 'solid', color: 'rgba(255,255,255,0.05)' }
  addShape(r)
  showInfo(`Rect ${w.toFixed(0)}x${h.toFixed(0)} area=${r.area().toFixed(1)} perim=${r.perimeter().toFixed(1)}`)
})

document.querySelector('#btn-ellipse')!.addEventListener('click', () => {
  const rx = 30 + Math.random() * 70
  const ry = 20 + Math.random() * 50
  const e = new Ellipse(new Vector2(randomX(), randomY()), rx, ry)
  e.stroke = { color: randomColor(), width: 2 }
  e.fill = { type: 'solid', color: 'rgba(255,255,255,0.05)' }
  addShape(e)
  showInfo(`Ellipse rx=${rx.toFixed(0)} ry=${ry.toFixed(0)} area=${e.area().toFixed(1)} perim=${e.perimeter().toFixed(1)}`)
})

document.querySelector('#btn-arc')!.addEventListener('click', () => {
  const startAngle = Math.random() * Math.PI
  const endAngle = startAngle + 0.5 + Math.random() * Math.PI * 1.2
  const a = new Arc(new Vector2(randomX(), randomY()), 40 + Math.random() * 50, startAngle, endAngle)
  a.stroke = { color: randomColor(), width: 2 }
  addShape(a)
  showInfo(`Arc r=${a.radius.toFixed(0)} perim=${a.perimeter().toFixed(1)} area=${a.area().toFixed(1)}`)
})

document.querySelector('#btn-path')!.addEventListener('click', () => {
  const sx = randomX(), sy = randomY()
  const p = new Path()
    .moveTo(new Vector2(sx, sy))
    .cubicTo(
      new Vector2(sx + 80, sy - 100),
      new Vector2(sx + 160, sy + 100),
      new Vector2(sx + 200, sy),
    )
    .quadraticTo(
      new Vector2(sx + 250, sy - 60),
      new Vector2(sx + 300, sy + 20),
    )
  p.stroke = { color: randomColor(), width: 2 }
  addShape(p)
  showInfo(`Path segments=${p.segments.length} perim=${p.perimeter().toFixed(1)}`)
})

document.querySelector('#btn-text')!.addEventListener('click', () => {
  const labels = ['Plume 2D', 'Hello World', 'CAO', 'Label', 'Point A', '42.0m']
  const label = labels[Math.floor(Math.random() * labels.length)]
  const sizes = [14, 18, 24, 32, 48]
  const size = sizes[Math.floor(Math.random() * sizes.length)]
  const t = new Text(label, new Vector2(randomX(), randomY()), size)
  t.fill = { type: 'solid', color: randomColor() }
  addShape(t)
  showInfo(`Text "${label}" ${size}px`)
})

// --- Polyline draw mode ---
document.querySelector('#btn-polyline')!.addEventListener('click', () => {
  drawMode = drawMode === 'polyline' ? null : 'polyline'
  document.querySelector('#btn-polyline')!.classList.toggle('active', drawMode === 'polyline')
  currentPoints = []
  showInfo(drawMode ? 'Click to add points, double-click to close' : 'Draw mode off')
})

input.onClick = (scenePos) => {
  if (drawMode !== 'polyline') return

  if (snapEnabled) {
    const shapes = scene.root.children.filter((c): c is AShape => c instanceof Polyline || c instanceof Circle || c instanceof Rectangle || c instanceof Ellipse)
    const result = snap(scenePos, shapes, { gridSize: 20, tolerance: 15 / view.zoom })
    if (result) {
      scenePos = result.point
      showInfo(`Snapped to ${result.type} (d=${result.distance.toFixed(1)})`)
    }
  }

  currentPoints.push(scenePos)

  if (currentPoints.length >= 2) {
    const last = scene.root.children[scene.root.children.length - 1]
    if (last instanceof Polyline && !last.isClosed && (last as any)._drawing) {
      scene.root.removeChild(last)
    }

    const line = new Polyline([...currentPoints])
    line.stroke = { color: '#0ff', width: 2 };
    (line as any)._drawing = true
    scene.root.addChild(line)
  }
  render()
}

input.onDblClick = () => {
  if (drawMode !== 'polyline') return
  if (currentPoints.length >= 3) {
    const last = scene.root.children[scene.root.children.length - 1]
    if (last instanceof Polyline) {
      last.isClosed = true
      last.fill = { type: 'solid', color: 'rgba(0, 255, 255, 0.1)' }
      delete (last as any)._drawing
      showInfo(`Polyline closed. area=${last.area().toFixed(1)} perim=${last.perimeter().toFixed(1)}`)
    }
  }
  currentPoints = []
  render()
}

// --- Buttons: Styles ---

document.querySelector('#btn-dashed')!.addEventListener('click', () => {
  const r = new Rectangle(new Vector2(randomX() - 50, randomY() - 35), 100, 70)
  r.stroke = { color: '#fa0', width: 2, dashArray: [8, 4] }
  r.fill = null
  addShape(r)
  showInfo('Rectangle with dashed stroke [8, 4]')
})

document.querySelector('#btn-thick')!.addEventListener('click', () => {
  const pts = Array.from({ length: 5 }, () => new Vector2(randomX(), randomY()))
  const p = new Polyline(pts)
  p.stroke = { color: '#58f', width: 6, lineCap: 'round', lineJoin: 'round' }
  addShape(p)
  showInfo('Polyline with thick round stroke')
})

document.querySelector('#btn-opacity')!.addEventListener('click', () => {
  const c = new Circle(new Vector2(randomX(), randomY()), 50)
  c.stroke = { color: '#fff', width: 2, opacity: 0.3 }
  c.fill = { type: 'solid', color: '#e94560', opacity: 0.2 }
  addShape(c)
  showInfo('Circle with opacity on stroke (0.3) and fill (0.2)')
})

document.querySelector('#btn-linear-grad')!.addEventListener('click', () => {
  const x = randomX(), y = randomY()
  const w = 80 + Math.random() * 100, h = 60 + Math.random() * 80
  const r = new Rectangle(new Vector2(x - w / 2, y - h / 2), w, h)
  r.stroke = { color: '#fff', width: 1 }
  r.fill = {
    type: 'linear-gradient',
    start: new Vector2(x - w / 2, y),
    end: new Vector2(x + w / 2, y),
    stops: [
      { offset: 0, color: '#e94560' },
      { offset: 0.5, color: '#0f3460' },
      { offset: 1, color: '#0ff' },
    ],
  }
  addShape(r)
  showInfo('Rectangle with linear gradient fill')
})

document.querySelector('#btn-radial-grad')!.addEventListener('click', () => {
  const x = randomX(), y = randomY()
  const radius = 40 + Math.random() * 50
  const c = new Circle(new Vector2(x, y), radius)
  c.stroke = { color: '#fff', width: 1 }
  c.fill = {
    type: 'radial-gradient',
    center: new Vector2(x, y),
    radius,
    stops: [
      { offset: 0, color: '#fff' },
      { offset: 0.4, color: '#e94560' },
      { offset: 1, color: '#0f3460' },
    ],
  }
  addShape(c)
  showInfo('Circle with radial gradient fill')
})

document.querySelector('#btn-pattern')!.addEventListener('click', () => {
  const patterns: Array<'hatch' | 'crosshatch' | 'dots' | 'grid'> = ['hatch', 'crosshatch', 'dots', 'grid']
  const pattern = patterns[Math.floor(Math.random() * patterns.length)]
  const x = randomX(), y = randomY()
  const w = 80 + Math.random() * 100, h = 60 + Math.random() * 80
  const r = new Rectangle(new Vector2(x - w / 2, y - h / 2), w, h)
  r.stroke = { color: '#fff', width: 1 }
  r.fill = {
    type: 'pattern',
    pattern,
    color: randomColor(),
    background: 'rgba(0,0,0,0.3)',
    spacing: 8 + Math.random() * 8,
    size: pattern === 'dots' ? 2 : 1,
  }
  addShape(r)
  showInfo(`Rectangle with "${pattern}" pattern fill`)
})

// --- Buttons: Polyline tools ---

document.querySelector('#btn-simplify')!.addEventListener('click', () => {
  const polys = scene.root.children.filter((c): c is Polyline => c instanceof Polyline)
  if (polys.length === 0) { showInfo('No polylines to simplify'); return }
  const last = polys[polys.length - 1]
  const before = last.points.length
  const simplified = last.simplify(10)
  simplified.stroke = { color: '#0f0', width: 2, dashArray: [4, 2] }
  scene.root.removeChild(last)
  scene.root.addChild(simplified)
  render()
  showInfo(`Simplified: ${before} pts -> ${simplified.points.length} pts`)
})

document.querySelector('#btn-reverse')!.addEventListener('click', () => {
  const polys = scene.root.children.filter((c): c is Polyline => c instanceof Polyline)
  if (polys.length === 0) { showInfo('No polylines to reverse'); return }
  const last = polys[polys.length - 1]
  const reversed = last.reverse()
  reversed.stroke = { color: '#f0f', width: 2 }
  scene.root.removeChild(last)
  scene.root.addChild(reversed)
  render()
  showInfo(`Reversed polyline (${reversed.points.length} pts)`)
})

document.querySelector('#btn-bbox')!.addEventListener('click', () => {
  overlays = []
  for (const child of scene.root.children) {
    if ('getBoundingBox' in child) {
      const shape = child as AShape
      const bb = shape.getBoundingBox()
      overlays.push(() => {
        const ctx = getCtx()
        ctx.strokeStyle = 'rgba(255,255,0,0.5)'
        ctx.lineWidth = 1 / view.zoom
        ctx.setLineDash([4 / view.zoom, 3 / view.zoom])
        ctx.strokeRect(bb.min.x, bb.min.y, bb.width, bb.height)
        ctx.setLineDash([])
      })
    }
  }
  render()
  showInfo(`Showing ${overlays.length} bounding boxes (click again to refresh)`)
})

document.querySelector('#btn-centroid')!.addEventListener('click', () => {
  overlays = []
  for (const child of scene.root.children) {
    if (child instanceof Polyline && child.points.length > 0) {
      const c = child.centroid()
      overlays.push(() => {
        const ctx = getCtx()
        ctx.fillStyle = '#ff0'
        ctx.beginPath()
        ctx.arc(c.x, c.y, 4 / view.zoom, 0, Math.PI * 2)
        ctx.fill()
      })
    }
    if (child instanceof Circle) {
      const c = child.center
      overlays.push(() => {
        const ctx = getCtx()
        ctx.fillStyle = '#ff0'
        ctx.beginPath()
        ctx.arc(c.x, c.y, 4 / view.zoom, 0, Math.PI * 2)
        ctx.fill()
      })
    }
  }
  render()
  showInfo(`Showing ${overlays.length} centroids`)
})

// --- Buttons: Geometry ---

document.querySelector('#btn-intersect')!.addEventListener('click', () => {
  const a1 = new Vector2(200, 150), a2 = new Vector2(700, 500)
  const b1 = new Vector2(200, 500), b2 = new Vector2(700, 150)
  const lineA = new Polyline([a1, a2])
  lineA.stroke = { color: '#fa0', width: 1 }
  const lineB = new Polyline([b1, b2])
  lineB.stroke = { color: '#0af', width: 1 }
  scene.root.addChild(lineA)
  scene.root.addChild(lineB)

  const hit = intersectLineLine(a1, a2, b1, b2)
  overlays = []
  if (hit) {
    overlays.push(() => {
      const ctx = getCtx()
      ctx.fillStyle = '#f00'
      ctx.beginPath()
      ctx.arc(hit.x, hit.y, 6 / view.zoom, 0, Math.PI * 2)
      ctx.fill()
    })
    showInfo(`Intersection at (${hit.x.toFixed(1)}, ${hit.y.toFixed(1)})`)
  }
  render()
})

document.querySelector('#btn-line-circle')!.addEventListener('click', () => {
  const cx = randomX(), cy = randomY()
  const c = new Circle(new Vector2(cx, cy), 60)
  c.stroke = { color: '#0f0', width: 1 }
  c.fill = { type: 'solid', color: 'rgba(0,255,0,0.05)' }

  const l1 = new Vector2(cx - 150, cy - 30)
  const l2 = new Vector2(cx + 150, cy + 30)
  const line = new Polyline([l1, l2])
  line.stroke = { color: '#ff0', width: 1 }

  scene.root.addChild(c)
  scene.root.addChild(line)

  const hits = intersectLineCircle(l1, l2, c)
  overlays = []
  for (const h of hits) {
    overlays.push(() => {
      const ctx = getCtx()
      ctx.fillStyle = '#f00'
      ctx.beginPath()
      ctx.arc(h.x, h.y, 5 / view.zoom, 0, Math.PI * 2)
      ctx.fill()
    })
  }
  render()
  showInfo(`Line-Circle: ${hits.length} intersection(s)`)
})

document.querySelector('#btn-circle-circle')!.addEventListener('click', () => {
  const c1 = new Circle(new Vector2(randomX(), randomY()), 50)
  c1.stroke = { color: '#0ff', width: 1 }
  c1.fill = { type: 'solid', color: 'rgba(0,255,255,0.05)' }
  const c2 = new Circle(new Vector2(c1.center.x + 60, c1.center.y + 20), 50)
  c2.stroke = { color: '#f0f', width: 1 }
  c2.fill = { type: 'solid', color: 'rgba(255,0,255,0.05)' }

  scene.root.addChild(c1)
  scene.root.addChild(c2)

  const hits = intersectCircleCircle(c1, c2)
  overlays = []
  for (const h of hits) {
    overlays.push(() => {
      const ctx = getCtx()
      ctx.fillStyle = '#f00'
      ctx.beginPath()
      ctx.arc(h.x, h.y, 5 / view.zoom, 0, Math.PI * 2)
      ctx.fill()
    })
  }
  render()
  showInfo(`Circle-Circle: ${hits.length} intersection(s)`)
})

document.querySelector('#btn-distance')!.addEventListener('click', () => {
  const polys = scene.root.children.filter((c): c is Polyline => c instanceof Polyline && c.points.length >= 2)
  const circles = scene.root.children.filter((c): c is Circle => c instanceof Circle)
  if (polys.length === 0 && circles.length === 0) {
    showInfo('Add shapes first, then click Distance')
    return
  }

  const testPt = new Vector2(randomX(), randomY())
  overlays = []

  // Draw test point
  overlays.push(() => {
    const ctx = getCtx()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(testPt.x, testPt.y, 5 / view.zoom, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = `${12 / view.zoom}px monospace`
    ctx.fillText('test point', testPt.x + 8 / view.zoom, testPt.y - 8 / view.zoom)
  })

  let minDist = Infinity
  let closestPt: Vector2 | null = null

  for (const poly of polys) {
    const d = distancePointToPolyline(testPt, poly)
    if (d < minDist) {
      minDist = d
      closestPt = closestPointOnPolyline(testPt, poly)
    }
  }
  for (const c of circles) {
    const d = distancePointToCircle(testPt, c)
    if (d < minDist) {
      minDist = d
      // Closest point on circle
      const dir = testPt.sub(c.center).normalize()
      closestPt = c.center.add(dir.scale(c.radius))
    }
  }

  if (closestPt) {
    const cp = closestPt
    overlays.push(() => {
      const ctx = getCtx()
      ctx.strokeStyle = 'rgba(255,100,100,0.8)'
      ctx.lineWidth = 1 / view.zoom
      ctx.setLineDash([3 / view.zoom, 2 / view.zoom])
      ctx.beginPath()
      ctx.moveTo(testPt.x, testPt.y)
      ctx.lineTo(cp.x, cp.y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#f55'
      ctx.beginPath()
      ctx.arc(cp.x, cp.y, 4 / view.zoom, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  render()
  showInfo(`Distance to nearest shape: ${minDist.toFixed(2)}`)
})

// --- Snap toggle ---
document.querySelector('#btn-snap')!.addEventListener('click', () => {
  snapEnabled = !snapEnabled
  document.querySelector('#btn-snap')!.classList.toggle('active', snapEnabled)
  showInfo(snapEnabled ? 'Snap ON (grid=20, points, edges, centers)' : 'Snap OFF')
})

// --- HitTest toggle ---
document.querySelector('#btn-hittest')!.addEventListener('click', () => {
  hitTestEnabled = !hitTestEnabled
  document.querySelector('#btn-hittest')!.classList.toggle('active', hitTestEnabled)
  if (!hitTestEnabled) { hitTestOverlay = null; render() }
  showInfo(hitTestEnabled ? 'HitTest ON - move mouse over shapes' : 'HitTest OFF')
})

// --- Snap visual toggle ---
document.querySelector('#btn-snap-visual')!.addEventListener('click', () => {
  snapVisualEnabled = !snapVisualEnabled
  document.querySelector('#btn-snap-visual')!.classList.toggle('active', snapVisualEnabled)
  if (!snapVisualEnabled) { snapOverlay = null; render() }
  showInfo(snapVisualEnabled ? 'Snap visual ON - move mouse to see snap targets' : 'Snap visual OFF')
})

// --- Scene ---
document.querySelector('#btn-clear')!.addEventListener('click', () => {
  scene.root.children.slice().forEach(c => scene.root.removeChild(c))
  overlays = []
  currentPoints = []
  hitTestOverlay = null
  snapOverlay = null
  render()
  showInfo('Scene cleared')
})

document.querySelector('#btn-svg')!.addEventListener('click', () => {
  const svgRenderer = new SVGRenderer(900, 650)
  svgRenderer.render(scene, view)
  const blob = new Blob([svgRenderer.svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plume-scene.svg'
  a.click()
  URL.revokeObjectURL(url)
  showInfo('SVG exported')
})

// --- Initial render ---
render()
showInfo('Plume 2D demo. Add shapes with the buttons on the left.')
