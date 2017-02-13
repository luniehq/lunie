<template>
  <div>
    <app-header></app-header>
    <div class="app-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader'
import store from './vuex/store'
export default {
  components: {
    AppHeader
  },
  store
}
</script>

<style src="./styles/screen.styl" lang="stylus"></style>
