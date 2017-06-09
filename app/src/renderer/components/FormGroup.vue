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
  border-bottom 1px solid bc-faint

  input
    width 100%

  label
    display block
    font-label()
    color light
    line-height 2rem

  .ni-form-msg-error
    display none

  &.form-group-error
    .ni-field-container
      border-color #f00
    .ni-form-msg-error
      display flex
  &:first-child
    padding-top 1rem - 2*px
@media screen and (min-width: 480px)
  .ni-form-group
    padding 1rem 1rem 1rem - px

</style>
