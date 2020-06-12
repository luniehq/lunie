const { loadPolkadotRewards } = require("./polkadotrewards/getPolkadotRewards")

const jobs = {
    "polkadotRewards": loadPolkadotRewards
}

const scheduled = []
let running = false

module.exports.scheduleJob = async function scheduleJob(job, args) {
    if (!running) {
        running = true
        await jobs[job](args)
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