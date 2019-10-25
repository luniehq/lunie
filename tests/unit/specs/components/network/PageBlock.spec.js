import { shallowMount, createLocalVue } from "@vue/test-utils"
import PageBlock from "network/PageBlock"
import { bankTxs } from "../../store/json/txs"

const localVue = createLocalVue()
localVue.directive(`tooltip`, () => {})

describe(`PageBlock`, () => {
  let wrapper

  const getters = {
    connected: true,
    lastHeader: {
      height: `1000`
    },
    validators: {},
    connection: {
      network: "testnet"
    }
  }

  const state = {
    delegation: {
      unbondingDelegations: {},
      loaded: true
    },
    session: { address: `` }
  }

  beforeEach(async () => {
    wrapper = shallowMount(PageBlock, {
      localVue,
      mocks: {
        $store: {
          getters,
          state,
          dispatch: jest.fn(type => {
            if (type === "queryBlockInfo")
              return {
                header: {
                  chain_id: `chain-1`,
                  num_txs: 10
                },
                block_id: {
                  hash: `ABCD1234`
                }
              }
            if (type === "getBlockTxs") return bankTxs
          })
        },
        $route: {
          params: { height: `100` }
        },
        $router: {
          push: jest.fn()
        }
      },
      stubs: [`router-link`]
    })
    await wrapper.vm.getBlock()
  })

  it(`shows a page with information about a certain block`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows the block page with no txs`, () => {
    wrapper = shallowMount(PageBlock, {
      localVue,
      mocks: {
        $store: {
          getters: {
            connected: true,
            lastHeader: {
              height: `1000`
            },
            validators: {}
          },
          state,
          dispatch: jest.fn(type => {
            if (type === "queryBlockInfos")
              return {
                header: {
                  chain_id: `chain-1`
                },
                block_id: {
                  hash: `ABCD1234`
                }
              }
            if (type === "getBlockTxs") return []
          })
        },
        $route: {
          params: { height: `100` }
        },
        $router: {
          push: jest.fn()
        }
      },
      stubs: [`router-link`]
    })

    expect(wrapper.element).toMatchSnapshot()
  })

  it(`loads the block information when the route changes`, () => {
    const getBlock = jest.fn()
    PageBlock.watch[`$route.params.height`].call({ getBlock })

    expect(getBlock).toHaveBeenCalled()
  })

  it(`redirects to the 404 page if the block doesn't exist`, async () => {
    const routerPush = jest.fn()

    await PageBlock.methods.getBlock({
      $store: {
        dispatch: () => null // not returning a block when querying
      },
      $route: {
        params: {
          height: `42`
        }
      },
      $router: {
        push: routerPush
      },
      lastHeader: {
        height: `1`
      }
    })

    expect(routerPush).toHaveBeenCalledWith(`/404`)

    routerPush.mockClear()
    await PageBlock.methods.getBlock({
      $store: {
        dispatch: () => ({ x: 1 }) // return pseudo block
      },
      $route: {
        params: {
          height: 42
        }
      },
      $router: {
        push: routerPush
      },
      lastHeader: {
        height: `1000`
      }
    })

    expect(routerPush).not.toHaveBeenCalledWith(`/404`)
  })
})
