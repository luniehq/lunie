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
@import '~variables'

.ni-form
  display flex
  position relative
  width width-main
  max-width max-width

.ni-form-container
  flex 1
  display flex
  flex-flow column
  position relative

.ni-form-header
.ni-form-title
.ni-form-subtitle
.ni-form-main
.ni-form-footer
  &:empty
    display none

.ni-form-main
  flex 1

.ni-form-header
  display flex
  flex-flow column nowrap
  border-bottom px solid bc
  position relative
  padding 1rem 0

.ni-form-title
  line-height 1rem
  color bright

.ni-form-subtitle
  color dim
  font-size sm
  line-height 1rem

.ni-form-footer
  > div
    padding 1rem 1rem 1rem - px
    display flex
    justify-content flex-end
    align-items center

    > *:not(:last-child)
      margin-right 1rem

@media screen and (min-width: 480px)
  .ni-form-title
    line-height 1.5rem
    margin-bottom 0.5rem

  .ni-form-subtitle
    font-size m

  .ni-form-main
    p
      margin 1rem 1rem 0
</style>
