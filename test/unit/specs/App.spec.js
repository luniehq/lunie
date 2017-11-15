jest.mock('@/renderer/node.js', () => () => ({
  generateKey: () => ({key: '123'}),
  queryAccount: () => null,
  queryNonce: () => '123'
}))

describe('App', () => {
  it('has all dependencies', async done => {
    await require('@/renderer/main.js')
    .catch(done.fail)
    done()
  })
})
