let test = require("tape-promise/tape")
let { getApp, restart } = require("./launch.js")
let { logout, openMenu } = require("./common.js")

/*
* NOTE: For some strange reason element.click() does not always work. In some cases I needed to use client.leftClick(selector). But this will be deprecated and pollutes the console with a deprecation warning.
*/

test("sign in", async function(t) {
  let { app } = await getApp(t)
  await restart(app)
  let client = app.client
  let el = (...args) => client.$(...args)
  let continueButton = () => el(".ni-btn__value=Next").$("..")

  t.test("signup", async function(t) {
    // go to login selection
    await client
      .$("i=arrow_back")
      .$("..")
      .click()
    await client.waitForExist(".ni-li-session", 1000)
    // go to new account
    await client
      .$(".ni-li-session-title=Create new account")
      .$("..")
      .$("..")
      .click()

    let accountName = () => el("#sign-up-name")
    let password = () => el("#sign-up-password")
    let passwordConfirm = () => el("#sign-up-password-confirm")
    let warning = () => el("#sign-up-warning")
    let backedup = () => el("#sign-up-backup")

    t.test("did check warning", async function(t) {
      await continueButton().click()
      t.ok(
        await warning()
          .$("..")
          .$("..")
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "shows error"
      )
      await warning().click()
      t.ok(
        !await warning()
          .$("..")
          .$("..")
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "hides error"
      )
      t.end()
    })

    t.test("did check backup note", async function(t) {
      await continueButton().click()
      t.ok(
        await backedup()
          .$("..")
          .$("..")
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "shows error"
      )
      await backedup().click()
      t.ok(
        !await backedup()
          .$("..")
          .$("..")
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "hides error"
      )
      t.end()
    })

    t.test("set account name", async function(t) {
      await continueButton().click()
      t.ok(
        await accountName()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "shows error"
      )
      await client.leftClick("#sign-up-name")
      await client.keys("sign".split())
      t.ok(
        await accountName()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "shows error for too few letters"
      )
      await client.leftClick("#sign-up-name")
      await client.keys("in_test".split())
      t.ok(
        !await accountName()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "hides error"
      )
      t.end()
    })

    t.test("set password", async function(t) {
      await continueButton().click()
      t.ok(
        await password()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "shows error"
      )
      await password().click()
      await client.keys("1234".split())
      t.ok(
        await password()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "shows error for too few letters"
      )
      await password().click()
      await client.keys("567890".split())
      t.ok(
        !await password()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "hides error"
      )
      t.end()
    })

    t.test("confirm password", async function(t) {
      await continueButton().click()
      t.ok(
        await passwordConfirm()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "shows error"
      )
      await passwordConfirm().click()
      await client.keys("1234".split())
      t.ok(
        await passwordConfirm()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "shows error for not matching passwords"
      )
      await passwordConfirm().click()
      await client.keys("567890".split())
      t.ok(
        !await passwordConfirm()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "hides error"
      )
      t.end()
    })

    t.test("logs in", async function(t) {
      await client.leftClick(".ni-btn__value=Next")

      // checking if user is logged in
      await client.waitForExist("#app-content", 5000)
      await openMenu(client)
      let activeUser = await client.$(".ni-li-user .ni-li-title").getText()
      t.ok(activeUser === "signin_test", "user is logged in")

      t.end()
    })
    t.end()
  })

  t.test("seed", async function(t) {
    await logout(client)
    // go to login selection
    await client
      .$("i=arrow_back")
      .$("..")
      .click()
    await client.waitForExist(".ni-li-session", 1000)
    // go to import with seed
    await client
      .$(".ni-li-session-title=Import with seed")
      .$("..")
      .$("..")
      .click()

    let accountName = () => el("#import-name")
    let password = () => el("#import-password")
    let passwordConfirm = () => el("#import-password-confirmation")
    let seed = () => el("#import-seed")

    t.test("set account name", async function(t) {
      await continueButton().click()
      t.ok(
        await accountName()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "shows error"
      )
      await accountName().click()
      await client.keys("seed".split())
      t.ok(
        await accountName()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "shows error for too few letters"
      )
      await accountName().click()
      await client.keys("_test".split())
      t.ok(
        !await accountName()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "hides error"
      )
      t.end()
    })

    t.test("set password", async function(t) {
      await continueButton().click()
      t.ok(
        await password()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "shows error"
      )
      await password().click()
      await client.keys("1234".split())
      t.ok(
        await password()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "shows error for too few letters"
      )
      await password().click()
      await client.keys("567890".split())
      t.ok(
        !await password()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "hides error"
      )
      t.end()
    })

    t.test("confirm password", async function(t) {
      await continueButton().click()
      t.ok(
        await passwordConfirm()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "shows error"
      )
      await passwordConfirm().click()
      await client.keys("1234".split())
      t.ok(
        await passwordConfirm()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "shows error for not matching passwords"
      )
      await passwordConfirm().click()
      await client.keys("567890".split())
      t.ok(
        !await passwordConfirm()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "hides error"
      )
      t.end()
    })

    t.test("input correct seed text", async function(t) {
      await continueButton().click()
      t.ok(
        await seed()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "shows error"
      )
      await seed().click()
      await client.keys(
        "crash ten rug mosquito cart south allow pluck shine island broom deputy hungry photo drift absorb".split()
      )
      t.ok(
        !await seed()
          .$("..")
          .isExisting(".ni-form-msg--error"),
        "hides error"
      )
      t.end()
    })

    t.test("logs in", async function(t) {
      await continueButton().click()

      // checking if user is logged in
      await client.waitForExist("#app-content", 5000)
      await openMenu(client)
      let activeUser = await client.$(".ni-li-user .ni-li-title").getText()
      t.ok(activeUser === "seed_test", "user is logged in")

      t.end()
    })

    t.end()
  })
  t.end()
})
