<template>
  <div id="app">
    <app-header></app-header>
    <div id="app-content">
      <router-view></router-view>
    </div>
    <app-footer></app-footer>
    <notifications
      color="hsl(208,100%,25%)"
      :notifications="notifications">
    </notifications>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import store from './vuex/store'
import Notifications from '@nylira/vue-notifications'
import { mapGetters } from 'vuex'
export default {
  components: {
    AppHeader,
    Notifications,
    AppFooter
  },
  computed: {
    ...mapGetters(['notifications'])
  },
  store
}
</script>

<style src="./styles/app.styl" lang="stylus"></style>
