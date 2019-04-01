const axios = require(`axios`)
const fs = require(`fs`)
const path = require(`path`)

// This function creates a file with keybase profiles of all validators (as a fallback cache)
// This should be created on every build
async function main() {
  const validators = (await axios(`https://rpc.lunie.io/staking/validators`)).data
  const cache = {}
  await Promise.all(validators.map(async validator => {
    const keybaseId = validator.description.identity
    let trys = 10
    while (trys > 0)
      try {
        const identity = await lookupId(keybaseId)
        if (identity) {
          cache[identity.keybaseId] = identity
        }
        console.log(`got ${Object.keys(cache).length} of ${validators.length}`)
        break
      } catch (err) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        trys--
      }
  }))

  fs.writeFileSync(path.join(__dirname, `../app/src/renderer/keybase-cache.json`), JSON.stringify(cache), `utf8`)
}

main()

const baseUrl = `https://keybase.io/_/api/1.0/user/lookup.json`
const fieldsQuery = `fields=pictures,basics`

async function lookupId(keybaseId) {
  const fullUrl = `${baseUrl}?key_suffix=${keybaseId}&${fieldsQuery}`
  return query(fullUrl, keybaseId)
}

async function query(url, keybaseId) {
  try {
    const json = await axios(url)
    if (json.data.status.name === `OK`) {
      const user = json.data.them[0]
      if (user) {
        return {
          keybaseId,
          avatarUrl: user.pictures && user.pictures.primary
            ? user.pictures.primary.url
            : undefined,
          userName: user.basics.username,
          profileUrl: `https://keybase.io/` + user.basics.username,
          lastUpdated: new Date(Date.now()).toUTCString()
        }
      }
    }
  } catch (error) {
    return {
      keybaseId
    }
  }
}
