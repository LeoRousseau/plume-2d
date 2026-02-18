import { Canvas, Vector2 } from '@plume/index'

const canvas = new Canvas('#plume-canvas', 800, 600)
canvas.clear()

canvas.on('click', ({ position }) => {
  drawCircle(position, 8, '#e94560')
})

canvas.on('mousemove', ({ position }) => {
  canvas.clear()
  drawCrosshair(position)
})

function drawCircle(pos: Vector2, radius: number, color: string): void {
  canvas.ctx.beginPath()
  canvas.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
  canvas.ctx.fillStyle = color
  canvas.ctx.fill()
}

function drawCrosshair(pos: Vector2): void {
  const size = 10
  canvas.ctx.strokeStyle = '#555'
  canvas.ctx.lineWidth = 1

  canvas.ctx.beginPath()
  canvas.ctx.moveTo(pos.x - size, pos.y)
  canvas.ctx.lineTo(pos.x + size, pos.y)
  canvas.ctx.moveTo(pos.x, pos.y - size)
  canvas.ctx.lineTo(pos.x, pos.y + size)
  canvas.ctx.stroke()
}
