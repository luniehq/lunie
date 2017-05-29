<template lang="pug">
.panel-sort(:id="id")
  .panel-sort-container: .sort-by(
    v-for="property in sort.properties",
    @click="orderBy(property.value, $event)",
    :class="{ 'active': property.initial, 'asc': property.initial }")
    .label {{ property.title }}
</template>

<script>
import $ from 'jquery'
import shortid from 'shortid'
export default {
  name: 'panel-sort',
  data: () => ({
    id: shortid.generate()
  }),
  methods: {
    orderBy (property, event) {
      let sortBys = '#' + this.id + ' .sort-by'
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
@require '../styles/variables.styl'

.panel-sort
  padding 0 0.25rem

.panel-sort-container
  display flex
  height 1.5rem

.sort-by
  flex 1
  cursor pointer
  user-select none
  padding 0 0.5rem

  display flex
  align-items center

  position relative

  border-right 1px solid bc
  &:last-of-type
    border-right-color transparent

  .label
    font-size 0.75rem
    flex 1

  &:after
    display block
    font-family FontAwesome
    color dim
  &.asc:after
    content '\f0d8'
  &.desc:after
    content '\f0d7'

  &:not(.active):hover
    background lighten(c-app-bg,50%)
    .text
      color link

  &.active
    background c-app-fg
    .text
      font-weight bold
    &:after
      color txt
</style>
