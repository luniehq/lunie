<template lang="pug">
a.card-community(v-if="anchor" :href='anchor' target='_blank')
  .icon: i(:class="'fa fa-' + icon")
  .text
    .dt {{ dt }}
    .dd {{ dd }}
router-link.card-community(v-else :to='to')
  .icon: i(:class="'fa fa-' + icon")
  .text
    .dt {{ dt }}
    .dd {{ dd }}
</template>

<script>
export default {
  name: "card-community",
  props: ["anchor", "dt", "dd", "icon", "to"]
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.card-community + .card-community
  border-top none

.card-community
  display flex
  border 1px solid bc

  .icon
    flex 0 0 3rem
    display flex
    align-items center
    justify-content center

    border-right 1px solid bc
    i.fa
      font-size 1.5rem
      color link

  .text
    padding 0.5rem 0.75rem
    .dt
      font-weight 500
      color txt
    .dd
      color dim
      font-size 0.75rem

  &:hover
    background-color alpha(link, 3%)
    .text .dt
      color link

@media screen and (min-width: 768px)
  .card-community
    .icon
      flex 0 0 4rem
      i.fa
        font-size 1.75rem
    .text
      .dd
        font-size 1rem
</style>
