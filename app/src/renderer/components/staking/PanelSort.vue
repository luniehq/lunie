<template lang="pug">
tr.panel-sort-container
  th.sort-by(
    v-for="(property, i) in properties",
    :class="property.class")
      a(v-tooltip.top="property.tooltip", @click="orderBy(property.value, $event)") {{ property.title }}
</template>

<script>
export default {
  name: `panel-sort`,
  methods: {
    orderBy(property) {
      let sortBys = this.$el.querySelectorAll(`.sort-by`)
      sortBys.forEach(el => el.classList.remove(`active`, `desc`, `asc`))
      let index = this.properties.findIndex(p => p.value === property)
      let el = sortBys[index]

      if (this.sort.property === property) {
        if (this.sort.order === `asc`) {
          this.sort.order = `desc`
        } else {
          this.sort.order = `asc`
        }
      } else {
        this.sort.property = property
      }
      if (this.sort.order === `asc`) {
        el.classList.add(`asc`)
      } else {
        el.classList.add(`desc`)
      }
      el.classList.add(`active`)
    }
  },
  props: [`sort`, `properties`]
}
</script>

<style lang="stylus">
@require '~variables'

.panel-sort-container
  padding 1rem

.sort-by
  font-size sm

  a
    cursor pointer
    user-select none

  &:after
    content '\f0d8'
    color var(--link)
    display inline-block
    font-family FontAwesome
    padding-left 4px

  &.asc:after
    color var(--tertiary)

  &.desc:after
    content '\f0d7'
    color var(--tertiary)

</style>
