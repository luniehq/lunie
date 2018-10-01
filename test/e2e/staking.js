let test = require(`tape-promise/tape`)
let { getApp, restart } = require(`./launch.js`)
let { navigate, login, sleep } = require(`./common.js`)
// let { navigate, waitForValue, login } = require("./common.js") // removed because of linting, add back when optimistic updates come
/*
* NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
*/

test(`staking`, async function(t) {
  let { app } = await getApp(t)
  // app.env.COSMOS_MOCKED = false
  await restart(app)

  await login(app, `testkey`)
  await navigate(app, `Staking`)

  // default values from e2e mounted node
  let bondedStake = 100

  t.test(`Validators`, async function(t) {
    // Select the Validators tab.
    await app.client.click(`//a[. = 'Validators']`)

    t.equal(
      (await app.client.$$(`.li-validator`)).length,
      3,
      `it shows all three validators`
    )
    await t.ok(
      await app.client.$(`.top=local_1`).isVisible(),
      `show validator 1`
    )
    await t.ok(
      await app.client.$(`.top=local_2`).isVisible(),
      `show validator 2`
    )
    await t.ok(
      await app.client.$(`.top=local_3`).isVisible(),
      `show validator 3`
    )
    await t.equal(
      parseFloat(
        await app.client.$(`.li-validator__value.your-votes`).getText()
      ),
      parseFloat(bondedStake),
      `show my stake in the validator`
    )

    t.end()
  })

  t.test(`Stake`, async t => {
    // Select the second validator.
    await app.client.click(`//*[. = 'local_2']`)

    // For some reason we need to sleep at this point in order to prevent the
    // following error:
    //
    // Element <span class="tm-btn__container tm-btn--primary">...</span> is not
    // clickable at point (960, 219). Other element would receive the click:
    // <div class="ps__rail-y" style="top: 0px; height: 557px; right:
    // 0px;">...</div>
    await sleep(500)

    await app.client
      .click(`//button/*[. = 'Stake']`)
      .setValue(`#amount`, 10)
      .click(`//*[@id = 'modal-stake']//button//*[. = 'Stake']`)
      .waitForVisible(
        `//*[. = 'You have successfully staked your Steaks.']`,
        5 * 1000
      )

      // Go back to Staking page.
      .click(`//a//*[. = 'Staking']`)

    // Shouldn't be necessary but see
    // https://github.com/jprichardson/tape-promise/issues/17#issuecomment-425276035.
    t.end()
  })

  t.test(`Unstake`, async t => {
    await app.client
      // Select the Validators tab.
      .click(`//a[. = 'Validators']`)

      // Select the second validator.
      .click(`//*[. = 'local_1']`)

    // For some reason we need to sleep at this point in order to prevent the
    // following error:
    //
    // Element <span class="tm-btn__container tm-btn--primary">...</span> is not
    // clickable at point (960, 219). Other element would receive the click:
    // <div class="ps__rail-y" style="top: 0px; height: 557px; right:
    // 0px;">...</div>
    await sleep(500)

    await app.client
      .click(`//button/*[. = 'Unstake']`)
      .setValue(`#amount`, 5)
      .click(`//*[@id = 'modal-unstake']//button//*[. = 'Unstake']`)
      .waitForVisible(
        `//*[. = 'You have successfully unstaked 5 Steaks.']`,
        5 * 1000
      )

      // Go back to Staking page.
      .click(`//a//*[. = 'Staking']`)

    // Shouldn't be necessary but see
    // https://github.com/jprichardson/tape-promise/issues/17#issuecomment-425276035.
    t.end()
  })

  t.end()
})
