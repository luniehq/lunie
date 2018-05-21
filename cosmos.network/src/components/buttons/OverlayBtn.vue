<template lang="pug">
.overlay-btn
  i.material-icons {{ icon }}
</template>

<script>
export default {
  name: "overlay-btn",
  props: ["icon"]
}
</script>

<style lang="stylus">
@import '~variables'

.overlay-btn
  width 2.5em
  height 2.5em
  line-height 2.5em
  border-radius 1.25em

  text-align center
  color txt

  background app-fg
  shadow()

  cursor pointer
  i
    line-height 2.5em

@media screen and (min-width: 360px)
  .overlay-btn
    width 3em
    height 3em
    line-height 3em
    border-radius 1.5em
    i
      line-height 3em
</style>
