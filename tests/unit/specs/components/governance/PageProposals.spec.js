import { shallowMount } from "@vue/test-utils"
import PageProposals from "governance/PageProposals"
import { proposals, tallies } from "../../store/json/proposals"

describe(`PageProposals`, () => {
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
      connected: true,
      depositDenom: `lunies`
    }

    const wrapper = shallowMount(PageProposals, {
      mocks: {
        $store
      }
    })
    expect(wrapper.element).toMatchSnapshot()
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
      connected: false,
      depositDenom: `lunies`
    }

    const wrapper = shallowMount(PageProposals, {
      mocks: {
        $store
      }
    })
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

    const wrapper = shallowMount(PageProposals, {
      mocks: {
        $store
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

    const wrapper = shallowMount(PageProposals, {
      mocks: {
        $store
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

    const wrapper = shallowMount(PageProposals, {
      mocks: {
        $store
      }
    })

    const $refs = { modalPropose: { open: jest.fn() } }
    wrapper.vm.$refs = $refs
    wrapper.find("#propose-btn").trigger("click")
    expect($refs.modalPropose.open).toHaveBeenCalled()
  })
})
