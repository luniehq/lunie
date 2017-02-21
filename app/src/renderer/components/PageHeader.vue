<template>
  <div class="page-header">
    <h1 class="title">{{ title }}</h1>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: ['title']
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.page-header
  flex 0 0 3.75rem

  border-bottom 1px solid bc
  background c-app-fg
  height 3.75rem
  display flex
  align-items center
  padding 0 1rem

  h1.title
    flex 1
    font-size 1.25rem
    font-weight 600
    line-height 1
  menu
    .ni-btn-wrapper
      margin-left 0.5rem
</style>
