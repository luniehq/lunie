<template lang="pug">
.ti-tag(:class="cssClass") {{ value }}
</template>

<script>
export default {
  name: "ti-tag",
  computed: {
    cssClass() {
      let value = "ti-tag"
      if (this.size === "lg") {
        value += " ti-tag-lg"
      } else if (this.size === "sm") {
        value += " ti-tag-sm"
      } else {
        value += " ti-tag-df"
      }
      return value
    }
  },
  props: ["value", "size"]
}
</script>

<style lang="stylus">
@require '~variables'

.ti-tag
  background app-fg
  color dim

  &:empty
    display none

  &.ti-tag-df
    padding 0 0.5rem
    line-height 2rem

  &.ti-tag-sm
    border none
    vertical-align text-top
    font-size sm
    line-height 1.25rem
    height 1.25rem
    padding 0 0.25rem

  &.pro
    color success
    border-color success

  &.con
    color danger
    border-color danger
</style>
