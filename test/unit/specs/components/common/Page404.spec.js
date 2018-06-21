import setup from "../../../helpers/vuex-setup"
import Page404 from "renderer/components/common/Page404"
import htmlBeautify from "html-beautify"

describe("Page404", () => {
  let instance = setup()
  let wrapper

  beforeEach(() => {
    let test = instance.mount(Page404)
    wrapper = test.wrapper
    wrapper.update()
  })

  it("has the expected html structure", async () => {
    await wrapper.vm.$nextTick()
    wrapper.update()
    // console.log(wrapper.vm.$el)
    // console.log(htmlBeautify(wrapper.html()))
    // expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should show links to other pages", () => {
    expect(wrapper.findAll(".tm-li").length > 0).toBe(true)
  })
})
