import setup from "../../../helpers/vuex-setup"
import TableProposals from "renderer/components/governance/TableProposals"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

const { proposals, tallies } = lcdClientMock.state

describe(`TableProposals`, () => {
  let wrapper
  const { mount } = setup()

  const $store = {
    commit: jest.fn(),
    dispatch: jest.fn(),
    getters: {
      proposals: { proposals, tallies }
    }
  }

  beforeEach(() => {
    const instance = mount(TableProposals, {
      doBefore: ({ store }) => {
        store.commit(`setConnected`, true)
        store.state.session.address = `address1234`
        store.commit(`updateWalletBalance`, {
          denom: `atom`,
          amount: 1337
        })
        for (const [proposal_id, tally_result] of Object.entries(tallies)) {
          store.commit(`setProposalTally`, { proposal_id, tally_result })
        }
      },
      propsData: { proposals },
      $store
    })
    wrapper = instance.wrapper
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should sort the proposals by selected property`, () => {
    wrapper.vm.sort.property = `proposal_id`
    wrapper.vm.sort.order = `asc`

    expect(wrapper.vm.filteredProposals[0].title).toEqual(
      lcdClientMock.state.proposals[`1`].title
    )

    wrapper.vm.sort.property = `proposal_id`
    wrapper.vm.sort.order = `desc`

    expect(wrapper.vm.filteredProposals[0].title).toEqual(
      lcdClientMock.state.proposals[`6`].title
    )
  })

  it(`should filter the proposals`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.vm.filteredProposals[0].description).toBe(
      lcdClientMock.state.proposals[`6`].description
    )
  })
})
