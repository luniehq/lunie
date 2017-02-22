let noteSignUp = {
  icon: 'smile-o',
  title: 'Welcome to Cosmos!',
  body: 'Thank you for signing up.',
  time: 0
}
let noteSignIn = {
  icon: 'sign-in',
  title: 'Signed In',
  body: 'Welcome back to Cosmos.',
  time: 0
}
let noteSignOut = {
  icon: 'sign-out',
  title: 'Signed Out',
  body: 'Come back again soon.',
  time: 0
}
let noteAuthRequired = {
  icon: 'exclamation-circle',
  title: 'Authentication Required',
  body: 'You must sign up or sign in to view that page.',
  time: 0
}

const state = [
  {
    icon: 'sign-out',
    title: 'Signed Out',
    body: 'Come back again soon!',
    time: 1485839462000
  },
  {
    icon: 'smile-o',
    title: 'A Permanent Notification',
    body: 'Just a happy notification!',
    time: 1485833462000
  }
]

const mutations = {
  notifyCustom (state, data) {
    let note = data
    note.icon = 'check-circle'
    note.time = Date.now()
    state.push(note)
    // console.log('notifyCustom', note)
  },
  notifyWarn (state, data) {
    let note = data
    note.icon = 'bell'
    note.time = Date.now()
    note.type = 'warn'
    state.push(note)
    // console.log('notifyError', note)
  },
  notifyError (state, data) {
    let note = data
    note.icon = 'exclamation-triangle'
    note.time = Date.now()
    note.layout = 'alert'
    note.type = 'error'
    state.push(note)
    // console.log('notifyError', note)
  },
  notifySignUp (state) {
    let note = JSON.parse(JSON.stringify(noteSignUp))
    note.time = Date.now()
    state.push(note)
    // console.log('notifySignUp', note)
  },
  notifySignIn (state) {
    let note = JSON.parse(JSON.stringify(noteSignIn))
    note.time = Date.now()
    state.push(note)
    // console.log('notifySignIn', note)
  },
  notifySignOut (state) {
    let note = JSON.parse(JSON.stringify(noteSignOut))
    note.time = Date.now()
    state.push(note)
    // console.log('notifySignOut', note)
  },
  notifyAuthRequired (state, body) {
    let note = JSON.parse(JSON.stringify(noteAuthRequired))
    note.time = Date.now()
    if (body) note.body = body
    state.push(note)
    // console.log('notifyAuthRequired', not)
  }
}

export default {
  state,
  mutations
}
