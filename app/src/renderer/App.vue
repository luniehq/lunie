<template>
  <div id="app">
    <modal-help />
    <session />
    <template>
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

/**
 * Main App component
 * @vue-prop {String} propname Just an example
 * @vue-prop {Number} [niceProp=1] - A very cool incoerent prop not required but with 1 as default
 * @vue-data {Object} nothing
 * @vue-computed {function} notifications mapGetter
 * @vue-computed {function} session mapGetter
 */
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
