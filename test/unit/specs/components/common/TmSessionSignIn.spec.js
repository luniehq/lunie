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

  it(`should open the help modal on click`, () => {
    wrapper
      .findAll(`.tm-session-header a`)
      .at(1)
      .trigger(`click`)
    expect($store.commit).toHaveBeenCalledWith(`setModalHelp`, true)
  })

  it(`should close the modal on successful login`, async () => {
    wrapper.setData({
      fields: {
        signInPassword: `1234567890`,
        signInName: `default`
      }
    })
    await wrapper.vm.onSubmit()
    expect($store.commit).toHaveBeenCalledWith(`toggleSessionModal`, false)
  })

  it(`should go back to welcome`, () => {
    wrapper.vm.goToWelcome()
    expect($store.commit).toHaveBeenCalledWith(`setSessionModalView`, `welcome`)
  })

  it(`should signal signedin state on successful login`, async () => {
    wrapper.setData({
      fields: {
        signInPassword: `1234567890`,
        signInName: `default`
      }
    })
    await wrapper.vm.onSubmit()
    expect($store.dispatch).toHaveBeenCalledWith(`signIn`, {
      password: `1234567890`,
      localKeyPairName: `default`
    })
  })

  it(`should show error if password not 10 long`, () => {
    wrapper.setData({ fields: { signInPassword: `123` } })
    wrapper.vm.onSubmit()
    expect($store.commit.mock.calls[1]).toBeUndefined()
    expect(wrapper.find(`.tm-form-msg-error`)).toBeDefined()
  })

  it(`should show a notification if signin failed`, async () => {
    $store.dispatch = jest.fn().mockResolvedValueOnce(false)
    wrapper.setData({
      fields: {
        signInPassword: `1234567890`,
        signInName: `default`
      }
    })
    await wrapper.vm.onSubmit()
    expect($store.commit).toHaveBeenCalled()
    expect($store.commit.mock.calls[0][0]).toBe(`notifyError`)
  })

  it(`should show the last account used`, () => {
    localStorage.setItem(`prevAccountKey`, `default`)

    const self = {
      accounts: [
        {
          key: `default`
        }
      ],
      fields: {},
      $el: {
        querySelector: jest.fn(() => ({
          focus: jest.fn()
        }))
      }
    }
    TmSessionSignIn.methods.setDefaultAccount.call(self)

    expect(self.fields.signInName).toBe(`default`)
    // the account is preselected so focus on the pw
    expect(self.$el.querySelector).toHaveBeenCalledWith(`#sign-in-password`)
  })
})
