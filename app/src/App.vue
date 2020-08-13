<template>
  <div id="app" :class="themeClass">
    <NetworkSelector />
    <AppHeader />
    <div id="app-content">
      <div id="bar-container">
        <CookieBar v-if="!isMobileApp" />
        <MaintenanceBar />
        <DisconnectedBar />
      </div>
      <UserMenu v-if="!isMobileApp" />
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
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`network`]),
    isMobileApp() {
      return this.session.mobile
    },
    themeClass() {
      return !this.$route.meta.networkSpecificRoute
        ? `lunie-light`
        : this.network
    },
  },
  store,
}
</script>

<style>
@import "./styles/app.css";
</style>
