import setup from "../../../helpers/vuex-setup"
import Page404 from "renderer/components/common/Page404"

describe("Page404", () => {
  let instance = setup()
  let wrapper

  beforeEach(() => {
    let test = instance.mount(Page404)
    wrapper = test.wrapper
    wrapper.update()
  })

  it("has the expected html structure", async () => {
    // after importing the @tendermint/ui components from modules
    // the perfect scroll plugin needs a $nextTick and a wrapper.update
    // to work properly in the tests (snapshots weren't matching)
    // this has occured across multiple tests
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should show links to other pages", () => {
    expect(wrapper.findAll(".tm-li").length > 0).toBe(true)
  })
})
