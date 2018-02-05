<template lang="pug">
page(title="Delegate Profile")
  div(slot="menu"): tool-bar
    a(v-if='inCart' @click.native='rm(delegate.id)')
      i.material-icons delete
      .label Remove
    a(v-else-if="config.devMode" @click.native='add(delegate)')
      i.material-icons add
      .label Add

  part(title="Delegate Details")
    list-item(dt='Moniker' :dd='delegate.description.moniker')
    list-item(dt='Address' :dd='validator.address')
    list-item(dt='Public Key' :dd='validator.pub_key.data')
    list-item(dt='Country' :dd='country' v-if="country")
    list-item(dt='Start Date' :dd='delegate.startDate' v-if="delegate.startDate")
    list-item(dt='Current Status' :dd='status')

  part(title="Delegate Description" v-if="delegate.description.details")
    text-block(:content="delegate.description.details")

  part(title="Validator Details")
    list-item(dt="Total Vote Power" :dd="validator.voting_power"
      :to="{ name: 'validator-power', params: { validator: validatorSlug }}")
    list-item(dt="Vote History" dd="37 Votes"
      :to="{ name: 'validator-votes', params: { validator: validatorSlug }}")
    list-item(dt="Proposals" dd="13"
      :to="{ name: 'validator-proposals', params: { validator: validatorSlug }}")
    list-item(dt="Slashes" dd="6"
      :to="{ name: 'validator-slashes', params: { validator: validatorSlug }}")

  part(title="Delegate Stake" v-if="config.devMode")
    list-item(dt='Voting Power' :dd='delegate.voting_power + " ATOM"')
    list-item(dt='Bonded Atoms' :dd='delegate.shares + " ATOM"')
    list-item(dt='Commission'
      :dd='(delegate.commission * 100).toFixed(2) + "%"')
    list-item(dt='Max Commission'
      :dd='(delegate.commissionMax * 100).toFixed(2) + "%"')
    list-item(dt='Max Commission Increase'
      :dd='(delegate.commissionMaxRate * 100).toFixed(2) + "%"')

  part(title="External" v-if="delegate.description.website")
    list-item(dt="Website" :dd="delegate.description.website" :href="delegate.description.website")
</template>

<script>
import { mapGetters } from 'vuex'
import countries from 'scripts/countries.json'
import Btn from '@nylira/vue-button'
import LiCopy from 'common/NiLiCopy'
import ListItem from 'common/NiListItem'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
import TextBlock from 'common/TextBlock'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-delegate',
  components: {
    Btn,
    LiCopy,
    ListItem,
    Page,
    Part,
    TextBlock,
    ToolBar
  },
  computed: {
    ...mapGetters(['delegates', 'validators', 'shoppingCart', 'user', 'config']),
    delegate () {
      let value = {
        description: {}
      }
      if (this.delegates.delegates && this.$route.params.delegate) {
        value = this.delegates.delegates.find(v => v.id === this.$route.params.delegate) || value
      }
      return value
    },
    validator () {
      if (this.validators && this.validators.length > 0) {
        return this.validators.find(d => this.urlsafeIp(d.pub_key.data) === this.$route.params.delegate)
      } else {
        return null
      }
    },
    inCart () {
      return this.shoppingCart.find(c => c.id === this.delegate.id) !== undefined
    },
    country () {
      if (this.delegate.country) {
        return this.countryName(this.delegate.country)
      }
    },
    validatorSlug () {
      return this.urlsafeIp(this.validator.pub_key.data)
    },
    status () {
      console.log(this.validator)
      let validator = this.validator.voting_power > 0
      return validator ? 'Validator' : 'Candidate'
    }
  },
  methods: {
    countryName (code) {
      let country = countries.find(c => c.value === code)
      return country ? country.key : code
    },
    add (delegate) {
      this.$store.commit('addToCart', delegate)
    },
    rm (delegateId) {
      this.$store.commit('removeFromCart', delegateId)
    },
    urlsafeIp (ip) {
      return ip.split('.').join('-')
    }
  },
  mounted () {
    if (!this.delegate.id) { this.$router.push('/staking') }
  }
}
</script>
<style lang="stylus">
@require '~variables'
</style>
