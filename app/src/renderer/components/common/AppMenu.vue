<template lang="pug">
menu.app-menu
  .app-menu-main
    tm-list-item#app-menu__wallet(
      to="/"
      exact
      @click.native="close"
      title="Wallet")
    tm-list-item#app-menu__transactions(
      to="/wallet/transactions"
      exact
      @click.native="close"
      title="Transactions"
      v-if="config.devMode || mockedConnector")
    tm-list-item#app-menu__staking(
      to="/staking"
      exact
      @click.native="close" title="Staking"
      v-bind:class="{ 'active': isValidatorPage }")
    tm-list-item#app-menu__proposals(
      to="/proposals"
      exact @click.native="close"
      title="Proposals"
      v-if="config.devMode")
    tm-list-item#app-menu__blocks(
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
import ConnectedNetwork from "common/TmConnectedNetwork"
import { TmListItem } from "@tendermint/ui"
import UserPane from "common/TmUserPane"
export default {
  name: "app-menu",
  components: {
    ConnectedNetwork,
    TmListItem,
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
      return this.$route.params.validator
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

    .tm-connected-network
      display none

.app-menu
  background var(--app-fg)
  z-index z(appMenu)
  user-select none
  display flex
  flex-flow column nowrap

  .app-menu-main
    flex 1
    position relative // for perfect-scrollbar

    .tm-li
      border-bottom 1px solid var(--bc-dim)

  .tm-user
    border-top 1px solid var(--bc)
    padding 1rem
    display flex

    .tm-user-info
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
        color var(--txt)

    .text
      padding 0 0.5rem

    .title
      color var(--txt)

    .subtitle
      font-size xs
      color var(--dim)

    .tm-btn
      margin-right 0.5rem
</style>
