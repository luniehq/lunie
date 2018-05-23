<template>
  <router-link class="card-link" :to="link">
    <i class="material-icons">{{ icon }}</i>{{ title }}
  </router-link>
</template>

<script>
export default {
  name: "card-link",
  props: ["icon", "link", "title"]
}
</script>

<style lang="stylus">
@require '~variables'

.card-link
  width 100%
  height 3rem
  display flex
  align-items center
  padding 0 1rem
  border-bottom 1px solid var(--bc)

  position relative
  &:last-of-type
    border-bottom none

  i
    width 1rem
    display flex
    justify-content center
    margin-right 0.5rem
    &.fa-external-link
      margin 0
      position absolute
      top 0
      right 0
      color light
      height 3rem
      width 3rem
      align-items center
</style>
