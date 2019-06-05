<template>
  <TmPage :tabs="tabs" class="governance" data-title="Governance">
    <TmBtn
      v-if="session.signedIn"
      id="propose-btn"
      slot="header-buttons"
      :disabled="!connected"
      :value="connected ? 'Create Proposal' : 'Connecting...'"
      color="primary"
      @click.native="onPropose"
    />
    <TmBtn
      v-else-if="!session.signedIn"
      id="propose-btn"
      slot="header-buttons"
      :disabled="!connected"
      :value="connected ? 'Create Proposal' : 'Connecting...'"
      color="primary"
      @click.native="onProposeLoggedOut"
    />
    <ModalPropose ref="modalPropose" :denom="depositDenom" />
    <router-view />
  </TmPage>
</template>

<script>
import { mapGetters } from "vuex"
import PerfectScrollbar from "perfect-scrollbar"
import ModalPropose from "./ModalPropose"
import TmBtn from "common/TmBtn"
import TmPage from "common/TmPage"

export default {
  name: `page-governance`,
  components: {
    ModalPropose,
    TmPage,
    TmBtn
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
    ]
  }),
  computed: {
    ...mapGetters([`proposals`, `depositDenom`, `connected`, `session`])
  },
  mounted() {
    this.ps = new PerfectScrollbar(this.$el.querySelector(`.tm-page-main`))
  },
  methods: {
    onPropose() {
      this.$refs.modalPropose.open()
    },
    onProposeLoggedOut() {
      this.$store.commit(`toggleSessionModal`, true)
    }
  }
}
</script>
