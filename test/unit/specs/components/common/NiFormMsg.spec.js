import { mount } from "@vue/test-utils"
import htmlBeautify from "html-beautify"
import NiFormMsg from "common/NiFormMsg"

describe("NiFormMsg", () => {
  let wrapper
  let propsData = [
    {
      type: "length",
      body: "",
      name: "Password",
      min: 16,
      max: 255,
      length: ""
    },
    {
      type: "words16",
      name: "Seed"
    },
    {
      type: "alphaNum",
      name: "Asdf"
    },
    {
      type: "asdf",
      name: "Asdf"
    }
  ]
  let propsErrors = [
    "Password must be between 16 and 255 characters",
    "Seed phrase must be 16 words",
    "Asdf must contain only alphanumeric characters",
    "Asdf must be valid"
  ]
  beforeEach(() => {
    wrapper = mount(NiFormMsg, { propsData: propsData[0] })
  })
  for (let i = 1; i < propsData.length; i++) {}

  it("has a type from props", () => {
    expect(wrapper.vm.type).toBe("length")
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  for (let i = 0; i < propsData.length; i++) {
    it("shows correct message for " + propsData[i].type, () => {
      wrapper.setData(propsData[i])
      expect(
        wrapper
          .find(".ni-form-msg")
          .text()
          .trim()
      ).toContain(propsErrors[i])
    })
  }
})
