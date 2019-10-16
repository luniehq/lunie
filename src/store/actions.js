import config from '../../config.js'

export const createSeed = () => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: 'GET_SEED' }, function(seed) {
      resolve(seed)
    })
  })
}

export const createKey = ({ dispatch }, { seedPhrase, password, name }) => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(
      {
        type: 'IMPORT_WALLET',
        payload: {
          password,
          name,
          mnemonic: seedPhrase
        }
      },
      function() {
        resolve()
        dispatch('loadAccounts')
      }
    )
  })
}

export const loadAccounts = ({ commit }) => {
  chrome.runtime.sendMessage(
    {
      type: 'GET_WALLETS'
    },
    function(response) {
      commit('setAccounts', response)
    }
  )
}

export const testLogin = (store, { address, password }) => {
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

export const getSignRequest = ({ commit }) => {
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

export const getValidatorsData = async validatorAddress => {
  const txMessage = validatorAddress.value.msg[0]
  if (
    txMessage.type === 'cosmos-sdk/MsgDelegate' ||
    txMessage.type === 'cosmos-sdk/MsgUndelegate'
  ) {
    const validatorAddress = txMessage.value.validator_address
    const validatorToMoniker = await fetchValidatorData(validatorAddress)

    return [
      {
        operator_address: validatorAddress,
        description: {
          moniker: validatorToMoniker
        }
      }
    ]
  }
  if (txMessage.type === 'cosmos-sdk/MsgBeginRedelegate') {
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
        description: {
          moniker: validator_src_moniker
        }
      },
      {
        operator_address: validator_dst_address,
        description: {
          moniker: validator_dst_moniker
        }
      }
    ]
  }
  return []
}

const fetchValidatorData = async validatorAddress => {
  return fetch(`${config.stargate}/staking/validators/${validatorAddress}`)
    .then(async function(response) {
      const validatorObject = await response.json()
      return validatorObject.description.moniker
    })
    .catch(function(error) {
      console.log('Error: ', error)
    })
}

export const approveSignRequest = (
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

export const rejectSignRequest = ({ commit }, signRequest) => {
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

export const signIn = () => {}

export const resetSignUpData = ({ commit }) => {
  commit(`resetSignUpData`)
}

export const resetRecoverData = ({ commit }) => {
  commit(`resetRecoverData`)
}

export const getAddressFromSeed = async (store, seedPhrase) => {
  const { getNewWalletFromSeed } = await import('@lunie/cosmos-keys')
  const wallet = getNewWalletFromSeed(seedPhrase)
  return wallet.cosmosAddress
}
