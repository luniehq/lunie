export default () => {
  const noteSignUp = {
    icon: 'mood',
    title: 'Welcome!',
    body: 'Thank you for signing up.',
    time: 0
  }
  const noteSignIn = {
    icon: 'mood',
    title: 'Signed In',
    body: 'Welcome back.',
    time: 0
  }
  const noteSignOut = {
    icon: 'exit_to_app',
    title: 'Signed Out',
    body: 'Come back again soon.',
    time: 0
  }
  const noteAuthRequired = {
    icon: 'error',
    title: 'Authentication Required',
    body: 'You must sign up or sign in to view that page.',
    time: 0
  }

  const state = []

  const mutations = {
    notify (state, data) {
      let note = data
      note.icon = 'check_circle'
      note.time = Date.now()
      state.push(note)
      // console.log('notify', note)
    },
    notifyWarn (state, data) {
      let note = data
      note.icon = 'warning'
      note.time = Date.now()
      note.type = 'warning'
      state.push(note)
      // console.log('notifyError', note)
    },
    notifyError (state, data) {
      let note = data
      note.icon = 'error'
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

  return { state, mutations }
}
