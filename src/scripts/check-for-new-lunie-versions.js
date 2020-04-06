/*
 * this script polls the Lunie site every minute and extracts its etag to check if there has been
 * any new Lunie versions deployed on Netlify while the user had the app open on the browser
 */

const checkForNewLunieVersions = () => {
  let currentEtag = ""
  let loaded = false

  setInterval(() => {
    fetch(window.location.origin, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(result => {
      console.log("Current Etag", result.headers.get("etag"))
      if (!loaded) {
        currentEtag = result.headers.get("etag")
        loaded = true
      }
      console.log("Client Etag", currentEtag)
      if (currentEtag !== result.headers.get("etag")) {
        console.log("Outdated Lunie version detected! Refreshing...")
        // the client has an outdated version. We need to refresh the browser to get the latest changes (and chunks)
        // when the reload method receives true as an argument, it will always reload the page from the server
        window.location.reload(true)
        loaded = false
      }
    })
    // The check for new versions is repeated every minute
  }, 10000)
}

module.exports = { checkForNewLunieVersions }
