import { Vector2 } from '@plume/index'
import type { ToolState } from './tools'

export function createStylePanel(container: HTMLElement, toolState: ToolState): void {
  container.innerHTML = `
    <h3>Stroke</h3>
    <label>Color <input type="color" id="stroke-color" value="${toolState.stroke.color}"></label>
    <label>Width <input type="range" id="stroke-width" min="0" max="20" step="0.5" value="${toolState.stroke.width}">
      <span id="stroke-width-val">${toolState.stroke.width}</span>
    </label>
    <label>Dash
      <select id="stroke-dash">
        <option value="none">Solid</option>
        <option value="dash">Dashed [8,4]</option>
        <option value="dot">Dotted [2,4]</option>
        <option value="dashdot">Dash-Dot [8,4,2,4]</option>
      </select>
    </label>
    <label>Cap
      <select id="stroke-cap">
        <option value="butt">Butt</option>
        <option value="round">Round</option>
        <option value="square">Square</option>
      </select>
    </label>

    <h3>Fill</h3>
    <label>
      <input type="checkbox" id="fill-enabled" ${toolState.fill ? 'checked' : ''}>
      Enable fill
    </label>
    <label>Type
      <select id="fill-type">
        <option value="solid">Solid</option>
        <option value="linear-gradient">Linear gradient</option>
        <option value="radial-gradient">Radial gradient</option>
        <option value="pattern">Pattern</option>
      </select>
    </label>
    <label>Color <input type="color" id="fill-color" value="#ffffff"></label>
    <label>Opacity <input type="range" id="fill-opacity" min="0" max="1" step="0.05" value="0.1">
      <span id="fill-opacity-val">0.1</span>
    </label>
    <div id="gradient-options" style="display:none">
      <label>Color 2 <input type="color" id="fill-color2" value="#e94560"></label>
      <label>Color 3 <input type="color" id="fill-color3" value="#0ff"></label>
    </div>
    <div id="pattern-options" style="display:none">
      <label>Pattern
        <select id="fill-pattern">
          <option value="hatch">Hatch</option>
          <option value="crosshatch">Crosshatch</option>
          <option value="dots">Dots</option>
          <option value="grid">Grid</option>
        </select>
      </label>
    </div>
  `

  const dashMap: Record<string, number[] | undefined> = {
    none: undefined,
    dash: [8, 4],
    dot: [2, 4],
    dashdot: [8, 4, 2, 4],
  }

  function syncStroke(): void {
    const color = (container.querySelector('#stroke-color') as HTMLInputElement).value
    const width = parseFloat((container.querySelector('#stroke-width') as HTMLInputElement).value)
    const dashKey = (container.querySelector('#stroke-dash') as HTMLSelectElement).value
    const cap = (container.querySelector('#stroke-cap') as HTMLSelectElement).value as CanvasLineCap

    container.querySelector('#stroke-width-val')!.textContent = String(width)

    toolState.stroke = {
      color,
      width,
      dashArray: dashMap[dashKey],
      lineCap: cap,
      lineJoin: cap === 'round' ? 'round' : 'miter',
    }
  }

  function syncFill(): void {
    const enabled = (container.querySelector('#fill-enabled') as HTMLInputElement).checked
    if (!enabled) {
      toolState.fill = null
      return
    }
    const fillType = (container.querySelector('#fill-type') as HTMLSelectElement).value
    const color = (container.querySelector('#fill-color') as HTMLInputElement).value
    const opacity = parseFloat((container.querySelector('#fill-opacity') as HTMLInputElement).value)

    container.querySelector('#fill-opacity-val')!.textContent = String(opacity)

    const patternOpts = container.querySelector('#pattern-options') as HTMLElement
    const gradientOpts = container.querySelector('#gradient-options') as HTMLElement
    patternOpts.style.display = fillType === 'pattern' ? 'block' : 'none'
    gradientOpts.style.display = (fillType === 'linear-gradient' || fillType === 'radial-gradient') ? 'block' : 'none'

    if (fillType === 'solid') {
      toolState.fill = { type: 'solid', color, opacity }
    } else if (fillType === 'linear-gradient') {
      const color2 = (container.querySelector('#fill-color2') as HTMLInputElement).value
      const color3 = (container.querySelector('#fill-color3') as HTMLInputElement).value
      toolState.fill = {
        type: 'linear-gradient',
        start: new Vector2(0, 0),
        end: new Vector2(1, 0),
        stops: [
          { offset: 0, color },
          { offset: 0.5, color: color2 },
          { offset: 1, color: color3 },
        ],
        opacity,
      }
    } else if (fillType === 'radial-gradient') {
      const color2 = (container.querySelector('#fill-color2') as HTMLInputElement).value
      const color3 = (container.querySelector('#fill-color3') as HTMLInputElement).value
      toolState.fill = {
        type: 'radial-gradient',
        center: new Vector2(0.5, 0.5),
        radius: 1,
        stops: [
          { offset: 0, color },
          { offset: 0.5, color: color2 },
          { offset: 1, color: color3 },
        ],
        opacity,
      }
    } else if (fillType === 'pattern') {
      const pattern = (container.querySelector('#fill-pattern') as HTMLSelectElement).value as 'hatch' | 'crosshatch' | 'dots' | 'grid'
      toolState.fill = { type: 'pattern', pattern, color, background: null, spacing: 10, size: 2 }
    }
  }

  container.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', () => { syncStroke(); syncFill() })
    el.addEventListener('change', () => { syncStroke(); syncFill() })
  })
}
