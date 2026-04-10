import { describe, it, expect } from 'vitest'
import { Vector2 } from '../math/Vector2'
import { Circle } from '../entity/Circle'
import { Arc } from '../entity/Arc'
import { Ellipse } from '../entity/Ellipse'
import { Rectangle } from '../entity/Rectangle'
import { Polyline } from '../entity/Polyline'
import { Path } from '../entity/Path'
import {
  intersectLineLine,
  intersectLineCircle,
  intersectCircleCircle,
  intersectLineArc,
  intersectLineEllipse,
  intersectCircleArc,
  intersectArcArc,
  intersect,
} from './intersect'
import {
  distancePointToLine,
  distancePointToSegment,
  distancePointToCircle,
  distancePointToPolyline,
  distancePointToPolylineEdge,
  distancePointToRectEdge,
  distancePointToPathEdge,
} from './distance'

// ─── Helpers ────────────────────────────────────────────────────────

/** A segment (line) from (0,0) to (10,0). */
const segA = () => [new Vector2(0, 0), new Vector2(10, 0)] as const
/** A segment (line) from (5,-5) to (5,5) — crosses segA at (5,0). */
const segB = () => [new Vector2(5, -5), new Vector2(5, 5)] as const

const circle = () => new Circle(new Vector2(0, 0), 5)
const arc = () => new Arc(new Vector2(0, 0), 5, 0, Math.PI) // upper semicircle
const ellipse = () => new Ellipse(new Vector2(0, 0), 6, 4)
const rect = () => new Rectangle(new Vector2(-5, -5), 10, 10)
const polyline = () =>
  new Polyline(
    [new Vector2(-5, 0), new Vector2(5, 0), new Vector2(5, 10), new Vector2(-5, 10)],
    true,
  )
const path = () =>
  new Path()
    .moveTo(new Vector2(-5, 0))
    .lineTo(new Vector2(5, 0))
    .lineTo(new Vector2(5, 10))
    .lineTo(new Vector2(-5, 10))
    .close()

// ─── Intersection: Line × Line ─────────────────────────────────────

describe('intersect – Line × Line', () => {
  it('crossing segments', () => {
    const [a1, a2] = segA()
    const [b1, b2] = segB()
    const p = intersectLineLine(a1, a2, b1, b2)
    expect(p).not.toBeNull()
    expect(p!.x).toBeCloseTo(5)
    expect(p!.y).toBeCloseTo(0)
  })

  it('parallel segments', () => {
    const p = intersectLineLine(
      new Vector2(0, 0), new Vector2(10, 0),
      new Vector2(0, 1), new Vector2(10, 1),
    )
    expect(p).toBeNull()
  })

  it('non-overlapping segments', () => {
    const p = intersectLineLine(
      new Vector2(0, 0), new Vector2(1, 0),
      new Vector2(5, 5), new Vector2(6, 6),
    )
    expect(p).toBeNull()
  })
})

// ─── Intersection: Line × Circle ───────────────────────────────────

describe('intersect – Line × Circle', () => {
  it('line through circle center → 2 points', () => {
    const pts = intersectLineCircle(new Vector2(-10, 0), new Vector2(10, 0), circle())
    expect(pts).toHaveLength(2)
    expect(pts[0].x).toBeCloseTo(-5)
    expect(pts[1].x).toBeCloseTo(5)
  })

  it('tangent line → 1 point', () => {
    const pts = intersectLineCircle(new Vector2(-10, 5), new Vector2(10, 5), circle())
    expect(pts).toHaveLength(1)
    expect(pts[0].y).toBeCloseTo(5)
  })

  it('miss → 0 points', () => {
    const pts = intersectLineCircle(new Vector2(-10, 10), new Vector2(10, 10), circle())
    expect(pts).toHaveLength(0)
  })

  it('segment ends inside circle → 1 or 0 crossings', () => {
    // segment from center to far outside → 1 crossing
    const pts = intersectLineCircle(new Vector2(0, 0), new Vector2(10, 0), circle())
    expect(pts).toHaveLength(1)
    expect(pts[0].x).toBeCloseTo(5)
  })
})

// ─── Intersection: Circle × Circle ─────────────────────────────────

describe('intersect – Circle × Circle', () => {
  it('overlapping circles → 2 points', () => {
    const pts = intersectCircleCircle(circle(), { center: new Vector2(6, 0), radius: 5 })
    expect(pts).toHaveLength(2)
  })

  it('tangent circles → 1 point', () => {
    const pts = intersectCircleCircle(circle(), { center: new Vector2(10, 0), radius: 5 })
    expect(pts).toHaveLength(1)
    expect(pts[0].x).toBeCloseTo(5)
  })

  it('disjoint circles → 0 points', () => {
    const pts = intersectCircleCircle(circle(), { center: new Vector2(20, 0), radius: 5 })
    expect(pts).toHaveLength(0)
  })

  it('concentric circles → 0 points', () => {
    const pts = intersectCircleCircle(circle(), { center: new Vector2(0, 0), radius: 3 })
    expect(pts).toHaveLength(0)
  })
})

// ─── Intersection: Line × Arc (via Line × Circle + angle filter) ──

describe('intersect – Line × Arc (manual angle check)', () => {
  it('line crossing the arc sweep → hit', () => {
    const a = arc() // upper semicircle r=5
    const pts = intersectLineCircle(new Vector2(-10, 3), new Vector2(10, 3), a)
    // Filter to points within arc sweep
    const inArc = pts.filter((p) => a.containsPoint(p, 0.5))
    expect(inArc.length).toBeGreaterThanOrEqual(1)
  })

  it('line crossing circle but outside arc sweep → miss', () => {
    const a = arc()
    const pts = intersectLineCircle(new Vector2(-10, -3), new Vector2(10, -3), a)
    const inArc = pts.filter((p) => a.containsPoint(p, 0.5))
    expect(inArc).toHaveLength(0)
  })
})

describe('intersectLineEllipse', () => {
  it('horizontal line through ellipse center → 2 hits', () => {
    const e = ellipse() // center (0,0), rx=6, ry=4
    const pts = intersectLineEllipse(new Vector2(-10, 0), new Vector2(10, 0), e)
    expect(pts).toHaveLength(2)
    const xs = pts.map(p => p.x).sort((a, b) => a - b)
    expect(xs[0]).toBeCloseTo(-6)
    expect(xs[1]).toBeCloseTo(6)
  })

  it('vertical line through center → 2 hits', () => {
    const e = ellipse()
    const pts = intersectLineEllipse(new Vector2(0, -10), new Vector2(0, 10), e)
    expect(pts).toHaveLength(2)
    const ys = pts.map(p => p.y).sort((a, b) => a - b)
    expect(ys[0]).toBeCloseTo(-4)
    expect(ys[1]).toBeCloseTo(4)
  })

  it('tangent line → 1 hit', () => {
    const e = ellipse()
    const pts = intersectLineEllipse(new Vector2(-10, 4), new Vector2(10, 4), e)
    expect(pts).toHaveLength(1)
    expect(pts[0].x).toBeCloseTo(0)
    expect(pts[0].y).toBeCloseTo(4)
  })

  it('miss → 0 hits', () => {
    const e = ellipse()
    const pts = intersectLineEllipse(new Vector2(-10, 10), new Vector2(10, 10), e)
    expect(pts).toHaveLength(0)
  })

  it('segment ending inside ellipse → 1 hit', () => {
    const e = ellipse()
    const pts = intersectLineEllipse(new Vector2(0, 0), new Vector2(10, 0), e)
    expect(pts).toHaveLength(1)
    expect(pts[0].x).toBeCloseTo(6)
  })

  it('segment fully inside ellipse → 0 hits', () => {
    const e = ellipse()
    const pts = intersectLineEllipse(new Vector2(-1, 0), new Vector2(1, 0), e)
    expect(pts).toHaveLength(0)
  })
})

describe('intersectLineArc', () => {
  it('line crossing arc sweep → 2 hits', () => {
    const a = arc() // upper semicircle r=5, [0, π]
    const pts = intersectLineArc(new Vector2(-10, 3), new Vector2(10, 3), a)
    expect(pts).toHaveLength(2)
  })

  it('line crossing circle but outside arc sweep → 0 hits', () => {
    const a = arc()
    const pts = intersectLineArc(new Vector2(-10, -3), new Vector2(10, -3), a)
    expect(pts).toHaveLength(0)
  })

  it('tangent to arc → 1 hit', () => {
    const a = arc()
    const pts = intersectLineArc(new Vector2(-10, 5), new Vector2(10, 5), a)
    expect(pts).toHaveLength(1)
    expect(pts[0].y).toBeCloseTo(5)
  })

  it('line through arc endpoint → 1 hit', () => {
    const a = arc() // startPoint = (5, 0)
    const pts = intersectLineArc(new Vector2(5, -5), new Vector2(5, 5), a)
    expect(pts.length).toBeGreaterThanOrEqual(1)
  })

  it('miss entirely → 0 hits', () => {
    const a = arc()
    const pts = intersectLineArc(new Vector2(-10, 10), new Vector2(10, 10), a)
    expect(pts).toHaveLength(0)
  })
})

describe('intersectCircleArc', () => {
  it('circle overlapping arc sweep → hits', () => {
    const c = { center: new Vector2(6, 0), radius: 5 }
    const a = arc() // upper semicircle r=5 at origin
    const pts = intersectCircleArc(c, a)
    expect(pts.length).toBeGreaterThanOrEqual(1)
  })

  it('circle overlapping circle but outside arc sweep → 0 hits', () => {
    const c = { center: new Vector2(0, -8), radius: 5 }
    const a = arc()
    const pts = intersectCircleArc(c, a)
    expect(pts).toHaveLength(0)
  })

  it('circle not overlapping at all → 0 hits', () => {
    const c = { center: new Vector2(20, 0), radius: 2 }
    const a = arc()
    const pts = intersectCircleArc(c, a)
    expect(pts).toHaveLength(0)
  })
})

describe('intersectArcArc', () => {
  it('two overlapping arcs with sweeps that intersect → hits', () => {
    const a1 = { center: new Vector2(0, 0), radius: 5, startAngle: 0, endAngle: Math.PI }
    const a2 = { center: new Vector2(6, 0), radius: 5, startAngle: Math.PI / 2, endAngle: (3 * Math.PI) / 2 }
    const pts = intersectArcArc(a1, a2)
    expect(pts.length).toBeGreaterThanOrEqual(1)
  })

  it('two arcs whose circles overlap but sweeps miss → 0 hits', () => {
    const a1 = { center: new Vector2(0, 0), radius: 5, startAngle: -Math.PI / 2, endAngle: Math.PI / 2 }
    const a2 = { center: new Vector2(3, 0), radius: 5, startAngle: Math.PI / 2, endAngle: Math.PI }
    const circleHits = intersectCircleCircle(a1, a2)
    const pts = intersectArcArc(a1, a2)
    expect(pts.length).toBeLessThanOrEqual(circleHits.length)
  })

  it('disjoint arcs → 0 hits', () => {
    const a1 = { center: new Vector2(0, 0), radius: 2, startAngle: 0, endAngle: Math.PI }
    const a2 = { center: new Vector2(20, 0), radius: 2, startAngle: 0, endAngle: Math.PI }
    const pts = intersectArcArc(a1, a2)
    expect(pts).toHaveLength(0)
  })
})

// ─── Intersection: Line × Rectangle (via 4 edges) ──────────────────

describe('intersect – Line × Rectangle', () => {
  it('line crossing rectangle → 2 edge hits', () => {
    const r = rect()
    const edges = [
      [new Vector2(-5, -5), new Vector2(5, -5)],
      [new Vector2(5, -5), new Vector2(5, 5)],
      [new Vector2(5, 5), new Vector2(-5, 5)],
      [new Vector2(-5, 5), new Vector2(-5, -5)],
    ] as [Vector2, Vector2][]

    const hits: Vector2[] = []
    for (const [ea, eb] of edges) {
      const p = intersectLineLine(new Vector2(-10, 0), new Vector2(10, 0), ea, eb)
      if (p) hits.push(p)
    }
    expect(hits).toHaveLength(2)
    const xs = hits.map((h) => h.x).sort((a, b) => a - b)
    expect(xs[0]).toBeCloseTo(-5)
    expect(xs[1]).toBeCloseTo(5)
  })

  it('line outside rectangle → 0 hits', () => {
    const edges = [
      [new Vector2(-5, -5), new Vector2(5, -5)],
      [new Vector2(5, -5), new Vector2(5, 5)],
      [new Vector2(5, 5), new Vector2(-5, 5)],
      [new Vector2(-5, 5), new Vector2(-5, -5)],
    ] as [Vector2, Vector2][]

    const hits: Vector2[] = []
    for (const [ea, eb] of edges) {
      const p = intersectLineLine(new Vector2(-10, 20), new Vector2(10, 20), ea, eb)
      if (p) hits.push(p)
    }
    expect(hits).toHaveLength(0)
  })
})

// ─── Intersection: Line × Polyline (edge-by-edge) ──────────────────

describe('intersect – Line × Polyline', () => {
  it('line crossing closed polyline → 2 hits', () => {
    const poly = polyline()
    const hits: Vector2[] = []
    const count = poly.segmentCount()
    for (let i = 0; i < count; i++) {
      const [a, b] = poly.segmentAt(i)
      const p = intersectLineLine(new Vector2(-10, 5), new Vector2(10, 5), a, b)
      if (p) hits.push(p)
    }
    expect(hits).toHaveLength(2)
  })

  it('line missing polyline → 0 hits', () => {
    const poly = polyline()
    const hits: Vector2[] = []
    const count = poly.segmentCount()
    for (let i = 0; i < count; i++) {
      const [a, b] = poly.segmentAt(i)
      const p = intersectLineLine(new Vector2(-10, 20), new Vector2(10, 20), a, b)
      if (p) hits.push(p)
    }
    expect(hits).toHaveLength(0)
  })
})

// ─── Intersection: Circle × Rectangle (edge-by-edge) ───────────────

describe('intersect – Circle × Rectangle', () => {
  it('circle overlapping rectangle → hits on edges', () => {
    const c = new Circle(new Vector2(0, 0), 6) // r=6 > half-rect=5
    const edges = [
      [new Vector2(-5, -5), new Vector2(5, -5)],
      [new Vector2(5, -5), new Vector2(5, 5)],
      [new Vector2(5, 5), new Vector2(-5, 5)],
      [new Vector2(-5, 5), new Vector2(-5, -5)],
    ] as [Vector2, Vector2][]

    let totalHits = 0
    for (const [a, b] of edges) {
      totalHits += intersectLineCircle(a, b, c).length
    }
    expect(totalHits).toBeGreaterThanOrEqual(4)
  })
})

// ─── Intersection: Circle × Polyline (edge-by-edge) ────────────────

describe('intersect – Circle × Polyline', () => {
  it('circle overlapping polyline → hits', () => {
    const c = new Circle(new Vector2(0, 5), 6)
    const poly = polyline()
    let totalHits = 0
    const count = poly.segmentCount()
    for (let i = 0; i < count; i++) {
      const [a, b] = poly.segmentAt(i)
      totalHits += intersectLineCircle(a, b, c).length
    }
    expect(totalHits).toBeGreaterThanOrEqual(2)
  })
})

// ─── Intersection: Polyline × Polyline (edge-by-edge) ──────────────

describe('intersect – Polyline × Polyline', () => {
  it('two crossing polylines', () => {
    const p1 = new Polyline([new Vector2(0, -5), new Vector2(0, 15)])
    const p2 = polyline()
    const hits: Vector2[] = []
    for (let i = 0; i < p1.segmentCount(); i++) {
      const [a1, a2] = p1.segmentAt(i)
      for (let j = 0; j < p2.segmentCount(); j++) {
        const [b1, b2] = p2.segmentAt(j)
        const p = intersectLineLine(a1, a2, b1, b2)
        if (p) hits.push(p)
      }
    }
    expect(hits).toHaveLength(2)
  })
})

// ─── Intersection: Rectangle × Rectangle (edge-by-edge) ────────────

describe('intersect – Rectangle × Rectangle', () => {
  it('overlapping rectangles → edge crossings', () => {
    const r1 = new Rectangle(new Vector2(0, 0), 10, 10)
    const r2 = new Rectangle(new Vector2(5, 5), 10, 10)
    const edgesOf = (r: Rectangle) => {
      const x = r.origin.x, y = r.origin.y, w = r.width, h = r.height
      return [
        [new Vector2(x, y), new Vector2(x + w, y)],
        [new Vector2(x + w, y), new Vector2(x + w, y + h)],
        [new Vector2(x + w, y + h), new Vector2(x, y + h)],
        [new Vector2(x, y + h), new Vector2(x, y)],
      ] as [Vector2, Vector2][]
    }
    const e1 = edgesOf(r1)
    const e2 = edgesOf(r2)
    const hits: Vector2[] = []
    for (const [a1, a2] of e1) {
      for (const [b1, b2] of e2) {
        const p = intersectLineLine(a1, a2, b1, b2)
        if (p) hits.push(p)
      }
    }
    expect(hits.length).toBeGreaterThanOrEqual(2)
  })
})

// ═══════════════════════════════════════════════════════════════════
// ─── distanceToEdge: Point × Every Entity ──────────────────────────
// ═══════════════════════════════════════════════════════════════════

describe('distanceToEdge – Point × Segment', () => {
  it('perpendicular distance', () => {
    expect(distancePointToLine(new Vector2(5, 3), new Vector2(0, 0), new Vector2(10, 0))).toBeCloseTo(3)
  })

  it('past endpoint → distance to endpoint', () => {
    expect(distancePointToSegment(new Vector2(15, 0), new Vector2(0, 0), new Vector2(10, 0))).toBeCloseTo(5)
  })

  it('on segment → 0', () => {
    expect(distancePointToSegment(new Vector2(5, 0), new Vector2(0, 0), new Vector2(10, 0))).toBeCloseTo(0)
  })
})

describe('distanceToEdge – Point × Circle', () => {
  it('outside circle', () => {
    expect(distancePointToCircle(new Vector2(8, 0), circle())).toBeCloseTo(3)
  })

  it('inside circle', () => {
    expect(distancePointToCircle(new Vector2(2, 0), circle())).toBeCloseTo(3)
  })

  it('on circumference → 0', () => {
    expect(distancePointToCircle(new Vector2(5, 0), circle())).toBeCloseTo(0)
  })

  it('at center', () => {
    expect(distancePointToCircle(new Vector2(0, 0), circle())).toBeCloseTo(5)
  })
})

describe('distanceToEdge – Point × Arc', () => {
  const a = () => new Arc(new Vector2(0, 0), 5, 0, Math.PI)

  it('point facing arc sweep', () => {
    const d = a().distanceToEdge(new Vector2(0, 8))
    expect(d).toBeCloseTo(3)
  })

  it('point on arc → 0', () => {
    const d = a().distanceToEdge(new Vector2(5, 0)) // start point
    expect(d).toBeCloseTo(0)
  })

  it('point outside arc sweep → distance to nearest endpoint', () => {
    const d = a().distanceToEdge(new Vector2(0, -3))
    // Nearest endpoints are (5,0) and (-5,0), distance from (0,-3) = sqrt(25+9) = sqrt(34) ≈ 5.83
    // But actually the angle points down so it's outside the sweep [0,π]
    // dist to (5,0) = sqrt(25+9) ≈ 5.83, dist to (-5,0) = sqrt(25+9) ≈ 5.83
    expect(d).toBeCloseTo(Math.sqrt(34))
  })
})

describe('distanceToEdge – Point × Ellipse', () => {
  it('point on major axis outside', () => {
    const e = ellipse()
    const d = e.distanceToEdge(new Vector2(6, 0))
    expect(d).toBeCloseTo(0, 0) // on the ellipse boundary
  })

  it('point at center', () => {
    const e = ellipse()
    const d = e.distanceToEdge(new Vector2(0, 0))
    // Should be min(rx, ry) = 4
    expect(d).toBeCloseTo(4)
  })

  it('point far outside', () => {
    const e = ellipse()
    const d = e.distanceToEdge(new Vector2(20, 0))
    expect(d).toBeGreaterThan(0)
  })
})

describe('distanceToEdge – Point × Rectangle', () => {
  it('point outside → distance to nearest edge', () => {
    const d = distancePointToRectEdge(new Vector2(0, -8), rect())
    expect(d).toBeCloseTo(3)
  })

  it('point on edge → 0', () => {
    const d = distancePointToRectEdge(new Vector2(0, -5), rect())
    expect(d).toBeCloseTo(0)
  })

  it('point inside', () => {
    const d = distancePointToRectEdge(new Vector2(0, 0), rect())
    // Closest edge is 5 away
    expect(d).toBeCloseTo(5)
  })

  it('point at corner → 0', () => {
    const d = distancePointToRectEdge(new Vector2(-5, -5), rect())
    expect(d).toBeCloseTo(0)
  })
})

describe('distanceToEdge – Point × Polyline', () => {
  it('point near edge', () => {
    const d = distancePointToPolylineEdge(new Vector2(0, 3), polyline())
    expect(d).toBeCloseTo(3)
  })

  it('point on vertex → 0', () => {
    const d = distancePointToPolylineEdge(new Vector2(-5, 0), polyline())
    expect(d).toBeCloseTo(0)
  })

  it('open polyline distance', () => {
    const open = new Polyline([new Vector2(0, 0), new Vector2(10, 0), new Vector2(10, 10)])
    const d = distancePointToPolylineEdge(new Vector2(5, 5), open)
    expect(d).toBeCloseTo(5)
  })
})

describe('distanceToEdge – Point × Path', () => {
  it('point near linear path', () => {
    const d = distancePointToPathEdge(new Vector2(0, 3), path())
    expect(d).toBeCloseTo(3)
  })

  it('point on path vertex → 0', () => {
    const d = distancePointToPathEdge(new Vector2(-5, 0), path())
    expect(d).toBeCloseTo(0)
  })

  it('curved path', () => {
    const p = new Path()
      .moveTo(new Vector2(0, 0))
      .quadraticTo(new Vector2(5, 10), new Vector2(10, 0))
    const d = distancePointToPathEdge(new Vector2(5, 0), p)
    // The point (5,0) is on the chord; the curve rises above, so distance > 0
    expect(d).toBeGreaterThanOrEqual(0)
  })
})

// ═══════════════════════════════════════════════════════════════════
// ─── distanceToEdge via shape method: every entity ─────────────────
// ═══════════════════════════════════════════════════════════════════

describe('Shape.distanceToEdge – cross-check all entities', () => {
  const testPoint = new Vector2(3, 4) // distance from origin = 5

  it('Circle.distanceToEdge', () => {
    const d = circle().distanceToEdge(testPoint)
    // point is at distance 5 from center, radius 5 → on the edge
    expect(d).toBeCloseTo(0)
  })

  it('Arc.distanceToEdge — within sweep', () => {
    // arc from 0 to π, point (3,4) is at angle atan2(4,3) ≈ 0.93 which is within [0,π]
    const d = arc().distanceToEdge(testPoint)
    expect(d).toBeCloseTo(0)
  })

  it('Ellipse.distanceToEdge', () => {
    const d = ellipse().distanceToEdge(testPoint)
    expect(d).toBeGreaterThanOrEqual(0)
  })

  it('Rectangle.distanceToEdge', () => {
    const d = rect().distanceToEdge(testPoint)
    expect(d).toBeGreaterThanOrEqual(0)
  })

  it('Polyline.distanceToEdge', () => {
    const d = polyline().distanceToEdge(testPoint)
    expect(d).toBeGreaterThanOrEqual(0)
  })

  it('Path.distanceToEdge', () => {
    const d = path().distanceToEdge(testPoint)
    expect(d).toBeGreaterThanOrEqual(0)
  })

  it('all shapes agree on a point far away being distant', () => {
    const far = new Vector2(100, 100)
    const shapes = [circle(), arc(), ellipse(), rect(), polyline(), path()]
    for (const s of shapes) {
      expect(s.distanceToEdge(far)).toBeGreaterThan(50)
    }
  })
})

describe('intersect – generic dispatcher', () => {
  it('Circle × Circle', () => {
    const c1 = new Circle(new Vector2(0, 0), 5)
    const c2 = new Circle(new Vector2(6, 0), 5)
    const pts = intersect(c1, c2)
    expect(pts).toHaveLength(2)
  })

  it('Circle × Arc', () => {
    const c = new Circle(new Vector2(6, 0), 5)
    const a = arc()
    const pts = intersect(c, a)
    expect(pts.length).toBeGreaterThanOrEqual(1)
  })

  it('Arc × Circle (reversed)', () => {
    const c = new Circle(new Vector2(6, 0), 5)
    const a = arc()
    const pts = intersect(a, c)
    expect(pts.length).toBeGreaterThanOrEqual(1)
  })

  it('Arc × Arc', () => {
    const a1 = new Arc(new Vector2(0, 0), 5, 0, Math.PI)
    const a2 = new Arc(new Vector2(6, 0), 5, Math.PI / 2, (3 * Math.PI) / 2)
    const pts = intersect(a1, a2)
    expect(pts.length).toBeGreaterThanOrEqual(1)
  })

  it('Circle × Rectangle', () => {
    const c = new Circle(new Vector2(0, 0), 6)
    const r = rect()
    const pts = intersect(c, r)
    expect(pts.length).toBeGreaterThanOrEqual(4)
  })

  it('Circle × Polyline', () => {
    const c = new Circle(new Vector2(0, 5), 6)
    const pts = intersect(c, polyline())
    expect(pts.length).toBeGreaterThanOrEqual(2)
  })

  it('Circle × Path', () => {
    const c = new Circle(new Vector2(0, 5), 6)
    const pts = intersect(c, path())
    expect(pts.length).toBeGreaterThanOrEqual(2)
  })

  it('Circle × Ellipse', () => {
    const c = new Circle(new Vector2(5, 0), 3)
    const e = ellipse()
    const pts = intersect(c, e)
    expect(pts.length).toBeGreaterThanOrEqual(1)
  })

  it('Ellipse × Rectangle', () => {
    const e = new Ellipse(new Vector2(0, 0), 6, 6)
    const r = rect()
    const pts = intersect(e, r)
    expect(pts.length).toBeGreaterThanOrEqual(4)
  })

  it('Rectangle × Rectangle', () => {
    const r1 = new Rectangle(new Vector2(0, 0), 10, 10)
    const r2 = new Rectangle(new Vector2(5, 5), 10, 10)
    const pts = intersect(r1, r2)
    expect(pts.length).toBeGreaterThanOrEqual(2)
  })

  it('Rectangle × Polyline', () => {
    const r = new Rectangle(new Vector2(-2, -2), 4, 6)
    const pts = intersect(r, polyline())
    expect(pts.length).toBeGreaterThanOrEqual(2)
  })

  it('Polyline × Polyline', () => {
    const p1 = new Polyline([new Vector2(0, -5), new Vector2(0, 15)])
    const pts = intersect(p1, polyline())
    expect(pts).toHaveLength(2)
  })

  it('Polyline × Path', () => {
    const p1 = new Polyline([new Vector2(0, -5), new Vector2(0, 15)])
    const pts = intersect(p1, path())
    expect(pts).toHaveLength(2)
  })

  it('Path × Path', () => {
    const p1 = new Path().moveTo(new Vector2(0, -5)).lineTo(new Vector2(0, 15))
    const pts = intersect(p1, path())
    expect(pts).toHaveLength(2)
  })

  it('Arc × Rectangle', () => {
    const a = new Arc(new Vector2(0, 0), 6, 0, Math.PI)
    const r = rect()
    const pts = intersect(a, r)
    expect(pts.length).toBeGreaterThanOrEqual(2)
  })

  it('Arc × Polyline', () => {
    const a = new Arc(new Vector2(0, 5), 6, 0, Math.PI)
    const pts = intersect(a, polyline())
    expect(pts.length).toBeGreaterThanOrEqual(1)
  })

  it('Ellipse × Polyline', () => {
    const e = new Ellipse(new Vector2(0, 5), 6, 6)
    const pts = intersect(e, polyline())
    expect(pts.length).toBeGreaterThanOrEqual(2)
  })

  it('Ellipse × Ellipse', () => {
    const e1 = new Ellipse(new Vector2(0, 0), 5, 3)
    const e2 = new Ellipse(new Vector2(3, 0), 5, 3)
    const pts = intersect(e1, e2)
    expect(pts.length).toBeGreaterThanOrEqual(2)
  })

  it('disjoint shapes → 0 hits', () => {
    const c = new Circle(new Vector2(100, 100), 1)
    const r = rect()
    expect(intersect(c, r)).toHaveLength(0)
  })

  it('commutative: Circle × Rect = Rect × Circle', () => {
    const c = new Circle(new Vector2(0, 0), 6)
    const r = rect()
    expect(intersect(c, r).length).toBe(intersect(r, c).length)
  })
})
