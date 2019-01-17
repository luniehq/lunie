import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmPage from "renderer/components/common/TmPage"
import Vuex from "vuex"
const localVue = createLocalVue()

localVue.use(Vuex)

describe(`TmPage`, () => {
  let wrapper
  let actions
  let store
  let getters

  beforeEach(() => {
    getters = {
      user: () => ({ address: `cosmos`, atoms: 1 }),
      connected: () => true
    }
    actions = {
      actionClick: jest.fn(),
      actionInput: jest.fn()
    }
    store = new Vuex.Store({
      state: {},
      actions,
      getters
    })
  })

  it(`has the expected html structure`, async () => {
    wrapper = shallowMount(TmPage, { store, localVue })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show links to other pages`, () => {
    wrapper = shallowMount(TmPage, {
      store,
      localVue,
      propsData: {
        dataset: [1, 2, 3],
        search: `stuff`
      },
      mocks: {
        $route: {
          name: `r1`
        }
      },
      slots: {
        "managed-body": `<stub-managed--body />`
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`define if there is somethingToSearch`, () => {
    expect(TmPage.methods.somethingToSearch.call({ dataset: [1] })).toBe(true)
    expect(TmPage.methods.somethingToSearch.call({ dataset: [] })).toBe(false)
  })

  it(`turn on search modal through the store via setSearch`, () => {
    const $store = { commit: jest.fn() }
    TmPage.methods.setSearch.call({
      somethingToSearch: () => true,
      search: `what`,
      $store
    })
    expect($store.commit).toHaveBeenCalledWith(`setSearchVisible`, [
      `what`,
      true
    ])
  })

  it(`not interacting with the store if there is nothing to search via setSearch`, () => {
    const $store = { commit: jest.fn() }
    TmPage.methods.setSearch.call({
      somethingToSearch: () => false,
      search: `what`,
      $store
    })
    expect($store.commit).not.toHaveBeenCalled()
  })

  it(`turn off search modal through store via setSearch`, () => {
    const $store = { commit: jest.fn() }
    TmPage.methods.setSearch.call(
      {
        somethingToSearch: () => true,
        search: `what`,
        $store
      },
      false
    )
    expect($store.commit).toHaveBeenCalledWith(`setSearchVisible`, [
      `what`,
      false
    ])
  })

  it(`compose searching functions if they are wanted`, () => {
    const serarchingFunctions = { somethingToSearch: true, setSearch: true }
    expect(
      TmPage.computed.searchable.call({
        dataset: [],
        search: `something`,
        ...serarchingFunctions
      })
    ).toEqual(serarchingFunctions)
    expect(TmPage.methods.somethingToSearch.call(serarchingFunctions)).toBe(
      undefined
    )
  })

  it(`compose the refresh functions if props wanted to`, () => {
    const refresh = jest.fn()
    wrapper = shallowMount(TmPage, {
      store,
      localVue,
      propsData: {
        refresh
      }
    })
    expect(wrapper.vm.refreshable).toEqual({ connected: true, refresh })
  })
})
