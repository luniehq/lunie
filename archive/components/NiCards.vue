<template lang="pug">
.ti-cards: slot
</template>

<script>
export default {
  name: "ti-cards"
}
</script>

<style lang="stylus">
@import '~variables'

.ti-cards
  display flex
  flex-flow column nowrap
  padding 0.125rem
  margin 0 -0.25rem

@media screen and (min-width: 768px)
  .ti-cards
    flex-flow row wrap
</style>
