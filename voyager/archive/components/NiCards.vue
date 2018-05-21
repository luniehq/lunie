<template lang="pug">
.ni-cards: slot
</template>

<script>
export default {
  name: "ni-cards"
}
</script>

<style lang="stylus">
@import '~variables'

.ni-cards
  display flex
  flex-flow column nowrap
  padding 0.125rem
  margin 0 -0.25rem

@media screen and (min-width: 768px)
  .ni-cards
    flex-flow row wrap
</style>
