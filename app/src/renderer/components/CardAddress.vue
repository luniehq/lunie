<template>
  <ul class="card-address">
    <li class="address">
      <span>{{ address.address.toString('hex') }}</span>
    </li>
    <li class="walletId">
      <span>{{ address.walletId.toUpperCase() }}</span>
    </li>
  </ul>
</template>

<script>
export default {
  props: ['address']
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

ul.card-address
  padding 0.25em 0.5em
  background c-app-fg

  display flex

  border-left 1px solid bc
  border-right 1px solid bc
  border-bottom 1px dotted bc
  li
    flex 1
    display flex
    &.address
      font-weight 500
      margin-right 2rem
      span
        mono()
    &.walletId
      font-weight 500
      margin-right 0.5rem
      span
        color light
        mono()

ul.card-address:first-of-type
  border-top 1px solid bc
ul.card-address:last-of-type
  border-bottom 1px solid bc
</style>
