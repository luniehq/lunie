<template lang="pug">
menu.app-menu
  .app-menu-main
    part(title='Wallet')
      list-item(to="/" exact @click.native="close" title="Balance")
      list-item(to="/wallet/send" exact @click.native="close" title="Send")
      list-item(to="/wallet/transactions" exact @click.native="close" title="Transactions" v-if="config.devMode")
    part(title='Governance' v-if="config.devMode")
      list-item(to="/proposals" exact @click.native="close" title="Proposals")
    part(title='Stake' v-if="config.devMode")
      list-item(to="/staking" exact @click.native="close" title="Delegate")
    part(title='Monitor' v-if="config.devMode")
      list-item(to="/blockchain" exact @click.native="close" title="Blockchain")
      list-item(to="/validators" exact @click.native="close" title="Validators"
        v-bind:class="{ 'active': isValidatorPage }")
  user-pane
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import noScroll from 'no-scroll'
import ListItem from 'common/NiListItem'
import UserPane from 'common/NiUserPane'
import Part from 'common/NiPart'
export default {
  name: 'app-menu',
  components: {
    Btn,
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
    isValidatorPage () { return this.$route.params.validator }
  },
  methods: {
    close () {
      this.$store.commit('setActiveMenu', '')
      noScroll.off()
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.app-menu
  background app-bg-alpha
  z-index 99
  user-select none

  display flex
  flex-flow column nowrap

  .app-menu-main
    flex 1
    overflow-y auto

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
</style>
