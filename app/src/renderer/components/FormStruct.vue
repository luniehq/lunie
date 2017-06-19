<template>
  <form :class="cssClass" v-on:submit.prevent.default="submit">
    <div class="ni-form-container">
      <slot name="overlay"></slot>
      <header class="ni-form-header" v-if="hasHeader">
        <div class="ni-form-title"><slot name="title"></slot></div>
        <div class="ni-form-subtitle"><slot name="subtitle"></slot></div>
      </header>
      <main class="ni-form-main">
        <slot></slot>
      </main>
      <footer class="ni-form-footer" v-if="hasFooter">
        <slot name="footer"></slot>
      </footer>
    </div>
  </form>
</template>

<script>
// NOTICE
// Remember that v-on:submit will NOT work on this component
// Use :submit="onSubmit on the parent component and it'll save you headaches
export default {
  name: 'ni-form-struct',
  computed: {
    cssClass () {
      let value = 'ni-form'
      if (this.width === 'narrow') value += ' ni-form-narrow'
      return value
    },
    hasHeader () {
      return this.$slots['title'] || this.$slots['subtitle']
    },
    hasFooter () {
      return this.$slots['footer']
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

.ni-form-header
.ni-form-title
.ni-form-subtitle
.ni-form-main
.ni-form-footer
  &:empty
    display none

.ni-form-main
  flex 1
  p
    font-size 0.75rem
    line-height 1rem
    margin 0.5rem 0.5rem 0

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
    padding 1rem - px 1rem
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

  .ni-form-main
    p
      margin 1rem 1rem 0

  .ni-form-footer > div
    padding 1rem - px
</style>
