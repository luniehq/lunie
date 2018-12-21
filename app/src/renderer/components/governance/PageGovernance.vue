<template>
  <tm-page class="governance" data-title="Governance"
    ><template slot="menu-body">
      <tm-balance :tabs="tabs">
        <tm-btn
          id="propose-btn"
          :disabled="!connected"
          :value="connected ? 'Create Proposal' : 'Connecting...'"
          color="primary"
          @click.native="onPropose"
        />
      </tm-balance>
      <tool-bar
        ><a v-tooltip.bottom="'Search'" @click="setSearch()"
          ><i class="search material-icons">search</i></a
        ></tool-bar
      >
    </template>
    <modal-search type="proposals" />
    <modal-propose
      v-if="showModalPropose"
      :show-modal-propose.sync="showModalPropose"
      :denom="depositDenom"
      @createProposal="propose"
    />
    <router-view />
  </tm-page>
</template>

<script>
import { mapGetters } from "vuex"
import DataEmptySearch from "common/TmDataEmptySearch"
import ModalSearch from "common/TmModalSearch"
import PerfectScrollbar from "perfect-scrollbar"
import ModalPropose from "./ModalPropose"
import ToolBar from "common/ToolBar"
import TmBalance from "common/TmBalance"
import { TmPage, TmDataEmpty, TmDataLoading, TmBtn } from "@tendermint/ui"
export default {
  name: `page-governance`,
  components: {
    TmBalance,
    TmDataLoading,
    TmDataEmpty,
    DataEmptySearch,
    ModalSearch,
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
    ...mapGetters([
      `proposals`,
      `filters`,
      `bondingDenom`,
      `connected`,
      `governanceParameters`
    ]),
    depositDenom() {
      return this.governanceParameters.parameters.deposit.min_deposit[0].denom
    }
  },
  mounted() {
    this.ps = new PerfectScrollbar(this.$el.querySelector(`.tm-page-main`))
  },
  updated() {
    this.$el.querySelector(`.tm-page-main`).scrollTop = 0
  },
  methods: {
    onPropose() {
      this.showModalPropose = true
    },
    async propose({ title, description, type, amount, password }) {
      try {
        await this.$store.dispatch(`submitProposal`, {
          title,
          description,
          type,
          initial_deposit: [
            {
              denom: this.depositDenom,
              amount: String(amount)
            }
          ],
          password
        })
        this.$store.commit(`notify`, {
          title: `Successful proposal submission!`,
          body: `You have successfully submitted a new ${type.toLowerCase()} proposal`
        })
      } catch ({ message }) {
        this.$store.commit(`notifyError`, {
          title: `Error while submitting a new ${type.toLowerCase()} proposal`,
          body: message
        })
      }
    },
    setSearch(bool = !this.filters[`proposals`].search.visible) {
      this.$store.commit(`setSearchVisible`, [`proposals`, bool])
    }
  }
}
</script>
