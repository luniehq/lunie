<template>
  <footer class="app-footer">
    <div class="container">
      <div class="copyright">&copy; 2018 Interchain Foundation</div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'app-footer'
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.app-footer
  .container
    border-top 1px solid bc-dim
    height 3rem
    display flex
    align-items center

    padding 0 1rem

    .copyright
      font-label()
      color dim
</style>
