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
@import '../styles/variables.styl'

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

  .ni-field-addon + .ni-field-addon
  .ni-field + .ni-field-addon
  .ni-field-addon + .ni-field
    margin-left -1px
    position relative
    z-index 1

  .ni-field-addon
    background c-app-bg
    border 1px solid bc
    display flex
    align-items center
    justify-content center
    height 2rem
    min-width 2rem
    padding 0 0.5rem

    font-label()

  .ni-field-addon + .ni-btn
    margin-left 1rem

@media screen and (min-width: 768px)
  .ni-field-group
    .ni-field-addon
      font-size 1rem
      padding 0 0.75rem
</style>
