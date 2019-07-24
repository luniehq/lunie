import { setSignRequest, setAccounts } from '../../../src/store/mutations'

describe('mutations', () => {
  it('setSignRequest', () => {
    const signRequest = {
      signMessage: '',
      id: 12345,
      senderAddress: 'cosmos1234',
      tabId: 123
    }
    const state = {}
    setSignRequest(state, signRequest)
    expect(state.signRequest).toEqual(signRequest)
  })

  it('setAccounts', () => {
    const state = {}
    setAccounts(state, [{ address: 'address1', name: 'name1' }])
    expect(state.accounts).toEqual([{ address: 'address1', name: 'name1' }])
  })
})
