<template lang="pug">
div(:class='cssClass')
  span.tm-form-group__sub-label(v-if="subLabel")
    | {{ subLabel }}
  label.tm-form-group__label(:for='fieldId' v-if="fieldId && fieldLabel")
    | {{ fieldLabel }}
  .tm-form-group__field: slot
</template>

<script>
export default {
  name: "tm-form-group",
  computed: {
    cssClass() {
      let value = "tm-form-group"
      if (this.error) value += " tm-form-group--error"
      return value
    }
  },
  props: ["error", "field-id", "field-label", "sub-label"]
}
</script>

<style lang="stylus">
@import '~variables'
.tm-form-group
  padding 0.5rem 1rem
  position relative

  &:last-child
    border-bottom none

  input
    width 100%

  .tm-form-msg--error
    display none

  &__sub-label
    position absolute
    bottom 0.5rem
    left 1rem
    font-size xs
    color var(--dim)

.tm-form-group__sub-label ~ .tm-form-group__label
  line-height 1rem

.tm-form-group--error
  .tm-field, .tm-select
    border-color danger

  .tm-form-msg--error
    display flex

.tm-form-group__label
  display block
  line-height 2rem
  color var(--txt)
  text-align left

@media (min-width: 768px)
  .tm-form-group
    display flex

  .tm-form-group__label
    flex 0 0 16rem

  .tm-form-group__field
    flex 1

    > .tm-field
    > .tm-field-group
      width 100%
</style>
