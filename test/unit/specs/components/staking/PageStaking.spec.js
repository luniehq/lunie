import setup from "../../../helpers/vuex-setup"
import PageStaking from "renderer/components/staking/PageStaking"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`PageStaking`, () => {
  let wrapper, store
  let { stakingParameters } = lcdClientMock.state
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(PageStaking)
    wrapper = instance.wrapper
    store = instance.store

    store.commit(`setConnected`, true)
    store.state.user.address = lcdClientMock.addresses[0]
    store.dispatch(`updateDelegates`)
    store.commit(`setAtoms`, 1337)
    store.commit(`setStakingParameters`, stakingParameters.parameters)
  })

  it(`has the expected html structure`, async () => {
    // somehow we need to wait one tick for the total atoms to update
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show the search on click`, () => {
    wrapper.find(`.tool-bar i.search`).trigger(`click`)
    expect(wrapper.contains(`.tm-modal-search`)).toBe(true)
  })

  it(`should refresh candidates on click`, () => {
    wrapper
      .findAll(`.tool-bar i`)
      .at(1)
      .trigger(`click`)
    expect(store.dispatch).toHaveBeenCalledWith(`updateDelegates`)
  })
})
