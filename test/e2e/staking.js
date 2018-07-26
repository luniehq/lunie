let test = require("tape-promise/tape")
let { getApp, restart } = require("./launch.js")
let { navigate, waitForValue, login } = require("./common.js")

/*
* NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
*/

test("staking", async function(t) {
  let { app } = await getApp(t)
  // app.env.COSMOS_MOCKED = false
  await restart(app)

  await login(app, "testkey")
  await navigate(app, "Staking")

  let totalUserStake = 150
  let bondedStake = 100
  let defaultValidatorMoniker = "local"

  t.test("overview", async function(t) {
    await t.equal(
      await app.client.$(".li-delegate__value.name").getText(),
      defaultValidatorMoniker, // moniker of the local node set in launch.js
      "show validators"
    )

    await t.equal(
      await app.client.$(".li-delegate__value.number_of_votes").getText(),
      bondedStake + "",
      "show validators stake"
    )

    await t.equal(
      await app.client.$(".li-delegate__value.your-votes").getText(),
      bondedStake + "",
      "show my stake in the validator"
    )

    await t.equal(
      await app.client.$(".li-delegate__value.status").getText(),
      "Validator",
      "show candidate is a validator"
    )

    t.end()
  })

  t.test("bonding", async function(t) {
    // validator should already be in the cart so we only need to click a button to go to the bonding view
    await app.client.$("#go-to-bonding-btn").click()

    t.equal(
      await app.client.$("#new-unbonded-atoms").getValue(),
      (totalUserStake - bondedStake).toString(),
      "Left over steak shows correctly"
    )

    t.equal(
      await app.client.$(".bond-candidate .bond-value__input").getValue(),
      bondedStake.toString(),
      "Candidate bond matches current bond"
    )

    await app.client
      .$(".bond-candidate .bond-value__input")
      .setValue(bondedStake + 20)

    t.equal(
      await app.client.$("#new-unbonded-atoms").getValue(),
      (totalUserStake - bondedStake - 20).toString(),
      "Left over steak shows correctly after adjusting bond"
    )

    await app.client.$("#btn-bond").click()

    // should fail
    t.ok(await app.client.isExisting(".tm-form-msg--error"), "shows error")

    await app.client.$("#bond-confirm").click()
    await app.client.$("#btn-bond").click()

    t.ok(!(await app.client.isExisting(".tm-form-msg--error")), "hides error")

    bondedStake += 20

    // wait until the validators are showing again
    await app.client.waitForExist("#go-to-bonding-btn", 10000)

    t.equal(
      await app.client.$(".li-delegate__value.number_of_votes").getText(),
      bondedStake.toString(),
      "Validator total steak updated correctly"
    )

    t.equal(
      await app.client.$(".li-delegate__value.your-votes").getText(),
      bondedStake.toString(),
      "Delegate steak in validator updated correctly"
    )

    t.end()
  })

  t.test("unbonding", async function(t) {
    // validator should already be in the cart so we only need to click a button to go to the bonding view
    await app.client.$("#go-to-bonding-btn").click()

    t.doesNotThrow(
      async () =>
        await waitForValue(
          () => app.client.$("#new-unbonded-atoms"),
          (totalUserStake - bondedStake).toString()
        ),
      "Left over steak shows correctly"
    )

    t.equal(
      await app.client.$(".bond-candidate .bond-value__input").getValue(),
      bondedStake.toString(),
      "Candidate bond matches current bond"
    )

    await app.client
      .$(".bond-candidate .bond-value__input")
      .setValue(bondedStake - 20)

    t.doesNotThrow(
      async () =>
        await waitForValue(
          () => app.client.$("#new-unbonded-atoms"),
          (totalUserStake - bondedStake + 20).toString()
        ),
      "Left over steak shows correctly after adjusting bond"
    )

    t.equal(
      await app.client.$("#new-unbonding-atoms").getValue(),
      (20).toString(),
      "Unbonding steak shows correctly"
    )

    await app.client.$("#btn-bond").click()

    // should fail
    t.ok(await app.client.isExisting(".tm-form-msg--error"), "shows error")

    await app.client.$("#bond-confirm").click()
    await app.client.$("#btn-bond").click()

    t.ok(!(await app.client.isExisting(".tm-form-msg--error")), "hides error")

    bondedStake -= 20

    // wait until the validators are showing again
    await app.client.waitForExist("#go-to-bonding-btn", 10000)

    t.equal(
      await app.client.$(".li-delegate__value.number_of_votes").getText(),
      bondedStake.toString(),
      "Validator total steak updated correctly"
    )

    t.equal(
      await app.client.$(".li-delegate__value.your-votes").getText(),
      bondedStake.toString(),
      "Delegate steak in validator updated correctly"
    )

    t.end()
  })

  t.end()
})
