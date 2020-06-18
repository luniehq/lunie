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
      <UserMenu v-if="!isMobileApp && isDevelopmentMode" />
      <router-view name="session" />
      <router-view />
    </div>
    <MobileMenu />
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import AppHeader from "common/AppHeader"
import CookieBar from "common/CookieBar"
import DisconnectedBar from "common/DisconnectedBar"
import UserMenu from "account/UserMenu"
import MaintenanceBar from "common/MaintenanceBar"
import MobileMenu from "common/MobileMenu"
import NetworkSelector from "common/NetworkSelector"
import store from "./vuex/store"
import config from "src/../config"

export default {
  name: `app`,
  components: {
    AppHeader,
    CookieBar,
    DisconnectedBar,
    UserMenu,
    MaintenanceBar,
    MobileMenu,
    NetworkSelector,
  },
  data: () => ({
    isMobileApp: config.mobileApp,
    isDevelopmentMode: config.development,
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
