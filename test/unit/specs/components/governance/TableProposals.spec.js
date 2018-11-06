import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
import TableProposals from "renderer/components/governance/TableProposals"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`TableProposals`, () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(TableProposals, {
      propsData: {
        proposals: lcdClientMock.state.proposals,
        loading: false
      }
    })

    wrapper = instance.wrapper
    store = instance.store

    store.commit(`setConnected`, true)
    store.state.user.address = `address1234`
    store.commit(`setAtoms`, 1337)
    wrapper.update()
  })

  it(`has the expected html structure`, async () => {
    // after importing the @tendermint/ui components from modules
    // the perfect scroll plugin needs a $nextTick and a wrapper.update
    // to work properly in the tests (snapshots weren't matching)
    // this has occured across multiple tests
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it(`should sort the proposals by selected property`, () => {
    wrapper.vm.sort.property = `proposal_id`
    wrapper.vm.sort.order = `desc`

    expect(wrapper.vm.filteredProposals).toEqual(lcdClientMock.state.proposals)

    wrapper.vm.sort.property = `operator_address`
    wrapper.vm.sort.order = `asc`

    expect(wrapper.vm.filteredProposals).toEqual(
      lcdClientMock.state.proposals.reverse()
    )
  })

  it(`should filter the proposals`, () => {
    store.commit(`setSearchVisible`, [`proposals`, true])
    store.commit(`setSearchQuery`, [
      `proposals`,
      lcdClientMock.state.proposals[2]
    ])
    expect(wrapper.vm.filteredProposals).toEqual([
      lcdClientMock.state.proposals[2]
    ])
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
    store.commit(`setSearchQuery`, [
      `proposals`,
      lcdClientMock.state.proposals[1]
    ])
    expect(wrapper.vm.filteredProposals).toEqual([
      lcdClientMock.state.proposals[1]
    ])
  })

  it(`should update 'somethingToSearch' when there's nothing to search`, () => {
    expect(wrapper.vm.somethingToSearch).toBe(true)
    wrapper.setProps({
      proposals: [],
      loading: true
    })
    expect(wrapper.vm.somethingToSearch).toBe(false)
  })

  it(`should show placeholder if delegates are loading`, () => {
    let { wrapper } = mount(TableProposals, {
      propsData: {
        proposals: [],
        loading: true
      },
      stubs: { "tm-data-loading": `<data-loading />` }
    })
    expect(wrapper.contains(`data-loading`)).toBe(true)
  })

  describe(`setSearch`, () => {
    it(`should show search when there is something to search`, () => {
      const $store = {
        commit: jest.fn()
      }

      TableProposals.methods.setSearch(true, {
        somethingToSearch: true,
        $store
      })

      expect($store.commit.mock.calls).toEqual([
        [`setSearchVisible`, [`proposals`, true]]
      ])
    })

    it(`should not show search when there is nothing to search`, () => {
      const $store = {
        commit: jest.fn()
      }

      TableProposals.methods.setSearch(true, {
        somethingToSearch: false,
        $store
      })

      expect($store.commit.mock.calls).toEqual([])
    })
  })
})
