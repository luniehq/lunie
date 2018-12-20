import setup from "../../../helpers/vuex-setup"
import TmBalance from "common/TmBalance"

describe(`TmBalance`, () => {
  let wrapper
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
  })

  it(`has the expected html structure before adding props`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
