<template lang="pug">
page(:title='candidate.id')
  tool-bar
    router-link(to="/staking" exact): i.material-icons arrow_back
    template(v-if='isDelegator')
      a(v-if='inCart' @click.native='rm(candidate.id)') Remove
      a(v-else @click.native='add(candidate.id)') Add
    router-link(v-if='isMe' to='/nominate') Edit
  part(title="Description")
    article-body
      div(v-html='md(candidate.description)')
  part(title="Server Details")
    article-body
      div(v-html='md(candidate.serverDetails)')
  part(title="Candidate Details")
    list-item(dt='Commission' :dd='candidate.commissionPercent')
    list-item(dt='Country' :dd='countryName(candidate.country)')
    list-item(dt='Website' :dd='candidate.website')
    list-item(dt='IP Address' :dd='candidate.ipAddress')
  part(title="Staking Details")
    list-item(dt='Atoms' :dd='candidate.atoms')
    list-item(dt='Delegators' :dd='candidate.computed.delegators')
    list-item(dt='Slashes' :dd='candidate.computed.slashes.length')
</template>

<script>
import { mapGetters } from 'vuex'
import MarkdownIt from 'markdown-it'
import ArticleBody from '../common/NiArticleBody'
import Btn from '@nylira/vue-button'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
import ToolBar from '../common/NiToolBar'
import ListItem from '../common/NiListItem'
import countries from '../../scripts/countries.json'
export default {
  name: 'page-candidate',
  components: {
    ArticleBody,
    Btn,
    ListItem,
    Page,
    Part,
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
    md (string) {
      let md = new MarkdownIt()
      return md.render(string)
    },
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
