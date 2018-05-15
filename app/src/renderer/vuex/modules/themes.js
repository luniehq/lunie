import light from "../json/theme-light.json"
import dark from "../json/theme-dark.json"

function setCssVars(theme) {
  const isWin = navigator.platform.toUpperCase().indexOf("WIN") >= 0
  if (isWin) {
    document.documentElement.style.setProperty(`--font-weight`, 400)
  }
  for (let key in theme) {
    document.documentElement.style.setProperty(`--${key}`, theme[key])
  }
}

export default ({ commit }) => {
  const state = {
    active: "dark",
    options: {
      light: light,
      dark: dark
    }
  }
  const mutations = {
    loadTheme(state) {
      let theme = localStorage.getItem("appTheme")
      state.active = theme
    },
    setTheme(state, theme) {
      state.active = theme
      localStorage.setItem("appTheme", theme)
    },
    updateTheme(state, theme) {
      setCssVars(state.options[theme])
    }
  }
  return {
    state,
    mutations
  }
}
