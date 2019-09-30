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
      state: {
        keystore: {
          accounts: [
            {
              address: `cosmos1234`,
              name: `my_account`
            }
          ]
        }
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
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should close the modal on successful login`, async () => {
    wrapper.setData({
      signInPassword: `1234567890`,
      signInAddress: `default`
    })
    wrapper.vm.$emit = jest.fn()
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/`)
  })

  it(`should signal signedin state on successful login`, async () => {
    wrapper.setData({
      signInPassword: `1234567890`,
      signInAddress: `default`
    })
    await wrapper.vm.onSubmit()
    expect($store.dispatch).toHaveBeenCalledWith(`signIn`, {
      password: `1234567890`,
      address: "default",
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
      signInAddress: `default`
    })
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.error).toBe(`The provided username or password is wrong.`)
  })

  it(`should show the only account that exists`, () => {
    const self = {
      accounts: [
        {
          value: `default`
        }
      ],
      $el: {
        querySelector: jest.fn(() => ({
          focus: jest.fn()
        }))
      }
    }
    TmSessionSignIn.methods.setDefaultAccount.call(self)

    expect(self.signInAddress).toBe(`default`)
    expect(self.$el.querySelector).toHaveBeenCalledWith(`#sign-in-password`)
  })

  it(`should show the last account used`, () => {
    localStorage.setItem(`prevAccountKey`, `lastUsed`)

    const self = {
      accounts: [
        {
          value: `default`
        },
        {
          value: `lastUsed`
        }
      ],
      $el: {
        querySelector: jest.fn(() => ({
          focus: jest.fn()
        }))
      }
    }
    TmSessionSignIn.methods.setDefaultAccount.call(self)

    expect(self.signInAddress).toBe(`lastUsed`)
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

    expect(self.signInAddress).toBe(undefined)
    expect(self.$el.querySelector).toHaveBeenCalledWith(`#sign-in-name`)
  })
})
