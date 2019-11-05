import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import TmSessionSignUp from "common/TmSessionSignUp"
jest.mock("@lunie/cosmos-keys", () => ({
  getWalletIndex: function() {
    return [{ name: `Happy Lunie User`, address: `xyz123` }]
  }
}))

describe(`TmSessionSignUp`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper, $store

  beforeEach(() => {
    $store = {
      state: {
        session: { insecureMode: true },
        signup: {
          signUpName: ""
        }
      },
      commit: jest.fn(),
      dispatch: jest.fn(),
      mutations: {
        updateField: jest.fn()
      }
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

  it("renders", () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should commit updateField on field change`, async () => {
    wrapper.setData({ fieldName: `HappyLunieUser` })
    expect(wrapper.vm.$store.commit).toHaveBeenCalledWith(`updateField`, {
      field: `signUpName`,
      value: `HappyLunieUser`
    })
  })

  it(`validation should fail if name is not filled in`, async () => {
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$v.fieldName.$error).toBe(true)
  })

  it(`validation should fail if name lenght < 3 characters`, async () => {
    wrapper.vm.$store.state.signup.signUpName = `as`
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$v.fieldName.$error).toBe(true)
  })

  it(`validation should not fail if name lenght >= 3 characters`, async () => {
    wrapper.vm.$store.state.signup.signUpName = `Happy Lunie User 2`
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$v.fieldName.$error).toBe(false)
  })

  it(`validation should fail if name exists already in stored accounts`, async () => {
    wrapper.vm.$store.state.signup.signUpName = `Happy Lunie User`
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$v.fieldName.$error).toBe(true)
  })

  it(`validation should fail if name exists already in stored accounts`, async () => {
    wrapper.vm.$store.state.signup.signUpName = `Happy Lunie User`
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$v.fieldName.$error).toBe(true)
  })

  it(`should go to /create/password when submit the form`, async () => {
    wrapper.vm.$store.state.signup.signUpName = `HappyLunieUser`
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/create/password`)
  })
})
