<template lang="pug">
modal-menu.app-menu-user(v-if="!config.desktop")
  part(title='User Menu')
    template(v-if="user.signedIn")
      list-item(to="/settings" exact @click.native="close" title="Settings")
      list-item(type="anchor" @click.native="signOut" title="Sign Out")
    template(v-else)
      list-item(type="anchor" @click.native="signIn" title="Sign In")
modal-menu.app-menu-user(@click="close" v-else): .outer-wrapper: .inner-wrapper
  part(title='User Menu')
    template(v-if="user.signedIn")
      list-item(to="/settings" exact @click.native="close" title="Settings")
      list-item(type="anchor" @click.native="signOut" title="Sign Out")
    template(v-else)
      list-item(type="anchor" @click.native="signIn" title="Sign In")
</template>

<script>
import {mapGetters} from 'vuex'
import noScroll from 'no-scroll'
import ListItem from 'common/NiListItem'
import ModalMenu from 'common/NiModalMenu'
import Part from 'common/NiPart'
export default {
  name: 'app-menu-user',
  components: {
    ListItem,
    ModalMenu,
    Part
  },
  computed: {
    ...mapGetters(['user', 'config'])
  },
  methods: {
    close () {
      this.$store.commit('setActiveMenu', '')
      noScroll.off()
    },
    signOut () {
      this.$store.dispatch('logout', this.user.uid)
      this.close()
    },
    signIn () {
      this.$store.dispatch('login')
      this.close()
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

@media screen and (min-width: 1024px)
  .ni-modal-menu.app-menu-user
    width 100vw
    height 100vh
    position fixed
    top 0
    left 0
    background none

    .outer-wrapper
      width aw
      margin 3rem - px auto 0
      position relative
      display flex
      align-items flex-end
      justify-content flex-end

    .inner-wrapper
      width 20rem
      background app-bg-alpha
      border px solid bc
      border-bottom none
      shadow()
</style>
