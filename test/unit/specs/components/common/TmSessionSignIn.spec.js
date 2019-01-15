import setup from "../../../helpers/vuex-setup"
import Vuelidate from "vuelidate"
import TmSessionSignIn from "common/TmSessionSignIn"

const { mount, localVue } = setup()
localVue.use(Vuelidate)

describe(`TmSessionSignIn`, () => {
  let wrapper, store

  beforeEach(() => {
    const instance = mount(TmSessionSignIn, {
      getters: {
        connected: () => true
      },
      mocks: {
        $router: {
          push: jest.fn()
        }
      }
    })
    store = instance.store
    wrapper = instance.wrapper
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should open the help modal on click`, () => {
    wrapper
      .findAll(`.tm-session-header a`)
      .at(1)
      .trigger(`click`)
    expect(store.commit).toHaveBeenCalledWith(`setModalHelp`, true)
  })

  it(`should close the modal on successful login`, async () => {
    wrapper.setData({
      fields: {
        signInPassword: `1234567890`,
        signInName: `default`
      }
    })
    await wrapper.vm.onSubmit()
    const calls = store.commit.mock.calls.map(args => args[0])
    expect(calls).toContain(`setModalSession`)
  })

  it(`should signal signedin state on successful login`, async () => {
    wrapper.setData({
      fields: {
        signInPassword: `1234567890`,
        signInName: `default`
      }
    })
    await wrapper.vm.onSubmit()
    expect(store.dispatch).toHaveBeenCalledWith(`signIn`, {
      password: `1234567890`,
      account: `default`
    })
  })

  it(`should show error if password not 10 long`, () => {
    wrapper.setData({ fields: { signInPassword: `123` } })
    wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[1]).toBeUndefined()
    expect(wrapper.find(`.tm-form-msg-error`)).toBeDefined()
  })

  it(`should show a notification if signin failed`, async () => {
    const $store = {
      commit: jest.fn(),
      dispatch: jest.fn(() => Promise.reject({ message: `Planned rejection` }))
    }

    const self = {
      fields: {
        signInPassword: `1234567890`,
        signInName: `default`
      },
      $v: {
        $touch: () => {},
        $error: false
      },
      $store
    }
    await TmSessionSignIn.methods.onSubmit.call(self)
    expect($store.commit).toHaveBeenCalledWith(`notifyError`, {
      title: `Signing In Failed`,
      body: expect.stringContaining(`Planned rejection`)
    })
  })

  it(`should reset history after signin`, async () => {
    expect(store.state.user.history.length).toBe(0)
    wrapper.setData({
      fields: {
        signInPassword: `1234567890`,
        signInName: `default`
      }
    })
    await wrapper.vm.onSubmit()
    expect(store.state.user.history.length).toBe(0)
    store.commit(`addHistory`, `/staking`)
    expect(store.state.user.history.length).toBe(1)
    store.dispatch(`signOut`)
    expect(store.state.user.history.length).toBe(0)
  })
})
