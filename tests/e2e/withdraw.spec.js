const { actionModalCheckout, nextBlock, waitForText } = require("./helpers.js")
// const { waitFor } = require("./helpers")

module.exports = {
    "Delegate Action": async function(browser) {
        // move to according page
        browser.url(browser.launch_url + "/#/validators")
    
        // move to validator page
        browser.expect.element(".li-validator").to.be.visible.before(10000)
        browser.click(".li-validator[data-name=main_account]")
    
        const value = "10.42"
        await actionModalCheckout(
          browser,
          "#delegation-btn",
          // actions to do on details page
          () => {
            browser.setValue("#amount", value)
          },
          value,
          0,
          value
        )
    
        await nextBlock(browser)
    
        // check if tx shows
        browser.url(browser.launch_url + "/#/transactions")
        await waitForText(
          browser,
          ".tx:nth-child(2) .tx__content__caption",
          `Delegated ${value} STAKE`
        )
    },
    "Withdraw Action": async function(browser) {
        process.setMaxListeners(0)
        // move to according page
        browser.url(browser.launch_url + "#/portfolio")
        
        // await waitFor(
        //     async () => {
        //         browser.expect.elements("#withdraw-btn").to.be.enabled
        //     },
        //     10,
        //     2000
        // )       
        browser.expect.elements("#withdraw-btn").to.be.enabled 
        
        actionModalCheckout(
        browser,
        "#withdraw-btn",
        // actions to do on details page
        () => {
            browser.setValue(
            "#send-address", // rich address
            "cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e"
            )
            browser.setValue("#amount", "0.001")
        },
        // expected subtotal
        "0.001"
        )

        await nextBlock(browser)

        // check if tx shows
        browser.url(browser.launch_url + "/#/transactions")
        browser.pause(1000)
        await waitForText(
        browser,
        ".tx:nth-child(2) .tx__content__caption",
        "Withdrew 1.3 STAKE"
        )
    }
}