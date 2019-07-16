import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmSessionImport from "common/TmSessionImport"
jest.mock(`scripts/google-analytics.js`, () => () => {})
const seed = `goose toward escape engine wheel board help torch avocado educate rose rebel rigid side aspect abandon grace admit inherit female grant pledge shine inquiry`
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)
localVue.directive(`tooltip`, () => {})
localVue.directive(`focus`, () => {})

describe(`TmSessionImport`, () => {
  let wrapper, $store

  beforeEach(() => {
    const getters = {
      connected: () => true
    }
    $store = {
      getters,
      commit: jest.fn(),
      dispatch: jest.fn(async () => true)
    }
    wrapper = shallowMount(TmSessionImport, {
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

  it(`should show error if seed is not filled in`, async () => {
    wrapper.setData({ fields: { importSeed: `` } })
    await wrapper.vm.onSubmit()
    expect($store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find(`.tm-form-msg-error`)).toBeDefined()
  })

  it(`should show error if seed is 16 words long`, async () => {
    wrapper.setData({
      fields: {
        importSeed: `asdf asdf asdf asdf`
      }
    })
    await wrapper.vm.onSubmit()
    expect($store.commit.mock.calls[0]).toBeUndefined()
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
    expect($store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find(`.tm-form-msg-error`)).toBeDefined()
  })

  it(`should not continue if creation failed`, async () => {
    $store.dispatch = jest.fn(() => Promise.reject(new Error(`Wrong password`)))
    wrapper.setData({
      fields: {
        importName: `foo123`,
        importPassword: `1234567890`,
        importPasswordConfirm: `1234567890`,
        importSeed: seed
      }
    })
    await wrapper.vm.onSubmit()
    expect($store.commit).toHaveBeenCalledWith(`notifyError`, {
      title: `Couldn't create account`,
      body: expect.stringContaining(`Wrong password`)
    })
  })

  it(`should show a notification if creation failed`, async () => {
    $store.dispatch = jest.fn(() => Promise.reject({ message: `test` }))
    wrapper.setData({
      fields: {
        importName: `foo123`,
        importPassword: `1234567890`,
        importPasswordConfirm: `1234567890`,
        importSeed: seed
      }
    })
    await wrapper.vm.onSubmit()
    expect($store.commit.mock.calls[0][0]).toEqual(`notifyError`)
    expect($store.commit.mock.calls[0][1].body).toEqual(`test`)
  })

  it(`should go to the home page if recovering is successful`, async () => {
    wrapper.setData({
      fields: {
        importName: `foo123`,
        importPassword: `1234567890`,
        importPasswordConfirm: `1234567890`,
        importSeed: seed
      }
    })
    $store.dispatch = jest.fn(() => Promise.resolve())
    await wrapper.vm.onSubmit()
    expect($store.dispatch.mock.calls[0][0]).toEqual(`createKey`)
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/`)
  })
})
