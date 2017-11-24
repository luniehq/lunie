<template lang='pug'>
.ni-field-addon: slot
</template>

<script>
export default {
  name: 'ni-field-addon'
}
</script>

<style lang="stylus">
@import '~@/styles/variables.styl'

.ni-field-addon + .ni-field-addon
.ni-field + .ni-field-addon
.ni-field-addon + .ni-field
  margin-left -1px
  position relative
  z-index 1

.ni-field-addon
  background app-bg
  border 1px solid bc
  display flex
  align-items center
  justify-content center
  height 2rem
  min-width 2rem
  padding 0 0.5rem

.ni-field-addon + .ni-btn
  margin-left 1rem

@media screen and (min-width: 768px)
  .ni-field-addon
    padding 0 0.75rem
</style>
