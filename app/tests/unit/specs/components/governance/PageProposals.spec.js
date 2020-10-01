import { shallowMount } from "@vue/test-utils"
import PageProposals from "governance/PageProposals"
import { proposals } from "../../store/json/proposals"

describe(`PageProposals`, () => {
  let wrapper, $store, $apollo, governanceOverview

  governanceOverview = {
    topVoters: [
      {
        name: "Ohnename",
      },
      {
        name: "DemocraticActivePerson",
      },
    ],
    links: [],
  }

  $store = {
    commit: jest.fn(),
    dispatch: jest.fn(),
    state: {
      connection: {
        network: "cosmos-hub-mainnet",
      },
      session: {
        experimentalMode: true,
      },
    },
    getters: {
      network: "cosmos-hub-mainnet",
      stakingDenom: "ATOM",
      currentNetwork: {
        id: "cosmos-hub-mainnet",
        network_type: "cosmos",
        stakingDenom: "ATOM",
      },
    },
  }

  $apollo = {
    queries: {
      proposals: {
        loading: false,
        error: undefined,
      },
      parameters: {
        loading: false,
        error: undefined,
      },
      governanceOverview: {
        loading: false,
        error: undefined,
      },
    },
  }

  beforeEach(() => {
    wrapper = shallowMount(PageProposals, {
      mocks: {
        $store,
        $apollo,
      },
    })
    wrapper.setData({
      proposals,
      parameters: {
        depositDenom: "ATOM",
      },
      governanceOverview,
    })
  })

  it(`shows a proposals table`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a message if still loading`, async () => {
    wrapper.vm.$apollo.queries.proposals.loading = true
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a message if there is nothing to display`, async () => {
    wrapper.setData({
      proposals: [],
      governanceOverview,
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`opens a create proposal modal`, () => {
    wrapper.setData({
      proposalsLoaded: true,
      governanceOverviewLoaded: true,
      governanceOverview,
    })
    const $refs = { modalPropose: { open: jest.fn() } }
    wrapper.vm.$refs = $refs
    wrapper.find("#propose-btn").trigger("click")
    expect($refs.modalPropose.open).toHaveBeenCalled()
  })

  it(`refetches proposals after a successful proposal creation`, () => {
    wrapper.vm.$apollo.queries.proposals.refetch = jest.fn()
    wrapper.vm.afterPropose()
    expect(wrapper.vm.$apollo.queries.proposals.refetch).toHaveBeenCalled()
  })

  it(`should show How Cosmos Governance Works tutorial`, () => {
    wrapper.setData({
      showTutorial: false,
      governanceOverview,
    })
    wrapper.vm.openTutorial()
    expect(wrapper.vm.showTutorial).toBe(true)
  })

  it(`should hide How Cosmos Governance Works tutorial`, () => {
    wrapper.setData({
      showTutorial: true,
      governanceOverview,
    })
    wrapper.vm.hideTutorial()
    expect(wrapper.vm.showTutorial).toBe(false)
  })
})
