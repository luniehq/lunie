/* istanbul ignore file */
import axios from "axios"

let config = require(`./config.json`)

const networkPath = `../networks/${config.default_network}`

export default async function() {
  let genesis = (await axios(`${networkPath}/genesis.json`)).data
  let networkName = genesis.chain_id

  return {
    genesis,
    path: networkPath,
    name: networkName
  }
}
