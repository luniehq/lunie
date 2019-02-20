import setup from "../../../helpers/vuex-setup"
import ToolBar from "common/ToolBar"
describe(`ToolBar`, () => {
  let wrapper, store
  const { mount } = setup()

  beforeEach(() => {
    const instance = mount(ToolBar)
    wrapper = instance.wrapper
    store = instance.store
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`sets the helper modal`, () => {
    wrapper.vm.enableModalHelp()
    expect(store.state.session.modals.help.active).toBe(true)
  })

  it(`call dispatch to sign the user out`, () => {
    const $store = { dispatch: jest.fn() }
    const self = { $store, $router: { push: jest.fn() } }
    ToolBar.methods.signOut.call(self)
    expect($store.dispatch).toHaveBeenCalledWith(`signOut`)
  })

  it(`opens session modal`, () => {
    const $store = { commit: jest.fn() }
    const self = { $store }
    ToolBar.methods.signIn.call(self)
    expect($store.commit).toHaveBeenCalledWith(`setSessionModalView`, `welcome`)
    expect($store.commit).toHaveBeenCalledWith(`toggleSessionModal`, true)
  })

  it(`check if search should be Enabled`, () => {
    expect(ToolBar.computed.searchEnabled.call({ searching: true })).toBe(true)
    expect(ToolBar.computed.searchEnabled.call({})).toBe(false)
  })

  it(`fails to check if there is somethingToSearch`, () => {
    expect(ToolBar.computed.somethingToSearch.call({})).toBe(undefined)
  })
  it(`succeed in checking if there is somethingToSearch`, () => {
    const somethingToSearch = jest.fn()
    const localThis = { searching: { somethingToSearch } }
    ToolBar.computed.somethingToSearch.call(localThis)
    expect(somethingToSearch).toHaveBeenCalled()
  })

  it(`fails to setSearch`, () => {
    expect(ToolBar.computed.setSearch.call({})).toBe(undefined)
  })

  it(`succeed in setSearch`, () => {
    const setSearch = jest.fn()
    const localThis = { searching: { setSearch } }
    ToolBar.computed.setSearch.call(localThis)
    expect(setSearch).toHaveBeenCalled()
  })
})
