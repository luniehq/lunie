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
  modal-lcd-approval(v-if='approvalRequired' :hash='approvalRequired')
</template>

<script>
import { mapGetters } from "vuex"
import AppHeader from "common/AppHeader"
import AppFooter from "common/AppFooter"
import Notifications from "@nylira/vue-notifications"
import ModalError from "common/NiModalError"
import ModalHelp from "common/NiModalHelp"
import ModalReceive from "common/NiModalReceive"
import Session from "common/NiSession"
import ModalLcdApproval from "common/NiModalLCDApproval"
import store from "./vuex/store"
export default {
  name: "app",
  components: {
    AppHeader,
    AppFooter,
    ModalError,
    ModalHelp,
    ModalLcdApproval,
    ModalReceive,
    Notifications,
    Session
  },
  computed: {
    ...mapGetters(["notifications", "config", "themes", "approvalRequired"])
  },
  mounted() {
    this.$store.commit("updateTheme", this.themes.active)
  },
  store,
  watch: {
    "themes.active"(newTheme) {
      this.$store.commit("updateTheme", this.themes.active)
    }
  }
}
</script>

<style lang="stylus" src="./styles/app.styl"></style>
