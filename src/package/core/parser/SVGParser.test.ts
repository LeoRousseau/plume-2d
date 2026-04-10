// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { parseSVG, parseSVGToNode, parsePathData } from './SVGParser'
import { Circle } from '../entity/Circle'
import { Ellipse } from '../entity/Ellipse'
import { Rectangle } from '../entity/Rectangle'
import { Polyline } from '../entity/Polyline'
import { Path } from '../entity/Path'
import { Text } from '../entity/Text'
import { Node } from '../base/Node'
import { Scene } from '../base/Scene'
import { View } from '../view/View'
import { SVGRenderer } from '../renderer/SVGRenderer'
import { Vector2 } from '../math/Vector2'

function svg(body: string, defs: string = ''): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`
}

describe('SVGParser', () => {
  // --- Individual elements ---

  it('parses a rect', () => {
    const scene = parseSVG(svg('<rect x="10" y="20" width="100" height="50" stroke="#f00" stroke-width="2" fill="#0f0" />'))
    const r = scene.root.children[0] as Rectangle
    expect(r).toBeInstanceOf(Rectangle)
    expect(r.origin.x).toBe(10)
    expect(r.origin.y).toBe(20)
    expect(r.width).toBe(100)
    expect(r.height).toBe(50)
    expect(r.stroke.color).toBe('#f00')
    expect(r.fill).toEqual({ type: 'solid', color: '#0f0' })
  })

  it('parses a circle', () => {
    const scene = parseSVG(svg('<circle cx="50" cy="60" r="30" stroke="#fff" stroke-width="1" fill="none" />'))
    const c = scene.root.children[0] as Circle
    expect(c).toBeInstanceOf(Circle)
    expect(c.center.x).toBe(50)
    expect(c.center.y).toBe(60)
    expect(c.radius).toBe(30)
    expect(c.fill).toBeNull()
  })

  it('parses an ellipse', () => {
    const scene = parseSVG(svg('<ellipse cx="40" cy="50" rx="30" ry="20" stroke="#000" stroke-width="1" fill="none" />'))
    const e = scene.root.children[0] as Ellipse
    expect(e).toBeInstanceOf(Ellipse)
    expect(e.center.x).toBe(40)
    expect(e.rx).toBe(30)
    expect(e.ry).toBe(20)
  })

  it('parses a line as Polyline', () => {
    const scene = parseSVG(svg('<line x1="0" y1="0" x2="100" y2="50" stroke="#000" stroke-width="1" fill="none" />'))
    const p = scene.root.children[0] as Polyline
    expect(p).toBeInstanceOf(Polyline)
    expect(p.points.length).toBe(2)
    expect(p.points[0].x).toBe(0)
    expect(p.points[1].x).toBe(100)
  })

  it('parses a polyline', () => {
    const scene = parseSVG(svg('<polyline points="10,20 30,40 50,60" stroke="#000" stroke-width="1" fill="none" />'))
    const p = scene.root.children[0] as Polyline
    expect(p).toBeInstanceOf(Polyline)
    expect(p.points.length).toBe(3)
    expect(p.isClosed).toBe(false)
  })

  it('parses a polygon as closed Polyline', () => {
    const scene = parseSVG(svg('<polygon points="0,0 100,0 100,100 0,100" stroke="#000" stroke-width="1" fill="#f00" />'))
    const p = scene.root.children[0] as Polyline
    expect(p).toBeInstanceOf(Polyline)
    expect(p.isClosed).toBe(true)
    expect(p.points.length).toBe(4)
  })

  it('parses a path', () => {
    const scene = parseSVG(svg('<path d="M 10 20 L 30 40 Q 50 10 70 30 Z" stroke="#000" stroke-width="1" fill="none" />'))
    const p = scene.root.children[0] as Path
    expect(p).toBeInstanceOf(Path)
    expect(p.segments.length).toBe(4) // moveTo, lineTo, quadraticTo, close
    expect(p.segments[0].type).toBe('moveTo')
    expect(p.segments[3].type).toBe('close')
  })

  it('parses text', () => {
    const scene = parseSVG(svg(
      '<text x="10" y="50" font-size="24" font-family="Arial" text-anchor="middle" dominant-baseline="central" fill="#fff">Hello</text>'
    ))
    const t = scene.root.children[0] as Text
    expect(t).toBeInstanceOf(Text)
    expect(t.content).toBe('Hello')
    expect(t.position.x).toBe(10)
    expect(t.fontSize).toBe(24)
    expect(t.fontFamily).toBe('Arial')
    expect(t.textAlign).toBe('center')
    expect(t.textBaseline).toBe('middle')
  })

  // --- Styles ---

  it('parses stroke styles', () => {
    const scene = parseSVG(svg(
      '<rect x="0" y="0" width="10" height="10" stroke="#f00" stroke-width="3" stroke-dasharray="5,3" stroke-linecap="round" stroke-linejoin="bevel" stroke-opacity="0.5" fill="none" />'
    ))
    const r = scene.root.children[0] as Rectangle
    expect(r.stroke.color).toBe('#f00')
    expect(r.stroke.width).toBe(3)
    expect(r.stroke.dashArray).toEqual([5, 3])
    expect(r.stroke.lineCap).toBe('round')
    expect(r.stroke.lineJoin).toBe('bevel')
    expect(r.stroke.opacity).toBe(0.5)
  })

  it('parses fill opacity', () => {
    const scene = parseSVG(svg('<circle cx="0" cy="0" r="10" stroke="#000" stroke-width="1" fill="#f00" fill-opacity="0.3" />'))
    const c = scene.root.children[0] as Circle
    expect(c.fill).toEqual({ type: 'solid', color: '#f00', opacity: 0.3 })
  })

  // --- Gradients ---

  it('parses linear gradient', () => {
    const defs = '<linearGradient id="g0" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f00" /><stop offset="1" stop-color="#00f" /></linearGradient>'
    const scene = parseSVG(svg('<rect x="0" y="0" width="100" height="50" stroke="#000" stroke-width="1" fill="url(#g0)" />', defs))
    const r = scene.root.children[0] as Rectangle
    expect(r.fill!.type).toBe('linear-gradient')
    if (r.fill!.type === 'linear-gradient') {
      expect(r.fill!.start.x).toBe(0)
      expect(r.fill!.end.x).toBe(100)
      expect(r.fill!.stops.length).toBe(2)
    }
  })

  it('parses radial gradient', () => {
    const defs = '<radialGradient id="g0" cx="50" cy="50" r="40" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" /><stop offset="1" stop-color="#000" /></radialGradient>'
    const scene = parseSVG(svg('<circle cx="50" cy="50" r="40" stroke="#000" stroke-width="1" fill="url(#g0)" />', defs))
    const c = scene.root.children[0] as Circle
    expect(c.fill!.type).toBe('radial-gradient')
    if (c.fill!.type === 'radial-gradient') {
      expect(c.fill!.center.x).toBe(50)
      expect(c.fill!.radius).toBe(40)
    }
  })

  // --- Transforms ---

  it('parses translate transform', () => {
    const scene = parseSVG(svg('<rect x="0" y="0" width="10" height="10" transform="translate(50,30)" stroke="#000" stroke-width="1" fill="none" />'))
    const r = scene.root.children[0] as Rectangle
    expect(r.transform.position.x).toBe(50)
    expect(r.transform.position.y).toBe(30)
  })

  it('parses combined transform', () => {
    const scene = parseSVG(svg('<rect x="0" y="0" width="10" height="10" transform="translate(10,20) rotate(45) scale(2,3)" stroke="#000" stroke-width="1" fill="none" />'))
    const r = scene.root.children[0] as Rectangle
    expect(r.transform.position.x).toBe(10)
    expect(r.transform.position.y).toBe(20)
    expect(r.transform.rotation).toBeCloseTo(45 * Math.PI / 180)
    expect(r.transform.scale.x).toBe(2)
    expect(r.transform.scale.y).toBe(3)
  })

  // --- Group flattening ---

  it('flattens single-child group', () => {
    const scene = parseSVG(svg('<g transform="translate(10,20)"><circle cx="0" cy="0" r="5" stroke="#000" stroke-width="1" fill="none" /></g>'))
    const c = scene.root.children[0] as Circle
    expect(c).toBeInstanceOf(Circle)
    expect(c.transform.position.x).toBe(10)
    expect(c.transform.position.y).toBe(20)
  })

  it('keeps multi-child group as Node', () => {
    const scene = parseSVG(svg(
      '<g transform="translate(10,0)">' +
      '<circle cx="0" cy="0" r="5" stroke="#000" stroke-width="1" fill="none" />' +
      '<rect x="0" y="0" width="10" height="10" stroke="#000" stroke-width="1" fill="none" />' +
      '</g>'
    ))
    const group = scene.root.children[0]
    expect(group).toBeInstanceOf(Node)
    expect(group.children.length).toBe(2)
    expect(group.children[0]).toBeInstanceOf(Circle)
    expect(group.children[1]).toBeInstanceOf(Rectangle)
  })

  // --- Visibility ---

  it('sets visible false for hidden elements', () => {
    const scene = parseSVG(svg('<circle cx="0" cy="0" r="5" visibility="hidden" stroke="#000" stroke-width="1" fill="none" />'))
    expect(scene.root.children[0].visible).toBe(false)
  })

  it('sets visible false for display:none elements', () => {
    const scene = parseSVG(svg('<circle cx="0" cy="0" r="5" display="none" stroke="#000" stroke-width="1" fill="none" />'))
    expect(scene.root.children[0].visible).toBe(false)
  })

  // --- parseSVGToNode ---

  it('parseSVGToNode returns a Node', () => {
    const node = parseSVGToNode(svg('<circle cx="0" cy="0" r="5" stroke="#000" stroke-width="1" fill="none" />'))
    expect(node).toBeInstanceOf(Node)
    expect(node.children[0]).toBeInstanceOf(Circle)
  })

  // --- Error handling ---

  it('throws on invalid SVG', () => {
    expect(() => parseSVG('<not valid xml')).toThrow()
  })

  // --- Path data parsing ---

  describe('parsePathData', () => {
    it('parses M L Z', () => {
      const segs = parsePathData('M 10 20 L 30 40 Z')
      expect(segs.length).toBe(3)
      expect(segs[0]).toEqual({ type: 'moveTo', point: new Vector2(10, 20) })
      expect(segs[1]).toEqual({ type: 'lineTo', point: new Vector2(30, 40) })
      expect(segs[2]).toEqual({ type: 'close' })
    })

    it('parses relative commands', () => {
      const segs = parsePathData('M 10 20 l 5 10')
      expect(segs[1]).toEqual({ type: 'lineTo', point: new Vector2(15, 30) })
    })

    it('parses H and V', () => {
      const segs = parsePathData('M 0 0 H 50 V 30')
      expect(segs[1]).toEqual({ type: 'lineTo', point: new Vector2(50, 0) })
      expect(segs[2]).toEqual({ type: 'lineTo', point: new Vector2(50, 30) })
    })

    it('parses Q (quadratic)', () => {
      const segs = parsePathData('M 0 0 Q 10 20 30 40')
      expect(segs[1].type).toBe('quadraticTo')
      if (segs[1].type === 'quadraticTo') {
        expect(segs[1].control).toEqual(new Vector2(10, 20))
        expect(segs[1].point).toEqual(new Vector2(30, 40))
      }
    })

    it('parses C (cubic)', () => {
      const segs = parsePathData('M 0 0 C 10 20 30 40 50 60')
      expect(segs[1].type).toBe('cubicTo')
      if (segs[1].type === 'cubicTo') {
        expect(segs[1].control1).toEqual(new Vector2(10, 20))
        expect(segs[1].control2).toEqual(new Vector2(30, 40))
        expect(segs[1].point).toEqual(new Vector2(50, 60))
      }
    })

    it('parses S (smooth cubic)', () => {
      const segs = parsePathData('M 0 0 C 10 20 30 40 50 50 S 80 90 100 100')
      expect(segs.length).toBe(3)
      expect(segs[2].type).toBe('cubicTo')
      if (segs[2].type === 'cubicTo') {
        // Reflected control: 2*50 - 30 = 70, 2*50 - 40 = 60
        expect(segs[2].control1.x).toBeCloseTo(70)
        expect(segs[2].control1.y).toBeCloseTo(60)
      }
    })

    it('parses T (smooth quadratic)', () => {
      const segs = parsePathData('M 0 0 Q 10 20 30 30 T 60 60')
      expect(segs.length).toBe(3)
      expect(segs[2].type).toBe('quadraticTo')
      if (segs[2].type === 'quadraticTo') {
        // Reflected control: 2*30 - 10 = 50, 2*30 - 20 = 40
        expect(segs[2].control.x).toBeCloseTo(50)
        expect(segs[2].control.y).toBeCloseTo(40)
      }
    })

    it('parses A (arc) as cubic beziers', () => {
      const segs = parsePathData('M 0 0 A 25 25 0 0 1 50 0')
      expect(segs.length).toBeGreaterThanOrEqual(2) // moveTo + at least one cubicTo
      expect(segs[segs.length - 1].type).toBe('cubicTo')
    })

    it('handles compact path notation', () => {
      const segs = parsePathData('M10,20L30,40')
      expect(segs[0]).toEqual({ type: 'moveTo', point: new Vector2(10, 20) })
      expect(segs[1]).toEqual({ type: 'lineTo', point: new Vector2(30, 40) })
    })

    it('handles implicit lineTo after moveTo', () => {
      const segs = parsePathData('M 0 0 10 20 30 40')
      expect(segs.length).toBe(3)
      expect(segs[1].type).toBe('lineTo')
      expect(segs[2].type).toBe('lineTo')
    })
  })

  // --- Round-trip ---

  it('round-trips a scene through SVGRenderer → parseSVG', () => {
    const scene = new Scene()
    const c = new Circle(new Vector2(50, 50), 30)
    c.stroke = { color: '#ff0000', width: 2 }
    c.fill = { type: 'solid', color: '#00ff00' }
    scene.root.addChild(c)

    const r = new Rectangle(new Vector2(10, 20), 80, 40)
    r.stroke = { color: '#0000ff', width: 1 }
    r.fill = null
    scene.root.addChild(r)

    const view = new View(200, 200)
    const svgRenderer = new SVGRenderer(200, 200)
    svgRenderer.render(scene, view)

    const parsed = parseSVG(svgRenderer.svg)
    expect(parsed.root.children.length).toBe(2)
    expect(parsed.root.children[0]).toBeInstanceOf(Circle)
    expect(parsed.root.children[1]).toBeInstanceOf(Rectangle)

    const pc = parsed.root.children[0] as Circle
    expect(pc.center.x).toBe(50)
    expect(pc.center.y).toBe(50)
    expect(pc.radius).toBe(30)
    expect(pc.stroke.color).toBe('#ff0000')

    const pr = parsed.root.children[1] as Rectangle
    expect(pr.origin.x).toBe(10)
    expect(pr.origin.y).toBe(20)
    expect(pr.width).toBe(80)
    expect(pr.height).toBe(40)
  })
})
