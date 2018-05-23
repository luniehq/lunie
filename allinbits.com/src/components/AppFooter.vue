<template >
  <div class="footer">
    &copy; {{ new Date().getFullYear() }} All In Bits, Inc.
  </div>
</template>

<script>
export default {
  name: 'app-footer'
}
</script>

<style scoped lang="stylus">
@require '~variables'

.footer
  height 3rem
  border-top 1px solid bc
  line-height 3rem
  text-align center
</style>
