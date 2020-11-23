<template>
  <div id="app" :class="themeClass">
    <div id="app-content">
      <div id="bar-container">
        <CookieBar v-if="!isMobileApp" />
      </div>
      <router-view />
    </div>
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
    CookieBar,
  },
  computed: {
    ...mapState([`session`]),
    isMobileApp() {
      return this.session.mobile
    },
    themeClass() {
      return `lunie-light`
    },
  },
  store,
}
</script>

<style>
@import "./styles/app.css";
</style>
