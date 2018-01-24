import setup from '../../../helpers/vuex-setup'
import htmlBeautify from 'html-beautify'
import PageBlockchain from 'renderer/components/monitor/PageBlockchain'

describe('PageBlockchain', () => {
  let wrapper, store
  let {mount} = setup()

  beforeEach(() => {
    let instance = mount(PageBlockchain)
    wrapper = instance.wrapper
    store = instance.store

    store.commit('setSearchVisible', ['blockchain', false])

    wrapper.update()
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('should show the search on click', () => {
    wrapper.find('.ni-tool-bar i').trigger('click')
    expect(wrapper.contains('.ni-modal-search')).toBe(true)
  })
})
