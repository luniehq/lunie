<template>
  <div id="app" :class="network">
    <NetworkSelector />
    <AppHeader />
    <div id="app-content">
      <div id="bar-container">
        <CookieBar v-if="!isMobileApp" />
        <MaintenanceBar />
        <DisconnectedBar />
      </div>
      <router-view name="session" />
      <router-view />
    </div>
    <MobileMenu />
    <TmNotifications :notifications="notifications" />
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import AppHeader from "common/AppHeader"
import CookieBar from "common/CookieBar"
import DisconnectedBar from "common/DisconnectedBar"
import MaintenanceBar from "common/MaintenanceBar"
import MobileMenu from "common/MobileMenu"
import NetworkSelector from "common/NetworkSelector"
import TmNotifications from "common/TmNotifications"
import store from "./vuex/store"
import config from "src/../config"

export default {
  name: `app`,
  components: {
    AppHeader,
    CookieBar,
    DisconnectedBar,
    MaintenanceBar,
    MobileMenu,
    NetworkSelector,
    TmNotifications,
  },
  data: () => ({
    isMobileApp: config.mobileApp,
  }),
  computed: {
    ...mapState([`notifications`, `session`]),
    ...mapGetters([`network`]),
  },
  store,
}
</script>

<style>
@import "./styles/app.css";
</style>
