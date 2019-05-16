<template>
  <div>
    <CookieBar />
    <MaintenanceBar />
    <div id="app">
      <Session />
      <AppHeader />
      <div id="app-content">
        <router-view />
      </div>
      <TmNotifications :notifications="notifications" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import AppHeader from "common/AppHeader"
import CookieBar from "common/CookieBar"
import MaintenanceBar from "common/MaintenanceBar"
import TmNotifications from "common/TmNotifications"
import Session from "common/TmSession"
import store from "./vuex/store"

export default {
  name: `app`,
  components: {
    AppHeader,
    TmNotifications,
    Session,
    CookieBar,
    MaintenanceBar
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
