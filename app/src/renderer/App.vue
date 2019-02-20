<template>
  <div id="app">
    <modal-help />
    <session v-if="session.modals.signin.active" />
    <onboarding v-else-if="onboarding.active" />
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
import Onboarding from "common/TmOnboarding"
import Session from "common/TmSession"
import store from "./vuex/store"

/**
 * Main App component
 * @vue-prop {String} propname Just an example
 * @vue-prop {Number} [niceProp=1] - A very cool incoerent prop not required but with 1 as default
 * @vue-data {Object} nothing
 * @vue-computed {function} notifications mapGetter
 * @vue-computed {function} session mapGetter
 * @vue-computed {function} onboarding mapGetter
 */
export default {
  name: `app`,
  components: {
    AppHeader,
    ModalHelp,
    TmNotifications,
    Onboarding,
    Session
  },
  computed: {
    ...mapGetters([`notifications`, `session`, `onboarding`])
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
