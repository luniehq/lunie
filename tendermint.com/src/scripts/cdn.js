let server = "https://raw.githubusercontent.com/tendermint/aib-data/master/"

export function image(type, slug, filetype) {
  let fileExtension
  if (filetype) fileExtension = filetype
  else fileExtension = "png"

  return `${server}/images/${type}/${slug}.${fileExtension}`
}
export function portrait(slug) {
  return `${server}/images/people/${slug}.jpg`
}
export function json(slug) {
  return `${server}/json/${slug}.png`
}
