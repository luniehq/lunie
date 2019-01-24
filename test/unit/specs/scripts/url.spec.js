import { getURLParams } from "src/helpers/url.js"

describe(`URL functions`, () => {
  it(`gets query params`, () => {
    const windowMock = {
      location: {
        search: `?lcd=x&rpc=y`
      }
    }

    expect(getURLParams(windowMock)).toEqual({
      lcd: `x`,
      rpc: `y`
    })
  })

  it(`returns an empty object if no desired params available`, () => {
    const windowMock = {
      location: {
        search: `?bitcoin=cool`
      }
    }

    expect(getURLParams(windowMock)).toEqual({})
  })

  it(`returns an empty object if no params available`, () => {
    const windowMock = {
      location: {
        search: ``
      }
    }

    expect(getURLParams(windowMock)).toEqual({})
  })
})
