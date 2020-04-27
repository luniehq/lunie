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
messaging.setBackgroundMessageHandler(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
  console.log('extra')

  const title = 'Push Codelab';
  const options = {
    body: 'Yay it works.',
    icon: 'https://i.ibb.co/3h2p9dX/android-icon-72x72.png',
    badge: 'images/badge.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});