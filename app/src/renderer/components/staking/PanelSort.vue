<template lang="pug">
.panel-sort: .panel-sort-container: .sort-by(
  v-for="property in sort.properties",
  @click="orderBy(property.value, $event)",
  :class="property.class")
  .label {{ property.title }}
</template>

<script>
export default {
  name: 'panel-sort',
  methods: {
    orderBy (property, event) {
      let sortBys = this.$el.querySelectorAll('.sort-by')
      sortBys.forEach(el => el.classList.remove('active', 'desc', 'asc'))
      let el = event.target.parentElement

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
        el.classList.add('asc')
      } else {
        el.classList.add('desc')
      }
      el.classList.add('active')
    }
  },
  props: ['sort']
}
</script>

<style lang="stylus">
@require '~variables'

.panel-sort-container
  display flex
  height 2rem
  border-bottom px solid bc

.sort-by
  flex 3
  cursor pointer
  user-select none
  display flex
  align-items center
  position relative
  min-width 0

  &:first-child
    flex 0.5 1 0%;

  .label
    font-size sm
    color dim

    white-space nowrap
    text-overflow ellipsis
    overflow hidden

  &:after
    display block
    font-family FontAwesome
    color dim
    padding-left 0.25rem

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

  &.name
    flex 2

  &.id
    flex 2

  &.percent_of_vote,
  &.number_of_votes,
  &.bonded_by_you
    flex 1

@media screen and (max-width: 768px)
  .sort-by
    &.id
      display none
</style>
