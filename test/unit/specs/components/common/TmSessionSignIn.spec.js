import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import TmSessionSignIn from "common/TmSessionSignIn"

describe(`TmSessionSignIn`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper, $store

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(() => true),
      getters: {
        connected: true,
        session: {
          accounts: [
            {
              name: `my_account`
            }
          ]
        },
        mockedConnector: false
      }
    }

    wrapper = shallowMount(TmSessionSignIn, {
      localVue,
      mocks: {
        $router: {
          push: jest.fn()
        },
        $store
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should close`, () => {
    const self = {
      $emit: jest.fn()
    }
    TmSessionSignIn.methods.close.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`close`)
  })

  it(`should close the modal on successful login`, async () => {
    wrapper.setData({
      signInPassword: `1234567890`,
      signInName: `default`
    })
    wrapper.vm.$emit = jest.fn()
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$emit).toHaveBeenCalledWith(`close`)
  })

  it(`should go back to existing`, () => {
    const self = {
      $emit: jest.fn()
    }
    TmSessionSignIn.methods.goBack.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`route-change`, `existing`)
  })

  it("moves to other session pages", () => {
    const self = {
      $emit: jest.fn()
    }
    TmSessionSignIn.methods.setState.call(self, "welcome")
    expect(self.$emit).toHaveBeenCalledWith("route-change", "welcome")
  })

  it(`should signal signedin state on successful login`, async () => {
    wrapper.setData({
      signInPassword: `1234567890`,
      signInName: `default`
    })
    await wrapper.vm.onSubmit()
    expect($store.dispatch).toHaveBeenCalledWith(`signIn`, {
      password: `1234567890`,
      localKeyPairName: `default`,
      sessionType: `local`
    })
  })

  it(`should show error if password not 10 long`, () => {
    wrapper.setData({ signInPassword: `123` })
    wrapper.vm.onSubmit()
    expect($store.commit.mock.calls[1]).toBeUndefined()
    expect(wrapper.find(`.tm-form-msg-error`)).toBeDefined()
  })

  it(`should show a notification if signin failed`, async () => {
    $store.dispatch = jest.fn().mockResolvedValueOnce(false)
    wrapper.setData({
      signInPassword: `1234567890`,
      signInName: `default`
    })
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.error).toBe(`The provided username or password is wrong.`)
  })

  it(`should show the only account that exists`, () => {
    const self = {
      accounts: [
        {
          key: `default`
        }
      ],
      $el: {
        querySelector: jest.fn(() => ({
          focus: jest.fn()
        }))
      }
    }
    TmSessionSignIn.methods.setDefaultAccount.call(self)

    expect(self.signInName).toBe(`default`)
    expect(self.$el.querySelector).toHaveBeenCalledWith(`#sign-in-password`)
  })

  it(`should show the last account used`, () => {
    localStorage.setItem(`prevAccountKey`, `lastUsed`)

    const self = {
      accounts: [
        {
          key: `default`
        },
        {
          key: `lastUsed`
        }
      ],
      $el: {
        querySelector: jest.fn(() => ({
          focus: jest.fn()
        }))
      }
    }
    TmSessionSignIn.methods.setDefaultAccount.call(self)

    expect(self.signInName).toBe(`lastUsed`)
    expect(self.$el.querySelector).toHaveBeenCalledWith(`#sign-in-password`)
  })

  it(`should focus on the name input when there are no accounts`, () => {
    const self = {
      accounts: [],
      $el: {
        querySelector: jest.fn(() => ({
          focus: jest.fn()
        }))
      }
    }
    TmSessionSignIn.methods.setDefaultAccount.call(self)

    expect(self.signInName).toBe(undefined)
    expect(self.$el.querySelector).toHaveBeenCalledWith(`#sign-in-name`)
  })
})
