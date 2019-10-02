import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { mount, createLocalVue } from "@vue/test-utils"
import TmSessionImportBackupCode from "common/TmSessionImportBackupCode"

import TmBtn from "common/TmBtn"

jest.mock(`scripts/google-analytics.js`, () => () => {})
const seed = `goose toward escape engine wheel board help torch avocado educate rose rebel rigid side aspect abandon grace admit inherit female grant pledge shine inquiry`
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)
localVue.directive(`tooltip`, () => {})
localVue.directive(`focus`, () => {})

describe(`TmSessionImportBackupCode`, () => {
  let wrapper, $store

  it(`has the expected html structure`, () => {
    const getters = {}
    $store = {
      state: {
        recover: {
          name: ``,
          seed: ``,
          password: ``,
          passwordConfirm: ``,
          warning: false
        }
      },
      getters,
      commit: jest.fn(),
      dispatch: jest.fn(async () => true)
    }
    wrapper = mount(TmSessionImportBackupCode, {
      localVue,
      mocks: {
        $store,
        $router: {
          push: jest.fn()
        }
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should disable button if seed is not filled in`, async () => {
    const getters = {
      connected: () => true
    }
    $store = {
      state: {
        recover: {
          name: ``,
          seed: ``,
          password: ``,
          passwordConfirm: ``,
          warning: false
        }
      },
      getters,
      commit: jest.fn(),
      dispatch: jest.fn(async () => true)
    }
    wrapper = mount(TmSessionImportBackupCode, {
      localVue,
      mocks: {
        $store,
        $router: {
          push: jest.fn()
        }
      },
      stubs: [`router-link`]
    })
    expect(wrapper.find(TmBtn).attributes(`disabled`)).toBe(`disabled`)
  })

  it(`should show error if seed is not 24 words long`, async () => {
    const getters = {
      connected: () => true,
      seed: () => `asdf asdf asdf asdf`
    }
    $store = {
      state: {
        recover: {
          name: ``,
          seed: `asdf asdf asdf asdf`,
          password: ``,
          passwordConfirm: ``,
          warning: false
        }
      },
      getters,
      commit: jest.fn(),
      dispatch: jest.fn(async () => true)
    }
    wrapper = mount(TmSessionImportBackupCode, {
      localVue,
      mocks: {
        $store,
        $router: {
          push: jest.fn()
        }
      },
      stubs: [`router-link`]
    })

    // console.log(wrapper.html())
    const input = wrapper.find(`textarea`)
    input.trigger(`input`)
    // console.log(input.html())
    expect(wrapper.find(TmBtn).attributes(`disabled`)).toBe(`disabled`)
  })

  it(`should show error if seed is not 24 words long`, async () => {
    const getters = {
      connected: () => true,
      seed: () => `asdf asdf asdf asdf`
    }
    $store = {
      state: {
        recover: {
          name: ``,
          seed: `asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf`,
          password: ``,
          passwordConfirm: ``,
          warning: false
        }
      },
      getters,
      commit: jest.fn(),
      dispatch: jest.fn(async () => true)
    }
    wrapper = mount(TmSessionImportBackupCode, {
      localVue,
      mocks: {
        $store,
        $router: {
          push: jest.fn()
        }
      },
      stubs: [`router-link`]
    })
    //console.log(wrapper.html())
    expect(wrapper.find(TmBtn).attributes(`disabled`)).toBe(undefined)
  })

  /* it(`should show error if seed is not 24 words long`, async () => {
    wrapper.setData({
      fields: {
        importSeed: `asdf asdf asdf asdf`
      }
    })
    await wrapper.vm.onSubmit()
    expect($store.commit.mock.calls[0]).toBeUndefined()
    expect(wrapper.find(`.tm-form-msg-error`)).toBeDefined()
  })

  it(`should show error if password don't match`, async () => {
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
  }) */
})
