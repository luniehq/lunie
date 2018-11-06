import PageProposalsNewText from "renderer/components/govern/PageProposalsNewText"
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
    wrapper.setData({ fields: { body: `description`, title: `proposaltitle` } })
    wrapper.vm.onSubmit()

    expect($store.dispatch.mock.calls).toEqual([
      [
        `submitProposal`,
        {
          description: `description`,
          proposal_type: `Text`,
          title: `proposaltitle`
        }
      ]
    ])
  })
})
