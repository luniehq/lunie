<template>
  <ul class="card-transaction">
    <li>2017-01-19</li>
    <li>ETH</li>
    <li>+ {{ amount }}</li>
  </ul>
</template>

<script>
export default {
  data () {
    return {
      amount: Math.floor(Math.random() * 1000000) / 1000
    }
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

ul.card-transaction
  padding 0.25em 0.5em
  background c-app-fg

  display flex

  border-left 1px solid bc
  border-right 1px solid bc
  border-bottom 1px dotted bc
  li
    flex 1

ul.card-transaction:first-of-type
  border-top 1px solid bc
ul.card-transaction:last-of-type
  border-bottom 1px solid bc
</style>
