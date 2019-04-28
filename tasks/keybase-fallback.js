/* istanbul ignore file */ // not production script

const axios = require(`axios`)
const fs = require(`fs`)
const path = require(`path`)
const { lookupId } = require(`../src/vuex/modules/keybase.js`)

// This function creates a file with keybase profiles of all validators (as a fallback cache)
// This should be created on every build
async function main() {
  const validators = (await axios(`https://rpc.lunie.io/staking/validators`))
    .data
  const cache = {}
  await Promise.all(
    validators.map(async validator => {
      const keybaseId = validator.description.identity
      let trys = 10
      while (trys > 0)
        try {
          const identity = await lookupId({ externals: { axios } }, keybaseId)
          if (identity) {
            cache[identity.keybaseId] = identity
          }
          console.log(
            `got ${Object.keys(cache).length} of ${
              validators.length
            } keybase identities`
          )
          break
        } catch (err) {
          await new Promise(resolve => setTimeout(resolve, 2000))
          trys--
        }
    })
  )

  fs.writeFileSync(
    path.join(__dirname, `../src/keybase-cache.json`),
    JSON.stringify(cache),
    `utf8`
  )
}

main()
