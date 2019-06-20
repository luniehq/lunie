import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { mount, createLocalVue } from "@vue/test-utils"
import TmSessionImport from "common/TmSessionImport"
jest.mock(`scripts/google-analytics.js`, () => () => {})
const seed = `goose toward escape engine wheel board help torch avocado educate rose rebel rigid side aspect abandon grace admit inherit female grant pledge shine inquiry`
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)
localVue.directive(`tooltip`, () => {})
localVue.directive(`focus`, () => {})

describe(`TmSessionImport`, () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        connected: () => true
      }
    })
    wrapper = mount(TmSessionImport, {
      localVue,
      store
    })
    store.commit = jest.fn()
    store.dispatch = jest.fn(async () => true)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should set the current view to the state`, () => {
    const self = {
      $emit: jest.fn()
    }
    TmSessionImport.methods.setState.call(self, `someState`)
    expect(self.$emit).toHaveBeenCalledWith(`route-change`, `someState`)
  })

  it(`should go back to the exiting account screen`, () => {
    const self = {
      $emit: jest.fn()
    }
    TmSessionImport.methods.goBack.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`route-change`, `existing`)
  })

  it(`should signal signed in state on successful login`, async () => {
    const self = {
      $store: {
        dispatch: jest.fn(),
        commit: jest.fn()
      },
      $emit: jest.fn(),
      fields: {
        importName: `foo123`,
        importPassword: `1234567890`,
        importPasswordConfirm: `1234567890`,
        importSeed: seed
      },
      $v: {
        $touch: () => {},
        $error: false
      }
    }
    await TmSessionImport.methods.onSubmit.call(self)
    expect(self.$store.commit).toHaveBeenCalledWith(`notify`, {
      body: `Your account has been successfully imported.`,
      title: `Welcome back!`
    })
    expect(self.$store.dispatch).toHaveBeenCalledWith(`signIn`, {
      errorCollection: undefined,
      sessionType: `local`,
      localKeyPairName: `foo123`,
      password: `1234567890`
    })
  })

  it(`should close the modal on successful login`, async () => {
    const self = {
      $store: {
        dispatch: jest.fn(),
        commit: jest.fn()
      },
      $emit: jest.fn(),
      fields: {
        importName: `foo123`,
        importPassword: `1234567890`,
        importPasswordConfirm: `1234567890`,
        importSeed: seed
      },
      $v: {
        $touch: () => {},
        $error: false
      }
    }
    await TmSessionImport.methods.onSubmit.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`close`)
  })

  it(`should close`, () => {
    const self = {
      $emit: jest.fn()
    }
    TmSessionImport.methods.close.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`close`)
  })

  it(`should show error if seed is not filled in`, async () => {
    wrapper.setData({ fields: { importSeed: `` } })
    await wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find(`.tm-form-msg-error`)).toBeDefined()
  })

  it(`should show error if seed is 16 words long`, async () => {
    wrapper.setData({
      fields: {
        importSeed: `asdf asdf asdf asdf`
      }
    })
    await wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find(`.tm-form-msg-error`)).toBeDefined()
  })

  it(`should show error if password is not confirmed`, async () => {
    wrapper.setData({
      fields: {
        importName: `foo123`,
        importPassword: `1234567890`,
        importPasswordConfirm: `notthesame`,
        importSeed: seed
      }
    })
    await wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find(`.tm-form-msg-error`)).toBeDefined()
  })

  it(`should not continue if creation failed`, async () => {
    store.dispatch = jest.fn(() => Promise.reject(new Error(`Wrong password`)))
    wrapper.setData({
      fields: {
        importName: `foo123`,
        importPassword: `1234567890`,
        importPasswordConfirm: `1234567890`,
        importSeed: seed
      }
    })
    await wrapper.vm.onSubmit()
    expect(store.commit).toHaveBeenCalledWith(`notifyError`, {
      title: `Couldn't create account`,
      body: expect.stringContaining(`Wrong password`)
    })
  })

  it(`should show a notification if creation failed`, async () => {
    store.dispatch = jest.fn(() => Promise.reject({ message: `test` }))
    wrapper.setData({
      fields: {
        importName: `foo123`,
        importPassword: `1234567890`,
        importPasswordConfirm: `1234567890`,
        importSeed: seed
      }
    })
    await wrapper.vm.onSubmit()
    expect(store.commit.mock.calls[0][0]).toEqual(`notifyError`)
    expect(store.commit.mock.calls[0][1].body).toEqual(`test`)
  })
})
