<template>
  <tm-page
    :tabs="tabs"
    :dataset="proposalList"
    search="proposals"
    class="governance"
    data-title="Governance"
  >
    <tm-btn
      id="propose-btn"
      slot="header-buttons"
      :disabled="!connected"
      :value="connected ? 'Create Proposal' : 'Connecting...'"
      color="primary"
      @click.native="onPropose"
    />
    <modal-propose
      v-if="showModalPropose"
      :show-modal-propose.sync="showModalPropose"
      :denom="depositDenom"
    />
    <router-view />
  </tm-page>
</template>

<script>
import { mapGetters } from "vuex"
import PerfectScrollbar from "perfect-scrollbar"
import ModalPropose from "./ModalPropose"
import ToolBar from "common/ToolBar"
import TmBalance from "common/TmBalance"
import TmBtn from "common/TmBtn"
import TmPage from "common/TmPage"

export default {
  name: `page-governance`,
  components: {
    TmBalance,
    ModalPropose,
    TmPage,
    TmBtn,
    ToolBar
  },
  data: () => ({
    query: ``,
    tabs: [
      {
        displayName: `Proposals`,
        pathName: `Proposals`
      },
      {
        displayName: `Parameters`,
        pathName: `Governance Parameters`
      }
    ],
    showModalPropose: false
  }),
  computed: {
    ...mapGetters([`proposals`, `filters`, `depositDenom`, `connected`]),
    proposalList() {
      return Object.values(this.proposals.proposals)
    }
  },
  mounted() {
    this.ps = new PerfectScrollbar(this.$el.querySelector(`.tm-page-main`))
  },
  methods: {
    onPropose() {
      this.showModalPropose = true
    }
  }
}
</script>
