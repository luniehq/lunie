import SignRequestQueue from '../../src/requests'

const mockSignRequest = {
  signMessage: 'HALLOOOOO',
  senderAddress: 'cosmos1234',
  tabID: 42,
  id: expect.any(Number)
}

describe('Sign request queue', () => {
  let instance

  beforeEach(() => {
    global.chrome = {
      browserAction: {
        setIcon: jest.fn()
      }
    }
    instance = new SignRequestQueue()
    global.chrome.browserAction.setIcon.mockClear()
  })

  it('should queue a sign request', () => {
    instance.queueSignRequest(mockSignRequest)
    expect(instance.getSignRequest()).toEqual(mockSignRequest)
  })

  it('should unqueue a sign request', () => {
    instance.queueSignRequest(mockSignRequest)
    const { id } = instance.queue[0]
    instance.unqueueSignRequest(id)

    expect(instance.getSignRequest()).toEqual(undefined)
  })

  it('should unqueueSignRequestForTab', () => {
    instance.queueSignRequest(mockSignRequest)
    instance.unqueueSignRequestForTab(42)

    expect(instance.getSignRequest()).toEqual(undefined)
  })

  describe('icons', () => {
    it('shows a pending sign request icon', () => {
      instance.queueSignRequest(mockSignRequest)
      expect(global.chrome.browserAction.setIcon).toHaveBeenCalled()
    })

    it('removed the pending sign request icon', () => {
      instance.queueSignRequest(mockSignRequest)
      expect(global.chrome.browserAction.setIcon).toHaveBeenCalled()

      global.chrome.browserAction.setIcon.mockClear()

      instance.unqueueSignRequestForTab(42)
      expect(global.chrome.browserAction.setIcon).toHaveBeenCalled()
    })
  })
})
