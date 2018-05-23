import scrollTo from "scroll-to"

export default function(tocVisibility) {
  function scrollToIt(e) {
    // console.log('scrolling to it!')
    e.preventDefault()

    let scrollSpeed = 666
    let el = document.querySelector(e.target.getAttribute("href"))
    let y

    if (el.id === "#page-top") {
      y = 0
    } else {
      y = el.offsetTop - 48 - 16
    }

    // if it's a small screen, hide the toc on click
    if (document.documentElement.clientWidth < 1024) {
      tocVisibility(false)
    }

    // scroll to the element
    scrollTo(0, y, { duration: scrollSpeed })
  }

  let tocLinks = Array.from(document.querySelectorAll(".minimal-toc a"))
  tocLinks.map(el => el.addEventListener("click", scrollToIt))
}
