<template>
  <tm-list-item
    v-if="user.signedIn"
    :subtitle="user.account"
    class="tm-li-user"
    type="link"
    to="/preferences"
    title="Preferences"
    @click.native="close"
  />
</template>

<script>
import { mapGetters } from "vuex"
import noScroll from "no-scroll"
import TmListItem from "common/TmListItem"
export default {
  name: `tm-user-pane`,
  components: { TmListItem },
  computed: { ...mapGetters([`user`, `config`]) },
  methods: {
    close() {
      this.$store.commit(`setActiveMenu`, ``)
      noScroll.off()
    }
  }
}
</script>

<style>
.tm-li.tm-li-user {
  border-top: px solid var(--bc);
  height: calc(3.5rem + var(--px));
}
</style>
