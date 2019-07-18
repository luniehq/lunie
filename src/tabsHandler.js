// requests always reference a tab so that a response finds the right listener
// if a tab is killed or it's url changes the request is not useful anymore
export function bindRequestsToTabs(signRequestQueue, whitelisted) {
  // check if tab got removed
  chrome.tabs.onRemoved.addListener(function(tabID) {
    signRequestQueue.unqueueSignRequestForTab(tabID)
  })
  // check if url changed
  chrome.tabs.onUpdated.addListener(function(tabID, changeInfo) {
    // if the url doesn't change, ignore the update
    if (!changeInfo.url) {
      return
    }
    if (
      !whitelisted.find(whitelistedUrl =>
        changeInfo.url.startsWith(whitelistedUrl)
      )
    ) {
      signRequestQueue.unqueueSignRequestForTab(tabID)
    }
  })
}
