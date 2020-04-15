import firebase from "firebase"
import config from "../../../config"

let messaging;

const initializeFirebase = () => {
    // TODO ENV like Lunie-API with absolute path
    var firebaseConfig = {
        apiKey: "AIzaSyCrA4mq9v926h3aX9mfkLlzUSRbjFude14",
        authDomain: "lunie-push-notifications.firebaseapp.com",
        databaseURL: "https://lunie-push-notifications.firebaseio.com",
        projectId: "lunie-push-notifications",
        storageBucket: "lunie-push-notifications.appspot.com",
        messagingSenderId: "783884833065",
        appId: "1:783884833065:web:ea02768959989b9218a738",
        measurementId: "G-S3JEYPBQWB"
    }

    firebase.initializeApp(firebaseConfig)

    messaging = firebase.messaging()
    // TODO ENV
    messaging.usePublicVapidKey('BC_2HRHQW9erg_lOd-dFe_R2ISeiXi0qPNqNcL-jBDnsmMXkqnFcBpXqIklsJtkDPiBmSoOlAMDMOyZMt_Njugo')
}

const askPermissionAndRegister = async (address, networkId) => {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
        console.log('Notification permission granted.');

        const token = await messaging.getToken()

        console.log('\n\n\n', token)
        await registerDevice(token, address, networkId)
    } else {
        console.log('Unable to get permission to notify.');
    }
}

const registerDevice = async (token, address, networkId) => {
    await fetch(`${config.graphqlHost}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: "mutation ($token: String!, $activeNetworks: String!, $topics: [String]) { registerDevice(token: $token, activeNetworks: $activeNetworks, topics: $topics) { topics } } ",
            variables: {
                token,
                activeNetworks: JSON.stringify([
                    { address, networkId }
                ])
            }
        })
    })
}

export default {
    initializeFirebase,
    askPermissionAndRegister,
    registerDevice
}