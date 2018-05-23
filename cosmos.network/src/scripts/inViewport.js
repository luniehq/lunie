/* global IntersectionObserver */
import "intersection-observer"

let visibleElements = []
let largeElement

function onChange(entries) {
  // console.log('entries', entries)
  if (largeElement && visibleElements.length >= 2) {
    largeElement.classList.remove("active")
    visibleElements.splice(visibleElements.indexOf(largeElement), 1)
    largeElement = null
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
        largeElement = el
        // console.log('largeElement:', largeElement.id)
      }
    } else {
      el.classList.add("active")
      // visibleElements.push(el)
    }
  })
  // console.log('visibleElements:', visibleElements)
}

export default function(elements) {
  let io = new IntersectionObserver(onChange, { threshold: [1] })
  Array.from(elements).map(el => io.observe(el))
  return visibleElements
}
