export const createSeed = () => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: 'GET_SEED' }, function(seed) {
      resolve(seed);
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
      function() {
        resolve();
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
        // TODO missing rejection on wrong password?
        resolve();
        commit('setSignRequest', null);
      }
    );
  });
};

export const rejectSignRequest = ({ commit }, signRequest) => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(
      {
        type: 'REJECT_SIGN_REQUEST',
        payload: signRequest,
      },
      function(response) {
        resolve();
        commit('setSignRequest', null);
      }
    );
  });
};

export const signIn = () => {};
