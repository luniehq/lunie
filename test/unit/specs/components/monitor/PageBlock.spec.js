import setup from '../../../helpers/vuex-setup'
import htmlBeautify from 'html-beautify'
import PageBlock from 'renderer/components/monitor/PageBlock'

describe('PageBlock', () => {
  let wrapper, instance
  let {mount} = setup()

  beforeEach(() => {
    instance = mount(PageBlock, {
      getters: {
        lastHeader: () => ({
          time: Date.now(),
          last_block_id: {
            hash: '123'
          },
          height: 12345
        })
      }
    })

    wrapper = instance.wrapper
    wrapper.update()
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
