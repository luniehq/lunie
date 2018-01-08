jest.mock('renderer/node.js', () => () => require('../helpers/node_mock'))

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
