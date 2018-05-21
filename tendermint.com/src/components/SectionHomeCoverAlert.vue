<template lang="pug">
a.cover-alert(:href='links.cosmos.website' target='_blank')
  | All of us at Tendermint are preparing the Cosmos Network for release. #[strong View project &raquo;]
</template>

<script>
import { mapGetters } from "vuex"
export default {
  computed: {
    ...mapGetters(["config", "links"])
  }
}
</script>

<style lang="stylus">
@require '~variables'

.cover-alert
  display block
  border-top 1px solid var(--bc)
  padding 0.4375rem 0.5rem
  margin-bottom 2rem
  font-size 0.75rem
  position relative
  color var(--txt)

  &:before
    content ''
    height 2*px
    width 4rem
    background var(--txt)
    display block
    position absolute
    top -2px
    left 0

  strong
    color var(--link)

  &:hover
    color var(--txt)
    strong
      text-decoration underline


@media screen and (min-width:360px)
  .cover-alert
    font-size 0.875rem
    margin-bottom 2.5rem
@media screen and (min-width:400px)
  .cover-alert
    font-size 1rem
@media screen and (min-width:1200px)
  .cover-alert
    margin-bottom 3rem
</style>
