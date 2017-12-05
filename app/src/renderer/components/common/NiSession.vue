<template lang="pug">
.ni-session-wrapper(v-if="active")
  session-welcome(v-if="config.modals.session.state == 'welcome'")
  session-sign-up(v-if="config.modals.session.state == 'sign-up'")
  session-sign-in(v-if="config.modals.session.state == 'sign-in'")
  session-hardware(v-if="config.modals.session.state == 'hardware'")
</template>

<script>
import {mapGetters} from 'vuex'
import SessionWelcome from 'common/NiSessionWelcome'
import SessionSignUp from 'common/NiSessionSignUp'
import SessionSignIn from 'common/NiSessionSignIn'
import SessionHardware from 'common/NiSessionHardware'
export default {
  name: 'ni-session',
  components: {
    SessionWelcome,
    SessionSignUp,
    SessionSignIn,
    SessionHardware
  },
  computed: {
    ...mapGetters(['config']),
    active () { return this.config.modals.session.active }
  }
}
</script>

<style lang="stylus">
@import '~variables'

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

  .ni-field-checkbox-label
    flex 1
    line-height 1.5
    padding-left 1rem

.ni-session
  position fixed
  top 0
  left 0
  z-index 1000
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

  overflow-y scroll

  .ps-scrollbar-y-rail
    display none

  > p
    padding 1rem
    border-bottom px solid bc

.ni-session-footer
  border-top px solid bc
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

  .ni-session-main
    padding 2rem 3rem
    overflow-y scroll

    .ni-form-group
      display block !important
</style>
