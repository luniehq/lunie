<template lang="pug">
menu.app-menu
  .app-menu-main
    list-item(
      to="/"
      exact
      @click.native="close"
      title="Wallet")
    list-item(
      to="/wallet/transactions"
      exact
      @click.native="close"
      title="Transactions"
      v-if="config.devMode || mockedConnector")
    list-item(
      to="/staking"
      exact
      @click.native="close" title="Staking"
      v-bind:class="{ 'active': isValidatorPage }"
      v-if="config.devMode || mockedConnector")
    list-item(
      to="/proposals"
      exact @click.native="close"
      title="Proposals"
      v-if="config.devMode")
    list-item(
      to="/blocks"
      exact
      @click.native="close"
      title="Blocks")
  connected-network
  user-pane
</template>

<script>
import { mapGetters } from "vuex"
import PerfectScrollbar from "perfect-scrollbar"
import noScroll from "no-scroll"
import Btn from "@nylira/vue-button"
import ConnectedNetwork from "common/NiConnectedNetwork"
import ListItem from "common/NiListItem"
import UserPane from "common/NiUserPane"
import Part from "common/NiPart"
export default {
  name: "app-menu",
  components: {
    Btn,
    ConnectedNetwork,
    ListItem,
    Part,
    UserPane
  },
  computed: {
    ...mapGetters([
      "proposals",
      "validators",
      "config",
      "lastHeader",
      "mockedConnector"
    ]),
    isValidatorPage() {
      if (this.$route) {
        return this.$route.params.validator
      } else {
        return false
      }
    }
  },
  data: () => ({
    ps: {}
  }),
  methods: {
    close() {
      this.$store.commit("setActiveMenu", "")
      noScroll.off()
    }
  },
  mounted() {
    this.ps = new PerfectScrollbar(this.$el.querySelector(".app-menu-main"))
  }
}
</script>

<style lang="stylus">
@require '~variables'

.app-menu
  background var(--app-bg-alpha)
  z-index z(appMenu)
  user-select none
  display flex
  flex-flow column nowrap

  .app-menu-main
    flex 1
    position relative // for perfect-scrollbar

    .ni-li-link
      padding 0 0 0 1rem

  .ni-user
    border-top 1px solid var(--bc)
    padding 1rem
    display flex

    .ni-user-info
      flex 1
      display flex

    .avatar
      background var(--link)
      width 2rem
      height 2rem
      border-radius 1rem
      display flex
      align-items center
      justify-content center

      i
        color var(--bright)

    .text
      padding 0 0.5rem

    .title
      color var(--bright)

    .subtitle
      font-size xs
      color var(--dim)

    .ni-btn
      margin-right 0.5rem

@media screen and (max-width: 1023px)
  .app-menu
    position fixed
    top 3rem
    left 0
    bottom 0
    width 100vw
    background var(--app-bg)
    user-select none

@media screen and (min-width: 1024px)
  .app-menu
    flex 1

    .ni-connected-network
      display none
</style>
