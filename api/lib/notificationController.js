const database = require("./database");
const config = require("../config");
const { eventSubscription } = require("./subscriptions");
const { getTopic } = require("./notifications")

class NotificationController {
    constructor() {
        this.db = database(config)
        this.registrations = {
            "cosmos1px678cw4m5j5ye52ydjapf2kcw5edn0p6u9cry_transactionSend_cosmos-hub-testnet": {
                email: { "abc": true },
                push: {}
            }
        }
        this.listenToNotifications()
    }

    listenToNotifications() {
        eventSubscription(notification => {
            this.onNotification(notification)
        })
    }

    onNotification(notification) {
        const emailUsers = this.getRegisteredUsers(notification, "email")
        const emails = this.getEmails(emailUsers)
        const {content, subject} = this.getEmailContent(notification)
        this.sendEmail(emails, subject, content)
    }

    // type = [email|push]
    getRegisteredUsers(notification, type) {
        const topic = getTopic(notification)
        return Object.keys(this.registrations[topic][type] || {})
    }
    
    // type = [email|push]
    // notificationSettings = [{ topic, type, remove }]
    updateRegistrations(uid, notificationSettings) {
        notificationSettings.forEach(({ topic, type, remove }) => {
            if (!this.registrations[topic]) this.registrations[topic] = { email: {}, push: {}}
            // TODO update db
            if (remove) {
                delete this.registrations[topic][type][uid]
                return
            }
            this.registrations[topic][type][uid] = true
        })
    }

    getEmails(uids) {
        return [`fabian@lunie.io`]
    }

    getEmailContent(notification) {
        return {content: "HELLO WORLD", subject: "test"}
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
                    from: {email: 'notifications@pepisandbox.com', name: 'Lunie Notifications'},
                    subject,
                    content: [{type: 'html', value: content}],
                    personalizations: [{to: [{email}]}]
                })
            }).then(res => res.json())
            if (res.status !== "success") {
                console.error(res)
            }
        })
    }
}

module.exports = NotificationController