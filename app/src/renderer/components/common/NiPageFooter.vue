<template lang='pug'>
footer.ni-page-footer
  .container
    slot
</template>

<script>
export default {
  name: 'ni-page-footer'
}
</script>

<style lang="stylus">
@require '~@/styles/variables.styl'

.ni-page-footer
  .container
    border-top 1px solid bc-dim
    height 3rem
    display flex
    align-items center

    padding 0 1rem
    &:empty
      display none
</style>
