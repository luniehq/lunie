import { getURLParams } from "scripts/url.js"

describe(`URL functions`, () => {
  it(`gets query params`, () => {
    const windowMock = {
      location: {
        search: `?network=y&api=z`,
      },
    }

    expect(getURLParams(windowMock)).toEqual({
      network: `y`,
      api: "z",
    })
  })

  it(`returns an empty object if no desired params available`, () => {
    const windowMock = {
      location: {
        search: `?bitcoin=cool`,
      },
    }

    expect(getURLParams(windowMock)).toEqual({})
  })

  it(`returns an empty object if no params available`, () => {
    const windowMock = {
      location: {
        search: ``,
      },
    }

    expect(getURLParams(windowMock)).toEqual({})
  })
})
