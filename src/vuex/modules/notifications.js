"use strict"

export default () => {
  const noteSignUp = {
    icon: `mood`,
    title: `Welcome!`,
    body: `Thank you for signing up.`,
    time: 0
  }
  const noteSignIn = {
    icon: `mood`,
    title: `Signed In`,
    body: `Welcome back.`,
    time: 0
  }
  const noteSignOut = {
    icon: `exit_to_app`,
    title: `Signed Out`,
    body: `Come back again soon.`,
    time: 0
  }
  const noteAuthRequired = {
    icon: `error`,
    title: `Authentication Required`,
    body: `You must sign up or sign in to view that page.`,
    time: 0
  }

  let key = 0
  const state = []

  const mutations = {
    addNotification(state, note) {
      // log notifications so we can see the notifications in the log to debug
      console.log(
        `[${note.type ? note.type.toUpperCase() : `INFO`}] ${note.title}: ${
          note.body
        }`
      )
      state.push(Object.assign({}, note, { key: key++ }))
    },
    notify(state, data) {
      const note = data
      note.icon = `check_circle`
      note.time = Date.now()
      mutations.addNotification(state, note)
    },
    notifyWarn(state, data) {
      const note = data
      note.icon = `warning`
      note.time = Date.now()
      note.type = `warning`
      mutations.addNotification(state, note)
    },
    notifyError(state, data) {
      const note = data
      note.icon = `error`
      note.time = Date.now()
      note.layout = `alert`
      note.type = `error`
      mutations.addNotification(state, note)
    },
    notifySignUp(state) {
      const note = JSON.parse(JSON.stringify(noteSignUp))
      note.time = Date.now()
      mutations.addNotification(state, note)
    },
    notifySignIn(state) {
      const note = JSON.parse(JSON.stringify(noteSignIn))
      note.time = Date.now()
      mutations.addNotification(state, note)
    },
    notifySignOut(state) {
      const note = JSON.parse(JSON.stringify(noteSignOut))
      note.time = Date.now()
      mutations.addNotification(state, note)
    },
    notifyAuthRequired(state, body) {
      const note = JSON.parse(JSON.stringify(noteAuthRequired))
      note.time = Date.now()
      if (body) note.body = body
      mutations.addNotification(state, note)
    }
  }

  const actions = {
    resetSessionData({ state }) {
      state.notifications = []
    }
  }

  return { state, mutations, actions }
}
