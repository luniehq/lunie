<template lang="pug">
tm-list-item.ni-li-user(
  v-if="user.signedIn"
  type="link"
  to="/preferences"
  @click.native="close"
  icon="settings"
  title="Preferences"
  :subtitle="user.account")
</template>

<script>
import { mapGetters } from "vuex"
import noScroll from "no-scroll"
import { TmListItem } from "@tendermint/ui"
export default {
  name: "ni-user-pane",
  components: { TmListItem },
  computed: { ...mapGetters(["user", "config"]) },
  methods: {
    close() {
      this.$store.commit("setActiveMenu", "")
      noScroll.off()
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.ni-li.ni-li-user
  border-top px solid var(--bc)
  height 3rem + px
</style>
