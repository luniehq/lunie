<template>
  <form :class="cssClass" v-on:submit.prevent.default="submit">
    <div class="ni-form-container">
      <slot name="overlay"></slot>
      <header class="ni-form-header">
        <div class="ni-form-suptitle"><slot name="suptitle"></slot></div>
        <div class="ni-form-title"><slot name="title"></slot></div>
        <div class="ni-form-subtitle"><slot name="subtitle"></slot></div>
      </header>
      <main class="ni-form-main">
        <slot></slot>
      </main>
      <footer class="ni-form-footer">
        <slot name="footer"></slot>
      </footer>
    </div>
  </form>
</template>

<script>
export default {
  name: 'ni-form',
  computed: {
    cssClass () {
      let value = 'ni-form'
      if (this.width === 'narrow') value += ' ni-form-narrow'
      return value
    }
  },
  props: ['width', 'submit']
}
</script>

<style lang="stylus">
@import '../styles/variables.styl'

.ni-form
  display flex
  margin 1rem 0
  position relative
  border 2px solid bc-dim
  border-radius 0.25rem
  background alpha(c-app-bg, 50%)

  /*
  border-bottom 1px solid bc
  &:before, &:after
    dot()
  &:after
    right -1*px
  */

.ni-form-container
  flex 1
  display flex
  flex-flow column
  position relative
  shadow()

.ni-form-main
  flex 1

.ni-form-header
  display flex
  flex-flow column nowrap
  border-bottom 1px solid bc-faint
  position relative
  padding 0.5rem - px 0.5rem 0.5rem - 2*px

.ni-form-title
  font-label()
  line-height 1rem
  color bright

.ni-form-subtitle
  color dim
  font-size 0.666rem
  line-height 1rem

.ni-form-footer
  > div
    padding 0.5rem - px 0.5rem
    display flex
    justify-content space-between
    align-items center

@media screen and (min-width: 480px)
  .ni-form-header
    padding 1rem - px 1rem 1rem - 2*px

  .ni-form-title
    line-height 1.5rem
    margin-bottom 0.5rem

  .ni-form-subtitle
    font-size 0.875rem

  .ni-form-footer > div
    padding 1rem 1rem - 2*px
</style>
