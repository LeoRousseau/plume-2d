describe('Demo UI', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('renders the canvas element', () => {
    cy.get('#plume-canvas').should('be.visible')
    cy.get('#plume-canvas').should('have.attr', 'width', '900')
    cy.get('#plume-canvas').should('have.attr', 'height', '650')
  })

  it('shows the sidebar with all buttons', () => {
    cy.get('#sidebar').should('be.visible')
    cy.get('#btn-circle').should('be.visible')
    cy.get('#btn-rect').should('be.visible')
    cy.get('#btn-ellipse').should('be.visible')
    cy.get('#btn-arc').should('be.visible')
    cy.get('#btn-path').should('be.visible')
    cy.get('#btn-polyline').should('be.visible')
    cy.get('#btn-clear').should('be.visible')
    cy.get('#btn-svg').should('be.visible')
  })

  it('shows info panel', () => {
    cy.get('#info').should('be.visible')
    cy.get('#info').should('contain.text', 'Plume 2D demo')
  })
})

describe('Primitives', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('adds a circle and updates info', () => {
    cy.get('#btn-circle').click()
    cy.get('#info').should('contain.text', 'Circle')
    cy.get('#info').should('contain.text', 'area=')
  })

  it('adds a rectangle and updates info', () => {
    cy.get('#btn-rect').click()
    cy.get('#info').should('contain.text', 'Rect')
    cy.get('#info').should('contain.text', 'area=')
  })

  it('adds an ellipse and updates info', () => {
    cy.get('#btn-ellipse').click()
    cy.get('#info').should('contain.text', 'Ellipse')
    cy.get('#info').should('contain.text', 'perim=')
  })

  it('adds an arc and updates info', () => {
    cy.get('#btn-arc').click()
    cy.get('#info').should('contain.text', 'Arc')
    cy.get('#info').should('contain.text', 'len=')
  })

  it('adds a path and updates info', () => {
    cy.get('#btn-path').click()
    cy.get('#info').should('contain.text', 'Path')
    cy.get('#info').should('contain.text', 'segments=')
  })

  it('draws pixels on canvas after adding shapes', () => {
    cy.get('#btn-circle').click()
    cy.get('#btn-rect').click()
    cy.get('#plume-canvas').then(($canvas) => {
      const ctx = ($canvas[0] as HTMLCanvasElement).getContext('2d')!
      const data = ctx.getImageData(0, 0, 900, 650).data
      let nonEmpty = false
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) { nonEmpty = true; break }
      }
      expect(nonEmpty).to.be.true
    })
  })
})

describe('Polyline draw mode', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('toggles polyline draw mode', () => {
    cy.get('#btn-polyline').click()
    cy.get('#btn-polyline').should('have.class', 'active')
    cy.get('#info').should('contain.text', 'Click to add points')

    cy.get('#btn-polyline').click()
    cy.get('#btn-polyline').should('not.have.class', 'active')
    cy.get('#info').should('contain.text', 'Draw mode off')
  })

  it('creates a polyline via click and closes on dblclick', () => {
    cy.get('#btn-polyline').click()
    cy.get('#plume-canvas').click(200, 200)
    cy.get('#plume-canvas').click(300, 200)
    cy.get('#plume-canvas').click(250, 300)
    cy.get('#plume-canvas').dblclick(250, 300)
    cy.get('#info').should('contain.text', 'Polyline closed')
    cy.get('#info').should('contain.text', 'area=')
  })
})

describe('Styles', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('adds dashed rectangle', () => {
    cy.get('#btn-dashed').click()
    cy.get('#info').should('contain.text', 'dashed')
  })

  it('adds thick stroke polyline', () => {
    cy.get('#btn-thick').click()
    cy.get('#info').should('contain.text', 'thick')
  })

  it('adds semi-transparent circle', () => {
    cy.get('#btn-opacity').click()
    cy.get('#info').should('contain.text', 'opacity')
  })
})

describe('Geometry', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('shows line-line intersection', () => {
    cy.get('#btn-intersect').click()
    cy.get('#info').should('contain.text', 'Intersection at')
  })

  it('shows line-circle intersection', () => {
    cy.get('#btn-line-circle').click()
    cy.get('#info').should('contain.text', 'Line-Circle')
    cy.get('#info').should('contain.text', 'intersection')
  })

  it('shows circle-circle intersection', () => {
    cy.get('#btn-circle-circle').click()
    cy.get('#info').should('contain.text', 'Circle-Circle')
    cy.get('#info').should('contain.text', 'intersection')
  })
})

describe('Tools', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('shows bounding boxes', () => {
    cy.get('#btn-circle').click()
    cy.get('#btn-rect').click()
    cy.get('#btn-bbox').click()
    cy.get('#info').should('contain.text', 'bounding boxes')
  })

  it('shows centroids', () => {
    cy.get('#btn-circle').click()
    cy.get('#btn-centroid').click()
    cy.get('#info').should('contain.text', 'centroids')
  })

  it('toggles snap', () => {
    cy.get('#btn-snap').click()
    cy.get('#btn-snap').should('have.class', 'active')
    cy.get('#info').should('contain.text', 'Snap ON')

    cy.get('#btn-snap').click()
    cy.get('#btn-snap').should('not.have.class', 'active')
    cy.get('#info').should('contain.text', 'Snap OFF')
  })

  it('clears the scene', () => {
    cy.get('#btn-circle').click()
    cy.get('#btn-rect').click()
    cy.get('#btn-clear').click()
    cy.get('#info').should('contain.text', 'Scene cleared')
  })
})

describe('Zoom', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('zooms with mouse wheel', () => {
    cy.get('#btn-circle').click()
    cy.get('#plume-canvas').then(($canvas) => {
      const ctx = ($canvas[0] as HTMLCanvasElement).getContext('2d')!
      const before = ctx.getImageData(0, 0, 900, 650).data.slice()

      cy.get('#plume-canvas').trigger('wheel', {
        deltaY: -100,
        clientX: 450,
        clientY: 325,
      })

      cy.get('#plume-canvas').then(($c) => {
        const ctxAfter = ($c[0] as HTMLCanvasElement).getContext('2d')!
        const after = ctxAfter.getImageData(0, 0, 900, 650).data
        let diff = false
        for (let i = 0; i < after.length; i += 4) {
          if (after[i] !== before[i] || after[i + 1] !== before[i + 1] ||
              after[i + 2] !== before[i + 2] || after[i + 3] !== before[i + 3]) {
            diff = true
            break
          }
        }
        expect(diff).to.be.true
      })
    })
  })
})
