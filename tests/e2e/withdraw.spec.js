const { actionModalCheckout, nextBlock, waitForText } = require("./helpers.js")

module.exports = {
    "Withdraw Action": async function(browser) {
        // move to according page
        browser.url(browser.launch_url + "#/portfolio")

        browser.expect.elements("#withdraw-btn").not.to.be.enabled

        // first we need to send some funds in order to have funds
        // to withdraw from
        actionModalCheckout(
            browser,
            ".send-button",
            // actions to do on details page
            () => {
              browser.setValue(
                "#send-address",
                "cosmos1v9zf9klj57rfsmdyamza5jqh9p46m3dlvq847j"
              )
              browser.setValue("#amount", "1.3")
            },
            // expected subtotal
            "1.3"
          )
      
          await nextBlock(browser)
      
          // check if tx shows
          browser.url(browser.launch_url + "/#/transactions")
          browser.pause(1000)
          await waitForText(
            browser,
            ".tx:nth-child(2) .tx__content__caption",
            "Sent 1.3 STAKE"
          )

        actionModalCheckout(
        browser,
        "#withdraw-btn",
        // actions to do on details page
        () => {
            browser.setValue(
            "#send-address", // rich address
            "cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e"
            )
            browser.setValue("#amount", "1")
        },
        // expected subtotal
        "1"
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