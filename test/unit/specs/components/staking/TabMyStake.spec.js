import setup from "../../../helpers/vuex-setup"
import TabMyStake from "renderer/components/staking/TabMyStake"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe("TabMyStake", () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(TabMyStake)
    wrapper = instance.wrapper
    store = instance.store

    store.commit("setConnected", true)
    store.state.user.address = lcdClientMock.addresses[0]
    store.commit("setAtoms", 1337)
    wrapper.update()
  })

  test(`yourValidators`, () => {
    expect(wrapper.vm.yourValidators).toEqual([
      {
        bond_height: "0",
        bond_intra_tx_counter: 6,
        commission: "0",
        commission_change_rate: "0",
        commission_change_today: "0",
        commission_max: "0",
        delegator_shares: "14",
        description: {
          country: "Canada",
          description: "Mr Mounty",
          moniker: "mr_mounty"
        },
        id: "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw",
        isValidator: true,
        owner: "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw",
        prev_bonded_shares: "0",
        proposer_reward_pool: null,
        pub_key: {
          data: "t3zVnKU42WNH+NtYFcstZRLFVULWV8VagoP0HwW43Pk=",
          type: "AC26791624DE60"
        },
        revoked: false,
        status: 2,
        tokens: "14",
        voting_power: "14.00"
      }
    ])
  })
})
