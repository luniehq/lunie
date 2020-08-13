const fetch = require("node-fetch")
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
      .filter(({last_updated}) => {
        // only update validators every 24h
        return Date.now() - new Date(last_updated).getTime() > 1000 * 60 * 60 * 24
      })
    const updatedValidators = await Promise.all(
      updateableValidators
      .map(async ({ operator_address, profile_identifier, name }) => {
        const query = `https://api.twitter.com/1.1/users/show.json?screen_name=${profile_identifier}`
        const result = await fetch(query, {
          headers: {
            authorization: `Bearer ${config.twitterAuthToken}`
          }
        }).then(res => res.json())
        if (!result.errors) {
          return {
            name,
            operator_address,
            picture: result.profile_image_url.replace('http://', 'https://')
          }
        } else {
          console.log(JSON.stringify(result.errors, null, 2))
          Sentry.captureException(new Error(JSON.stringify(result.errors)))
        }
        return {
          name,
          operator_address
        }
      })
    )
    const rows = updatedValidators
      .map(({name, operator_address, picture}) => {
        return {
          name, operator_address, picture, last_updated: new Date().toISOString()
        }
      })
    db(schema).upsert("validatorprofiles", rows)
  })
}