<template>
  <div class="ni-form-group">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ni-form-group'
}
</script>

<style lang="stylus">
@import '../styles/variables.styl'

.ni-form-group
  padding 0.5rem 0.5rem 0.5rem - px
  border-bottom 1px solid bc-faint

  input
    width 100%

  label
    display block
    font-label()
    color light
    line-height 2rem

  .ni-form-msg-error
    display none

  &.error
    .ni-field
      border-color #f00
    .ni-form-msg-error
      display flex
@media screen and (min-width: 480px)
  .ni-form-group
    padding 1rem 1rem 1rem - px

</style>
