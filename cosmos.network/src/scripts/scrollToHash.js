/* eslint-env browser */
import scrollTo from "scroll-to"

export default function() {
  let hash = window.location.hash
  let scrollSpeed = 666

  if (hash) {
    // remove the hash
    history.replaceState("", document.title, window.location.pathname)

    // scroll to the hash with an animation
    // it has to be in document ready otherwise loading images will break it
    document.addEventListener("DOMContentLoaded", function() {
      let y = hash.offsetTop - 48
      scrollTo(0, y, { duration: scrollSpeed })
    })
  }
}
