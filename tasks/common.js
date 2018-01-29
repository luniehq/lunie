// on windows some processes are not exiting when using child.kill so we use a windows specific comand
module.exports.cleanExitChild = function (child) {
  return new Promise((resolve, reject) => {
    var isWin = /^win/.test(process.platform)
    if (!isWin) {
      child.kill('SIGTERM')
    } else {
      var cp = require('child_process')
      cp.exec('taskkill /PID ' + child.pid + ' /T /F', function (error, stdout, stderr) {
        if (error !== null) {
          console.log('exec error: ' + error)
        }
      })
    }
    child.on('exit', resolve)
  })
}
