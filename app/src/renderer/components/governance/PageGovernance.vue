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
      :denom="bondingDenom"
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
import TmBtn from "common/TmBtn"
import TmPage from "common/TmPage"
import TmDataEmpty from "common/TmDataEmpty"
import TmDataLoading from "common/TmDataLoading"
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
    // TODO: get min deposit denom from gov params
    ...mapGetters([`proposals`, `filters`, `bondingDenom`, `connected`])
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
              denom: this.bondingDenom,
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
