<template lang="pug">
menu.app-menu
  .app-menu-main
    router-link.app-menu-item#app-menu__wallet(
      to="/"
      exact
      @click.native="close"
      title="Wallet")
      h2.app-menu-title Wallet
      i.material-icons chevron_right
    router-link.app-menu-item#app-menu__transactions(
      v-if="config.devMode || mockedConnector"
      to="/transactions"
      exact
      @click.native="close"
      title="Transactions")
      h2.app-menu-title Transactions
      i.material-icons chevron_right
    router-link.app-menu-item#app-menu__staking(
      to="/staking"
      @click.native="close"
      title="Staking")
      h2.app-menu-title Staking
      i.material-icons chevron_right
    router-link.app-menu-item#app-menu__proposals(
      to="/governance"
      @click.native="close"
      title="Governance")
      h2.app-menu-title Governance
      i.material-icons chevron_right
  connected-network
</template>

<script>
import { mapGetters } from "vuex"
import PerfectScrollbar from "perfect-scrollbar"
import noScroll from "no-scroll"
import ConnectedNetwork from "common/TmConnectedNetwork"
import { TmBtn, TmListItem } from "@tendermint/ui"
export default {
  name: `app-menu`,
  components: {
    ConnectedNetwork,
    TmListItem
  },
  data: () => ({
    ps: {}
  }),
  computed: {
    ...mapGetters([`validators`, `config`, `lastHeader`, `mockedConnector`])
  },
  mounted() {
    this.ps = new PerfectScrollbar(this.$el.querySelector(`.app-menu-main`))
  },
  methods: {
    close() {
      this.$store.commit(`setActiveMenu`, ``)
      noScroll.off()
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.app-menu
  background var(--app-nav)
  z-index z(appMenu)
  user-select none
  display flex
  flex-flow column nowrap

  .app-menu-main
    flex 1
    position relative // for perfect-scrollbar

  .app-menu-item
    display flex
    justify-content space-between
    align-items center
    border-bottom 1px solid var(--bc-dim)
    padding 1rem
    color var(--dim)

    &:hover
      color var(--bright)
      background var(--hover-bg)

  .router-link-active
    background var(--hover-bg)

    i
      color var(--tertiary)

    h2
      color var(--bright)
      font-weight 500

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
</style>
