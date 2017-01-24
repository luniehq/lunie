<template>
  <div class="card-account">
    <div class="card-account-container">
      <header>Balance <span>{{ accountKey.toUpperCase() }}</span></header>
      <div class="content">
        <ul>
          <li v-for="coin in accountValue.coins">
            <div class="key">{{ coin.denom.toUpperCase() }}</div>
            <div class="value">{{ coin.amount }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    capitalize (string) {
      return string.toUpperCase()
    }
  },
  props: ['accountKey', 'accountValue']
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.card-account
  padding 0.25rem

  .card-account-container
    border 1px solid bc
    background c-app-fg
    header
      border-bottom 1px solid bc
      padding 0.25em 0.5em
      font-weight bold
      span
        font-weight 400
        color light

    .content
      background lighten(c-app-bg,50%)
      ul
        li
          border-bottom 1px dotted bc
          padding .25em 0.5em
          display flex
          &:last-of-type
            border-bottom none

          .key, .value
            display inline-block

          .key
            color light
            flex 1
</style>
