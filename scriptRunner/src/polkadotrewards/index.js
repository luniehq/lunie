const {scheduleJob} = require('../executor')

module.exports = async function (req, res) {
  const {era} = req.body;
  try {
      scheduleJob("polkadotRewards", {era})
      // we don't wait for the job to end because of timeouts
      res.status(200)
      res.send()
      return
  } catch (error) {
    res.status(500)
    res.send(error.message)
    return
  }
}