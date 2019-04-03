import setup from "../../../helpers/vuex-setup"
import ToolBar from "common/ToolBar"
describe(`ToolBar`, () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(ToolBar)
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

  it(`goes back correctly and updates the state`, () => {
    // this mocks the values that would come from the store through `getters.js`
    let getterValues = {
      lastPage: `/staking`,
      $router: {
        push: jest.fn((route, cb) => cb())
      },
      pauseHistory: jest.fn(),
      popHistory: jest.fn()
    }

    ToolBar.methods.back.call({
      ...getterValues
    })
    expect(getterValues.$router.push).toHaveBeenCalledWith(
      `/staking`,
      expect.any(Function)
    )
    expect(getterValues.pauseHistory).toHaveBeenCalled()
    expect(getterValues.popHistory).toHaveBeenCalled()
  })
})
