import keybaseModule from "src/vuex/modules/keybase.js"

describe(`Module: Keybase`, () => {
  let state

  // this is an internal format not the return value from the keybase API
  const mockIdentity = {
    avatarUrl: `pictureUrl`,
    keybaseId: `abcdabcdabcdabcd`,
    lastUpdated: `Thu, 01 Jan 1970 00:00:42 GMT`,
    profileUrl: `https://keybase.io/keybaseUser`,
    userName: `keybaseUser`
  }
  jest.mock(`src/keybase-cache.json`, () => [mockIdentity])

  beforeEach(() => {
    const module = keybaseModule({ node: {} })
    state = module.state
  })

  it("stores the cached identities", () => {
    expect(state.identities).toEqual([mockIdentity])
  })
})
