import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import PageGovernance from "src/components/governance/PageGovernance"
import ModalPropose from "src/ActionModal/components/ModalPropose"

// TODO: refactor according to new unit test standard
describe(`PageGovernance`, () => {
  let wrapper, $store
  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})
  localVue.directive(`clipboard`, () => {})

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        proposals: {},
        depositDenom: `stake`,
        connected: true,
        session: {}
      }
    }
    wrapper = shallowMount(PageGovernance, {
      stubs: ["tm-balance", "router-view"],
      mocks: {
        $store
      }
    })

    wrapper.vm.$refs.modalPropose = { open: () => {} }
  })

  it(`has the expected html structure`, async () => {
    // somehow we need to wait one tick for the total atoms to update
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`disables proposal creation if not connected`, async () => {
    expect(
      wrapper.vm.$el.querySelector(`#propose-btn`).getAttribute(`disabled`)
    ).toBeNull()
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        proposals: {},
        depositDenom: `stake`,
        connected: false,
        session: {}
      }
    }
    wrapper = shallowMount(PageGovernance, {
      stubs: ["tm-balance", "router-view"],
      mocks: {
        $store
      }
    })
    expect(
      wrapper.vm.$el.querySelector(`#propose-btn`).getAttribute(`disabled`)
    ).not.toBeNull()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  describe(`Modal onPropose`, () => {
    it(`displays the Propose modal on click`, () => {
      const proposeBtn = wrapper.find(`#propose-btn`)
      proposeBtn.trigger(`click`)
      expect(wrapper.contains(ModalPropose)).toEqual(true)
    })
  })
})
