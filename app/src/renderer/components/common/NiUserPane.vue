<template lang="pug">
list-item.ni-li-user(
  v-if="user.signedIn && config.devMode"
  type="link"
  to="/profile"
  @click.native="close"
  icon="face"
  title="CosmosUser01")
list-item.ni-li-user(
  v-else-if="user.signedIn"
  icon="mood"
  title="Signed In")
list-item.ni-li-user(
  v-else
  @click.native="openSession"
  icon="exit_to_app"
  title="Sign In")
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
    openSettings () {
      window.alert('TODO: open user settings')
      this.close()
    },
    openSession () {
      this.$store.commit('setModalSession', true)
      this.close()
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.ni-li.ni-li-user
  border-top px solid bc
  height 3rem + px
</style>
