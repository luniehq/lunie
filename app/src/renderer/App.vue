<template>
  <div id="app">
    <modal-help />
    <session v-if="session.modals.session.active" />
    <template v-else>
      <app-header />
      <div id="app-content">
        <router-view />
      </div>
    </template>
    <tm-notifications :notifications="notifications" />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import AppHeader from "common/AppHeader"
import TmNotifications from "common/TmNotifications"
import ModalHelp from "common/TmModalHelp"
import Session from "common/TmSession"
import store from "./vuex/store"

export default {
  name: `app`,
  components: {
    AppHeader,
    ModalHelp,
    TmNotifications,
    Session
  },
  computed: {
    ...mapGetters([`notifications`, `session`])
  },
  store
}
</script>

<style>
@import "./styles/app.css";
</style>
