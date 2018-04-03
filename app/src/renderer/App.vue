<template lang="pug">
#app
  template(v-if="!config.modals.session.active")
    app-header
    #app-content
      router-view
      app-footer
    modal-help
  session(v-else)
  notifications(:notifications='notifications' theme='cosmos')
  modal-error(v-if='config.modals.error.active' :body='config.modals.error.message')
</template>

<script>
import { mapGetters } from 'vuex'
import AppHeader from 'common/AppHeader'
import AppFooter from 'common/AppFooter'
import Notifications from '@nylira/vue-notifications'
import ModalError from 'common/NiModalError'
import ModalHelp from 'common/NiModalHelp'
import Session from 'common/NiSession'
import store from './vuex/store'
export default {
  name: 'app',
  components: {
    AppHeader,
    AppFooter,
    ModalError,
    ModalHelp,
    Notifications,
    Session
  },
  computed: { ...mapGetters(['notifications', 'config']) },
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
  },
  store
}
</script>

<style lang="stylus" src="./styles/app.styl"></style>
