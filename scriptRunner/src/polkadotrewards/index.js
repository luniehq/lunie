const { loadPolkadotRewards } = require("./getPolkadotRewards")
const Sentry = require("@sentry/node")

module.exports = async function (req, res) {
  const {era, networkId} = req.body;
  try {
    loadPolkadotRewards({era, networkId})
    .catch(error => {
      console.error(error)
      Sentry.captureException(error)
    })
    // we don't wait for the job to end because of timeouts
    res.status(200)
    res.send()
    return
  } catch (error) {
    console.error(error)
    Sentry.captureException(error)
    res.status(500)
    res.send(error.message)
    return
  }
}