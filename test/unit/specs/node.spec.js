let Node

describe('Connector', () => {
  let initialNodeIP = '1.1.1.1'
  let lcdServerPort = '1234'

  beforeAll(() => {
    jest.mock('renderer/connectors/lcdClient', () => class LCDClient {
      fooLcd () { return 'lcdBar' }
    })
    jest.mock('renderer/connectors/lcdClientMock', () => ({ fooLcd () { return 'lcdBarMock' } }))
    jest.mock('renderer/connectors/rpcWrapper', () => () => ({ fooRpc: 'rpcBar' }))
    jest.mock('renderer/connectors/rpcWrapperMock', () => () => ({ fooRpc: 'rpcBarMock' }))

    Node = require('renderer/connectors/node')
  })

  it('should hold the lcdPort', () => {
    let node = Node(initialNodeIP, lcdServerPort)
    expect(node.lcdPort).toBe(lcdServerPort)
  })

  it('should setup the connectors', () => {
    let node = Node(initialNodeIP, lcdServerPort)
    expect(node.fooRpc).toBe('rpcBar')
    expect(node.fooLcd()).toBe('lcdBar')
  })

  it('should setup the mock connectors', () => {
    let node = Node(initialNodeIP, lcdServerPort, true)
    expect(node.fooRpc).toBe('rpcBarMock')
    expect(node.fooLcd()).toBe('lcdBarMock')
  })
})
