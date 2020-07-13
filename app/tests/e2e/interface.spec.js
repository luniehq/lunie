module.exports = {
  "Validators search": async function (browser) {
    // move to according page
    await browser.url(browser.launch_url + browser.globals.slug + "/validators")
    await browser.waitForElementVisible(".li-validator", 20000)

    // select button 'All' in PageValidators
    await browser.click(".toggles .btn-radio:nth-child(2)")

    const validatorNames = await getValidators(browser)

    const searchTestStrings = ["validator", "stake", "~~"]
    for (let index = 0; index < searchTestStrings.length; index++) {
      const searchTestString = searchTestStrings[index]
      let updatedValidatorNames

      // reset the validator list so we see if the new filter also works
      browser.clearValue(".searchField")
      // funky hack to trigger the input on change event
      browser.setValue(".searchField", [" ", browser.Keys.BACK_SPACE])
      for (let attempts = 7; attempts > 0; attempts--) {
        updatedValidatorNames = await getValidators(browser)

        // checking validators did reset
        if (!isSameArray(validatorNames, updatedValidatorNames)) {
          await sleep()
          continue
        }
        break
      }
      if (!isSameArray(validatorNames, updatedValidatorNames)) {
        throw new Error(`Validatorlist did not reset to full list`)
      }

      // check if filters work
      browser.setValue(".searchField", searchTestString)
      for (let attempts = 7; attempts > 0; attempts--) {
        updatedValidatorNames = await getValidators(browser)

        // checking validators
        if (isSameArray(validatorNames, updatedValidatorNames)) {
          await sleep()
          continue
        }
        break
      }
      if (isSameArray(validatorNames, updatedValidatorNames)) {
        throw new Error(
          `Search did not update the list for 15 seconds, we assume it will never`
        )
      }
    }
  },
}

function isSameArray(array1, array2) {
  var is_same =
    array1.length === array2.length &&
    array1.every(function (element, index) {
      return element === array2[index]
    })
  return is_same
}

async function getValidators(browser) {
  const { value } = await browser.execute(function () {
    const validatorLIs = document.getElementsByClassName("li-validator")
    return Array.from(validatorLIs).map((item) =>
      item.getAttribute("data-name")
    )
  })

  return value
}

async function sleep() {
  await new Promise((resolve) => setTimeout(resolve, 5000))
}
