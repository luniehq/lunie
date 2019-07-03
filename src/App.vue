<template>
  <div>
    <CookieBar />
    <MaintenanceBar />
    <div id="app">
      <router-view name="session" />
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
import store from "./vuex/store"

export default {
  name: `app`,
  components: {
    AppHeader,
    TmNotifications,
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
