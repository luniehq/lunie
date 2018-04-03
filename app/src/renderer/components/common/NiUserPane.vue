<template lang="pug">
list-item.ni-li-user(
  v-if="user.signedIn"
  type="link"
  to="/profile"
  @click.native="close"
  icon="face"
  :title="user.account")
</template>

<script>
import { mapGetters } from 'vuex'
import noScroll from 'no-scroll'
import ListItem from 'common/NiListItem'
export default {
  name: 'ni-user-pane',
  components: { ListItem },
  computed: { ...mapGetters(['user', 'config']) },
  methods: {
    close () {
      this.$store.commit('setActiveMenu', '')
      noScroll.off()
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
  cursor: pointer

  .ni-li-title
    color link
</style>
