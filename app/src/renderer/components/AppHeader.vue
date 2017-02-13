<template>
  <div class="app-header">
    <nav>
      <router-link to="/" exact>Wallet</router-link>
      <router-link to="/transactions">Transactions</router-link>
      <router-link to="/send">Send</router-link>
      <router-link to="/receive">Receive</router-link>
    </nav>
  </div>
</template>

<style lang="stylus">
@require '../styles/variables.styl'

.app-header
  border-bottom 1px solid bc
  position absolute
  top 0
  left 0
  width 100vw
  background c-app-bg
  nav
    height 3rem
    display flex
    a
      border-bottom 1px solid bc
      border-right 1px solid bc
      margin-bottom -1px
      display flex
      align-items center
      padding 0 1em
      font-weight 400
      color dim
      &.router-link-active
        color txt
        background c-app-fg
        border-bottom-color c-app-fg
</style>
