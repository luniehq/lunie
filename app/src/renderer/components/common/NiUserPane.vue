<template lang="pug">
list-item.ni-li-user(
  v-if="user.signedIn && config.devMode"
  type="link"
  to="/profile"
  @click.native="close"
  icon="face"
  :title="user.account")
div(v-else-if="user.signedIn")
  list-item.ni-li-user(
  type="link"
  icon="exit_to_app"
  @click.native="signOut"
  title="Sign Out")
</template>

<script>
import {mapGetters} from 'vuex'
import noScroll from 'no-scroll'
import ListItem from 'common/NiListItem'
export default {
  name: 'ni-user-pane',
  components: {
    ListItem
  },
  computed: {
    ...mapGetters(['user', 'config'])
  },
  methods: {
    close () {
      this.$store.commit('setActiveMenu', '')
      noScroll.off()
    },
    openSession () {
      this.$store.commit('setModalSession', true)
      this.close()
    },
    signOut () {
      this.$store.dispatch('signOut')
      this.openSession()
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.ni-li.ni-li-user
  border-top px solid bc
  height 3rem + px
  cursor: pointer

  .ni-li-title
    color link
</style>
