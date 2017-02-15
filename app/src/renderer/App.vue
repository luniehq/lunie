<template>
  <div id="app">
    <app-header></app-header>
    <div class="app-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader'
export default {
  components: {
    AppHeader
  }
}
</script>

<style src="./styles/screen.styl" lang="stylus"></style>
