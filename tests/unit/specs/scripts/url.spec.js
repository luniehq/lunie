import { getURLParams } from "scripts/url.js"

describe(`URL functions`, () => {
  it(`gets query params`, () => {
    const windowMock = {
      location: {
        search: `?network=y&graphql=z`
      }
    }

    expect(getURLParams(windowMock)).toEqual({
      network: `y`,
      graphql: "z"
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
