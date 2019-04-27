let Node

describe(`Connector`, () => {
  let axios
  const remoteLcdURL = `http://awesomenode.de:12345`

  beforeAll(() => {
    axios = jest.fn()

    jest.mock(
      `src/connectors/api`,
      () =>
        class LCDClient {
          fooLcd() {
            return `lcdBar`
          }
        }
    )
    jest.mock(`src/connectors/lcdClientMock`, () => ({
      fooLcd() {
        return `lcdBarMock`
      }
    }))
    jest.mock(`src/connectors/rpcWrapper`, () => () => ({
      fooRpc: `rpcBar`
    }))
    jest.mock(`src/connectors/rpcWrapperMock`, () => () => ({
      fooRpc: `rpcBarMock`
    }))

    Node = require(`src/connectors/node`).default
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
