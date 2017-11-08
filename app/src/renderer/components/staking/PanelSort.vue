<template lang="pug">
.panel-sort
  .panel-sort-container: .sort-by(
    v-for="property in sort.properties",
    @click="orderBy(property.value, $event)",
    :class="{ 'active': property.initial, 'asc': property.initial }")
    .label {{ property.title }}
</template>

<script>
// TODO do we need jquery for one usage?
import $ from 'jquery'
export default {
  name: 'panel-sort',
  methods: {
    orderBy (property, event) {
      let sortBys = $(this.$el).find('.sort-by')
      console.log(sortBys)
      $(sortBys).removeClass('active desc asc')
      let el = $(event.target).parent()
      console.log('el', el)

      if (this.sort.property === property) {
        if (this.sort.order === 'asc') {
          this.sort.order = 'desc'
        } else {
          this.sort.order = 'asc'
        }
      } else {
        this.sort.property = property
      }
      if (this.sort.order === 'asc') {
        $(el).addClass('asc')
      } else {
        $(el).addClass('desc')
      }
      $(el).addClass('active')
    }
  },
  props: ['sort']
}
</script>

<style lang="stylus">
@require '~@/styles/variables.styl'

.panel-sort-container
  display flex
  height 2rem
  border-bottom 1px solid bc-dim
  padding 0 0.75rem

.sort-by
  flex 1
  cursor pointer
  user-select none

  display flex
  align-items center

  position relative
  padding 0 0.25rem

  min-width 0

  .label
    font-size 0.75rem
    color dim
    padding-right 0.5rem

    white-space nowrap
    text-overflow ellipsis
    overflow hidden

  &:after
    display block
    font-family FontAwesome
    color dim
  &.asc:after
    content '\f0d8'
  &.desc:after
    content '\f0d7'

  &:not(.active):hover
    .label
      color txt

  &.active
    .label
      color bright
    &:after
      color txt
</style>
