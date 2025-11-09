describe("Skeleton Component", () => {
  it("renders skeleton", () => {
    cy.mount(<div><div className="h-4 w-32"><Skeleton /></div></div>);
    cy.get(".animate-pulse").should("exist");
  });
});