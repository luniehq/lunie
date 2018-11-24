import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
import TabParameters from "renderer/components/staking/TabParameters"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

let pool = lcdClientMock.state.pool
let parameters = lcdClientMock.state.parameters

describe(`TabParameters`, () => {
  let wrapper, store
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)

  const $store = {
    commit: jest.fn(),
    dispatch: jest.fn(),
    getters: {
      pool,
      parameters,
      totalAtoms: 100,
      user: { atoms: 42 }
    }
  }

  beforeEach(() => {
    let instance = mount(TabParameters, {
      localVue,
      doBefore: ({ store }) => {
        store.commit(`setPool`, pool)
        store.commit(`setStakingParameters`, parameters)
      },
      $store
    })
    wrapper = instance.wrapper
    store = instance.store
    store.commit(`setConnected`, true)
    wrapper.update()
  })

  it(`has the expected html structure`, async () => {
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it(`shows the staking parameters and pool`, () => {
    expect(store.state.parameters.parameters).toEqual(parameters)
    expect(store.state.pool.pool).toEqual(pool)
  })

  it(`displays unbonding period in days`, () => {
    expect(wrapper.vm.unbondingTimeInDays).toEqual(3)
  })
})
