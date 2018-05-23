export const setFaqElementsVisible =
  ({ commit }, value) => commit('setFaqElementsVisible')
export const setFaqTocVisible =
  ({ commit }, value) => commit('setFaqElementsVisible')
export const setWhitepaperElementsVisible =
  ({ commit }, value) => commit('setWhitepaperElementsVisible')
export const setWhitepaperTocVisible =
  ({ commit }, value) => commit('setWhitepaperToc')

export const setSessionRequest =
  ({ commit }, url) => commit('setSessionRequest')

export const setSessionUserDisplayName =
  ({ commit }, displayName) => commit('setSessionUserDisplayName')
export const setSessionUserEmail =
  ({ commit }, email) => commit('setSessionUserEmail')
export const setSessionUserPhotoUrl =
  ({ commit }, photoUrl) => commit('setSessionUserPhotoUrl')
export const setSessionUserUid =
  ({ commit }, uid) => commit('setSessionUserUid')
