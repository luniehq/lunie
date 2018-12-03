import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
import TabParameters from "renderer/components/staking/TabParameters"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

let { pool, stakingParameters } = lcdClientMock.state

describe(`TabParameters`, () => {
  let wrapper, store
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)

  const $store = {
    commit: jest.fn(),
    dispatch: jest.fn(),
    getters: {
      pool,
      stakingParameters,
      totalAtoms: 100,
      user: { atoms: 42 },
      bondingDenom: `Stake`
    }
  }

  beforeEach(() => {
    let instance = mount(TabParameters, {
      localVue,
      doBefore: ({ store }) => {
        store.commit(`setPool`, pool)
        store.commit(`setStakingParameters`, stakingParameters)
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
    expect(store.state.stakingParameters.parameters).toEqual(stakingParameters)
    expect(store.state.pool.pool).toEqual(pool)
  })

  it(`displays unbonding period in days`, () => {
    expect(wrapper.vm.unbondingTimeInDays).toEqual(3)
  })
})
