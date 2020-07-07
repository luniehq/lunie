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
      <TmBtn
        id="niteModeBtn"
        value="NITE"
        type="secondary"
        @click.native="niteModeToggle()"
      />
      <UserMenu v-if="!isMobileApp && session.experimentalMode" />
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
  computed: {
    ...mapState([`notifications`, `session`]),
    ...mapGetters([`network`]),
    isMobileApp() {
      return this.session.mobile
    },
  },
  methods: {
    niteModeToggle() {
      if (this.$el.classList[0] === `lunie-dark`) {
        this.$el.classList = [this.network]
      } else {
        this.$el.classList = [`lunie-dark`]
      }
    },
  },
  store,
}
</script>

<style>
@import "./styles/app.css";
</style>
