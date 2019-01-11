"use strict"

let test = require(`tape-promise/tape`)
let { getApp, restart } = require(`./launch.js`)
let { navigateToPreferences, login } = require(`./common.js`)

/*
 * NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
 */

test(`preferences`, async function(t) {
  let { app } = await getApp(t)
  let $ = (...args) => app.client.$(...args)

  await restart(app)
  await login(app, `testkey`)
  await navigateToPreferences(app)

  t.test(`shows preferences`, async function(t) {
    t.ok(await $(`div*=Settings`).waitForExist(), `shows Settings`)
    t.ok(await $(`div*=Account`).waitForExist(), `shows Account`)
    t.end()
  })

  t.end()
})
