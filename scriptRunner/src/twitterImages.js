const fetch = require("node-fetch")
const _ = require("lodash")
const Sentry = require("@sentry/node")
const database = require("../../api/lib/database")
const config = require("../config")
const db = database(config)

module.exports.getTwitterImages = async () => {
  const networks = await db("").getNetworks()
  const polkadotNetworks = networks.filter(({network_type}) => network_type === "polkadot")
  polkadotNetworks.forEach(async network => {
    const schema = network.id.replace(/-/g, "_")
    const validators = await db(schema).read(
      `validatorprofiles`,
      `validatorprofiles`,
      ['operator_address', 'name', 'last_updated', 'profile_identifier']
    )
    const updateableValidators = validators
      // in the DB we have sometimes "undefined" for the identifier
      .filter(({profile_identifier}) => profile_identifier && profile_identifier !== 'undefined')
      // .filter(({last_updated}) => {
      //   // only update validators every 24h
      //   return Date.now() - new Date(last_updated).getTime() > 1000 * 60 * 60 * 24
      // })
    const chunksOfHundred = _.chunk(updateableValidators, 100) // twitter accepts max 100 usernames in parallel
    let updatedValidators = []
    await Promise.all(chunksOfHundred.map(async chunk => {
      const allTwitterNames = chunk.map(({ profile_identifier }) => profile_identifier.replace("@", ""))
      const query = `https://api.twitter.com/2/users/by?usernames=${allTwitterNames.join(',')}&user.fields=profile_image_url`
      const twitterResult = await fetch(query, {
        headers: {
          authorization: `Bearer ${config.twitterAuthToken}`
        }
      }).then(res => res.json())
      if (!twitterResult.errors) {
        updatedValidators = updatedValidators.concat(
          chunk.map((({ profile_identifier, name, operator_address }) => {
            const userName = profile_identifier.replace("@", "")
            const user = twitterResult.data.find(({username}) => username === userName)
            if (!user) {
              return {
                name,
                operator_address,
              }
            }
            return {
              name,
              operator_address,
              picture: user.profile_image_url.replace('http://', 'https://')
            }
          }))
        )
      }
    }))
    const rows = updatedValidators
      .map(({name, operator_address, picture}) => {
        let row = {
          name, operator_address, last_updated: new Date().toISOString()
        }
        // avoid overwriting picture in the db with null values
        if (picture && picture !== `https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png`) {
          row.picture = picture
        }
        return row
      })
    db(schema).upsert("validatorprofiles", rows)
  })
}