import Analytics from 'electron-ga'

module.exports = function (gaUID) {
  const analytics = new Analytics(gaUID)
  window.analytics = analytics
  analytics.send('screenview', { cd: 'Login' })
}
