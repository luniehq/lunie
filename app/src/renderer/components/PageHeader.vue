<template>
  <div class="page-header">
    <h1 class="title">{{ title }}</h1>
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
  border-bottom 1px solid bc
  background c-app-fg
  h1.title
    font-size 1.5rem
    font-weight 500
    padding 1em
    margin 0
    line-height 1
</style>
