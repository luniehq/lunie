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
          params: { height: `123` }
        }
      },
      stubs: [`router-link`]
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
