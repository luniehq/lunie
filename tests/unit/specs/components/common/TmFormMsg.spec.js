import { mount } from "@vue/test-utils"
import TmFormMsg from "common/TmFormMsg"

describe(`TmFormMsg`, () => {
  let wrapper
  const propsData = [
    {
      type: `length`,
      name: `Password`,
      min: 16,
      max: 255,
      error: `Password must be between 16 and 255 characters`
    },
    {
      type: `words16`,
      name: `Seed`,
      error: `Seed phrase must be 16 words`
    },
    {
      type: `words24`,
      name: `Seed`,
      error: `Seed phrase must be 24 words`
    },
    {
      type: `alphaNum`,
      name: `Asdf`,
      error: `Asdf must contain only alphanumeric characters`
    },
    {
      type: `numeric`,
      name: `Asdf`,
      error: `Asdf must contain only numerals`
    },
    {
      type: `between`,
      name: `Asdf`,
      min: 16,
      max: 255,
      error: `Asdf must be between 16 and 255`
    },
    {
      type: `date`,
      name: `Asdf`,
      error: `Asdf must be a valid date`
    },
    {
      type: `datetime`,
      name: `Asdf`,
      error: `Asdf must be a valid date and time`
    },
    {
      type: `exactLength`,
      name: `Asdf`,
      length: 16,
      error: `Asdf must be exactly 16 characters`
    },
    {
      type: `ipAddress`,
      name: `Asdf`,
      error: `Asdf must be a valid IPv4 or IPv6 address`
    },
    {
      type: `minLength`,
      name: `Asdf`,
      min: 2,
      error: `Asdf must be equal or longer than 2 characters`
    },
    {
      type: `maxLength`,
      name: `Asdf`,
      max: 255,
      error: `Asdf must be equal or shorter than 255 characters`
    },
    {
      type: `match`,
      name: `Asdf`,
      error: `Asdf must match`
    },
    {
      type: `required`,
      name: `Asdf`,
      error: `Asdf is required`
    },
    {
      type: `url`,
      name: `Asdf`,
      error: `Asdf must be a valid URL (http:// required)`
    },
    {
      type: `default`,
      name: `Asdf`,
      error: `Asdf must be valid`
    },
    {
      type: `bech32`,
      name: `Address`,
      error: `Address is invalid bech32`
    },
    {
      type: `integer`,
      name: `Number`,
      error: `Number must be an integer`
    },
    {
      type: `custom`,
      msg: `HALLO WORLD`,
      error: `HALLO WORLD`
    }
  ]

  beforeEach(() => {
    wrapper = mount(TmFormMsg, { propsData: propsData[0] })
  })

  it(`has a type from props`, () => {
    expect(wrapper.vm.type).toBe(`length`)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  for (let i = 0; i < propsData.length; i++) {
    it(`shows correct message for ` + propsData[i].type, () => {
      const { type, name, min, max, length, msg } = propsData[i]
      wrapper.setProps({ type, name, min, max, length, msg })
      expect(
        wrapper
          .find(`.tm-form-msg`)
          .text()
          .trim()
      ).toContain(propsData[i].error)
    })
  }
})
