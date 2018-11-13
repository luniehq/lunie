import Node from "renderer/connectors/node"
import PageProposalsNewText from "renderer/components/governance/PageProposalsNewText"
import Store from "renderer/vuex/store"
import Vuelidate from "vuelidate"
import { createLocalVue, mount } from "@vue/test-utils"

describe(`PageProposalsNewText`, () => {
  let $store
  let wrapper

  beforeEach(() => {
    const localVue = createLocalVue()
    localVue.use(Vuelidate)

    $store = {
      dispatch: jest.fn(),
      getters: { lastPage: null, user: { history: [] } }
    }

    wrapper = mount(PageProposalsNewText, {
      localVue,
      mocks: {
        $router: [],
        $store
      }
    })
  })

  it(`has the expected HTML structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`onSubmit`, () => {
    wrapper.setData({
      fields: { body: `description`, title: `proposal title` }
    })

    wrapper.vm.onSubmit()

    expect($store.dispatch.mock.calls).toEqual([
      [
        `submitProposal`,
        {
          description: `description`,
          proposal_type: `Text`,
          title: `proposal title`
        }
      ]
    ])
  })

  it(`sends the correct request to Gaia Lite`, done => {
    const axios = async options => {
      const {
        data: { description, proposal_type, title },
        method,
        url
      } = options

      expect({
        data: { description, proposal_type, title },
        method,
        url
      }).toEqual({
        data: {
          description: `description`,
          proposal_type: `Text`,
          title: `proposal title`
        },
        method: `POST`,
        url: `http://remotehost/gov/proposals`
      })

      done()
      return { data: { check_tx: {}, deliver_tx: {} } }
    }

    const node = Node(axios, `http://localhost`, `http://remotehost`)
    const store = Store({ node })
    const localVue = createLocalVue()
    localVue.use(Vuelidate)

    wrapper = mount(PageProposalsNewText, {
      localVue,
      mocks: {
        $router: []
      },
      store
    })

    wrapper.setData({
      fields: { body: `description`, title: `proposal title` }
    })

    wrapper.vm.onSubmit()
  })
})
