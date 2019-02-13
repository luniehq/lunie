<template>
  <div id="app">
    <div v-if="config.devMode" id="develop-mode-warning">
      DEVELOPMENT MODE
    </div>
    <modal-help />
    <session v-if="config.modals.session.active" />
    <onboarding v-else-if="onboarding.active" />
    <template v-else>
      <app-header />
      <div id="app-content"><router-view /></div>
    </template>
    <tm-notifications :notifications="notifications" />
    <modal-error
      v-if="config.modals.error.active"
      :body="config.modals.error.message"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import AppHeader from "common/AppHeader"
import TmNotifications from "common/TmNotifications"
import ModalError from "common/TmModalError"
import ModalHelp from "common/TmModalHelp"
import Onboarding from "common/TmOnboarding"
import Session from "common/TmSession"
import store from "./vuex/store"

/**
 * Main App component
 * @vue-prop {String} propname Just an example
 * @vue-prop {Number} [niceProp=1] - A very cool incoerent prop not required but with 1 as default
 * @vue-data {Object} nothing
 * @vue-computed {function} notifications mapGetter
 * @vue-computed {function} config mapGetter
 * @vue-computed {function} onboarding mapGetter
 */
export default {
  name: `app`,
  components: {
    AppHeader,
    ModalError,
    ModalHelp,
    TmNotifications,
    Onboarding,
    Session
  },
  computed: {
    ...mapGetters([`notifications`, `config`, `onboarding`])
  },
  mounted() {
    this.$store.commit(`loadOnboarding`)
  },
  store
}
</script>

<style>
@import "./styles/app.css";
</style>
