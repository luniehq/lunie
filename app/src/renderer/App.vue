<template lang="pug">
#app
  app-header
  #app-content
    router-view
    app-footer
  notifications(:notifications='notifications' theme='cosmos')
  modal-help
  session
</template>

<script>
import { mapGetters } from 'vuex'
import AppHeader from 'common/AppHeader'
import AppFooter from 'common/AppFooter'
import Notifications from '@nylira/vue-notifications'
import ModalHelp from 'common/NiModalHelp'
import Session from 'common/NiSession'
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
