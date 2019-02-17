"use strict"

const test = require(`tape-promise/tape`)
const { getApp, restart } = require(`./launch.js`)
const { navigateToPreferences, login } = require(`./common.js`)

/*
 * NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
 */

test(`preferences`, async function(t) {
  const { app } = await getApp(t)
  const $ = (...args) => app.client.$(...args)

  await restart(app)
  await login(app, `testkey`)
  await navigateToPreferences(app)

  t.test(`shows preferences`, async function(t) {
    t.ok(await $(`div*=Node IP`).waitForExist(), `shows Node IP`)
    t.end()
  })

  t.end()
})
