module.exports = function (gaUID) {
  window.onload = function () {
    let gaLoadScript = document.createElement('script')
    gaLoadScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaUID
    document.body.appendChild(gaLoadScript)

    window.dataLayer = window.dataLayer || []
    function gtag () {
      window.dataLayer.push(arguments)
    }
    gtag('js', new Date())
    gtag('config', gaUID)
  }
}
