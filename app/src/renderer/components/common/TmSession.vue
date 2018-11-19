<template lang="pug">
.tm-session-wrapper
  img.tm-session-backdrop(src="~assets/images/cosmos-logo.png")
  session-loading(v-if="config.modals.session.state == 'loading'")
  session-welcome(v-if="config.modals.session.state == 'welcome'")
  session-sign-in(v-if="config.modals.session.state == 'sign-in'")
  session-account-delete(v-if="config.modals.session.state == 'delete'")
  session-hardware(v-if="config.modals.session.state == 'hardware'")
  session-import(v-if="config.modals.session.state == 'import'")
  connected-network
</template>

<script>
import { mapGetters } from "vuex"
import SessionLoading from "common/TmSessionLoading"
import SessionWelcome from "common/TmSessionWelcome"
import SessionSignIn from "common/TmSessionSignIn"
import SessionHardware from "common/TmSessionHardware"
import SessionImport from "common/TmSessionImport"
import SessionAccountDelete from "common/TmSessionAccountDelete"
import ConnectedNetwork from "common/TmConnectedNetwork"
export default {
  name: `tm-session`,
  components: {
    SessionLoading,
    SessionWelcome,
    SessionSignIn,
    SessionHardware,
    SessionImport,
    SessionAccountDelete,
    ConnectedNetwork
  },
  computed: { ...mapGetters([`config`]) }
}
</script>

<style lang="stylus">
@import '~variables'

.tm-session-wrapper
  position relative
  z-index z(modal)

  .tm-session-backdrop
    left -10vw
    opacity 0.25
    position absolute
    top -10vw
    width 50vw

.tm-field-checkbox
  align-items center
  display flex
  flex-flow row nowrap

  .tm-field-checkbox-input
    align-items center
    background var(--app-fg)
    display flex
    flex 0 0 2rem
    height 2rem
    justify-content center

    input
      display block
      margin 0
      padding 0
      width auto

  .tm-field-checkbox-label
    flex 1
    font-size 0.875rem
    line-height 1.375
    padding 0.5rem 1rem

.tm-session
  background var(--app-fg)
  left 0
  position fixed
  top 0
  z-index z(default)

.tm-session-container
  &:not(.tm-form)
    display flex
    flex-flow column nowrap
    height 100vh
    width 100vw

  &.tm-form
    .tm-form-main
      display flex
      flex-flow column nowrap
      height 100vh
      width 100vw

.tm-session-header
  align-items center
  border-bottom 0.125rem solid var(--bc-dim)
  display flex
  justify-content space-between
  margin-top 1.5rem // for macos traffic signals
  padding 1rem 2rem

  a
    align-items center
    cursor pointer
    display flex
    justify-content center

    i
      color var(--dim)
      font-size lg

    &:hover
      i
        color var(--txt)

  .tm-session-title
    color var(--txt)
    flex 1
    font-size xl
    padding 0 1rem
    text-align center

.tm-session-main
  background var(--app-fg)
  min-height 0
  overflow-y auto
  position relative

  .tm-bar-discrete
    margin 1rem auto

  img
    display block
    margin 0 auto
    max-width 300px

  .ps-scrollbar-y-rail
    display none

  > p
    border-bottom px solid var(--bc)
    padding 1rem

.tm-session-label
  background var(--app-fg)
  color var(--txt)
  padding 1rem
  text-align center

.tm-session-footer
  align-items center
  background var(--app-fg)
  display flex
  flex 0 0 5rem + px
  justify-content flex-end
  padding 0 2rem

  button
    margin-left 1rem

  &:empty
    display none

.tm-form-group__label
  color var(--dim)
  font-size sm
  line-height xl

.tm-session-footer > div
  display flex
  justify-content space-between

@media screen and (min-width: 768px)
  .tm-session-wrapper
    align-items center
    background var(--app-bg)
    display flex
    height 100vh
    justify-content center
    left 0
    position fixed
    top 0
    width 100vw

  .tm-session
    position static
    shadow()

  .tm-session-container
    &:not(.tm-form), &.tm-form .tm-form-main
      height auto
      max-height 100vh
      width 32rem

  .tm-session-header
    background var(--app-nav)
    margin-top 0

  .tm-session-main
    padding 3rem 1rem

    .tm-form-group
      display block !important

.tm-connected-network
  position absolute
  bottom 0
  left 0
</style>
