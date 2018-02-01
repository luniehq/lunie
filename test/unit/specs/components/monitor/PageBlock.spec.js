import setup from '../../../helpers/vuex-setup'
import htmlBeautify from 'html-beautify'
import PageBlock from 'renderer/components/monitor/PageBlock'

const $route = {
  params: {
    block: 1234
  }
}

describe('PageBlock', () => {
  let wrapper, store
  let {mount} = setup()

  beforeEach(() => {
    let instance = mount(PageBlock, {
      mocks: {
        $route
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    wrapper.update()
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('should dispatch getBlock when mounted', () => {
    expect(store.dispatch).toHaveBeenCalledWith('getBlock', wrapper.vm.$route.params.block)
  })
})
