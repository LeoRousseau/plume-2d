import { Vector2, Scene, View, Polyline, Canvas2DRenderer, SVGRenderer } from '@plume/index'
import { InputHandler } from './InputHandler'

const canvasEl = document.querySelector<HTMLCanvasElement>('#plume-canvas')!
canvasEl.width = 800
canvasEl.height = 600

const renderer = new Canvas2DRenderer(canvasEl)
const scene = new Scene()
const view = new View(800, 600)

// Triangle demo
const triangle = new Polyline(
  [new Vector2(400, 150), new Vector2(250, 450), new Vector2(550, 450)],
  true,
)
triangle.strokeColor = '#e94560'
triangle.strokeWidth = 2
triangle.fillColor = 'rgba(233, 69, 96, 0.15)'
scene.root.addChild(triangle)

// --- Input ---
const input = new InputHandler(canvasEl, view, render)

// Click to add polylines
let currentPoints: Vector2[] = []

input.onClick = (scenePos) => {
  currentPoints.push(scenePos)

  if (currentPoints.length >= 2) {
    // Remove previous in-progress polyline
    const last = scene.root.children[scene.root.children.length - 1]
    if (last !== triangle && last instanceof Polyline && !last.isClosed) {
      scene.root.removeChild(last)
    }

    const line = new Polyline([...currentPoints])
    line.strokeColor = '#0ff'
    line.strokeWidth = 2
    scene.root.addChild(line)
  }

  render()
}

input.onDblClick = () => {
  if (currentPoints.length >= 3) {
    const last = scene.root.children[scene.root.children.length - 1]
    if (last instanceof Polyline) {
      last.isClosed = true
      last.fillColor = 'rgba(0, 255, 255, 0.1)'
    }
  }
  currentPoints = []
  render()
}

function render() {
  renderer.render(scene, view)
}

render()

// --- SVG Export ---
const svgRenderer = new SVGRenderer(800, 600)
document.querySelector('#download-svg')!.addEventListener('click', () => {
  svgRenderer.render(scene, view)
  const blob = new Blob([svgRenderer.svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plume-scene.svg'
  a.click()
  URL.revokeObjectURL(url)
})
