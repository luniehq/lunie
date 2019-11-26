const { actionModalCheckout, nextBlock, waitForText } = require("./helpers.js")

module.exports = {
    "Withdraw Action": async function(browser) {
        // move to according page
        browser.url(browser.launch_url + "#/portfolio")

        actionModalCheckout(
        browser,
        ".withdraw-btn",
        // actions to do on details page
        () => {
            browser.setValue(
            "#send-address",
            "cosmos1v9zf9klj57rfsmdyamza5jqh9p46m3dlvq847j"
            )
            browser.setValue("#amount", "1.3")
        },
        // expected subtotal
        "0"
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