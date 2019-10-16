import { setSignRequest, setAccounts, updateField, resetSignUpData, resetRecoverData } from 'store/mutations'

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

  it('updateField', () => {
    const state = {
      recover: {
        name: `123`
      }
    }
    updateField(state, { field: 'name', value: 'HappyLunieUserAccount' })
    expect(state.recover.name).toEqual('HappyLunieUserAccount')
  })

  it('resetSignUpData', () => {
    const state = {
      signup: {
        signUpName: `123`,
        signUpPassword: `123`,
        signUpPasswordConfirm: `123`,
        signUpWarning: true,
        signUpSeed: `123`
      }
    }
    const emptySignup = {
      signUpName: ``,
      signUpPassword: ``,
      signUpPasswordConfirm: ``,
      signUpWarning: false,
      signUpSeed: ``
    }
    resetSignUpData(state)
    expect(state.signup).toEqual(emptySignup)
  })

  it('resetRecoverData', () => {
    const state = {
      recover: {
        seed: `123`,
        name: `123`,
        password: `123`,
        passwordConfirm: `123`
      }
    }
    const emptyRecover = {
      seed: ``,
      name: ``,
      password: ``,
      passwordConfirm: ``
    }
    resetRecoverData(state)
    expect(state.recover).toEqual(emptyRecover)
  })
})
