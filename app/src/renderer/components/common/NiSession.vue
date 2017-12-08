<template lang="pug">
.ni-session-wrapper(v-if="active")
  img.ni-session-backdrop(src="../../assets/images/cosmos-logo.png")
  session-welcome(v-if="config.modals.session.state == 'welcome'")
  session-sign-up(v-if="config.modals.session.state == 'sign-up'")
  session-sign-in(v-if="config.modals.session.state == 'sign-in'")
  session-account-delete(v-if="config.modals.session.state == 'delete'")
  session-hardware(v-if="config.modals.session.state == 'hardware'")
  session-restore(v-if="config.modals.session.state == 'restore'")
</template>

<script>
import {mapGetters} from 'vuex'
import noScroll from 'no-scroll'
import SessionWelcome from 'common/NiSessionWelcome'
import SessionSignUp from 'common/NiSessionSignUp'
import SessionSignIn from 'common/NiSessionSignIn'
import SessionHardware from 'common/NiSessionHardware'
import SessionRestore from 'common/NiSessionRestore'
import SessionAccountDelete from 'common/NiSessionAccountDelete'
export default {
  name: 'ni-session',
  components: {
    SessionWelcome,
    SessionSignUp,
    SessionSignIn,
    SessionHardware,
    SessionRestore,
    SessionAccountDelete
  },
  computed: {
    ...mapGetters(['config', 'config']),
    active () { return this.config.modals.session.active }
  },
  mounted () {
    noScroll.on()
  },
  beforeDestroy () {
    noScroll.off()
    if (!this.config.devMode) {
      this.$store.commit('setModalSession', true)
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.ni-session-wrapper
  position relative
  z-index 1000

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
    background app-fg
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
  z-index 900
  background app-bg

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
  flex-flow row nowrap
  justify-content space-between
  align-items center
  flex 0 0 3rem
  margin-top 1.5rem // for macos traffic signals

  a
    width 3rem
    display flex
    align-items center
    justify-content center
    cursor pointer
    height 3rem
    i
      color txt
      font-size lg
    &:hover
      background app-fg
      i
        color bright

  .ni-session-title
    flex 1
    padding 0 1rem
    font-size lg
    text-align center
    color bright

.ni-session-main
  flex 1
  display flex
  flex-flow column
  justify-content center
  min-height 0

  overflow-y auto

  .ps-scrollbar-y-rail
    display none

  > p
    padding 1rem
    border-bottom px solid bc

.ni-session-footer
  border-top 2*px solid bc-dim
  flex 0 0 5rem + px
  display flex
  align-items center
  justify-content center

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
    background darken(app-bg, 25%)
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
      height 32rem

  .ni-session-header
    background app-fg
    margin-top 0

  .ni-session-main
    padding 2rem

    .ni-form-group
      display block !important
</style>
