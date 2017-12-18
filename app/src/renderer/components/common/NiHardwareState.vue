<template lang='pug'>
.ni-hardware-state
  i.ni-hardware-state__icon.material-icons(:class="iconClass") {{ icon }}
  .ni-hardware-state__label {{ value }}
</template>

<script>
export default {
  computed: {
    iconClass () {
      if (this.spin) { return 'fa-spin' }
    }
  },
  props: ['icon', 'value', 'spin']
}
</script>

<style lang="stylus">
@require '~variables'

.ni-hardware-state
  background app-fg
  display flex
  flex-flow column nowrap
  align-items center
  justify-content center
  margin 1.5rem auto

  height 15rem
  width 15rem
  padding 1.5rem

  user-select none

.ni-hardware-state__icon
  font-size 5rem
  margin-bottom 1rem
  color dim

.ni-hardware-state__label
  text-align center
  color bright
</style>
