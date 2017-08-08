<template lang="pug">
.panel-sort
  .panel-sort-container: .sort-by(
    v-for="property in sort.properties",
    @click="orderBy(property.value, $event)",
    :class="{ 'active': property.initial, 'asc': property.initial }")
    .label {{ property.title }}
</template>

<script>
import $ from 'jquery'
export default {
  name: 'panel-sort',
  methods: {
    orderBy (property, event) {
      let sortBys = $(this.$el).children('.sort-by')
      $(sortBys).removeClass('active desc asc')
      let el = $(event.target).parent()

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
@require '../../styles/variables.styl'

.panel-sort-container
  display flex
  height 2rem
  border-bottom 1px solid bc-dim

.sort-by
  flex 1
  cursor pointer
  user-select none

  display flex
  align-items center

  position relative

  .label
    font-label()
    color dim
    padding-right 0.5rem

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
