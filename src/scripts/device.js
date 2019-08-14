export const isMobile = function() {
  const userAgentTest = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i
  if (navigator.userAgent.match(userAgentTest)) {
    return true
  }
  return false
}
