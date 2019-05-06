import { shallowMount } from "@vue/test-utils"
import TabProposals from "src/components/governance/TabProposals"
import { proposals, tallies } from "../../store/json/proposals"

describe(`TabProposals`, () => {
  let $store

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {}
    }
  })

  it(`shows a proposals table`, async () => {
    $store.getters = {
      proposals: {
        loading: false,
        loaded: false,
        proposals,
        tallies
      },
      connected: true
    }

    const wrapper = shallowMount(TabProposals, {
      mocks: {
        $store
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows a message if still connecting`, async () => {
    $store.getters = {
      proposals: {
        loading: false,
        loaded: false,
        proposals: {},
        tallies: {}
      },
      connected: false
    }

    const wrapper = shallowMount(TabProposals, {
      mocks: {
        $store
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows a message if still loading`, async () => {
    $store.getters = {
      proposals: {
        loading: true,
        loaded: false,
        proposals: {},
        tallies: {}
      },
      connected: true
    }

    const wrapper = shallowMount(TabProposals, {
      mocks: {
        $store
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows a message if there is nothing to display`, async () => {
    $store.getters = {
      proposals: {
        loading: false,
        loaded: false,
        tallies: {},
        proposals: {}
      },
      connected: true
    }

    const wrapper = shallowMount(TabProposals, {
      mocks: {
        $store
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
