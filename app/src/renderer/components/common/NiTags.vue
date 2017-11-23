<template lang="pug">
.ni-tags(:class="cssClass")
  tag(v-for="i in values" v-if="i" :key="i" :value="i" :size="size")
</template>

<script>
import Tag from './NiTag'
export default {
  name: 'ni-tags',
  components: {
    Tag
  },
  computed: {
    cssClass () {
      let value = 'ni-tags'
      if (this.size === 'lg') {
        value += ' ni-tags-lg'
      } else if (this.size === 'sm') {
        value += ' ni-tags-sm'
      } else {
        value += ' ni-tags-df '
      }
      return value
    }
  },
  props: ['values', 'size']
}
</script>

<style lang="stylus">
@require '~@/styles/variables.styl'

.ni-tags
  &.ni-tags-df
    padding 0.5rem 1rem
    border-bottom 1px solid bc
    display flex
    flex-flow row wrap

    .ni-tag
      margin-right 0.5rem

  &.ni-tags-sm
    display block
    .ni-tag
      display inline-block
      margin-right 0.5rem
      &:last-child
        margin-right 0
</style>
