<template>
  <div class="page-header">
    <h1 class="title">{{ title }}</h1>
    <menu>
      <slot></slot>
    </menu>
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
  flex 0 0 4rem
  height 4rem

  border-bottom 1px solid bc
  display flex
  align-items center

  h1.title
    flex 1
    font-size 1.25rem
    line-height 1
    text-transform uppercase
  menu
    display none
    .ni-btn
      margin-left 1rem

@media screen and (min-width: 480px)
  .page-header
    menu
      display block
</style>
