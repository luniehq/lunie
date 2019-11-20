const cors = require('cors')
const config = require('./config')

var allowed = ['https://app.lunie.io']
if (config.env === 'development') {
  allowed.push('http://localhost:9080')
}

var corsOptions = {
  origin: function(origin, callback) {
    if (allowed.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

module.exports = function () {
  return cors(corsOptions)
}
