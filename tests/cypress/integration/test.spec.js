describe('Delegation', function () {
    it('Delegate', function () {
        cy.visit('http://localhost:9080');
        cy.get('.open-menu').click();
        cy.get(`.app-menu-item[title=Validators]`).click();
        cy.get('.li-validator[data-name=main_account]').click();
        cy.get('#delegation-btn').click();
        cy.get('#amount').type('42');
        cy.get('.action-modal-footer .button').click();
        cy.get('.action-modal-footer .button').click();
        cy.get('#password').type('1234567890');
        cy.get('.action-modal-footer .button').click();
        cy.get('.success-step', { timeout: 10000 });
        cy.get('#closeBtn').click();
        cy.get('.open-menu').click();
        cy.get('.app-menu-item[title=Transactions]').click();
    })
})