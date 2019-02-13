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
    expect(store.state.config.modals.help.active).toBe(true)
  })

  it(`call dispatch to sign the user out`, () => {
    wrapper.vm.signOut()
    expect(store.dispatch).toHaveBeenCalledWith(`signOut`)
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
