export const createSeed = () => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: 'GET_SEED' }, function(response) {
      resolve(response);
    });
  });
};

export const createKey = ({ dispatch }, { seedPhrase, password, name }) => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(
      {
        type: 'IMPORT_WALLET',
        payload: {
          password,
          name,
          mnemonic: seedPhrase,
        },
      },
      function(response) {
        resolve(response);
        dispatch('loadAccounts');
      }
    );
  });
};

export const loadAccounts = ({ state }) => {
  chrome.runtime.sendMessage(
    {
      type: 'GET_WALLETS',
    },
    function(response) {
      state.accounts = response;
    }
  );
};

export const testLogin = (store, { address, password }) => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(
      {
        type: 'TEST_PASSWORD',
        payload: { address, password },
      },
      function(response) {
        resolve(response);
      }
    );
  });
};

export const getSignRequest = ({ commit }) => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(
      {
        type: 'GET_SIGN_REQUEST',
      },
      function(response) {
        commit('setSignRequest', response);
        resolve(response);
      }
    );
  });
};

export const approveSignRequest = ({ commit }, { signMessage, senderAddress, password, id }) => {
  console.log('approve sign request');
  return new Promise(resolve => {
    chrome.runtime.sendMessage(
      {
        type: 'SIGN',
        payload: {
          signMessage,
          senderAddress,
          password,
          id,
        },
      },
      function(response) {
        commit('setSignRequest', null);
      }
    );
  });
};

export const rejectSignRequest = ({ commit }) => {
  return new Promise(resolve => {
    console.log('reject sign request');
    chrome.runtime.sendMessage(
      {
        type: 'REJECT_SIGN_REQUEST',
      },
      function(response) {
        commit('setSignRequest', null);
      }
    );
  });
};

export const signIn = () => {};
