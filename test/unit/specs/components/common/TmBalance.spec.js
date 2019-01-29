import setup from "../../../helpers/vuex-setup"
import TmBalance from "common/TmBalance"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`TmBalance`, () => {
  let wrapper, store
  let { stakingParameters } = lcdClientMock.state
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(TmBalance, {
      getters: {
        user: () => {
          return {
            address: `useraddress16876876876876876786876876876876876`
          }
        },
        liquidAtoms: () => 123,
        totalAtoms: () => {
          return 321
        }
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
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
