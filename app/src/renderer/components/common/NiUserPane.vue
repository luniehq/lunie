<template lang="pug">
.ni-user-pane
  router-link.ni-user-info(to="/profile" @click.native="close()")
    .avatar: i.material-icons face
    .title CoolUser007
  .ni-user-menu
    a(@click="openSettings()"): i.material-icons settings
    a(@click="openWelcome()"): i.material-icons notifications_active
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import noScroll from 'no-scroll'
import ListItem from './NiListItem'
import Part from './NiPart'
export default {
  name: 'ni-user-pane',
  components: {
    Btn,
    ListItem,
    Part
  },
  methods: {
    close () {
      this.$store.commit('setActiveMenu', '')
      noScroll.off()
    },
    openProfile () {
      window.alert('TODO: open user profile')
      this.close()
    },
    openSettings () {
      window.alert('TODO: open user settings')
      this.close()
    },
    openWelcome () {
      window.alert('TODO: open user welcome')
      this.close()
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.ni-user-pane
  border-top px solid bc
  display flex

.ni-user-info
  flex 1
  display flex
  align-items center
  padding-left 1rem

  cursor pointer
  user-select none

  .avatar
    background link
    width 1.5rem
    height 1.5rem
    border-radius 0.75rem

    display flex
    align-items center
    justify-content center
    i
      color bright

  .title
    padding 0 0.5rem
    color txt

  &:hover
    background app-fg
    .title
      color bright

.ni-user-menu
  display flex
  a
    display block
    width 3rem
    height 3rem
    display flex
    align-items center
    justify-content center

    cursor pointer
    &:hover
      background app-fg
      color bright
  i
    font-size lg
    color txt
</style>
