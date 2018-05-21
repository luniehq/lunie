<template lang="pug">
.page-presentations-footer
  router-link.index(:to="'/presentations'") &laquo; All Presentations
  .share
    a(:href='facebookUrl', target='_blank')
      i.fab.fa-facebook
    a(:href='twitterUrl', target='_blank')
      i.fab.fa-twitter
</template>

<script>
export default {
  props: ["facebook-url", "twitter-url"]
}
</script>

<style lang="stylus">
@import '~variables'

.page-presentations-footer
  border-top 4px solid var(--bc)
  display flex
  margin-top 3rem
  padding 1.5rem 0

  .index
    display flex
    align-items center
    line-height 3rem
    height 3rem
    color var(--txt)
    &:hover
      color var(--link)
      text-decoration none
    i
      font-size 1.5rem
      width 1.5rem
      text-align center

  .share
    flex 1
    display flex
    justify-content flex-end

    a
      height 3rem
      padding 0.5rem

      i
        font-size 1.5rem
        color var(--light)

      &:hover i
        color var(--link)
</style>
