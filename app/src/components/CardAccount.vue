<template>
  <div class="card-account">
    <div class="card-account-container">
      <header>Balance 1</header>
      <div class="content">
        <ul>
          <li>
            <div class="key">BTC</div>
            <div class="value">{{ amount1 }}</div>
          </li>
          <li>
            <div class="key">ETH</div>
            <div class="value">{{ amount2 }}</div>
          </li>
          <li>
            <div class="key">ATOM</div>
            <div class="value">{{ amount3 }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      amount1: Math.floor(Math.random() * 1000000) / 1000,
      amount2: Math.floor(Math.random() * 1000000) / 1000,
      amount3: Math.floor(Math.random() * 1000000) / 1000
    }
  }
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
