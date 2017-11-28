<template lang="pug">
page(:title='candidate.keybaseID')
  div(slot="menu"): tool-bar
    router-link(to="/staking" exact)
      i.material-icons arrow_back
      .label Back
    template(v-if='isDelegator')
      a(v-if='inCart' @click.native='rm(candidate.id)')
        i.material-icons delete
        .label Remove
      a(v-else @click.native='add(candidate.id)')
        i.material-icons add
        .label Add

  part(title="Description")
    text-block(:content="candidate.description")
  part(title="Validator Details")
    list-item(dt='Public Key' :dd='candidate.id')
    list-item(dt='Country' :dd='candidate.country')
  part(title="Staking Details")
    list-item(dt='Voting Power' :dd='candidate.voting_power')
    list-item(dt='Shares' :dd='candidate.shares')
    list-item(dt='Commission Rate' :dd='`${(candidate.commission * 100).toFixed(2)}%`')
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
  name: 'page-candidate',
  components: {
    Btn,
    ListItem,
    Page,
    Part,
    TextBlock,
    ToolBar
  },
  computed: {
    ...mapGetters(['candidates', 'countries', 'shoppingCart', 'user']),
    candidate () {
      let value = {}
      if (this.candidates) {
        value = this.candidates.find(v => v.id === this.$route.params.candidate)
      }
      return value
    },
    inCart () {
      return this.shoppingCart.find(c => c.candidateId === this.candidate.id)
    },
    isDelegator () { return this.user.signedIn && !this.user.nominationActive },
    isMe () {
      return this.user.nominationActive && this.user.nomination.id === this.candidate.id
    }
  },
  methods: {
    countryName (code) {
      return countries.find(c => c.value === code).key
    },
    add (candidateId) {
      this.$store.commit('addToCart', candidateId)
    },
    rm (candidateId) {
      this.$store.commit('removeFromCart', candidateId)
    }
  },
  mounted () {
    if (!this.candidate) { this.$router.push('/staking') }
  }
}
</script>
