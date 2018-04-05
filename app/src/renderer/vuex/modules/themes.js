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
      setCssVars(state.options.light)
    },
    setThemeDark(state) {
      setCssVars(state.options.dark)
    }
  }
  return {
    state,
    mutations
  }
}
