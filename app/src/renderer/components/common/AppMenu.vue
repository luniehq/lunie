<template lang="pug">
menu.app-menu
  .app-menu-main
    list-item(to="/" exact @click.native="close" title="Balances")
    list-item(to="/wallet/transactions" exact @click.native="close" title="Transactions")
    list-item(to="/staking" exact @click.native="close" title="Staking" v-bind:class="{ 'active': isValidatorPage }")
    list-item(to="/proposals" exact @click.native="close" title="Proposals" v-if="config.devMode")
    list-item(to="/blocks" exact @click.native="close" title="Blocks")
    connectivity
  user-pane
</template>

<script>
import PerfectScrollbar from 'perfect-scrollbar'
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import noScroll from 'no-scroll'
import Connectivity from 'common/NiConnectivity'
import ListItem from 'common/NiListItem'
import UserPane from 'common/NiUserPane'
import Part from 'common/NiPart'
export default {
  name: 'app-menu',
  components: {
    Btn,
    Connectivity,
    ListItem,
    Part,
    UserPane
  },
  computed: {
    ...mapGetters(['proposals', 'validators', 'config']),
    proposalAlerts () {
      return this.proposals
        .filter(p => p.flags.read === false).length
    },
    isValidatorPage () {
      return this.$route.params.validator
    }
  },
  methods: {
    close () {
      this.$store.commit('setActiveMenu', '')
      noScroll.off()
    }
  },
  mounted () {
    // eslint-disable-next-line no-unused-vars
    const ps = new PerfectScrollbar('.app-menu-main')
  }
}
</script>

<style lang="stylus">
@require '~variables'

.app-menu
  background app-bg-alpha
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
    border-top 1px solid bc
    padding 1rem

    display flex

    .ni-user-info
      flex 1
      display flex

    .avatar
      background link
      width 2rem
      height 2rem
      border-radius 1rem

      display flex
      align-items center
      justify-content center
      i
        color bright

    .text
      padding 0 0.5rem

    .title
      color bright

    .subtitle
      font-size xs
      color dim

    .ni-btn
      margin-right 0.5rem

@media screen and (max-width:1023px)
  .app-menu
    position fixed
    top 3rem
    left 0
    bottom 0
    width 100vw

    background bg-menu
    user-select none

@media screen and (min-width:1024px)
  .app-menu
    flex 1
    .ni-connectivity
      display none
</style>
