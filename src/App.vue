<template>
  <div id="app" :class="network">
    <AppHeader />
    <div id="app-content">
      <div id="bar-container">
        <CookieBar v-if="!isMobileApp" />
        <MaintenanceBar />
        <DisconnectedBar />
      </div>
      <div
        v-if="session.experimentalMode"
        id="notifications-button"
        @click="$router.push('/notifications')"
      >
        🔔 Notifications
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
import MobileMenu from "common/MobileMenu"
import CookieBar from "common/CookieBar"
import MaintenanceBar from "common/MaintenanceBar"
import DisconnectedBar from "common/DisconnectedBar"
import TmNotifications from "common/TmNotifications"
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
    ...mapState([`notifications`, `session`]),
    ...mapGetters([`network`])
  },
  store
}
</script>

<style>
@import "./styles/app.css";

#notifications-button {
  position: fixed;
  right: 1rem;
  top: 5rem;
  padding: 0.3rem;
  border-radius: 1rem;
  background-color: #fafa61;
  color: #000;
  cursor: pointer;
  font-size: 0.9rem;
  border: #f3b440 2px solid;
  z-index: 1;
}

#notifications-button:hover {
  background-color: #db621e;
}

@media screen and (max-width: 667px) {
  #notifications-button {
    right: 2.5rem;
    top: 2rem;
    padding: 0.1rem;
    font-size: 0.8rem;
    z-index: 100;
  }
}
</style>
