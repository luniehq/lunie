<template lang="pug">
.toc-page
  slot(name='locale')
  slot(name='nav')
  toc-padding(v-bind:class="{ 'toc-visible': tocVisible }")
    text-container: slot
</template>

<script>
import TocPadding from "navigation/TocPadding"
import TextContainer from "common/NiTextContainer"
export default {
  name: "toc-page",
  components: {
    TextContainer,
    TocPadding
  },
  props: ["tocVisible"]
}
</script>

<style lang="stylus">
@import '~variables'

.minimal-toc
  z-index z(toolBar)
  font-family sans

  // scrollbar
  width 100vw
  height 100vh
  position fixed

  // for titlebar
  padding-top 3rem

  &:before
    content 'Table of Contents'
    line-height 2.5rem
    color dim
    text-transform uppercase
    display block
    padding 0 1rem
    font-size sm
    font-weight bold

  > ul
    padding 0.625rem 0
    padding-bottom 1.5rem
    margin 0
    > li > a
      font-weight 500
      color txt

  ul
    li
      list-style none
      margin-bottom 0
      a
        display block
        padding 0.375rem 1rem
        line-height 1.25rem
        &:hover
          color bright
          text-decoration none
          background hover
    ul
      padding 0
      a
        padding-left 2.5rem
        color txt
      ul
        a
          padding-left 4rem
          color dim

@media screen and (min-width: 768px)
  .minimal-toc
    padding 3rem

@media screen and (max-width: 1023px)
  .minimal-toc
    background app-bg
    top 0
    left 0
    &:before
      background app-fg

@media screen and (min-width: 1024px)
  .minimal-toc
    z-index 99
    top 3rem
    left 0
    bottom 0
    max-height 100vh
    width width-side
    padding 0.5rem 0 0
    border-right 1px solid bc

@media screen and (min-width: 1280px)
  .minimal-toc ul
    margin-left 0 !important
</style>
