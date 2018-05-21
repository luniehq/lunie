export default function() {
  let lsLang = window.localStorage.getItem("language")
  let lang
  if (lsLang) {
    // console.log('localStorage language exists!', lsLang)
    lang = lsLang
  } else {
    let browserLang = navigator.language || navigator.userLanguage
    let lang
    switch (browserLang) {
      case "ja":
        lang = "ja"
        break
      case "ko":
        lang = "ko"
        break
      case "zh-CN":
        lang = "zh"
        break
      default:
        lang = "en"
        break
    }
    // console.log('localStorage language does not exist, setting it', lang)
    window.localStorage.setItem("language", lang)
  }
  return lang
}
