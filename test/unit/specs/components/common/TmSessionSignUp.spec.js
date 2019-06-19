import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import TmSessionSignUp from "common/TmSessionSignUp"

describe(`TmSessionSignUp`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper, $store

  beforeEach(() => {
    const getters = {
      connected: true,
      session: { insecureMode: false }
    }
    $store = {
      getters,
      commit: jest.fn(),
      dispatch: jest.fn(() => Promise.resolve(`seed`))
    }
    wrapper = shallowMount(TmSessionSignUp, {
      localVue,
      mocks: {
        $store
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should go back to the welcome screen on click`, () => {
    wrapper
      .findAll(`.session-header a`)
      .at(0)
      .trigger(`click`)
    expect($store.commit).toHaveBeenCalledWith(`setSessionModalView`, `welcome`)
  })

  it(`should close the modal on successful login`, async () => {
    const commit = jest.fn()
    await TmSessionSignUp.methods.onSubmit.call({
      $store: {
        commit,
        dispatch: jest.fn()
      },
      $v: {
        $touch: () => {},
        $error: false
      },
      fields: {
        signUpPassword: `1234567890`,
        signUpPasswordConfirm: `1234567890`,
        signUpSeed: `bar`, // <-- doesn#t check for correctness of seed
        signUpName: `testaccount`,
        signUpWarning: true
      }
    })
    expect(commit).toHaveBeenCalledWith(`toggleSessionModal`, false)
  })

  it(`should show error if warnings not acknowledged`, () => {
    wrapper.setData({
      fields: {
        signUpPassword: `1234567890`,
        signUpPasswordConfirm: `1234567890`,
        signUpSeed: `bar`,
        signUpName: `testaccount`,
        signUpWarning: false
      }
    })
    wrapper.vm.onSubmit()
    expect($store.commit).not.toHaveBeenCalled()
    expect(wrapper.find(`.form-msg-error`)).toBeDefined()
  })

  it(`should show error if password is not 10 long`, async () => {
    wrapper.setData({
      fields: {
        signUpPassword: `123456789`,
        signUpPasswordConfirm: `1234567890`,
        signUpSeed: `bar`,
        signUpName: `testaccount`,
        signUpWarning: true
      }
    })
    await wrapper.vm.onSubmit()
    expect($store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find(`.form-msg-error`)).toBeDefined()
  })

  it(`should show error if password is not confirmed`, async () => {
    wrapper.setData({
      fields: {
        signUpPassword: `1234567890`,
        signUpPasswordConfirm: `notthesame`,
        signUpSeed: `bar`,
        signUpName: `testaccount`,
        signUpWarning: true
      }
    })
    await wrapper.vm.onSubmit()
    expect($store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find(`.form-msg-error`)).toBeDefined()
  })

  it(`should show an error if account name is not 5 long`, async () => {
    wrapper.setData({
      fields: {
        signUpPassword: `1234567890`,
        signUpPasswordConfirm: `1234567890`,
        signUpSeed: `bar`,
        signUpName: `test`,
        signUpWarning: true
      }
    })
    await wrapper.vm.onSubmit()
    expect($store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find(`.form-msg-error`)).toBeDefined()
  })

  it(`should not continue if creation failed`, async () => {
    $store.dispatch = jest.fn(() =>
      Promise.reject(new Error(`Account already exists`))
    )
    wrapper.setData({
      fields: {
        signUpPassword: `1234567890`,
        signUpPasswordConfirm: `1234567890`,
        signUpSeed: `bar`,
        signUpName: `testaccount`,
        signUpWarning: true
      }
    })
    await wrapper.vm.onSubmit()
    expect($store.commit).toHaveBeenCalledWith(
      `notifyError`,
      expect.objectContaining({ body: `Account already exists` })
    )
  })

  it(`should show a notification if creation failed`, async () => {
    const $store = {
      commit: jest.fn(),
      dispatch: jest.fn(() => Promise.reject({ message: `reason` }))
    }

    const self = {
      fields: {
        signUpPassword: `1234567890`,
        signUpPasswordConfirm: `1234567890`,
        signUpSeed: `bar`,
        signUpName: `testaccount`,
        signUpWarning: true
      },
      $v: {
        $touch: () => {},
        $error: false
      },
      $store
    }
    await TmSessionSignUp.methods.onSubmit.call(self)
    expect($store.commit).toHaveBeenCalledWith(`notifyError`, {
      title: `Couldn't create account`,
      body: expect.stringContaining(`reason`)
    })
  })
})
