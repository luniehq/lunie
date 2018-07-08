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
  tm-notifications(:notifications='notifications' theme='cosmos')
  modal-error(v-if='config.modals.error.active' :body='config.modals.error.message')
  modal-no-nodes(v-if='config.modals.nonodes.active')
  modal-lcd-approval(v-if='approvalRequired' :hash='approvalRequired')
</template>

<script>
import { mapGetters } from "vuex"
import AppHeader from "common/AppHeader"
import AppFooter from "common/AppFooter"
import { TmNotifications } from "@tendermint/ui"
import ModalError from "common/TmModalError"
import ModalHelp from "common/TmModalHelp"
import ModalLcdApproval from "common/TmModalLCDApproval"
import ModalNoNodes from "common/TmModalNoNodes"
import ModalReceive from "common/TmModalReceive"
import Onboarding from "common/TmOnboarding"
import Session from "common/TmSession"
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
    TmNotifications,
    ModalNoNodes,
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
    this.$store.commit("loadOnboarding")
  },
  store
}
</script>

<style lang="stylus" src="./styles/app.styl"></style>
