import { bindRequestsToTabs } from '../../src/tabsHandler'

describe('Sign request queue', () => {
  let signRequestQueue

  beforeEach(() => {
    signRequestQueue = {
      unqueueSignRequestForTab: jest.fn()
    }
  })

  it('kills on tab removal', () => {
    global.chrome = {
      tabs: {
        onRemoved: { addListener: callback => callback(42) },
        onUpdated: { addListener: () => {} }
      }
    }
    bindRequestsToTabs(signRequestQueue, [])

    expect(signRequestQueue.unqueueSignRequestForTab).toHaveBeenCalledWith(42)
    expect(signRequestQueue.unqueueSignRequestForTab).toHaveBeenCalledTimes(1)
  })

  it('kills on tab url not accepted', () => {
    global.chrome = {
      tabs: {
        onRemoved: { addListener: () => {} },
        onUpdated: { addListener: callback => callback(42, {}) }
      }
    }
    bindRequestsToTabs(signRequestQueue, ['https://lunie.io'])
    expect(signRequestQueue.unqueueSignRequestForTab).not.toHaveBeenCalled()

    global.chrome = {
      tabs: {
        onRemoved: { addListener: () => {} },
        onUpdated: {
          addListener: callback => callback(42, { url: 'https://funkytown.io' })
        }
      }
    }
    bindRequestsToTabs(signRequestQueue, ['https://lunie.io'])

    expect(signRequestQueue.unqueueSignRequestForTab).toHaveBeenCalledWith(42)
    expect(signRequestQueue.unqueueSignRequestForTab).toHaveBeenCalledTimes(1)
  })
})
