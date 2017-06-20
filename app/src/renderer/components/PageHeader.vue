<template>
  <div class="page-header">
    <div class="page-header-container">
      <h1 class="title"><slot name="title"></slot></h1>
      <menu>
        <slot></slot>
      </menu>
    </div>
  </div>
</template>

<script>
export default {
  name: 'page-header'
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.page-header
  display flex
  flex-flow column nowrap

.page-header-container
  padding 1rem 0 1rem - px
  height 5rem
  flex 1
  display flex
  align-items center
  border-bottom 1px solid bc-dim

  h1.title
    flex 1
    font-size 1.25rem
    line-height 1
    em
      font-weight normal
      font-style normal

  menu
    display none
    .ni-btn, .ni-field, p
      margin-left 1rem
    p
      font-label()

@media screen and (min-width: 480px)
  .page-header-container
    padding 1.5rem 0
    menu
      display flex
</style>
