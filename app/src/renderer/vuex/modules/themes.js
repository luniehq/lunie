import light from "../json/theme-light.json"
import dark from "../json/theme-dark.json"

function setCssVars(theme) {
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
      commit("updateTheme", theme)
    },
    setTheme(state, theme) {
      commit("updateTheme", theme)
      localStorage.setItem("appTheme", theme)
    },
    updateTheme(state, theme) {
      state.active = theme
      if (theme === "light") {
        setCssVars(state.options.light)
      } else {
        setCssVars(state.options.dark)
      }
    }
  }
  return {
    state,
    mutations
  }
}
