import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
import PageBlock from "renderer/components/monitor/PageBlock"

describe("PageBlock", () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(PageBlock, {
      getters: {
        blockchain: () => ({
          blocks: [
            {
              header: {
                height: 100000
              }
            }
          ],
          block: {
            header: {
              last_block_id: {
                hash: "last-hash",
                parts: { total: 0 }
              },
              num_txs: 0,
              height: 10,
              time: 1608
            },
            last_commit: { precommits: [] },
            data: { txs: 0 }
          },
          blockMetaInfo: { block_id: { hash: "hash" } }
        })
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    wrapper.update()
  })

  it("has the expected html structure", async () => {
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("should dispatch getBlock when mounted", () => {
    expect(store.dispatch).toHaveBeenCalledWith("getBlock", NaN) // NaN as it trys to parse $route.param.block which is not set
  })

  it("should show a loading state if loading", () => {
    let { wrapper } = mount(PageBlock, {
      getters: {
        blockchain: () => ({
          blocks: [
            {
              header: {
                height: 100000
              }
            }
          ],
          block: {},
          blockMetaInfo: { block_id: {} },
          blockLoading: true
        })
      },
      stubs: { "data-loading": "<data-loading />" }
    })
    wrapper.update()

    expect(wrapper.vm.block).toEqual({})
    expect(wrapper.contains("data-loading")).toBe(true)
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("should survive no blocks being available", () => {
    let { wrapper } = mount(PageBlock, {
      getters: {
        blockchain: () => ({
          blocks: [],
          block: {},
          blockMetaInfo: {},
          blockLoading: true
        })
      },
      stubs: { "data-loading": "<data-loading />" }
    })
    wrapper.update()

    expect(wrapper.contains("data-loading")).toBe(true)
  })

  it("should disable the next block button if last block", () => {
    let { wrapper } = mount(PageBlock, {
      getters: {
        blockchain: () => ({
          blocks: [
            {
              header: {
                height: 10
              }
            }
          ],
          block: {
            header: {
              last_block_id: {
                hash: "last-hash",
                parts: { total: 0 }
              },
              num_txs: 0,
              height: 10,
              time: 1608
            },
            last_commit: { precommits: [] },
            data: { txs: 0 }
          },
          blockMetaInfo: { block_id: {} },
          blockLoading: true
        })
      }
    })
    expect(wrapper.vm.nextBlockAvailable).toBe(false)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
