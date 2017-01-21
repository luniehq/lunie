<template>
  <div>
    <app-header></app-header>
    <router-view></router-view>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader'
import store from 'src/vuex/store'
export default {
  components: {
    AppHeader
  },
  store
}
</script>

<style src="./styles/screen.styl" lang="stylus"></style>
