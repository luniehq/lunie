import { createSeed, createKey, testLogin, getSignRequest, approveSignRequest, rejectSignRequest } from '../../../src/store/actions';

describe('actions', () => {
  beforeEach(() => {
    window.chrome = {
      runtime: {
        sendMessage: jest.fn((args, callback) => {
          callback();
        }),
      },
    };
  });

  it('createSeed', async () => {
    // eslint-disable-next-line standard/no-callback-literal
    window.chrome.runtime.sendMessage.mockImplementation((args, callback) => callback('seed words'));
    expect(createSeed()).resolves.toBe('seed words');
    expect(window.chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: 'GET_SEED' }, expect.any(Function));
  });

  it('createKey', async () => {
    const dispatch = jest.fn();
    window.chrome.runtime.sendMessage.mockImplementation((args, callback) => callback());
    await createKey({ dispatch }, { seedPhrase: 'seed words', password: '1234567890', name: 'TEST' });
    expect(dispatch).toHaveBeenCalledWith('loadAccounts');
    expect(window.chrome.runtime.sendMessage).toHaveBeenCalledWith(
      {
        type: 'IMPORT_WALLET',
        payload: {
          password: '1234567890',
          name: 'TEST',
          mnemonic: 'seed words',
        },
      },
      expect.any(Function)
    );
  });

  it('testLogin', () => {
    // eslint-disable-next-line standard/no-callback-literal
    window.chrome.runtime.sendMessage.mockImplementationOnce((args, callback) => callback(true)).mockImplementationOnce((args, callback) => callback(false));
    expect(testLogin(null, { address: 'cosmos1234', password: '1234567890' })).resolves.toBe(true);
    expect(testLogin(null, { address: 'cosmos1234', password: '1234567890' })).resolves.toBe(false);
    expect(window.chrome.runtime.sendMessage).toHaveBeenCalledWith(
      {
        type: 'TEST_PASSWORD',
        payload: { address: 'cosmos1234', password: '1234567890' },
      },
      expect.any(Function)
    );
  });

  it('getSignRequest', () => {
    const signRequest = {
      signMessage: '',
      id: 12345,
      senderAddress: 'cosmos1234',
      tabId: 123,
    };
    const commit = jest.fn();
    // eslint-disable-next-line standard/no-callback-literal
    window.chrome.runtime.sendMessage.mockImplementationOnce((args, callback) => callback(signRequest));
    expect(getSignRequest({ commit })).resolves.toEqual(signRequest);
    expect(window.chrome.runtime.sendMessage).toHaveBeenCalledWith(
      {
        type: 'GET_SIGN_REQUEST',
      },
      expect.any(Function)
    );
    expect(commit).toHaveBeenCalledWith('setSignRequest', signRequest);
  });

  it('approveSignRequest', async () => {
    const signRequest = {
      signMessage: '',
      id: 12345,
      senderAddress: 'cosmos1234',
      tabId: 123,
    };
    const commit = jest.fn();
    // eslint-disable-next-line standard/no-callback-literal
    window.chrome.runtime.sendMessage.mockImplementationOnce((args, callback) => callback());
    await approveSignRequest({ commit }, { ...signRequest, password: '1234567890' });
    expect(window.chrome.runtime.sendMessage).toHaveBeenCalledWith(
      {
        type: 'SIGN',
        payload: {
          signMessage: '',
          senderAddress: 'cosmos1234',
          password: '1234567890',
          id: 12345,
        },
      },
      expect.any(Function)
    );
    expect(commit).toHaveBeenCalledWith('setSignRequest', null);
  });

  it('rejectSignRequest', async () => {
    const signRequest = {
      signMessage: '',
      id: 12345,
      senderAddress: 'cosmos1234',
      tabId: 123,
    };
    const commit = jest.fn();
    // eslint-disable-next-line standard/no-callback-literal
    window.chrome.runtime.sendMessage.mockImplementationOnce((args, callback) => callback());
    await rejectSignRequest({ commit }, { ...signRequest });
    expect(window.chrome.runtime.sendMessage).toHaveBeenCalledWith(
      {
        type: 'REJECT_SIGN_REQUEST',
        payload: signRequest,
      },
      expect.any(Function)
    );
    expect(commit).toHaveBeenCalledWith('setSignRequest', null);
  });
});
