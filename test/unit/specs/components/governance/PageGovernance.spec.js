import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
import Vuelidate from "vuelidate"
import PageGovernance from "renderer/components/governance/PageGovernance"
import ModalPropose from "renderer/components/governance/ModalPropose"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

const proposal = {
  amount: 15,
  title: `A new text proposal for Cosmos`,
  description: `a valid description for the proposal`,
  type: `Text`
}

describe(`PageGovernance`, () => {
  let wrapper, store
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)

  beforeEach(() => {
    let instance = mount(PageGovernance)
    wrapper = instance.wrapper
    store = instance.store
    store.commit(`setConnected`, true)
    store.state.user.address = lcdClientMock.addresses[0]
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

  it(`should show the search on click`, () => {
    wrapper.find(`.tm-tool-bar i.search`).trigger(`click`)
    expect(wrapper.contains(`.tm-modal-search`)).toBe(true)
  })

  it(`disables proposal creation if not connected`, async () => {
    expect(
      wrapper.vm.$el.querySelector(`#propose-btn`).getAttribute(`disabled`)
    ).toBeNull()
    store.commit(`setConnected`, false)
    wrapper.update()
    expect(
      wrapper.vm.$el.querySelector(`#propose-btn`).getAttribute(`disabled`)
    ).not.toBeNull()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  describe(`Modal onPropose modal on click`, () => {
    it(`displays the Propose modal`, () => {
      let proposeBtn = wrapper.find(`#propose-btn`)
      proposeBtn.trigger(`click`)
      expect(wrapper.contains(ModalPropose)).toEqual(true)
    })
  })

  it(`submits a proposal`, async () => {
    wrapper.vm.$store.commit = jest.fn()
    wrapper.vm.$store.dispatch = jest.fn(() => Promise.resolve())
    await wrapper.vm.propose(proposal)

    expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
      [
        `submitProposal`,
        {
          description: `a valid description for the proposal`,
          initial_deposit: [{ amount: `15`, denom: `steak` }],
          title: `A new text proposal for Cosmos`,
          type: `Text`
        }
      ]
    ])

    expect(wrapper.vm.$store.commit.mock.calls).toEqual([
      [
        `notify`,
        {
          body: `You have successfully submitted a new text proposal`,
          title: `Successful proposal submission!`
        }
      ]
    ])
  })

  it(`raises an error when submitting a proposal fails`, async () => {
    wrapper.vm.$store.commit = jest.fn()
    wrapper.vm.$store.dispatch = jest.fn(() => {
      throw new Error(`unexpected error`)
    })
    await wrapper.vm.propose(proposal)

    expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
      [
        `submitProposal`,
        {
          description: `a valid description for the proposal`,
          initial_deposit: [{ amount: `15`, denom: `steak` }],
          title: `A new text proposal for Cosmos`,
          type: `Text`
        }
      ]
    ])

    expect(wrapper.vm.$store.commit.mock.calls).toEqual([
      [
        `notifyError`,
        {
          body: `unexpected error`,
          title: `Error while submitting a new text proposal`
        }
      ]
    ])
  })
})
