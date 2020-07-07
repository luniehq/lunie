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
      <div class="user-controls">
        <TmBtn
          id="niteModeBtn"
          :value="isNiteMode ? `☀️ DayMode` : `🌜 NiteMode`"
          type="secondary"
          @click.native="niteModeToggle()"
        />
        <UserMenu v-if="!isMobileApp && session.experimentalMode" />
      </div>
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
import TmBtn from "src/components/common/TmBtn"
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
    TmBtn,
  },
  data: () => ({
    isNiteMode: false,
  }),
  computed: {
    ...mapState([`notifications`, `session`]),
    ...mapGetters([`network`]),
    isMobileApp() {
      return this.session.mobile
    },
  },
  methods: {
    niteModeToggle() {
      if (this.isNiteMode) {
        this.$el.classList = [this.network]
        this.isNiteMode = false
      } else {
        this.$el.classList = [`lunie-dark`]
        this.isNiteMode = true
      }
    },
  },
  store,
}
</script>

<style>
@import "./styles/app.css";

.user-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#niteModeBtn {
  width: 4rem;
  margin-left: 1rem;
}
</style>
