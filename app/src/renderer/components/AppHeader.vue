<template>
  <div class="app-header">
    <img src="../assets/images/logo-cosmos.png">
    <nav>
      <router-link to="/" exact>
        <i class="fa fa-envelope-o"></i>
        Wallets
      </router-link>
      <router-link to="/transactions">
        <i class="fa fa-list-ul"></i>
        Transactions
      </router-link>
      <router-link to="/receive">
        <i class="fa fa-sign-in"></i>
        Receive
      </router-link>
      <router-link to="/send">
        <i class="fa fa-sign-out"></i>
        Send
      </router-link>
      <router-link to="/exchange">
        <i class="fa fa-exchange"></i>
        Exchange
      </router-link>
      <router-link to="/console">
        <i class="fa fa-terminal"></i>
        Console
      </router-link>
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
      align-items center
      justify-content center
      display flex

      padding 0 1em

      border-bottom 1px solid bc
      border-left 1px solid bc
      margin-bottom -1px
      font-size 0.875rem
      font-weight 400
      color txt
      &:hover
        background darken(c-app-bg, 3%)
      &.router-link-active
        color txt
        background c-app-fg
        border-bottom-color c-app-fg
      i.fa
        display block
        margin-right 0.375rem
        color light
        display none
  menu
    display flex
    align-items center
    .ni-btn-wrapper
      margin-right 0.5rem
</style>
