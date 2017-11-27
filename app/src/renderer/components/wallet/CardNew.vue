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
  name: 'card-new',
  computed: {
    iconClass () {
      return `fa fa-${this.icon}`
    }
  },
  props: ['icon', 'value']
}
</script>

<style lang="stylus">
@require '~variables'

.new-bar
  font-size sm

  border 0.125em dashed bc
  margin 0.25em
  height 3rem
  padding 0 0.5em
  display flex
  align-items center
  justify-content center

  cursor pointer

  &:hover
    background hover-bg

  .label
    color dim
    font-weight 500
    i.fa
      margin-right 0.25em
      color dim

@media screen and (min-width: 400px)
  .new-bar
    font-size x
</style>
