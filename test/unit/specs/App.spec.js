jest.mock('renderer/node.js', () => () => require('../helpers/node_mock'))
jest.mock('electron', () => ({
  require: jest.genMockFunction(),
  match: jest.genMockFunction(),
  app: jest.genMockFunction(),
  remote: {
    getGlobal: () => ({
      env: {
        NODE_ENV: 'test'
      }
    })
  },
  dialog: jest.genMockFunction()
}))

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
