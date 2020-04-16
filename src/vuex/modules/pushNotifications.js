import firebase from "firebase"
import config from "../../../config"

let messaging

const initializeFirebase = () => {
    firebase.initializeApp(config.firebaseConfig)

    messaging = firebase.messaging()
    messaging.usePublicVapidKey(
        config.firebasePublicVapidKey
    )
}

const askPermissionAndRegister = async activeNetworks => {
    // Only store for new registrations
    const isDeviceRegistered = localStorage.getItem("registration-push-notifications") // "true" if stored

    if (isDeviceRegistered === "true") {
        const permission = await Notification.requestPermission()

        // Granted? Store device
        if (permission === "granted") {
            const token = await messaging.getToken()
            await registerDevice(token, activeNetworks)
        }
    }
}

const registerDevice = async (token, activeNetworks) => {
    const registrationResponse = await fetch(`${config.graphqlHost}`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query:
                "mutation ($token: String!, $activeNetworks: String!, $topics: [String]) { registerDevice(token: $token, activeNetworks: $activeNetworks, topics: $topics) { topics } } ",
            variables: {
                token,
                activeNetworks: JSON.stringify(activeNetworks)
            }
        })
    })

    if (registrationResponse.status === 200 && registrationResponse.ok) {
        localStorage.setItem("registration-push-notifications", "true")
    }
}

/**
 * Retrieve active networks from localstorage via session keys
 *
 * @param {[ Object ]} networks
 * @param network.id network identifier such as "cosmos-hub-testnet"
 */
const getActiveNetworks = networks => {
    let activeNetworks = []
    networks.forEach(network => {
        // Session object: { address: string, sessionType: string (e.g. ledger)}
        const networkObject = JSON.parse(
            localStorage.getItem(`session_${network.id}`)
        )

        // Only store network object if it has an associated address
        if (networkObject) {
            activeNetworks.push({
                address: networkObject.address,
                networkId: network.id
            })
        }
    })

    return activeNetworks
}

export default {
    initializeFirebase,
    askPermissionAndRegister,
    registerDevice,
    getActiveNetworks
}
