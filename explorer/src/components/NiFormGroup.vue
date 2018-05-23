<template>
  <div :class="cssClass">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ni-form-group',
  computed: {
    cssClass () {
      let value = 'ni-form-group'
      if (this.error) value += ' form-group-error'
      return value
    }
  },
  props: ['error']
}
</script>

<style lang="stylus">
@import '../styles/variables.styl'

.ni-form-group
  padding 1rem 1rem 1rem - px
  border-bottom 1px solid bc-dim

  input
    width 100%

  label
    display block
    font-label()
    line-height 2rem
    color dim

  .ni-form-msg-error
    display none

  &.form-group-error
    .ni-field
      border-color #f00
    .ni-form-msg-error
      display flex
</style>
