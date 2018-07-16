<template lang="pug">
.tm-cards: slot
</template>

<script>
export default {
  name: "tm-cards"
}
</script>

<style lang="stylus">
@import '~variables'

.tm-cards
  display flex
  flex-flow column nowrap
  padding 0.125rem
  margin 0 -0.25rem

@media screen and (min-width: 768px)
  .tm-cards
    flex-flow row wrap
</style>
