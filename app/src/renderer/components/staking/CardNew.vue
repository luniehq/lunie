<template>
  <div class="new-bar">
    <div class="label">
      <i v-if="icon" :class="iconClass"></i>
      {{ value }}
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    iconClass () {
      return `fa fa-${this.icon}`
    }
  },
  props: ['icon', 'value']
}
</script>

<style lang="stylus">
@require '../../styles/variables.styl'

.new-bar
  font-size 0.75rem

  border 0.125em dashed bc
  margin 0.25em
  height 3em
  padding 0 0.5em
  display flex
  align-items center
  justify-content center

  cursor pointer

  &:hover
    background lighten(link, 90%)

  .label
    color light
    font-weight 500
    i.fa
      margin-right 0.25em
      color light

@media screen and (min-width: 400px)
  .new-bar
    font-size 0.875rem

@media screen and (min-width: 640px)
  .new-bar
    font-size 1rem
</style>
