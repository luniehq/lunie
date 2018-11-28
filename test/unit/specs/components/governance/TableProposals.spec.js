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
    wrapper.vm.sort.order = `asc`

    expect(wrapper.vm.filteredProposals[0].title).toEqual(
      lcdClientMock.state.proposals[0].title
    )

    wrapper.vm.sort.property = `proposal_id`
    wrapper.vm.sort.order = `desc`

    expect(wrapper.vm.filteredProposals[0].title).toEqual(
      lcdClientMock.state.proposals.reverse()[0].title
    )
  })

  it(`should filter the proposals`, () => {
    store.commit(`setSearchVisible`, [`proposals`, true])
    store.commit(`setSearchQuery`, [
      `proposals`,
      lcdClientMock.state.proposals[0].title
    ])
    expect(wrapper.vm.filteredProposals[0].description).toBe(
      lcdClientMock.state.proposals[0].description
    )
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
    store.commit(`setSearchQuery`, [
      `proposals`,
      lcdClientMock.state.proposals[1].title
    ])
    expect(wrapper.vm.filteredProposals[0].description).toBe(
      lcdClientMock.state.proposals[1].description
    )
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
    const $store = {
      commit: jest.fn()
    }

    it(`should show search when there is something to search`, () => {
      let { wrapper, store } = mount(TableProposals, {
        propsData: {
          proposals: lcdClientMock.state.proposals,
          loading: false
        },
        $store
      })

      wrapper.vm.setSearch()
      expect(store.commit).toHaveBeenCalledWith(`setSearchVisible`, [
        `proposals`,
        true
      ])
    })

    it(`should not show search when there is nothing to search`, () => {
      let { wrapper, store } = mount(TableProposals, {
        propsData: {
          proposals: [],
          loading: false
        },
        $store
      })

      wrapper.vm.setSearch()
      expect(store.commit).not.toHaveBeenCalledWith(`setSearchVisible`, [
        `proposals`,
        true
      ])
    })
  })
})
