let toc,
  htmlScrollHeight,
  htmlViewportHeight,
  amountOfHtmlToScroll,
  sidebarScrollHeight,
  sidebarHeight,
  amountOfSidebarToScroll

function scrollListener() {
  let htmlScrollTop = window.scrollY
  let ratioScrolled = htmlScrollTop / amountOfHtmlToScroll // scrollSpeedMult
  let sidebarScrollTop = ratioScrolled * amountOfSidebarToScroll
  toc.scrollTop = sidebarScrollTop
}

function scrollIt() {
  toc = document.querySelector(".minimal-toc")

  htmlScrollHeight = document.body.scrollHeight
  htmlViewportHeight = window.innerHeight
  amountOfHtmlToScroll = htmlScrollHeight - htmlViewportHeight

  sidebarScrollHeight = document.querySelector(".minimal-toc").scrollHeight
  sidebarHeight = document.querySelector(".minimal-toc").offsetHeight
  amountOfSidebarToScroll = sidebarScrollHeight - sidebarHeight

  // console.log('htmlScrollH', htmlScrollHeight, 'htmlViewport', htmlViewportHeight)
  // console.log('sidebarScrollH', sidebarScrollHeight, 'sidebarH', sidebarHeight)

  window.addEventListener("scroll", scrollListener)
}

export default function() {
  if (document.documentElement.clientWidth >= 1024) {
    scrollIt()
  }

  // disable percentage scrolling on smaller displays
  window.addEventListener(
    "resize",
    function() {
      // console.log('disabling scrolling')
      if (document.documentElement.clientWidth < 1024) {
        window.removeEventListener("scroll", scrollListener)
      }
    },
    false
  )
}
