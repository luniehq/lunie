import config from '../../config.js'
import { getNewWalletFromSeed } from '@lunie/cosmos-keys'
import gql from 'graphql-tag'

export default ({ apollo }) => {
  const createSeed = () => {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ type: 'GET_SEED' }, function(seed) {
        resolve(seed)
      })
    })
  }

  const getNetwork = async (networkId, apollo) => {
    const {
      data: { network }
    } = await apollo.query({
      query: gql`
        query Network {
          network(id: "${networkId}") {
            id
            address_creator,
            address_prefix
          }
        }
      `,
      fetchPolicy: `cache-first`
    })

    if (!network)
      throw new Error(
        `Lunie doesn't support address creation for this network.`
      )

    return network
  }

  const setNetwork = ({ commit }, network) => {
    console.log('setNetworkId', network.id)
    commit('setNetworkId', network.id)
  }

  const createKey = ({ dispatch }, { seedPhrase, password, name, network }) => {
    return new Promise(async resolve => {
      const net = await getNetwork(network, apollo)
      chrome.runtime.sendMessage(
        {
          type: 'IMPORT_WALLET',
          payload: {
            password,
            name,
            prefix: net.address_prefix,
            mnemonic: seedPhrase,
            network
          }
        },
        function() {
          resolve()
          dispatch('loadAccounts')
        }
      )
    })
  }

  const loadAccounts = ({ commit }) => {
    chrome.runtime.sendMessage(
      {
        type: 'GET_WALLETS'
      },
      function(response) {
        commit('setAccounts', response || [])
      }
    )
  }

  const testLogin = (store, { address, password }) => {
    return new Promise(resolve => {
      chrome.runtime.sendMessage(
        {
          type: 'TEST_PASSWORD',
          payload: { address, password }
        },
        function(response) {
          resolve(response)
        }
      )
    })
  }

  const getSignRequest = ({ commit }) => {
    return new Promise(resolve => {
      chrome.runtime.sendMessage(
        {
          type: 'GET_SIGN_REQUEST'
        },
        function(response) {
          commit('setSignRequest', response)
          resolve(response)
        }
      )
    })
  }

  const getValidatorsData = async (validatorAddress, network) => {
    const txMessage = validatorAddress.value.msg[0]
    if (
      txMessage.type.indexOf('/MsgDelegate') !== -1 ||
      txMessage.type.indexOf('/MsgUndelegate') !== -1
    ) {
      const validatorAddress = txMessage.value.validator_address
      const validatorToMoniker = await fetchValidatorData(
        validatorAddress,
        network
      )
      return [
        {
          operator_address: validatorAddress,
          name: validatorToMoniker
        }
      ]
    }
    if (txMessage.type.indexOf('/MsgBeginRedelegate') !== -1) {
      const validator_src_address = txMessage.value.validator_src_address
      const validator_src_moniker = await fetchValidatorData(
        validator_src_address
      )
      const validator_dst_address = txMessage.value.validator_dst_address
      const validator_dst_moniker = await fetchValidatorData(
        validator_dst_address
      )

      return [
        {
          operator_address: validator_src_address,
          name: validator_src_moniker
        },
        {
          operator_address: validator_dst_address,
          name: validator_dst_moniker
        }
      ]
    }
    return []
  }

  const fetchValidatorData = async (validatorAddress, network) => {
    return fetch(`${config.graphqlHost}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: `{"query": "query{validator(operatorAddress: \\"${validatorAddress}\\", networkId: \\"${network}\\"){ name }}"}`
    })
      .then(async function(response) {
        const validatorObject = await response.json()
        return validatorObject.data.validator.name
      })
      .catch(function(error) {
        console.log('Error: ', error)
      })
  }

  const approveSignRequest = (
    { commit },
    { signMessage, senderAddress, password, id }
  ) => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: 'SIGN',
          payload: {
            signMessage,
            senderAddress,
            password,
            id
          }
        },
        function(response) {
          if (response && response.error) {
            return reject(response.error)
          }
          resolve()
          commit('setSignRequest', null)
        }
      )
    })
  }

  const rejectSignRequest = ({ commit }, signRequest) => {
    return new Promise(resolve => {
      chrome.runtime.sendMessage(
        {
          type: 'REJECT_SIGN_REQUEST',
          payload: signRequest
        },
        function(_response) {
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
    const net = await getNetwork(network, apollo)
    const wallet = getNewWalletFromSeed(seedPhrase, net.address_prefix)
    return wallet.cosmosAddress
  }

  return {
    createSeed,
    createKey,
    loadAccounts,
    testLogin,
    getSignRequest,
    getValidatorsData,
    approveSignRequest,
    rejectSignRequest,
    signIn,
    resetSignUpData,
    resetRecoverData,
    getAddressFromSeed,
    setNetwork
  }
}
