<template>
  <div id="app">
    <modal-help />
    <template>
      <app-header />
      <div id="app-content"><router-view /></div>
      <modal-receive />
    </template>
    <tm-notifications :notifications="notifications" />
    <modal-error
      v-if="config.modals.error.active"
      :body="config.modals.error.message"
    />
    <modal-node-halted v-if="config.modals.nodeHalted.active" />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import AppHeader from "common/AppHeader"
import TmNotifications from "common/TmNotifications"
import ModalError from "common/TmModalError"
import ModalHelp from "common/TmModalHelp"
import ModalNodeHalted from "common/TmModalNodeHalted"
import ModalReceive from "common/TmModalReceive"
import store from "./vuex/store"

/**
 * Main App component
 * @vue-prop {String} propname Just an example
 * @vue-prop {Number} [niceProp=1] - A very cool incoerent prop not required but with 1 as default
 * @vue-data {Object} nothing
 * @vue-computed {function} notifications mapGetter
 * @vue-computed {function} config mapGetter
 */
export default {
  name: `app`,
  components: {
    AppHeader,
    ModalError,
    ModalHelp,
    ModalReceive,
    TmNotifications,
    ModalNodeHalted
  },
  computed: {
    ...mapGetters([`notifications`, `config`])
  },
  store
}
</script>

<style>
@import "./styles/app.css";
</style>
