<template>
  <div :class="cssClass"></div>
</template>

<script>
export default {
  name: 'ni-border',
  props: ['color'],
  computed: {
    cssClass () {
      let value = 'ni-border'
      if (this.color) value += ` ni-border-color-${this.color}`
      return value
    }
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.ni-border
  width 100%
  height px
  background bc
  position relative

  &:before
  &:after
    content ''
    width 3px
    height 3px
    position absolute
    display block
    top -1*px
    border-radius 2px

    background bc-bright
    box-shadow hsla(0,0,0,0.5) 0 0 0 1px
  &:before
    left -1*px
  &:after
    right -1*px

  &.ni-border-color-bright
    background bc-bright
    &:before
    &:after
      background bright

  &.ni-border-color-dim
    background bc-dim
    &:before
    &:after
      background bc

  &.ni-border-color-faint
    background bc-faint
    &:before
    &:after
      background bc-dim
</style>
