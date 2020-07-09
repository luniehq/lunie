const database = require("./database");
const config = require("../config");
const { eventSubscription } = require("./subscriptions");

class NotificationController {
    constructor() {
        this.db = database(config)
        this.registrations = {
            "cosmos1el6l8q96e7gjgsdzvmpzx9kdnlde079e4s62jr_transactionSend_cosmos-hub-testnet": {
                email: { "abc": true },
                push: {}
            }
        }
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
        return Object.keys(this.registrations[notification.topic][type] || {})
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
        return {content: "HELLO WORLD", subject: test}
    }

    sendEmail(emails, subject, content) {
        emails.forEach(email => {
            fetch(`https://api.pepipost.com/v5/mail/send`, {
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
            })
        })
    }
}

module.exports = NotificationController