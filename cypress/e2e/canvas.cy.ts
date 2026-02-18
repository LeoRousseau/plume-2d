describe('Canvas', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('renders the canvas element', () => {
    cy.get('#plume-canvas').should('be.visible')
    cy.get('#plume-canvas').should('have.attr', 'width', '800')
    cy.get('#plume-canvas').should('have.attr', 'height', '600')
  })

  it('draws the initial triangle', () => {
    cy.get('#plume-canvas').then(($canvas) => {
      const ctx = ($canvas[0] as HTMLCanvasElement).getContext('2d')!
      // Sample a pixel near the triangle stroke (top vertex area)
      const pixel = ctx.getImageData(400, 150, 1, 1).data
      // The canvas should not be fully blank (alpha > 0 somewhere on the triangle)
      // Check center area where fill is present
      const centerPixel = ctx.getImageData(400, 350, 1, 1).data
      expect(centerPixel[3]).to.be.greaterThan(0)
    })
  })

  it('creates a polyline after two clicks', () => {
    cy.get('#plume-canvas').click(100, 100)
    cy.get('#plume-canvas').click(200, 200)
    cy.get('#plume-canvas').then(($canvas) => {
      const ctx = ($canvas[0] as HTMLCanvasElement).getContext('2d')!
      // Sample a pixel along the line between the two click points
      const pixel = ctx.getImageData(150, 150, 1, 1).data
      expect(pixel[3]).to.be.greaterThan(0)
    })
  })

  it('closes a polyline on double-click after 3+ points', () => {
    cy.get('#plume-canvas').click(100, 100)
    cy.get('#plume-canvas').click(200, 100)
    cy.get('#plume-canvas').click(150, 200)
    cy.get('#plume-canvas').dblclick(150, 200)
    cy.get('#plume-canvas').then(($canvas) => {
      const ctx = ($canvas[0] as HTMLCanvasElement).getContext('2d')!
      // Center of the closed triangle — fill should be present
      const pixel = ctx.getImageData(150, 140, 1, 1).data
      expect(pixel[3]).to.be.greaterThan(0)
    })
  })

  it('zooms with mouse wheel', () => {
    cy.get('#plume-canvas').then(($canvas) => {
      const ctx = ($canvas[0] as HTMLCanvasElement).getContext('2d')!
      const before = ctx.getImageData(0, 0, 800, 600).data.slice()

      // Trigger wheel event to zoom in
      cy.get('#plume-canvas').trigger('wheel', {
        deltaY: -100,
        clientX: 400,
        clientY: 300,
      })

      cy.get('#plume-canvas').then(($c) => {
        const ctxAfter = ($c[0] as HTMLCanvasElement).getContext('2d')!
        const after = ctxAfter.getImageData(0, 0, 800, 600).data
        // Pixels should have changed after zoom
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
