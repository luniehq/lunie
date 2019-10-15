export const setSignRequest = (state, signRequest) => {
  state.signRequest = signRequest
}

export const setAccounts = (state, accounts) => {
  state.accounts = accounts
}

export const setInsecureMode = () => {}
export const notify = () => {}

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
}
