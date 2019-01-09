import setup from "../../../helpers/vuex-setup"
import TableProposals from "renderer/components/governance/TableProposals"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

let { proposals, tallies } = lcdClientMock.state

describe(`TableProposals`, () => {
  let wrapper, store
  let { mount } = setup()

  const $store = {
    commit: jest.fn(),
    dispatch: jest.fn(),
    getters: {
      proposals: { proposals, tallies }
    }
  }

  beforeEach(() => {
    let instance = mount(TableProposals, {
      doBefore: ({ store }) => {
        store.commit(`setConnected`, true)
        store.state.user.address = `address1234`
        store.commit(`setAtoms`, 1337)
        for (const [proposal_id, tally_result] of Object.entries(tallies)) {
          store.commit(`setProposalTally`, { proposal_id, tally_result })
        }
      },
      propsData: { proposals },
      $store
    })
    wrapper = instance.wrapper
    store = instance.store
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
    store.commit(`setSearchVisible`, [`proposals`, true])
    store.commit(`setSearchQuery`, [
      `proposals`,
      lcdClientMock.state.proposals[`1`].title
    ])
    expect(wrapper.vm.filteredProposals[0].description).toBe(
      lcdClientMock.state.proposals[`1`].description
    )
    expect(wrapper.vm.$el).toMatchSnapshot()
    store.commit(`setSearchQuery`, [
      `proposals`,
      lcdClientMock.state.proposals[`2`].title
    ])
    expect(wrapper.vm.filteredProposals[0].description).toBe(
      lcdClientMock.state.proposals[`2`].description
    )
  })

  it(`should update 'somethingToSearch' when there's nothing to search`, () => {
    expect(wrapper.vm.somethingToSearch).toBe(true)
    wrapper.setProps({ proposals: {} })
    expect(wrapper.vm.somethingToSearch).toBe(false)
  })

  it(`should show placeholder if no items to display`, () => {
    let { wrapper } = mount(TableProposals, {
      doBefore: ({ store }) => {
        store.commit(`setConnected`, true)
        store.state.user.address = `address1234`
        store.commit(`setAtoms`, 1337)
      },
      propsData: { proposals: {} },
      stubs: { "data-empty-search": true }
    })
    expect(wrapper.contains(`data-empty-search-stub`)).toBe(true)
  })

  describe(`setSearch`, () => {
    it(`should show search when there is something to search`, () => {
      wrapper.vm.setSearch()
      expect(store.commit).toHaveBeenCalledWith(`setSearchVisible`, [
        `proposals`,
        true
      ])
    })

    it(`should not show search when there is nothing to search`, () => {
      wrapper.setProps({ proposals: {} })
      wrapper.vm.setSearch()
      expect(store.commit).not.toHaveBeenCalledWith(`setSearchVisible`, [
        `proposals`,
        true
      ])
    })
  })
})
