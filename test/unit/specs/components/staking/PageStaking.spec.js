import setup from "../../../helpers/vuex-setup"
import PageStaking from "renderer/components/staking/PageStaking"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

// TODO refactor according to new unit test standard
describe(`PageStaking`, () => {
  let wrapper, store
  const { mount } = setup()

  beforeEach(() => {
    const instance = mount(PageStaking, {
      doBefore: ({ store }) => {
        store.commit(`setSignIn`, true)
        store.commit(`setConnected`, true)
        store.dispatch(`updateDelegates`)
      },
      stubs: {
        "tm-balance": true
      }
    })
    wrapper = instance.wrapper
    store = instance.store
    store.state.session.address = lcdClientMock.addresses[0]
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
