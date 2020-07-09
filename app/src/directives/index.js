export const focusElement = {
  inserted: (el) => {
    el.focus()
  },
}

// Directive to Focus an element, but only if a child does not have focus
export const focusParentLast = {
  inserted: (el) => {
    if (!el.contains(document.activeElement)) {
      el.focus()
    }
  },
}
