// Math
export { Vector2 } from './math/Vector2'
export { Matrix } from './math/Matrix'
export { BoundingBox } from './math/BoundingBox'

// Core
export { Node } from './core/Node'
export { Transform } from './core/Transform'
export { Scene } from './core/Scene'
export { Shape } from './core/Shape'
export { Polyline } from './core/Polyline'
export { Circle } from './core/Circle'
export { Rectangle } from './core/Rectangle'
export { Ellipse } from './core/Ellipse'
export { Arc } from './core/Arc'
export { Path } from './core/Path'
export type { PathSegment } from './core/PathSegment'
export type { StrokeStyle } from './core/StrokeStyle'
export type { FillStyle } from './core/FillStyle'

// Rendering
export { View } from './rendering/View'
export type { IRenderer } from './rendering/IRenderer'

// Renderers
export { Canvas2DRenderer } from './renderer/Canvas2DRenderer'
export { SVGRenderer } from './renderer/SVGRenderer'

// Geometry utilities
export { distancePointToLine, distancePointToPolyline, distancePointToCircle, closestPointOnLine, closestPointOnPolyline } from './geometry/distance'
export { intersectLineLine, intersectLineCircle, intersectCircleCircle } from './geometry/intersect'
export { snap } from './geometry/Snap'
export type { SnapResult, SnapOptions, SnapType } from './geometry/Snap'
