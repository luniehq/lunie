const KavaV0API = require('./kavaV0-source')

class KavaV1API extends KavaV0API {
  setReducers() {
    this.reducers = require('../reducers/kavaV1-reducers')
  }
}

module.exports = KavaV1API
