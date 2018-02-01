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
      },
      getters: {
        blockchain: () => ({
          url: 'https://the-url',
          block: {
            block: {
              header: {
                last_block_id: {
                  hash: 'last-hash',
                  parts: {
                    total: 0
                  }
                },
                num_txs: 0,
                height: 10,
                time: null
              },
              last_commit: {
                precommits: []
              },
              data: {
                txs: 0
              }
            },
            block_meta: {
              block_id: {
                hash: 'hash'
              }
            }
          }
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

  it('should dispatch getBlock when mounted', () => {
    expect(store.dispatch).toHaveBeenCalledWith('getBlock', wrapper.vm.$route.params.block)
  })
})
