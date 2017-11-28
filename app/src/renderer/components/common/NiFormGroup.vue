<template lang='pug'>
div(:class='cssClass')
  label(:for='fieldId' v-if="fieldId && fieldLabel") {{ fieldLabel }}
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
@import '~variables'

.ni-form-group
  padding 1rem 1rem 1rem - px
  border-bottom px solid bc

  input
    width 100%

  label
    display block
    line-height 2rem
    color txt

  .ni-form-msg-error
    display none

  &.form-group-error
    .ni-field, .ni-select
      border-color danger
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
