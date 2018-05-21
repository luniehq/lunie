export const blog = state => state.blog
export const config = state => state.config
export const events = state => state.events.all
export const hackatom = state => state.hackatom
export const links = state => state.links.data
export const notifications = state => state.notifications
export const people = state => state.people.all
export const roadmap = state => state.roadmap

// toc
export const faqElementsVisible = state => state.toc.faq.elementsVisible
export const faqTocVisible = state => state.toc.faq.tocVisible
export const whitepaperElementsVisible = state =>
  state.toc.whitepaper.elementsVisible
export const whitepaperTocVisible = state => state.toc.whitepaper.tocVisible
