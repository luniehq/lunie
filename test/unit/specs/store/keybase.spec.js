import keybaseModule from "renderer/vuex/modules/keybase.js"

describe(`Module: Keybase`, () => {
  let state, actions, mutations

  async function mockKeybaseLookup() {
    return {
      data: {
        status: { name: `OK` },
        them: [
          {
            basics: {
              username: `keybaseUser`
            },
            pictures: {
              primary: {
                url: `pictureUrl`
              }
            }
          }
        ]
      }
    }
  }

  // this is an internal format not the return value from the keybase API
  const mockIdentity = {
    keybaseId: `abcdabcdabcdabcd`,
    avatarUrl: `pictureUrl`,
    userName: `keybaseUser`,
    profileUrl: `https://keybase.io/keybaseUser`,
  }

  beforeEach(() => {
    const module = keybaseModule({ node: {} })
    state = module.state
    actions = module.actions
    mutations = module.mutations

    state.externals.axios = jest.fn(mockKeybaseLookup)
  })

  describe(`mutations`, () => {
    it(`setKeybaseIdentities`, () => {
      mutations.setKeybaseIdentities(state, [mockIdentity])
      expect(state.identities[`abcdabcdabcdabcd`]).toEqual({
        keybaseId: `abcdabcdabcdabcd`,
        avatarUrl: `pictureUrl`,
        userName: `keybaseUser`,
        profileUrl: `https://keybase.io/keybaseUser`,
        lastUpdated: `Thu, 01 Jan 1970 00:00:42 GMT`
      })
    })
  })

  describe(`actions`, () => {
    it(`should query for the keybase identity`, async () => {
      const result = await actions.getKeybaseIdentity({ state }, `abcdabcdabcdabcd`)
      expect(state.externals.axios).toHaveBeenCalledWith(`https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=abcdabcdabcdabcd&fields=pictures,basics`)
      expect(result).toEqual(mockIdentity)
    })

    it(`should query only if identity is unknown or outdated`, async () => {
      state.identities[`abcdabcdabcdabcd`] = mockIdentity
      state.identities[`abcdabcdabcdabcd`].lastUpdated = new Date(Date.now()).toUTCString()
      const result = await actions.getKeybaseIdentity({ state }, `abcdabcdabcdabcd`)
      expect(state.externals.axios).not.toHaveBeenCalled()
      expect(result).toEqual(mockIdentity)
    })

    it(`should query by name if outdated`, async () => {
      state.identities[`abcdabcdabcdabcd`] = mockIdentity
      state.externals.moment = () => ({ diff: () => -5 })
      const result = await actions.getKeybaseIdentity({ state }, `abcdabcdabcdabcd`)
      expect(state.externals.axios).toHaveBeenCalledWith(`https://keybase.io/_/api/1.0/user/lookup.json?usernames=keybaseUser&fields=pictures,basics`)
      expect(result).toEqual({
        keybaseId: `abcdabcdabcdabcd`,
        avatarUrl: `pictureUrl`,
        userName: `keybaseUser`,
        profileUrl: `https://keybase.io/keybaseUser`
      })
    })

    it(`should bulk update the validators`, async () => {
      const dispatch = jest.fn()
        .mockReturnValueOnce(mockIdentity)
        .mockReturnValueOnce(null) // mocking a unknown_keybase_identity result
      const commit = jest.fn()

      const validators = [{ description: { identity: `abcdabcdabcdabcd` } },
        { description: { identity: `unknown_keybase_identity` } }]
      await actions
        .getKeybaseIdentities({ dispatch, commit, state }, validators)
      expect(dispatch).toHaveBeenCalledTimes(2)
      expect(commit).toHaveBeenCalledWith(`setKeybaseIdentities`, [mockIdentity])
    })

    it(`should store an error if failed to load keybase info`, async () => {
      const dispatch = async () => Promise.reject(`Error`)

      const validators = [{ description: { identity: `abcdabcdabcdabcd` } }]
      await actions.getKeybaseIdentities(
        { commit: jest.fn(), dispatch, state },
        validators
      )
      expect(state.error).toBe(`Error`)
    })
  })
})
