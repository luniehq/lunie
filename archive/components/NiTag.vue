<template lang="pug">
.tm-tag(:class="cssClass") {{ value }}
</template>

<script>
export default {
  name: "tm-tag",
  computed: {
    cssClass() {
      let value = "tm-tag"
      if (this.size === "lg") {
        value += " tm-tag-lg"
      } else if (this.size === "sm") {
        value += " tm-tag-sm"
      } else {
        value += " tm-tag-df"
      }
      return value
    }
  },
  props: ["value", "size"]
}
</script>

<style lang="stylus">
@require '~variables'

.tm-tag
  background app-fg
  color dim

  &:empty
    display none

  &.tm-tag-df
    padding 0 0.5rem
    line-height 2rem

  &.tm-tag-sm
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
