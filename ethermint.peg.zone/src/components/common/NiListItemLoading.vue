<template lang="pug">
.li-loading
  .ni-votes
  .text
    .title ████████████████████
      span.tag █████
      span.tag █████
    .meta ██████████
</template>

<script>
export default {
  name: 'li-loading'
}
</script>

<style lang="stylus">
@require '~@/styles/variables.styl'

.li-loading
  border-bottom 1px solid bc
  padding 0.75rem 1rem 0.75rem - px
  display flex
  position relative
  max-height 5rem

  color txt
  user-select none

  .ni-votes
    background app-fg
    margin-right 1rem
    width 2rem
    margin 0.25rem 1rem 0 0
    height 3rem

  .text
    flex 1
    display flex
    flex-flow column nowrap
    word-break break-all
    text-overflow hidden

  .title
    flex 1
    color darken(txt, 50%)
    margin-bottom 0.5rem

    .tag
      font-size sm
      line-height 1rem - 2*px
      display inline-block
      padding 0 0.25rem
      margin-left 0.25rem
      vertical-align middle
      color bc

  .meta
    display flex
    font-size sm
    color darken(dim, 50%)
    a.author 
      padding-left 0.33rem
</style>
