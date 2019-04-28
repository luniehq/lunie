<template>
  <div id="app">
    <Session />
    <template>
      <AppHeader />
      <div id="app-content">
        <router-view />
      </div>
    </template>
    <TmNotifications :notifications="notifications" />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import AppHeader from "common/AppHeader"
import TmNotifications from "common/TmNotifications"
import Session from "common/TmSession"
import store from "./vuex/store"

export default {
  name: `app`,
  components: {
    AppHeader,
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
