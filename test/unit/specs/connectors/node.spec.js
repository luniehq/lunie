let Node

describe(`Connector`, () => {
  let axios
  const remoteLcdURL = `http://awesomenode.de:12345`

  beforeAll(() => {
    axios = jest.fn()

    jest.mock(
      `renderer/connectors/api`,
      () =>
        class LCDClient {
          fooLcd() {
            return `lcdBar`
          }
        }
    )
    jest.mock(`renderer/connectors/lcdClientMock`, () => ({
      fooLcd() {
        return `lcdBarMock`
      }
    }))
    jest.mock(`renderer/connectors/rpcWrapper`, () => () => ({
      fooRpc: `rpcBar`
    }))
    jest.mock(`renderer/connectors/rpcWrapperMock`, () => () => ({
      fooRpc: `rpcBarMock`
    }))

    Node = require(`renderer/connectors/node`)
  })

  it(`should hold the lcdPort`, () => {
    const node = Node(axios, remoteLcdURL)
    expect(node.remoteLcdURL).toBe(remoteLcdURL)
  })

  it(`should setup the connectors`, () => {
    const node = Node(axios, remoteLcdURL)
    expect(node.fooRpc).toBe(`rpcBar`)
    expect(node.fooLcd()).toBe(`lcdBar`)
  })
})
