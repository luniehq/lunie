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
    store.state.user.address = lcdClientMock.addresses[0]
  })

  describe(`has the expected html structure`, () => {
    it(`if user has signed in`, async () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
      expect(wrapper.vm.tabs[0]).toMatchObject({
        displayName: `My Delegations`,
        pathName: `My Delegations`
      })
    })

    it(`if user hasn't signed in`, async () => {
      const instance = mount(PageStaking, {
        doBefore: ({ store }) => {
          store.commit(`setSignIn`, false)
        },
        stubs: {
          "tm-balance": true
        }
      })
      wrapper = instance.wrapper
      store = instance.store
      expect(wrapper.vm.$el).toMatchSnapshot()
      expect(wrapper.vm.tabs).not.toContain({
        displayName: `My Delegations`,
        pathName: `My Delegations`
      })
    })
  })

  it(`should refresh candidates on click`, () => {
    wrapper
      .findAll(`.tool-bar i`)
      .at(1)
      .trigger(`click`)
    expect(store.dispatch).toHaveBeenCalledWith(`updateDelegates`)
  })
})
