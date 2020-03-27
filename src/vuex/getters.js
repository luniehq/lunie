import config from "../../config"
// connection
export const connected = state => state.connection.connected
export const nodeUrl = state =>
  state.connection.connected ? state.connection.nodeUrl : undefined

export const address = state => state.session.address
export const network = state => state.connection.network
export const networkSlug = state => state.connection.networkSlug
export const addressType = state => state.connection.addressType
export const isExtension = () => config.isExtension
export const networks = state => state.connection.networks
export const stakingDenom = state => {
  let filteredNetwork = state.connection.networks.find(
    ({ id }) => id === state.connection.network
  )
  return filteredNetwork ? filteredNetwork.stakingDenom : ``
}
export const findNetwork = state => value => {
  let filterFunction
  // defaulting non object input to id
  if (typeof value !== `function`) {
    filterFunction = ({ id }) => id === value
  } else {
    filterFunction = value
  }
  return state.connection.networks.find(network => filterFunction(network))
}

export const isExtensionAccount = state =>
  state.extension.accounts.some(account => {
    return account.address === state.session.address
  })
