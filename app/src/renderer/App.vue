<template lang="pug">
#app
  app-header
  #app-content
    #app-main: router-view
    app-footer
  notifications(:notifications='notifications' theme='cosmos')
  modal-help
  session
</template>

<script>
import { mapGetters } from 'vuex'
import AppFooter from './components/common/AppFooter'
import AppHeader from './components/common/AppHeader'
import Notifications from '@nylira/vue-notifications'
import ModalHelp from './components/common/NiModalHelp'
import Session from './components/common/NiSession'
import store from './vuex/store'
export default {
  name: 'app',
  components: {
    AppHeader,
    AppFooter,
    ModalHelp,
    Notifications,
    Session
  },
  computed: {
    ...mapGetters(['notifications'])
  },
  store
}
</script>

<style lang="stylus" src="./styles/app.styl"></style>
