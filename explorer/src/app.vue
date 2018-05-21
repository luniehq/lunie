<template lang="pug">
#app
  app-header
  #app-content
    #app-main: router-view
    app-footer
</template>

<script>
import requestInterval from 'request-interval'
import AppFooter from './components/AppFooter'
import AppHeader from './components/AppHeader'
import store from './store/index'
export default {
  name: 'app',
  components: {
    AppHeader,
    AppFooter
  },
  mounted () {
    requestInterval(1000, () => this.$store.dispatch('getStatus'))
    requestInterval(1000, () => this.$store.dispatch('getNodes'))
    this.$store.dispatch('getStatus')
    this.$store.dispatch('getNodes').then(() => {
      this.$store.dispatch('getValidators')
    })
    requestInterval(30 * 60 * 1000, () => this.$store.dispatch('getValidators'))
  },
  store
}
</script>

<style lang="stylus" src="./styles/app.styl"></style>
