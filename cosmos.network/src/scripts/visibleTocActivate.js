export default function(visibleElements) {
  let anchors = Array.from(document.querySelectorAll(".minimal-toc a"))

  anchors.map(function(el) {
    let id = el.getAttribute("href")
    id = id.replace("#", "")

    if (visibleElements.find(el => el.id === id)) {
      el.classList.add("active")
      el.parentElement.classList.add("active")
    } else {
      el.classList.remove("active")
      el.parentElement.classList.remove("active")
    }
  })
}
