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

export interface SceneTree {
  refresh: () => void
  select: (node: Node | null) => void
  selected: () => Node | null
  onDelete: (() => void) | null
}

export function createSceneTree(container: HTMLElement, scene: Scene): SceneTree {
  let selectedNode: Node | null = null

  function select(node: Node | null): void {
    selectedNode = node
    refresh()
  }

  function selected(): Node | null {
    return selectedNode
  }

  function refresh(): void {
    container.innerHTML = ''

    const header = document.createElement('div')
    header.className = 'scene-tree-header'
    const h3 = document.createElement('h3')
    h3.textContent = 'Scene'
    header.appendChild(h3)

    if (selectedNode) {
      const delBtn = document.createElement('button')
      delBtn.className = 'tree-delete-btn'
      delBtn.textContent = '🗑'
      delBtn.title = 'Delete selected (Delete)'
      delBtn.addEventListener('click', () => {
        if (selectedNode) {
          scene.root.removeChild(selectedNode)
          selectedNode = null
          tree.onDelete?.()
          refresh()
        }
      })
      header.appendChild(delBtn)
    }

    container.appendChild(header)

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
      if (node === selectedNode) row.classList.add('selected')
      row.style.paddingLeft = `${depth * 12 + 4}px`

      row.addEventListener('click', () => {
        selectedNode = selectedNode === node ? null : node
        refresh()
      })

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

  const tree: SceneTree = { refresh, select, selected, onDelete: null }
  refresh()
  return tree
}
