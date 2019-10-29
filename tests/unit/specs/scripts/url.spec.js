import { getURLParams } from "scripts/url.js"

describe(`URL functions`, () => {
  it(`gets query params`, () => {
    const windowMock = {
      location: {
        search: `?stargate=x&network=y&graphql=z`
      }
    }

    expect(getURLParams(windowMock)).toEqual({
      stargate: `x`,
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

  it(`alerts about inability to set remote urls in production`, () => {
    const spy = jest.spyOn(window, `alert`).mockImplementationOnce(() => {})
    const windowMock = {
      location: {
        search: `?stargate=1&rpc=2`
      }
    }

    getURLParams(windowMock, `production`)
    expect(spy).toHaveBeenCalled()
  })
})
