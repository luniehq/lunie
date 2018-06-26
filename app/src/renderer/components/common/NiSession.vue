<template lang="pug">
.ni-session-wrapper
  img.ni-session-backdrop(src="~assets/images/cosmos-logo.png")
  session-loading(v-if="config.modals.session.state == 'loading'")
  session-welcome(v-if="config.modals.session.state == 'welcome'")
  session-sign-up(v-if="config.modals.session.state == 'sign-up'")
  session-sign-in(v-if="config.modals.session.state == 'sign-in'")
  session-account-delete(v-if="config.modals.session.state == 'delete'")
  session-hardware(v-if="config.modals.session.state == 'hardware'")
  session-import(v-if="config.modals.session.state == 'import'")
</template>

<script>
import { mapGetters } from "vuex"
import SessionLoading from "common/NiSessionLoading"
import SessionWelcome from "common/NiSessionWelcome"
import SessionSignUp from "common/NiSessionSignUp"
import SessionSignIn from "common/NiSessionSignIn"
import SessionHardware from "common/NiSessionHardware"
import SessionImport from "common/NiSessionImport"
import SessionAccountDelete from "common/NiSessionAccountDelete"
export default {
  name: "ni-session",
  components: {
    SessionLoading,
    SessionWelcome,
    SessionSignUp,
    SessionSignIn,
    SessionHardware,
    SessionImport,
    SessionAccountDelete
  },
  computed: { ...mapGetters(["config"]) }
}
</script>

<style lang="stylus">
@import '~variables'

.ni-session-wrapper
  position relative
  z-index z(modal)

  .ni-session-backdrop
    position absolute
    top -10vw
    left -10vw
    width 50vw
    opacity 0.25

.ni-field-checkbox
  display flex
  flex-flow row nowrap
  align-items center

  .ni-field-checkbox-input
    flex 0 0 2rem
    height 2rem
    display flex
    align-items center
    justify-content center
    background var(--app-fg)
    input
      width auto
      display block
      padding 0
      margin 0

  .ni-field-checkbox-label
    flex 1
    line-height 1.375
    padding 0.5rem 1rem
    font-size 0.875rem

.ni-session
  position fixed
  top 0
  left 0
  z-index z(default)
  background var(--app-fg)

.ni-session-container
  &:not(.ni-form)
    width 100vw
    height 100vh
    display flex
    flex-flow column nowrap

  &.ni-form
    .ni-form-main
      width 100vw
      height 100vh
      display flex
      flex-flow column nowrap

.ni-session-header
  display flex
  justify-content space-between
  align-items center
  margin-top 1.5rem // for macos traffic signals
  padding 1rem 0;
  border-bottom: 0.125rem solid var(--bc-dim);

  a
    width 3rem
    display flex
    align-items center
    justify-content center
    cursor pointer
    height 3rem
    i
      color var(--txt)
      font-size lg
    &:hover
      background var(--app-fg)
      i
        color var(--txt)

  .ni-session-title
    flex 1
    padding 0 1rem
    font-size xl
    text-align center
    color var(--txt)

.ni-session-main
  min-height 0
  background var(--app-bg-light)
  overflow-y auto
  position relative

  .ni-bar-discrete
    margin-bottom 1rem

  img
    max-width 100%
    display block

  .ps-scrollbar-y-rail
    display none

  > p
    padding 1rem
    border-bottom px solid var(--bc)

.ni-session-label
  text-align center
  padding 1rem
  background var(--app-fg)
  color var(--dim)

.ni-session-footer
  background var(--app-bg-light)
  flex 0 0 5rem + px
  padding 0 3rem
  display flex
  align-items center
  justify-content flex-end

  &:empty
    display none

.ni-session-footer > div
  display flex
  justify-content space-between

@media screen and (min-width: 768px)
  .ni-session-wrapper
    position fixed
    top 0
    left 0
    background var(--app-bg)
    width 100vw
    height 100vh

    display flex
    align-items center
    justify-content center

  .ni-session
    position static
    shadow()

  .ni-session-container
    &:not(.ni-form)
    &.ni-form .ni-form-main
      width 32rem
      max-height 100vh
      height auto

  .ni-session-header
    background var(--app-fg)
    margin-top 0

  .ni-session-main
    padding 3rem 2rem

    .ni-form-group
      display block !important
</style>
