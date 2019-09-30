import { shallowMount, createLocalVue } from "@vue/test-utils"
import PageContainer from "src/components/common/PageContainer"
import Vuex from "vuex"
const localVue = createLocalVue()

localVue.use(Vuex)

describe(`PageContainer`, () => {
  let wrapper
  let store
  let getters

  beforeEach(() => {
    getters = {
      connected: () => true
    }
    store = new Vuex.Store({
      state: {
        session: { signedIn: true }
      },
      getters
    })
  })

  it(`shows a page skeleton`, async () => {
    wrapper = shallowMount(PageContainer, {
      store,
      localVue,
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should show links to other pages`, () => {
    wrapper = shallowMount(PageContainer, {
      store,
      localVue,
      propsData: {
        dataEmpty: true
      },
      mocks: {
        $route: {
          name: `r1`
        }
      },
      stubs: [`router-link`]
    })

    expect(wrapper.element).toMatchSnapshot()
  })

  it(`scrolls back to the top on a route change`, () => {
    const self = {
      scrollContainer: {
        scrollTop: 100
      }
    }
    PageContainer.watch.$route.call(self)
    expect(self.scrollContainer.scrollTop).toBe(0)
  })
})
