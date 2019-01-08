let Node

describe(`Connector`, () => {
  let axios
  const remoteLcdURL = `http://awesomenode.de:12345`
  const localLcdURL = `https://localhost:9876`

  beforeAll(() => {
    axios = jest.fn()

    jest.mock(
      `renderer/connectors/lcdClient`,
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
    let node = Node(axios, localLcdURL, remoteLcdURL)
    expect(node.remoteLcdURL).toBe(remoteLcdURL)
    expect(node.localLcdURL).toBe(localLcdURL)
  })

  it(`should setup the connectors`, () => {
    let node = Node(axios, localLcdURL, remoteLcdURL)
    expect(node.fooRpc).toBe(`rpcBar`)
    expect(node.fooLcd()).toBe(`lcdBar`)
  })

  it(`should setup the mock connectors`, () => {
    let node = Node(axios, localLcdURL, remoteLcdURL, true)
    expect(node.fooRpc).toBe(`rpcBarMock`)
    expect(node.fooLcd()).toBe(`lcdBarMock`)
  })
})
