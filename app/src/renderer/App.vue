<template lang="pug">
#app
  modal-help
  session(v-if="config.modals.session.active")
  onboarding(v-else-if="onboarding.active")
  template(v-else)
    app-header
    #app-content
      router-view
      app-footer
    modal-receive
  notifications(:notifications='notifications' theme='cosmos')
  modal-error(v-if='config.modals.error.active' :body='config.modals.error.message')
  modal-no-nodes(v-if='config.modals.connection.active')
  modal-lcd-approval(v-if='approvalRequired' :hash='approvalRequired')
</template>

<script>
import { mapGetters } from "vuex"
import AppHeader from "common/AppHeader"
import AppFooter from "common/AppFooter"
import Notifications from "@nylira/vue-notifications"
import ModalError from "common/NiModalError"
import ModalHelp from "common/NiModalHelp"
import ModalLcdApproval from "common/NiModalLCDApproval"
import ModalNoNodes from "common/NiModalNoNodes"
import ModalReceive from "common/NiModalReceive"
import Onboarding from "common/NiOnboarding"
import Session from "common/NiSession"
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
    ModalNoNodes,
    Notifications,
    Onboarding,
    Session
  },
  computed: {
    ...mapGetters([
      "notifications",
      "config",
      "themes",
      "approvalRequired",
      "onboarding"
    ])
  },
  mounted() {
    this.$store.commit("loadTheme")
    this.$store.commit("loadOnboarding")
  },
  store,
  watch: {
    "themes.active"() {
      this.$store.commit("updateTheme", this.themes.active)
    }
  }
}
</script>

<style lang="stylus" src="./styles/app.styl"></style>
