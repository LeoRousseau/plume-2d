// Math
export { Vector2 } from './math/Vector2'
export { Matrix } from './math/Matrix'
export { BoundingBox } from './math/BoundingBox'
export { TWO_PI, EPSILON, MATRIX_EPSILON, CURVE_SUBDIVISIONS, DEFAULT_HIT_TOLERANCE, TEXT_CHAR_WIDTH_RATIO, TEXT_ALPHABETIC_RATIO } from './math/constants'

// Base
export { Node } from './base/Node'
export { Transform } from './base/Transform'
export { Scene } from './base/Scene'

// Entity
export { ARenderable } from './entity/Renderable'
export { AShape } from './entity/Shape'
export { Polyline } from './entity/Polyline'
export { Circle } from './entity/Circle'
export { Rectangle } from './entity/Rectangle'
export { Ellipse } from './entity/Ellipse'
export { Arc } from './entity/Arc'
export { Path } from './entity/Path'
export { Text } from './entity/Text'
export { Raster } from './entity/Raster'
export { SVGNode } from './entity/SVGNode'
export type { TextAlign, TextBaseline } from './entity/Text'
export type { PathSegment } from './entity/PathSegment'
export type { StrokeStyle } from './entity/StrokeStyle'
export type { FillStyle, SolidFill, LinearGradientFill, RadialGradientFill, GradientStop, PatternFill } from './entity/FillStyle'

// Hit Testing
export { hitTest, pick } from './hitTest/HitTest'
export type { HitTestResult } from './hitTest/HitTest'

// Rendering
export { View } from './view/View'
export type { IRenderer } from './renderer/IRenderer'

// Renderers
export { Canvas2DRenderer } from './renderer/Canvas2DRenderer'
export { SVGRenderer } from './renderer/SVGRenderer'

// Geometry utilities
export { distancePointToLine, distancePointToPolyline, distancePointToCircle, distancePointToSegment, distancePointToPolylineEdge, distancePointToRectEdge, distancePointToPathEdge, closestPointOnLine, closestPointOnPolyline } from './geometry/distance'
export { intersectLineLine, intersectLineCircle, intersectCircleCircle, intersectLineArc, intersectLineEllipse, intersectCircleArc, intersectArcArc, intersect } from './geometry/intersect'

// Parser
export { parseSVG, parseSVGToNode, parsePathData } from './parser/SVGParser'

// Snapping
export { snap } from './snapping/Snap'
export type { SnapResult, SnapOptions, SnapType } from './snapping/Snap'
