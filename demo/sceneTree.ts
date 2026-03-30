import { Node, Scene, Circle, Rectangle, Ellipse, Polyline, Path, Text, Raster, SVGNode, Arc } from '@plume/index'

function getNodeLabel(node: Node): string {
  if (node instanceof Circle) return `Circle (r=${node.radius.toFixed(0)})`
  if (node instanceof Rectangle) return `Rect (${node.width.toFixed(0)}×${node.height.toFixed(0)})`
  if (node instanceof Ellipse) return `Ellipse (${node.rx.toFixed(0)}×${node.ry.toFixed(0)})`
  if (node instanceof Arc) return `Arc (r=${node.radius.toFixed(0)})`
  if (node instanceof Polyline) return `Polyline (${node.points.length} pts${node.isClosed ? ', closed' : ''})`
  if (node instanceof Path) return `Path (${node.segments.length} seg)`
  if (node instanceof Text) return `Text "${(node as Text).content}"`
  if (node instanceof Raster) return `Raster`
  if (node instanceof SVGNode) return `SVG`
  return `Node`
}

function getNodeIcon(node: Node): string {
  if (node instanceof Circle) return '●'
  if (node instanceof Rectangle) return '■'
  if (node instanceof Ellipse) return '⬮'
  if (node instanceof Arc) return '◠'
  if (node instanceof Polyline) return '⏤'
  if (node instanceof Path) return '∿'
  if (node instanceof Text) return 'T'
  if (node instanceof Raster) return '🖼'
  if (node instanceof SVGNode) return '◇'
  return '○'
}

export function createSceneTree(container: HTMLElement, scene: Scene): { refresh: () => void } {
  function refresh(): void {
    container.innerHTML = '<h3>Scene</h3>'
    const list = document.createElement('div')
    list.className = 'scene-tree-list'
    renderChildren(scene.root.children, list, 0)
    container.appendChild(list)
  }

  function renderChildren(children: Node[], parent: HTMLElement, depth: number): void {
    for (let i = children.length - 1; i >= 0; i--) {
      const node = children[i]
      const row = document.createElement('div')
      row.className = 'tree-row'
      row.style.paddingLeft = `${depth * 12 + 4}px`

      const visible = node.visible
      const visBtn = document.createElement('span')
      visBtn.className = 'vis-toggle'
      visBtn.textContent = visible ? '👁' : '—'
      visBtn.title = visible ? 'Visible' : 'Hidden'

      const icon = document.createElement('span')
      icon.className = 'tree-icon'
      icon.textContent = getNodeIcon(node)

      const label = document.createElement('span')
      label.className = 'tree-label'
      label.textContent = getNodeLabel(node)

      row.appendChild(visBtn)
      row.appendChild(icon)
      row.appendChild(label)
      parent.appendChild(row)

      if (node.children.length > 0) {
        renderChildren(node.children, parent, depth + 1)
      }
    }
  }

  refresh()
  return { refresh }
}
