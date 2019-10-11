import { shallowMount } from "@vue/test-utils"
import PageProposals from "governance/PageProposals"
import { proposals } from "../../store/json/proposals"

describe(`PageProposals`, () => {
  let wrapper, $store, $apollo

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state: {},
      getters: {}
    }
    $apollo = {
      queries: {
        proposals: {
          loading: false,
          error: undefined
        },
        parameters: {
          loading: false,
          error: undefined
        }
      }
    }
    const args = {
      mocks: {
        $store,
        $apollo
      }
    }
    wrapper = shallowMount(PageProposals, args)
  })

  it(`shows a proposals table`, async () => {
    wrapper.setData({
      proposals,
      parameters: {
        depositDenom: "lunies"
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a message if still loading`, async () => {
    wrapper.vm.$apollo.queries.proposals.loading = true
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a message if there is nothing to display`, async () => {
    wrapper.setData({
      proposals: []
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`opens a create proposal modal`, () => {
    const $refs = { modalPropose: { open: jest.fn() } }
    wrapper.vm.$refs = $refs
    wrapper.find("#propose-btn").trigger("click")
    expect($refs.modalPropose.open).toHaveBeenCalled()
  })
})
