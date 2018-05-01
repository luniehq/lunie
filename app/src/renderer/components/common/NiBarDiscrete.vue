<template lang='pug'>
.ni-bar-discrete: .ni-bar-discrete__container
  .ni-bar-discrete__edge
  .ni-bar-discrete__node(
    v-for="(node, key) in nodes"
    :key="key"
    @click="clickFn(key)"
    v-bind:class="classObject(key)")
</template>

<script>
export default {
  name: "ni-bar-discrete",
  methods: {
    classObject (key) {
      return {
        'ni-bar-discrete__node--active': key === this.active
      }
    }
  },
  props: ["nodes", "active", "click-fn"],
}
</script>

<style lang="stylus">
@require '~variables'

.ni-bar-discrete
  padding 0 3rem
  width 100%
  max-width 24rem
  margin 0 auto

.ni-bar-discrete__container
  height 2rem
  display flex
  align-items center
  justify-content space-between
  position relative

.ni-bar-discrete__edge
  position absolute
  top 50%
  left 0
  right 0
  content ''
  height 2px
  background var(--bc)

.ni-bar-discrete__node
  position relative
  z-index 2
  width 1rem
  height 1rem
  border 0.125rem solid var(--dim)
  border-radius 0.5rem
  background var(--app-bg)

  &:hover
    cursor pointer
    border-color var(--hover)

  &:before
    content ''
    position absolute
    top 0.125rem
    left 0.125rem
    width 0.5rem
    height 0.5rem
    border-radius 0.5rem
    background transparent

  &:hover:before
    background var(--hover)

  &.ni-bar-discrete__node--active
    border-color var(--mc)
  &.ni-bar-discrete__node--active:before
    background var(--mc)
</style>
