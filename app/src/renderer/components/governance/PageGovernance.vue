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
      <vm-tool-bar
        ><a v-tooltip.bottom="'Search'" @click="setSearch()"
          ><i class="search material-icons">search</i></a
        ></vm-tool-bar
      >
    </template>
    <modal-search type="proposals" />
    <modal-propose
      v-if="showModalPropose"
      :show-modal-propose.sync="showModalPropose"
      :denom="bondingDenom.toLowerCase()"
      @createProposal="propose"
    />
    <router-view />
  </tm-page>
</template>

<script>
import { mapGetters } from "vuex"
import DataEmptySearch from "common/TmDataEmptySearch"
import ModalSearch from "common/TmModalSearch"
import ModalPropose from "./ModalPropose"
import VmToolBar from "common/VmToolBar"
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
    VmToolBar
  },
  data: () => ({
    query: ``,
    tabs: [
      {
        displayName: `Proposals`,
        pathName: `Proposals`
      }
      // TODO uncomment when updated to latest SDK
      // {
      //   displayName: `Parameters`,
      //   pathName: `Governance Parameters`
      // }
    ],
    showModalPropose: false
  }),
  computed: {
    // TODO: get min deposit denom from gov params
    ...mapGetters([`proposals`, `filters`, `bondingDenom`, `connected`])
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
              denom: this.bondingDenom.toLowerCase(),
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
