<template lang="pug">
.article-body: slot
</template>

<script>
export default {
  name: 'article-body'
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.article-body
  margin 1rem 0
  border 2px solid bc-dim
  border-radius 0.25rem
  padding 1rem - 2*px
  p
    margin-bottom 1rem
    &:last-child
      margin-bottom 0
</style>

