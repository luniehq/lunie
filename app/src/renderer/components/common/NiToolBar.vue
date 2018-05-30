<template lang="pug">
.ni-tool-bar
  .ni-tool-bar-container
    .main: slot
    router-link(v-if="backPath" :to="backPath" v-tooltip.bottom="'Back'")
      i.material-icons arrow_back
    a.help(@click="enableModalHelp" v-tooltip.bottom="'Help'")
      i.material-icons help_outline
    a.sign-out(@click="signOut" v-tooltip.bottom.end="'Sign Out'")
      i.material-icons exit_to_app
</template>

<script>
export default {
  name: "ni-tool-bar",
  props: ["backPath"],
  methods: {
    enableModalHelp() {
      this.$store.commit("setModalHelp", true)
    },
    signOut() {
      this.$store.dispatch("signOut")
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

    i
      color var(--txt)

    i
      font-size lg

    &.router-link-active
      i
        color var(--bright)

    &:hover:not([disabled])
      background var(--app-fg)
      i
        color var(--bright)

    &[disabled]
      cursor default
      i
        color var(--dim)

@media screen and (max-width: 1023px)
  .ni-tool-bar
    z-index z(toolBar)
    position fixed
    bottom 0
    left 0
    right 0

  .ni-tool-bar-container
    background var(--app-bg-alpha)
    height 3rem + px
    border-top px solid var(--bc)

  .ni-page
    padding-bottom 3rem

@media screen and (min-width: 1024px)
  .ni-tool-bar-container
    .main
      justify-content flex-end
    a
      margin-top 0.7rem
</style>
