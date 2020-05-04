importScripts('https://www.gstatic.com/firebasejs/7.12.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.12.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyCrA4mq9v926h3aX9mfkLlzUSRbjFude14",
  projectId: "lunie-push-notifications",
  messagingSenderId: "783884833065",
  appId: "1:783884833065:web:ea02768959989b9218a738"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();
messaging.usePublicVapidKey("BC_2HRHQW9erg_lOd-dFe_R2ISeiXi0qPNqNcL-jBDnsmMXkqnFcBpXqIklsJtkDPiBmSoOlAMDMOyZMt_Njugo")

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should implement this optional method.
messaging.setBackgroundMessageHandler(payload => {
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://lunie.fra1.digitaloceanspaces.com/android-icon-72x72.png'
  }

  // no notification sent if web app is focused
  return self.registration.showNotification(payload.notification.title,
    notificationOptions);
})

self.addEventListener('push', event => {
  const eventData = event.data.json()
  const options = {
    body: eventData.notification.body,
    icon: 'https://lunie.fra1.digitaloceanspaces.com/android-icon-72x72.png',
    data: {
      url: eventData.fcmOptions.link
    }
  }

  event.waitUntil(self.registration.showNotification(eventData.notification.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (clients.openWindow && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});