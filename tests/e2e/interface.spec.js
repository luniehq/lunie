module.exports = {
  "Validators search": async function(browser) {
    // move to according page
    browser.url(browser.launch_url + "/validators", async () => {
      // wait until validators list load
      await browser
        .execute(function() {
          return new Promise(resolve => {
            let attempts = 5
            const f = () => {
              const validatorLIs = document.getElementsByClassName(
                "li-validator"
              )
              if (!validatorLIs.length && attempts-- > 0) {
                setTimeout(f, 2000)
                return false
              }
              if (validatorLIs.length < 2) {
                throw new Error(`No enough validators to check`)
              }
              let names = []
              for (let i = 0; i < validatorLIs.length; i++) {
                names.push(validatorLIs[i].getAttribute("data-name"))
              }
              resolve(names)
            }
            f()
          })
        })
        .then(async validators => {
          validators = validators.value
          if (validators.length) {
            ["aa", "oo", "~~"].map(letter => {
              browser.clearValue(".searchField")
              browser.setValue(".searchField", letter)
              const loadListResult = browser.execute(
                function() {
                  // async hell. Need to be sure that list was updated
                  return new Promise(resolve => {
                    let target = document.querySelector("tbody[name=flip-list]")
                    const timeout = setTimeout(
                      () => resolve({ result: false }),
                      15000
                    )
                    const callback = mutationsList => {
                      for (let mutation of mutationsList) {
                        if (mutation.type == "childList") {
                          clearTimeout(timeout)
                          let names = []
                          const validatorLIs = document.getElementsByClassName(
                            "li-validator"
                          )
                          for (let i = 0; i < validatorLIs.length; i++) {
                            names.push(
                              validatorLIs[i].getAttribute("data-name")
                            )
                          }
                          resolve({
                            result: true,
                            validators: names
                          })
                        }
                      }
                    }
                    const observer = new MutationObserver(callback)
                    const config = {
                      attributes: true,
                      childList: true,
                      subtree: true
                    }
                    observer.observe(target, config)
                  })
                },
                [browser]
              )
              loadListResult.then(result => {
                if (result.value.result) {
                  // checking validators
                  const initialAmount = validators.filter(
                    name => name.indexOf(letter) != -1
                  ).length
                  if (initialAmount > result.value.validators.length) {
                    throw new Error(`Search is not working properly`)
                  }
                } else {
                  throw new Error(`Search is not updating list in 15 seconds`)
                }
              })
            })
          } else {
            throw new Error(`No validators list loaded`)
          }
        })
    })
  }
}
