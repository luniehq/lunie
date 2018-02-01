import setup from '../../../helpers/vuex-setup'
import htmlBeautify from 'html-beautify'
import PageBlocks from 'renderer/components/monitor/PageBlocks'
import moment from 'moment'

describe('PageBlocks', () => {
  let wrapper, store
  let {mount} = setup()

  beforeEach(() => {
    let instance = mount(PageBlocks, {
      stubs: {
        'modal-search': '<modal-search />'
      },
      getters: {
        lastHeader: () => ({
          time: moment('2017-09-15 09:30:00').valueOf(),
          last_block_id: {
            hash: '123'
          },
          height: 12345
        })
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    wrapper.update()
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('should call resetSearch on beforeDestroy', () => {
    wrapper.destroy()
    expect(store.commit).toHaveBeenCalledWith('resetSearch', 'blocks')
  })

  it('should show the search on click', () => {
    wrapper.vm.setSearch(true)
    expect(store.commit).toHaveBeenCalledWith('setSearchVisible', ['blocks', true])
  })
})
