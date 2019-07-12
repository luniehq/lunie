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
