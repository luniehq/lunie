const database = require("../../api/lib/database")
const Sentry = require("@sentry/node")
const config = require("../../api/config")
const db = database(config)

module.exports.cleanEvents = function cleanEvents() {
    const thiryDaysAgo = new Date()
    thiryDaysAgo.setDate(new Date().getDate() - 30)
    db("").query(`
        mutation {
            delete_notifications(where:{created_at:{_lt: "${thiryDaysAgo.toUTCString()}"}})  {
            affected_rows
            }
        }
    `)
    .catch(error => {
        console.log(error)
        Sentry.captureException(error)
    })
}