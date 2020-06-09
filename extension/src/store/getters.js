import config from 'app/config'

export const route = (state) => state.route
export const signRequest = (state) => state.signRequest
export const network = (state) => state.network
export const connected = () => true
export const networks = (state) => state.networks
export const currentNetwork = (state) =>
  state.networks.find(({ id }) => id === state.network)
export const networkSlug = (state) => state.networkSlug
export const isExtension = () => config.isExtension
export const stakingDenom = (state) => {
  let filteredNetwork = state.networks.find(({ id }) => id === state.network)
  return filteredNetwork ? filteredNetwork.stakingDenom : ``
}
