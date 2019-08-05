let Node

describe(`Connector`, () => {
  const remoteLcdURL = `http://awesomenode.de:12345`

  beforeAll(() => {
    jest.mock(`src/connectors/rpcWrapper`, () => () => ({
      fooRpc: `rpcBar`
    }))
    jest.mock(`@lunie/cosmos-api`, () => () => ({
      get: {}
    }))

    Node = require(`src/connectors/node`).default
  })

  it(`should setup the connectors`, () => {
    const node = Node(remoteLcdURL)
    expect(node.fooRpc).toBe(`rpcBar`)
    expect(node.get).toBeDefined()
  })
})
