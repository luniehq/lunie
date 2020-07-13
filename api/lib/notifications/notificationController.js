const database = require("../database");
const config = require("../../config");
const { eventSubscription } = require("../subscriptions");
const { getTopic, getMessageTitle, getPushLink } = require("./notifications")
const { getDefaultEMailSubscriptions } = require("./notifications-types")
const firebaseAdmin = require('./firebase')
const Sentry = require("@sentry/node");
const { UserInputError } = require("apollo-server");

class NotificationController {
    constructor(networks) {
        this.db = database(config)
        this.registrations = {
            "cosmos1px678cw4m5j5ye52ydjapf2kcw5edn0p6u9cry_transactionSend_cosmos-hub-testnet": {
                email: { "abc": true },
                push: {}
            }
        }
        // TODO networks might not update here
        // IDEA have a NetworksController which provides a getter and handles updating the networks
        this.networks = networks
        this.listenToNotifications()

        this.getRegistrationsFromDB()
    }

    listenToNotifications() {
        eventSubscription(notification => {
            this.onNotification(notification)
        })
    }

    async onNotification(notification) {
        const emailUsers = await this.getRegisteredUsers(notification, "email")
        const emails = await this.getEmails(emailUsers)
        const {content, subject} = this.getEmailContent(notification)
        this.sendEmail(emails, subject, content)
    }

    getRegistrationsFromDB() {
        this.db("").getNotificationRegistrations()
        .then(rows => {
            rows.forEach(({topic, type, uid}) => {
                if (!this.registrations[topic]) this.registrations[topic] = { email: {}, push: {}}
                this.registrations[topic][type][uid] = true
            })
        })
    }

    // type = [email|push]
    getRegisteredUsers(notification, type) {
        const topic = getTopic(notification)
        if (!this.registrations[topic]) return []
        return Object.keys(this.registrations[topic][type] || {})
    }
    
    // type = [email|push]
    // notificationSettings = [{ topic, type, remove }]
    async updateRegistrations(uid, addressObjects, notificationType, dataSources) {
        let topics = []
        if (notificationType === "email") {
            topics = (await getDefaultEMailSubscriptions(addressObjects, dataSources))
            .map(topic => ({ topic, type: 'email'}))
        } else {
            throw new UserInputError("Only Email notfication registration is supported on this endpoint")
        }
        topics.forEach(({topic, type}) => {
            if (!this.registrations[topic]) this.registrations[topic] = { email: {}, push: {}}
            this.registrations[topic][type][uid] = true
        })
        const rows = topics.map(topic => ({
            ...topic,
            uid
        }))
        this.db("").storeNotificationRegistrations(rows)
    }

    async getEmails(uids) {
        return await Promise.all(uids.map(async uid => {
            const user = await firebaseAdmin.auth().getUser(uid)
            return user.email
        }))
    }

    getEmailContent(notification) {
        return {
            subject: getMessageTitle(this.networks, notification),
            content: `
                <p>There is a notification on Lunie we believe requires your attention</p>
                <p>
                    <a href="${config.frontendURL}${getPushLink(this.networks, notification)}">${getMessageTitle(this.networks, notification)}</a>
                </p>
            `
        }
    }

    sendEmail(emails, subject, content) {
        emails.forEach(async email => {
            const res = await fetch(`https://api.pepipost.com/v5/mail/send`, {
                "method": "POST",
                "headers": {
                  "api_key": config.pepipostAPIKey,
                  "content-type": "application/json"
                },
                body: JSON.stringify({
                    from: {email: 'notifications@lunie.io', name: 'Lunie Notifications'},
                    subject,
                    content: [{type: 'html', value: content}],
                    personalizations: [{to: [{email}]}]
                })
            }).then(res => res.json())
            if (res.status !== "success") {
                console.error(res)
                Sentry.captureException(new Error(JSON.stringify(res.error)))
            }
        })
    }
}

module.exports = NotificationController