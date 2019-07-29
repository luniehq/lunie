<template>
  <v-app>
    <Menu />

    <!-- <v-app-bar app>
  </v-app-bar> -->

    <!-- Sizes your content based upon application components -->
    <v-content>
      <CookieBar />
      <MaintenanceBar />
      <DisconnectedBar />

      <router-view name="session" />

      <!-- Provides the application the proper gutter -->
      <v-container>
        <!-- If using vue-router -->
        <router-view></router-view>
      </v-container>
    </v-content>

    <v-footer app>
      <!-- -->
    </v-footer>
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
import store from "./vuex/store"

export default {
  name: `app`,
  components: {
    Menu,
    TmNotifications,
    CookieBar,
    MaintenanceBar,
    DisconnectedBar
  },
  computed: {
    ...mapGetters([`notifications`])
  },
  methods: {
    signOut() {
      this.$store.dispatch("signOut")
    }
  },
  store
}
</script>

<style>
@import "./styles/app.css";
</style>
