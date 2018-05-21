export default function(text) {
  let hiddenInput = document.createElement("input")

  // set the text to be copied
  hiddenInput.setAttribute("value", text)

  // add the element
  document.body.appendChild(hiddenInput)

  // select the text
  hiddenInput.select()

  // copy the text
  try {
    document.execCommand("copy")
    // console.log(text, 'copied to clipboard')
  } catch (e) {
    console.log(e)
  }

  // remove the element
  document.body.removeChild(hiddenInput)
}
