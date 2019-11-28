var express = require('express')
var router = express.Router()

// TODO move into database for persistence
const registrations = {
  // "id": ["topicA", "topicB"]
}

const defaultRegistrations = (address, networkId) => {
  // TODO get validators to subscribe to all validators of this user

  return [`transaction_${networkId}_${address}`, `proposal_${networkId}`]
}

router.use('/default', function(req, res) {
  console.log('Registration request received', req.body)

  const { address, networkId, pushId } = req.body
  // do some validations on possibly malicious inputs
  if (
    typeof address !== 'string' ||
    typeof networkId !== 'string' ||
    typeof pushId !== 'string'
  ) {
    throw Error('Push registration has bad format')
  }

  registrations[pushId] = defaultRegistrations(address, networkId)

  res.send('Registered sucessfully for the default push notifications')
})

router.use('/unregister', function(req, res) {
  console.log('Unregistration request received', req.body)

  const { pushId } = req.body
  // do some validations on possibly malicious inputs
  if (typeof pushId !== 'string') {
    throw Error('Push registration has bad format')
  }

  delete registrations[pushId]

  res.send('Unregistered sucessfully from push notifications')
})

router.use('/', function(req, res) {
  console.log('Registration request received', req.body)

  const { pushId, topics } = req.body
  // do some validations on possibly malicious inputs
  if (
    typeof pushId !== 'string' ||
    !Array(topics) ||
    topics.find(topic => typeof topic !== 'string')
  ) {
    throw Error('Push registration has bad format')
  }

  registrations[pushId] = topics

  res.send('Registered sucessfully for push notifications')
})

module.exports = router
module.exports.registrations = registrations
