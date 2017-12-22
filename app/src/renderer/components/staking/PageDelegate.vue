<template lang="pug">
page(icon="storage" :title="delegate.keybaseID")
  div(slot="menu"): tool-bar
    router-link(to="/staking" exact)
      i.material-icons arrow_back
      .label Back
    template(v-if='isDelegator')
      a(v-if='inCart' @click.native='rm(delegate.id)')
        i.material-icons delete
        .label Remove
      a(v-else-if="config.devMode" @click.native='add(delegate.id)')
        i.material-icons add
        .label Add

  part(title="Delegate Description")
    list-item(dt='Name' :dd='delegate.description.moniker')
    text-block(v-if="delegate.description.website" :content="delegate.description.details")
  part(title="Delegate Details")
    list-item(dt='Public Key' :dd='delegate.id')
    list-item(dt='Country' :dd='delegate.country || "n/a"')
    list-item(dt='Start Date' :dd='delegate.startDate || "n/a"')
  part(title="Delegate Stake" v-if="config.devMode")
    list-item(dt='Voting Power' :dd='delegate.voting_power + " ATOM"')
    list-item(dt='Shares' :dd='delegate.shares + " ATOM"')
    list-item(dt='Commission'
      :dd='(delegate.commission * 100).toFixed(2) + "%"')
    list-item(dt='Max Commission'
      :dd='(delegate.commissionMax * 100).toFixed(2) + "%"')
    list-item(dt='Max Commission Increase'
      :dd='(delegate.commissionMaxRate * 100).toFixed(2) + "%"')

  part(title="External")
    list-item(dt="Website" :dd="delegate.description.website" :href="delegate.description.website")
</template>

<script>
import { mapGetters } from 'vuex'
import countries from 'scripts/countries.json'
import Btn from '@nylira/vue-button'
import ListItem from 'common/NiListItem'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
import TextBlock from 'common/TextBlock'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-delegate',
  components: {
    Btn,
    ListItem,
    Page,
    Part,
    TextBlock,
    ToolBar
  },
  computed: {
    ...mapGetters(['delegates', 'countries', 'shoppingCart', 'user', 'config']),
    delegate () {
      let value = {}
      if (this.delegates) {
        value = this.delegates.find(v => v.id === this.$route.params.delegate)
      }
      return value
    },
    inCart () {
      return this.shoppingCart.find(c => c.delegateId === this.delegate.id)
    },
    isDelegator () { return this.user.signedIn && !this.user.nominationActive },
    isMe () {
      return this.user.nominationActive && this.user.nomination.id === this.delegate.id
    }
  },
  methods: {
    countryName (code) {
      return countries.find(c => c.value === code).key
    },
    add (delegateId) {
      this.$store.commit('addToCart', delegateId)
    },
    rm (delegateId) {
      this.$store.commit('removeFromCart', delegateId)
    }
  },
  mounted () {
    if (!this.delegate) { this.$router.push('/staking') }
  }
}
</script>
