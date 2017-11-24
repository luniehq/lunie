<template lang="pug">
.app-table-of-contents
  part(title='Proposals')
    list-item(
      @click.native="close"
      v-for="i in proposalStages"
      :key="i.id"
      :dt="i.title"
      :dd="i.subtitle"
      :to="'/s/' + i.id")
  part(title='Discussions')
    list-item(
      @click.native="close"
      v-for="i in englishDiscussions"
      :key="i.id"
      :dt="i.title"
      :dd="i.subtitle"
      :to="'/d/' + i.id")
  part(title='Language-specific Discussions')
    list-item(
      @click.native="close"
      v-for="i in i18nDiscussions"
      :key="i.id"
      :dt="i.title"
      :dd="i.subtitle"
      :to="'/d/' + i.id")
  part(title='Community')
    list-item(to="/users" exact @click.native="close" title="All Users")
  // 
    part(title='Wallet')
      list-item(to="/" exact @click.native="close" title="Balances")
      list-item(to="/wallet/send" exact @click.native="close" title="Send")
    part(title='Govern')
      list-item(to="/proposals" exact @click.native="close" title="Proposals")
    part(title='Stake')
      list-item(to="/staking" exact @click.native="close" title="Validator Candidates")
      list-item(to="/staking/nominate" exact @click.native="close" title="Self Nomination")
    part(title='Monitor')
      list-item(to="/blockchain" exact @click.native="close" title="Blockchain")
      list-item(to="/validators" exact @click.native="close" title="Validators"
        v-bind:class="{ 'active': isValidatorPage }")
      list-item(to="/delegators" exact @click.native="close" title="Delegators")
</template>

<script>
import {mapGetters} from 'vuex'
import noScroll from 'no-scroll'
import ListItem from 'common/NiListItem'
import Part from 'common/NiPart'
export default {
  name: 'app-table-of-contents',
  components: {
    ListItem,
    Part
  },
  computed: {
    ...mapGetters(['discussions', 'proposalStages']),
    englishDiscussions () {
      return this.discussions.filter(i => i.type === 'english')
    },
    i18nDiscussions () {
      return this.discussions.filter(i => i.type === 'i18n')
    }
  },
  methods: {
    close () {
      this.$store.commit('setActiveMenu', '')
      noScroll.off()
    }
  }
}
</script>
