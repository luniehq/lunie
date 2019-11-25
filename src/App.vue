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
const AppHeader = () => import("common/AppHeader")
const MobileMenu = () => import("common/MobileMenu")
const CookieBar = () => import("common/CookieBar")
const MaintenanceBar = () => import("common/MaintenanceBar")
const DisconnectedBar = () => import("common/DisconnectedBar")
const TmNotifications = () => import("common/TmNotifications")
import store from "./vuex/store"
import config from "src/../config"

export default {
  name: `app`,
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
