import setup from '../helpers/vuex-setup'
import Page404 from 'renderer/components/common/Page404'

describe('Page404', () => {
  let instance = setup()
  let wrapper

  beforeEach(() => {
    let test = instance.mount(Page404)
    wrapper = test.wrapper
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show links to other pages', () => {
    expect(wrapper.findAll('.ni-li').length > 0).toBe(true)
  })
})
