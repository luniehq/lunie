import { shallowMount, createLocalVue } from "@vue/test-utils"
import PageBlock from "renderer/components/network/PageBlock"

const localVue = createLocalVue()
localVue.directive(`tooltip`, () => {})

describe(`PageBlock`, () => {
  let wrapper, $store

  beforeEach(() => {
    $store = {
      getters: {
        connected: true,
        blocks: [
          {
            header: {
              height: `100`,
              num_txs: 1200,
              proposer_address: `ABCDEFG123456HIJKLMNOP`
            }
          },
          {
            header: {
              height: `101`,
              num_txs: 405,
              proposer_address: `ZYXCRS123456HIJKLMNOPQ`
            }
          }
        ]
      }
    }

    wrapper = shallowMount(PageBlock, {
      localVue,
      mocks: {
        $store,
        $route: {
          params: { height: `100` }
        }
      },
      stubs: [`router-link`]
    })

    wrapper.setData({
      block: {
        block_meta: {
          block_id: {
            hash: `ABCD1234`
          }
        },
        block: {
          data: {
            txs: `txs`
          },
          evidence: {
            evidence: `evidence`
          },
          last_commit: {
            precommits: [
              {
                validator_address: `validator address`,
                timestamp: `1990-10-19`,
                round: 0
              }
            ]
          }
        }
      },
      header: {
        height: `100`,
        num_txs: 1200,
        proposer_address: `ABCDEFG123456HIJKLMNOP`
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`sets propertoes for the block table`, () => {
    expect(wrapper.vm.properties).toEqual([
      {
        title: `Proposer`
      },
      {
        title: `Time`
      },
      {
        title: `Round`
      }
    ])
  })
})
