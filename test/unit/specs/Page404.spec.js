import { mount } from 'vue-test-utils'
import Page404 from 'renderer/components/common/Page404'

describe('Page404', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Page404, {
      propsData: { }
    })
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show links to other pages', () => {
    expect(wrapper.findAll('.ni-li').length > 0).toBe(true)
  })
})
