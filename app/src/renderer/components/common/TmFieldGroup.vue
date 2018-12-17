<template lang="pug">
.tm-field-group: slot
</template>

<script>
export default { name: "tm-field-group" }
</script>

<style lang="stylus">
@import '~variables'

.tm-field-group
  display flex
  position relative

  .tm-field
    flex 1

  .tm-field, .tm-btn-wrapper
    margin 0

  .tm-btn-wrapper
    max-width 15rem

  .tm-field + .tm-btn-wrapper
    margin-left 1rem

  .tm-btn-wrapper + .tm-field
    margin-left 1rem
</style>
