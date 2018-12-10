let test = require(`tape-promise/tape`)
let { getApp, restart } = require(`./launch.js`)
let {
  navigate,
  login,
  sleep,
  waitForText,
  closeNotifications
} = require(`./common.js`)
/*
 * NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
 */

test(`delegation`, async function(t) {
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
      await app.client
        .$(`.data-table__row__info__container__name=local_1`)
        .isVisible(),
      `show validator 1`
    )
    await t.ok(
      await app.client
        .$(`.data-table__row__info__container__name=local_2`)
        .isVisible(),
      `show validator 2`
    )
    await t.ok(
      await app.client
        .$(`.data-table__row__info__container__name=local_3`)
        .isVisible(),
      `show validator 3`
    )
    let myVotesText = await app.client
      .$(`.li-validator__delegated-steak`)
      .getText()
    let myVotes = parseFloat(myVotesText.replace(/,/g, ``))
    await t.equal(
      myVotes,
      parseFloat(bondedStake),
      `show my stake in the validator`
    )

    t.end()
  })

  t.test(`Stake`, async t => {
    let totalAtoms = (await app.client
      .$(`.header-balance .total-atoms h2`)
      .getText()).split(`.`)[0] // 130.000...
    let unbondedAtoms = (await app.client
      .$(`.header-balance .unbonded-atoms h2`)
      .getText()).split(`.`)[0] // 30.000...

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
      .click(`//button/*[. = 'Delegate']`)
      .setValue(`#amount`, 10)
      .setValue(`#password`, `1234567890`)
      .click(
        `//*[@id = 'delegation-modal']//button//*[. = 'Confirm Delegation']`
      )
      .waitForVisible(
        `//*[. = 'You have successfully delegated your Steaks']`,
        5 * 1000
      )

      // Go back to Staking page.
      .click(`//a//*[. = 'Staking']`)

    // there was a bug that updated the balances in a way that it would show more atoms,
    // then the users has
    await waitForText(
      () => app.client.$(`.header-balance .total-atoms h2`),
      `${totalAtoms}.0000…`
    )
    await waitForText(
      () => app.client.$(`.header-balance .unbonded-atoms h2`),
      `${unbondedAtoms - 10}.0000…`
    )
    await closeNotifications(app)

    // Shouldn't be necessary but see
    // https://github.com/jprichardson/tape-promise/issues/17#issuecomment-425276035.
    t.end()
  })

  t.test(`Undelegate`, async t => {
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
      .click(`//button/*[. = 'Undelegate']`)
      .setValue(`#amount`, 5)
      .setValue(`#password`, `1234567890`)
      .click(`//*[@id = 'undelegation-modal']//button//*[. = 'Undelegate']`)
      .waitForVisible(
        `//*[. = 'You have successfully undelegated 5 Steaks.']`,
        5 * 1000
      )

      // Go back to Staking page.
      .click(`//a//*[. = 'Staking']`)
    await closeNotifications(app)

    // Shouldn't be necessary but see
    // https://github.com/jprichardson/tape-promise/issues/17#issuecomment-425276035.
    t.end()
  })

  t.test(`showing transactions`, async function(t) {
    await navigate(app, `Transactions`)

    // delegated
    await app.client.waitForExist(
      `//div[contains(text(), "Delegated")]`,
      15 * 1000
    )
    // unbonded
    await app.client.waitForExist(
      `//div[contains(text(), "Unbonded")]`,
      15 * 1000
    )

    // TODO redelegation transaction

    t.end()
  })

  t.test(`Parameters`, async function(t) {
    await navigate(app, `Staking`)
    await app.client.click(`//a[. = 'Parameters']`)
    await t.ok(
      await app.client.waitForVisible(
        `//h3[contains(text(), "Staking Pool")]`,
        1000
      ),
      `Shows staking pool`
    )
    await t.ok(
      await app.client.waitForVisible(
        `//h3[contains(text(), "Staking Parameters")]`,
        1000
      ),
      `Shows staking parameters`
    )
    await t.ok(
      !(await app.client.isExisting(`//dd[contains(text(), "n/a")]`)),
      `all parameters and pool fields are defined`
    )
    await t.ok(
      !(await app.client.isExisting(`.tm-notification`, 4 * 1000)),
      `should not get a notification error while fetching params and pool`
    )
    // test that the parameters and pool values are displayed
    await t.equal(
      await app.client.$(`#loose_tokens`).getText(),
      `25.0000000000`,
      `display pool values`
    )
    await t.equal(
      await app.client.$(`#max_validators`).getText(),
      `100`,
      `display params values`
    )
    t.end()
  })

  t.end()
})
