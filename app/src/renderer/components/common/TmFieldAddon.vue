<template lang='pug'>
.tm-field-addon: slot
</template>

<script>
export default { name: "tm-field-addon" }
</script>

<style lang="stylus">
@import '~variables'

@media screen and (min-width: 768px)
  .tm-field-addon
    padding 0 0.75rem

.tm-field-addon + .tm-field-addon, .tm-field + .tm-field-addon, .tm-field-addon + .tm-field
  margin-left -1 * px
  position relative
  z-index z(default)

.tm-field-addon
  background var(--app-bg)
  border px solid var(--bc)
  display flex
  align-items center
  justify-content center
  height 2rem
  min-width 2rem
  padding 0 0.5rem

.tm-field-addon + .tm-btn
  margin-left 1rem
</style>
