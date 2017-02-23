<template>
  <div id="app">
    <app-header></app-header>
    <div id="app-content">
      <router-view></router-view>
    </div>
    <app-footer></app-footer>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader'
import AppFooter from './components/AppFooter'
import { mapGetters } from 'vuex'
import store from './vuex/store'
export default {
  components: {
    AppHeader,
    AppFooter
  },
  computed: {
    ...mapGetters(['notifications'])
  },
  store
}
</script>

<style src="./styles/screen.styl" lang="stylus"></style>
