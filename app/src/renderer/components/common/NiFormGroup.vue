<template lang='pug'>
div(:class='cssClass')
  span.ni-form-group__sub-label(v-if="subLabel")
    | {{ subLabel }}
  label.ni-form-group__label(:for='fieldId' v-if="fieldId && fieldLabel")
    | {{ fieldLabel }}
  .ni-form-group__field: slot
</template>

<script>
export default {
  name: 'ni-form-group',
  computed: {
    cssClass () {
      let value = 'ni-form-group'
      if (this.error) value += ' ni-form-group--error'
      return value
    }
  },
  props: ['error', 'field-id', 'field-label', 'sub-label']
}
</script>

<style lang="stylus">
@import '~variables'
.ni-form-group
  padding 0.5rem 1rem
  position relative

  &:last-child
    border-bottom none

  input
    width 100%

  .ni-form-msg--error
    display none

  &__sub-label
    position absolute
    bottom 0.5rem
    left 1rem
    font-size xs
    color var(--dim)

.ni-form-group__sub-label ~ .ni-form-group__label
  line-height 1rem

.ni-form-group--error
  .ni-field, .ni-select
    border-color danger

  .ni-form-msg--error
    display flex

.ni-form-group__label
  display block
  line-height 2rem
  color txt

@media (min-width: 768px)
  .ni-form-group
    display flex

  .ni-form-group__label
    flex 0 0 16rem

  .ni-form-group__field
    flex 1

    > .ni-field
    > .ni-field-group
      width 100%
</style>
