<template lang="pug">
.page.page-candidate
  page-header
    div(slot="title") {{ candidate.id }}
    btn(theme='cosmos' type='link' to='/' icon='angle-left' value='All Candidates')
    template(v-if='isDelegator')
      btn(theme='cosmos'
        v-if='inCart' icon='times' value='Remove' @click.native='rm(candidate.id)')
      btn(v-else
        theme='cosmos' icon='check' value='Add' @click.native='add(candidate.id)')
    btn(v-if='isMe' theme='cosmos' type='link' to='/nominate'
      icon='edit' value='Edit Candidacy')
  div
    article-body
      div(v-html='md(candidate.description)')
    article-body
      div(v-html='md(candidate.serverPower)')
    key-values
      // key-value
        div(slot='key') Start Date
        div(slot='value') {{ candidate.startDate }}
      key-value
        div(slot='key') Commission
        div(slot='value') {{ candidate.commissionPercent }}%
      key-value
        div(slot='key') Country
        div(slot='value') {{ countryName(candidate.country) }}
      key-value
        div(slot='key') Website
        a(slot='value' :href="candidate.website") {{ candidate.website }}
      key-value(v-if='candidate.ipAddress')
        div(slot='key') IP Address
        a(slot='value' :href="candidate.ipAddress") {{ candidate.ipAddress }}
    key-values
      key-value
        div(slot='key') Atoms
        div(slot='value') {{ candidate.computed.atoms }}
      key-value
        div(slot='key') Delegators
        div(slot='value') {{ candidate.computed.delegators }}
      key-value
        div(slot='key') Slashes
        div(slot='value') {{ candidate.computed.slashes.length }}
</template>

<script>
import { mapGetters } from 'vuex'
import MarkdownIt from 'markdown-it'
import ArticleBody from './NiArticleBody'
import Btn from '@nylira/vue-button'
import PageHeader from './PageHeader'
import KeyValue from './NiKeyValue'
import KeyValues from './NiKeyValues'
import countries from '../scripts/countries.json'
export default {
  name: 'page-candidate',
  components: {
    ArticleBody,
    Btn,
    PageHeader,
    KeyValue,
    KeyValues
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
    if (!this.candidate) { this.$router.push('/') }
  }
}
</script>
