const database = require('../database')
const config = require('../../config')
const { eventSubscription } = require('../subscriptions')
const {
  getTopic,
  getMessageTitle,
  getPushLink,
  getIcon
} = require('./notifications')
const { getDefaultEmailSubscriptions } = require('./notifications-types')
const firebaseAdmin = require('./firebase')
const Sentry = require('@sentry/node')

class NotificationController {
  constructor(networks) {
    this.db = database(config)
    this.registrations = {
      'cosmos1px678cw4m5j5ye52ydjapf2kcw5edn0p6u9cry_transactionSend_cosmos-hub-testnet': {
        email: { abc: true },
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
    eventSubscription((notification) => {
      this.onNotificationSendEmails(notification)
      this.onNotificationSendPushNotifications(notification)
    })
  }

  async onNotificationSendEmails(notification) {
    const emailUsers = await this.getRegisteredUsers(notification, 'email')
    const emails = await this.getEmails(emailUsers)
    const { content, subject } = this.getEmailContent(notification)
    this.sendEmails(emails, subject, content)
  }

  async onNotificationSendPushNotifications(notification) {
    const pushNotificationUsers = await this.getRegisteredUsers(
      notification,
      'push'
    )
    if (pushNotificationUsers.length > 0) {
      this.sendPushNotification(notification)
    }
  }

  getRegistrationsFromDB() {
    this.db('')
      .getNotificationRegistrations()
      .then((rows) => {
        rows.forEach(({ topic, type, uid }) => {
          if (!this.registrations[topic])
            this.registrations[topic] = { email: {}, push: {} }
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
  async updateRegistrations(
    uid,
    addressObjects,
    notificationType,
    dataSources,
    pushToken
  ) {
    let topics = []
    if (notificationType === 'email') {
      topics = (
        await getDefaultEmailSubscriptions(addressObjects, dataSources)
      ).map((topic) => ({ topic, type: 'email' }))
    } else {
      topics = (
        await getDefaultEmailSubscriptions(addressObjects, dataSources)
      ).map((topic) => ({ topic, type: 'push' }))

      this.subscribeUserToPushNotificationTopics(
        pushToken,
        topics.map(({ topic }) => topic)
      )
    }
    // set the topics locally (in memory)
    topics.forEach(({ topic, type }) => {
      if (!this.registrations[topic])
        this.registrations[topic] = { email: {}, push: {} }
      this.registrations[topic][type][uid] = true
    })

    // set topics in database for persistence
    const rows = topics.map((topic) => ({
      ...topic,
      uid
    }))
    this.db('').storeNotificationRegistrations(rows)
  }

  async getEmails(uids) {
    return await Promise.all(
      uids
        .map(async (uid) => {
          try {
            const user = await firebaseAdmin.auth().getUser(uid)
            return user.email
          } catch (error) {
            Sentry.withScope(function (scope) {
              console.error(error)
              scope.setExtra('uid', uid)
              Sentry.captureException(err)
            })
            return undefined
          }
        })
        .filter((email) => !!email)
    )
  }

  getEmailContent(notification) {
    return {
      subject: getMessageTitle(this.networks, notification),
      content: `
                <p>There is a notification on Lunie we believe requires your attention</p>
                <p>
                    <a href="${config.frontendURL}${getPushLink(
        this.networks,
        notification
      )}">${getMessageTitle(this.networks, notification)}</a>
                </p>
            `
    }
  }

  sendEmails(emails, subject, content) {
    emails.forEach(async (email) => {
      const res = await fetch(`https://api.pepipost.com/v5/mail/send`, {
        method: 'POST',
        headers: {
          api_key: config.pepipostAPIKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          from: {
            email: 'notifications@lunie.io',
            name: 'Lunie Notifications'
          },
          subject,
          content: [{ type: 'html', value: content }],
          personalizations: [{ to: [{ email }] }]
        })
      }).then((res) => res.json())
      if (res.status !== 'success') {
        console.error(res)
        Sentry.captureException(new Error(JSON.stringify(res.error)))
      }
    })
  }

  // users need to be registered individually per topic
  subscribeUserToPushNotificationTopics(pushToken, topics) {
    return Promise.all(
      topics.map((topic) =>
        firebaseAdmin
          .messaging()
          .subscribeToTopic(pushToken, topic)
          .then(() => undefined)
          .catch((error) => {
            console.error(error)
            Sentry.captureException(error)
            return topic
          })
      )
    ).then((results) => {
      const failedTopics = results.filter((topic) => !!topic)
      if (failedTopics.length > 0) {
        console.error(
          `Failed to register ${pushToken} for topics ${failedTopics}`
        )
      } else {
        console.log(`Successfully registered ${pushToken} for topics ${topics}`)
      }
    })
  }

  async sendPushNotification(notification) {
    const topic = getTopic(notification)
    const body = getMessageTitle(this.networks, notification)
    // const image = getIcon(notification) // should we use an icon per notification or just use the Lunie logo?

    const message = {
      notification: {
        body,
        image:
          'https://lunie.fra1.digitaloceanspaces.com/lunie-push-notification.PNG'
      },
      topic,
      data: {
        link: getPushLink(this.networks, notification)
      }
    }

    try {
      await firebaseAdmin.messaging().send(message)
      console.log('Send notification for topic', topic)
    } catch (error) {
      console.error('Error sending message:', error, message)
      Sentry.captureException(error)
    }
  }
}

module.exports = NotificationController
