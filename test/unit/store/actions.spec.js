import { createSeed, createKey } from '../../../src/store/actions';

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
    const result = await createSeed();
    expect(result).toBe('seed words');
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
});
