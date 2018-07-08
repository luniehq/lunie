import light from "../json/theme-light.json"
import dark from "../json/theme-dark.json"

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
      localStorage.setItem("appTheme", theme)
    },
    updateTheme(state, theme) {
      const newTheme = state.options[theme]
      const isWin = navigator.platform.toUpperCase().indexOf("WIN") >= 0
      if (isWin) {
        document.documentElement.style.setProperty(`--font-weight`, 400)
      }
      for (let key in newTheme) {
        document.documentElement.style.setProperty(`--${key}`, newTheme[key])
      }
    }
  }

  const actions = {
    loadTheme({ state, commit }) {
      const theme = localStorage.getItem("appTheme")
      commit("setTheme", theme)
      commit("updateTheme", theme)
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
