<template>
  <div class="overlay-btn">
    <i :class="cssClass"></i>
  </div>
</template>

<script>
export default {
  name: "overlay-btn",
  computed: {
    cssClass() {
      return "fa fa-" + this.icon
    }
  },
  props: ["icon"]
}
</script>

<style lang="stylus">
@import '../styles/variables.styl'

@media screen and (max-width: 1023px)
  .overlay-btn
    width 2.5em
    height 2.5em
    line-height 2.5em
    border-radius 1.25em

    text-align center
    color txt

    background alpha(c-app-fg, 90%)
    backdrop-filter blur(0.125rem)
    shadow()

    i.fa
      font-size 1rem

@media screen and (min-width: 360px)
  .overlay-btn
    width 3em
    height 3em
    line-height 3em
    border-radius 1.5em
</style>
