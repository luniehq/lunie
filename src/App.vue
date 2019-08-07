<template>
  <div>
    <CookieBar />
    <MaintenanceBar />
    <DisconnectedBar />
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
import { mapState } from "vuex"
import AppHeader from "common/AppHeader"
import CookieBar from "common/CookieBar"
import MaintenanceBar from "common/MaintenanceBar"
import DisconnectedBar from "common/DisconnectedBar"
import TmNotifications from "common/TmNotifications"
import store from "./vuex/store"

export default {
  name: `app`,
  components: {
    AppHeader,
    TmNotifications,
    CookieBar,
    MaintenanceBar,
    DisconnectedBar
  },
  computed: {
    ...mapState([`notifications`, `session`])
  },
  store
}
</script>

<style>
@import "./styles/app.css";
</style>
