import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import TmSessionSignUpSeed from "common/TmSessionSignUpSeed"

describe(`TmSessionSignUpSeed`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper, $store

  beforeEach(() => {
    $store = {
      state: {
        session: { insecureMode: true },
        signup: {
          signUpSeed: `asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf`,
          signUpWarning: false
        }
      },
      commit: jest.fn(),
      dispatch: jest.fn().mockResolvedValue(""),
      mutations: {
        updateField: jest.fn()
      }
    }

    wrapper = shallowMount(TmSessionSignUpSeed, {
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
    expect(wrapper.vm.fieldSeed).not.toBe(``)
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`validation should fail if fieldWarning is not checked`, async () => {
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$v.fieldWarning.$error).toBe(true)
  })

  it(`should commit updateField on fieldWarning field change`, async () => {
    wrapper.vm.fieldWarning = true
    await wrapper.vm.onSubmit()
    expect($store.commit).toHaveBeenCalledWith(`updateField`, {
      field: `signUpWarning`,
      value: true
    })
  })

  it(`should dispatch createKey if form is submitted`, async () => {
    wrapper.vm.$store.state.signup.signUpSeed = `asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf`
    wrapper.vm.$store.state.signup.signUpPassword = `1234567890`
    wrapper.vm.$store.state.signup.signUpName = `HappyLunieUser`
    wrapper.vm.$store.state.signup.signUpWarning = true
    await wrapper.vm.onSubmit()
    expect($store.dispatch).toHaveBeenCalledWith(`createKey`, {
      name: "HappyLunieUser",
      password: "1234567890",
      seedPhrase:
        "asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf"
    })
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/create/success`)

    // expect($store.dispatch).toHaveBeenCalledWith(`createSeed`)
    // expect($store.commit).toHaveBeenCalledWith(`updateField`, {
    //   field: "signUpSeed",
    //   value: ""
    // })
  })

  it(`should commit notifyError on createKey dispatch error`, async () => {
    wrapper.vm.$store.state.signup.signUpSeed = `asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf`
    wrapper.vm.$store.state.signup.signUpPassword = `1234567890`
    wrapper.vm.$store.state.signup.signUpName = `HappyLunieUser`
    wrapper.vm.$store.state.signup.signUpWarning = true
    wrapper.vm.$store.dispatch = {
      createKey: jest.fn().mockRejectedValue(new Error())
    }
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$store.commit).toHaveBeenCalledWith(`notifyError`, {
      body: `this.$store.dispatch is not a function`,
      title: `Couldn't create account`
    })
  })

})
