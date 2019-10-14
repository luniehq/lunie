const { PubSub } = require('apollo-server')
const pubsub = new PubSub()
let Tendermint = require('./helpers/tendermint')

const NEW_BLOCK = 'NEW_BLOCK'

module.exports = {
  client: url => Tendermint().connect(url),
  blockAdded: networkId => pubsub.asyncIterator([`${networkId}_${NEW_BLOCK}`]),
  publishBlockAdded: (networkId, block) =>
    pubsub.publish(`${networkId}_${NEW_BLOCK}`, { blockAdded: block })
}
