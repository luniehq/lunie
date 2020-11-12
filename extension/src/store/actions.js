import config from '../../config.js'
import validators from '../../validators'
import networks from '../../networks'
import gql from 'graphql-tag'
import { NetworksAll } from '../popup/gql'
import { lunieMessageTypes } from '../scripts/parsers'
import { storeWallet } from '@lunie/cosmos-keys'

export default ({ apollo }) => {
  const createSeed = async () => {
    const { getSeed } = await import('@lunie/cosmos-keys')
    return getSeed()
  }

  const preloadNetworkCapabilities = async ({ commit }) => {
    if (apollo) {
      const { data } = await apollo.query({
        query: NetworksAll,
        variables: { experimental: config.development },
        fetchPolicy: 'cache-first'
      })
      commit('setNetworks', data.networks)
    } else {
      commit('setNetworks', networks)
    }
  }

  const setNetwork = ({ commit }, network) => {
    commit('setNetworkId', network.id)
  }

  const getWalletFromSandbox = async (
    seedPhrase,
    networkObject,
    HDPath,
    curve
  ) => {
    return new Promise((resolve) => {
      var iframe = document.getElementById('sandboxFrame')
      window.addEventListener(
        'message',
        function (event) {
          resolve(event.data)
        },
        { once: true }
      )
      var message = {
        type: 'getWallet',
        seedPhrase,
        networkObject,
        HDPath,
        curve
      }
      iframe.contentWindow.postMessage(message, '*')
    })
  }

  const createKey = async (
    store,
    { seedPhrase, password, name, HDPath, curve, network }
  ) => {
    const networkObject = store.getters.networks.find(
      ({ id }) => id === network
    )
    const { result: wallet } = await getWalletFromSandbox(
      seedPhrase,
      networkObject,
      HDPath,
      curve
    )
    storeWallet(wallet, name, password, network, HDPath, curve)
    store.dispatch('loadLocalAccounts')
  }

  const loadLocalAccounts = ({ commit }) => {
    chrome.runtime.sendMessage(
      {
        type: 'GET_WALLETS'
      },
      function (response) {
        commit('setAccounts', response || [])
      }
    )
  }

  const deleteAccountWithoutPassword = async (store, { address }) => {
    chrome.runtime.sendMessage(
      {
        type: 'DELETE_WALLET_WITHOUT_PASSWORD',
        payload: { address }
      },
      function () {
        const remainingAccounts = store.state.accounts.filter(
          (account) => account.address !== address
        )
        store.commit('setAccounts', remainingAccounts || [])
      }
    )
    return true
  }

  const getWallet = (store, { address, password }) => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: 'GET_WALLET',
          payload: { address, password }
        },
        function (wallet) {
          if (!wallet) return reject('Could not get wallet')
          return resolve(wallet)
        }
      )
    })
  }

  const testLogin = (store, { address, password }) => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          type: 'TEST_PASSWORD',
          payload: { address, password }
        },
        function (response) {
          resolve(response)
        }
      )
    })
  }

  const getSignRequest = ({ commit }) => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          type: 'GET_SIGN_REQUEST'
        },
        function (response) {
          commit('setSignRequest', response)
          resolve(response)
        }
      )
    })
  }

  const getValidatorsData = async (lunieTx) => {
    let validators = []
    if (
      lunieTx.type === lunieMessageTypes.STAKE ||
      lunieTx.type === lunieMessageTypes.RESTAKE
    ) {
      validators.push(...lunieTx.details.to)
    }
    if (
      lunieTx.type === lunieMessageTypes.UNSTAKE ||
      lunieTx.type === lunieMessageTypes.RESTAKE ||
      lunieTx.type === lunieMessageTypes.CLAIM_REWARDS
    ) {
      validators.push(...lunieTx.details.from)
    }
    return await Promise.all(
      validators.map(async (validatorAddress) => {
        return {
          operatorAddress: validatorAddress,
          name: validatorAddress
        }
      })
    )
  }

  const approveSignRequest = (
    { commit, getters },
    {
      senderAddress,
      password,
      id,
      messageType,
      message,
      transactionData,
      network,
      HDPath,
      curve
    }
  ) => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: 'SIGN',
          payload: {
            messageType,
            message,
            transactionData,
            senderAddress,
            password,
            id,
            network: getters.networks.find(({ id }) => id === network),
            HDPath,
            curve
          }
        },
        function (response) {
          if (response && response.error) {
            return reject(response.error)
          }
          resolve()
          commit('setSignRequest', null)
        }
      )
    })
  }

  const getNetworkByAddress = async (store, address) => {
    if (apollo) {
      const { data } = await apollo.query({
        query: gql`
          query Networks {
            networks {
              testnet
              id
              address_prefix
            }
          }
        `,
        fetchPolicy: 'cache-first'
      })
      const network = data.networks
        .filter((network) => address.indexOf(network.address_prefix) == 0)
        .sort((a) => a.testnet)
        .shift()
      return network ? network.id : ''
    } else {
      commit('setNetworks', networks)
    }
  }

  const rejectSignRequest = ({ commit }, signRequest) => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          type: 'REJECT_SIGN_REQUEST',
          payload: signRequest
        },
        function (_response) {
          resolve()
          commit('setSignRequest', null)
        }
      )
    })
  }

  const signIn = () => {}

  const resetSignUpData = ({ commit }) => {
    commit(`resetSignUpData`)
  }

  const resetRecoverData = ({ commit }) => {
    commit(`resetRecoverData`)
  }

  const getAddressFromSeed = async (store, { seedPhrase, network }) => {
    const networkObject = store.getters.networks.find(
      ({ id }) => id === network
    )
    const { result: wallet } = await getWalletFromSandbox(
      seedPhrase,
      networkObject
    )

    // const wallet = await getWallet(seedPhrase, networkObject)
    return wallet.cosmosAddress
  }

  const testSeed = async (store, { networkId, address, seedPhrase }) => {
    const networkObject = store.getters.networks.find(
      ({ id }) => id === networkId
    )
    const walletVariations = JSON.parse(networkObject.HDPaths).reduce(
      (all, HDPath) => {
        return JSON.parse(networkObject.curves).reduce((all2, curve) => {
          all2.push({ HDPath, curve })
          return all2
        }, [])
      },
      []
    )
    const foundCombination = await Promise.all(
      walletVariations.map(async ({ HDPath, curve }) => {
        const { result: wallet } = await getWalletFromSandbox(
          seedPhrase,
          networkObject,
          HDPath.value,
          curve.value
        )
        return wallet && wallet.cosmosAddress === address ? true : false
      })
    )
    return foundCombination.find((combination) => combination) ? true : false
  }

  return {
    createSeed,
    createKey,
    loadLocalAccounts,
    testSeed,
    deleteAccountWithoutPassword,
    getWallet,
    getNetworkByAddress,
    testLogin,
    getSignRequest,
    getValidatorsData,
    approveSignRequest,
    rejectSignRequest,
    signIn,
    resetSignUpData,
    resetRecoverData,
    getAddressFromSeed,
    setNetwork,
    preloadNetworkCapabilities
  }
}
