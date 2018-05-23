<template>
  <div class="ni-field-group">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ni-field-group'
}
</script>

<style lang="stylus">
@import '~@/styles/variables.styl'

.ni-field-group
  display flex
  position relative

  .ni-field
    flex 1

  .ni-field, .ni-btn-wrapper
    margin 0

  .ni-btn-wrapper
    max-width 15rem

  .ni-field + .ni-btn-wrapper
    margin-left 1rem

  .ni-btn-wrapper + .ni-field
    margin-left 1rem
</style>
