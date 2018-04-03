<template lang="pug">
#app
  template(v-if="!config.modals.session.active")
    app-header
    #app-content
      router-view
      app-footer
    modal-help
    modal-receive
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
import ModalReceive from 'common/NiModalReceive'
import Session from 'common/NiSession'
import store from './vuex/store'
export default {
  name: 'app',
  components: {
    AppHeader,
    AppFooter,
    ModalError,
    ModalHelp,
    ModalReceive,
    Notifications,
    Session
  },
  computed: { ...mapGetters(['notifications', 'config']) },
  store
}
</script>

<style lang="stylus" src="./styles/app.styl"></style>
