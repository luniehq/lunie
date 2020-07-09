import { createLocalVue, shallowMount, RouterLinkStub } from '@vue/test-utils'
import Vuelidate from 'vuelidate'
import SessionSuccess from 'components/SessionSuccess'

describe(`SessionSuccess`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive('focus', () => {})

  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(SessionSuccess, {
      localVue,
      stubs: {
        RouterLink: RouterLinkStub
      }
    })
  })

  it(`renders correctly`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it('has link back to accounts', async () => {
    expect(wrapper.findComponent(RouterLinkStub).props().to).toBe('/accounts')
  })
})
