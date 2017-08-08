<template lang="pug">
  #app
    app-header
    #app-content
      router-view
    app-footer
    notifications(
      color="hsl(208,100%,25%)"
      :notifications="notifications")
</template>

<script>
import { mapGetters } from 'vuex'
import AppHeader from './components/staking/AppHeader.vue'
import AppFooter from './components/staking/AppFooter.vue'
import Notifications from '@nylira/vue-notifications'
import store from './vuex/store'
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
