const { loadPolkadotRewards } = require("./polkadotrewards/getPolkadotRewards")
const Sentry = require("@sentry/node")
const jobs = {
  "polkadotRewards": loadPolkadotRewards
}
const scheduled = []
let running = false
module.exports.scheduleJob = async function scheduleJob(job, args) {
  if (!running) {
    running = true
    try {
      await jobs[job](args)
    } catch (error) {
      console.error(error)
      Sentry.captureException(error)
    }
    running = false
    if (scheduled.length > 0) {
      console.log("Running pending job")
      const {job, args} = scheduled.pop()
      scheduleJob(job, args)
    }
  } else {
    console.log("Job scheduled")
    scheduled.push({job, args})
  }
}