import setup from "../../../helpers/vuex-setup"
import PanelSort from "renderer/components/staking/PanelSort"

describe("PanelSort", () => {
  let wrapper
  let instance = setup()

  beforeEach(() => {
    let test = instance.mount(PanelSort, {
      propsData: {
        sort: {
          order: "asc",
          properties: [
            {
              value: "id",
              title: "ID"
            },
            {
              value: "amount",
              title: "AMOUNT"
            }
          ]
        }
      }
    })
    wrapper = test.wrapper
  })

  it("has the expected html structure", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should show the title", () => {
    expect(wrapper.html()).toContain("ID")
  })

  it("should show an arrow according to ordering", () => {
    let firstCol = wrapper.vm.$el.querySelector(".sort-by")
    expect(firstCol.className.split(" ")).not.toContain("asc")
    expect(firstCol.className.split(" ")).not.toContain("desc")
    firstCol.click()
    expect(firstCol.className.split(" ")).not.toContain("desc")
    expect(firstCol.className.split(" ")).toContain("asc")
    firstCol.click()
    expect(firstCol.className.split(" ")).not.toContain("asc")
    expect(firstCol.className.split(" ")).toContain("desc")
    firstCol.click()
    expect(firstCol.className.split(" ")).toContain("asc")
    expect(firstCol.className.split(" ")).not.toContain("desc")
  })

  it("should only sort one col actively", () => {
    let firstCol = wrapper.vm.$el.querySelectorAll(".sort-by")[0]
    let secondCol = wrapper.vm.$el.querySelectorAll(".sort-by")[1]
    firstCol.click()
    secondCol.click()
    expect(firstCol.className.split(" ")).not.toContain("asc")
    expect(secondCol.className.split(" ")).toContain("asc")
  })
})
