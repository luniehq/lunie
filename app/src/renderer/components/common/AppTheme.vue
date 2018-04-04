<template lang="pug">
#app-theme
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'app-theme',
  computed: { ...mapGetters(['config']) },
  methods: {
    setTheme (theme) {
      if (theme === 'light') {
        this.setThemeLight()
      } else {
        this.setThemeDark()
      }
    },
    setThemeLight () {
      this.setCssVar('app-fg', '#eee')
      this.setCssVar('app-bg', '#fff')
      this.setCssVar('app-bg-alpha', 'hsla(233, 0%, 0%, 5%)')
      this.setCssVar('bright', '#000')
      this.setCssVar('txt', '#333')
      this.setCssVar('dim', '#666')
      this.setCssVar('bc', '#ddd')
      this.setCssVar('bc-dim', '#eee')
      this.setCssVar('hover-bg', 'hsl(233, 0%, 90%)')
      this.setCssVar('input-bc', 'hsl(233, 22%, 67%)')
      this.setCssVar('input-bc-hover', 'hsl(233, 22%, 40%)')
    },
    setThemeDark () {
      this.setCssVar('app-fg', 'hsl(233, 33%, 16%)')
      this.setCssVar('app-bg', 'hsl(233, 36%, 13%)')
      this.setCssVar('app-bg-alpha', 'hsla(233, 36%, 13%, 95%)')
      this.setCssVar('bright', '#fff')
      this.setCssVar('txt', 'hsl(233, 13%, 85%)')
      this.setCssVar('dim', 'hsl(233, 13%, 60%)')
      this.setCssVar('bc', 'hsl(233, 22%, 23%)')
      this.setCssVar('bc-dim', 'hsl(233, 33%, 16%)')
      this.setCssVar('hover-bg', 'hsl(233, 43%, 10%)')
      this.setCssVar('input-bc', 'hsl(233, 22%, 33%)')
      this.setCssVar('input-bc-hover', 'hsl(233, 22%, 40%)')
    },
    setCssVar (key, value) {
      document.documentElement.style.setProperty(`--${key}`, value)
    }
  },
  mounted () {
    this.setTheme(this.config.theme)
  },
  watch: {
    'config.theme' (newTheme) {
      this.setTheme(newTheme)
    }
  }
}
</script>
