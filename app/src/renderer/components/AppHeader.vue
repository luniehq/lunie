<template>
  <div class="app-header">
    <img src="../assets/images/logo-cosmos.png">
    <nav>
      <router-link to="/" exact>Wallets</router-link>
      <router-link to="/transactions">Transactions</router-link>
      <router-link to="/send">Send</router-link>
      <router-link to="/receive">Receive</router-link>
      <router-link to="/exchange">Exchange</router-link>
      <router-link to="/console">Console</router-link>
    </nav>
    <!--
    <menu>
      <btn value="Btn"></btn>
    </menu>
    -->
  </div>
</template>

<script>
import Btn from '@nylira/vue-button'
export default {
  components: {
    Btn
  },
  methods: {
    go (route) {
      this.$router.push(route)
    }
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.app-header
  border-bottom 1px solid bc
  background c-app-bg
  display flex
  align-items center
  img
    height .875rem
    padding 0 1rem
  nav
    flex 1
    height 2.25rem
    display flex
    a
      border-bottom 1px solid bc
      border-left 1px solid bc
      margin-bottom -1px
      display flex
      align-items center
      padding 0 1em
      font-size 0.875rem
      font-weight 400
      color dim
      &:hover
        background darken(c-app-bg, 3%)
      &.router-link-active
        color txt
        background c-app-fg
        border-bottom-color c-app-fg
  menu
    display flex
    align-items center
    .ni-btn-wrapper
      margin-right 0.5rem
      width 7rem
</style>
