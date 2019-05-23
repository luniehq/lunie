const numeral = require("numeral")
const { expect } = require("chai")

async function getBalance(browser) {
  return new Promise(resolve => {
    browser.getText(".total-atoms__value", ({ value }) => {
      resolve(numeral(value).value())
    })
  })
}
async function awaitBalance(browser, balance) {
  await waitFor(async () => {
    expect(String(balance)).to.startsWith(String(await getBalance(browser)))
  })
  console.log(`√ Balance is ${balance}`)
}
async function waitFor(check, iterations = 10, timeout = 1000) {
  while (--iterations) {
    try {
      await check()
      return
    } catch (err) {
      console.error(err.message)
      await new Promise(resolve => setTimeout(resolve, timeout))
    }
  }

  throw new Error("Condition was not meet in time")
}

module.exports = {
  getBalance,
  awaitBalance,
  waitFor
}
