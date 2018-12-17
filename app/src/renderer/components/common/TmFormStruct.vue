<template lang="pug">
form(:class='cssClass' v-on:submit.prevent.default='submit')
  .tm-form-container
    slot(name='overlay')
    header.tm-form-header(v-if='hasHeader')
      .tm-form-title
        slot(name='title')
      .tm-form-subtitle
        slot(name='subtitle')
    main.tm-form-main
      slot
    footer.tm-form-footer(v-if='hasFooter')
      slot(name='footer')
</template>

<script>
// NOTICE
// Remember that v-on:submit will NOT work on this component
// Use :submit="onSubmit on the parent component and it'll save you headaches
export default {
  name: "tm-form-struct",
  computed: {
    cssClass() {
      let value = "tm-form"
      if (this.width === "narrow") value += " tm-form-narrow"
      return value
    },
    hasHeader() {
      return this.$slots["title"] || this.$slots["subtitle"]
    },
    hasFooter() {
      return this.$slots["footer"]
    }
  },
  props: ["width", "submit"]
}
</script>

<style lang="stylus">
@import '~variables'

.tm-form
  display flex
  position relative
  width width-main

.tm-form-container
  flex 1
  display flex
  flex-flow column
  position relative

.tm-form-header
.tm-form-title
.tm-form-subtitle
.tm-form-main
.tm-form-footer
  &:empty
    display none

.tm-form-main
  flex 1

.tm-form-header
  display flex
  flex-flow column nowrap
  border-bottom px solid var(--bc)
  position relative
  padding 1rem 0

.tm-form-title
  line-height 1rem
  color var(--bright)

.tm-form-subtitle
  color var(--dim)
  font-size sm
  line-height 1rem

.tm-form-footer
  > div
    padding 1rem 1rem 1rem - px
    display flex
    justify-content space-between
    align-items center

    > *:not(:last-child)
      margin-right 1rem

@media screen and (min-width: 480px)
  .tm-form-title
    line-height 1.5rem
    margin-bottom 0.5rem

  .tm-form-subtitle
    font-size m

  .tm-form-main
    p
      margin 1rem 1rem 0
</style>
