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
      session: { insecureMode: false },
      extension: () => true
    }
    $store = {
      getters,
      commit: jest.fn(),
      dispatch: jest.fn(() => Promise.resolve(`seed`))
    }
    wrapper = shallowMount(TmSessionSignUp, {
      localVue,
      mocks: {
        $store,
        $router: {
          push: jest.fn()
        }
      },
      stubs: [`router-link`]
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should not show back button if in website`, () => {
    expect(wrapper.contains(".session-back")).toBe(false)
  })

  it(`should show back button if in extension`, () => {
    wrapper = shallowMount(TmSessionSignUp, {
      localVue,
      mocks: {
        $store: {
          getters: {
            extension: false,
            connected: true,
            session: { insecureMode: false }
          },
          commit: jest.fn(),
          dispatch: jest.fn(() => Promise.resolve(`seed`))
        }
      },
      stubs: [`router-link`]
    })
    expect(wrapper.contains(".session-back")).toBe(true)
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

  it(`should go to the home page if creating is successful`, async () => {
    wrapper.setData({
      fields: {
        signUpPassword: `1234567890`,
        signUpPasswordConfirm: `1234567890`,
        signUpSeed: `bar`,
        signUpName: `testaccount`,
        signUpWarning: true
      }
    })
    $store.dispatch = jest.fn(() => Promise.resolve())
    await wrapper.vm.onSubmit()
    expect($store.dispatch.mock.calls[0][0]).toEqual(`createKey`)
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/`)
  })
})
