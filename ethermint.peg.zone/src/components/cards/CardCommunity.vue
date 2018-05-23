<template lang="pug">
a.card-community(:href='anchor' target='_blank')
  .icon: i.fa(:class="'fa-' + icon")
  .text
    .dt {{ dt }}
    .dd {{ dd }}
</template>

<script>
export default {
  name: 'card-community',
  props: ['anchor', 'dt', 'dd', 'icon']
}
</script>

<style lang="stylus">
@require '~variables'

.card-community
  flex 1
  display flex
  background app-fg
  margin-top 0.25rem
  margin-bottom 0.25rem

  .icon
    flex 0 0 4rem
    display flex
    align-items center
    justify-content center

    i.fa
      color link
      font-size xl

  .text
    padding 0.75rem
    padding-left 0
    .dt
      color txt
      font-weight 500
    .dd
      color dim

  &:hover
    background hover-bg
    .icon i
      color hover

    .text .dt
      color bright

@media screen and (min-width: 768px)
  .card-community
    .icon
      flex 0 0 4rem

    .text
      padding 1rem
      padding-left 0
</style>
