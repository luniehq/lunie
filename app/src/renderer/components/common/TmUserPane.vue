<template lang="pug">
tm-list-item.tm-li-user(
  v-if="user.signedIn"
  type="link"
  to="/preferences"
  @click.native="close"
  title="Preferences"
  :subtitle="user.account")
</template>

<script>
import { mapGetters } from "vuex"
import noScroll from "no-scroll"
import { TmListItem } from "@tendermint/ui"
export default {
  name: "tm-user-pane",
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

.tm-li.tm-li-user
  border-top px solid var(--bc)
  height 3.5rem + px
</style>
