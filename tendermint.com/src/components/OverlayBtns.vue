<template>
  <div class="overlay-btns">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "overlay-btns"
}
</script>

<style lang="stylus">
@import '../styles/variables.styl'

.overlay-btns
  display none

@media screen and (max-width: 1023px)
  .overlay-btns
    height auto

    position fixed
    bottom 0.5em
    right 0.5em
    z-index 101

    display flex
    flex-flow column nowrap

    > div
      margin-top 0.5em
</style>
