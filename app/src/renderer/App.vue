<template>
  <div id="app">
    <modal-help />
    <session v-if="config.modals.session.active" />
    <onboarding v-else-if="onboarding.active" />
    <template v-else>
      <app-header />
      <div id="app-content"><router-view /></div>
      <modal-receive />
    </template>
    <tm-notifications :notifications="notifications" theme="cosmos" />
    <modal-error
      v-if="config.modals.error.active"
      :body="config.modals.error.message"
    />
    <modal-no-nodes v-if="config.modals.noNodes.active" />
    <modal-node-halted v-if="config.modals.nodeHalted.active" />
    <modal-lcd-approval v-if="approvalRequired" :hash="approvalRequired" />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import AppHeader from "common/AppHeader"
import { TmNotifications } from "@tendermint/ui"
import ModalError from "common/TmModalError"
import ModalHelp from "common/TmModalHelp"
import ModalLcdApproval from "common/TmModalLCDApproval"
import ModalNoNodes from "common/TmModalNoNodes"
import ModalNodeHalted from "common/TmModalNodeHalted"
import ModalReceive from "common/TmModalReceive"
import Onboarding from "common/TmOnboarding"
import Session from "common/TmSession"
import store from "./vuex/store"
export default {
  name: `app`,
  components: {
    AppHeader,
    ModalError,
    ModalHelp,
    ModalLcdApproval,
    ModalReceive,
    TmNotifications,
    ModalNoNodes,
    ModalNodeHalted,
    Onboarding,
    Session
  },
  computed: {
    ...mapGetters([
      `notifications`,
      `config`,
      `themes`,
      `approvalRequired`,
      `onboarding`
    ])
  },
  mounted() {
    this.$store.commit(`loadOnboarding`)
    this.$store.commit(`setTheme`, `dark`)
  },
  store
}
</script>

<style>
@import "./styles/app.css";
</style>
