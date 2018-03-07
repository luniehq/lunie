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
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(PageBlock, {
      mocks: {
        $route
      },
      getters: {
        blockchain: () => ({
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
              time: 1608
            },
            last_commit: {
              precommits: []
            },
            data: {
              txs: 0
            }
          },
          blockMetaInfo: {
            block_id: {
              hash: 'hash'
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

  it('should show a loading state if loading', () => {
    let { wrapper } = mount(PageBlock, {
      getters: {
        blockchain: () => ({
          block: {},
          blockMetaInfo: {
            block_id: {}
          },
          blockLoading: true
        })
      },
      stubs: {
        'data-loading': '<data-loading />'
      }
    })
    wrapper.update()

    expect(wrapper.vm.block).toEqual({})
    expect(wrapper.contains('data-loading')).toBe(true)
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
