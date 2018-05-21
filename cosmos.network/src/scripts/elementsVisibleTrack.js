/* global IntersectionObserver */
import "intersection-observer"

let visibleElements = []
let longElement

function onChange(entries) {
  if (longElement && visibleElements.length >= 2) {
    longElement.classList.remove("active")
    visibleElements.splice(visibleElements.indexOf(longElement), 1)
    longElement = null
  }
  entries.forEach(entry => {
    let el = entry.target
    // console.log('el', el)
    if (visibleElements.includes(el)) {
      if (visibleElements.length >= 2) {
        // console.log(el.id, 'is no longer visible - DELETE')
        el.classList.remove("active")
        visibleElements.splice(visibleElements.indexOf(el), 1)
      } else {
        longElement = el
        // console.log('longElement:', longElement.id)
      }
    } else {
      el.classList.add("active")
      visibleElements.push(el)
    }
  })
  // console.log('visibleElements:', visibleElements)
}

export default function() {
  let io = new IntersectionObserver(onChange, { threshold: [1] })

  let headings = document.querySelectorAll("h2, h3, h4")
  Array.from(headings).map(function(el) {
    io.observe(el)
  })

  return visibleElements
}
