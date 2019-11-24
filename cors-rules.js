const cors = require('cors')
const config = require('./config')

var allowed = ['https://app.lunie.io']

var corsOptions = {
  origin: function(origin, callback) {
    if (
      config.env === 'development' ||
      allowed.indexOf(origin) !== -1 ||
      !origin
    ) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

module.exports = function() {
  return cors(corsOptions)
}
