<template lang='pug'>
div(:class='cssClass')
  label(:for='fieldId') {{ fieldLabel }}
  .ni-form-group-field: slot
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
  props: ['error', 'field-id', 'field-label']
}
</script>

<style lang="stylus">
@import '~@/styles/variables.styl'

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

@media (min-width: 768px)
  .ni-form-group
    display flex
    label
      flex 0 0 16rem
    .ni-form-group-field
      flex 1

  .ni-form-group-field
    > .ni-field
    > .ni-field-group
      width 100%
</style>
