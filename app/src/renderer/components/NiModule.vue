<template>
  <div :class="cssClass">
    <div class="ni-module-container">
      <slot name="overlay"></slot>
      <header class="ni-module-header">
        <div class="ni-module-title"><slot name="title"></slot></div>
        <div class="ni-module-menu"><slot name="menu"></slot></div>
      </header>
      <main class="ni-module-main">
        <slot></slot>
      </main>
      <footer class="ni-module-footer">
        <slot name="footer"></slot>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    cssClass () {
      let base = 'ni-module'
      if (this.size) base += ' ni-module-' + this.size
      return base
    }
  },
  props: ['size']
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.ni-module
  display flex
  margin-bottom 1rem

.ni-module-container
  flex 1
  position relative

.ni-module-header
  display flex
  align-items center
  border-bottom 1px solid bc
  height 2rem
  margin-bottom 1rem
  position relative
  &:before, &:after
    dot()
  &:before
    left -1*px
  &:after
    right -1*px

.ni-module-footer
  > div
    display flex
    justify-content center
    align-items center

    padding 0 1rem
    border-top 1px solid bc
    height 2rem
    font-size 0.75rem
    color dim

.ni-module-title
  flex 1
  font-label()
  color bright

.ni-module-menu
  display flex
  padding 0 0.5rem

  .pb-label
    color dim
  a
    font-size 0.75rem
    padding 0 0.25rem
    cursor pointer

.ni-module-main
  flex 1
</style>
