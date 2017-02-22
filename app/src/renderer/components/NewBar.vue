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
@require '../styles/variables.styl'

.new-bar
  border 0.125rem dashed bc
  margin 0.25rem
  height 3rem
  padding 0 0.5rem
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
      margin-right 0.25rem
      color light
</style>
