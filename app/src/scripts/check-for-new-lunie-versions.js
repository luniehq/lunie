/*
 * this script polls the Lunie site every minute and extracts its etag to check if there has been
 * any new Lunie versions deployed on Netlify while the user had the app open on the browser
 */

const checkForNewLunieVersions = () => {
  let clientEtag = ""
  let loaded = false

  setInterval(() => {
    fetch(window.location.origin).then((result) => {
      if (!loaded) {
        clientEtag = result.headers.get("etag")
        loaded = true
      }
      if (clientEtag !== result.headers.get("etag")) {
        console.log("Outdated Lunie version detected! Refreshing...")
        console.log(
          `Client Etag was ${clientEtag} and current etag is ${result.headers.get(
            "etag"
          )}`
        )
        // the client has an outdated version. We need to refresh the browser to get the latest changes (and chunks)
        // when the reload method receives true as an argument, it will always reload the page from the server
        window.location.reload(true)
      }
    })
    // The check for new versions is repeated every minute
  }, 60000)
}

module.exports = { checkForNewLunieVersions }
