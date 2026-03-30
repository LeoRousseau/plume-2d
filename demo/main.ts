import {
  Vector2, Scene, View, Canvas2DRenderer, SVGRenderer, parseSVG,
} from '@plume/index'
import { InputHandler } from './InputHandler'
import {
  createToolState, handleDrawStart, handleDrawMove, handleDrawEnd,
  handlePolylineClick, handlePolylineDblClick, handleTextClick,
  cancelDraw,
} from './tools'
import type { ToolType, DrawContext } from './tools'
import { createStylePanel } from './stylePanel'
import { createSceneTree } from './sceneTree'

// --- Canvas setup (fill parent) ---
const canvasEl = document.querySelector<HTMLCanvasElement>('#plume-canvas')!
function resizeCanvas(): void {
  const wrap = document.querySelector<HTMLDivElement>('#canvas-wrap')!
  canvasEl.width = wrap.clientWidth
  canvasEl.height = wrap.clientHeight
}
resizeCanvas()
window.addEventListener('resize', () => { resizeCanvas(); view.width = canvasEl.width; view.height = canvasEl.height; render() })

const scene = new Scene()
const view = new View(canvasEl.width, canvasEl.height)
const renderer = new Canvas2DRenderer(canvasEl)
renderer.onNeedRerender = () => render()

const info = document.querySelector<HTMLDivElement>('#info')!
function showInfo(text: string): void { info.textContent = text }

// --- Tool state ---
const toolState = createToolState()
const drawCtx: DrawContext = { scene, toolState, render }

// --- Style panel ---
const stylePanelEl = document.querySelector<HTMLDivElement>('#style-panel')!
createStylePanel(stylePanelEl, toolState)

// --- Scene tree ---
const sceneTreeEl = document.querySelector<HTMLDivElement>('#scene-tree')!
const sceneTree = createSceneTree(sceneTreeEl, scene)

// --- Input ---
const input = new InputHandler(canvasEl, view, render)

input.onMouseDown = (pos) => {
  if (toolState.activeTool === 'polyline') return
  if (toolState.activeTool === 'text') return
  if (toolState.activeTool === 'select') return
  handleDrawStart(pos, drawCtx)
}

input.onDrag = (pos) => {
  handleDrawMove(pos, drawCtx)
}

input.onMouseUp = (pos) => {
  handleDrawEnd(pos, drawCtx)
  sceneTree.refresh()
}

input.onClick = (pos) => {
  if (toolState.activeTool === 'polyline') {
    handlePolylineClick(pos, drawCtx)
    sceneTree.refresh()
  } else if (toolState.activeTool === 'text') {
    handleTextClick(pos, drawCtx)
    sceneTree.refresh()
  }
}

input.onDblClick = () => {
  if (toolState.activeTool === 'polyline') {
    handlePolylineDblClick(drawCtx)
    sceneTree.refresh()
  }
}

// --- Toolbar buttons ---
const toolButtons: { id: string; tool: ToolType }[] = [
  { id: 'tool-select', tool: 'select' },
  { id: 'tool-circle', tool: 'circle' },
  { id: 'tool-rect', tool: 'rectangle' },
  { id: 'tool-ellipse', tool: 'ellipse' },
  { id: 'tool-polyline', tool: 'polyline' },
  { id: 'tool-path', tool: 'path' },
  { id: 'tool-text', tool: 'text' },
]

function setActiveTool(tool: ToolType): void {
  cancelDraw(drawCtx)
  toolState.activeTool = tool
  for (const tb of toolButtons) {
    document.getElementById(tb.id)?.classList.toggle('active', tb.tool === tool)
  }
  canvasEl.style.cursor = tool === 'select' ? 'default' : 'crosshair'
  showInfo(`Tool: ${tool}`)
}

for (const tb of toolButtons) {
  document.getElementById(tb.id)?.addEventListener('click', () => setActiveTool(tb.tool))
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return
  const map: Record<string, ToolType> = {
    v: 'select', c: 'circle', r: 'rectangle', e: 'ellipse',
    p: 'polyline', b: 'path', t: 'text',
  }
  const tool = map[e.key.toLowerCase()]
  if (tool) setActiveTool(tool)
})

// --- Action buttons ---
document.getElementById('btn-clear')?.addEventListener('click', () => {
  scene.root.children.slice().forEach(c => scene.root.removeChild(c))
  sceneTree.refresh()
  render()
  showInfo('Scene cleared')
})

document.getElementById('btn-export-svg')?.addEventListener('click', () => {
  const svgRenderer = new SVGRenderer(canvasEl.width, canvasEl.height)
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

document.getElementById('btn-import-svg')?.addEventListener('click', () => {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = '.svg,image/svg+xml'
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = parseSVG(reader.result as string)
        let count = 0
        for (const child of imported.root.children.slice()) {
          imported.root.removeChild(child)
          scene.root.addChild(child)
          count++
        }
        sceneTree.refresh()
        render()
        showInfo(`Imported ${count} element(s) from ${file.name}`)
      } catch (e) {
        showInfo(`SVG import error: ${(e as Error).message}`)
      }
    }
    reader.readAsText(file)
  })
  fileInput.click()
})

// --- Render ---
function render(): void {
  renderer.render(scene, view)
}

// --- Initial ---
render()
showInfo('Plume 2D Editor — select a tool and draw on the canvas')
