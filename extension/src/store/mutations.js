export const setSignRequest = (state, signRequest) => {
  state.signRequest = signRequest
}

export const setAccounts = (state, accounts) => {
  state.accounts = accounts
}

export const setNetworkId = (state, networkId) => {
  state.network = networkId
  state.connection.network = networkId
}

export const setNetworks = (state, networks) => {
  state.networks = networks
}

export const setNetworkSlug = (state, networkSlug) => {
  state.networkSlug = networkSlug
}

export const updateField = (state, payload) => {
  // Recover flow
  if (payload.field === `seed`) {
    state.recover.seed = payload.value
  }
  if (payload.field === `name`) {
    state.recover.name = payload.value
  }
  if (payload.field === `password`) {
    state.recover.password = payload.value
  }
  if (payload.field === `prefix`) {
    state.recover.prefix = payload.value
  }
  if (payload.field === `passwordConfirm`) {
    state.recover.passwordConfirm = payload.value
  }
  // Create flow
  if (payload.field === `signUpName`) {
    state.signup.signUpName = payload.value
  }
  if (payload.field === `signUpPassword`) {
    state.signup.signUpPassword = payload.value
  }
  if (payload.field === `signUpPasswordConfirm`) {
    state.signup.signUpPasswordConfirm = payload.value
  }
  if (payload.field === `signUpWarning`) {
    state.signup.signUpWarning = payload.value
  }
  if (payload.field === `signUpSeed`) {
    state.signup.signUpSeed = payload.value
  }
  if (payload.field === `HDPath`) {
    state.session.HDPath = payload.value
  }
  if (payload.field === `curve`) {
    state.session.curve = payload.value
  }
}

export const resetSignUpData = (state) => {
  state.signup = {
    signUpName: ``,
    signUpPassword: ``,
    signUpPasswordConfirm: ``,
    signUpWarning: false,
    signUpSeed: ``
  }
}

export const resetRecoverData = (state) => {
  state.recover = {
    seed: ``,
    name: ``,
    password: ``,
    passwordConfirm: ``
  }
}
