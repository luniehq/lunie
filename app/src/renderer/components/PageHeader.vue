<template>
  <div class="page-header">
    <div class="page-header-container">
      <h1 class="title"><slot name="title">{{ title }}</slot></h1>
      <menu>
        <slot></slot>
      </menu>
    </div>
    <border color="dim"></border>
  </div>
</template>

<script>
import Border from './NiBorder'
export default {
  name: 'page-header',
  components: {
    Border
  },
  props: ['title']
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.page-header
  display flex
  flex-flow column nowrap

.page-header-container
  padding 1rem 0
  flex 1
  display flex
  align-items center

  h1.title
    flex 1
    color dim
    font-weight bold
    font-size 1.25rem
    line-height 1
    text-transform uppercase

  menu
    display none
    .ni-btn, .ni-field
      margin-left 1rem

@media screen and (min-width: 480px)
  .page-header-container
    padding 1.5rem 0
    menu
      display flex
</style>
