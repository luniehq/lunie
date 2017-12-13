jest.mock('renderer/node.js', () => () => require('../helpers/node_mock'))

// needs to be mocked as it imports the native supercop module and this fails in jest
jest.mock('app/node_modules/tendermint-crypto', () => {})

describe('App', () => {
  it('has all dependencies', async done => {
    document.body.innerHTML = '<div id="app"></div>'
    try {
      await require('renderer/main.js')
    } catch (e) {
      done.fail(e)
    }
    done()
  })
})
