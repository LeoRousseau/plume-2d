describe('Canvas', () => {
  it('renders the canvas element', () => {
    cy.visit('/')
    cy.get('#plume-canvas').should('be.visible')
    cy.get('#plume-canvas').should('have.attr', 'width', '800')
    cy.get('#plume-canvas').should('have.attr', 'height', '600')
  })

  it('responds to click events', () => {
    cy.visit('/')
    cy.get('#plume-canvas').click(400, 300)
  })
})
