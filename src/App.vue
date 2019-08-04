<template>
  <v-app>
    <Menu />

    <!-- Sizes your content based upon application components -->
    <v-content id="app-content">
      <CookieBar />
      <MaintenanceBar />
      <DisconnectedBar />

      <router-view name="session" />

      <!-- Provides the application the proper gutter -->
      <v-container>
        <!-- If using vue-router -->
        <router-view></router-view>
      </v-container>

      <PageFooter />
    </v-content>
    <TmNotifications :notifications="notifications" />
  </v-app>
</template>

<script>
import { mapGetters } from "vuex"
import Menu from "common/Menu"
import CookieBar from "common/CookieBar"
import MaintenanceBar from "common/MaintenanceBar"
import DisconnectedBar from "common/DisconnectedBar"
import TmNotifications from "common/TmNotifications"
import PageFooter from "common/TmPageFooter"
import store from "./vuex/store"

export default {
  name: `app`,
  components: {
    Menu,
    TmNotifications,
    CookieBar,
    MaintenanceBar,
    DisconnectedBar,
    PageFooter
  },
  computed: {
    ...mapGetters([`notifications`])
  },
  store
}
</script>

<style>
@import "./styles/app.css";
</style>
