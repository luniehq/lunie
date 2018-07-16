<template lang="pug">
.tm-tags(:class="cssClass")
  tag(v-for="i in values" v-if="i" :key="i" :value="i" :size="size")
</template>

<script>
import Tag from "./NiTag"
export default {
  name: "tm-tags",
  components: {
    Tag
  },
  computed: {
    cssClass() {
      let value = "tm-tags"
      if (this.size === "lg") {
        value += " tm-tags-lg"
      } else if (this.size === "sm") {
        value += " tm-tags-sm"
      } else {
        value += " tm-tags-df "
      }
      return value
    }
  },
  props: ["values", "size"]
}
</script>

<style lang="stylus">
@require '~variables'

.tm-tags
  &.tm-tags-df
    padding 0.5rem 1rem
    border-bottom px solid bc
    display flex
    flex-flow row wrap

    .tm-tag
      margin-right 0.5rem

  &.tm-tags-sm
    display block

    .tm-tag
      display inline-block
      margin-right 0.5rem

      &:last-child
        margin-right 0
</style>
