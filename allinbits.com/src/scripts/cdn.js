let server = 'https://raw.githubusercontent.com/tendermint/aib-data/master/'

export function image (type, slug) {
  return `${server}/images/${type}/${slug}.png`
}
export function portrait (slug) {
  return `${server}/images/people/${slug}.jpg`
}
export function json (slug) {
  return `${server}/json/${slug}.png`
}
