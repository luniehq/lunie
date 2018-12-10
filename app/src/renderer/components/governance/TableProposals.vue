<template>
  <div>
    <data-empty-search v-if="filteredProposals.length === 0" />
    <table v-else class="data-table">
      <thead>
        <panel-sort :sort="sort" :properties="properties" />
      </thead>
      <tbody>
        <li-proposal
          v-for="(value, key) in filteredProposals"
          :key="key"
          :proposal="value"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import Mousetrap from "mousetrap"
import { includes, orderBy } from "lodash"
import LiProposal from "./LiProposal"
import ModalSearch from "common/TmModalSearch"
import DataEmptySearch from "common/TmDataEmptySearch"
import PanelSort from "staking/PanelSort"
import VmToolBar from "common/VmToolBar"
export default {
  name: `table-proposals`,
  components: {
    LiProposal,
    DataEmptySearch,
    ModalSearch,
    PanelSort,
    VmToolBar
  },
  props: {
    proposals: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    query: ``,
    sort: {
      property: `proposal_id`,
      order: `desc`
    }
  }),
  computed: {
    ...mapGetters([`filters`, `config`]),
    somethingToSearch() {
      return Object.keys(this.proposals).length > 0
    },
    parsedProposals() {
      let copiedProposals = JSON.parse(JSON.stringify(this.proposals))
      return Object.values(copiedProposals).map(p => {
        p.tally_result.yes = Math.round(parseFloat(p.tally_result.yes))
        p.tally_result.no = Math.round(parseFloat(p.tally_result.no))
        p.tally_result.no_with_veto = Math.round(
          parseFloat(p.tally_result.no_with_veto)
        )
        p.tally_result.abstain = Math.round(parseFloat(p.tally_result.abstain))
        return p
      })
    },
    filteredProposals() {
      let query = this.filters.proposals.search.query || ``
      let proposals = orderBy(
        this.parsedProposals,
        [this.sort.property],
        [this.sort.order]
      )
      if (this.filters.proposals.search.visible) {
        return proposals.filter(p =>
          includes(p.title.toLowerCase(), query.toLowerCase())
        )
      } else {
        return proposals
      }
    },
    properties() {
      return [
        {
          title: `Title`,
          value: `title`,
          tooltip: `The title of the proposal`,
          class: `proposal_title`
        },
        {
          title: `Proposal id`,
          value: `proposal_id`,
          tooltip: `Id of the proposal`,
          class: `proposal_id`
        },
        {
          title: `Yes`,
          value: `tally_result.yes`,
          tooltip: `Yes votes`,
          class: `yes_votes`
        },
        {
          title: `No`,
          value: `tally_result.no`,
          tooltip: `No votes`,
          class: `no_votes`
        },
        {
          title: `No with Veto`,
          value: `tally_result.no_with_veto`,
          tooltip: `No with veto votes`,
          class: `no_veto_votes`
        },
        {
          title: `Abstain`,
          value: `tally_result.abstain`,
          tooltip: `Abstain votes`,
          class: `abstain_votes`
        }
      ]
    }
  },
  mounted() {
    Mousetrap.bind([`command+f`, `ctrl+f`], () => this.setSearch())
    Mousetrap.bind(`esc`, () => this.setSearch())
    this.$store.dispatch(`getProposals`)
  },
  methods: {
    setSearch() {
      if (this.somethingToSearch) {
        let toggle = !this.filters[`proposals`].search.visible
        this.$store.commit(`setSearchVisible`, [`proposals`, toggle])
      }
    }
  }
}
</script>
