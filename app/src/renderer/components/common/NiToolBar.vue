<template lang="pug">
.ni-tool-bar
  .ni-tool-bar-container
    .main: slot
    a.back(@click="$router.go(-1)")
      i.material-icons arrow_back
      .label Back
    a.help(@click="enableModalHelp")
      i.material-icons help_outline
      .label Help
    a.sign-out(@click="signOut")
      i.material-icons exit_to_app
      .label Sign Out
</template>

<script>
export default {
  name: "ni-tool-bar",
  methods: {
    enableModalHelp() {
      this.$store.commit("setModalHelp", true)
    },
    openSession() {
      this.$store.commit("setModalSession", true)
      this.close()
    },
    signOut() {
      this.$store.dispatch("signOut")
      this.openSession()
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.ni-tool-bar-container
  display flex

  .main
    flex 1
    display flex
    align-items center

  a, i.material-icons
    display flex
    align-items center
    justify-content center

  a
    padding 1rem

    user-select none
    cursor pointer

    display flex
    align-items center
    justify-content center
    position relative

    i, .label
      color txt

    i
      font-size lg

    .label
      position absolute
      top 3rem
      right 0

      background bc
      border-radius 0.25rem

      line-height 2.5rem

      padding 0 0.75rem

      color txt
      z-index z(modal)

      white-space nowrap

      display none
      &:before
        position absolute
        top -0.375rem
        right 1.125rem

        // arrow
        width 0
        height 0
        border-left 0.375rem solid transparent
        border-right 0.375rem solid transparent
        border-bottom 0.375rem solid bc

        display block
        content ''

    &.router-link-active
      i
        color bright

    &:hover:not([disabled])
      background app-fg
      i
        color bright
      .label
        display block

    &[disabled]
      cursor default
      i
        color dim

@media screen and (max-width: 1023px)
  .ni-tool-bar
    z-index z(toolBar)
    position fixed
    bottom 0
    left 0
    right 0

  .ni-tool-bar-container
    background app-bg-alpha
    height 3rem + px
    border-top px solid bc

  .ni-page
    padding-bottom 3rem

@media screen and (min-width: 1024px)
  .ni-tool-bar-container
    .main
      justify-content flex-end
    a
      margin-top 0.7rem
</style>
