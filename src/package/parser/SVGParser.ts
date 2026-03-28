import { Vector2 } from '../math/Vector2'
import { Node } from '../core/Node'
import { Scene } from '../core/Scene'
import { Circle } from '../entity/Circle'
import { Ellipse } from '../entity/Ellipse'
import { Rectangle } from '../entity/Rectangle'
import { Polyline } from '../entity/Polyline'
import { Path } from '../entity/Path'
import { Arc } from '../entity/Arc'
import { Text } from '../entity/Text'
import { Raster } from '../entity/Raster'
import type { FillStyle, GradientStop } from '../entity/FillStyle'
import type { StrokeStyle } from '../entity/StrokeStyle'
import { ARenderable } from '../entity/Renderable'

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Parses an SVG string and returns a Scene. */
export function parseSVG(svgString: string): Scene {
  const scene = new Scene()
  const root = parseSVGToNode(svgString)
  for (const child of root.children.slice()) {
    root.removeChild(child)
    scene.root.addChild(child)
  }
  return scene
}

/** Parses an SVG string and returns a Node subtree (for merging into an existing scene). */
export function parseSVGToNode(svgString: string): Node {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')

  const errorNode = doc.querySelector('parsererror')
  if (errorNode) throw new Error('Invalid SVG: ' + errorNode.textContent)

  const svgEl = doc.documentElement
  const defs = buildDefsMap(svgEl)

  const root = new Node()
  walkChildren(svgEl, root, defs)
  return root
}

// ---------------------------------------------------------------------------
// Defs map (gradients, patterns)
// ---------------------------------------------------------------------------

function buildDefsMap(svgEl: Element): Map<string, Element> {
  const map = new Map<string, Element>()
  const defsEl = svgEl.querySelector('defs')
  if (!defsEl) return map
  for (const child of Array.from(defsEl.children)) {
    const id = child.getAttribute('id')
    if (id) map.set(id, child)
  }
  return map
}

// ---------------------------------------------------------------------------
// Tree walker
// ---------------------------------------------------------------------------

function walkChildren(parent: Element, parentNode: Node, defs: Map<string, Element>): void {
  for (const el of Array.from(parent.children)) {
    const node = parseElement(el, defs)
    if (node) parentNode.addChild(node)
  }
}

function parseElement(el: Element, defs: Map<string, Element>): Node | null {
  const tag = el.tagName.toLowerCase()
  if (tag === 'defs') return null

  let node: Node | null = null

  switch (tag) {
    case 'g':
      node = parseGroup(el, defs)
      break
    case 'rect':
      node = parseRect(el, defs)
      break
    case 'circle':
      node = parseCircle(el, defs)
      break
    case 'ellipse':
      node = parseEllipse(el, defs)
      break
    case 'line':
      node = parseLine(el, defs)
      break
    case 'polyline':
      node = parsePolyline(el, false, defs)
      break
    case 'polygon':
      node = parsePolyline(el, true, defs)
      break
    case 'path':
      node = parsePath(el, defs)
      break
    case 'text':
      node = parseTextEl(el, defs)
      break
    case 'image':
      node = parseImage(el)
      break
  }

  if (node) {
    if (el.getAttribute('visibility') === 'hidden' || el.getAttribute('display') === 'none') {
      node.visible = false
    }
  }

  return node
}

// ---------------------------------------------------------------------------
// Group — flatten single-child wrappers
// ---------------------------------------------------------------------------

function parseGroup(el: Element, defs: Map<string, Element>): Node | null {
  const group = new Node()
  applyTransform(el, group)
  walkChildren(el, group, defs)

  // Flatten: <g> with a single renderable child and no other role
  if (group.children.length === 1) {
    const child = group.children[0]
    // Compose transforms: apply group transform to child
    const gt = group.transform
    const ct = child.transform
    ct.position = new Vector2(
      gt.position.x + gt.scale.x * (Math.cos(gt.rotation) * ct.position.x - Math.sin(gt.rotation) * ct.position.y),
      gt.position.y + gt.scale.y * (Math.sin(gt.rotation) * ct.position.x + Math.cos(gt.rotation) * ct.position.y),
    )
    ct.rotation = gt.rotation + ct.rotation
    ct.scale = new Vector2(gt.scale.x * ct.scale.x, gt.scale.y * ct.scale.y)
    child.visible = child.visible && group.visible
    group.removeChild(child)
    return child
  }

  return group.children.length > 0 ? group : null
}

// ---------------------------------------------------------------------------
// Shape parsers
// ---------------------------------------------------------------------------

function parseRect(el: Element, defs: Map<string, Element>): Rectangle {
  const x = num(el, 'x')
  const y = num(el, 'y')
  const w = num(el, 'width')
  const h = num(el, 'height')
  const r = new Rectangle(new Vector2(x, y), w, h)
  applyStyles(el, r, defs)
  applyTransform(el, r)
  return r
}

function parseCircle(el: Element, defs: Map<string, Element>): Circle {
  const cx = num(el, 'cx')
  const cy = num(el, 'cy')
  const radius = num(el, 'r')
  const c = new Circle(new Vector2(cx, cy), radius)
  applyStyles(el, c, defs)
  applyTransform(el, c)
  return c
}

function parseEllipse(el: Element, defs: Map<string, Element>): Ellipse {
  const cx = num(el, 'cx')
  const cy = num(el, 'cy')
  const rx = num(el, 'rx')
  const ry = num(el, 'ry')
  const e = new Ellipse(new Vector2(cx, cy), rx, ry)
  applyStyles(el, e, defs)
  applyTransform(el, e)
  return e
}

function parseLine(el: Element, defs: Map<string, Element>): Polyline {
  const p1 = new Vector2(num(el, 'x1'), num(el, 'y1'))
  const p2 = new Vector2(num(el, 'x2'), num(el, 'y2'))
  const p = new Polyline([p1, p2])
  applyStyles(el, p, defs)
  applyTransform(el, p)
  return p
}

function parsePolyline(el: Element, closed: boolean, defs: Map<string, Element>): Polyline {
  const points = parsePoints(el.getAttribute('points') ?? '')
  const p = new Polyline(points, closed)
  applyStyles(el, p, defs)
  applyTransform(el, p)
  return p
}

function parsePath(el: Element, defs: Map<string, Element>): Path {
  const d = el.getAttribute('d') ?? ''
  const p = new Path()
  const segments = parsePathData(d)
  for (const seg of segments) {
    switch (seg.type) {
      case 'moveTo': p.moveTo(seg.point); break
      case 'lineTo': p.lineTo(seg.point); break
      case 'quadraticTo': p.quadraticTo(seg.control, seg.point); break
      case 'cubicTo': p.cubicTo(seg.control1, seg.control2, seg.point); break
      case 'close': p.close(); break
    }
  }
  applyStyles(el, p, defs)
  applyTransform(el, p)
  return p
}

function parseTextEl(el: Element, defs: Map<string, Element>): Text {
  const x = num(el, 'x')
  const y = num(el, 'y')
  const fontSize = num(el, 'font-size', 16)
  const fontFamily = el.getAttribute('font-family') ?? 'sans-serif'
  const content = el.textContent ?? ''

  const t = new Text(content, new Vector2(x, y), fontSize, fontFamily)

  // Text align
  const anchor = el.getAttribute('text-anchor')
  if (anchor === 'middle') t.textAlign = 'center'
  else if (anchor === 'end') t.textAlign = 'right'
  else t.textAlign = 'left'

  // Text baseline
  const baseline = el.getAttribute('dominant-baseline')
  if (baseline === 'central') t.textBaseline = 'middle'
  else if (baseline === 'hanging') t.textBaseline = 'top'
  else if (baseline === 'text-bottom') t.textBaseline = 'bottom'
  else t.textBaseline = 'alphabetic'

  applyStyles(el, t, defs)
  applyTransform(el, t)
  return t
}

function parseImage(el: Element): Raster {
  const href = el.getAttribute('href') ?? el.getAttributeNS('http://www.w3.org/1999/xlink', 'href') ?? ''
  const x = num(el, 'x')
  const y = num(el, 'y')
  const w = num(el, 'width')
  const h = num(el, 'height')

  const img = typeof Image !== 'undefined' ? new Image() : document.createElement('img')
  img.src = href

  const raster = new Raster(img, new Vector2(x, y), w, h)
  applyTransform(el, raster)
  return raster
}

// ---------------------------------------------------------------------------
// Style parsing
// ---------------------------------------------------------------------------

function applyStyles(el: Element, node: ARenderable, defs: Map<string, Element>): void {
  node.stroke = parseStroke(el)
  node.fill = parseFillAttr(el, defs)
}

function parseStroke(el: Element): StrokeStyle {
  const color = el.getAttribute('stroke') ?? '#000000'
  const width = num(el, 'stroke-width', 1)
  const stroke: StrokeStyle = { color, width }

  const dash = el.getAttribute('stroke-dasharray')
  if (dash && dash !== 'none') {
    stroke.dashArray = dash.split(/[\s,]+/).map(Number)
  }

  const dashOffset = el.getAttribute('stroke-dashoffset')
  if (dashOffset) stroke.dashOffset = parseFloat(dashOffset)

  const cap = el.getAttribute('stroke-linecap') as CanvasLineCap | null
  if (cap) stroke.lineCap = cap

  const join = el.getAttribute('stroke-linejoin') as CanvasLineJoin | null
  if (join) stroke.lineJoin = join

  const opacity = el.getAttribute('stroke-opacity')
  if (opacity) stroke.opacity = parseFloat(opacity)

  return stroke
}

function parseFillAttr(el: Element, defs: Map<string, Element>): FillStyle | null {
  const raw = el.getAttribute('fill')
  if (!raw || raw === 'none') return null

  const fillOpacity = el.getAttribute('fill-opacity')
  const opacity = fillOpacity ? parseFloat(fillOpacity) : undefined

  // url(#id) reference
  const urlMatch = raw.match(/^url\(#(.+?)\)$/)
  if (urlMatch) {
    const refEl = defs.get(urlMatch[1])
    if (!refEl) return null
    return parseDefFill(refEl, opacity)
  }

  // Solid color
  const fill: FillStyle = { type: 'solid', color: raw }
  if (opacity !== undefined) fill.opacity = opacity
  return fill
}

function parseDefFill(el: Element, opacity?: number): FillStyle | null {
  const tag = el.tagName.toLowerCase()

  if (tag === 'lineargradient') {
    const start = new Vector2(numAttr(el, 'x1'), numAttr(el, 'y1'))
    const end = new Vector2(numAttr(el, 'x2'), numAttr(el, 'y2'))
    const stops = parseGradientStops(el)
    return { type: 'linear-gradient', start, end, stops, opacity }
  }

  if (tag === 'radialgradient') {
    const center = new Vector2(numAttr(el, 'cx'), numAttr(el, 'cy'))
    const radius = numAttr(el, 'r')
    const stops = parseGradientStops(el)
    return { type: 'radial-gradient', center, radius, stops, opacity }
  }

  if (tag === 'pattern') {
    return parsePatternDef(el, opacity)
  }

  return null
}

function parseGradientStops(el: Element): GradientStop[] {
  return Array.from(el.querySelectorAll('stop')).map(s => ({
    offset: parseFloat(s.getAttribute('offset') ?? '0'),
    color: s.getAttribute('stop-color') ?? '#000',
  }))
}

function parsePatternDef(el: Element, opacity?: number): FillStyle | null {
  const spacing = numAttr(el, 'width', 10)
  const children = Array.from(el.children)

  // Detect background rect
  let background: string | null = null
  const bgRect = children.find(c => c.tagName.toLowerCase() === 'rect' && c.hasAttribute('fill'))
  if (bgRect) background = bgRect.getAttribute('fill')

  const lines = children.filter(c => c.tagName.toLowerCase() === 'line')
  const circles = children.filter(c => c.tagName.toLowerCase() === 'circle')
  const color = lines[0]?.getAttribute('stroke') ?? circles[0]?.getAttribute('fill') ?? '#000'

  let pattern: 'hatch' | 'crosshatch' | 'dots' | 'grid'
  let size = 1

  if (circles.length > 0) {
    pattern = 'dots'
    size = numAttr(circles[0], 'r', 1)
  } else if (lines.length === 2) {
    // crosshatch and grid both produce 2 lines — detect via patternTransform
    const ptAttr = el.getAttribute('patternTransform')
    pattern = ptAttr && ptAttr.includes('rotate') ? 'crosshatch' : 'grid'
    size = numAttr(lines[0], 'stroke-width', 1)
  } else if (lines.length === 1) {
    pattern = 'hatch'
    size = numAttr(lines[0], 'stroke-width', 1)
  } else {
    return { type: 'solid', color, opacity }
  }

  // Parse angle from patternTransform
  let angle: number | undefined
  const ptAttr = el.getAttribute('patternTransform')
  if (ptAttr) {
    const rotMatch = ptAttr.match(/rotate\(([^)]+)\)/)
    if (rotMatch) angle = parseFloat(rotMatch[1]) * Math.PI / 180
  }

  return { type: 'pattern', pattern, color, background, spacing, angle, size, opacity }
}

// ---------------------------------------------------------------------------
// Transform parsing
// ---------------------------------------------------------------------------

function applyTransform(el: Element, node: Node): void {
  const attr = el.getAttribute('transform')
  if (!attr) return

  // Parse individual transform functions
  let tx = 0, ty = 0, rot = 0, sx = 1, sy = 1

  const translateMatch = attr.match(/translate\(([^)]+)\)/)
  if (translateMatch) {
    const parts = translateMatch[1].split(/[\s,]+/).map(Number)
    tx = parts[0] ?? 0
    ty = parts[1] ?? 0
  }

  const rotateMatch = attr.match(/rotate\(([^)]+)\)/)
  if (rotateMatch) {
    const parts = rotateMatch[1].split(/[\s,]+/).map(Number)
    rot = (parts[0] ?? 0) * Math.PI / 180
  }

  const scaleMatch = attr.match(/scale\(([^)]+)\)/)
  if (scaleMatch) {
    const parts = scaleMatch[1].split(/[\s,]+/).map(Number)
    sx = parts[0] ?? 1
    sy = parts[1] ?? sx
  }

  const matrixMatch = attr.match(/matrix\(([^)]+)\)/)
  if (matrixMatch) {
    const [a, b, c, d, e, f] = matrixMatch[1].split(/[\s,]+/).map(Number)
    tx = e
    ty = f
    rot = Math.atan2(b, a)
    sx = Math.sqrt(a * a + b * b)
    sy = Math.sqrt(c * c + d * d)
    // Detect negative scale (mirror)
    if (a * d - b * c < 0) sy = -sy
  }

  node.transform.position = new Vector2(tx, ty)
  node.transform.rotation = rot
  node.transform.scale = new Vector2(sx, sy)
}

// ---------------------------------------------------------------------------
// SVG path d attribute parser
// ---------------------------------------------------------------------------

import type { PathSegment } from '../entity/PathSegment'

export function parsePathData(d: string): PathSegment[] {
  const tokens = tokenizePath(d)
  const segments: PathSegment[] = []
  let i = 0
  let cx = 0, cy = 0 // current point
  let sx = 0, sy = 0 // subpath start
  let prevCmd = ''
  let prevQx = 0, prevQy = 0 // previous quadratic control
  let prevCx2 = 0, prevCy2 = 0 // previous cubic control2

  function next(): number { return tokens[i++] as number }

  while (i < tokens.length) {
    let cmd = tokens[i] as string
    if (typeof cmd === 'string') {
      i++
    } else {
      // Implicit repeated command
      cmd = prevCmd === 'M' ? 'L' : prevCmd === 'm' ? 'l' : prevCmd
    }

    const isRel = cmd === cmd.toLowerCase()

    switch (cmd) {
      case 'M': case 'm': {
        const x = next() + (isRel ? cx : 0)
        const y = next() + (isRel ? cy : 0)
        segments.push({ type: 'moveTo', point: new Vector2(x, y) })
        cx = sx = x; cy = sy = y
        // Subsequent coords after M are implicit L
        prevCmd = isRel ? 'l' : 'L'
        continue
      }
      case 'L': case 'l': {
        const x = next() + (isRel ? cx : 0)
        const y = next() + (isRel ? cy : 0)
        segments.push({ type: 'lineTo', point: new Vector2(x, y) })
        cx = x; cy = y
        break
      }
      case 'H': case 'h': {
        const x = next() + (isRel ? cx : 0)
        segments.push({ type: 'lineTo', point: new Vector2(x, cy) })
        cx = x
        break
      }
      case 'V': case 'v': {
        const y = next() + (isRel ? cy : 0)
        segments.push({ type: 'lineTo', point: new Vector2(cx, y) })
        cy = y
        break
      }
      case 'Q': case 'q': {
        const qx = next() + (isRel ? cx : 0)
        const qy = next() + (isRel ? cy : 0)
        const x = next() + (isRel ? cx : 0)
        const y = next() + (isRel ? cy : 0)
        segments.push({ type: 'quadraticTo', control: new Vector2(qx, qy), point: new Vector2(x, y) })
        prevQx = qx; prevQy = qy
        cx = x; cy = y
        break
      }
      case 'T': case 't': {
        // Smooth quadratic — reflect previous control
        let qx: number, qy: number
        if (prevCmd === 'Q' || prevCmd === 'q' || prevCmd === 'T' || prevCmd === 't') {
          qx = 2 * cx - prevQx
          qy = 2 * cy - prevQy
        } else {
          qx = cx; qy = cy
        }
        const x = next() + (isRel ? cx : 0)
        const y = next() + (isRel ? cy : 0)
        segments.push({ type: 'quadraticTo', control: new Vector2(qx, qy), point: new Vector2(x, y) })
        prevQx = qx; prevQy = qy
        cx = x; cy = y
        break
      }
      case 'C': case 'c': {
        const x1 = next() + (isRel ? cx : 0)
        const y1 = next() + (isRel ? cy : 0)
        const x2 = next() + (isRel ? cx : 0)
        const y2 = next() + (isRel ? cy : 0)
        const x = next() + (isRel ? cx : 0)
        const y = next() + (isRel ? cy : 0)
        segments.push({ type: 'cubicTo', control1: new Vector2(x1, y1), control2: new Vector2(x2, y2), point: new Vector2(x, y) })
        prevCx2 = x2; prevCy2 = y2
        cx = x; cy = y
        break
      }
      case 'S': case 's': {
        // Smooth cubic — reflect previous control2
        let x1: number, y1: number
        if (prevCmd === 'C' || prevCmd === 'c' || prevCmd === 'S' || prevCmd === 's') {
          x1 = 2 * cx - prevCx2
          y1 = 2 * cy - prevCy2
        } else {
          x1 = cx; y1 = cy
        }
        const x2 = next() + (isRel ? cx : 0)
        const y2 = next() + (isRel ? cy : 0)
        const x = next() + (isRel ? cx : 0)
        const y = next() + (isRel ? cy : 0)
        segments.push({ type: 'cubicTo', control1: new Vector2(x1, y1), control2: new Vector2(x2, y2), point: new Vector2(x, y) })
        prevCx2 = x2; prevCy2 = y2
        cx = x; cy = y
        break
      }
      case 'A': case 'a': {
        const rx = next()
        const ry = next()
        const xRot = next() * Math.PI / 180
        const largeArc = next()
        const sweep = next()
        const x = next() + (isRel ? cx : 0)
        const y = next() + (isRel ? cy : 0)
        const cubics = arcToCubics(cx, cy, rx, ry, xRot, !!largeArc, !!sweep, x, y)
        for (const c of cubics) {
          segments.push({ type: 'cubicTo', control1: c.cp1, control2: c.cp2, point: c.end })
        }
        cx = x; cy = y
        break
      }
      case 'Z': case 'z':
        segments.push({ type: 'close' })
        cx = sx; cy = sy
        break
    }

    prevCmd = cmd
  }

  return segments
}

// ---------------------------------------------------------------------------
// Path tokenizer
// ---------------------------------------------------------------------------

function tokenizePath(d: string): (string | number)[] {
  const tokens: (string | number)[] = []
  const re = /([a-zA-Z])|([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(d)) !== null) {
    if (m[1]) tokens.push(m[1])
    else tokens.push(parseFloat(m[2]))
  }
  return tokens
}

// ---------------------------------------------------------------------------
// SVG arc endpoint → cubic bezier conversion (SVG spec F.6)
// ---------------------------------------------------------------------------

interface CubicArc {
  cp1: Vector2
  cp2: Vector2
  end: Vector2
}

function arcToCubics(
  x1: number, y1: number,
  rx: number, ry: number,
  phi: number,
  fA: boolean, fS: boolean,
  x2: number, y2: number,
): CubicArc[] {
  // Degenerate: zero radii or same point
  if (rx === 0 || ry === 0 || (x1 === x2 && y1 === y2)) {
    return [{ cp1: new Vector2(x1, y1), cp2: new Vector2(x2, y2), end: new Vector2(x2, y2) }]
  }

  rx = Math.abs(rx)
  ry = Math.abs(ry)

  const cosPhi = Math.cos(phi)
  const sinPhi = Math.sin(phi)

  // Step 1: compute (x1', y1')
  const dx = (x1 - x2) / 2
  const dy = (y1 - y2) / 2
  const x1p = cosPhi * dx + sinPhi * dy
  const y1p = -sinPhi * dx + cosPhi * dy

  // Correct radii if too small
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry)
  if (lambda > 1) {
    const sq = Math.sqrt(lambda)
    rx *= sq
    ry *= sq
  }

  // Step 2: compute (cx', cy')
  const rxSq = rx * rx
  const rySq = ry * ry
  const x1pSq = x1p * x1p
  const y1pSq = y1p * y1p

  let num = rxSq * rySq - rxSq * y1pSq - rySq * x1pSq
  if (num < 0) num = 0
  const denom = rxSq * y1pSq + rySq * x1pSq
  const sq = Math.sqrt(num / denom) * (fA === fS ? -1 : 1)

  const cxp = sq * rx * y1p / ry
  const cyp = -sq * ry * x1p / rx

  // Step 3: compute (cx, cy)
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const cx = cosPhi * cxp - sinPhi * cyp + mx
  const cy = sinPhi * cxp + cosPhi * cyp + my

  // Step 4: compute angles
  const theta1 = angle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
  let dTheta = angle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)

  if (!fS && dTheta > 0) dTheta -= Math.PI * 2
  if (fS && dTheta < 0) dTheta += Math.PI * 2

  // Split into 90-degree segments max
  const segments = Math.ceil(Math.abs(dTheta) / (Math.PI / 2))
  const delta = dTheta / segments

  const result: CubicArc[] = []
  let t = theta1

  for (let i = 0; i < segments; i++) {
    const t2 = t + delta
    const cubics = arcSegmentToCubic(cx, cy, rx, ry, phi, t, t2)
    result.push(cubics)
    t = t2
  }

  return result
}

function angle(ux: number, uy: number, vx: number, vy: number): number {
  const dot = ux * vx + uy * vy
  const len = Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy)
  let a = Math.acos(Math.max(-1, Math.min(1, dot / len)))
  if (ux * vy - uy * vx < 0) a = -a
  return a
}

function arcSegmentToCubic(
  cx: number, cy: number,
  rx: number, ry: number,
  phi: number,
  theta1: number, theta2: number,
): CubicArc {
  const alpha = Math.sin(theta2 - theta1) * (Math.sqrt(4 + 3 * Math.tan((theta2 - theta1) / 2) ** 2) - 1) / 3
  const cosPhi = Math.cos(phi), sinPhi = Math.sin(phi)

  const cos1 = Math.cos(theta1), sin1 = Math.sin(theta1)
  const cos2 = Math.cos(theta2), sin2 = Math.sin(theta2)

  function ep(cosT: number, sinT: number): Vector2 {
    return new Vector2(
      cosPhi * rx * cosT - sinPhi * ry * sinT + cx,
      sinPhi * rx * cosT + cosPhi * ry * sinT + cy,
    )
  }
  function dp(cosT: number, sinT: number): Vector2 {
    return new Vector2(
      -cosPhi * rx * sinT - sinPhi * ry * cosT,
      -sinPhi * rx * sinT + cosPhi * ry * cosT,
    )
  }

  const p1 = ep(cos1, sin1)
  const p2 = ep(cos2, sin2)
  const d1 = dp(cos1, sin1)
  const d2 = dp(cos2, sin2)

  return {
    cp1: new Vector2(p1.x + alpha * d1.x, p1.y + alpha * d1.y),
    cp2: new Vector2(p2.x - alpha * d2.x, p2.y - alpha * d2.y),
    end: p2,
  }
}

// ---------------------------------------------------------------------------
// Points parser (polyline/polygon)
// ---------------------------------------------------------------------------

function parsePoints(str: string): Vector2[] {
  const nums = str.trim().split(/[\s,]+/).map(Number)
  const points: Vector2[] = []
  for (let i = 0; i + 1 < nums.length; i += 2) {
    points.push(new Vector2(nums[i], nums[i + 1]))
  }
  return points
}

// ---------------------------------------------------------------------------
// Attribute helpers
// ---------------------------------------------------------------------------

function num(el: Element, attr: string, fallback: number = 0): number {
  const v = el.getAttribute(attr)
  return v ? parseFloat(v) : fallback
}

function numAttr(el: Element, attr: string, fallback: number = 0): number {
  return num(el, attr, fallback)
}
