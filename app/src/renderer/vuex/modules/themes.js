import light from "../json/theme-light.json"
import dark from "../json/theme-dark.json"

function setCssVar(key, value) {
  document.documentElement.style.setProperty(`--${key}`, value)
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
    setTheme(state, theme) {
      state.active = theme
    },
    updateTheme(state) {
      if (state.active === "light") {
        commit("setThemeLight")
      } else {
        commit("setThemeDark")
      }
    },
    setThemeLight(state) {
      let theme = state.options.light
      for (let key in theme) {
        setCssVar(key, theme[key])
      }
    },
    setThemeDark(state) {
      let theme = state.options.dark
      for (let key in theme) {
        setCssVar(key, theme[key])
      }
    }
  }
  return {
    state,
    mutations
  }
}
