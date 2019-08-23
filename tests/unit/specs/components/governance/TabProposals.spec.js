import { shallowMount } from "@vue/test-utils"
import TabProposals from "governance/TabProposals"
import { proposals, tallies } from "../../store/json/proposals"

describe(`TabProposals`, () => {
  let wrapper, $store, $apollo

  beforeEach(() => {
    $store = {
      getters: { depositDenom: "lunies" }
    }
    $apollo = {
      queries: {
        proposals: {
          loading: false
        }
      }
    }
    wrapper = shallowMount(TabProposals, {
      mocks: {
        $store,
        $apollo
      }
    })
    wrapper.setData({ proposals: Object.values(proposals) })
  })

  it(`shows a proposals table`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a message if still connecting`, async () => {
    wrapper = shallowMount(TabProposals, {
      mocks: {
        $store,
        $apollo: {
          queries: {
            proposals: {
              loading: true
            }
          }
        }
      }
    })
    wrapper.setData({ proposals: Object.values(proposals) })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a message if still loading`, async () => {
    $store.state = {
      proposals: {
        loading: true,
        loaded: false,
        proposals: {},
        tallies: {}
      },
      connected: true
    }

    $store.getters = {
      connected: true,
      depositDenom: `lunies`
    }

    const wrapper = shallowMount(TabProposals, {
      mocks: {
        $store,
        $apollo
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a message if there is nothing to display`, async () => {
    $store.state = {
      proposals: {
        loading: false,
        loaded: false,
        tallies: {},
        proposals: {}
      }
    }

    $store.getters = {
      connected: true,
      depositDenom: `lunies`
    }

    const wrapper = shallowMount(TabProposals, {
      mocks: {
        $store,
        $apollo
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`opens a create proposal modal`, () => {
    $store.state = {
      proposals: {
        loading: false,
        loaded: false,
        proposals,
        tallies
      }
    }

    $store.getters = {
      connected: true,
      depositDenom: `lunies`
    }

    const wrapper = shallowMount(TabProposals, {
      mocks: {
        $store,
        $apollo
      }
    })

    const $refs = { modalPropose: { open: jest.fn() } }
    wrapper.vm.$refs = $refs
    wrapper.find("#propose-btn").trigger("click")
    expect($refs.modalPropose.open).toHaveBeenCalled()
  })
})
