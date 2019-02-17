import setup from "../../../helpers/vuex-setup"
import TmBalance from "common/TmBalance"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`TmBalance`, () => {
  let wrapper, store
  const { stakingParameters } = lcdClientMock.state
  const { mount } = setup()

  beforeEach(() => {
    const instance = mount(TmBalance, {
      getters: {
        session: () => ({
          address: `cosmos1address`,
          signedIn: true
        }),
        liquidAtoms: () => 123,
        totalAtoms: () => 321
      },
      propsData: {
        tabs: []
      }
    })
    wrapper = instance.wrapper
    store = instance.store
    store.commit(`setStakingParameters`, stakingParameters.parameters)
  })

  it(`has the expected html structure before adding props`, () => {
    expect(wrapper.html()).toMatchSnapshot()
  })
})
