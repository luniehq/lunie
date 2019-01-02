import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
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
            atoms: 123,
            address: `useraddress16876876876876876786876876876876876`
          }
        },
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
    wrapper.update()
  })

  it(`has the expected html structure before adding props`, () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
