import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
import Vuelidate from "vuelidate"
import PageGovernance from "renderer/components/governance/PageGovernance"
import ModalPropose from "renderer/components/governance/ModalPropose"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import { mount } from "@vue/test-utils"

describe(`PageGovernance`, () => {
  describe(`with magic`, () => {
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

    describe(`Modal onPropose modal on click`, () => {
      it(`displays the Propose modal`, () => {
        let proposeBtn = wrapper.find(`#propose-btn`)
        proposeBtn.trigger(`click`)
        expect(wrapper.contains(ModalPropose)).toEqual(true)
      })
    })
  })

  describe(`without magic`, () => {
    describe(`Propose`, () => {
      describe(`unit`, () => {
        let $store = {
          commit: jest.fn(),
          getters: {
            proposals: lcdClientMock.state.proposals,
            filters: {
              proposals: {
                search: {
                  visible: false,
                  query: ``
                }
              }
            },
            bondingDenom: `Stake`,
            totalAtoms: 100,
            user: { atoms: 42, history: [] }
          }
        }
        let proposal = {
          amount: 15,
          title: `A new text proposal for Cosmos`,
          description: `a valid description for the proposal`,
          type: `Text`
        }
        xit(`success`, async () => {
          $store.dispatch = jest.fn()

          const wrapper = mount(PageGovernance, {
            mocks: {
              $store,
              $route: {
                name: `routeName`
              }
            }
          })
          await wrapper.vm.propose(proposal)

          expect($store.dispatch.mock.calls).toEqual([
            [
              `submitProposal`,
              {
                description: `a valid description for the proposal`,
                initial_deposit: [{ amount: `15`, denom: `stake` }],
                title: `A new text proposal for Cosmos`,
                type: `Text`
              }
            ]
          ])

          expect($store.commit.mock.calls).toEqual([
            [
              `notify`,
              {
                body: `You have successfully submitted a new text proposal`,
                title: `Successful proposal submission!`
              }
            ]
          ])
        })

        it(`error`, async () => {
          const dispatch = jest.fn(() => {
            throw new Error(`unexpected error`)
          })

          $store.dispatch = dispatch
          const wrapper = mount(PageGovernance, {
            mocks: {
              $store,
              $route: {
                name: `routeName`
              }
            }
          })
          await wrapper.vm.propose(proposal)

          expect($store.dispatch.mock.calls).toEqual([
            [
              `submitProposal`,
              {
                description: `a valid description for the proposal`,
                initial_deposit: [{ amount: `15`, denom: `stake` }],
                title: `A new text proposal for Cosmos`,
                type: `Text`
              }
            ]
          ])

          expect($store.commit.mock.calls[1]).toEqual([
            `notifyError`,
            {
              body: `unexpected error`,
              title: `Error while submitting a new text proposal`
            }
          ])
        })
      })
    })
  })
})
