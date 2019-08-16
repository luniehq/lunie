import { shallowMount } from "@vue/test-utils"
import TabProposals from "governance/TabProposals"
import { proposals, tallies } from "../../store/json/proposals"

describe(`TabProposals`, () => {
  let $store

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state: {},
      getters: {}
    }
  })

  it(`shows a proposals table`, async () => {
    $store.state = {
      proposals: {
        loading: false,
        loaded: false,
        proposals,
        tallies
      }
    }

    $store.getters = {
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
    $store.state = {
      proposals: {
        loading: false,
        loaded: false,
        proposals: {},
        tallies: {}
      }
    }

    $store.getters = {
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
    $store.state = {
      proposals: {
        loading: false,
        loaded: false,
        tallies: {},
        proposals: {}
      }
    }

    $store.getters = {
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
