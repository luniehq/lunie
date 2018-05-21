import copyToClipboard from "./copyToClipboard.js"

export default function() {
  let headings = Array.from(document.querySelectorAll("h2[id], h3[id], h4[id]"))
  headings.map(function(h) {
    let href = "#" + h.id
    h.innerHTML += `<i class="fa fa-link article-link" href="${href}"></i>`
  })

  function watchClick(link) {
    let url = window.location.href + link.getAttribute("href")
    copyToClipboard(url)

    // show the Copied! message for 1 second
    link.classList.add("active")

    setTimeout(function() {
      link.classList.remove("active")
      // console.log('a second passed!')
    }, 1000)
  }
  let articleLinks = Array.from(document.querySelectorAll("i.article-link"))
  articleLinks.map(link =>
    link.addEventListener("click", function() {
      watchClick(link)
    })
  )
}
