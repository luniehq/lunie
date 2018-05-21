export default function() {
  let body = document.body
  let html = document.documentElement

  let height = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  )
  return height
}
