<template lang="pug">
.ti-tags(:class="cssClass")
  tag(v-for="i in values" v-if="i" :key="i" :value="i" :size="size")
</template>

<script>
import Tag from "./NiTag"
export default {
  name: "ti-tags",
  components: {
    Tag
  },
  computed: {
    cssClass() {
      let value = "ti-tags"
      if (this.size === "lg") {
        value += " ti-tags-lg"
      } else if (this.size === "sm") {
        value += " ti-tags-sm"
      } else {
        value += " ti-tags-df "
      }
      return value
    }
  },
  props: ["values", "size"]
}
</script>

<style lang="stylus">
@require '~variables'

.ti-tags
  &.ti-tags-df
    padding 0.5rem 1rem
    border-bottom px solid bc
    display flex
    flex-flow row wrap

    .ti-tag
      margin-right 0.5rem

  &.ti-tags-sm
    display block

    .ti-tag
      display inline-block
      margin-right 0.5rem

      &:last-child
        margin-right 0
</style>
