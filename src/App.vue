<template>
  <div>
    <div id="app">
      <router-view name="session" />
      <AppHeader />
      <div id="app-content">
        <div id="bar-container">
          <CookieBar v-if="!isMobileApp" />
          <MaintenanceBar />
          <DisconnectedBar />
        </div>
        <router-view />
      </div>
      <MobileMenu />
      <TmNotifications :notifications="notifications" />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex"
import AppHeader from "common/AppHeader"
import MobileMenu from "common/MobileMenu"
import CookieBar from "common/CookieBar"
import MaintenanceBar from "common/MaintenanceBar"
import DisconnectedBar from "common/DisconnectedBar"
import TmNotifications from "common/TmNotifications"
import store from "./vuex/store"
import config from "src/../config"

export default {
  name: `app`,
  metaInfo: {
    title: "Lunie — Simple Staking Wallet | Staking Rewards",
    titleTemplate: "%s ← Lunie.io"
  },
  components: {
    AppHeader,
    TmNotifications,
    CookieBar,
    MaintenanceBar,
    DisconnectedBar,
    MobileMenu
  },
  data: () => ({
    isMobileApp: config.mobileApp
  }),
  computed: {
    ...mapState([`notifications`, `session`])
  },
  store
}
</script>

<style>
@import "./styles/app.css";
</style>
