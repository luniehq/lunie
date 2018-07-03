<template lang='pug'>
.tm-hardware-state
  i.tm-hardware-state__icon.material-icons(:class="iconClass") {{ icon }}
  .tm-hardware-state__label {{ value }}
</template>

<script>
export default {
  computed: {
    iconClass() {
      if (this.spin) {
        return "fa-spin"
      }
    }
  },
  props: ["icon", "value", "spin"]
}
</script>

<style lang="stylus">
@require '~variables'

.tm-hardware-state
  background var(--app-fg)
  display flex
  flex-flow column nowrap
  align-items center
  justify-content center
  margin 1.5rem auto

  height 15rem
  width 15rem
  padding 1.5rem

  user-select none

.tm-hardware-state__icon
  font-size 5rem
  margin-bottom 1rem
  color var(--dim)

.tm-hardware-state__label
  text-align center
  color var(--txt)
</style>
