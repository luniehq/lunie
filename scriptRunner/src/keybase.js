const fetch = require("node-fetch")
const database = require("../../api/lib/database")
const config = require("../../api/config")
const db = database(config)

module.exports.getKeybaseImages = async () => {
  const networks = await db("").getNetworks()
  const cosmosNetworks = networks.filter(({network_type}) => network_type === "cosmos")
  cosmosNetworks.forEach(async network => {
    const schema = network.id.replace(/-/g, "_")
    const validators = await db(schema).read(
        `validatorprofiles`,
        `validatorprofiles`,
        ['operator_address', 'name', 'last_updated', 'profile_identifier']
      )
    const updateableValidators = validators
      .filter(({profile_identifier}) => profile_identifier)
      .filter(({last_updated}) => {
        // only update validators every 24h
        return Date.now() - new Date(last_updated).getTime() > 1000 * 60 * 60 * 24
      })
    const updatedValidators = await Promise.all(
      updateableValidators
        .map(async ({ operator_address, profile_identifier, name }) => {
          const query = `https://keybase.io/_/api/1.0/user/user_search.json?q=${profile_identifier}&num_wanted=1`
          const result = await fetch(query).then(res => res.json())
          if (result.list.length > 0) {
            return {
              name,
              operator_address,
              picture: result.list[0].keybase.picture_url ? 
                result.list[0].keybase.picture_url.replace('http://', 'https://') : undefined
            }
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